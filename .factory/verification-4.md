# Independent verification 4 — FAIL

**Candidate:** `60d0a00e4b2d9c5c82cf212e4af3d9b0c7a1da86` (`main`)

**Production URL:** <https://sideload-readiness.sociobot.in>

**Verified:** 2026-08-29 from the supplied clean checkout

## Release decision

**FAIL.** The live site byte-matches the candidate, the mandatory first-read
gate passes, all 19 declared claim commands pass, the automated suites pass,
and the v0.1.2 release is complete and cryptographically verifiable. However,
the product does not complete its central real-device job: stock Android's
`dumpsys package` output does not contain the SHA-256 certificate digest that
the CLI parser and test fixture assume. A normal device therefore cannot
produce the promised signer-continuity comparison.

The privacy page also makes an unlisted, false one-day retention promise.
Either issue blocks acceptance under the supplied contract. Additional
medium- and low-severity defects are listed below.

No product code was changed during this verification.

## First-read gate

### Desktop, 1440 × 900

Pass. The cold first screen answers all three required questions in plain
words without scrolling:

- What: “Check Android update safety.”
- Who: people maintaining approved sideloaded apps when device rules or
  recovery paths change.
- First action: “Try it with sample data,” next to “See a redacted report and
  the next safe step.”

### Mobile, 390 × 844

Pass. The sample action occupies y=442.31–490.63 and the outcome ends at
y=527.98. Both are fully visible in the first viewport. There is no horizontal
overflow.

The action opens `/demo` in one click and immediately shows six realistic
findings, the redacted sample device, recovery steps, and the persistent
“Demo — sample data, nothing is saved” banner with Reset and Start for real.

## Mandatory claims gate

`.factory/claims.json` exists. Before broader QA, every listed command was run
exactly as written. All 19 commands passed from the supplied clean checkout.
The four browser commands each performed their declared `npm ci` bootstrap.

| Claim | Result | Evidence |
| --- | --- | --- |
| `demo-report` | Pass | Six findings, redacted ID, recovery checklist |
| `json-report` | Pass | Valid `sideload-readiness/v1` JSON |
| `redacted-id` | Pass | Known adb serial absent from export |
| `read-only-checks` | Pass | Logged adb allowlist and public help |
| `unauthorized-device` | Pass | Exit 2 and next step |
| `signer-continuity` | **Test passes; real-world claim fails** | The test uses a non-stock package-dump line; see P1 |
| `device-selection` | Pass | Ambiguity refused; explicit selection redacted |
| `demo-no-adb` | Pass | Missing adb ignored in demo; temp report written |
| `single-device-free` | Pass | Demo succeeds without account/license |
| `local-demo` | Pass | Only `demo:sideload-readiness` is written |
| `privacy` | Pass | Declared demo flow has only same-origin requests |
| `fleet-review` | Pass | Cached fixture verdict enables local queue/table |
| `license-verification` | Pass | Token sent only to the expected Sociobot URL after submit |
| `fleet-checkout` | Pass | HTTP 303 to hosted Dodo; invalid verify HTTP 200 |
| `verified-installer` | Pass | Linux/macOS fixture archives verified and installed |
| `platform-packaging` | Pass | Required workflow matrix/output assertions |
| `release-manifest` | Pass | Absolute URLs for all four platform entries |
| `release-signatures` | Pass | OIDC/Cosign workflow assertions |
| `published-installer-paths` | Pass | Live shell, PowerShell, Homebrew, and Scoop paths |

The declared test for `signer-continuity` is not a valid proof of the claim.
It supplies `APK contents signer SHA-256 digest: …` as fake output from
`adb shell dumpsys package`. That text is associated with `apksigner`, not
stock `dumpsys package`; the P1 reproduction below uses AOSP's actual format.

The sentence “The license result stays in this browser for up to one day” on
`/privacy` has no entry in `claims.json`. It is therefore an unlisted claim,
and the independent outage test also showed it is false.

## Clean install, tests, lint, and builds

```text
npm ci                                      pass; 6 packages, 0 vulnerabilities
npm test                                    pass; 14 Node, 37 Playwright, 1 intentional project skip
npm run build                               pass; dist/site produced
cargo test --all-targets                    pass; 4 unit + 12 integration
cargo fmt --all -- --check                  pass
cargo clippy --all-targets --all-features -- -D warnings
                                            pass
cargo build --release                       pass
cargo package --allow-dirty                 pass; package created and verified
```

There is no separate TypeScript or JavaScript lint/typecheck command. Node's
test runner exercises the build scripts, release metadata, installer logic,
and site contract.

## CLI and clean-consumer exercise

The generated crate was installed with `cargo install --path` into an isolated
temporary root. The installed binary reported v0.1.2, had useful `--help`, and
produced a parseable demo report containing schema `sideload-readiness/v1`, six
findings, five recovery steps, and a redacted device ID.

Observed recovery behavior:

