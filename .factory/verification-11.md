# Independent verification 11 — FAIL

**Candidate:** `d58430814d88ccb3fa66f90de6ced7dd05c71fe6`  
**Live URL:** <https://sideload-readiness.sociobot.in>  
**Verified:** 2026-08-30 UTC from the clean checkout at `/work/repo`

## Verdict

**FAIL.** The candidate and live deployment pass every declared claim test,
the full automated suite, build, accessibility, performance, release, and
basic end-to-end CLI checks. However, the live Privacy page makes a false,
unlisted storage claim, and the documented one-step installers do not place
the executable on `PATH`. The shell installer also accepts Linux ARM64 and
then requests a release asset that does not exist. These are acceptance-contract
failures for privacy, claims, and the `cli-installers` artifact class.

The earlier deployment-only failure was not reproduced. The live site
byte-matches this candidate's production build.

## Release-blocking findings

### F-11-1 — High — The Privacy page gives false CLI storage information

The live `/privacy` route says:

> The command writes a report only when you ask for an output file.

That is false for the documented public demo entry point. From a clean
consumer install, `sideload-readiness demo --adb /definitely/not/adb` exited 0,
printed a generated path, and left a 1,594-byte mode-0600 Markdown file there,
without `--output`. The behavior is intentional and is separately promised by
the `demo-no-adb` and `private-demo-file` claims.

The inaccurate sentence is not represented by its own entry in
`.factory/claims.json`; no test can pass it because it contradicts the shipped
behavior. Under the claims contract, a false/unlisted claim fails review. Fix
the Privacy copy to distinguish normal `check` output from the automatic demo
file, then add a tagged test for the precise statement if it remains a claim.

### F-11-2 — High — The one-line installers do not put the command on PATH

README says the installers “place the binary on your PATH,” and the installer
contract requires one obvious install step per platform. The implementations
copy to a directory but do not update `PATH`:

- `install.sh` copies to `${HOME}/.local/bin`, then may tell the user to add
  that directory to `PATH`.
- `install.ps1` copies to
  `$env:LOCALAPPDATA\SideloadReadiness\bin`, then tells the user to add it to
  `PATH`.
- Neither script contains profile/PATH mutation. The published smoke workflow
  invokes each executable by its full path, so its successful run does not
  prove that `sideload-readiness` is runnable after the advertised one-liner.

This is both an unproved/incorrect README claim and a failure of the required
one-step installer experience, especially on Windows.

## Other findings

### F-11-3 — Medium — Linux ARM64 is accepted by the installer but unavailable

The public shell installer maps `arm64|aarch64` to the asset
`sideload-readiness-linux-aarch64.tar.gz`. Release v0.1.4 has no such asset,
and a fresh request to that exact URL returned HTTP 404. The release workflow
builds Linux x86_64 only. The installer should either publish Linux ARM64 or
reject that CPU locally with the existing unsupported-CPU recovery message.

## First-read gate — PASS

The cold desktop and 390 × 844 mobile first screens answer all required
questions before scrolling:

- What: **“Check Android update safety.”**
- Who: people maintaining approved sideloaded apps when device rules or
  recovery paths change.
- First click: **“Try it with sample data”**, beside “See a redacted report and
  the next safe step.”

One click enters `/?demo=1`, immediately shows the sample report, and displays
the persistent “Demo — sample data, nothing is saved” banner with Reset demo
and Start for real. Screenshots are in
`.factory/verification-evidence-11/live-cold-desktop.png` and
`.factory/verification-evidence-11/live-cold-mobile.png`.

## Mandatory claims gate — 29/29 declared commands PASS

`.factory/claims.json` exists, contains 29 unique IDs and 29 unique commands,
and every exact command was run independently before the rest of verification.

| Claims | Result |
| --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `signer-continuity`, `signer-unreadable`, `diagnostic-report`, `example-schema`, `device-selection`, `demo-no-adb`, `private-demo-file`, `explicit-output-replacement`, `single-device-free` | PASS — each exact filtered Cargo test passed |
| `local-demo`, `browser-demo-no-device`, `privacy`, `fleet-review`, `license-verification`, `license-retention` | PASS — each exact clean-install Playwright command passed |
| `fleet-checkout` | PASS — checkout returned 303 to hosted Dodo; invalid verification returned 200 |
| `verified-installer`, `platform-packaging`, `release-manifest`, `release-signatures`, `release-checksums`, `unsigned-platform-disclosure`, `billing-provider-boundary`, `published-installer-paths` | PASS — each exact filtered Node test passed |

Passing the declared list does not cure F-11-1 or F-11-2: the claims audit
requires every claim-like sentence to have accurate executable coverage.

## Clean install, tests, lint, and builds

- `npm ci`: passed; 0 audit vulnerabilities.
- `npm test`: 24 Node tests passed; 71 Playwright tests passed; one intentional
  mobile-project skip.
- `npm run build`: passed; produced `dist/site`.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: 21 passed (4 unit, 17 integration).
- `cargo build --release --locked`: passed.
- `cargo package --locked`: passed and verified the packaged crate.
- `node --check` on all site, script, and test JavaScript: passed.
- `sh -n site/install.sh`: passed. `shellcheck` and PowerShell were not
  installed in the verifier container; the published cross-platform smoke run
  at release commit `9bcc1db` reports Linux installer, Homebrew, Windows
  installer, and Scoop jobs all successful.

