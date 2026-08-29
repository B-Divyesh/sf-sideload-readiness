# Independent verification 10 — PASS

**Candidate:** `d2e1e5fa4706c3c61468eb3ecab99f25c7760b86` (`d2e1e5f docs: record polish round three evidence`)  
**Live URL:** <https://sideload-readiness.sociobot.in>  
**Verified:** 2026-08-29, from a clean checkout at `/work/repo`

## Verdict

**PASS.** The live deployment is the production build of the candidate and the CLI, demo, installer/release, accessibility, privacy, and recovery workflows meet the researched brief. The earlier deployment-only concern is not reproduced.

## First read (cold live page)

The first screen says **“Check Android update safety.”** It says it is for people maintaining approved sideloaded apps when device rules or recovery paths change. The first action is the clearly visible **“Try it with sample data”** link, with the adjacent explanation “See a redacted report and the next safe step.” This satisfies the what / who / first-click contract and is a one-click sample demo.

## Mandatory claims contract

`.factory/claims.json` exists and declares 29 claims. I ran every exact declared command from this checkout, using the shipped CLI demo or browser demo as applicable. All passed.

| Claim IDs | Result | Evidence |
| --- | --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `signer-continuity`, `signer-unreadable`, `diagnostic-report`, `example-schema`, `device-selection`, `demo-no-adb`, `private-demo-file`, `explicit-output-replacement`, `single-device-free` | PASS | Each exact `cargo test --test cli … -- --exact` command passed. |
| `local-demo`, `browser-demo-no-device`, `privacy`, `fleet-review`, `license-verification`, `license-retention` | PASS | Each exact `npm ci && npm run test:browser -- --project=chromium --grep …` command passed. |
| `fleet-checkout` | PASS | `npm run test:billing`: public checkout returned 303 to hosted Dodo checkout; invalid-license verification returned 200. |
| `verified-installer`, `platform-packaging`, `release-manifest`, `release-signatures`, `release-checksums`, `unsigned-platform-disclosure`, `billing-provider-boundary`, `published-installer-paths` | PASS | Each exact filtered `node --test` command passed, including current-release checksums and pinned Cosign/OIDC verification. |

## Clean local quality gates

- `npm ci`: passed; audit reported 0 vulnerabilities.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: 21 passed (4 unit, 17 CLI integration).
- `cargo package --locked`: passed and verified the packaged crate.
- `npm test`: 24 Node tests and all 70 Playwright tests passed.
- `npm run build`: passed and produced `dist/site`.

## End-to-end CLI and package check

I installed the candidate into a new consumer root with `cargo install --path /work/repo --root /tmp/sr-consumer-verification10 --locked`. The installed binary reports `sideload-readiness 0.1.4`, has useful public help, and `demo --json --output` emitted a parseable six-finding report with redacted device ID `device-6f31a0b2` and five recovery-checklist items.

Invalid and recovery paths are actionable: malformed `--expected-signer xyz` exits 2 and asks for a 64-digit SHA-256 digest; a valid requested package/signer with a missing adb executable exits 2 and says to install Android platform-tools, connect one device, and accept USB debugging. The test suite additionally exercised fake-adb normal, low-storage, unreadable APK, signer mismatch, unauthorized-device, and explicit multi-device-selection paths. No physical device was attached in this disposable verifier.

## Live deployment, privacy, accessibility, and mobile

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed. It byte-matched the local production output:

| Path | SHA-256 |
| --- | --- |
| `/` | `dc0819ce1790ede43a5e61367e9a710b7d5aa3a40c587e5563a947d7b0910676` |
| `/assets/style.153fe0711a98.css` | `153fe0711a98b64e753dd98d8ab0b8a4826a45def135d3608bf4597d2741c63a` |
| `/assets/app.ad925ab2e3e9.js` | `ad925ab2e3e956d15bca8443a58201f0dd016f1395ba6bbd768d09e62960b672` |
| `/service-worker.js` | `91d5d6a034004e4cfde6fb5cf6bb49aa15c25aa38f0b12960c7d044fec329a11` |
| `/public/hero-concrete-moss-768.webp` | `d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718` |

The verifier confirmed 200s and route-specific title/canonical/description, one h1, and zero axe serious/critical violations for `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms`. The designed unknown route returns HTTP 404. It also confirmed desktop and 390 px mobile behavior: no horizontal overflow, no undersized targets, the sample action and its result are in the first viewport, and offline `/demo` reload succeeds after service-worker activation.

`/opt/fleet/lib/verify-url.sh` also passed independently for home, demo, privacy, and terms: all had `lang=en`, a title, one h1, main landmark, no missing image alternatives/unlabeled buttons, and no console/page errors. Its desktop and mobile screenshots and JSON reports are in `.factory/verification-evidence-10/`.

A fresh Playwright request log across demo entry, reset, and exit saw only same-origin document, CSS, JS, and image requests; no third-party runtime, analytics, or device-access request occurred. Demo showed the persistent “Demo — sample data, nothing is saved” banner; Reset worked, and Start for real returned to `/` with no retained browser keys. Browser response headers include restrictive CSP, `Permissions-Policy: … usb=(), serial=()`, HSTS, `nosniff`, and strict-origin referrer policy. HTML and hero use 30-second revalidation; fingerprinted CSS and JS use one-year immutable caching.

Keyboard/focus, route focus restoration, 200% text, and reduced-motion behavior are covered by the passing full Playwright suite. Live axe integration reported zero serious/critical findings.

## Performance and bundle budget

Built assets: JS 21,726 bytes raw / 7,396 gzip; CSS 8,278 raw / 2,732 gzip; mobile hero 69,354 bytes. All are below the static-product budgets.

Live mobile Lighthouse output in `.factory/verification-evidence-10/lighthouse-live.json` reports Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1.3 s, CLS 0, and TBT 90 ms. Lighthouse wrote the complete report before Chromium reported a shutdown tab crash; the report contains no run warnings, and independent live Playwright/axe verification passed.

## Product-unlock endpoint allowance

The only server-side product call is the Sociobot license verifier. A same-client burst to `GET /api/v1/products/sideload-readiness/verify` received HTTP 429s with `Retry-After: 0` or `1` once the allowance was exceeded (a 40-request burst returned 6×200 and 34×429; an immediately following 35-request sequential burst returned 3×200 and 32×429). Thus the required enforcement and Retry-After header are present. The precise configured allowance could not be isolated from this worker because the test itself had already consumed the shared client window; the observed immediately available allowance after recovery was three requests. This is not a bypass or missing rate limit.

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.
