# Polish 3 handoff — Sideload Readiness

## Status: PASS

The release-candidate repair is live at
<https://sideload-readiness.sociobot.in>. The code repair is commit
`5611651fb68993f5c417fa2c9f214024572fc215`; it was pushed to `main` before
the production deploy. Azure Static Web Apps deployment
`128125bd-1710-4fc6-9f9a-5d9d9ea90fdf` completed successfully.

## What changed

- Rewrote the three operating-step headings so a screen-reader heading list
  names the device, readiness task, and report action: `Connect one Android
  device`, `Check device and app readiness`, and `Follow the report’s next
  step`.
- Rewrote the README usage heading as `Run a device readiness check`.
- Added source, browser, and live-verifier regression assertions for the new
  headings. The existing isolated `?demo=1` flow, claims contract, real
  routes, metadata, designed 404, legal links, mobile layout, privacy and
  offline checks remain in place and were rerun.
- Updated the catalog line to the verb-first sentence: “Check Android update
  safety before updating an approved sideloaded app.”

Every current and earlier adversarial finding is mapped in
`.factory/polish-3.md`. The updated landing-copy audit is in
`.factory/copy-audit.md`.

## Exact verification

Fresh GitHub clone: `/tmp/sideload-readiness-polish3.8Mu5la/repo` at
`5611651fb68993f5c417fa2c9f214024572fc215`.

- Every one of the 29 exact commands declared in `.factory/claims.json`
  passed separately. This includes the real public-release checksum and
  Sigstore checks, browser demo storage/device isolation, privacy request
  capture, offline reload, fleet fixture, and billing boundary checks.
- `npm test`: 24 Node tests passed; 69 Playwright checks passed, with one
  intentional mobile-project-only skip. It includes desktop and 390 px mobile
  layout, keyboard, focus/history, metadata, 404, reduced motion, 200% text,
  Axe, privacy, and service-worker offline coverage.
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D
  warnings`, `cargo test --all-targets` (21 tests), `npm run build`, and
  `cargo package --locked` all passed. The static build contains
  `dist/site/index.html`.
- Cold production verifier: `node scripts/verify-live.mjs
  https://sideload-readiness.sociobot.in` passed. It proved deployed byte
  identity, `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` 200 metadata,
  designed HTTP 404, no console error, a one-click isolated demo/reset/exit,
  zero WebUSB/Web Serial requests, same-origin demo requests, offline reload,
  focus/history, and mobile no-overflow/44 px targets. Evidence:
  `.factory/polish-evidence-3/live-verification.json`.
- `/opt/fleet/lib/verify-url.sh` passed cold for home, demo, privacy, and
  terms with title, `lang`, one h1, main landmark, image alt text, and zero
  console errors. Screenshots and reports are under
  `.factory/polish-evidence-3/live-*`.
- Live mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100; LCP 1326 ms, CLS 0, TBT 136 ms. Evidence:
  `.factory/polish-evidence-3/lighthouse-live.json`.

The standalone `@axe-core/cli` binary cannot start against this container’s
preinstalled Playwright Chromium because its bundled ChromeDriver targets a
different Chrome major. The required Axe verification was completed through
the repository’s `@axe-core/playwright` integration on every local and live
route (zero serious/critical violations), which is the supported alternative.

## Known gaps / next steps

No release-scope findings or known product gaps remain. No approved physical
Android handset is available in this worker; the public CLI behaviour is
covered by the fake-adb matrix and signed AOSP fixture. Future release tags
should rerun the public-release claims because release artifacts change.
