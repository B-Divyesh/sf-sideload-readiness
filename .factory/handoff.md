# Review 6 handoff — Sideload Readiness

## Status: FAIL

Adversarial review 6 was completed against commit
`bdd9354de66df358fac15829b0784e1590f488fe` and the live deployment at
<https://sideload-readiness.sociobot.in>. No product code was modified.

The review is `.factory/review-6.md`. It records one minor finding, `F-6-1`:
the visible text for the GitHub releases link, Sociobot/Dodo checkout link, and
Sociobot factory-credit link does not identify those destinations as external.
The zero-finding contract therefore requires FAIL.

## Verification completed

- Fresh 390 × 844 and 1440 × 900 cold first reads; the job, audience, action,
  action result, and three facts all fit before scrolling.
- One-click browser demo, corrupted-state reset, real-data sentinel, offline
  reload, same-origin request log, and zero WebUSB/Web Serial requests.
- Real CLI demo in a fresh temporary directory; private mode-0600 JSON report.
- All 32 exact `.factory/claims.json` commands from a no-hardlink clean clone.
- `npm test`, `npm run build`, Rust format/Clippy/all-target tests, locked
  release build, and locked package verification from the clean clone.
- Live byte identity, route metadata, designed 404, History API focus,
  accessibility, mobile targets/overflow, security headers, and link crawl.
- Every finding from reviews 1–5 checked again in live behavior and source; all
  remain fixed.

Evidence is under `.factory/review-evidence-6/`. The clean claim/quality clone
was `/tmp/sideload-readiness-review6-claims.F5DjCL/repo`.

## Known gap and next step

Rewrite the three external link labels as specified in F-6-1 and add a browser
test that rejects an off-origin link unless its visible or accessible name says
that it is external. Then rerun the 32-claim loop, full quality suite, live
verifier, and link crawl. No other gap was found.

## Re-run

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release --locked
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```
