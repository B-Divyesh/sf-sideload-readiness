# Independent verification 9

## Verdict: PASS

Candidate commit: `6ce78c6b2ab5477c0e60ed81f6189ef73cacba10`  
Live URL: <https://sideload-readiness.sociobot.in>  
Verification date: 2026-08-29 UTC

This was a fresh independent verification from the clean candidate checkout.
Product code was not changed. The previously reported deployment-only concern
is not present: the deployed site byte-matches this candidate's production
build.

## Mandatory gates

### First read: PASS

A cold desktop load and a 390 px load answer all three required questions in
the first screen:

- What it does: **“Check Android update safety.”**
- Who it is for: people maintaining approved sideloaded apps when device rules
  or recovery paths change.
- What to do first: **“Try it with sample data.”** The adjacent sentence says
  it will show a redacted report and the next safe step.

The action is visible without scrolling and opens `/?demo=1` in one click. It
immediately shows a realistic six-finding Android 15 sample report. The
persistent banner says “Demo — sample data, nothing is saved” and includes
**Reset demo** and **Start for real**. `/demo` is the direct sandbox URL.

### Claims: PASS (29/29 commands)

`.factory/claims.json` exists. Before other product QA, every listed `test`
command was run separately and exactly as declared from the clean checkout.
All returned zero:

- 14 CLI claims: demo report, JSON, redaction, read-only operations,
  unauthorized device, signer continuity and unreadable signer, complete
  diagnostics, example schema, device selection, no-adb demo, private
  automatic files, explicit replacement, and free single-device use.
- 6 browser claims: isolated demo storage, no device access, same-origin
  privacy, fleet review, license verification, and 24-hour license retention.
- 1 billing claim: hosted Sociobot checkout returned 303 to Dodo without a
  purchase; invalid-license verification returned its documented response.
- 8 installer/release claims: verified installer, platform matrix, manifest,
  Sigstore signatures, checksums, unsigned-platform disclosure, billing
  boundary, and published installer paths.

The repeated clean `npm ci` steps declared by browser claims also passed with
zero vulnerabilities. Landing, legal routes, README, and installer copy were
cross-checked against the claim list; no unlisted product claim was found.

## Clean install, tests, checks, and production builds: PASS

```text
npm ci                                      passed; 0 vulnerabilities
npm test                                    23 Node passed; 69 browser passed;
                                            1 expected project-only skip
npm run build                               passed; produced dist/site
cargo fmt --check                           passed
cargo clippy --all-targets --all-features
  -- -D warnings                            passed
cargo test --all-targets                    21 passed
cargo build --release                       passed
cargo package --allow-dirty                 passed; 16 files verified
```

The repository exposes no separate JavaScript lint or type-check script. The
Rust formatting and lint gates above are the available static checks. The exact
site build produced fingerprinted `app.f8177b06a761.js` and
`style.153fe0711a98.css`.

## CLI and clean-consumer exercise: PASS

The packaged crate was installed with `cargo install` into a fresh temporary
consumer root. Its public binary reported v0.1.4 and rendered useful `--help`.
Both explicit JSON and automatic Markdown demos completed:

```text
schema            sideload-readiness/v1
mode              demo
device id         device-6f31a0b2
score             83
findings          6 (5 ready, 1 needs-review)
recovery steps    5
automatic file    unpredictable regular file, mode 0600
```

Normal, boundary, invalid, and recovery behavior was exercised through the
public binary and its recording fake-adb integration:

- A complete authorized device report covered authorization, developer
  options, USB mode, storage, signer continuity, recovery visibility, and a
  checklist.
- The real AOSP v2-signed APK fixture matched its expected certificate. A
  different digest made the signer finding `blocked` and said it did not match.
- Free storage one KiB below the 1 GiB floor was `blocked` and reported the
  exact shortfall.
- An unauthorized device was refused with the authorization next step. Two
  authorized devices were refused until one was explicitly selected.
- A malformed signer digest exited 2 and requested 64 hexadecimal digits.
- A missing adb executable exited 2 and explained how to install
  platform-tools, connect one device, and accept USB debugging.
- An unwritable `/proc` output exited 2 and directed the user to an existing
  writable folder.
- Logged adb operations were limited to `devices`, `getprop`, `settings get`,
  `df`, `pm path`, and reading the installed base APK. No install, sideload,
  reboot, unlock, setting write, or upload command is exposed.

