# Sideload Readiness repair handoff

## Status

Repair for verifier report commit `e4691f2c560a10f529d179716e359cc04fd37efb`
against candidate `5984c2b8e2c455cea888ff898e4eb1db359241cc`.

The three reported release blockers were reproduced and repaired without
changing the researched brief, the `cli-installers` artifact class, or the
previously passing free CLI, demo, privacy, offline, accessibility, and
installer behavior. Code repairs are in `ff728e1` and `42b1821`; this
handoff is committed separately. The static site is deployed.

## Repairs

1. **Fleet checkout returned 404 (P1).** The live Sociobot factory product was
   missing. It is now registered and enabled as `sideload-readiness`, with
   the advertised USD 39 one-time fleet review price and
   `https://sideload-readiness.sociobot.in/` return URL. The public catalog
   returns that product, checkout returns a hosted Dodo HTTP 303 without a
   purchase, and invalid-license verification returns the documented
   `valid: false, reason: invalid` response. `scripts/verify-billing.mjs`
   and the `fleet-checkout` claim are exact regressions.

2. **Release assets had no signing artifact (P1).** Every v0.1.1 release asset
   now has a GitHub OIDC Sigstore bundle. The manual repair workflow
   `.github/workflows/sign-release.yml` signed the ten existing assets, and
   `.github/workflows/release.yml` signs every future asset before upload.
   Action [33247521145](https://github.com/B-Divyesh/sf-sideload-readiness/actions/runs/33247521145)
   succeeded. `scripts/verify-release-signatures.mjs v0.1.1` downloaded and
   cryptographically verified all ten assets against the repository workflow
   identity and GitHub's OIDC issuer. Workflow coverage is tagged
   `@claim:release-signatures`.

   This is verifiable artifact provenance, not a claim of Apple notarization
   or Windows Authenticode. README copy and the product stay explicit about
   that distinction.

3. **Unknown paths returned the app shell with HTTP 200 (P2).**
   `staticwebapp.config.json` no longer has a catch-all
   `navigationFallback`; it rewrites only the three real SPA routes and
   lets the configured `404.html` response override return HTTP 404 for
   unknown paths. `scripts/serve.mjs`, site unit tests, browser tests, and
   live verification all exercise
   `/unambiguously-missing-qa-route`. The deployed route returns 404 with
   the designed not-found title and heading.

## Exact verification

Clean local and package/consumer checks passed:

```sh
npm ci
npm test
npm run build
npm run test:billing
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo test
cargo build --release
cargo package --allow-dirty
npx --yes yaml-lint .github/workflows/release.yml .github/workflows/sign-release.yml \
  winget/Sociobot.SideloadReadiness/0.1.1/*.yaml packaging/nfpm.yaml
sh -n site/install.sh
node scripts/verify-release-signatures.mjs v0.1.1
```

- `npm ci`: six packages, zero audit findings.
- `npm test`: 12 Node tests passed; built-site Playwright had 35 passes and
  one intentional desktop skip. The matrix covers Chromium desktop and Pixel
  5 at 390 px, keyboard focus/operation, reduced motion, 200% text, touch
  targets, no horizontal overflow, routes, response status, axe, privacy,
  demo storage isolation, paid local queue, license submission, offline
  reload, and service-worker update.
- Axe found zero serious or critical violations across `/`, `/demo`,
  `/privacy`, `/terms`, and the 404 route. All 16
  `.factory/claims.json` commands passed independently, including the
  live, non-purchasing `fleet-checkout` claim.
- Rust formatting, warnings-denied clippy, three unit tests, and eight
  public-CLI integration tests passed. A fresh packaged crate installed into
  an isolated root; `--help`, the six-finding redacted JSON demo, and
  missing-adb exit 2 with a next step were checked.
- The generated site has 15,746 bytes of JavaScript (5,608 gzip) and 8,153
  bytes of CSS (2,718 gzip), within the static-product budget.
- The release-signature verifier confirmed matching valid bundles for
  `SHA256SUMS`, `latest.json`, Linux tar/deb/rpm, both macOS tar/pkg
  variants, and the Windows zip.

## Deployment and live evidence

Static deployment used the work-order target:

```sh
/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site
```

Azure deployment `773c4f10-5cf4-4e73-bef0-fb0714ec2f45` completed to the
production custom domain.

- `https://sideload-readiness.sociobot.in/` returns HTTP 200 with managed
  TLS, CSP, HSTS, `nosniff`, strict referrer policy, and restrictive
  permissions policy. The deployed JavaScript and CSS byte-match the local
  production build.
- The intentional missing path returns HTTP 404. The browser verifier allows
  only its expected network diagnostic while testing that deliberately
  missing URL; no application console errors are allowed.
- `/opt/fleet/lib/verify-url.sh` passed against production: 789 ms load,
  valid title/lang/main, one h1, complete image alternatives, labeled
  buttons, and no console errors.
- `node scripts/verify-live.mjs https://sideload-readiness.sociobot.in`
  passed all real routes, desktop/mobile checks, axe, privacy, offline and
  update checks, response policy, and live identity checks.
- A clean temporary home ran
  `curl -fsSL https://sideload-readiness.sociobot.in/install.sh | sh`.
  It selected the published Linux asset, verified SHA-256, installed the
  binary, and wrote the expected six-finding sample report.
- Live Lighthouse (mobile): Performance 100, Accessibility 100, Best
  Practices 100, SEO 100.

## Known limits and operator follow-up

- The release now has cryptographically verified Sigstore provenance, fixing
  the reported absence of a signature artifact. Apple notarization and
  organization Authenticode remain impossible without the owner's Apple and
  Windows certificate authority. No such credentials are stored in this repo;
  add them only if vendor-trusted OS signing is required.
- Publish the prepared Homebrew formula to
  `B-Divyesh/homebrew-sideload-readiness` and submit the existing winget
  manifests to `microsoft/winget-pkgs` when the owner is ready.
- Android cannot prove complete recovery-sideload state while it is running.
  The CLI preserves the honest `needs-review` result and device-maker
  guidance.
