# Perfection loop — polish 1

**Reviewed candidate:** `9c3c1b97d0c31f61a2e4cf905a8a7a697eadbd78`  
**Adversarial report:** `ee48dc248cc8764d9a856392e84c39693266363d`  
**Repair commit:** `df812ebe55dec07712541d3dd800be99b4378b0c`  
**Live URL:** <https://sideload-readiness.sociobot.in>

Only `.factory/review-1.md` exists; there were no earlier review or polish
files. The earlier verification records named by that review were covered again
by the full clean-clone and live suites.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Replaced workflow-text inspection with a public-release test. It downloads checksum-pinned Cosign 2.4.1, downloads every current payload, manifest, and matching bundle, then verifies each bundle against the GitHub Actions OIDC identity. | `@claim:release-signatures every current release asset passes pinned Cosign verification`; all 27 claim commands passed from `/tmp/sideload-readiness-clean-lizb0K` at `df812eb`; `.factory/polish-evidence-1/live/home/screenshot-desktop.png`; current release check at <https://github.com/B-Divyesh/sf-sideload-readiness/releases/latest>. |
| F-1-2 | Added claims and observable tests for unreadable signer input, all six live diagnostics and recovery steps, example-report parity, current macOS/Windows signing status, and the Sociobot-only billing boundary. Added a test that every declared claim has exactly one tagged executable test. | `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, `@claim:billing-provider-boundary`, and `every declared claim has exactly one tagged executable test`; all passed in the clean clone. Screenshots: `.factory/polish-evidence-1/live/demo/screenshot-mobile.png` and `.factory/polish-evidence-1/live/home/screenshot-desktop.png`. |
| F-1-3 | Renamed the section to “How the readiness check works.” | Live verifier asserts the exact heading; `.factory/polish-evidence-1/live/home/screenshot-mobile.png`; <https://sideload-readiness.sociobot.in/#how-title>. |
| F-1-4 | Renamed the subheadings to “What the CLI checks” and “What the CLI never does.” | Live verifier asserts both exact headings; `.factory/polish-evidence-1/live/home/screenshot-mobile.png`; <https://sideload-readiness.sociobot.in/>. |
| F-1-5 | Renamed the install heading to “Install the command-line tool.” | Live verifier asserts the exact heading; `demo install link reaches the real install section`; `.factory/polish-evidence-1/live/home/screenshot-mobile.png`; <https://sideload-readiness.sociobot.in/#install>. |
| F-1-6 | Added per-route title, description, canonical, Open Graph title/description/URL, and Twitter metadata. The designed 404 now has complete metadata too. | Five `route metadata is specific to …` browser tests; `.factory/polish-evidence-1/live-verification.json`; route captures under `.factory/polish-evidence-1/live/{home,demo,privacy,terms}/`; <https://sideload-readiness.sociobot.in/demo>, <https://sideload-readiness.sociobot.in/privacy>, and <https://sideload-readiness.sociobot.in/terms>. |

## Required cross-checks

- `/?demo=1` is the first-screen action. The live verifier seeds
  `real:sentinel`, enters demo, resets it, exits, and proves only
  `demo:sideload-readiness` was discarded. Evidence:
  `.factory/polish-evidence-1/live-verification.json` and
  `.factory/polish-evidence-1/live/demo/screenshot-mobile.png`.
- `/demo` remains a direct equivalent. Both paths show the persistent sample
  banner, Reset demo, and Start for real.
- The live missing path returns HTTP 404 with the designed recovery page.
- Privacy and Terms are real 200 routes with distinct metadata and footer links.
- Mobile first-screen action/outcome, 44 px targets, zero overflow, keyboard
  focus, reduced motion, 200% text, offline reload, and same-origin demo traffic
  all pass the browser suite.

## Verification summary

- Clean clone at `df812ebe55dec07712541d3dd800be99b4378b0c`:
  `npm ci`; `npm test` (21 Node tests; 67 Playwright passed, one expected
  project skip); `cargo test --all-targets` (21 passed); `cargo fmt --check`;
  `cargo clippy --all-targets -- -D warnings`; `npm run build`.
- Every one of the 27 `.factory/claims.json` commands ran separately and passed
  from that clean clone.
- Local Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.5 s, CLS 0, TBT 0 ms.
- Live Lighthouse: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.2 s, CLS 0, TBT 40 ms.
- Production assets: JavaScript 21,690 bytes raw / 7,399 bytes gzip; CSS 8,278
  bytes raw / 2,732 bytes gzip.
- Azure Static Web Apps deployment `f9bc029b-7707-470a-8316-e87b2fc40482`
  succeeded. The full 68-test browser suite then passed against the live URL
  (67 passed, one expected project skip).

No finding remains open.
