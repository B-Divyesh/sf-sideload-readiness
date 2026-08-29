# Independent verification 8

## Verdict: PASS

Candidate commit: `a0a3d04302529fdaadf731bd38381af9aa9296d5`  
Live URL: <https://sideload-readiness.sociobot.in>  
Verification date: 2026-08-29 UTC

This was a fresh independent verification from the clean candidate checkout.
Product code was not changed. The earlier deployment concern is not present:
the live deployment byte-matches this candidate's production build.

## Mandatory first-read gate: PASS

A cold desktop load and a 390 px load answer all three questions in the first
screen:

- What it does: **“Check Android update safety.”**
- Who it is for: people maintaining approved sideloaded apps when device rules
  or recovery paths change.
- What to do first: **“Try it with sample data.”** The adjacent sentence says
  it will show a redacted report and the next safe step.

The action is visible without scrolling and opens `/?demo=1` in one click. The
result is a realistic six-finding Android 15 report. The persistent banner says
“Demo — sample data, nothing is saved” and provides **Reset demo** and **Start
for real**. The same sandbox is directly available at `/demo`.

## Claims gate: PASS (27/27)

`.factory/claims.json` exists. Before other product inspection, every listed
`test` command was run separately and exactly as declared. All returned zero:

- CLI behavior: `demo-report`, `json-report`, `redacted-id`,
  `read-only-checks`, `unauthorized-device`, `signer-continuity`,
  `signer-unreadable`, `diagnostic-report`, `example-schema`,
  `device-selection`, `demo-no-adb`, `private-demo-file`,
  `explicit-output-replacement`, and `single-device-free`.
- Browser and license behavior: `local-demo`, `privacy`, `fleet-review`,
  `license-verification`, and `license-retention`.
- Billing, installer, and release behavior: `fleet-checkout`,
  `verified-installer`, `platform-packaging`, `release-manifest`,
  `release-signatures`, `unsigned-platform-disclosure`,
  `billing-provider-boundary`, and `published-installer-paths`.

The claim run included repeated clean `npm ci` setup where declared. The hosted
checkout returned 303 to Dodo without completing a purchase. The invalid
license endpoint returned its documented response. Landing, route, privacy,
README, and installer statements were cross-checked against the manifest; no
unlisted observable claim was found.

## Clean local install, tests, and production builds: PASS

```text
npm ci                                      passed; 0 vulnerabilities
npm test                                    21 Node passed; 67 Playwright passed;
                                            1 expected mobile-project skip
npm run build                               passed; produced dist/site
cargo test --all-targets                    21 passed
cargo fmt --check                           passed
cargo clippy --all-targets -- -D warnings  passed
cargo build --release                       passed
cargo package --locked --allow-dirty        passed; 16 packaged files verified
```

The repository exposes no separate npm lint or type-check command. The exact
site build produced fingerprinted `app.0b6cfe75335d.js` and
`style.153fe0711a98.css` assets.

## CLI and clean-consumer exercise: PASS

The packaged crate was installed with `cargo install` into a fresh temporary
consumer root. The installed public binary reported v0.1.4, rendered useful
`--help`, and completed both Markdown and JSON demos. The JSON had schema
`sideload-readiness/v1`, six findings, five recovery steps, and redacted device
ID `device-6f31a0b2`. An automatic report used an unpredictable mode-0600
temporary file.

Independent recovery cases behaved correctly:

- malformed signer SHA-256: exit 2 with the required 64-digit format;
- missing adb executable: exit 2 and instructions to install platform-tools,
  connect one device, and accept USB debugging;
- unwritable output path: exit 2 and an existing-writable-folder next step;
- signer mismatch: the signer row was `blocked`, the report said to stop, and
  the overall summary said to fix marked checks before updating;
- storage one KiB below the 1 GiB floor: `blocked` with the exact shortfall;
- unauthorized and multiple devices: refused until authorization or explicit
  selection, as covered by the public-command claims.

The fake-adb integration uses a real AOSP v2-signed APK fixture and records the
operations. Only read-only `devices`, `getprop`, `settings get`, `df`, `pm
path`, and APK reads were observed. No install, sideload, reboot, unlock,
settings-write, push, pull, or upload path is exposed.

## Published installers and release: PASS

GitHub release v0.1.4 contains `latest.json`, `SHA256SUMS`, Sigstore bundles,
Linux tar/deb/rpm assets, macOS arm64/x64 tar/pkg assets, and the Windows x64
zip. `latest.json` has absolute URLs for all four supported platform choices.

The published Linux archive downloaded independently and matched:

```text
1797f1b5a1ca905b749b495bd2fd3982c0c3b408dc3494aaeaf90507835888a0
```

