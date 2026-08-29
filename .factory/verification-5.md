# Independent verification 5 — FAIL

**Candidate:** `1864d360df809cd87b823f1ef31ed44aabd609cf` (`main`)

**Production URL:** <https://sideload-readiness.sociobot.in>

**Verified:** 2026-08-29 from the supplied clean checkout

## Release decision

**FAIL.** The required first-read gate and all 20 declared claim commands pass.
The CLI's real signer extraction repair works, the live site byte-matches the
candidate build, the release assets and Sigstore bundles verify, and the main
web quality gates pass. However, the live detected-download action sends an
Intel Mac to the arm64 package, and the mandatory CLI demo writes to a
predictable temporary filename while following pre-existing symbolic links.
Those are release-blocking installer and local-file-safety failures.

The mobile landing and paid fleet states also contain controls below the
required 44 px touch height.

No product code was changed during this verification.

## First-read gate

Pass at both 1440 × 900 and 390 × 844. A cold first screen says:

- What: “Check Android update safety.”
- Who: people maintaining approved sideloaded apps when device rules or
  recovery paths change.
- First action: “Try it with sample data,” beside “See a redacted report and
  the next safe step.”

The action is fully visible at 390 px (y=442.31–490.63; the outcome ends at
y=527.98). One click opens `/demo`, immediately shows the sample report, and
displays “Demo — sample data, nothing is saved” with Reset demo and Start for
real. Screenshots are in `.factory/evidence/first-read-desktop.png` and
`.factory/evidence/first-read-mobile.png`.

## Mandatory claims gate

`.factory/claims.json` exists with 20 valid entries. Before broader QA, every
listed `test` command was run exactly as written. **20/20 passed.** The first
browser claim's declared `npm ci` installed its clean-clone prerequisite.

| Claim group | Result |
| --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `signer-continuity`, `device-selection`, `demo-no-adb`, `single-device-free` | 9/9 pass |
| `local-demo`, `privacy`, `fleet-review`, `license-verification`, `license-retention` | 5/5 pass |
| `fleet-checkout` | Pass; checkout returned 303 to hosted Dodo and invalid verification returned 200 |
| `verified-installer`, `platform-packaging`, `release-manifest`, `release-signatures`, `published-installer-paths` | 5/5 pass |

The passing claims do not cover the Intel Mac asset choice, collision-safe
temporary-file creation, or all mobile touch targets.

## Clean install, tests, lint, build, and package

```text
npm ci                                      pass; 6 packages, 0 vulnerabilities
npm test                                    pass; 17 Node tests, 43 Playwright pass, 1 intentional skip
npm run build                               pass; dist/site produced
cargo fmt --all -- --check                  pass
cargo clippy --all-targets --all-features -- -D warnings
                                            pass
cargo test --all-targets                    pass; 4 unit + 13 CLI integration
cargo build --release                       pass
cargo package --locked                      pass; 16 files, 95.5 KiB (29.8 KiB compressed)
sh -n site/install.sh                       pass
node --check site/app.js and build scripts  pass
git diff --check                            pass
```

There is no separate TypeScript or JavaScript lint/typecheck script. The Node
suite exercises the build, release metadata, installer fixtures, site
contract, and browser behavior.

## CLI and clean-consumer exercise

The packaged crate was installed into a fresh temporary Cargo root. The
installed binary reported `sideload-readiness 0.1.3`, exposed useful `--help`
and `check --help`, and emitted a parseable `sideload-readiness/v1` demo report
with six findings, five recovery steps, and a redacted `device-…` ID.

Representative paths passed through the public binary or integration suite:

- official AOSP v2-only signed APK: signer SHA-256 extracted through read-only
  `pm path` and `exec-out cat`; correct digest was `ready`, wrong digest was
  `blocked`, and `dumpsys` was not used;
