# Sideload Readiness repair handoff

## Status: PASS

All findings in independent verifier report commit
`35cbd4c19c03101c38349b2a76336c15ceb2a810` for candidate
`60d0a00e4b2d9c5c82cf212e4af3d9b0c7a1da86` are repaired. The product remains
a Rust single-binary CLI with a static documentation/demo site. The researched
brief and visual thesis were preserved.

Production: <https://sideload-readiness.sociobot.in>

Product repair commits:

- `c3ddd1c34016f1042f8ba620983da1f5290abc2a` — root-cause fixes and v0.1.3 CLI
- `c068c2b` — published Homebrew, Scoop, and winget manifests
- `c63ca6c` — ensure complete below-fold painting
- `4e6b0d1` — remove the initial layout shift without hiding rendered content

Release `v0.1.3` points to `c3ddd1c`. Later commits change only site CSS,
tests, and package-manager metadata; `git diff --exit-code v0.1.3 -- src
Cargo.toml Cargo.lock` passes.

## Findings repaired

1. **Installed signer continuity:** removed the impossible `dumpsys package`
   SHA-256 parser. The CLI now obtains the installed APK path with stock `pm
   path`, streams the APK with `adb exec-out cat`, and parses v1/v2/v3/v3.1
   certificates locally. It compares the SHA-256 of the strongest available
   signer and remains read-only. The regression uses the exact official AOSP
   apksig v2-only fixture, verifies match and mismatch results, checks the adb
   command sequence, and rejects the old `dumpsys` path.
2. **One-day license result:** a cached verdict expires at exactly 24 hours.
   A stale verdict is removed before revalidation and cannot keep fleet tools
   open when the API is unavailable. The token remains available for a later
   retry. The privacy sentence is listed as claim `license-retention` and has
   an outage regression.
3. **Fleet import injection and silent rejection:** imported reports now pass
   a strict schema, redacted-ID, score, and text validation boundary. Only
   normalized fields are stored. Cells use `textContent`; rejected filenames
   and the recovery action are announced through the existing live region.
4. **Demo isolation:** leaving `/demo`, including **Start for real**, removes
   `demo:sideload-readiness`. The regression follows the visible control and
   inspects storage.
5. **Storage boundary evidence:** the value one KiB below the 1 GiB floor now
   reports exact KiB and the one-KiB shortfall. Exact-floor behavior remains
   ready.
6. **Detected download:** one activation resolves release metadata and starts
   the matching OS download. API/rate/offline failures keep the calm direct
   Releases-page fallback.
7. **Crate packaging:** rooted Cargo include patterns prevent `node_modules`
   README/LICENSE files from entering the crate. Plain `cargo package
   --locked` succeeds after `npm ci`; the release workflow now enforces it.
8. **404 wording:** the server and SPA 404s use direct recovery copy with no
   concrete/path metaphor.

An additional production visual check caught a full-page capture/printing
regression from `content-visibility:auto`. That optimization was removed and
covered. A pre-render-only empty-main reservation prevents the footer from
shifting; Lighthouse now measures CLS 0 while both screenshots contain every
section.

## Exact regression coverage

- `tests/check_integration.rs`: official signed APK success/mismatch,
  unreadable APK recovery, stock AOSP short-hash fixture, adb allowlist, and
  the exact storage-floor boundary.
- `tests/browser/site.spec.mjs`: stale license outage, hostile/invalid report
  imports, announced errors, demo exit cleanup, one-click detected download,
  fallback behavior, desktop/mobile accessibility, keyboard, 200% text,
  reduced motion, privacy requests, service-worker update/offline reload.
- `tests/release.test.mjs`: dependency-free crate contents, packaging identity,
  published installer paths, release matrix, checksums, and OIDC signing.
- `tests/site.test.mjs`: direct 404 copy and no deferred below-fold painting.
- `.factory/claims.json`: 20 listed claims, including the new exact
  `license-retention` claim.

## Verification evidence

### Clean install, CLI, package, and claims

A fresh clone was exercised with no reused dependencies:

```text
npm ci                                      pass; 6 packages, 0 vulnerabilities
npm test                                    pass
npm run build                               pass; dist/site produced
cargo test --all-targets                    pass; 4 unit + 13 integration
cargo fmt --all -- --check                  pass
cargo clippy --all-targets --all-features -- -D warnings
                                            pass
cargo build --release                       pass
cargo package --locked                      pass; 16 files, 95.3 KiB (29.7 KiB compressed)
cargo install --path . --locked --root ...  pass; isolated v0.1.3 consumer
```

The installed consumer reported `sideload-readiness 0.1.3`; `--help` was
actionable and `demo --output ...` wrote a valid report. Every one of the 20
exact `.factory/claims.json` commands passed from clean state. After the
public package repositories were updated, the published-path claim was run
again and passed.

