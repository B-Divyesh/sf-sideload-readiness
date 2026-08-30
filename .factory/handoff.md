# Polish 5 handoff — Sideload Readiness

## Status: PASS

This repair closes the sole blocker in adversarial review 5 of candidate
`f4e17396ade8706ad016b87ffafcd4c9d8f30593`:
`F-5-1`, global navigation that bypassed the History API focus path.

Source repair commits:

- `8ef8304 fix: focus global route transitions`
- `9351fc2 test: verify global route focus live`

The static deployment completed as
`e945100f-dca1-4ecf-8c5b-f63a55f5de3a` through the work-order command:

```sh
npm run build:site
/opt/fleet/lib/deploy-static.sh sideload-readiness dist/site
```

<https://sideload-readiness.sociobot.in> returned HTTPS 200 immediately after
deployment. The product remains a static landing/docs site for the signed
Rust CLI installers; no deployment class or visual direction changed.

## What changed

- Header wordmark, Demo, Install, Fleet, and Privacy links, plus footer Privacy
  and Terms links, now opt into the same delegated History API route handler as
  in-page application links.
- Every internal global route transition now updates metadata, announces the
  route, and moves focus to its destination `h1`; Back and Forward do the same.
- Added a desktop-and-mobile regression that activates header Demo and Privacy
  plus footer Terms, then asserts heading focus after navigation, Back, and
  Forward.
- Extended the live verifier with that same three-link focus audit.
- The catalog sentence is now: “Check Android update safety before updating an
  approved sideloaded app.”

## Verification

### Clean clone

Fresh clone: `/tmp/sideload-readiness-clean-AtXzzf` at `8ef8304`.
`npm ci` reported zero vulnerabilities. A harness read `.factory/claims.json`
and executed every declared command independently; all 32 passed:

`demo-report`, `json-report`, `redacted-id`, `read-only-checks`,
`unauthorized-device`, `signer-continuity`, `signer-unreadable`,
`diagnostic-report`, `example-schema`, `device-selection`, `demo-no-adb`,
`cli-report-storage`, `private-demo-file`, `explicit-output-replacement`,
`single-device-free`, `local-demo`, `browser-demo-no-device`, `privacy`,
`fleet-review`, `license-verification`, `license-retention`, `fleet-checkout`,
`verified-installer`, `installer-path-setup`, `installer-platform-support`,
`platform-packaging`, `release-manifest`, `release-signatures`,
`release-checksums`, `unsigned-platform-disclosure`,
`billing-provider-boundary`, and `published-installer-paths`.

The same clean clone then passed:

```sh
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test --all-targets
cargo build --release --locked
cargo package --locked
```

`npm test` passed 27 Node tests and 74 desktop/mobile Playwright cases. The
locked crate package exists at
`/tmp/sideload-readiness-clean-AtXzzf/target/package/sideload-readiness-0.1.4.crate`.

### Live site

```sh
node scripts/verify-live.mjs https://sideload-readiness.sociobot.in
VERIFY_NODE_MODULES=/work/repo/node_modules /opt/fleet/lib/verify-url.sh \
  https://sideload-readiness.sociobot.in .factory/polish-evidence-5/verify-url-home
```

The live verifier passed byte identity for the HTML, fingerprinted assets,
service worker, and hero image; correct titles/canonicals/descriptions/Open
Graph for home, `?demo=1`, demo, Privacy, Terms, and the HTTP 404; one `h1`
per route; no console errors; zero serious/critical Axe findings; demo storage
isolation; no WebUSB/Web Serial calls; same-origin demo traffic; offline demo
reload; 390 px overflow/touch checks; and all global navigation focus checks.

`verify-url.sh` passed cold home, `?demo=1`, Privacy, and Terms. Captures and
route reports are in `.factory/polish-evidence-5/verify-url-{home,demo,privacy,terms}/`.

Mobile Lighthouse recorded Performance 100, Accessibility 100, Best Practices
100, and SEO 100; LCP 1,317 ms, TBT 0 ms, and CLS 0. Its report is
`.factory/polish-evidence-5/lighthouse-live.json`. Production JS is 22,018 B
raw / 7,491 B gzip, CSS is 8,278 B / 2,709 B gzip, and the mobile hero is
69,354 B.

## Known gaps and next steps

No finding of any severity remains unresolved. No follow-up is required for
this work order. A later CLI release should keep the existing published
installer, checksum, Sigstore, and platform-disclosure contracts.

## Re-run

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
