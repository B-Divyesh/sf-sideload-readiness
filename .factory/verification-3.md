# Independent verification 3 — FAIL

**Candidate:** `1cbc9e0d7c4573ef91192088f9b8b2973fdfa78b` (`main`)

**Production URL:** <https://sideload-readiness.sociobot.in>

**Verified:** 2026-08-29 from the supplied clean checkout

## Release decision

**FAIL.** The deployment is healthy and the normal automated suites pass after
dependency installation, but the candidate does not meet the acceptance
contract. The phone first screen clips the required demo action, the CLI gives
contradictory and incomplete signer evidence, and it silently checks the first
of multiple authorized devices. The documented Homebrew command also points to
a repository that does not exist. In addition, four required claim commands
failed when invoked in the untouched clean clone exactly as ordered.

No product code was changed during this verification.

## First-read test

### Desktop

Pass at 1440 × 900. A cold visitor can answer all three questions without
scrolling:

- What: “Check Android update safety.”
- Who: people maintaining approved sideloaded apps when device rules or
  recovery paths change.
- First action: “Try it with sample data,” followed by “See a redacted report
  and the next safe step.”

The action opens `/demo` in one click and immediately shows the sample report.

### Mobile

**Fail at 390 × 844.** The CTA begins at CSS y=816.31 and ends at y=864.63,
below the 844 px viewport. Only its upper edge is visible; its label is clipped.
The user must scroll before the required first action is usable. Evidence:
`.factory/verification-evidence-3/live-first-read-mobile.png`.

The headline and audience sentence are plain and understandable. The failure
is placement: the hero image is ordered before them on mobile and pushes the
primary action below the first screen.

## Mandatory claims gate

`.factory/claims.json` exists with 16 entries. I invoked every listed `test`
command before installing dependencies, as the work order explicitly requires.

| Claim group | Initial clean-clone result |
| --- | --- |
| Seven Rust CLI claims | 7/7 pass |
| `local-demo`, `privacy`, `fleet-review`, `license-verification` | **0/4 fail**: `ERR_MODULE_NOT_FOUND`, package `@playwright/test` |
| `fleet-checkout` | pass; checkout HTTP 303 to Dodo and invalid verify HTTP 200 |
| Four Node release/installer claims | 4/4 pass |

Initial total: **12 passed, 4 failed, 16 total.** Under the stated rule that
any failing claim test is release-blocking, this is a blocking result. After
the required `npm ci` install step, I reran every entry and got **16/16 pass**.
That confirms the assertions themselves pass in a prepared environment, but it
does not erase the mandated untouched-clone gate result.

## Clean install, tests, and builds

The normal install-first workflow passed:

```text
npm ci                                      pass; 6 packages, 0 audit findings
npm test                                    pass; 12 Node tests, 35 Playwright pass, 1 intentional skip
npm run build                               pass; dist/site produced
cargo fmt --check                           pass
cargo clippy --all-targets -- -D warnings   pass
cargo test                                  pass; 3 unit + 8 integration tests
cargo build --release                       pass
cargo package --allow-dirty                 pass; packaged and verified
```

Supplemental `sh -n`, JavaScript syntax checks, Cargo metadata, and YAML lint
for both workflows, nfpm, and winget manifests also passed. No separate
TypeScript or lint script exists in `package.json`.

## CLI and clean-consumer exercise

I installed the packaged crate into a fresh temporary root. The installed
v0.1.1 binary had useful `--help`, generated a parseable six-finding demo JSON
report with a `device-…` identifier and five recovery steps, and returned exit
2 with a concrete next step when `adb` was missing. An unwritable output path
also returned exit 2.

Representative live-check fixtures produced these results:

- Normal authorized Android 15 device, 3.8 GiB free, USB `mtp,adb`, developer
  options enabled, and package output containing a known SHA-256 signer:
  report score 83, overall “Ready,” signer status `ready`.
- Boundary device with 0.5 GiB free, charging-only USB, developer options off,
  no signer, and no A/B update flag: score 17, storage `blocked`, other affected
  checks `needs-review`, and actionable recovery text.
- Unauthorized device: exit 2 with “no authorized device was found” and a next
  step.
- Missing `adb`: exit 2 with the startup failure and a next step.
- Two authorized devices: exit 0 and a report for the first device, with no
  refusal, choice, or warning.

The normal signer result exposes a release-blocking defect. Despite recognizing
the fixture's `SigningInfo`, the exported finding was exactly:

```json
{
  "status": "ready",
  "detail": "Signer details were not visible for the selected package.",
  "next_step": "Run again with `--package com.example.app` and compare its signer with the approved APK."
}
```

The known signer fingerprint was absent from the report. There is also no CLI
input for an approved APK or expected signer, so signer continuity cannot be
checked. The current claim only tests a boolean substring and misses both the
contradiction and the missing core result.

## Live site, privacy, accessibility, and PWA

- `/`, `/demo`, `/privacy`, and `/terms` return 200. The designed unknown route
  returns HTTP 404. Every rendered route has one `h1` and the expected title.
- Axe found zero serious/critical issues on all real routes and the 404 on both
  desktop Chromium and the 390 px mobile project.
- Keyboard tests reached the skip link, demo action, and reset control; route
  changes restored focus. Focus uses a visible 3 px outline. There were no
  keyboard traps.
- Reduced motion removed finding animation/transition. The report remained
  usable at 200% text. Visible mobile controls met 44 px targets and there was
  no horizontal overflow.
- Cold landing and the complete demo flow made only same-origin requests. The
  demo used only `demo:sideload-readiness` local storage. No console or page
  errors occurred.
