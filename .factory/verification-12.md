# Independent verification 12 — Sideload Readiness

## Verdict: PASS

**Candidate:** `cf2989e6f4cc26034017d38c808c7fce0f54ed0e`  
**Verified URL:** <https://sideload-readiness.sociobot.in>  
**Date:** 2026-08-30 UTC  
**Scope:** independent clean-checkout verification against the researched brief,
the CLI/installers contract, and the deployed production site. No product source
was changed during this verification.

There are no release-blocking defects and no open defects at any severity.

## Cold first read

Opened the live home page in a fresh browser context before any other product
interaction. The first screen says **“Check Android update safety”**, says it is
**“For people who maintain approved sideloaded apps when device rules or recovery
paths change”**, and presents **“Try it with sample data”** as the first primary
action, with the outcome **“See a redacted report and the next safe step.”**

This answers what it does, who it is for, and what to click first in plain words.
The action enters the isolated demo in one keyboard-operable click, shows the
sample readiness report immediately, and exposes the persistent “Demo — sample
data, nothing is saved” banner with Reset demo and Start for real controls.

## Claims gate — PASS (32 / 32)

`.factory/claims.json` is present and declares 32 claims. Before general QA, each
declared `test` command was run exactly from the clean candidate checkout through
its stated demo/sandbox entry point. All passed:

- 15 Rust public-CLI claim commands, covering demo report/JSON, redaction,
  read-only adb operations, refusal/recovery paths, signer continuity,
  report coverage, multi-device selection, private temporary output, and free
  single-device checking.
- 6 browser claim commands, each with its declared `npm ci`, covering demo
  namespace isolation, no device API access, same-origin demo networking, fleet
  review, license transmission, and 24-hour cached-license expiry.
- The Sociobot billing claim: checkout returned `303` to hosted Dodo and an
  invalid-license verification returned `200 { valid: false, reason: "invalid" }`.
- 10 Node installer/release/billing-boundary claim commands, including published
  checksums, OIDC Sigstore bundles, platform packaging, installers, release
  manifest, and no direct payment-provider runtime endpoint.

## Local build and consumer verification — PASS

From this checkout:

```text
npm ci                                      PASS (run by each declared browser claim)
npm test                                    PASS (27 Node tests; 72 Playwright cases)
npm run build                               PASS (creates dist/site)
cargo fmt --check                          PASS
cargo clippy --all-targets -- -D warnings  PASS
cargo test                                 PASS (4 unit + 18 CLI integration tests)
cargo build --release --locked             PASS
cargo package --locked                     PASS (38,503-byte .crate)
```

I unpacked `target/package/sideload-readiness-0.1.4.crate` into a fresh temporary
consumer, installed it with `cargo install --path … --root … --locked`, and ran
the installed public binary. `--version` returned `sideload-readiness 0.1.4`.
`demo --json --output report.json` produced schema `sideload-readiness/v1`, six
findings, score 83, and redacted sample device `device-6f31a0b2`.

## Live deployment, privacy, and security — PASS

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed and
proved the deployed candidate bytes match the local production build:

| Asset | SHA-256 |
| --- | --- |
| app JS | `ddd08924c1b1b069f2ae07d1ca73c70c128f8e937aa0a265a5b9dfeaaab9544a` |
| CSS | `153fe0711a98b64e753dd98d8ab0b8a4826a45def135d3608bf4597d2741c63a` |
| service worker | `61c1d1c050f726113a6294ad8332683e0950fa08ac3217f9f44121bb02bb227f` |

A fresh Playwright request log for home → sample demo → reset → leave demo
contained only `https://sideload-readiness.sociobot.in` requests. There were no
console or page errors. The demo retained a real-data sentinel, used only
`demo:sideload-readiness`, and removed that demo key on exit. WebUSB and Web
Serial were not requested; live `Permissions-Policy` disables both.

Live HTML responses included CSP with `frame-ancestors 'none'`, HSTS,
`X-Content-Type-Options: nosniff`, strict-origin referrer policy, and the stated
Permissions Policy. Hashed JS/CSS had one-year immutable caching; the service
worker used `Cache-Control: no-cache` and was current/controlling after
`registration.update()`.

The only server-side product integration is Sociobot billing/license verification.
Using an invalid test token, 30 successful burst verification requests were
accepted; the 31st returned `429` with `Retry-After: 2` and
`x-ratelimit-after: 2`. No purchase was made.

## UX, accessibility, responsive, and PWA checks — PASS

- Independent Playwright + Axe on `/`, `/demo`, `/privacy`, and `/terms`: one
  h1 and one main landmark per route; zero serious/critical violations; zero
  console/page errors; no 390 px horizontal overflow.
- Keyboard: the primary sample action is reachable and operable with Enter; its
  computed visible focus ring is `rgb(11, 90, 162) solid 3px`; primary touch
  target height is 48 px.
- `/opt/fleet/lib/verify-url.sh` passed for home, demo, privacy, and terms.
  It confirmed title, `lang=en`, main landmark, one h1, no missing image alt
  attributes, no unlabelled buttons, and zero console errors.
- A live service-worker-controlled `/demo` reload remained usable offline;
  the active/controller script was `/service-worker.js`.
- Live 404 returned 404 with the designed recovery page. `robots.txt`, sitemap,
  Privacy, and Terms are live.
- `prefers-reduced-motion`, text zoom, keyboard routes, offline, demo isolation,
  and mobile targets were additionally covered by the passing 72-case browser
  suite.

## Performance and installers — PASS

- Production initial JS: 21,865 bytes raw / 7,452 gzip (under 200 KB).
  CSS: 8,278 raw / 2,727 gzip (under 50 KB). Mobile hero: 69,354 bytes
  (under 300 KB).
- Independent mobile Lighthouse: Performance 96, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1,275 ms and CLS 0. The environment emitted a
  post-report tab-crash warning, but wrote a complete report and all category
  scores above. Desktop scored 100/100/100/100.
- The real deployed `/install.sh` byte-matched the candidate. In a fresh isolated
  home it resolved the release, verified SHA-256, installed the binary, added
  the profile PATH entry, then ran bare `sideload-readiness --version` and
  `demo --json` successfully. The declared installer/release claim tests also
  validate every current archive checksum and Sigstore bundle.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Re-run

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release --locked
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```
