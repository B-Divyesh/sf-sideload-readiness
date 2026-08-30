# Review 4 handoff — Sideload Readiness

## Status: PASS

Perfection-loop round 4 repaired the only outstanding finding in adversarial
review 4. The code repair is commit
`2880abd13249ecb5a7b84e395c7aeadf21a64000` (`fix: prove free real-device
checks`) and is pushed to `main`. Static deployment
`046de563-020a-4a4a-9784-cc561c5a9bb7` completed successfully. The deployed
site was reopened cold at <https://sideload-readiness.sociobot.in> and byte
matched the local production build.

The repair changes the `single-device-free` proof from `demo` to the public
`check` command against one authorized fake adb device. It uses a fresh empty
HOME/XDG namespace, removes license environment variables, asserts a live
redacted six-finding report, and checks that no account, cached-license, or
fleet state was created. A paired browser test proves the Fleet import controls
stay unavailable to a visitor without a license. The catalog description is
now verb-first and 69 characters long.

## How to run and verify

```sh
cargo test --all-targets
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo package --locked
```

The browser sample is <https://sideload-readiness.sociobot.in/?demo=1>. It is
isolated in `demo:sideload-readiness`; Reset demo recreates only that key and
Start for real discards it. The CLI sample is `sideload-readiness demo`.

## Exact verification evidence

- No-hardlink clean clone: `/tmp/sideload-readiness-polish4-claims.hDxETO/repo`
  at `2880abd13249ecb5a7b84e395c7aeadf21a64000`.
- Every exact command from `.factory/claims.json` passed separately: 29/29,
  ending with `ALL_CLAIMS_PASSED 29`.
- Full clean-clone suite passed: `cargo fmt --check`; Clippy with warnings
  denied; 17 CLI tests plus 4 Rust unit tests; `npm test` with 24 Node tests
  and 71 Playwright passes plus one intentional mobile-project skip;
  `npm run build`; and `cargo package --locked`.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed
  byte identity, route metadata, designed 404, first-screen mobile layout,
  demo isolation, offline reload, same-origin requests, zero device API calls,
  zero console errors, and zero serious/critical Axe findings. Report:
  `.factory/polish-evidence-4/live-verification.json`.
- `/opt/fleet/lib/verify-url.sh` passed on home, demo, privacy, and terms.
  Captures and basic accessibility reports are under
  `.factory/polish-evidence-4/verify-url/` and
  `.factory/polish-evidence-4/live-{demo,privacy,terms}/`.
- Mobile Lighthouse at
  `.factory/polish-evidence-4/lighthouse-live.json`: performance 100,
  accessibility 100, best practices 100, SEO 100; LCP 1,244 ms, CLS 0,
  TBT 26 ms.
- Production bundle sizes: JavaScript 21,726 bytes raw / 7,393 bytes gzip;
  CSS 8,278 bytes raw / 2,727 bytes gzip.

## Deployment

The factory deployment command is:

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site
```

It deploys `dist/site`; this repository does not manage DNS, cloud
infrastructure, payments, or release publication credentials.

## Known gaps and next steps

None. All findings from reviews 1 through 4 were rechecked in the clean clone
and on the live site. The existing release workflow remains responsible for
tagged CLI release artifacts.
