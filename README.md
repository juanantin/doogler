# Jeffree $DOOGLER

Single-page marketing site for **Jeffree $DOOGLER** on Base: a full-width
landing page over a live dashboard. Static HTML/CSS/JS — no build step, no
dependencies, no framework.

Holders are paid in the platform's tokenized **$GOOGL** wrapper. That wrapper
is **not Alphabet stock** and the page says so plainly under the stats strip —
see *Being exact about the reward token* below, which is not a legal footnote
but the thing that decides what the tiles are allowed to say.

⚠ **This build is not live yet.** Four inputs are outstanding and every one of
them is blocking:

| Missing | What it blocks |
|---|---|
| **Contract address** (Base) | everything on the dashboard. `config.js` is all nulls until it lands |
| **X account URL** | the two "Follow on X" links |
| **Stockify index URL** | the rewards lockup, and the `holderShare` check |
| **Artwork** — dog photos, wordmark, square mark | every image slot, the icons and the share card. See [`images/src/README.md`](images/src/README.md) |

**The `Discover token facts` workflow is red on purpose** while that first row
is outstanding, and it is the only red one. Answering the token's facts is the
single thing blocking this build, so it fails rather than reporting a green
tick for a run that discovered nothing. Every other workflow guards itself and
exits clean: the probe passes all nine steps, `Index rewards` refuses to scan
and says why, `Fetch the token's artwork` skips. The red clears the moment an
address lands.