It extracted successfully; the downloaded binary reported v0.1.4 and produced
the same valid six-finding JSON demo. The claim suite also verified every
current payload and manifest with checksum-pinned Cosign 2.4.1. The page and
README accurately disclose that the macOS package and Windows executable lack
platform-vendor signing. Shell, PowerShell, Homebrew, Scoop, deb/rpm, pkg, zip,
and winget-ready paths are present and checksum-pinned where applicable.

## Live deployment identity and browser QA: PASS

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed.
The deployed document, fingerprinted JS/CSS, service worker, and mobile hero
byte-match the local build:

```text
/                                             228874fd1d6245a0...
/assets/app.0b6cfe75335d.js                    0b6cfe75335dfda3...
/assets/style.153fe0711a98.css                 153fe0711a98b64e...
/service-worker.js                            2c32e3e5e8c59ded...
/public/hero-concrete-moss-768.webp            d7593ebdf8f476af...
```

The full 68-case Playwright matrix was then rerun against production: 67 passed
and one expected project-specific skip. It covered desktop and 390 px mobile,
the one-click demo, OS-specific download behavior, keyboard-only navigation,
history/focus restoration, route metadata, 200% text, reduced motion, touch
targets, fleet import validation, license failures, offline reload, and calm
release-lookup recovery.

- `/`, `/?demo=1`, `/demo`, `/privacy`, and `/terms` return 200. The designed
  unknown route returns 404.
- Every route has its specific title, one h1, `lang="en"`, a main landmark,
  complete image alt text, and labeled controls.
- Axe found zero serious or critical issues on every route at desktop and
  mobile sizes. Keyboard Tab reaches the skip link first; Enter opens the demo;
  Space resets it; the designed focus ring remains visible.
- No horizontal overflow or sub-44 px visible target was found at 390 px.
- Reduced motion removes finding animation and transitions. The report remains
  usable at 200% text.
- No unexpected console or page error occurred. The only expected failed
  network entry is the deliberate 404 navigation.
- All real links returned 2xx/3xx. Checkout returned 303 to the hosted Dodo
  session, the GitHub releases page returned 200, and installer routes returned
  200.

The factory `verify-url.sh` independently passed with a 641 ms load, zero
console errors, one h1, a main landmark, no missing alt, and no unlabeled
button.

## Privacy, storage, PWA, and headers: PASS

Fresh Playwright request logging across landing, demo entry, reset, reload,
privacy, and terms observed only the product origin. No analytics, tracking,
third-party script, font, or pixel loaded. Demo mode changed only
`demo:sideload-readiness`; a seeded real-data sentinel survived reset and exit,
and **Start for real** discarded the demo key.

The license token is sent only after explicit submit, only to the Sociobot
product endpoint. With a production Origin header, that endpoint returned the
matching `Access-Control-Allow-Origin` and `Cache-Control: no-store`. Cached
valid verdicts expire after 24 hours; report queues remain local.

The live document sends a restrictive CSP, HSTS, `nosniff`,
strict-origin referrer policy, and camera/microphone/geolocation denial.
Fingerprint assets use `public, max-age=31536000, immutable`; the service
worker uses `no-cache`; HTML uses 30-second revalidation.

The manifest parses without browser errors. A forced service-worker
unregister/re-register removed a seeded stale product cache, activated only
`sideload-readiness-v4-03b68c42c49b`, and then reloaded `/demo` successfully
offline.

## Endpoint request allowance: PASS

The only server-side product call is the Sociobot license verifier. From one
client, fresh invalid-license requests 1–30 returned 200. Request 31 and all
subsequent probes returned 429 with `Retry-After: 4`. Observed allowance:
**30 requests per window**. The static product has no sign-in or other backend.

## Performance and budgets: PASS

Live mobile Lighthouse:

```text
Performance 97  Accessibility 100  Best practices 100  SEO 100
FCP 970 ms     LCP 1,304 ms        TBT 189 ms          CLS 0
Total transfer 143,877 bytes
```

Built and transferred assets remain within contract budgets:

```text
JavaScript  21,690 raw / 7,396 gzip
CSS          8,278 raw / 2,727 gzip
Mobile hero 69,354 bytes
```

## Defects by severity

- Release-blocking: none.
- High: none.
- Medium: none.
- Low: none.

No physical Android handset was attached in this disposable verifier. Device
paths were exercised through the repository's recording fake adb and the real
signed-APK fixture, including normal, threshold, malformed, blocked,
unauthorized, and multi-device cases. This is a verification-environment limit,
not a product defect.

## Ephemeral evidence

Evidence in the verification container includes
`/tmp/sideload-claims-a0a3d043/`,
`/tmp/sideload-first-read-desktop.png`,
`/tmp/sr-verify-url-a0a3d043-nRIO2X/`,
`/tmp/sr-lighthouse-a0a3d043.json`, clean-consumer roots under
`/tmp/sr-consumer-a0a3d043-*`, and release checks under
`/tmp/sr-release-a0a3d043-*`.
