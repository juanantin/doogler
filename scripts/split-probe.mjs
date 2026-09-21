#!/usr/bin/env node
/* ==========================================================================
   split-probe.mjs — who actually receives the rewards index's outflow?

   HOLDER_SHARE is the one multiplier between a measured number and the figure
   on the "distributed" tile, and it is the only value in this repo that the
   chain does not hand over directly. Until now it has been the platform's
   usual 0.9, carried across four sibling builds and never checked against
   THIS token.

   It is now in doubt. The Stonks panel for $DOOGLER publishes its own split:

       FEE  1%   ·   0.7 creator / 0.3 platform

   which is not 0.9, and the indexer measures the rewards index paying out
   99.999975% of everything it takes in — so no cut is being withheld INSIDE
   the index. That leaves two readings, and they differ by 29%:

     (a) the full 1% reaches the index and the 0.7/0.3 split happens on the
         way out, so one recipient should be taking ~30% of the outflow
         → HOLDER_SHARE = 0.7
     (b) the platform takes its 0.3 upstream and only the creator's 0.7 ever
         reaches the index, so everything leaving it is already holders'
         → HOLDER_SHARE = 1.0

   These are distinguishable by looking, which is what this does: it groups
   every reward-token transfer OUT of the rewards index by recipient and
   prints each one's share of the total. A single address taking ~30% means
   (a). A long tail of holders with no dominant recipient means (b).

   Printed last, because job logs come back as a tail.

     RPC_URL=https://mainnet.base.org node scripts/split-probe.mjs
   ========================================================================== */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function siteConfig() {
  const src = readFileSync(path.join(ROOT, 'config.js'), 'utf8');
  const window = {};
  new Function('window', src)(window);
  return window.SITE_CONFIG || {};
}

const CFG = siteConfig();
const RPC_URL = process.env.RPC_URL || 'https://mainnet.base.org';
const CHUNK = Number(process.env.CHUNK_SIZE || 10000);

const INDEX = CFG.contracts?.rewardsIndex;
const REWARD = CFG.rewardTokenAddress;
const START = Number(process.env.START_BLOCK || CFG.launchBlock || 0);

if (!INDEX || !REWARD || !START) {
  console.log('config.js is missing rewardsIndex, rewardTokenAddress or launchBlock — nothing to probe.');
  process.exit(0);
}

const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const topic = (a) => '0x' + '0'.repeat(24) + String(a).toLowerCase().replace(/^0x/, '');
const addrOf = (t) => '0x' + String(t).slice(26).toLowerCase();

let id = 0;
async function rpc(method, params = []) {
  const r = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: ++id, method, params }),
  });
  const j = await r.json();
  if (j.error) throw new Error(`${method}: ${j.error.message}`);
  return j.result;
}

/* decimals() off the reward contract rather than assumed — the whole reason
   this repo keeps two decimals constants is that this one reads 8. */
async function decimals(token) {
  const hex = await rpc('eth_call', [{ to: token, data: '0x313ce567' }, 'latest']);
  return parseInt(hex, 16);
}

const head = parseInt(await rpc('eth_blockNumber'), 16) - 5;
const DEC = await decimals(REWARD);
console.log('=== split probe =========================================');
console.log(`rewards index  ${INDEX}`);
console.log(`reward token   ${REWARD}  decimals() ${DEC}`);
console.log(`blocks         ${START} → ${head}`);

const out = new Map();     // recipient -> bigint
let total = 0n;
let transfers = 0;
let chunk = CHUNK;

for (let from = START; from <= head; ) {
  const to = Math.min(from + chunk - 1, head);
  let logs;
  try {
    logs = await rpc('eth_getLogs', [{
      address: REWARD,
      topics: [TRANSFER, topic(INDEX)],          // from == the rewards index
      fromBlock: '0x' + from.toString(16),
      toBlock: '0x' + to.toString(16),
    }]);
  } catch (e) {
    if (chunk > 200) { chunk = Math.max(200, Math.floor(chunk / 2)); continue; }
    console.log(`  window ${from}-${to} refused at minimum size: ${e.message}`);
    from = to + 1; chunk = CHUNK; continue;
  }
  for (const l of logs) {
    const who = addrOf(l.topics[2]);
    const v = BigInt(l.data);
    out.set(who, (out.get(who) || 0n) + v);
    total += v; transfers++;
  }
  from = to + 1;
}

