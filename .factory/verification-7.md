# Independent verification 7

## Verdict: PASS

Candidate commit: `9c3c1b97d0c31f61a2e4cf905a8a7a697eadbd78`  
Live URL: <https://sideload-readiness.sociobot.in>  
Verification date: 2026-08-29 UTC

This was a fresh, independent verification from a clean checkout. Product
source was not changed.

## First read: PASS

A cold desktop and 390 px load plainly answered the three required questions:
the headline is **“Check Android update safety”**; it is “For people who
maintain approved sideloaded apps when device rules or recovery paths change”;
and the first action is **“Try it with sample data”**, followed immediately by
“See a redacted report and the next safe step.” It opens the realistic
six-finding sample report at `/demo`, with the persistent “Demo — sample data,
nothing is saved” controls, Reset demo, and Start for real.

## Claims gate: PASS (22/22)

`.factory/claims.json` exists. After clean `npm ci` (0 vulnerabilities), every
listed command was executed separately through its declared public demo entry
point and passed:

- CLI demo and safety claims: `demo-report`, `json-report`, `redacted-id`,
  `read-only-checks`, `unauthorized-device`, `signer-continuity`,
  `device-selection`, `demo-no-adb`, `private-demo-file`,
  `explicit-output-replacement`, and `single-device-free`.
- Browser demo, privacy, fleet, and license claims: `local-demo`, `privacy`,
  `fleet-review`, `license-verification`, and `license-retention`.
- Billing and installer/release claims: `fleet-checkout`, `verified-installer`,
  `platform-packaging`, `release-manifest`, `release-signatures`, and
  `published-installer-paths`.

The hosted checkout probe returned 303 to Dodo without a purchase. The
invalid-license probe returned the documented 200 invalid response.

## Local build and CLI: PASS

```text
npm test                                      18 Node + 56 Playwright passed
npm run build                                 passed; produced dist/site
cargo test                                    19 passed
cargo fmt --check                             passed
cargo clippy --all-targets -- -D warnings     passed
cargo build --release                         passed
cargo package --locked                        passed; 16 files verified
```

An isolated `cargo install --path . --root <temp>` consumer ran `--help` and
`demo --json --output`. The JSON report had six findings, five recovery items,
and redacted `device-6f31a0b2`; an actual missing-adb check returned exit 2 and
an actionable recovery message. The published Linux v0.1.4 archive also
downloaded, matched SHA-256
`1797f1b5a1ca905b749b495bd2fd3982c0c3b408dc3494aaeaf90507835888a0`,
extracted, and produced the same valid demo report.

## Live deployment: PASS

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed.
It byte-matched the deployed candidate build for the document, fingerprinted
JS/CSS, service worker, and hero image; the SHA-256 values were respectively
`cc002745…`, `d51a46aa…`, `153fe071…`, `ac636811…`, and `d7593ebd…`.

- `/`, `/demo`, `/privacy`, and `/terms` returned 200 with route-specific
  titles and exactly one h1. The designed missing route returned 404. All five
  had zero axe serious/critical findings and no console/page errors.
- Desktop and 390 px mobile passed: the sample action and outcome fit in the
  first mobile viewport, no horizontal overflow occurred, all visible targets
  were at least 44 px, and keyboard navigation reached the skip link first.
  The designed focus outline is 3 px. Reduced motion and 200% text passed the
  repository's browser coverage.
- Fresh Playwright request logging observed only product-origin requests during
  the landing/demo path. The demo uses only `demo:sideload-readiness`; offline
  `/demo` reload worked after the service worker activated. The worker uses a
  fingerprinted cache name, `skipWaiting`, `clients.claim`, and deletion of
  previous product cache versions; its update regression test passed.
- CSP permits only self resources plus the declared GitHub and Sociobot API
  connections. HSTS, `nosniff`, strict-origin referrer policy, and restrictive
  permissions policy are present. Fingerprinted JS/CSS are immutable for one
  year and the worker is `no-cache`.
- `verify-url.sh` passed (HTTP 200, 625 ms load, title/lang/main, one h1,
  complete image alt text, labeled buttons, zero console errors).

Mobile Lighthouse produced Performance **93**, Accessibility **100**, Best
Practices **100**, and SEO **100**. The final Lighthouse screenshot collector
reported a browser-tab crash after producing its JSON report; independent
Playwright rendering/offline checks passed without that issue. Built budgets:
JavaScript 19,960 bytes / 6,867 gzip, CSS 8,278 / 2,727 gzip, and mobile hero
69,354 bytes.

## Service endpoint allowance: PASS

From one client, 40 fresh invalid-license requests to the documented Sociobot
verify endpoint returned 200 for requests 1–30; request 31 through 40 returned
429 with `Retry-After: 1`. Observed allowance: **30 requests per window**.

## Defects by severity

None found. There are no release-blocking defects in this candidate.

## Evidence

Ephemeral command logs and screenshots are under `/tmp/sr-qa-9c3c1b97/` in the
verification container, including `claims-cargo.log`,
`claims-node-browser.log`, `full-local-quality.log`, `live-verify.json`,
`live-headers.log`, `rate/`, `release-checksum.txt`, and
`lighthouse-live.json`.