- one authorized device and 4,000,000 KiB free: report generated normally;
- one KiB below the 1 GiB floor: `blocked` with the exact one-KiB shortfall;
- unreadable APK: `needs-review`, never `ready`;
- unauthorized device, unknown selected device, and multiple authorized
  devices without `--device`: exit 2 with a next step;
- missing adb, malformed signer, signer without `--package`, and unwritable
  output: exit 2 with direct recovery guidance.

The v0.1.3 release's Linux tarball matched `SHA256SUMS`; the live shell
installer installed it in an isolated home, and its binary completed the demo.

## Live site, privacy, accessibility, and PWA

- `BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`
  passed 43 applicable cases with one intentional project skip.
- `node scripts/verify-live.mjs` proved byte identity for the local production
  index, fingerprinted JS/CSS, service worker, and mobile hero. `/`, `/demo`,
  `/privacy`, and `/terms` return 200; the designed missing route returns 404.
- `/opt/fleet/lib/verify-url.sh` passed in 645 ms with `lang=en`, one `h1`, a
  main landmark, complete image alternatives, labeled buttons, and no console
  errors. Evidence is in `.factory/evidence/verify-url/`.
- Axe found zero serious/critical findings on all routes in desktop and mobile
  Chromium. Keyboard-only tabbing reached the skip link, header navigation,
  and sample action; each showed a 3 px blue outline. Route navigation focused
  the new `h1`. Reduced motion and 200% text worked without horizontal overflow.
- A fresh demo/reset/exit flow requested only same-origin documents, JS, CSS,
  and the local hero. It used only `demo:sideload-readiness`; Start for real
  removed that key. There were no console or page errors.
- License verification made no request until submit, then sent the fixture
  token only to the documented Sociobot endpoint. The response used
  `Cache-Control: no-store` and exact-origin CORS. The site has no analytics or
  third-party runtime code.
- A seeded stale service-worker cache was deleted on activation. `/demo` then
  reloaded offline with its report and demo banner.
- Live headers include HSTS, `nosniff`, strict-origin referrer policy, a
  restrictive permissions policy, and a CSP limited to self plus GitHub and
  Sociobot API connections. Documents revalidate after 30 seconds,
  fingerprinted assets use one-year immutable caching, and the service worker
  uses `no-cache`.

This product has no sign-in, so the Microsoft Entra External ID requirement is
not applicable. It has no first-party backend; the paid-unlock endpoint is the
only server API used by the product.

## Performance

Fresh Lighthouse 12.8.2 mobile simulated-throttling results:

```text
Performance 95 | Accessibility 100 | Best Practices 100 | SEO 100
FCP 1.033 s | LCP 1.327 s | CLS 0 | TBT 256 ms
```

Static budgets pass:

```text
JavaScript  17,954 bytes / 6,382 gzip
CSS          8,091 bytes / 2,684 gzip
mobile hero 69,354 bytes
OG image   125,402 bytes (1200 × 630)
```

The Lighthouse report is `.factory/evidence/lighthouse.json`.

## Billing allowance

The checkout endpoint returned HTTP 303 to a hosted Dodo session; no purchase
was made. In a fresh rapid invalid-license sequence from one client, requests
1–30 returned 200. Request 31 returned **429** with `Retry-After: 2`, and
requests 31–45 remained throttled. The observed allowance is 30 requests per
client window.

## Release and deployment identity

Release `v0.1.3` contains `latest.json`, `SHA256SUMS`, Linux tar/deb/rpm,
macOS arm64/x64 tar/pkg, Windows x64 zip, and a Sigstore bundle for each of the
ten release files. Fresh Cosign 3.1.3 verification passed every file against
GitHub's OIDC issuer and this repository's `release.yml`/`sign-release.yml`
identities. Release workflow run `33262137528` and cross-platform consumer
smoke run `33262676960` both report success.

