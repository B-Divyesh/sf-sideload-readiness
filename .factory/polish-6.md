# Perfection loop — polish 6

**Reviewed candidate:** `bdd9354de66df358fac15829b0784e1590f488fe`  
**Adversarial report:** `d0d376ba2e73cdd4d58f4ca7aad68de941d525ff`  
**Repair code commit:** `18f759085b510c7ee423fe076d00512363e8c6b5`  
**Deployment:** `320a5315-5148-4b13-9812-3bff9b3a315f`  
**Live URL:** <https://sideload-readiness.sociobot.in>

Every `review-*.md` and `polish-*.md` through round 5 was read before the
repair. Each earlier finding was exercised again from the clean clone and live
site. “Retained” below means the implementation and its current test passed in
this round.

## Finding closure

| Finding | Change made or retained | Evidence |
| --- | --- | --- |
| F-1-1 | Retained pinned Cosign verification for every current release payload, manifest, and Sigstore bundle. | Clean-clone `@claim:release-signatures`; [live install](https://sideload-readiness.sociobot.in/#install); `.factory/polish-evidence-6/verify-url-home/screenshot-desktop.png`. |
| F-1-2 | Retained dedicated claims for unreadable signer input, all diagnostics and recovery outcomes, example parity, unsigned platform disclosure, and the Sociobot-only billing boundary. | Clean-clone `@claim:signer-unreadable`, `@claim:diagnostic-report`, `@claim:example-schema`, `@claim:unsigned-platform-disclosure`, and `@claim:billing-provider-boundary`; [live demo](https://sideload-readiness.sociobot.in/?demo=1); `.factory/polish-evidence-6/verify-url-demo/screenshot-mobile.png`. |
| F-1-3 | Retained `How the readiness check works`. | `landing page has one clear primary route and no console errors`; [live section](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-1-4 | Retained `What the CLI checks` and `What the CLI never does`. | Full clean and live browser suites; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-6/verify-url-home/screenshot-desktop.png`. |
| F-1-5 | Retained `Install the command-line tool`. | `demo install link reaches the real install section`; [live install](https://sideload-readiness.sociobot.in/#install); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-1-6 | Retained distinct titles, descriptions, canonicals, Open Graph data, real legal routes, and the designed HTTP 404. | Five `route metadata is specific to …` checks plus `node scripts/verify-live.mjs`; [Demo](https://sideload-readiness.sociobot.in/demo), [Privacy](https://sideload-readiness.sociobot.in/privacy), and [Terms](https://sideload-readiness.sociobot.in/terms); `.factory/polish-evidence-6/live-verification.json`. |
| F-2-1 | Retained the inert browser demo, USB/Serial Permissions Policy, and current-release checksum proof. | Clean-clone `@claim:browser-demo-no-device` and `@claim:release-checksums`; live verifier recorded zero device calls and external demo requests; `.factory/polish-evidence-6/verify-url-demo/screenshot-mobile.png`. |
| F-2-2 | Retained `Sample readiness report`. | Landing browser check; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-2-3 | Retained `Fleet report review`. | Landing browser check; [live fleet section](https://sideload-readiness.sociobot.in/#fleet); `.factory/polish-evidence-6/verify-url-home/screenshot-desktop.png`. |
| F-3-1 | Retained `Connect one Android device`. | `first-read operating headings name their Android readiness tasks`; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-3-2 | Retained `Check device and app readiness`. | Same heading test and live browser suite; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-3-3 | Retained `Follow the report’s next step`. | Same heading test and live browser suite; [live how-it-works](https://sideload-readiness.sociobot.in/#how-title); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`. |
| F-3-4 | Retained README heading `Run a device readiness check`. | `first-read operating headings name their Android readiness tasks`; clean-clone `npm test`. |
| F-4-1 | Retained the real one-device `check` proof with isolated home and no license state; Fleet controls remain locked without a license. | Clean-clone `@claim:single-device-free` and `a free single-device visitor cannot open paid fleet tools`; [live fleet section](https://sideload-readiness.sociobot.in/#fleet). |
| F-5-1 | Retained delegated History API routing for every global route link and h1 focus after destination, Back, and Forward. | Desktop/mobile `global routes and browser history focus the destination heading`; live verifier records all nine focus assertions true; `.factory/polish-evidence-6/live-verification.json`. |
| F-6-1 | Rewrote the release, checkout, and factory-credit links to name GitHub or Sociobot and say `external`. Generated macOS, Linux, and Windows download labels do the same. Added a browser-wide guard for every off-origin link on home, Demo, Privacy, Terms, 404, and dynamic macOS states. | `static and generated external links disclose their destination`; desktop/mobile `every off-origin link names itself as external in every rendered state`; [live home](https://sideload-readiness.sociobot.in/); `.factory/polish-evidence-6/verify-url-home/screenshot-mobile.png`; `.factory/polish-evidence-6/live-verification.json`. |

## Verification

- Clean no-hardlink clone: `/tmp/sideload-readiness-polish6.1TkBS0/repo` at
  `18f7590`. Every one of the 32 exact `.factory/claims.json` commands passed
  separately.
- Clean clone `npm test`: 28 Node tests and 75 Playwright tests passed; one
  project-specific test was intentionally skipped. This covers desktop, 390 px
  mobile, keyboard, Axe, privacy, offline reload, routes, 404, and installers.
- Clean clone: `cargo fmt --check`, Clippy with warnings denied, 22 Rust tests,
  locked release build, locked crate package, and package verification passed.
- `npm run build` produced `dist/site`; JavaScript is 22,187 bytes raw / 7,552
  bytes gzip and CSS is 8,278 bytes raw / 2,732 bytes gzip.
- The same live browser matrix passed 75 with one intentional skip. The live
  build byte-matches the local HTML, JS, CSS, service worker, and hero art.
- Factory URL checks for Home, Demo, Privacy, and Terms found no console or
  basic accessibility errors. Captures are under `.factory/polish-evidence-6/`.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1,213 ms, TBT 30 ms, CLS 0. Report:
  `.factory/polish-evidence-6/lighthouse-live.json`.

The catalog description is now the 67-character, verb-first sentence: `Check
an Android device before updating an approved sideloaded app.` No finding of
any severity remains unresolved.
