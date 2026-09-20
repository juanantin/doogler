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
  version: '1',

  /* ---- Token ---------------------------------------------------------- */

  // The token people buy. The CA button copies this, the chart button links to
  // it, and DexScreener is searched by it. Nothing on the dashboard resolves
  // without it.
  // TODO: the owner's Base contract address for $DOOGLER.
  contractAddress: null,

  // The token holders are paid in. Used to price "total distributed" in USD
  // when the rewards source doesn't give a USD figure itself, so the sub-line
  // under that card depends on it.
  // TODO: from discover.yml — the deepest pair's other side, read off chain.
  rewardTokenAddress: null,

  // Free, keyless, CORS-enabled. Used as the last price source, because it
  // covers tokens DexScreener has no pair for — an index token among them.
  geckoterminalBase: 'https://api.geckoterminal.com/api/v2',

  chain: 'base',    // DexScreener chain slug
  chainId: 8453,    // EVM chain id

  // The block $DOOGLER launched at. The chain scan starts here; nothing
  // relevant happened before it. NEVER leave a sibling token's block in here —
  // that scans a range belonging to another token.
  // TODO: from discover.yml — /api/coins block_number, corroborated by a
  // timestamp search for the pool's own pairCreatedAt.
  launchBlock: null,

  /* How the reward token is recognised among everything that touches the
     distributor. Matched case-insensitively against each token's own symbol(),
     because raw amounts cannot tell them apart: a distributor sees the trading
     token's large flows beside the reward token's fractional ones, and picking
     the larger put 7,205,199 on a tile whose true figure was a fraction of one.

     Matched as a SUBSTRING, because a platform's wrapper decorates the ticker
     it wraps — $BOX's reward token answers "AMZNc", not "AMZN", and an exact
     comparison would have missed it. Whatever this token's reward wrapper for
     $GOOGL actually answers goes here, read off chain.

     ⚠ Left null deliberately: with this null the configured ADDRESS is used
     instead, never a ticker inherited from the token this repo was copied
     from. Do not write 'GOOGL' here on the strength of the branding — the
     branding is what got $BOX wrong.
     TODO: from discover.yml's symbol() reading. */
  rewardTokenSymbol: null,

  /* Holders' share of what leaves the rewards index — the rest is the
     protocol's cut, so the outflow is NOT the distributed figure on its own.
     ⚠ UNVERIFIED FOR THIS TOKEN. 0.9 is the platform's usual split and what
     $PURR's, $BLUE's and $BOX's panels all read, but it is a PER-TOKEN setting
     and it is the one multiplier standing between the measured outflow and the
     figure on the tile. scripts/panel-probe.mjs reads this token's own
     Stockify panel for it; until that agrees, the distributed figure is
     provisional and MUST NOT be announced. On $BLUE the panel and the indexer
     agreed to five decimals — that is the bar. */
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
    /* The trading pair. ⚠ Leave null until discover.yml names it and you are
       certain: DexScreener is asked about THIS pool before it searches, so a
       stale pool reports another token's market cap no matter what
       contractAddress says. */
    pool: null,
    rewardPool: null,
    /* Where trading fees accrue. SHARED BY EVERY TOKEN on the platform —
       byte-for-byte the same locker on $BOX, $BLUE and $PURR, which is three
       tokens' worth of proof — so it is NEVER summed: doing that reports the
       whole platform's fees as this token's. Recorded only so it can be
       excluded from the holder count. */
    feeLocker: null,
    /* The distributor holders are paid from — per token, and the only one of
       these that is this token's alone. Not derivable on chain: it is a
       routing decision, and /api/fee-routing reports it. Read by the indexer,
       not by the page. */
    rewardsIndex: null,
  },

  /* ---- Links ---------------------------------------------------------- */

  links: {
    // TODO: the owner's X account URL.
    x: null,

    // Leave null to auto-build a DexScreener link from the contract address.
    chart: null,

    // The two partner lockups — both hrefs are written from here.
    // TODO: launchedIn is thestonks.exchange/token/<contractAddress>;
    //       rewardsBy is the owner's Stockify index URL.
    launchedIn: null,
    rewardsBy: null,
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

           ⚠ EMPTY ON PURPOSE. THIS token's own Stockify index address goes
           here once known — leaving a sibling's in would ask about the wrong
           contract. */
        feeTokenCandidates: [],
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
