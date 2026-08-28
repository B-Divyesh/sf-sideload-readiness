# Sideload Readiness handoff

## Repair completed

- Reproduced the reported failure at candidate `5797cda4944139192f45de1ffcbb4c8cc95e420e`: `npm ci` exited 1 with `EUSAGE` because no lockfile existed.
- Added the npm v3 lockfile matching `package.json`. Playwright is pinned to `1.58.2`, as required by the worker image, and axe is development-only.
- Added a regression that checks the lockfile root metadata and declared development dependencies. The final clean `npm ci` installed six packages and reported zero vulnerabilities.
- Added desktop and Pixel 5 browser coverage for routing, history focus, keyboard operation, mobile overflow and 44 px targets, five-route axe scans, local-only demo traffic, service-worker activation, offline reload, cache replacement, OS-specific download selection, and calm release failure handling.
- Fixed initial focus so the skip link remains the first keyboard stop, raised undersized touch targets, showed the redacted sample device ID, and versioned/cleaned the offline cache on update.
- Added CLI process-level integration tests for `--help` and redacted JSON demo output.
- Kept the `cli-installers` artifact class. The release workflow still builds Linux, macOS arm64/x64, and Windows, but now excludes internal staging files from future releases. Homebrew now selects the correct Mac architecture, and winget has complete version, locale, and installer manifests.

## Exact verification evidence

Run from `/work/repo`:

```sh
npm ci
npm test
npm run build:site
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
```

Final results on 2026-08-28:

- `npm ci`: pass; six packages installed; zero audit findings.
- Node unit/release suite: 8 passed.
- Playwright: 23 passed across desktop Chromium and Pixel 5; one intentional skip is the duplicate desktop run of the mobile-only touch-target check.
- Axe: zero serious or critical findings on `/`, `/demo`, `/privacy`, `/terms`, and the not-found route in both projects.
- Rust: 3 unit claim tests and 2 CLI integration tests passed; formatting and clippy with warnings denied passed.
- Every command in `.factory/claims.json` passed independently.
- `npx --yes yaml-lint .github/workflows/release.yml winget/Sociobot.SideloadReadiness/0.1.0/*.yaml packaging/nfpm.yaml`: pass.
- `sh -n site/install.sh`: pass.
- Exact deploy build `npm run build:site`: pass; `dist/site/index.html` exists. `npm run build` also passes.
- Built app JavaScript is 5,595 bytes gzip; CSS is 2,705 bytes gzip; the mobile hero is 69,354 bytes.
- Local `/opt/fleet/lib/verify-url.sh`: HTTP 200, load 640 ms, no console errors, title and `lang` present, one `h1`, `main` present, zero missing image alt values, and zero unlabeled buttons.
- Local Lighthouse: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.86 s; CLS 0; 158,553 transferred bytes.

## Release verification

- GitHub release `v0.1.0` exposes Linux `.tar.gz`, `.deb`, `.rpm`; macOS arm64/x64 `.tar.gz` and `.pkg`; Windows `.zip`; `SHA256SUMS`; and `latest.json`.
- A fresh Linux archive download matched its published SHA-256. The extracted binary reported `sideload-readiness 0.1.0` and produced valid `sideload-readiness/v1` demo JSON with a redacted device ID.
- `latest.json` parsed successfully and points Linux and Windows to the expected assets.
- Release workflow, checksum enforcement, Homebrew architecture metadata, Scoop metadata, and the complete winget manifest set have focused Node regression coverage.

## Deployment and live identity

- Pushed repair commits `f36c101` and `4774417` to `origin/main`.
- Deployed `dist/site` with `/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site`; Azure deployment `311accc6-27b0-4349-8da8-6fdca4f94bed` succeeded at `gray-coast-05ad65210.7.azurestaticapps.net` in `centralus`.
- Canonical production URL: `https://sideload-readiness.sociobot.in` (HTTP 200 with managed TLS).
- `/`, `/demo`, `/privacy`, `/terms`, `/install.sh`, `/install.ps1`, and `/service-worker.js` all return HTTP 200. The live worker identifies cache `sideload-readiness-v2`.
- Live factory URL verification: no console errors; correct title, English language, one `h1`, `main`, zero missing alt values, and zero unlabeled buttons.
- Live 390×844 browser check: correct Demo title and headline, visible demo banner and redacted ID, no horizontal overflow, no external requests during the demo, and zero serious/critical axe findings.
- Live Linux download selection resolves to a real `v0.1.0` release asset.
- Live Lighthouse: performance 100, accessibility 100, best practices 100, SEO 100; LCP 1.58 s; CLS 0; 141,893 transferred bytes.

## Known gaps / operator action

- Publish `packaging/homebrew/sideload-readiness.rb` in `B-Divyesh/homebrew-sideload-readiness` and submit the checked winget manifests to `microsoft/winget-pkgs`.
- macOS and Windows artifacts remain intentionally unsigned. Signing requires owner-provided Apple and Windows certificates; no secrets belong in this repository.
- The historical `v0.1.0` release includes a few harmless internal staging files. The repaired workflow excludes them from future releases; all required `v0.1.0` assets and checksums are valid.
- Android does not expose complete recovery-sideload state while running. The CLI continues to mark it `needs-review` and directs users to device-maker guidance.
