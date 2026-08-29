# Perfection loop — polish 2

**Reviewed candidate:** `a0a3d04302529fdaadf731bd38381af9aa9296d5`  
**Adversarial report:** `42fa3fc9b99f4c1c042bbf1fe8730af1c38c7cc3`  
**Repair commit:** `019f415112469b37f69c5ff905fdd2abcbc8cb72`  
**Deployment:** `fd61317b-45c3-4fe9-b07c-3d0e1f143c63`  
**Live URL:** <https://sideload-readiness.sociobot.in>

I read `.factory/review-1.md`, `.factory/polish-1.md`, and
`.factory/review-2.md`. Every blocking and minor finding is mapped below.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Round 1 replaced workflow-text inspection with pinned Cosign 2.4.1 verification of every current release payload and manifest bundle. Retained unchanged. | `@claim:release-signatures every current release asset passes pinned Cosign verification`; passed in the clean clone; [current release](https://github.com/B-Divyesh/sf-sideload-readiness/releases/latest); `.factory/polish-evidence-2/live-home/screenshot-desktop.png`. |
| F-1-2 | Round 1 added claims for unreadable signers, all documented diagnostics and recovery results, example parity, platform signing status, and the Sociobot-only billing boundary. Retained unchanged. | `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, and `@claim:billing-provider-boundary`; all 29 claims passed separately; `.factory/polish-evidence-2/live-demo/screenshot-mobile.png`; [live demo](https://sideload-readiness.sociobot.in/?demo=1). |
| F-1-3 | Round 1 renamed the heading to `How the readiness check works`. | `landing page has one clear primary route and no console errors` plus the live verifier; `.factory/polish-evidence-2/live-home/screenshot-mobile.png`; [live home](https://sideload-readiness.sociobot.in/). |
| F-1-4 | Round 1 renamed the subheadings to `What the CLI checks` and `What the CLI never does`. | Live 70-case browser matrix and `node scripts/verify-live.mjs`; `.factory/polish-evidence-2/live-home/screenshot-mobile.png`; [live home](https://sideload-readiness.sociobot.in/). |
| F-1-5 | Round 1 renamed the section to `Install the command-line tool`. | `demo install link reaches the real install section`; `.factory/polish-evidence-2/live-home/screenshot-mobile.png`; [live install section](https://sideload-readiness.sociobot.in/#install). |
| F-1-6 | Round 1 added route-specific title, description, canonical, Open Graph, and Twitter metadata. The repair retained and rechecked each route and the designed HTTP 404. | Five `route metadata is specific to …` tests and `node scripts/verify-live.mjs`; `.factory/polish-evidence-2/live-privacy/screenshot-mobile.png` and `.factory/polish-evidence-2/live-terms/screenshot-mobile.png`; [privacy](https://sideload-readiness.sociobot.in/privacy), [terms](https://sideload-readiness.sociobot.in/terms), and live missing-route HTTP 404. |
| F-2-1 | Added `browser-demo-no-device`, an instrumented WebUSB/Web Serial demo-flow test, and disabled both APIs in production Permissions Policy. Added `release-checksums`, which downloads every archive in the latest public release and matches its computed digest to a valid `SHA256SUMS` line. | `@claim:browser-demo-no-device the browser sample never requests WebUSB or Web Serial access` and `@claim:release-checksums every current release archive has a matching published SHA-256`; both passed separately in the clean clone. Live verifier recorded `deviceApiRequests: 0`; `.factory/polish-evidence-2/live-demo/screenshot-mobile.png`; [live demo](https://sideload-readiness.sociobot.in/?demo=1) and [current release](https://github.com/B-Divyesh/sf-sideload-readiness/releases/latest). |
| F-2-2 | Renamed the instruction-like heading to `Sample readiness report`. | Exact heading assertion in `landing page has one clear primary route and no console errors` and the live verifier; `.factory/polish-evidence-2/live-home/screenshot-mobile.png`; [live home](https://sideload-readiness.sociobot.in/). |
| F-2-3 | Renamed the paid section heading to `Fleet report review`. | Exact heading assertion in `landing page has one clear primary route and no console errors` and the live verifier; `.factory/polish-evidence-2/live-home/screenshot-mobile.png`; [live fleet section](https://sideload-readiness.sociobot.in/#fleet). |

## Required product cross-checks

- The 390 × 844 first screen still states the job, audience, action, action
  result, and three facts before scrolling. The action opens `/?demo=1` in one
  click.
- Demo reset and exit touch only `demo:sideload-readiness`; a seeded
  `real:sentinel` survives. The persistent banner includes Reset demo and Start
  for real. `/demo` remains a direct equivalent.
- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200 with one h1,
  route metadata, and consistent navigation. The designed missing route returns
  404.
- The live suite found no horizontal overflow or sub-44 px targets at 390 px.
  Keyboard navigation, route focus, 200% text, reduced motion, same-origin
  privacy, axe checks, and offline reload all pass.
- The original concrete, moss, field-tag visual identity remains unchanged.

## Verification summary

- Clean clone at `019f415`: all 29 claim commands passed separately.
- Clean clone: 23 Node tests passed; 69 Playwright tests passed with one
  expected project skip; 21 Rust tests passed; build, rustfmt, Clippy, and
  `cargo package --locked` passed.
- Live: byte identity passed; the same 70-case browser matrix passed; factory
  URL checks reported zero console errors on home, demo, privacy, and terms.
- Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100;
  LCP 1.2 s, CLS 0, TBT 20 ms.
- JavaScript is 21,661 bytes raw / 7,384 bytes gzip. CSS is 8,278 bytes raw /
  2,732 bytes gzip.

No finding remains open.
