# Sideload Readiness — perfection-loop round 6 handoff

## Status: complete

Repair commit `18f759085b510c7ee423fe076d00512363e8c6b5` fixes the only
round-6 finding and is pushed to `origin/main`. Static deployment
`320a5315-5148-4b13-9812-3bff9b3a315f` is live at
<https://sideload-readiness.sociobot.in>.

All off-origin links now name both the destination and that it is external:
GitHub releases and generated downloads, Sociobot checkout, and the Param
Factory credit. A desktop/mobile browser guard rejects any rendered off-origin
link whose visible or accessible name omits `external`.

The one-click `/?demo=1` sample, isolated `demo:sideload-readiness` storage,
banner, Reset demo, Start for real, claims contract, legal routes, route
metadata, focus management, designed 404, mobile layout, installer class, and
concrete-and-moss identity all remain intact. The catalog description is:
`Check an Android device before updating an approved sideloaded app.`

## Exact verification evidence

- Read every `.factory/review-1.md` through `review-6.md` and every
  `.factory/polish-1.md` through `polish-5.md`. Finding closure is mapped in
  `.factory/polish-6.md`.
- Clean clone `/tmp/sideload-readiness-polish6.1TkBS0/repo` at `18f7590`:
  all 32 exact claim commands passed independently.
- Clean clone `npm test`: 28 Node tests passed; 75 Playwright tests passed and
  one project-specific case was intentionally skipped.
- Clean clone `npm run build`: produced `dist/site` with
  `/assets/app.caece078a880.js` and `/assets/style.153fe0711a98.css`.
- Clean clone `cargo fmt --check`,
  `cargo clippy --all-targets --all-features -- -D warnings`,
  `cargo test --all-targets` (22 passed), `cargo build --release --locked`, and
  `cargo package --locked` with package verification: all passed.
- Live `node scripts/verify-live.mjs`: byte identity passed; `/`, `/?demo=1`,
  `/demo`, `/privacy`, and `/terms` returned 200; designed missing route
  returned 404; zero console errors and zero serious/critical Axe issues.
- Live `BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`:
  75 passed, one intentional skip. The external-link guard passed on desktop
  and mobile across static and generated states.
- `/opt/fleet/lib/verify-url.sh` passed cold Home, Demo, Privacy, and Terms.
  Each route has a title, `lang=en`, one h1, main landmark, complete alt text,
  and no console error. Evidence: `.factory/polish-evidence-6/verify-url-*`.
- Demo live check preserved `real:sentinel`, reset only the demo namespace,
  removed the demo key on exit, made zero WebUSB/Web Serial calls, made no
  off-origin request, and reloaded offline.
- Mobile 390 × 844: action bottom 490.63 px, outcome bottom 527.98 px, no
  horizontal overflow, and no target smaller than 44 px.
- Lighthouse mobile: Performance 100, Accessibility 100, Best Practices 100,
  SEO 100; LCP 1,212.6 ms, TBT 30 ms, CLS 0. Evidence:
  `.factory/polish-evidence-6/lighthouse-live.json`.
- Production assets: JavaScript 22,187 bytes raw / 7,552 bytes gzip; CSS 8,278
  bytes raw / 2,732 bytes gzip.
- Current public release payloads and manifests passed pinned Cosign
  verification; every advertised archive matched `SHA256SUMS`; shell,
  PowerShell, Homebrew, and Scoop paths resolved.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release --locked
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser
```

The deployable directory is `dist/site`. Release binaries remain built only by
GitHub Actions; no CLI release was needed because this repair changes only the
static site, tests, and factory documentation.

## Known gaps and next steps

None. No operator action remains for this work order.
