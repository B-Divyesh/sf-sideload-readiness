# Repair 5 production evidence

Captured on 2026-08-29 after deploying product commit `4e6b0d1`.

- `live/verify.json`: factory URL smoke result. HTTP 200, no console errors,
  one heading, `lang=en`, a main landmark, and no missing labels or alt text.
- `live/screenshot-desktop.png`: complete production page at desktop width.
- `live/screenshot-mobile.png`: complete production page at 390 px width.
- `lighthouse.json`: mobile simulated-throttling audit. Performance 100,
  accessibility 100, best practices 100, SEO 100; LCP 1.208 s, CLS 0,
  TBT 32 ms.

`node scripts/verify-live.mjs https://sideload-readiness.sociobot.in` also
passed every route, zero serious/critical axe findings, the 390 px first-read
gate, privacy request log, and offline reload. Exact live/local SHA-256 values
are recorded in `.factory/handoff.md`.
