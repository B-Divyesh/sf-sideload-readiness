# Sideload Readiness handoff

## Delivered

- Rust `clap` CLI with `check`, `demo`, `--demo`, Markdown reports, and JSON reports. Live checks use read-only `adb` queries for authorization, developer options, USB state, `/data` storage, signer visibility, and A/B recovery clues.
- Redacted exported device IDs, safe failure messages, and a recovery checklist. `demo` never invokes `adb` and writes a report to a new temporary path.
- Static landing, demo, privacy, terms, 404, offline shell, original concrete and moss hero art, install scripts, paid fleet license restore, and a local licensed report queue.
- GitHub Actions release workflow for Linux, macOS arm64/x64, and Windows, with archives, `.deb`, `.rpm`, `.pkg`, release checksums, and `latest.json`. Scoop, Homebrew, and winget submission templates are included.

## Verify

```sh
cargo test
npm test
npm run build:site
cargo run -- --demo --json --output /tmp/readiness-demo.json
```

The deploy output is `dist/site/index.html`.

Local browser verification used `/opt/fleet/lib/verify-url.sh` against the site server: title and `lang` present, one `h1`, `main`, zero missing image alt values, zero unlabeled buttons, and zero console errors.

Lighthouse (mobile, local source server): performance **100**, accessibility **100**, LCP **1.66 s**, CLS **0**. Initial JS is 16 KB, CSS is 8 KB, and the mobile hero is 68 KB WebP.

## Known gaps / operator action

- A GitHub release cannot be created from this container because no GitHub CLI or repository credentials are available. Push `main`, tag `v0.1.0`, and let `.github/workflows/release.yml` publish the assets. Then replace the `REPLACE_WITH_RELEASE_SHA256` values in the Scoop and Homebrew templates with the `SHA256SUMS` values before publishing those manifests.
- macOS and Windows artifacts are intentionally unsigned. Add `APPLE_CERTIFICATE` and `WINDOWS_CERT_PFX` only when the product owner has signing credentials; the workflow currently makes usable unsigned builds.
- Android does not expose a complete recovery-sideload state from a running system. The report marks recovery as `needs-review` and points to the device maker's approved recovery instructions rather than guessing or bypassing a control.
