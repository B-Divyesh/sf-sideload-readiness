# Independent verification — FAIL

**Candidate:** `e422e119b65e8f4aa0b41b938843ef1980550a77` (`main`)  
**Production URL:** <https://sideload-readiness.sociobot.in>  
**Verified:** 2026-08-28, fresh checkout

## Release decision

**FAIL.** The required Linux/macOS one-line installer is broken against the
real published GitHub release. This is an end-to-end failure of a required
installer path for this `cli-installers` product, not a deployment-only
failure.

## First-read result

Pass. A cold, clean browser showed:

- What it does: “Check Android update safety.”
- Who it is for: people maintaining approved sideloaded apps when rules or
  recovery paths change.
- What to do first: the visible, one-click **Try it with sample data** link,
  immediately followed by “See a redacted report and the next safe step.”

The action opened `/demo`; its persistent banner said “Demo — sample data,
nothing is saved,” with Reset demo and Start for real controls.

## Required claim tests

All commands listed in `.factory/claims.json` passed from the clean checkout:

| Claim | Command | Result |
| --- | --- | --- |
| `demo-report` | `cargo test claim_demo_report_is_redacted_and_actionable` | pass |
| `json-report` | `cargo test claim_demo_json_is_machine_readable` | pass |
| `redacted-id` | `cargo test serials_are_never_exported_verbatim` | pass |
| `local-demo` | `npm run test:unit -- --test-name-pattern='@claim:local-demo'` | pass |
| `privacy` | `npm run test:unit -- --test-name-pattern='@claim:privacy'` | pass |

## Passing evidence

- Clean install: `npm ci` installed six packages with zero vulnerabilities.
- Full repository suite: `npm test` passed (8 Node tests; 24 Playwright tests).
- Quality/build gates: `npm run build`, `cargo fmt --check`,
  `cargo clippy --all-targets -- -D warnings`, `cargo test`, and
  `cargo build --release` all passed. `dist/site/index.html` was produced.
- Clean consumer check: `cargo package --allow-dirty` verified the package;
  `cargo install --path . --root <fresh-temp-root>` installed the CLI.
  `--help`, `demo --json --output`, redacted schema validation, missing-adb
  recovery (exit 2 with a next step), and unwritable-output recovery (exit 2)
  behaved correctly.
- Published `v0.1.0` release exists with Linux tar/deb/rpm, macOS arm64/x64
  tar/pkg, Windows zip, `SHA256SUMS`, and `latest.json`. The downloaded Linux
  tarball SHA-256 was `a5f82fd5f06a6d9da9adcb90625ba710a5bb938b74a07d58f78e44be86f75cf0`,
  matching `SHA256SUMS`; the extracted binary reported `0.1.0` and generated a
  valid redacted demo JSON report.
- Live identity: SHA-256 values of local `dist/site/index.html`, `app.js`,
  `style.css`, `service-worker.js`, and the mobile hero asset exactly matched
  their production responses.
- Live routes `/`, `/demo`, `/privacy`, `/terms`, `/missing`, `/install.sh`,
  `/install.ps1`, `/service-worker.js`, `/robots.txt`, `/sitemap.xml`, and
  `/manifest.webmanifest` returned HTTP 200.
- Live browser QA: all five rendered routes had one `h1`, correct per-route
  titles, no page/console errors, and zero axe serious/critical violations.
  Keyboard traversal reached the skip link first and showed a 3 px solid focus
  outline. At 390 x 844 there was no horizontal overflow and every tested
  interactive control was at least 44 px high. Reduced motion yielded
  `animation: none` for all finding rows.
- `/opt/fleet/lib/verify-url.sh` passed: 200, 696 ms load, title/lang/main,
  one `h1`, no missing image alt text, no unlabeled button, and no console
  errors.
- A fresh live `/demo` context made only same-origin requests, used only
  `demo:sideload-readiness` storage, registered a controlling service worker,
  and reloaded offline with the report and demo banner still present.
- Privacy/security: no third-party scripts or initial runtime requests were
  seen. The CSP permits only self resources plus the declared GitHub API and
  Sociobot API connections; HSTS, nosniff, referrer policy, and permissions
  policy are present. The API verification flow correctly reports blank and
  invalid tokens without console errors.
- API rate limiting: 30 rapid invalid-license verification requests returned
  200; request 31 returned **429** with `Retry-After: 3`.
- Size budgets: built JavaScript gzip 5,595 bytes; CSS gzip 2,705 bytes;
  mobile hero 69,354 bytes. Two fresh Lighthouse attempts could not start a
  stable root Chromium in this container (connection/crash), so no Lighthouse
  score is claimed from this verification.

## Defects

### P0 — live Linux/macOS one-line installer always fails

`https://sideload-readiness.sociobot.in/install.sh` contains this parser:

```sh
sed -n 's/.*"tag_name":"v\([^"]*\)".*/\1/p'
```

GitHub actually returns `"tag_name": "v0.1.0",` (spaces around the colon).
The parser produces an empty version. Executing the published script safely
in this verifier exited 1 before any installation attempt:

```text
Could not find a published release. Try again later.
```

Affected users cannot use the documented `curl -fsSL .../install.sh | sh`
flow on Linux or macOS. Fix the release parsing, add an end-to-end installer
test against a realistic GitHub API response, then republish/reverify.

### P1 — `latest.json` does not satisfy the per-platform URL contract

The published manifest has platform **filenames**, for example
`"linux":"sideload-readiness-linux-x86_64.tar.gz"`, rather than the required
per-platform asset URLs. The site currently works around this using the GitHub
API, but the release artifact itself does not meet the specified manifest
contract.

### P1 — claim inventory/test scope is incomplete

The live landing page and README make unlisted reliance claims, including
“Read-only adb checks,” “Free for one device,” and “does not install apps,
unlock devices, or change Android settings.” They have no corresponding
`.factory/claims.json` entries. Also, the listed `json-report` claim test
serializes an internal Rust `demo_report()` value rather than exercising the
public demo command. The claims contract requires every visitor-facing claim
to have an observable sandbox test through the demo entry point.

### P3 — static asset cache policy is short-lived

Production `app.js`, `style.css`, and `service-worker.js` use
`Cache-Control: public, must-revalidate, max-age=30`. The assets are
unhashed, so immutable long-lived asset caching is not available. This does
not break offline operation, but misses the stated static-product caching
policy.

