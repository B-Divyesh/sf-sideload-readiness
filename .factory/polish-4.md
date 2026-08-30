# Perfection loop — polish 4

**Reviewed candidate:** `d2e1e5fa4706c3c61468eb3ecab99f25c7760b86`  
**Adversarial report:** `d6c1f00f1109aad264d409b8f6756fb35e6f6509`  
**Repair commit:** `2880abd13249ecb5a7b84e395c7aeadf21a64000`  
**Deployment:** `046de563-020a-4a4a-9784-cc561c5a9bb7`  
**Live URL:** <https://sideload-readiness.sociobot.in>

I read every `review-*.md` and `polish-*.md`. The table maps every finding,
including earlier closed findings, to its current implementation and current
evidence. “Retained” means the source behavior and test remained present and
were rerun from the round-4 clean clone; it was not accepted on an earlier
report alone.

## Finding closure

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Retained pinned Cosign 2.4.1 verification of every current public release payload, manifest, and bundle. | Clean-clone `@claim:release-signatures` passed; live install area: `.factory/polish-evidence-4/verify-url/screenshot-desktop.png`; [current release](https://github.com/B-Divyesh/sf-sideload-readiness/releases/latest). |
| F-1-2 | Retained dedicated public-path tests for unreadable signer input, all documented diagnostics/recovery output, example parity, unsigned macOS/Windows disclosure, and the Sociobot-only billing boundary. | Clean-clone `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, and `@claim:billing-provider-boundary` passed; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-4/live-demo/screenshot-mobile.png`. |
| F-1-3 | Retained `How the readiness check works`. | Live verifier and heading test passed; [live home](https://sideload-readiness.sociobot.in/#how-it-works); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-1-4 | Retained `What the CLI checks` and `What the CLI never does`. | Clean-clone landing browser test and live verifier passed; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-1-5 | Retained `Install the command-line tool`. | `demo install link reaches the real install section` passed; [live install](https://sideload-readiness.sociobot.in/#install); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-1-6 | Retained distinct metadata, canonical, Open Graph, title, focus handling, real routes, legal pages, and designed 404. | Five route-metadata tests and live verifier passed; [demo](https://sideload-readiness.sociobot.in/demo), [privacy](https://sideload-readiness.sociobot.in/privacy), [terms](https://sideload-readiness.sociobot.in/terms); `.factory/polish-evidence-4/live-verification.json`. |
| F-2-1 | Retained browser WebUSB/Web Serial isolation, production Permissions Policy, and every-release checksum verification. | Clean-clone `@claim:browser-demo-no-device` and `@claim:release-checksums` passed; live report records `deviceApiRequests: 0`; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-4/live-demo/screenshot-mobile.png`. |
| F-2-2 | Retained `Sample readiness report`. | Clean-clone landing test and live verifier passed; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-2-3 | Retained `Fleet report review`. | Clean-clone landing test and live verifier passed; [live fleet section](https://sideload-readiness.sociobot.in/#fleet); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-3-1 | Retained `Connect one Android device`. | `first-read operating headings name their Android readiness tasks` and the live verifier passed; [live home](https://sideload-readiness.sociobot.in/#how-it-works); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-3-2 | Retained `Check device and app readiness`. | The first-read source test and live verifier passed; [live home](https://sideload-readiness.sociobot.in/#how-it-works); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-3-3 | Retained `Follow the report’s next step`. | The first-read source test and live verifier passed; [live home](https://sideload-readiness.sociobot.in/#how-it-works); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |
| F-3-4 | Retained README heading `Run a device readiness check`. | `first-read operating headings name their Android readiness tasks` passed from the clean clone; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-4/verify-url/screenshot-desktop.png`. |
| F-4-1 | Replaced the demo-only `single-device-free` proof with an authorized one-device fake-adb invocation of public `check`. The test removes license environment variables, uses empty isolated HOME/XDG locations, asserts a live redacted six-finding report, and asserts no account/cache/fleet state. Added a paired no-license browser assertion that Fleet import controls are locked. | Clean-clone `@claim:single-device-free claim_single_device_check_is_free` passed; `a free single-device visitor cannot open paid fleet tools` passed; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-4/verify-url/screenshot-mobile.png`. |

## Required product recheck

- Cold 390 × 844 and desktop sessions show the job, audience, sample action,
  action result, and three facts before scrolling. The live report records the
  mobile action at y=442.31–490.63 and its outcome at y=505.63–527.98.
- One click opens `/?demo=1`. The banner says `Demo — sample data, nothing is
  saved.`, includes Reset demo and Start for real, and is shown in
  `.factory/polish-evidence-4/live-demo/screenshot-mobile.png`.
- Live reset/reload/exit recreated only `demo:sideload-readiness`, preserved
  `real:sentinel`, removed the demo key on exit, requested no WebUSB/Web Serial
  device, made no external request, and reloaded offline.
- The live `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` routes have
  distinct correct metadata, one h1, focus behavior, and legal footer links;
  the missing route is an HTTP 404 with its designed recovery page. Details:
  `.factory/polish-evidence-4/live-verification.json`.
- The concrete-and-moss field-tag identity, original device art, square
  controls, and reduced-motion behavior remain intact. It was visually checked
  in the round-4 cold mobile home and demo captures.

## Quality and deployment evidence

- Clean clone `/tmp/sideload-readiness-polish4-claims.hDxETO/repo` at
  `2880abd`: all 29 claim commands passed independently; `npm test` passed 24
  Node tests and 71 browser tests with one intentional mobile-project skip;
  21 Rust tests, formatting, Clippy, build, and locked package verification
  passed.
- Live verifier: `node scripts/verify-live.mjs
  https://sideload-readiness.sociobot.in`; all route, metadata, byte-identity,
  privacy, demo, offline, mobile, console, and Axe assertions passed.
- `/opt/fleet/lib/verify-url.sh` passed cold home, demo, privacy, and terms;
  screenshots and per-route JSON are under `.factory/polish-evidence-4/`.
- Mobile Lighthouse: 100 performance, 100 accessibility, 100 best practices,
  and 100 SEO; LCP 1,244 ms, CLS 0, TBT 26 ms. Report:
  `.factory/polish-evidence-4/lighthouse-live.json`.
- Static deployment `046de563-020a-4a4a-9784-cc561c5a9bb7` completed through
  `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site`; live HTTPS
  returned 200.

No finding of any severity remains unresolved.
