# Perfection loop — polish 3

**Reviewed candidate:** `6ce78c6b2ab5477c0e60ed81f6189ef73cacba10`  
**Adversarial report:** `76aa317d52211ab4d123788c841d45b5633e3f34`  
**Repair code commit:** `5611651fb68993f5c417fa2c9f214024572fc215`  
**Deployment:** `128125bd-1710-4fc6-9f9a-5d9d9ea90fdf`  
**Live URL:** <https://sideload-readiness.sociobot.in>

I read `review-1.md`, `review-2.md`, `review-3.md`, `polish-1.md`, and
`polish-2.md`. Every listed finding is closed below; none was accepted merely
because an earlier note said it was fixed.

## Finding closure

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Retained the pinned-Cosign public-release verification added in polish 1. | Clean-clone `@claim:release-signatures` passed against the current public release; full claim loop passed 29/29. |
| F-1-2 | Retained named claims and observable tests for unreadable signer input, six diagnostics/recovery results, example parity, platform signing disclosure, and the Sociobot-only billing boundary. | Clean-clone `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, and `@claim:billing-provider-boundary` passed; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-3/live-demo/screenshot-mobile.png`. |
| F-1-3 | Kept `How the readiness check works`. | Clean-clone `landing page has one clear primary route and no console errors`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-3/live-home/screenshot-mobile.png`. |
| F-1-4 | Kept `What the CLI checks` and `What the CLI never does`. | Clean-clone browser suite and `scripts/verify-live.mjs`; [live home](https://sideload-readiness.sociobot.in/). |
| F-1-5 | Kept `Install the command-line tool`. | Clean-clone `demo install link reaches the real install section`; [live install](https://sideload-readiness.sociobot.in/#install). |
| F-1-6 | Kept route-specific title, description, canonical, Open Graph, Twitter metadata, real routes, and designed HTTP 404. | Live verifier records every route in `.factory/polish-evidence-3/live-verification.json`; [demo](https://sideload-readiness.sociobot.in/demo), [privacy](https://sideload-readiness.sociobot.in/privacy), [terms](https://sideload-readiness.sociobot.in/terms). |
| F-2-1 | Kept browser device-API isolation and every-release checksum claims. | Clean-clone `@claim:browser-demo-no-device` and `@claim:release-checksums` passed; live verifier records `deviceApiRequests: 0`, same-origin requests, reset/exit isolation, and offline reload. |
| F-2-2 | Kept `Sample readiness report`. | Clean-clone landing-route test; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-3/live-home/screenshot-desktop.png`. |
| F-2-3 | Kept `Fleet report review`. | Clean-clone landing-route test; [live fleet section](https://sideload-readiness.sociobot.in/#fleet). |
| F-3-1 | Replaced the contextless `Connect` with `Connect one Android device`. | New source test `first-read operating headings name their Android readiness tasks`, expanded browser landing-route test, and live verifier all passed; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-3/live-home/screenshot-mobile.png`. |
| F-3-2 | Replaced the contextless `Check` with `Check device and app readiness`. | New source test, expanded browser landing-route test, and live verifier passed; [live home](https://sideload-readiness.sociobot.in/). |
| F-3-3 | Replaced the mood phrase `Act safely` with `Follow the report’s next step`. | New source test, expanded browser landing-route test, and live verifier passed; [live home](https://sideload-readiness.sociobot.in/). |
| F-3-4 | Replaced README heading `Use` with `Run a device readiness check`. | `first-read operating headings name their Android readiness tasks` asserts the README heading; clean-clone `npm test` passed. |

## Required live recheck

Opened production cold after deployment in fresh desktop and 390 × 844 mobile
contexts. The first screen states the Android update-safety job, audience,
sample action, outcome, and three facts before scrolling. One click reaches
`/?demo=1`; the banner says `Demo — sample data, nothing is saved.` and shows
Reset demo and Start for real. The live verifier proved reset and exit change
only `demo:sideload-readiness`, preserve `real:sentinel`, and issue no device
request.

The concrete-and-moss field-tag system, original device/cable artwork,
square controls, evidence strip, light treatment, and reduced-motion policy
are unchanged from `.factory/design.md`. The repair changes words only; it
does not replace the product with a generic template.

## Evidence summary

- Fresh clone `/tmp/sideload-readiness-polish3.8Mu5la/repo` at `5611651`:
  all 29 claim commands passed separately; `npm test` passed 24 Node tests
  and 69 browser checks with one intentional skip; 21 Rust tests, formatting,
  Clippy, build, and locked package verification passed.
- Production byte identity, routes, metadata, designed 404, demo isolation,
  mobile layout, offline flow, console state, and live Playwright Axe results:
  `.factory/polish-evidence-3/live-verification.json`.
- Cold production captures: `.factory/polish-evidence-3/live-home/`,
  `.factory/polish-evidence-3/live-demo/`,
  `.factory/polish-evidence-3/live-privacy/`, and
  `.factory/polish-evidence-3/live-terms/`.
- Lighthouse mobile report: `.factory/polish-evidence-3/lighthouse-live.json`
  (performance 99, accessibility 100, best practices 100, SEO 100; LCP
  1326 ms, CLS 0, TBT 136 ms).

No finding of any severity remains unresolved.