## Installers and published release: PASS

GitHub release v0.1.4 contains `latest.json`, `SHA256SUMS`, matching Sigstore
bundles, Linux tar/deb/rpm assets, macOS arm64/x64 tar/pkg assets, and a Windows
x64 zip. Homebrew, Scoop, shell, PowerShell, and winget-ready paths are present
and checksum-pinned where applicable.

The Linux archive was downloaded independently. Its calculated and published
SHA-256 values matched:

```text
1797f1b5a1ca905b749b495bd2fd3982c0c3b408dc3494aaeaf90507835888a0
```

The extracted released binary reported v0.1.4 and produced the same valid
six-finding JSON demo. All release payload and manifest signatures passed the
checksum-pinned Cosign verification claim. The page and README correctly say
the macOS package and Windows app do not have vendor signatures.

## Live identity, browser behavior, and accessibility: PASS

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed.
The deployed document, JS, CSS, service worker, and mobile hero byte-match the
local candidate build:

```text
/                                             738e357175f25cb7...
/assets/app.f8177b06a761.js                    f8177b06a76101b7...
/assets/style.153fe0711a98.css                 153fe0711a98b64e...
/service-worker.js                            b889d894e9e616ad...
/public/hero-concrete-moss-768.webp            d7593ebdf8f476af...
```

The complete 70-case browser matrix was rerun against the live URL: 69 passed
and one expected mobile-project-only skip. Independent live checks found:

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. An unknown
  path returns the designed page with HTTP 404.
- Each route has a specific title, one h1, `lang="en"`, a main landmark,
  image alternatives, and labeled controls.
- Axe reported zero serious or critical findings on home, demo, privacy,
  terms, and the missing route at desktop and mobile sizes.
- The factory `verify-url.sh` passed in 875 ms with zero console errors, one
  h1, a main landmark, no missing alt text, and no unlabeled buttons.
- Keyboard Tab first exposes **Skip to report**. Its 3 px blue outline has
  7.00:1 contrast against white. Enter opens the demo; Space activates reset;
  route changes restore focus to the h1.
- At 390×844, the primary sample action and its outcome are both in the first
  viewport. There is no horizontal overflow or visible target below 44 px.
- Reduced motion removes the finding animation. The report stays usable at
  200% text.
- All discovered internal and external links returned 2xx or the expected
  checkout 303. No unexpected console or page error occurred.

## Privacy, headers, PWA, and endpoint allowance: PASS

Fresh Playwright request logging across landing, demo entry, reset, reload,
privacy, and terms observed only the product origin. No analytics, tracking,
third-party script, font, or pixel loaded. Demo mode wrote only
`demo:sideload-readiness`; a real-data sentinel survived reset and exit, and
**Start for real** removed the demo key. Instrumented WebUSB and Web Serial
recorded zero access requests.

Production sends a restrictive CSP, HSTS, `nosniff`, strict-origin referrer
policy, and denies camera, microphone, geolocation, USB, and Serial. HTML uses
30-second revalidation, fingerprinted assets use one-year immutable caching,
and the service worker uses `no-cache`.

A seeded stale product cache was removed after unregister/re-registration.
Only `sideload-readiness-v4-48a6f04f4fff` remained, and `/demo` then reloaded
offline with the complete sample report.

The only server-side product call is the Sociobot license verifier. From one
client, requests 1–30 returned 200. Request 31 returned 429 with
`Retry-After: 3`. Observed allowance: **30 requests per window**. The product
has no sign-in and no other backend.

## Performance and budgets: PASS

Live mobile Lighthouse:

```text
Performance 96  Accessibility 100  Best practices 100  SEO 100
FCP 898 ms      LCP 1,310 ms        TBT 220 ms          CLS 0
Transfer 81,272 bytes
```

Built asset sizes are well below the contract limits:

```text
JavaScript   21,661 raw / 7,384 gzip
CSS           8,278 raw / 2,732 gzip
Mobile hero  69,354 bytes
```

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.

No physical Android handset was attached in this disposable verifier. Device
paths were exercised with the recording fake adb and real signed-APK fixture,
including normal, threshold, malformed, blocked, unauthorized, and
multi-device cases. This is an environment limitation, not a product defect.

Evidence is committed under `.factory/verification-evidence-9/`, including
cold desktop/mobile captures, a demo mobile capture, the factory URL report,
and the live Lighthouse JSON.
