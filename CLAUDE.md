@AGENTS.md

# Hard rules for this project

This is a sample app for a Shopify crowdtesting study (updating embedded apps to Polaris 2.0). It runs on the development store "first-polaris-app". These rules always apply:

## Current stage: Stage 4, FF1 (customised app on Polaris 1)
- Stay on Polaris 1: no `polarisUrl`, no package upgrades, no Polaris script tags.
- Don't change `app/routes/app.qrcodes.$id.jsx` (the stages 1-3 screen).
- Everything must be realistic for a QR code app that has grown over a few years. Nothing built only to break later.
- Never deploy, publish, create charges, or open/print/commit `.env` or secrets. The user runs `shopify app dev` themselves.
- Commit after each screen.