The release tag dereferences to
`c3ddd1c34016f1042f8ba620983da1f5290abc2a`, an ancestor rather than the
candidate. `src/`, `Cargo.toml`, `Cargo.lock`, and `examples/` are identical
between that tag and the candidate. The candidate's deployable site output
matches production byte-for-byte:

```text
/                                                ee3a2c1771f86ba8693fa3d24c845930bb846237c7005ce7a5ec54dc1c90a532
/assets/style.964ecf3b4323.css                   964ecf3b43236085dba00d2c1c24054f13833c58a6c91994710504cd30df8feb
/assets/app.3d7a4379a740.js                      3d7a4379a740990ed4b2638522c1ac0005e21b67644b9e5f077acc15d26d7305
/service-worker.js                               213746a9c607ab3330e4552639c2a22eac420afbdffdb9044f4238bcead274b4
/public/hero-concrete-moss-768.webp              d7593ebdf8f476aff62c0697bc064cdb87b6f8c14f224ee998933de7c0bb7718
```

Native Apple notarization and Windows Authenticode remain unavailable, as the
README states. Every artifact does have verified Sigstore provenance. The
attached installer contract permits documented unsigned native packages, so
this is not an additional verifier blocker.

## Defects

### P1 — detected download gives Intel Macs the arm64 package

The live `fetchDownload` logic reduces the user agent to `windows`, `macos`,
or `linux`, then chooses the first asset whose filename contains that token.
It never determines macOS architecture. The v0.1.3 API lists the arm64 `.pkg`
before the x64 package.

With a standard Intel Mac Chrome user agent, one activation selected:

```text
sideload-readiness-macos-aarch64.pkg
```

The Apple Silicon user agent selected the same file. Thus the required
one-click detected action delivers an incompatible executable to Intel Macs,
despite x64 being an explicit supported release target. The current browser
test covers only Windows and Linux fixture UAs.

Select architecture reliably (or present an explicit macOS architecture
choice before download), handle Android/iOS/unknown clients without defaulting
to Linux x64, and add live-shaped tests for Intel Mac, Apple Silicon, Windows,
Linux, and unsupported mobile clients.

### P1 — demo can overwrite a pre-existing file through a predictable temp path

With no `--output`, the mandatory demo writes:

```text
<system temp>/sideload-readiness-demo-<unix-seconds>.md
```

It uses `fs::write`, so the name is predictable, collisions overwrite, and a
pre-existing symbolic link is followed. In an isolated `TMPDIR`, the verifier
created links for the current and adjacent seconds to `victim.txt`, then ran
the clean-consumer binary. It printed:

```text
Wrote .../sideload-readiness-demo-1788022319.md
```

`victim.txt` changed from an empty file to the 1,594-byte readiness report.
Cross-user symlink protection on some operating systems reduces one attack
path but does not make the creation collision-safe or portable.

Create an unpredictable private directory/file atomically, reject an existing
target (`create_new`/no-follow semantics), and test collision and symlink
cases. Keep explicit `--output` overwrite behavior separate and documented.

### P2 accessibility — landing and paid controls miss the 44 px touch target

At 390 px, the live landing page has these visible interactive heights:

```text
Linux and macOS installer link   24.3125 px
PowerShell installer link        24.3125 px
paid fleet file input            36 px
```

The first two fail in the default landing state; the third appears after a
valid cached fleet verdict. The automated touch-target check visits only
`/demo`, where those controls are absent. Extend the 44 px styling and run the
mobile target audit on landing, demo, legal pages, and the unlocked fleet
state.

## Retest priorities

1. Verify one-click downloads with real release-shaped metadata for both
   macOS architectures and unsupported/mobile user agents.
2. Install the packaged CLI into a clean consumer and prove the default demo
   creates an exclusive unpredictable path under collision and symlink tests.
3. Audit every visible interactive element at 390 px, including the unlocked
   paid state.
4. Rerun all 20 claim commands, full local gates, release signature/checksum
   verification, live byte identity, offline update/reload, Lighthouse, and
   the 30-request API allowance test.