- Missing adb: exit 2, names the startup error, and tells the user to install
  platform-tools, connect one device, and accept USB debugging.
- Expected signer without `--package`: exit 2 with Clap's required-argument
  guidance.
- Invalid signer digest: exit 2 and asks for a 64-digit SHA-256.
- Unknown `--device`: exit 2 and explains how to authorize/select the device.
- Unauthorized and multiple-device paths passed their integration cases.
- Unwritable output passed its integration case with an actionable next step.

### Realistic signer reproduction

The CLI runs:

```text
adb -s SERIAL shell dumpsys package com.example.approved
```

Its parser requires a 64-hex digest on a signer-related line. Current AOSP's
`PackageSignatures.toString()` instead prints `Signature.hashCode()` with
`Integer.toHexString`, yielding output shaped like:

```text
signatures=PackageSignatures{fcb6cf2 version:3,
  signatures:[9a25705e], past signatures:[]}
```

Official source inspected:
<https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/services/core/java/com/android/server/pm/PackageSignatures.java>

Using that AOSP-shaped output with a valid expected 64-digit signer produced:

```json
{
  "status": "needs-review",
  "detail": "No stable SHA-256 signer certificate digest was visible for the selected package."
}
```

Thus the command accepts an expected approved digest but cannot obtain the
installed digest from the stock command it invokes. The normal success case
in the test suite is synthetic and cannot establish the claimed real-device
outcome.

### Storage boundary

Exactly 1,048,576 KiB free was `ready`. At 1,048,575 KiB, the finding was
`blocked`, but both values rendered as “1.0 GiB free … the safety floor is
1.0 GiB.” The threshold decision is safe, but the rounded evidence does not
explain the blocked result.

## Live site, privacy, accessibility, and PWA

- `/`, `/demo`, `/privacy`, and `/terms` return 200. A tested unknown route
  returns HTTP 404 with the designed page.
- Every tested route has one `h1`, a route-specific title, `lang=en`, and a
  main landmark. Images have alt text and buttons have accessible names.
- Axe found zero serious/critical findings on all real routes and the 404 in
  desktop and mobile projects.
- Keyboard navigation reaches the skip link, demo action, and reset control.
  Keyboard focus on Reset shows a 3 px `rgb(11, 90, 162)` outline. There is no
  keyboard trap.
- Reduced motion yields `animation-name: none` and a 0.01 ms transition. The
  report remains usable at 200% text.
- All visible controls on the 390 px demo meet the 44 px touch target and the
  page has no horizontal overflow.
- The cold landing-to-demo flow made only same-origin GET requests, wrote only
  `demo:sideload-readiness`, and logged no console or page errors.
- Empty license input gives a direct correction. An invalid token is sent only
  to `https://api.sociobot.in/api/v1/products/sideload-readiness/verify` and
  produces a clear inactive-license result.
- The service worker activates, removes old versioned shells according to its
  tested update policy, and reloads `/demo` offline with the report intact.
- `verify-url.sh` passed: HTTP 200, 673 ms observed load, title, language,
  heading, main, alt, label, screenshot, and console checks.

Live document headers include:

