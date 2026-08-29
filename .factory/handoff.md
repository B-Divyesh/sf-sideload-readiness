# Handoff — perfection loop round 2

## Status: PASS

All findings in `.factory/review-1.md` and `.factory/review-2.md` are closed.
The repaired product commit is `019f415112469b37f69c5ff905fdd2abcbc8cb72`.
Azure Static Web Apps deployment `fd61317b-45c3-4fe9-b07c-3d0e1f143c63`
succeeded at <https://sideload-readiness.sociobot.in>.

## What changed

- Added `browser-demo-no-device` to `.factory/claims.json`. Its Playwright
  test instruments WebUSB and Web Serial across demo entry, reset, reload, and
  exit. Production headers also disable both APIs.
- Added `release-checksums`. Its test fetches the current public release,
  downloads all eight tar, zip, pkg, deb, and rpm archives, and recomputes each
  published SHA-256.
- Renamed the unclear headings to `Sample readiness report` and `Fleet report
  review` without changing the concrete-and-moss visual system.
- Updated the copy audit, demo documentation, and the 67-character verb-first
  catalog description.
- Retained the first-screen `/?demo=1` action, isolated demo namespace,
  route-specific metadata, focus restoration, designed 404, legal routes,
  mobile layout, installer matrix, and CLI behavior.

## Verification evidence

The clean clone was `/tmp/sideload-readiness-polish2-clean-MqDINi` at
`019f415112469b37f69c5ff905fdd2abcbc8cb72`.

```text
Every .factory/claims.json command          29/29 passed separately
npm ci                                      passed; 0 vulnerabilities
npm test                                    23 Node passed; 69 Playwright passed;
                                            1 expected project skip
npm run build                               passed; produced dist/site
cargo test --all-targets                    21 passed
cargo fmt --check                           passed
cargo clippy --all-targets -- -D warnings  passed
cargo package --locked                      passed; package verified
```

Post-deploy checks:

```text
node scripts/verify-live.mjs <live URL>      passed; local/live byte identity
BASE_URL=<live URL> npm run test:browser    69 passed; 1 expected project skip
factory verify-url: /                       200; zero console errors
factory verify-url: /?demo=1                200; zero console errors
factory verify-url: /privacy and /terms     200; zero console errors
designed missing route                      HTTP 404
Lighthouse mobile                           100 performance, 100 accessibility,
                                            100 best practices, 100 SEO
LCP / CLS / TBT                             1.2 s / 0 / 20 ms
```

The live verifier observed zero serious or critical axe findings, zero
unexpected console errors, zero external demo requests, zero WebUSB/Web Serial
requests, no undersized controls, no horizontal overflow at 390 px, preserved
real data after demo reset/exit, and a successful offline demo reload.

Production budgets are 21,661 bytes JavaScript (7,384 gzip), 8,278 bytes CSS
(2,732 gzip), and 69,354 bytes for the mobile hero image.

Evidence is under `.factory/polish-evidence-2/`, including the Lighthouse JSON
and cold desktop/mobile captures for home, demo, privacy, and terms. The full
finding map is `.factory/polish-2.md`.

## Run it

```sh
npm ci
npm test
npm run build
cargo test --all-targets
cargo fmt --check
cargo clippy --all-targets -- -D warnings
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```

The one-click browser demo is <https://sideload-readiness.sociobot.in/?demo=1>.
The CLI demo is `sideload-readiness demo`.

## Known gaps and operator action

No review finding or product gap remains. The existing v0.1.4 release remains
current because this repair changes only the site and its verification. The
checksum-pinned winget manifest remains ready for owner submission and is not
advertised as an available winget command.
