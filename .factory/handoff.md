# Review 5 handoff — Sideload Readiness

## Status: FAIL

This review made no product-code changes. It added
.factory/review-5.md, which records one blocking finding: header links such as
Demo and Privacy bypass the focused History API route path. Using Back after
those links leaves focus on BODY rather than the destination h1. Route all
same-origin global links through the existing route handler and add header
Back/Forward focus tests.

Verification from a fresh clone at f4e17396ade8706ad016b87ffafcd4c9d8f30593:

- all 32 exact claim commands passed;
- npm test passed (27 Node and 72 Playwright tests);
- npm run build produced dist/site;
- live byte identity, metadata, demo isolation, offline reload, privacy,
  mobile layout, console, and Axe checks passed;
- the direct CLI demo created a private mode-0600 JSON report with six findings
  and no adb connection.

Recheck with:

```sh
npm ci
npm test
npm run build
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```

The historical handoff follows.

# Verification 12 handoff — Sideload Readiness

## Current independent verdict: PASS

Candidate `cf2989e6f4cc26034017d38c808c7fce0f54ed0e` was independently verified
against <https://sideload-readiness.sociobot.in> on 2026-08-30 UTC. All 32
declared claim commands passed first from a clean checkout; `npm test`, the
production build, Rust format/lint/test/release/package checks, a clean packaged
CLI consumer, live deployed installer, browser privacy/accessibility/mobile/PWA
checks, and rate-limit verification passed. The live JS, CSS, and service-worker
hashes exactly match this candidate build. The observed Sociobot verification
allowance was 30 successful burst requests; request 31 received `429` with
`Retry-After: 2`. There are no known defects or release blockers.

See [verification-12.md](verification-12.md) for the exact commands, evidence,
first-read result, asset hashes, and defect list. The remaining historical
handoff below documents the preceding repair and does not supersede this verdict.

# Repair 8 handoff — historical context

## Status: PASS

This repair addresses every blocker in independent verification 11
(`.factory/verification-11.md`) for candidate
`d58430814d88ccb3fa66f90de6ced7dd05c71fe6`. The repair source commit is
`bb456835bc88feb08d3d7f68d1809760701de1b0` (`fix: repair installer and privacy
contracts`), pushed to `main` and deployed on 2026-08-30 UTC.

Deployment used the work-order static configuration:

```sh
npm ci && npm run build:site
/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site
```

Azure Static Web Apps deployment `c2ae6b4c-bb6e-4380-98c7-abe176d70f2d`
succeeded. <https://sideload-readiness.sociobot.in> returned HTTPS 200 from the
existing custom domain afterwards.

## Fixed findings

### F-11-1 — Privacy copy contradicted demo-file behavior

`/privacy` and the README now distinguish the two real CLI paths precisely:

- A regular `check` writes a report file only with `--output PATH`.
- A `demo` without `--output` creates a private temporary report and prints its
  path.
- The CLI never uploads reports.

The shipped behavior was preserved. New declared claim `cli-report-storage`
runs the public regular check with and without `--output`, then runs the public
demo in an isolated temporary directory. It proves no automatic regular-check
file, the explicit requested file, and a mode-0600 automatic demo file. The
source regression also locks the rendered Privacy and README wording.

### F-11-2 — One-line installers did not make the command discoverable

`install.sh` now writes `~/.local/bin` to the appropriate user startup profile
(`.profile`, `.bash_profile`, or `.zprofile`) without duplicating the entry. A
piped POSIX script cannot mutate its parent terminal, so it prints the exact
`export PATH=…` command required for that terminal. README copy says this
plainly. Sourcing the written profile makes the bare `sideload-readiness`
command run.

`install.ps1` now adds its install directory to both the active PowerShell
session and the persistent user `Path`. The published consumer smoke workflow
uses bare `sideload-readiness` commands after both the Linux and PowerShell
installers; it no longer invokes the binary by full path.

New declared claim `installer-path-setup` installs fixture archives, sources
the resulting POSIX profile and runs the bare command, then asserts the
PowerShell current-session/user-PATH implementation and smoke commands.

### F-11-3 — Linux ARM64 requested a nonexistent release asset