## CLI and release exercise

I unpacked `target/package/sideload-readiness-0.1.4.crate`, installed it with
`cargo install --path ... --root <fresh-root> --locked`, and exercised that
consumer binary:

- `--version` reported `sideload-readiness 0.1.4` and `--help` described the
  read-only job and options.
- `demo --json --output` produced valid schema `sideload-readiness/v1`, six
  findings, five recovery steps, score 83, and redacted ID
  `device-6f31a0b2`.
- Demo without `--output` ignored a deliberately missing adb path, created a
  private unpredictable mode-0600 file, and printed its location.
- A malformed signer, missing adb executable, and invalid output target each
  returned exit 2 with a concrete recovery step.
- The suite additionally exercised an authorized device, unauthorized device,
  multiple-device refusal and explicit selection, signer match/mismatch,
  unreadable APK, and the one-KiB-below storage boundary through public CLI
  invocations. No physical Android device was available in this container.

Release v0.1.4 is public with Linux tar/deb/rpm, macOS ARM64/x64 tar/pkg, and
Windows x64 zip assets, `SHA256SUMS`, `latest.json`, and matching Sigstore
bundles. All signature and checksum claim tests passed. I independently
downloaded the Linux archive, verified it against `SHA256SUMS`, extracted it,
ran v0.1.4, and generated a valid six-finding demo report. Candidate CLI source
and manifests are unchanged from the v0.1.4 tag commit.

## Live deployment, privacy network behavior, and accessibility

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed.
It byte-compared the local production output with live content:

| Path | SHA-256 |
| --- | --- |
| `/` | `dc0819ce1790ede43a5e61367e9a710b7d5aa3a40c587e5563a947d7b0910676` |
| `/assets/style.153fe0711a98.css` | `153fe0711a98b64e753dd98d8ab0b8a4826a45def135d3608bf4597d2741c63a` |
| `/assets/app.ad925ab2e3e9.js` | `ad925ab2e3e956d15bca8443a58201f0dd016f1395ba6bbd768d09e62960b672` |
| `/service-worker.js` | `91d5d6a034004e4cfde6fb5cf6bb49aa15c25aa38f0b12960c7d044fec329a11` |
| `/public/hero-concrete-moss-768.webp` | `d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718` |

The home, demo, privacy, terms, and designed 404 routes have the expected
status, route-specific title/canonical/description, one h1, and zero serious or
critical Axe violations. `/opt/fleet/lib/verify-url.sh` passed independently
on all four public routes with no console/page error, missing alt, or unlabeled
button. Every rendered link returned 200, except the expected checkout 303.

Keyboard-only traversal reached the skip link, header navigation, sample,
download, checkout, and license controls. Every tested focus state had a 3 px
solid focus outline. Enter opened the demo, Space reset it, and route/reset
focus moved to the h1. At 390 px there was no horizontal overflow and no
interactive target below 44 × 44 CSS pixels. At 200% text, the demo retained
its h1 and controls without horizontal overflow. Reduced motion reported
`animation-name: none` and effectively zero transition duration.

A fresh, service-worker-blocked request log across demo entry, reset, reload,
and exit recorded seven same-origin requests, no external request, and no
console/page error. Only `demo:sideload-readiness` changed; a real-data sentinel
survived and the demo key was removed on exit. The browser demo made no device
API request in its claim test. A real invalid-license submission contacted
only the Sociobot verifier after submit, received 200 with matching CORS and
`no-store`, stayed locked, and showed a useful error.

Live responses include CSP, HSTS, `nosniff`, strict-origin referrer policy, and
`Permissions-Policy` disabling USB and serial access. HTML uses 30-second
revalidation; the fingerprinted JS/CSS use one-year immutable caching; the
service worker uses `no-cache`.

## PWA, rate limit, and performance

The live service worker activated, removed a seeded stale
`sideload-readiness-*` cache, completed `registration.update()` with no waiting
worker, and reloaded `/demo` offline with its sample visible. The source update
regression test also passed.

A 40-request same-client burst to the license-verification endpoint,
`GET /api/v1/products/sideload-readiness/verify`, returned 30 × 200 and
10 × 429. Every 429 included `Retry-After: 4`. The observed burst allowance was
30 requests in that window.

Production asset sizes are 21,726 bytes raw / 7,377 gzip JavaScript, 8,278 raw
/ 2,709 gzip CSS, and 69,354 bytes for the mobile hero. All are within budget.
Fresh mobile Lighthouse produced Performance 98, Accessibility 100, Best
Practices 100, and SEO 100, with FCP 997 ms, LCP 1,343 ms, TBT 155.5 ms, and
CLS 0. Lighthouse printed a browser-tab-crash message after writing the
complete JSON report; the report has no run warnings, and independent
Playwright/axe checks passed.

## Evidence

Primary machine-readable results and screenshots are under
`.factory/verification-evidence-11/`, including `verify-live.txt`,
`live-cold.json`, `live-demo-network.json`, `live-keyboard.json`,
`live-mobile.json`, `live-reduced-motion-zoom.json`, `live-pwa.json`,
`live-headers.json`, `license-rate-limit.json`, `live-license-flow.json`,
`live-links.json`, `release-download-summary.json`, and
`lighthouse-live.json`.
