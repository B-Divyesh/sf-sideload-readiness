# Independent verification 6

## Verdict: FAIL — release blocked by the claims contract

Candidate commit: `735123f2e56749332cf3909b7cd34420d0ee9512`  
Live URL: <https://sideload-readiness.sociobot.in>  
Verification date: 2026-08-29 UTC

This was an independent read-only verification. No product code was changed.

## Release-blocking finding

### BLOCKER — visitor-facing safety claims are absent from `.factory/claims.json`

`README.md:96-99` says that the demo creates a **private, unpredictable**
temporary report, **never reuses** an existing temporary filename, and that an
explicit `--output PATH` **replaces** an existing file. These are concrete
safety and file-system-behaviour promises a CLI user can rely on.

They do not have entries in `.factory/claims.json`. The closest entry,
`demo-no-adb`, proves only that the demo does not invoke adb and writes to a
temporary path. The repository does have untagged regression tests named
`automatic_demo_uses_an_exclusive_private_file_and_rejects_temp_collisions`
and `explicit_demo_output_replaces_the_requested_file_as_documented`, but the
claims contract requires each visitor-facing claim to have an entry and exactly
one `@claim:<id>` test. Therefore this candidate cannot pass the stated
acceptance contract despite the behaviour itself passing locally.

Repair: either remove/narrow these promises, or add claim records for the
automatic-private-file and explicit-overwrite contracts and tag/run their
observable tests through the public CLI demo entry point.

## First-read result — PASS

Cold desktop load of the live site returned 200 with no console or page errors.
The first screen says:

> “Check Android update safety” — “For people who maintain approved sideloaded
> apps when device rules or recovery paths change.”

It clearly identifies the job and audience, and its visible first action is
**Try it with sample data**, immediately explained as “See a redacted report
and the next safe step.” The one-click `/demo` route opens a realistic six-
finding sample report with a persistent “Demo — sample data, nothing is saved”
banner, Reset demo, and Start for real controls.

## Claims gate — PASS (20/20 declared claims)

`npm ci` completed with 0 vulnerabilities. Every command in the candidate's
`.factory/claims.json` was run separately from the clean candidate and passed:

`demo-report`, `json-report`, `redacted-id`, `read-only-checks`,
`unauthorized-device`, `signer-continuity`, `device-selection`, `demo-no-adb`,
`single-device-free`, `local-demo`, `privacy`, `fleet-review`,
`license-verification`, `license-retention`, `fleet-checkout`,
`verified-installer`, `platform-packaging`, `release-manifest`,
`release-signatures`, and `published-installer-paths`.

The billing check observed an HTTP 303 checkout redirect to hosted Dodo and an
HTTP 200 invalid-license response; it did not purchase anything.

## Local quality and end-to-end checks — PASS

```text
npm test                                      56 passed, 1 mobile-only skip
npm run build                                 passed; dist/site created
cargo fmt --all -- --check                    passed
cargo clippy --all-targets --all-features -- -D warnings  passed
cargo test --all-targets                      19 passed
cargo build --release                         passed
cargo package --locked                        passed; package verification passed
```

I unpacked `target/package/sideload-readiness-0.1.4.crate` into a clean
temporary consumer workspace, installed it with an isolated `CARGO_HOME`, and
ran its public API. `--help` and `--version` worked; `demo --json` wrote a
mode-`demo`, `sideload-readiness/v1` report with six findings and a redacted
`device-6f31a0b2` ID in a mode-0600 temporary file. A normal check with a
deliberately missing adb executable returned exit code 2 and the actionable
next step to install platform-tools, connect a device, and accept USB
debugging. Existing CLI tests additionally exercised unauthorized devices,
multiple-device selection, signer match/mismatch, malformed APKs, storage
below the safety floor, and output-write failure recovery.

## Live deployment, privacy, accessibility, and performance — PASS

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed:

- `/`, `/demo`, `/privacy`, `/terms`, and designed 404 returned the expected
  titles, exactly one h1, and zero axe serious/critical findings.
- Desktop and 390 px mobile had no console errors, no horizontal overflow, and
  no undersized visible controls. Keyboard checks covered skip link, Enter to
  enter demo, Space to reset demo, history focus restoration, and visible focus.
- Reduced motion removes finding animation; 200% text retains report and
  controls. `/demo` reloads offline after its service worker activates; its
  `no-cache` worker header supports updates.
- A fresh Playwright request log on the landing page contained only the product
  origin (HTML, CSS, JS, and hero WebP). The full demo/privacy/terms browser
  claim flow also passed with no third-party requests. No external script or
  font is loaded.
- The response CSP is restrictive and includes only `self`, GitHub's release
  API, and Sociobot's API in `connect-src`; it also has HSTS, `nosniff`,
  `strict-origin-when-cross-origin`, and disabled camera/microphone/geolocation.
  Fingerprinted JS has `public, max-age=31536000, immutable`; the service
  worker has `no-cache`.
- The deployed candidate byte-matches the local production build:
  `index.html cc002745…`, JS `d51a46aa…`, CSS `153fe071…`, service worker
  `ac636811…`, and mobile hero `d7593ebd…`.
- Initial JS is 19,960 bytes / 6,867 gzip; CSS is 8,278 / 2,727 gzip; mobile
  hero is 69,354 bytes. All are within the stated budgets.

The complete live browser suite also passed with
`BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`.

## Published installers and service allowance — PASS

GitHub's current release is `v0.1.4` and contains Linux tar/deb/rpm, macOS
arm64/x64 tar/pkg, Windows x64 zip, `SHA256SUMS`, `latest.json`, and Sigstore
bundles. I downloaded the Linux x64 tarball, verified it with its published
`SHA256SUMS` entry, extracted it, and ran `--version` plus `demo --json`.

The live Sociobot verification endpoint enforced its allowance freshly from a
single client: requests 1–30 to an invalid-license verify URL returned 200;
request 31 and later returned 429 with `Retry-After: 4`. Observed allowance:
30 requests per window.

## Required next action

Do not release this candidate until the unlisted temporary-file and explicit
output-overwrite claims are either removed or added to `claims.json` with
tagged, public-CLI observable claim tests. Re-run the full claims gate after
that change.