- A returned `?license=qa-return-invalid` token was stored under
  `sb_license:sideload-readiness`, removed from the URL, and sent only to the
  documented Sociobot verification endpoint. The invalid response was shown
  without a console error.
- The service worker activated; `/demo` reloaded offline with its report. The
  worker has `Cache-Control: no-cache`; fingerprinted JS/CSS use
  `public, max-age=31536000, immutable`.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and a CSP limited to self plus the declared
  GitHub and Sociobot API connections.
- `verify-url.sh` passed: HTTP 200, 678 ms observed load, title, `lang=en`, one
  `h1`, main landmark, complete image alternatives, labeled buttons, and no
  console errors.
- A fresh Lighthouse mobile report scored Performance 94, Accessibility 100,
  Best Practices 100, and SEO 100; LCP 1.366 s, CLS 0, TBT 294 ms, FCP 0.987 s.
  Lighthouse emitted a post-collection tab-crash diagnostic, so these numbers
  are supporting evidence rather than the sole quality gate.
- Built assets are well under budget: JS 15,746 bytes / 5,608 gzip; CSS 8,153
  bytes / 2,718 gzip; mobile hero 69,354 bytes.

This product has no sign-in, so the Entra External ID requirement is not
applicable.

## Deployment identity

The production `index.html`, fingerprinted JS, fingerprinted CSS, service
worker, and mobile hero byte-match the local production build at the candidate.
The published v0.1.1 tag dereferences to ancestor commit
`9e7f0e64c620ea5935e4c473f4310bd7bbca6435`, not the candidate, but `src/`,
`Cargo.toml`, and `Cargo.lock` are identical between that release commit and
the candidate. Thus the published binary exercises the candidate's exact CLI
source, while the static deployment exercises the candidate's exact site
output.

## Installer and release verification

- The live `install.sh` succeeded in a clean temporary HOME, selected the
  Linux x86_64 v0.1.1 archive, verified SHA-256, and installed a working binary.
- An independent download of the Linux tarball matched `SHA256SUMS` at
  `8ca68826ad662f4cc4b2e6d7f2a235e05a3f2cfb4c9be97a3ca152e5c602bb98`.
- `latest.json` has absolute URLs for Linux, macOS arm64/x64, and Windows.
- Fresh Cosign verification passed for all ten non-bundle release assets using
  GitHub's OIDC issuer and the repository release/sign-release workflow
  identity.
- Linux tar/deb/rpm, macOS arm64/x64 tar/pkg, and Windows zip assets exist.
- The documented Homebrew tap repository
  `B-Divyesh/homebrew-sideload-readiness` returns GitHub API HTTP 404, so the
  advertised `brew install B-Divyesh/sideload-readiness/sideload-readiness`
  command cannot work. Winget is explicitly only prepared for submission.

## Server endpoint allowance

The public license verification endpoint enforced an observed allowance of
**30 requests per client window**. Requests 1–30 returned HTTP 200; request 31
returned HTTP 429 with `Retry-After: 4` and `X-RateLimit-After: 4`. The checkout
endpoint returned HTTP 303 to the hosted Dodo checkout. No purchase was made.

## Defects

### P1 — phone first screen hides the required demo action

At 390 × 844, the primary action extends from y=816.31 to y=864.63. Its label
is clipped by the viewport and the user must scroll to use it. This violates
the explicit first-read acceptance gate for a one-click sample action on the
first screen. Move or reduce the mobile hero art so the complete action and its
outcome text are visible without scrolling.

### P1 — signer evidence is contradictory and cannot establish continuity

`connected_report` sets the signer status to `ready` when `dumpsys` contains
`SigningInfo` or `signatures=`, but it always emits “Signer details were not
visible.” It discards the signer fingerprint and has no approved-APK or
expected-signer input. This fails the researched core job of checking signer
continuity and can label a safety check ready without usable evidence. Export a
stable certificate digest and compare it with explicit approved signer input;
never report `ready` when the detail says the evidence is unavailable.

### P1 — multiple authorized devices silently produce a report for the first

With two `device` rows in `adb devices`, the CLI exits 0 and selects the first
serial. It neither refuses ambiguity nor offers a serial selector. A support
operator can therefore act on a report for the wrong phone. Require exactly one
authorized device or add an explicit device selector whose output remains
redacted.

### P1 — required Homebrew install command is not publishable as documented

The README advertises
`brew install B-Divyesh/sideload-readiness/sideload-readiness`, but the implied
GitHub tap repository returns HTTP 404. The installer contract requires the tap
to exist. Publish the formula to `B-Divyesh/homebrew-sideload-readiness` and
exercise the documented command on a clean macOS runner.

### P1 — four listed claim tests fail in the mandated untouched-clone gate

Before dependency installation, all four Playwright claim commands fail to
import `@playwright/test`. They pass after `npm ci`, but the work order states
that every listed command must pass from the clean clone before other work and
that any failure blocks release. Make the claim gate self-bootstrapping or make
the required bootstrap part of each executable claim command.

### P2 — multiple release channels are prepared but not actually available

Winget is documented as awaiting submission, and the Scoop manifest lives in
`scoop-bucket/` inside the source repository rather than a published bucket.
The direct PowerShell installer and Windows release zip exist, but the brief's
brew/winget/scoop distribution set is incomplete. Publish and verify those
channels before calling the installer product complete.

### P2 — output-write failure lacks a recovery action

An output path whose parent does not exist returns exit 2 and names the OS
error, but unlike the missing-adb path it gives no next step. Add a short action
such as choosing an existing writable folder, consistent with the error-copy
contract.