const scale = (v) => Number(v) / 10 ** DEC;
const rows = [...out.entries()].sort((a, b) => (b[1] > a[1] ? 1 : -1));

console.log('\n--- outflow by recipient --------------------------------');
console.log(`  ${transfers} transfers to ${rows.length} distinct addresses, ${scale(total).toFixed(8)} total\n`);
for (const [who, v] of rows.slice(0, 15)) {
  const pct = total ? Number(v * 10000n / total) / 100 : 0;
  console.log(`  ${who}  ${scale(v).toFixed(8).padStart(16)}  ${pct.toFixed(2).padStart(6)}%`);
}
if (rows.length > 15) console.log(`  … ${rows.length - 15} more`);

/* The verdict, last, because logs arrive as a tail. */
const topPct = rows.length && total ? Number(rows[0][1] * 10000n / total) / 100 : 0;
console.log('\n--- what this means for HOLDER_SHARE --------------------');
console.log(`  configured holderShare   ${CFG.holderShare}`);
console.log(`  largest single recipient ${topPct.toFixed(2)}% of all outflow`);
console.log(`  distinct recipients      ${rows.length}`);
if (rows.length === 0) {
  console.log('\n  Nothing has left the index yet — no reading either way.');
} else {
  /* The tell is not how BIG the largest recipient is, it is how ROUND. A
     holder is paid in proportion to a balance, which does not land on a whole
     percentage and never lands on the same one twice; a protocol cut is a
     fixed fraction and lands exactly.

     This replaces a band ("between 20% and 45% means a cut"), which got this
     token wrong: the cut here is 10%, the band said no-cut, and the verdict
     printed was the opposite of the truth. Roundness is the property that
     actually distinguishes the two. */
  const ROUND = [1, 2, 2.5, 5, 7.5, 10, 12.5, 15, 20, 25, 30, 33.33, 40, 50];
  const near = ROUND.find((r) => Math.abs(topPct - r) < 0.01);
  if (near) {
    const share = (100 - near) / 100;
    console.log(`\n  → The largest recipient takes ${near}% EXACTLY (${topPct.toFixed(6)}%).`);
    console.log('    A balance-proportional payout does not land on a round percentage,');
    console.log('    so that address is the protocol\'s cut, taken on the way OUT.');
    console.log(`    HOLDER_SHARE should be ${share}, and holders received`);
    console.log(`    ${scale(total - rows[0][1]).toFixed(8)} of ${scale(total).toFixed(8)}.`);
    console.log(`\n    Better: set PROTOCOL_ADDRESS = '${rows[0][0]}'`);
    console.log('    in worker/src/config.js so the cut is subtracted exactly and');
    console.log('    survives the percentage being changed. Reset');
    console.log('    data/rewards-state.json to its seed in the same commit, or');
    console.log('    protocolOut accumulates from the current cursor and nothing');
    console.log('    historical is subtracted.');
    if (Math.abs(share - Number(CFG.holderShare)) > 1e-9) {
      console.log(`\n  ⚠ configured holderShare is ${CFG.holderShare}, measurement says ${share}.`);
    } else {
      console.log(`\n  ✓ matches the configured holderShare of ${CFG.holderShare}.`);
    }
  } else if (rows.length > 5 && topPct < 20) {
    console.log('\n  → No recipient takes a round fraction, and the largest is only');
    console.log(`    ${topPct.toFixed(2)}%. Nothing here looks like a protocol cut, so the`);
    console.log('    split is happening upstream of this index and HOLDER_SHARE');
    console.log('    should be 1.0. Confirm against the platform\'s panel before');
    console.log('    trusting it — this is the weaker of the two readings.');
  } else {
    console.log('\n  → Inconclusive from the shape alone. Read the table above by hand.');
  }
}
console.log('=========================================================');
