# Sideload Readiness verification handoff

## Status

**FAIL — do not release candidate
`1cbc9e0d7c4573ef91192088f9b8b2973fdfa78b`.**

Independent QA ran on 2026-08-29 against
<https://sideload-readiness.sociobot.in>. The deployment is online and matches
the candidate's static build, but the first-read mobile gate and core CLI
safety behavior do not meet the work order. Full evidence is in
`.factory/verification-3.md`.

No product code was changed. Only verification documentation and evidence were
added.

## Release blockers

1. At 390 × 844 the “Try it with sample data” action is clipped below the
   initial viewport. The first screen therefore fails the mandatory phone
   first-read test.
2. A device whose package dump contains signer data gets signer status `ready`
   while the report says signer details were not visible. The digest is not
   exported and the CLI cannot compare an approved signer, so signer continuity
   is not actually checked.
3. Two authorized adb devices are accepted silently; the CLI reports on the
   first rather than refusing ambiguity or requiring selection.
4. The documented Homebrew install command targets a tap repository that
   returns HTTP 404. Winget/Scoop publication is also incomplete.
5. In the mandatory pre-install claims run, 4/16 commands failed because
   `@playwright/test` was unavailable. All 16 passed after `npm ci`, but the
   explicit clean-clone claim gate says any initial failure blocks release.

## Verification that passed

- `npm ci`, `npm test` (12 Node; 35 Playwright pass, one intentional skip),
  `npm run build`.
- `cargo fmt --check`, warnings-denied clippy, `cargo test` (3 unit + 8
  integration), release build, package verification, and clean consumer install.
- Live route/status/title/semantic checks; keyboard and focus; 390 px layout;
  reduced motion; 200% text; zero axe serious/critical findings; zero
  application console/page errors.
- Demo same-origin request log and isolated storage; license-return storage,
  URL cleanup, and Sociobot-only verification request.
- Service-worker activation/update behavior and offline demo reload.
- Security headers, immutable hashed-asset caching, and bundle budgets.
- Static production HTML/JS/CSS/service worker/hero byte-match the candidate.
- Live Linux installer, published SHA-256, v0.1.1 demo, complete release
  manifest, and Cosign verification of all ten release assets.
- Billing checkout HTTP 303; verification API allows 30 requests and returns
  429 on request 31 with `Retry-After: 4`.
- Lighthouse supporting result: Performance 94, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.366 s and CLS 0.

## Reproduce

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
node scripts/verify-release-signatures.mjs v0.1.1
```

For the exact scenarios, coordinates, request log, asset sizes, release
identity, and severity-ranked defects, see `.factory/verification-3.md`.

## Next steps

Fix the mobile hero order/height, implement real signer evidence and
continuity comparison, reject or explicitly select among multiple devices,
publish and test package-manager channels, and make the claims gate runnable
under the exact clean-clone contract. Then rerun independent QA against a new
candidate and release.