Copied from [`juanantin/purr`](https://github.com/juanantin/purr), which was
copied from [`blue`](https://github.com/juanantin/blue), which was copied from
[`box`](https://github.com/juanantin/box). **The data machinery is unchanged** —
`config.js`, `assets/js/app.js`, `scripts/`, `worker/`, `.github/workflows/`
and `vercel.json` are the sibling's, and only the presentation was rebuilt.
Where a lesson below is written in one of their numbers, those numbers are the
evidence — the behaviour they describe is the platform's, not that token's.

```
index.html            markup — the marketing page and the dashboard
config.js             ← the only file you need to edit to point it at a token
assets/css/styles.css
assets/js/app.js      the data machinery. Untouched from the sibling
images/               branding — EMPTY, see images/src/README.md
data/rewards.json     protocol figures the dashboard reads
scripts/              GitHub Actions indexer
worker/               the same indexer as a Cloudflare Worker (optional)
```

## What's on the page

A full-width marketing page, top to bottom:

- **Sticky top bar** — the circular avatar and the "Jeffree $DOOGLER" wordmark
  at left; X, the chart and a CA copy button at right; a two-line "Buy
  $DOOGLER / Get $GOOGL." block far right.
- **Hero**, two columns. The headline, a three-line subhead, three actions
  (Follow on X, View Chart, and a CA chip that copies the address and flashes a
  `Copied!` confirmation), then the two partner lockups as bordered cards. The
  hero photo sits at right.
- **Stats strip** — one white card, six tiles: total fees collected, total
  $GOOGL distributed (tokens big, USD beneath in parens), holders, market cap,
  liquidity and 24h volume. Money carries cents, counts do not. Values blink a
  `…` placeholder until the first load resolves, and show `—` where no source
  answered. Under it, right-aligned, the live line.
- **The reward-token disclosure** — directly under the tiles, because it is the
  precise version of the headline's promise rather than a footnote.
- **Lore**, two columns: the Code of Conduct quotation with its source, the
  Dooglers and the Dooglerplex, and a scattered collage of tilted photo cards.
- **Dark banner** — "A brighter Google with more dogs." at left, the wordmark
  at right over "REAL LORE. REAL UTILITY. REAL $GOOGL REWARDS."
- **Footer** — the brand lockup, the two partner cards again, the fixed token
  facts, and the non-affiliation notice.

## What the page will not do

Three things were cut from the mockup or built differently, and they are not
oversights:

- **No fabricated endorsement.** The mockup places a photo of a named, real
  Google executive beside a handwritten "Best work partner!", a signature and a
  date. That is an endorsement from a person who has given none, and a
  disclaimer does not fix it — so it is not built, and neither is the smaller
  repeated caption in the hero. If a genuine, sourced quote turns up together
  with a photo the owner holds the rights to, it can go in **with the source
  cited beside it**. The slot and this note are in `index.html` where the card
  would be.
- **No fake internal documents.** The Code of Conduct line is real — Alphabet's
  published Code of Conduct does say "we like cats, but we're a dog company" —
  so it is set **as a quotation with a link to the public page**, not styled as
  a screenshot of an internal Google document. A true sentence dressed as a
  leaked artifact is still a fabricated artifact.
- **A non-affiliation notice in the footer**, naming Google LLC and Alphabet
  Inc. The `box` original carried exactly this for Amazon; the artwork and the
  name on this one invite the same mistake.

## Being exact about the reward token

The reward token on this platform is a **tokenized wrapper, not equity**. On
`box` it was "AMZNc", and its `symbol()` had to be read off chain rather than
assumed from the branding — an exact match on "AMZN" would have missed it,
which is why `rewardTokenSymbol` is matched as a case-insensitive **substring**.

So: `rewardTokenSymbol` is **null** in `config.js` and stays null until
`discover.yml` reports what this token's reward contract actually answers. With
it null the configured address is used instead, never a ticker inherited from
the sibling. Three places in `index.html` carry a `TODO` where that symbol is
written out — the fees tile's unit, the distributed tile's label, and the
disclosure paragraph.

**Never say holders receive Alphabet stock.** They receive a wrapper token that
tracks a share price and confers no ownership, dividend or voting right.

## Design

One face — **Inter**, from Google Fonts — across five weights: the design
separates label from figure by weight and colour, so 400 through 800 all have
to be loaded. 800 is not decoration; the wordmark and the section headings are
set in it.

**Google's four colours are accents, never surfaces.** They appear on the
wordmark's letters and on the six stat icons and nowhere else. A page that
fills panels with them stops reading as a document and starts reading as a toy,
and the numbers are the point of this one.

**The yellow is deepened for text.** Google's own `#fbbc05` on white sits
around 1.7:1 — fine as a logo, illegible as a word. `--g-yellow` is the
darkened one used wherever a letter is set in it; `--g-yellow-pure` is kept for
icon strokes and for the dark banner, where it has a ground to sit on.

**No radius**, inherited from the template: `--r-card` and `--r-btn` are both
`0` and every box that could take a corner reads them, so the whole page rounds
or stays square from two lines. Surfaces are white on white — a card separates
by a hairline border and a soft shadow, not by being brighter. Figures are set
in tabular numerals so a number that changes every minute does not jitter its
own width.

The wordmark is **live text**, not an image: each letter is its own span and
the colours come from CSS, so it stays crisp at any zoom, costs no request, and
a screen reader is handed the whole word by the parent's `aria-label`.

**The entrance animation hides what it animates, so the class that hides it is
added by script rather than written into the markup.** If the inline script
never runs — a parse error, a blocked inline script, no `IntersectionObserver` —
"no JS" degrades to "no animation" instead of to "no content". Verified with
JavaScript disabled: the whole page still renders.

Light theme only, by design.

## Data sources

Everything configurable lives in `config.js`. Each source fills in the fields it
knows about and they merge in order, so a later source overrides an earlier one.
Whatever no source provides falls back to `stats`, and anything still missing
renders as `—` rather than as a number that isn't real.

| Metric | Source | Status |
|---|---|---|
| Market cap, liquidity, 24h volume | DexScreener | live, no key |
| Holders | Blockscout → GeckoTerminal → … | live, no key |
| Total fees collected | the indexer (see below) | live, scheduled |
| Total rewards distributed | the indexer (see below) | live, scheduled |

### Market data — DexScreener

The configured pool is queried first — `GET /latest/dex/pairs/base/<pool>` —
falling back to the token search, `GET /latest/dex/tokens/<contract>`. Public,
no key, CORS-enabled.

Pool-first matters when a token trades against something other than a usual
quote: the token search can come back empty for a pair like that while the pool
itself resolves fine. **The corollary is a trap** — a stale or wrong pool
address silently reports another token's market cap, liquidity and volume, and
the contract address above it makes no difference. Leave `contracts.pool` null
until you are sure of it.

Of any list of pairs, the deepest-liquidity one on `chain` wins; `marketCap` is
preferred over `fdv`. Override the pool with `sources.dexscreener.pairAddress`.

### Holders

DexScreener does not report holder counts, and no explorer is dependable for a
freshly launched token — for $BOX, GeckoTerminal answered 21 against a project
that had made 365 wallet payments, and Blockscout returned 500s. So the default
provider is **`onchain`**, which does not ask anyone: it folds the token's own
`Transfer` logs into a balance per address in the browser, exactly as the
indexer does, and counts the addresses left holding something, less the pool,
the fee locker and the rewards index.

That scan is budgeted and cached. A load spends at most `maxCallsPerLoad`
requests against the first RPC in `onchain.rpcUrls` that answers, banks its
progress in `localStorage`, and the next load resumes. **The count is published
only once the scan reaches the head** — a partial fold has seen sends whose
matching receives are in unread blocks, so it under-counts, and a dash beats a
wrong number. `holders` from `data/rewards.json` is merged last and wins, so
running the indexer retires the client-side scan without a config change.

The explorer providers below still work and can be chained after it by listing
them in `sources.holders.providers`. They are tried **in order**, and the first
to return a count above zero wins:

| Provider | Key | Notes |
|---|---|---|
| `blockscout` | none | `base.blockscout.com`. Reads `holders_count`, `holders`, then `token_holders_count` on `…/counters` |
| `geckoterminal` | none | Token info route. Only has a count for tokens it has indexed |
| `etherscan` | `etherscanApiKey` | Etherscan V2 multichain. Its `tokenholdercount` action needs a **paid** plan |
| `moralis` | `moralisApiKey` | Free tier is enough |

**A zero is treated as no answer** and falls through to the next provider — a
launched token with liquidity cannot have zero holders, so a zero is an
un-indexed explorer, not data. Providers with no key configured are skipped, so
the two key-free ones run first and the rest only engage once you add a key.

**The dependable answer is the indexer, not any explorer.** It counts holders
from the token's own transfer history — every transfer folded into a running
balance per address, then addresses with a positive balance counted, with the
pool and fee contracts excluded. Once it is running it supplies `holders` and
this chain becomes a fallback. The count is withheld until the backfill
finishes, since a partial scan under-counts.

Run with `?debug=1` to see which provider answered.

### Rewards — feeding fees and distribution

Fees collected and rewards distributed are protocol figures. No explorer knows
them, so they have to be fed in. Three ways, cheapest first.

**1. Edit the committed file.** `sources.rewards.url` already points at
`data/rewards.json`. Put numbers in it, push, done — same origin, no CORS, no
infrastructure:

```json
{ "totalFeesCollected": 1284.37, "totalDistributed": 8412906.5 }
```

Leave `totalDistributedUsd` out and it is derived from the live reward-token
price. Any field left `null` shows as an em dash, so the file is safe to publish
half-filled. Fine for a launch; it is a manual number, so it goes stale between
pushes. Set `sources.rewards.enabled: true` once the file holds real figures.

> **Watch the merge order.** This source is merged **last**, so anything it
> returns overrides DexScreener. Stale figures here will quietly override the
> live market cap, liquidity and volume — which is why it ships disabled.

**2. Let GitHub Actions index it — no accounts, no infrastructure. This is
what this site runs.**
[`.github/workflows/index-rewards.yml`](.github/workflows/index-rewards.yml)
runs [`scripts/index-rewards.mjs`](scripts/index-rewards.mjs), scans Base, and
commits the refreshed `data/rewards.json` — the file the site already reads. It
counts holders too, so that stops depending on explorers.

Fill in `worker/src/config.js` first (`TOKENS`, `CONTRACTS`, `START_BLOCK`,
both decimals) — `scripts/index-rewards.mjs` refuses to scan while that file's
`MISSING` list is non-empty, because a run against an unset index commits nulls
every quarter hour and the page cannot tell that from being broken.

State lives in `data/rewards-state.json`, which is **committed and seeded with
`cursor` = `START_BLOCK`**. That file is the only thing carrying a backfill
between runs — Actions runners are ephemeral — and `loadState()` falls back to
`START_BLOCK` only when it is *absent*, so a templated `cursor: 0` in a present
file is read as gospel and scans Base from genesis.

The schedule runs four times an hour, off the :00/:15/:30/:45 boundary where
GitHub's scheduler is most oversubscribed. Optionally set an `RPC_URL` secret
to a private Base endpoint — the public one works but rate-limits, which only
means the backfill takes longer.

**3. Or run it as a Cloudflare Worker — [`worker/`](worker/).** Same scan logic,
serving over HTTP instead of committing a file. Better if you want sub-minute
freshness or would rather not commit state to the repo.

It scans `eth_getLogs` for reward-token Transfer events, filtered by
counterparty, from `START_BLOCK` forward — so the range is bounded, not all of
chain history. Only the standard Transfer event is used, so none of it needs the
distributor's ABI. Deploy instructions, routes and tests are in
[`worker/README.md`](worker/README.md). Once it is up:

```js
url: ['https://<your-worker>.workers.dev', 'data/rewards.json'],
```

**Verify the streams before you trust them.** Which on-chain flow is "fees
collected" and which is "distributed" differs per platform, and two mistakes are
easy to make: watching a fee locker that every token on the platform shares
(which sums the whole platform, not you), and treating everything leaving the
distributor as "distributed" when part of it is the protocol's cut.
`HOLDER_SHARE` in `worker/src/config.js` carries that split. Compare `/debug`
against whatever panel the platform publishes before going live.

And check the distributor on Basescan first: if it is verified and exposes a
cumulative total as a view function, one `eth_call` replaces the whole log scan.

### Verifying from a sandbox with no network

The changes here are written somewhere with no route to Base, DexScreener or
the deployed site, so nothing can be confirmed locally. Two workflows exist to
ask a machine that does have a route:

| Workflow | Asks |
|---|---|
| [`discover.yml`](.github/workflows/discover.yml) | what the chain and the platform say this token IS — pool, reward token, decimals, launch block, fee routing |
| [`probe.yml`](.github/workflows/probe.yml) | what the PAGE does with that — the committed site in a real browser, as a returning visitor, as a cold phone, and against the deployed URL |

Both run on a push to the paths they watch, because `workflow_dispatch` needs
a permission the automation token does not carry. Their summaries print **last**:
job logs come back as a tail, and the browser passes are thousands of lines of
retry noise.

### Debugging

Append `?debug=1` to the URL. A panel under the dashboard lists every source and
what it returned, and the same detail goes to the console:

```
✓ ok     dexscreener:token:0x…
· empty  holders:blockscout
✓ ok     holders:blockscout:counters
```

Reading it:

- **`Failed to fetch`** — CORS, a blocked host, or the page opened over `file://`.
  Serve it over `http://` (see Running it) rather than double-clicking the file.
- **`HTTP 404`** — wrong address or route.
- **`ok, empty`** — the request worked but that source has nothing for this
  token; the next fallback takes over.

If a card shows `—`, no source produced a number for it. That is the intended
behaviour, not a bug: nothing invented is shown as real.

`refreshSeconds` controls the poll interval (default 60).

## Deploying

**This site deploys to Vercel** — no framework preset, no build command, the
repo root as output. Any static host would work, but two details are not
optional wherever it lands, and both are in `vercel.json`:

- **`index.html` must send `Cache-Control: must-revalidate`.** It carries the
  `?v=` cache-busters below, so a cached shell pins a visitor to an old build:
  the busting scheme only works if the document naming the versions is itself
  fresh. `data/rewards.json` is the same — it is the file the dashboard reads.
- **`vercel.json` takes headers and nothing else.** It rejects unknown
  top-level keys, and a `"//"` comment key once failed every production deploy
  for eighteen hours while the data behind it updated perfectly. Validate the
  key names, not just that the JSON parses.

`index.html` loads `config.js` and `app.js` with a `?v=` cache buster, and
`config.js` carries a matching `version`. **Run `node scripts/stamp.mjs` before
every deploy** — it moves all of them together. Skip it and a CDN keeps serving
the previous JS for hours after the HTML updates, which looks exactly like a
push that never landed.

To check what a browser actually has, load the site with `?debug=1`: the first
line of the panel is the build stamp. If it is not the version you just pushed,
the problem is the deploy or a cache, not the code — hard-refresh, purge the
CDN, and confirm the host is building the right branch.

## Running it

```bash
python3 -m http.server 8000
```

then open <http://localhost:8000>. (Clipboard copy needs `https://` or
`localhost`; the page falls back to `execCommand` elsewhere.)

The worker's tests need no network:

```bash
cd worker && npm test
```

## Notes

- `favicon.ico`, `images/apple-touch-icon.png` and the two `icon-*.png`
  manifest icons are all generated from the supplied square mark, **cropped to
  the dog's head** and padded back to a square: a full scene shrinks to noise
  at 16px. The apple-touch one is flattened onto white, because iOS renders a
  transparent home-screen icon as black. Bump the `?v=` on the icon links when
  the mark changes, so browsers drop the cached one — `node scripts/stamp.mjs`
  does it.
- `favicon.ico` sits at the repo root because browsers request `/favicon.ico` on
  their own, whatever the `<link>` tags say.
- **The hero is a still photograph, not a video.** The sibling opened on a
  looping mp4 and carried a `poster.yml` workflow to cut its first frame; the
  mockup here is a photo, so that workflow was removed rather than left to fail
  on a clip that will never exist. If a clip is ever introduced, the rule it
  implemented still stands and is written down in
  [`images/src/README.md`](images/src/README.md): the poster must be the clip's
  own first frame, or the hand-off from poster to playback jumps.
- `images/src/` keeps the delivered originals and the commands that derive
  every served file from them, so a crop can be redone without going back to
  whoever made the artwork.
- The hero actions stay on one line down to 320px, shedding padding and type
  size as they go; below 1080px the six stat tiles drop to three across, and
  below 620px to two. The top bar sheds its labels before it sheds its
  buttons, and the CTA block is the last thing to go.