The shell installer now rejects `arm64`/`aarch64` on Linux before it contacts a
download URL, with a clear release-page recovery message. macOS arm64 remains
supported. README documents the exact supported architectures. New declared
claim `installer-platform-support` mocks Linux aarch64 and the downloader and
proves no download occurs.

No release binary changed: the existing v0.1.4 artifacts remain the matching
CLI release; this repair changes site-delivered installer behavior and docs.

## Verification

### Clean local checks

- `npm ci`: passed, 0 vulnerabilities.
- Every one of the 32 exact commands in `.factory/claims.json` was rerun in a
  separate shell: `CLAIMS_RERUN_PASS 32`.
- `npm test`: passed — 27 Node tests and the 72-case desktop/390 px Playwright
  run, including keyboard, focus, route metadata, Axe serious/critical checks,
  demo isolation, request privacy, reduced motion, text zoom, offline demo
  reload, service-worker behavior, and license recovery.
- `npm run build`: passed; `dist/site` contains the production artifact.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo test --all-targets`: passed — 4 unit and 18 CLI integration tests.
- `cargo build --release --locked`: passed.
- `cargo package --locked`: passed; packaged 16 files (130.5 KiB / 37.6 KiB
  compressed).
- Fresh package consumer: unpacked
  `target/package/sideload-readiness-0.1.4.crate`, installed it with
  `cargo install --path … --root … --locked`, then verified `--version` and a
  JSON demo report with schema `sideload-readiness/v1`, six findings, and
  `device-6f31a0b2`.

The production asset measurements are 21,865 bytes raw / 7,456 bytes gzip JS,
8,278 / 2,732 CSS, and 69,354 bytes for the mobile hero.

### Published installers

- The deployed `/install.sh` and `/install.ps1` byte-match the local sources.
- A clean live shell-installer exercise in an isolated home verified the
  SHA-256 release download, profile entry, bare `sideload-readiness --version`,
  and six-finding JSON demo report.
- GitHub Actions consumer smoke run
  [33286259999](https://github.com/B-Divyesh/sf-sideload-readiness/actions/runs/33286259999)
  completed successfully after the repair. Its Linux installer, Homebrew,
  Windows installer, and Scoop jobs all passed. The Windows job ran the bare
  command in the same PowerShell session after `irm … | iex`.

### Live product checks

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` passed.
It proved production bytes match `dist/site`, with these key hashes:

| Path | SHA-256 |
| --- | --- |
| `/` | `8a35df66643b6f36f563090a815526610c580a7d47860f5b2a593b161fe7846f` |
| `/assets/app.ddd08924c1b1.js` | `ddd08924c1b1b069f2ae07d1ca73c70c128f8e937aa0a265a5b9dfeaaab9544a` |
| `/service-worker.js` | `61c1d1c050f726113a6294ad8332683e0950fa08ac3217f9f44121bb02bb227f` |

The verifier passed home, demo, Privacy, Terms, and designed 404 route status,
titles, canonical URLs, one-h1 structure, zero serious/critical Axe findings,
zero console errors, keyboard flow, 390 px first-screen layout and target
sizes, no mobile overflow, same-origin demo requests, demo namespace isolation,
and offline demo reload.

`/opt/fleet/lib/verify-url.sh` also passed independently on home, demo,
Privacy, and Terms. It recorded title, `lang="en"`, one h1, a main landmark,
zero missing image alt text, zero unlabeled buttons, and zero console/page
errors on each route. Live headers include CSP with `frame-ancestors 'none'`,
HSTS, `nosniff`, strict-origin referrer policy, and Permissions Policy disabling
USB and serial APIs.

Mobile Lighthouse completed with Performance 100, Accessibility 100, Best
Practices 100, SEO 100; LCP 1,303 ms, TBT 0 ms, and CLS 0. Lighthouse emitted a
post-report browser-tab crash warning, but wrote the complete JSON result. The
standalone Axe CLI could not start Selenium Chrome in this container; the
Playwright Axe integration above passed all tested routes with zero
serious/critical findings.

## Known gaps and next steps

No known product or release-blocking gaps remain. The release stays at v0.1.4
because neither the CLI binary nor release archives changed. A future binary
release should keep the current installer contract and retain the ARM64 refusal
unless it adds and signs a Linux ARM64 asset.

## How to run

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release --locked
cargo package --locked
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
```
