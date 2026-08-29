# Repair handoff — claims-contract repair

## Status: PASS

Work order `sideload-readiness-repair-7` repaired independent verification 6
for candidate `735123f2e56749332cf3909b7cd34420d0ee9512`. The product repair
commit is `d35f6446a3245220367af6233336f4f88c348377`.

### Release blocker repaired

The verifier found that README promises about automatic demo report files and
explicit `--output` replacement had runtime regressions tests but no declared
claims. The promises remain unchanged. `.factory/claims.json` now declares:

- `private-demo-file`: an automatic demo uses a private, unpredictable,
  non-reused temporary filename.
- `explicit-output-replacement`: `demo --output PATH` replaces a pre-existing
  file at the requested path.

Each claim has one exact public-CLI test and a source `@claim:` marker.
`tests/site.test.mjs` additionally proves both IDs occur once, their commands
select the exact test, and each marker names that test. The private-file test
runs the real CLI twice in an isolated temporary directory containing file and
symlink collision fixtures, checks different regular mode-0600 reports, and
asserts all collision targets stay unchanged. The explicit-output test seeds a
file, invokes the public CLI, and checks its report replaces the seed.

### Verification

- Clean `npm ci` passed with 0 vulnerabilities. `npm test` passed all 18 Node
  tests and 56 Playwright desktop/mobile tests. `npm run build` produced
  `dist/site`.
- All 22 commands in `.factory/claims.json` passed separately from the
  repaired commit, including each browser claim's own `npm ci` prerequisite.
  The billing probe observed a 303 checkout redirect and a 200 invalid-license
  response without a purchase.
- `cargo fmt --all -- --check`, `cargo clippy --all-targets --all-features --
  -D warnings`, `cargo test --all-targets` (19 tests), and `cargo build
  --release` passed. `cargo package --locked` packaged and verified 16 files.
  An isolated unpacked-crate consumer built and ran `--help` plus `demo --json`.
- Fresh Cosign 3.1.3 verification passed GitHub OIDC provenance for all 10
  non-bundle assets in the published `v0.1.4` release.
- Local URL verification found no console errors, a valid title/lang/h1/main,
  and no missing image alt text. Lighthouse scored 1.0 for performance,
  accessibility, best practices, and SEO.
- Production `verify-url.sh`, `node scripts/verify-live.mjs`, and
  `BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`
  passed. The live suite covers desktop and 390 px mobile, keyboard/focus,
  reduced motion, 200% text, axe, privacy request origins, CSP/cache policy,
  service-worker update, and offline demo reload.

### Deployment and evidence

The rebuilt static artifact was deployed to production Azure Static Web App
`sf-sideload-readiness` (deployment
`bdef0b4b-0662-4860-9975-130bce518bb0`) and is live at
<https://sideload-readiness.sociobot.in>. Live identity verification matched
the local build for `index.html`, the fingerprinted JS/CSS, service worker,
and mobile hero. The live 390 px action remained within the first viewport;
there was no horizontal overflow, no undersized controls, no external runtime
requests, and offline `/demo` reloaded successfully.

Evidence:

- `.factory/repair-evidence-7/local-verify/`
- `.factory/repair-evidence-7/live-verify/`
- `.factory/repair-evidence-7/live-verification.json`
- `.factory/repair-evidence-7/lighthouse-local.json`

### Known operator items

- Submit `winget/Sociobot.SideloadReadiness/0.1.4/` to
  `microsoft/winget-pkgs` before advertising a winget install command.
- The macOS package is not Apple-notarized and the Windows zip is not
  Authenticode-signed. README disclosure and GitHub OIDC Sigstore bundles
  remain in place.

---

# Prior repair handoff — v0.1.4

## Superseded status: PASS

This repair addresses every blocker in independent verification 5 for candidate
`1864d360df809cd87b823f1ef31ed44aabd609cf`. The repair commit is
`9bcc1dbd2e809dea84cd9e44459c56b847e15fc3`; the final packaging and handoff
commit follows it on `main`.

## What changed

1. Automatic CLI demo output now uses `tempfile::NamedTempFile`. The report is
   created through an exclusive, unpredictable private file handle, written
   without reopening its pathname, then retained. It cannot reuse the legacy
   second-based filename or follow a pre-existing symbolic link. Explicit
   `--output PATH` keeps its documented replace-existing-file behavior.
2. macOS browsers now receive an explicit, accessible package choice before
   download: Apple silicon `.pkg` or Intel `.pkg`. Windows and Linux select
   their exact archive names. Android and iPhone browsers do not default to a
   desktop download.
3. Installer links and the unlocked fleet file input are at least 44 CSS px
   tall. The mobile audit now visits landing, demo, privacy, terms, and the
   cached-unlocked fleet state.
4. The release is v0.1.4. Homebrew, Scoop, and the ready-to-submit winget
   manifests use the v0.1.4 release checksums.

## Regression coverage

