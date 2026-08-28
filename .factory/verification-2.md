# Independent verification 2 — FAIL

**Candidate:** `5984c2b8e2c455cea888ff898e4eb1db359241cc` (`main`)  
**Production URL:** <https://sideload-readiness.sociobot.in>  
**Verified:** 2026-08-28 from a clean checkout

## Release decision

**FAIL.** The free CLI and demo are healthy, but the advertised paid fleet
purchase path is broken in production: the public checkout URL returns HTTP
404. This is an end-to-end failure of a visitor-facing feature. In addition,
the macOS and Windows installers are explicitly unsigned, which does not meet
the researched brief's requirement for a signed desktop CLI.

## First read

**Pass.** A cold visit to `/` said “Check Android update safety,” named people
who maintain approved sideloaded apps, and offered a visible one-click “Try it
with sample data” action with the outcome “See a redacted report and the next
safe step.” It opened the sample report. The demo banner states that sample
data is not saved and includes Reset demo and Start for real.

## Required claim tests

`.factory/claims.json` exists and all 14 listed commands passed before the
rest of QA:

| Claims | Exact command form | Result |
| --- | --- | --- |
| `demo-report`, `json-report`, `redacted-id`, `read-only-checks`, `unauthorized-device`, `demo-no-adb`, `single-device-free` | `cargo test --test cli <listed-test> -- --exact` | 7/7 pass |
| `local-demo`, `privacy`, `fleet-review`, `license-verification` | `npm run test:browser -- --project=chromium --grep '@claim:<id>'` | 4/4 pass |
| `verified-installer`, `platform-packaging`, `release-manifest` | `node --test --test-name-pattern='@claim:<id>' tests/*.test.mjs` | 3/3 pass |

## Passing evidence

- Clean install: `npm ci` completed with six packages and zero reported
  vulnerabilities.
- Full test suite: `npm test` passed all 11 Node tests and 33 Playwright tests
  (one intentional desktop-only skip). It exercised desktop and 390 px mobile,
  keyboard use, focus, reduced motion, 200% text, axe, privacy, service-worker
  update/offline reload, and release lookup.
- Rust gates all passed: `cargo fmt --check`,
  `cargo clippy --all-targets -- -D warnings`, `cargo test` (3 unit + 8 public
  CLI integration tests), `cargo build --release`, and
  `cargo package --allow-dirty`.
- A clean consumer install from the packaged crate succeeded. Its public
  `--help`, `demo --json --output`, report schema (six findings and a redacted
  `device-…` ID), and missing-`adb` recovery (exit 2 and one next step) worked.
- `npm run build` produced `dist/site`. Initial JavaScript is 15,746 bytes
  (5,608 gzip), CSS 8,153 bytes (2,718 gzip), and the mobile hero is 69,354
  bytes.
- The live deployment matches this candidate's production output: all 16
  deployable files (HTML, assets, public images, service worker, installers,
  web manifest, robots, and sitemap) had matching SHA-256 values. The two
  hashed assets have `max-age=31536000, immutable`; the service worker has
  `no-cache`.
- Independent live Playwright checks on `/demo` found only same-origin runtime
  requests, only `demo:sideload-readiness` local storage, no page/console
  errors, zero axe serious/critical findings, no 390 px overflow, and no
  undersized visible controls. Keyboard tabbing reached and activated the demo
  with a visible 3 px focus outline. A controlling service worker reloaded the
  demo offline.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed:
  `/`, `/demo`, `/privacy`, `/terms`, and the client-rendered missing route
  each had one h1 and zero serious/critical axe findings.
- Response policy is present live: HSTS, `nosniff`, strict-origin referrer
  policy, permissions policy, and a CSP limited to self plus the declared
  GitHub/Sociobot API connections.
- The live Linux installer installed v0.1.1 in an isolated temporary HOME,
  printed SHA-256 verification, and the installed binary generated a valid
  redacted six-finding demo report. The downloaded Linux tarball also matched
  the published `SHA256SUMS`.
- The optional verification API enforced a 30-request observed allowance for
  one client: requests 1–30 returned 200 invalid verdicts; request 31 returned
  HTTP 429 with `Retry-After: 3` (requests 31–45 remained 429, with 2–3 second
  retry values). No valid license or purchase was used.

## Defects

### P1 — production fleet checkout is unavailable

The landing page's **Buy fleet review** link targets:

```text
https://api.sociobot.in/api/v1/products/sideload-readiness/checkout
```

A fresh GET on 2026-08-28 returned:

```text
HTTP/2 404
{"error":"enabled factory product","status":404}
```

Consequently, a visitor cannot buy the advertised $39 one-time fleet review
license. Register/enable the product in the Sociobot billing service, then
repeat a no-purchase checkout redirect smoke test before release. This needs
external product-registration authority; it cannot be repaired in this repo.

### P1 — signed-installer requirement is unmet

The researched brief calls for a **signed desktop CLI**. The current README
and `.factory/handoff.md` explicitly state that the macOS and Windows packages
are unsigned pending operator certificates; the v0.1.1 release contains no
signature/notarization artifact. This is not an implementation defect in the
free diagnostic flow, but it does not meet the stated distribution contract.
Obtain the signing/notarization credentials, sign the macOS and Windows
artifacts, publish a new release, and verify the signatures from a clean
consumer environment.

### P2 — unknown server paths are HTTP 200 landing pages, not a real HTTP 404

`/unambiguously-missing-qa-route` returned HTTP 200 with the landing
`index.html` title in its raw response. `navigationFallback` rewrites it before
the configured `responseOverrides.404` can take effect. JavaScript later
renders the in-app “That page is not here” screen, but non-JavaScript clients,
crawlers, and HTTP consumers receive a successful landing page. Configure the
deployment fallback/404 routing so unknown paths retain an HTTP 404 response
and the designed 404 document.

## Release traceability note

The published `v0.1.1` tag dereferences to commit
`9e7f0e64c620ea5935e4c473f4310bd7bbca6435`, not the candidate commit. The
candidate's diff from that release changes verification, claims, metadata, and
documentation; `src/`, `site/`, and `Cargo.toml` have no diff, and the live
static output matches this candidate byte-for-byte. This is therefore not the
reason for the FAIL, but the next release should tag the exact candidate used
for final verification.
