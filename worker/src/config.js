/* ==========================================================================
   What the indexer watches — Jeffree $DOOGLER on Base.
   --------------------------------------------------------------------------
   ⚠ EVERYTHING HERE IS null UNTIL .github/workflows/discover.yml REPORTS IT.
   This file was copied from juanantin/purr. A sibling's address left in place
   is not a placeholder — it is a wrong answer that sums another token's flows
   and publishes them as this one's. `MISSING` below is what stops that: both
   scripts/index-rewards.mjs and the worker refuse to scan while it is
   non-empty.

   ⚠ Which on-chain flow is "fees collected" versus "distributed" is not
   self-evident: reconcile against what thestonks.exchange and
   stockify.finance publish for $DOOGLER before trusting a number —
   scripts/panel-probe.mjs prints both side by side. On $BLUE they agreed to
   five decimal places, which is the bar.
   ========================================================================== */

export const CHAIN_ID = 8453;                    // Base

export const TOKENS = {
  // The token people buy. TODO: the owner's $DOOGLER contract address.
  STR: null,
  // The reward token holders are paid in — the quote side of the pair.
  // TODO: from discover.yml, with symbol()/name()/decimals() read on chain.
  // Do NOT assume this from the $GOOGL branding: on $BOX the reward token's
  // symbol() answered "AMZNc", not "AMZN".
  KEX: null,
};

export const CONTRACTS = {
  // The trading pair. TODO: from discover.yml.
  pool: null,
  // Where trading fees accrue. SHARED BY EVERY COIN on the platform — the
  // same address $BOX, $BLUE and $PURR use — so no stream may sum it: doing
  // so reports the whole platform's fees as this token's. Recorded only so it
  // can be excluded from the holder count.
  feeLocker: null,
  // The distributor holders are paid from, from /api/fee-routing. Per token —
  // which is what makes summing it this token's flows rather than the
  // platform's. TODO: from discover.yml, cross-checked against the owner's
  // own Stockify index URL.
  rewardsIndex: null,
};

// The block $DOOGLER launched at. Nothing relevant happened before it, so the
// scan starts here rather than at genesis. Left at 0 or null the scan starts
// at genesis and will never finish.
// TODO: from /api/coins block_number, corroborated independently by a
// timestamp search for the pool's own pairCreatedAt.
export const START_BLOCK = null;

/* Decimals, per token, READ FROM EACH CONTRACT rather than assumed. Two
   constants, never one: on $BOX they differed — its reward token's decimals()
   returns 8 — and sharing a constant there published 25.244695737 as
   2.5244695737e-9, every digit right and the scale out by ten billion. A
   token that is "obviously 18" is exactly the one nobody checks.
   TODO: both from discover.yml's decimals() readings. */
export const STR_DECIMALS = null;
export const KEX_DECIMALS = null;

/* Everything that has to be real before a scan means anything. index-rewards
   and the worker both refuse to run while this list is non-empty, because the
   alternative is a run that sums nothing and publishes nulls on a schedule —
   which looks, on the page, exactly like a site that is broken. */
export const MISSING = Object.entries({
  'TOKENS.STR': TOKENS.STR,
  'TOKENS.KEX': TOKENS.KEX,
  'CONTRACTS.pool': CONTRACTS.pool,
  'CONTRACTS.rewardsIndex': CONTRACTS.rewardsIndex,
  START_BLOCK,
  STR_DECIMALS,
  KEX_DECIMALS,
}).filter(([, v]) => v === null || v === undefined || v === '').map(([k]) => k);

/* The three flows the totals are built from:

     `feesIn`   reward tokens ARRIVING at the distributor — "fees collected"
     `paidOut`  everything LEAVING it: holder payments plus the protocol's cut,
                so it is not the "distributed" figure on its own
     `holders`  every token transfer folded into a running balance per address;
                addresses left holding something are the holder count

   Verify these against the platform's own panel before trusting them. */
export const STREAMS = [
  { id: 'feesIn', kind: 'sum', token: TOKENS.KEX, to: CONTRACTS.rewardsIndex, decimals: KEX_DECIMALS },
  { id: 'paidOut', kind: 'sum', token: TOKENS.KEX, from: CONTRACTS.rewardsIndex, decimals: KEX_DECIMALS },
  { id: 'holders', kind: 'balances', token: TOKENS.STR, decimals: STR_DECIMALS },
];

/* Share of the outflow that reaches holders — the rest is the protocol's cut.

   ⚠ NOT YET VERIFIED FOR THIS TOKEN. 0.9 is the platform's usual split and
   what $PURR's, $BLUE's and $BOX's panels read, but it is a per-token setting
   and the one multiplier between the measured outflow and the figure on the
   tile. scripts/panel-probe.mjs prints this token's own Stockify panel beside
   what this site publishes; on $BLUE those agreed to five decimals, which is
   the bar. Until then the distributed figure is provisional and must not be
   announced.

   Better still, set PROTOCOL_ADDRESS if the protocol's address turns up — the
   cut is then subtracted exactly and survives the percentage changing. */
export const HOLDER_SHARE = 0.9;
export const PROTOCOL_ADDRESS = null;

if (PROTOCOL_ADDRESS) {
  STREAMS.push({
    id: 'protocolOut', kind: 'sum', token: TOKENS.KEX,
    from: CONTRACTS.rewardsIndex, to: PROTOCOL_ADDRESS, decimals: KEX_DECIMALS,
  });
}

/** Tokens that actually reached holders. */
export function holderPayout(totals) {
  const paidOut = totals.paidOut ?? 0;
  if (PROTOCOL_ADDRESS) return Math.max(0, paidOut - (totals.protocolOut ?? 0));
  return paidOut * HOLDER_SHARE;
}

/* Addresses that hold supply but are not holders in the sense the tile means:
   the pool itself, the fee locker, the rewards contract. */
export const EXCLUDE_FROM_HOLDERS = [
  CONTRACTS.pool,
  CONTRACTS.feeLocker,
  CONTRACTS.rewardsIndex,
].filter(Boolean).map((a) => a.toLowerCase());

/* Scan pacing. A Worker run is short, so it takes bites and resumes. Raise
   MAX_CHUNKS_PER_RUN to backfill faster; lower CHUNK_SIZE if the RPC complains
   (it halves automatically anyway). */
export const CHUNK_SIZE = 2000;
export const MAX_CHUNKS_PER_RUN = 60;
export const CONFIRMATIONS = 5;

// Price the token totals in USD. Public, no key.
export const DEXSCREENER_PAIR =
  'https://api.dexscreener.com/latest/dex/pairs/base/' + CONTRACTS.pool;
export const DEXSCREENER_KEX_TOKEN =
  'https://api.dexscreener.com/latest/dex/tokens/' + TOKENS.KEX;
