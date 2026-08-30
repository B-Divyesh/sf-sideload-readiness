# Perfection loop — polish 5

**Reviewed candidate:** `f4e17396ade8706ad016b87ffafcd4c9d8f30593`
**Adversarial report:** `87eed4e4efa96c24246b89a8067fe4fbdcf61e4e`
**Repair commits:** `8ef8304`, `9351fc2`
**Deployment:** `e945100f-dca1-4ecf-8c5b-f63a55f5de3a`
**Live URL:** <https://sideload-readiness.sociobot.in>

I read every `review-*.md` and `polish-*.md`. Every prior finding was checked
again from a clean clone and against the deployed site. The table maps each
finding id to its product state, executable evidence, screenshot, and live
route. “Retained” means it was re-exercised in this round, not merely accepted
from an older report.

## Finding closure

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Retained pinned Cosign verification of every current public release payload, manifest, and Sigstore bundle. | Clean-clone `@claim:release-signatures`; [live install](https://sideload-readiness.sociobot.in/#install); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |
| F-1-2 | Retained named, observable claims for unreadable signers, diagnostics/recovery output, example parity, unsigned-platform disclosure, and the Sociobot-only billing boundary. | Clean-clone `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, and `@claim:billing-provider-boundary`; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-5/verify-url-demo/screenshot-mobile.png`. |
| F-1-3 | Retained the explicit section title `How the readiness check works`. | `landing page has one clear primary route and no console errors`; [live home](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-1-4 | Retained `What the CLI checks` and `What the CLI never does`. | `landing page has one clear primary route and no console errors`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |
| F-1-5 | Retained `Install the command-line tool`. | `demo install link reaches the real install section`; [live install](https://sideload-readiness.sociobot.in/#install); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |
| F-1-6 | Retained real routes, unique titles/metadata/canonicals, legal routes, and designed HTTP 404; this round also verifies global link focus. | Five `route metadata is specific to …` tests plus live verifier; [demo](https://sideload-readiness.sociobot.in/demo), [privacy](https://sideload-readiness.sociobot.in/privacy), [terms](https://sideload-readiness.sociobot.in/terms); `.factory/polish-evidence-5/verify-url-privacy/screenshot-desktop.png`. |
| F-2-1 | Retained no-device browser demo, USB/serial Permissions Policy, and public-release checksum proofs. | Clean-clone `@claim:browser-demo-no-device` and `@claim:release-checksums`; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-5/verify-url-demo/screenshot-mobile.png`. |
| F-2-2 | Retained `Sample readiness report`. | `landing page has one clear primary route and no console errors`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-2-3 | Retained `Fleet report review`. | `landing page has one clear primary route and no console errors`; [live fleet](https://sideload-readiness.sociobot.in/#fleet); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |
| F-3-1 | Retained `Connect one Android device`. | `first-read operating headings name their Android readiness tasks`; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-3-2 | Retained `Check device and app readiness`. | `first-read operating headings name their Android readiness tasks`; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-3-3 | Retained `Follow the report’s next step`. | `first-read operating headings name their Android readiness tasks`; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-3-4 | Retained README heading `Run a device readiness check`. | `first-read operating headings name their Android readiness tasks`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |
| F-4-1 | Retained the public one-device `check` test without license state and the paired browser assertion that fleet import stays locked. | Clean-clone `@claim:single-device-free` and `a free single-device visitor cannot open paid fleet tools`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-5/verify-url-home/screenshot-mobile.png`. |
| F-5-1 | Added `data-route` to every same-origin header/footer route link and replaced per-render listeners with one delegated route handler. Header Demo/Privacy and footer Terms now use pushState; destination, Back, and Forward focus the route `h1`. | Clean-clone desktop/mobile `global routes and browser history focus the destination heading`; live `node scripts/verify-live.mjs` records all nine focus assertions true; [live demo](https://sideload-readiness.sociobot.in/demo), [privacy](https://sideload-readiness.sociobot.in/privacy), [terms](https://sideload-readiness.sociobot.in/terms); `.factory/polish-evidence-5/verify-url-home/screenshot-desktop.png`. |

## Required product recheck

- The cold 390 × 844 live home view puts the whole first action at
  y=442.31–490.63 and its result at y=505.63–527.98. It says what the product
  does, who it is for, and what to do first without scrolling.
- One click opens `/?demo=1`; the live demo has the realistic six-finding
  redacted report, persistent `Demo — sample data, nothing is saved.` banner,
  Reset demo, and Start for real. It keeps only the `demo:sideload-readiness`
  namespace, preserves real data, never requests a device, and reloads offline.
- `.factory/claims.json` still declares exactly 32 observable claims; all exact
  commands passed from clean clone. The catalog description is verb-first and
  71 characters: `Check Android update safety before updating an approved
  sideloaded app.`
- Live checks confirmed `/`, `?demo=1`, `/demo`, `/privacy`, `/terms`, and
  the designed HTTP 404 have correct routing, metadata, focus, and legal links.
  The concrete-and-moss visual system and original art remain unchanged.

## Quality, performance, and deployment evidence

- Fresh clone `/tmp/sideload-readiness-clean-AtXzzf` at `8ef8304`: every one of
  the 32 claim commands passed; then `npm test` (27 Node, 74 Playwright), site
  build, Rust format, Clippy, all-target Rust tests, locked release build, and
  locked crate package passed.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed
  byte identity, all routes, console, Axe, demo/privacy/offline/mobile checks,
  and the new focus audit.
- `/opt/fleet/lib/verify-url.sh` passed cold home, demo, Privacy, and Terms.
  Screenshots and JSON are in `.factory/polish-evidence-5/verify-url-*`.
- Lighthouse live report: Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1,317 ms; TBT 0 ms; CLS 0. See
  `.factory/polish-evidence-5/lighthouse-live.json`.
- Static deployment `e945100f-dca1-4ecf-8c5b-f63a55f5de3a` succeeded through
  the work-order configuration. Cold live HTTPS returned 200.

No finding of any severity remains unresolved.