- `automatic_demo_uses_an_exclusive_private_file_and_rejects_temp_collisions`
  plants a legacy filename collision and a symlink to a victim file, runs two
  automatic demos, checks unique 0600 regular files, and proves both planted
  paths remain unchanged.
- `explicit_demo_output_replaces_the_requested_file_as_documented` keeps the
  separate explicit-output contract observable.
- Release-shaped browser fixtures cover Windows, Linux, Intel Mac, Apple
  silicon Mac, Android, and iPhone. Live production probes confirm the Intel
  link ends in `macos-x86_64.pkg` and Apple silicon ends in `macos-aarch64.pkg`.
- The mobile target audit asserts every visible link, button, and input is at
  least 44 × 44 px on all required routes and after fleet unlock.

## Verification

All 20 `.factory/claims.json` commands were executed exactly as written and
passed. The broader local suite passed:

```text
npm ci                                              pass; 0 vulnerabilities
npm test                                            55 pass, 1 intentional mobile skip
npm run build                                       pass; dist/site
cargo fmt --all -- --check                          pass
cargo clippy --all-targets --all-features -- -D warnings  pass
cargo test --all-targets                            19 pass
cargo build --release                               pass
cargo package --locked                              pass after commit
clean packaged consumer                             v0.1.4 help + JSON demo pass
```

The packaged crate was unpacked into a fresh Cargo root, installed with
`cargo install --path … --locked`, reported `sideload-readiness 0.1.4`, and
produced a valid `sideload-readiness/v1` JSON demo report.

Desktop and 390 px Playwright runs cover keyboard navigation, skip link and
focus restoration, all-route axe serious/critical checks, privacy requests,
demo isolation/reset/exit, offline `/demo` reload, service-worker update, and
the new download logic. The same full suite passed against production with
`BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser`.

Live checks passed after deployment:

- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` proved
  byte identity for the document, fingerprinted JS/CSS, service worker, and
  mobile hero; it passed every route, axe, keyboard, console, mobile, privacy,
  and offline assertion.
- `/opt/fleet/lib/verify-url.sh` reported no console errors, `lang=en`, one
  `<h1>`, `<main>`, complete image alternatives, and labeled buttons.
- Production headers include HSTS, `nosniff`, strict-origin referrer policy,
  restrictive permissions policy, and the expected CSP with only GitHub and
  Sociobot API connections.
- A fresh invalid-license sequence returned 200 for requests 1–30 and 429 on
  request 31 with `Retry-After: 3`.

Performance evidence in `.factory/repair-evidence-6/lighthouse.json`:

```text
Lighthouse: Performance 100 | Accessibility 100 | Best Practices 100 | SEO 100
FCP 1.2 s | LCP 1.7 s | CLS 0
JavaScript 19,960 bytes / 6,867 gzip
CSS 8,278 bytes / 2,727 gzip
Mobile hero 69,354 bytes
```

Evidence files:

- `.factory/repair-evidence-6/verify-url/`
- `.factory/repair-evidence-6/live/`
- `.factory/repair-evidence-6/live-verification.json`
- `.factory/repair-evidence-6/lighthouse.json`

## Release and deployment

- GitHub Release `v0.1.4`: <https://github.com/B-Divyesh/sf-sideload-readiness/releases/tag/v0.1.4>
- Release workflow `33267154123` passed all four build targets and published
  Linux tar/deb/rpm, macOS arm64/x64 tar/pkg, Windows x64 zip, `SHA256SUMS`,
  `latest.json`, and a Sigstore bundle for every release file.
- Fresh Cosign 3.1.3 verification passed all ten non-bundle files against the
  repository release/sign-release workflow identities.
- Consumer workflow `33267421328` passed Linux installer, Homebrew, Windows
  installer, and Scoop smoke tests.
- Homebrew source update: `f745d62ea09435aed6016612cd5cd7531b5cfbde`.
  Scoop source update: `05a646c691edf56a5c50727a056ffd0fcca835bf`.
- Static site deployed to production Azure Static Web App
  `sf-sideload-readiness` (`gray-coast-05ad65210.7.azurestaticapps.net`) and
  is live at <https://sideload-readiness.sociobot.in>.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release
cargo package --locked
BASE_URL=https://sideload-readiness.sociobot.in npm run test:browser
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
npm run test:billing
```

Run each `.test` command in `.factory/claims.json` separately for the strict
claims gate. Use `PATH=/path/to/cosign:$PATH node
scripts/verify-release-signatures.mjs v0.1.4` to verify the published
provenance bundles.

## Known operator items

- Submit `winget/Sociobot.SideloadReadiness/0.1.4/` to
  `microsoft/winget-pkgs` before advertising a winget install command.
- The macOS package is not Apple-notarized and the Windows zip is not
  Authenticode-signed. The README discloses this; every published file has
  verified GitHub OIDC Sigstore provenance.
- No purchase was made during checkout verification.