The final current-tree `npm test` result is 17/17 Node tests plus 43/43
applicable Playwright tests across desktop Chromium and the 390 px mobile
project; one intentionally inapplicable project case is skipped.

### Release and package consumers

GitHub release workflow run
[`33262137528`](https://github.com/B-Divyesh/sf-sideload-readiness/actions/runs/33262137528)
passed its verify, Linux, Windows, both macOS architectures, and release jobs.
The release contains `latest.json`, `SHA256SUMS`, `.deb`, `.rpm`, Linux tar,
Windows zip, both macOS tarballs and `.pkg` files, plus a Sigstore bundle for
each of the ten published files.

Fresh Cosign 3.1.3 verification passed all ten files against GitHub's OIDC
issuer and this repository's `release.yml`/`sign-release.yml` identities. A
fresh Linux tarball download matched SHA256SUMS (`04ea4afe111ca860...`) and its
binary reported v0.1.3 and completed the demo.

Published consumer workflow run
[`33262676960`](https://github.com/B-Divyesh/sf-sideload-readiness/actions/runs/33262676960)
passed all four jobs: Linux one-line installer, Homebrew on macOS, PowerShell
on Windows, and Scoop on Windows. Public package metadata commits are
`B-Divyesh/homebrew-sideload-readiness@ede5177` and
`B-Divyesh/scoop-bucket@de9d777`.

### Production browser, accessibility, privacy, and offline

`BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser` passed
43 applicable cases with one intentional project skip. `verify-url.sh` passed
in 615 ms with no console errors. `verify-live.mjs` passed:

- `/`, `/demo`, `/privacy`, and `/terms`: HTTP 200, route title, one `h1`, and
  zero serious/critical axe findings;
- designed unknown route: HTTP 404 and zero serious/critical axe findings;
- keyboard focus/route restoration, reduced motion, 200% text, and ≥44 px
  visible mobile targets;
- 390 px sample action and its outcome entirely in the first 844 px viewport,
  with no horizontal overflow;
- no external requests in the demo privacy flow and a successful offline demo
  reload after service-worker activation/update.

Factory desktop and 390 px screenshots were visually checked and contain the
complete page. They and the raw audits are in `.factory/repair-evidence-5/`.

Production policy checks returned the intended CSP, `nosniff`, strict referrer
policy, 30-second document revalidation, one-year immutable caching for the
fingerprinted assets, and `no-cache` for the service worker. The billing
checkout returned 303 to the hosted checkout. With the production Origin,
license verification returned JSON and the exact CORS origin. Requests 1–30
returned 200; request 31 returned 429 with `Retry-After: 3`.

### Performance and deployed identity

Mobile simulated-throttling Lighthouse 12.8.2:

```text
Performance 100 | Accessibility 100 | Best Practices 100 | SEO 100
FCP 0.793 s | LCP 1.208 s | CLS 0 | TBT 32 ms
```

Static budgets:

```text
JavaScript  17,954 bytes / 6,389 gzip
CSS          8,091 bytes / 2,689 gzip
mobile hero 69,354 bytes
```

Azure Static Web Apps deployment
`4219c0d6-2087-4a7c-9f28-3edce913c074` succeeded. The custom domain is Ready
with managed HTTPS. Production byte-for-byte matches the local build:

```text
/                                                ee3a2c1771f86ba8693fa3d24c845930bb846237c7005ce7a5ec54dc1c90a532
/assets/style.964ecf3b4323.css                   964ecf3b43236085dba00d2c1c24054f13833c58a6c91994710504cd30df8feb
/assets/app.3d7a4379a740.js                      3d7a4379a740990ed4b2638522c1ac0005e21b67644b9e5f077acc15d26d7305
/service-worker.js                               213746a9c607ab3330e4552639c2a22eac420afbdffdb9044f4238bcead274b4
/public/hero-concrete-moss-768.webp              d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718
```

## Run and verify

```sh
npm ci
npm test
npm run build
cargo test --all-targets
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo build --release
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
npm run test:billing
```

Run each `.test` value in `.factory/claims.json` independently for the strict
claim gate. Use `PATH=/path/to/cosign:$PATH node
scripts/verify-release-signatures.mjs v0.1.3` for live release identity.

## Known gaps / operator action

- The checked-in winget manifest is ready for owner submission to
  `microsoft/winget-pkgs`; the worker did not mutate that external repository.
- macOS `.pkg` and Windows portable builds are unsigned in the platform code-
  signing sense, as documented. Sigstore provenance covers every published
  asset. Apple/Windows certificates remain an operator prerequisite for native
  signing.
- No purchase was made during the billing smoke test.

There are no known release-blocking product gaps.
