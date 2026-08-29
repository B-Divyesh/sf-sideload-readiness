# Handoff — perfection-loop round 1

## Status: complete

All six findings in `.factory/review-1.md` are fixed and deployed. There are no
earlier `.factory/review-*.md` or `.factory/polish-*.md` records. The product
keeps its CLI-installer artifact class and concrete-and-moss visual system.

## What changed

- The first-screen action now opens the isolated `/?demo=1` sample directly.
  Reset and exit preserve a seeded real-data sentinel.
- The reviewed install, process, and scope headings now name their content.
- Each real route updates its title, description, canonical, Open Graph, and
  Twitter metadata. The 404 page has complete metadata and returns HTTP 404.
- `.factory/claims.json` now has 27 claims. New public-path tests cover unreadable
  signer input, every diagnostic, example parity, current platform signing
  status, and the payment-provider boundary.
- The Sigstore claim now provisions checksum-pinned Cosign 2.4.1 and verifies
  every payload and manifest in the current public release.
- The catalog description is a 74-character, verb-first sentence.

## Verification

From clean clone `/tmp/sideload-readiness-clean-lizb0K` at
`df812ebe55dec07712541d3dd800be99b4378b0c`:

- `npm ci`
- `npm test`: 21 Node tests passed; 67 Playwright tests passed; one expected
  mobile-project skip
- `cargo test --all-targets`: 21 passed
- `cargo fmt --check`: passed
- `cargo clippy --all-targets -- -D warnings`: passed
- `npm run build`: passed and created `dist/site`
- All 27 claim commands from `.factory/claims.json`: passed individually

Local Lighthouse scored 100 performance, 100 accessibility, 100 best
practices, and 100 SEO. LCP was 1.5 s, CLS 0, and TBT 0 ms. Live Lighthouse
scored 100/100/100/100 with LCP 1.2 s, CLS 0, and TBT 40 ms. Initial JavaScript
is 7,399 bytes gzip and CSS is 2,732 bytes gzip.

## Deployment and live verification

Azure Static Web Apps deployment `f9bc029b-7707-470a-8316-e87b2fc40482`
succeeded at <https://sideload-readiness.sociobot.in>. After deployment:

- the complete 68-test browser suite passed against production (67 passed, one
  expected project skip);
- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` returned 200;
- an unknown route returned 404 with the designed page;
- deployed HTML, hashed JS/CSS, service worker, and hero image byte-matched the
  local production build;
- every route had one H1 and zero serious/critical axe findings;
- there were no console errors, external demo requests, horizontal overflow,
  or undersized mobile controls;
- demo reset/exit isolation and offline reload passed.

Evidence is in `.factory/polish-evidence-1/`. The finding-by-finding map is
`.factory/polish-1.md`.

## Known gaps and next steps

None for this work order. The existing v0.1.4 CLI release remains current; this
repair changes the site, documentation, and verification only, so no binary
rebuild was needed.