```text
Content-Security-Policy: default-src 'self'; connect-src 'self'
  https://api.github.com https://api.sociobot.in; ...;
  frame-ancestors 'none'
Strict-Transport-Security: max-age=10886400; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

The document uses a 30-second revalidation cache. Fingerprinted JS/CSS are
`public, max-age=31536000, immutable`; the service worker is `no-cache`.

This product has no sign-in, so the Microsoft Entra External ID requirement is
not applicable. No AI feature is needed for this deterministic diagnostic.

## Performance

```text
JavaScript                           15,852 bytes / 5,662 gzip
CSS                                   8,144 bytes / 2,710 gzip
mobile hero                           69,354 bytes
event-timing duration for demo click       32 ms
```

A fresh mobile Lighthouse collection produced Performance 96, Accessibility
100, Best Practices 100, SEO 100, LCP 1.293 s, CLS 0, and TBT 220 ms. Chromium
crashed during Lighthouse's final full-page screenshot, after the audits were
recorded; these scores are supporting evidence. All static bundle/image
budgets pass. The observed interactive event duration is below the 200 ms INP
budget; field INP is not available for this new deployment.

## Billing endpoint allowance

The hosted checkout returned HTTP 303 to
`checkout.dodopayments.com`; no purchase was made. An invalid verification
returned HTTP 200 with `{valid:false, reason:"invalid"}`.

The verification API enforced an observed allowance of **30 requests per
client window**. Requests 1–30 returned 200. Request 31 returned **429** with
`Retry-After: 3`.

## Deployment and release identity

The live production bytes match this candidate's local production build:

```text
/                                             ea72c84d56f75d79049051070732e7a41f4b1adbca132a02b7ebf13a062b3701
/assets/style.885182afe6e8.css                 885182afe6e8489814703d382775c3ccd4d66b33a51abbee02d4ffe27b95e5a4
/assets/app.2a460400b840.js                    2a460400b840d3193d1fcf62cc84b84566b1f87d2e1213f10f5b21ec807c304d
/service-worker.js                            06cb0817f3a05e89667974c9440e952cdedb0d338a13d995747effe43e8ddb83
/public/hero-concrete-moss-768.webp            d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718
```

Release v0.1.2 points to commit
`5d864c1750e4e384b28b58fdf62c0a8515be0e03`. `src/`, `Cargo.toml`, and
`Cargo.lock` are byte-identical between that tag and the candidate.

The release contains Linux tar/deb/rpm, macOS arm64/x64 tar/pkg, Windows zip,
`SHA256SUMS`, `latest.json`, and a Sigstore bundle for every asset. The Linux
tarball independently matched SHA-256
`4c23202bf68eab5dbaac6801200e7d8d7cabd3d6373d2ab2cab6ef66aeef2178`,
then ran the v0.1.2 demo successfully. Fresh Cosign 3.1.3 verification passed
for all ten non-bundle assets against GitHub's OIDC issuer and the repository's
release/sign-release workflow identities.

GitHub reports release workflow run `33259098974` and cross-platform published
installer smoke run `33259631978` successful. The latter exercised the live
shell installer, PowerShell installer, Homebrew tap, and Scoop bucket on hosted
Linux, macOS, and Windows runners.

## Defects

### P1 — core signer-continuity check cannot work with stock Android output

`extract_signer_sha256` searches the output of `dumpsys package` for a 64-hex
certificate digest. Stock AOSP emits only each signature object's short Java
hash code. The suite's passing claim test invents an `apksigner`-style SHA-256
line and therefore does not model the public command being invoked. A normal
authorized device with an installed approved package remains `needs-review`
instead of producing the promised match/mismatch. This breaks a defining part
of the researched job and the `signer-continuity` claim.

Obtain the installed APK path with a read-only package-manager query, read or
pull the APK without modifying the device, derive the certificate digest with
a real APK-signing parser, and compare it with `--expected-signer`. Add a test
fixture captured from stock Android rather than a made-up digest line.

### P1 contract — privacy retention promise is unlisted and false

`/privacy` says, “The license result stays in this browser for up to one day.”
There is no matching `claims.json` entry. The code never expires or deletes
the verdict. It merely attempts reverification after 24 hours. With a cached
valid verdict dated 48 hours earlier and the verify request unavailable, the
old verdict remained in localStorage and fleet tools stayed active. Remove or
correct the sentence and add a claim test for the chosen retention behavior.

### P2 — imported fleet report fields are rendered as HTML

The paid queue interpolates imported JSON values into `innerHTML` without
escaping or schema validation. A report whose `device.id` contained an anchor
created a live external link inside the package-status table and was persisted
unchanged. The CSP blocked straightforward inline script execution, but a
report can still forge stored UI. Invalid JSON is silently ignored with no
announced reason or recovery step. Render imported values with `textContent`,
validate field types/ranges/redaction, and announce rejected files.

### P2 — Start for real does not discard demo data

After selecting Start for real, the browser returned to `/` but
`demo:sideload-readiness` still contained the full sample report. This violates
the demo-sandbox lifecycle requirement that leaving demo discards demo data.
Clear the demo namespace when leaving or offer the explicit keep choice.

### P2 — storage evidence contradicts the boundary result

At one KiB below the 1 GiB floor, status is correctly `blocked`, but the detail
rounds the value to “1.0 GiB” beside a “1.0 GiB” floor. Show enough precision
or state the shortfall so the user can understand the block without guessing.

### P2 — primary platform download requires two selections

The initial control says “Open release downloads” and points at the generic
GitHub Releases page. Its first activation is prevented, fetches metadata, and
changes the control to a Linux `.deb`; the status then says “Select download
again.” The resulting asset is real and checksummed, but this is not the
installer contract's one-step, OS-detected landing action. Resolve the platform
before the first activation or expose the actual one-line installer command.

### P3 — crate packaging is polluted after the documented Node install

After `npm ci`, plain `cargo package --list` exits 101 because broad include
patterns match ignored `node_modules` README/LICENSE files as dirty package
inputs. `cargo package --allow-dirty` succeeds and the released binaries are
unaffected. Anchor the top-level README/LICENSE patterns or exclude
`node_modules` so the ready-to-package command works after the documented
development sequence.

### P3 — server 404 copy breaks the plain-words rule

The static 404 uses “404 / concrete edge” and “The report path has ended.”
Those are product lore/metaphor rather than actionable labels. The SPA's own
missing-page copy is plain; use it for the server 404 as well.

## Retest priorities

1. Capture real `dumpsys package` output from supported Android versions and
   prove an installed signer match and mismatch end to end.
2. Add and run a claim test for the corrected license-retention statement.
3. Add hostile/invalid fleet-file cases and demo-exit storage cleanup tests.
4. Rerun all 19 existing claim commands, full local gates, live byte identity,
   release checks, and the endpoint allowance test.
