/* ==========================================================================
   SITE CONFIGURATION — Jeffree $DOOGLER
   --------------------------------------------------------------------------
   This is the only file you need to edit to point the site at a token.
   Everything marked TODO has to be filled in; the rest has sane defaults.

   ⚠ EVERY FACT THE NETWORK CAN ANSWER IS null RIGHT NOW, ON PURPOSE.
   This repo was copied from juanantin/purr, and a sibling's address left in
   place is not a placeholder — it is a wrong answer that renders as a
   confident number. Run .github/workflows/discover.yml and fill these from
   what it reports. See SETUP.md step 0.
   ========================================================================== */

window.SITE_CONFIG = {
  /* Build stamp. Shown in the ?debug=1 panel, so you can confirm which version
     a browser actually has rather than guessing at a cache. Bump it together
     with the ?v= on the script tags in index.html whenever you deploy —
     `node scripts/stamp.mjs` moves all of them at once. */
  version: '3',

  /* ---- Token ---------------------------------------------------------- */

  // The token people buy. The CA button copies this, the chart button links to
  // it, and DexScreener is searched by it. Nothing on the dashboard resolves
  // without it.
  // Supplied by the owner. Checksum-cased as given; app.js lowercases it
  // wherever a comparison needs to be case-insensitive.
  contractAddress: '0xFf70B676aA2f96E293f020539b36d817179dBaa3',

  // The token holders are paid in — the quote side of the deepest pair, and
  // what thestonks.exchange's /api/coins names as this token's quote. Used to
  // price "total distributed" in USD when the rewards source doesn't give a
  // USD figure itself, so the sub-line under that card depends on it.
  // Read off Base rather than inherited: symbol() "GOOGLc", name()
  // "Alphabet Inc.", decimals() 8 — corroborated by the platform's own
  // quote_decimals: 8. EIGHT, not eighteen. See KEX_DECIMALS in
  // worker/src/config.js for what sharing one constant costs.
  rewardTokenAddress: '0xb2000000000000000000002D0BA3164cc74f58B7',

  // Free, keyless, CORS-enabled. Used as the last price source, because it
  // covers tokens DexScreener has no pair for — an index token among them.
  geckoterminalBase: 'https://api.geckoterminal.com/api/v2',

  chain: 'base',    // DexScreener chain slug
  chainId: 8453,    // EVM chain id

  // The block $DOOGLER launched at. The chain scan starts here; nothing
  // relevant happened before it. NEVER leave a sibling token's block in here —
  // that scans a range belonging to another token.
  // The block $DOOGLER launched at — 2026-09-19T21:13:15Z. THREE independent
  // sources agree: the platform's /api/coins block_number, a timestamp search
  // for the pool's own pairCreatedAt, and the token's first Transfer log.
  launchBlock: 51531524,

  /* How the reward token is recognised among everything that touches the
     distributor. Matched case-insensitively against each token's own symbol(),
     because raw amounts cannot tell them apart: a distributor sees the trading
     token's large flows beside the reward token's fractional ones, and picking
     the larger put 7,205,199 on a tile whose true figure was a fraction of one.

     Matched as a SUBSTRING, because a platform's wrapper decorates the ticker
     it wraps — $BOX's reward token answers "AMZNc", not "AMZN", and an exact
     comparison would have missed it. Whatever this token's reward wrapper for
     $GOOGL actually answers goes here, read off chain.

     Here symbol() reads "GOOGLc" — the platform's wrapper decorating the
     ticker it wraps, exactly as $BOX's answered "AMZNc" rather than "AMZN".
     The branding on this page says $GOOGL; the contract says GOOGLc, and this
     field follows the contract. */
  rewardTokenSymbol: 'GOOGLc',

  /* Holders' share of what leaves the rewards index — the rest is the
     protocol's cut, so the outflow is NOT the distributed figure on its own.

     ✓ VERIFIED ON CHAIN FOR THIS TOKEN, to eight decimals, by
     scripts/split-probe.mjs: of 2.11662791 GOOGLc leaving the index across
     1,107 transfers to 191 addresses, one address took 9.999999% — 10% to
     within 1.1 raw units — and the next largest took 2.68%. Holders received
     0.90000001. $BLUE's five-decimal agreement was the bar; this clears it.

     The Stonks panel's "FEE 1% · 0.7 creator / 0.3 platform" is a DIFFERENT
     split and does not contradict this one: that divides the trading fee
     upstream, deciding what reaches the index at all. This divides what
     leaves it.

     worker/src/config.js now carries PROTOCOL_ADDRESS, so the indexer
     subtracts that cut exactly rather than applying this constant. This stays
     as the fallback and as what app.js's own in-browser scan uses. */
  holderShare: 0.9,

  /* Related contracts.
       pool         the trading pair — DexScreener is asked about THIS pool
                    first, and only falls back to searching by token address
       rewardPool   the reward token's own pair, used to price it
       feeLocker    where trading fees accrue
       rewardsIndex the distributor holders are paid from

     All optional. `pool` is read on every load and DexScreener is asked about
     it BEFORE it searches by token address — so a wrong pool here silently
     reports another token's market cap, liquidity and volume. Leave them null
     and the search by contract address is used instead: correct, if slower. */
  contracts: {
    /* The trading pair: DOOGLER/GOOGLc on Uniswap v3, from /api/coins and
       corroborated by DexScreener resolving the same pair from the contract
       address alone.

       ⚠ NAMING IT IS NOT OPTIONAL HERE. This token has TWO pairs on Base: this
       one, with $32,313 of liquidity, and a Uniswap v4 DOOGLER/ETH pair with
       $8.51 in it — which also reports a market cap $22,000 higher. Without
       this field the search by contract address picks between them, and the
       dust pool is a live answer that would put a wrong market cap, liquidity
       and volume on the tiles. This is the coin flip the README warns about,
       and this token actually has it. */
    pool: '0x09DB9BE4e6FE63D8Ae9696451Fe829504E44c5B2',
    rewardPool: null,
    /* Where trading fees accrue. SHARED BY EVERY TOKEN on the platform —
       byte-for-byte the same locker on $BOX, $BLUE and $PURR, and now on
       $DOOGLER too, which is four tokens' worth of proof — so it is NEVER
       summed: doing that reports the whole platform's fees as this token's.
       Recorded only so it can be excluded from the holder count. */
    feeLocker: '0x71D1D363176723f85d98B8B430DF33cde89f0A7f',
    /* The distributor holders are paid from — per token, and the only one of
       these that is this token's alone. Not derivable on chain: it is a
       routing decision, and /api/fee-routing reports this token's routing as
       "rewards" with this index. TWO independent sources agree on it: that
       API, and the Stockify panel URL the owner supplied
       (stockify.finance/indices/0x0bfd15e7…55363) — checked against each
       other rather than either one assumed. Read by the indexer, not by the
       page.

       ⚠ The discovery run's own two-way flow check on this address did not
       complete (the RPC answered HTTP 400), so "reward token moves both in
       and out of it" is NOT yet confirmed on chain. The agreement above is
       what this rests on until scripts/panel-probe.mjs reconciles the
       indexer's totals against the panel's. */
    rewardsIndex: '0x0BFD15e7360acAA813d8823Ec341341355e55363',
  },

  /* ---- Links ---------------------------------------------------------- */

  links: {
    x: 'https://x.com/Doogler_base',

    // Leave null to auto-build a DexScreener link from the contract address.
    chart: null,

    // The two partner lockups — both hrefs are written from here.
    launchedIn: 'https://www.thestonks.exchange/token/0xFf70B676aA2f96E293f020539b36d817179dBaa3',
    // The owner's Stockify panel for THIS token. The address in this URL,
    // 0x0bfd15e7360acaa813d8823ec341341355e55363, is almost certainly the
    // rewards index — that is how it lined up on the sibling — but it is left
    // out of contracts.rewardsIndex below until /api/fee-routing says so
    // independently. A distributor is what the indexer sums; assuming it from
    // a URL is exactly the shortcut this repo does not take.
    rewardsBy: 'https://www.stockify.finance/indices/0x0bfd15e7360acaa813d8823ec341341355e55363',
  },

  /* ======================================================================
     DATA SOURCES
     Each source fills in the fields it knows about. Later sources win, so
     `rewards` can override anything. Whatever no source provides falls back
     to `stats` below, and anything still missing renders as "—".
     ====================================================================== */

  sources: {

    /* Market cap, liquidity, 24h volume, and the token price.
       Public API, no key, CORS-enabled. */
    dexscreener: {
      enabled: true,
    },

    /* Holder count. DexScreener does not report holders, and no single
       explorer is reliable for a freshly launched token — a zero usually means
       "not indexed yet" rather than "no holders".

       So the providers below are tried IN ORDER and the first one to return a
       count above zero wins. A zero is treated as "no answer" and falls through
       to the next provider: a launched token with liquidity cannot have none.
       Run the page with ?debug=1 to see which provider answered.

       ▸ The reliable answer is the indexer in worker/: it counts holders from
         the token's own transfer history, so it needs no explorer at all. Once
         it is deployed and synced it supplies `holders` through sources.rewards
         and this whole chain becomes a fallback. */
    holders: {
      enabled: true,

      /* `onchain` ALONE, deliberately. It folds the token's own Transfer logs
         into balances, exactly as the indexer does, so it is right by
         construction rather than by an explorer's luck. The explorer providers
         still work — add 'blockscout', 'geckoterminal', 'etherscan' or
         'moralis' here to chain them — but on a freshly launched token they
         are worse than nothing: for $BOX, GeckoTerminal answered 21 against a
         project that had made 365 wallet payments, and Blockscout 500s on a
         token that new. If no RPC answers, the tile shows a dash, which beats
         a confident wrong number. */
      providers: ['onchain'],

      onchain: {
        /* Tried in order; the first to answer runs the whole scan, since
           public nodes differ in how wide a getLogs range they allow and
           swapping mid-scan would make the chunk size meaningless. All are
           public, keyless and CORS-enabled.

           Seven, because a public endpoint's bad minute should not be the
           dashboard's bad day. Observed in a real browser: mainnet.base.org
           answers 500 under a sustained scan and publicnode answers 403 —
           between them they ended a scan that was 94% complete while a third
           URL sat unused. The scan moves down this list on any refusal and
           carries on from the same block. */
        rpcUrls: [
          'https://mainnet.base.org',
          'https://base.drpc.org',
          'https://base-mainnet.public.blastapi.io',
          'https://base.meowrpc.com',
          'https://1rpc.io/base',
          // Last two: observed refusing a browser outright rather than being
          // busy — publicnode with a 403, llamarpc with no CORS header at all.
          // Kept as a final resort, but they should not cost a probe first.
          'https://base-rpc.publicnode.com',
          'https://base.llamarpc.com',
        ],

        // Defaults to CFG.launchBlock; set it here to scan a shorter window.
        startBlock: null,

        chunkSize: 10000,      // halves itself when a window is refused, and
                               // climbs back after a few clean ones
        /* How small a window may get before the scan gives up on the node
           instead. 1,000 was not small enough: one dense stretch of $BOX
           trading refused at every size down to it, on all seven endpoints,
           and the cursor stopped there permanently. */
        minChunkSize: 200,
        confirmations: 5,      // stay clear of a reorg

        /* A page load spends at most this many requests, banks what it
           scanned in localStorage, and the next load resumes. The count is
           published only once the scan reaches the head: a partial fold has
           seen sends whose receives are in unread blocks, so it under-counts. */
        maxCallsPerLoad: 200,

        // Defaults to contracts.pool, feeLocker and rewardsIndex — they hold
        // supply without being holders.
        exclude: null,

        /* Fallbacks for the fee/payout queries, tried only if this node
           refuses eth_getLogs without an `address` — plenty of public ones do.
           The unfiltered query is the better question, because it reports
           whichever token actually moved rather than trusting a guess, so
           these exist purely to survive a node that will not answer it.
           rewardTokenAddress is tried first, then these in order.

           THIS token's own rewards index, so a node that refuses the
           unfiltered query still asks about the right contract. */
        feeTokenCandidates: [
          '0x0BFD15e7360acAA813d8823Ec341341355e55363',
        ],
      },

      blockscoutBase: 'https://base.blockscout.com',
      geckoterminalBase: 'https://api.geckoterminal.com/api/v2',
      etherscanApiKey: '',
      moralisApiKey: '',
    },

    /* Rewards figures — total fees collected and total rewards distributed.
       These are protocol numbers, so no explorer has them.

       `fields` maps our metric names onto whatever shape the response has.
       Values are dot-paths, so 'data.stats.totalFeesUsd' works; the first path
       that resolves to a number wins.

       NOTE: this source is merged LAST, so anything it returns overrides
       DexScreener. Leaving stale figures in data/rewards.json while this is
       enabled will quietly override the live market cap, liquidity and volume.
    */
    rewards: {
      /* On, but the file is all nulls: the page reads these off the chain now,
         and this source is the fallback for when no RPC answers plus the
         channel scripts/index-rewards.mjs publishes through. A completed chain
         scan outranks it either way. */
      enabled: true,

      // A string, or an array of them — the first source with a number for a
      // metric wins, so put live endpoints in front of the committed file:
      //   url: ['https://<your-worker>.workers.dev', 'data/rewards.json'],
      url: 'data/rewards.json',

      fields: {
        totalFeesCollected: [
          'totalFeesCollected', 'totalFeesUsd', 'feesCollectedUsd', 'fees.totalUsd',
          'data.totalFeesCollected', 'stats.totalFeesCollected',
        ],
        totalFeesTokens: ['totalFeesTokens', 'feesTokens', 'data.totalFeesTokens'],
        totalDistributed: [
          'totalDistributed', 'totalRewardsDistributed', 'rewardsDistributed',
          'data.totalDistributed', 'stats.totalDistributed',
        ],
        totalDistributedUsd: [
          'totalDistributedUsd', 'totalRewardsDistributedUsd', 'rewardsDistributedUsd',
          'data.totalDistributedUsd', 'stats.totalDistributedUsd',
        ],
        holders: [
          'holders', 'holderCount', 'totalHolders', 'data.holders', 'stats.holders',
        ],
        marketCap: ['marketCap', 'marketCapUsd', 'data.marketCap'],
        liquidity: ['liquidity', 'liquidityUsd', 'data.liquidity'],
        volume24h: ['volume24h', 'volume24hUsd', 'volumeUsd24h', 'data.volume24h'],
      },
    },
  },

  // How often to refresh, in seconds. 0 disables auto-refresh.
  refreshSeconds: 60,

  /* ---- Fallbacks ------------------------------------------------------ */
  // Used only where no source supplies a value. Leave a field null and the
  // tile shows "—" rather than a number that isn't real.

  stats: {
    totalFeesCollected: null,
    totalFeesTokens: null,
    totalDistributed: null,
    totalDistributedUsd: null,
    holders: null,
    marketCap: null,
    liquidity: null,
    volume24h: null,
  },

};
