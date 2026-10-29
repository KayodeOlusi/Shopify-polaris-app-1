@AGENTS.md

# Hard rules for this project

This is a sample app for a Shopify crowdtesting study (updating embedded apps to Polaris 2.0). It runs on the development store "first-polaris-app". These rules always apply:

## Current stage: Stage 4, FF2 (customised app moved to Polaris 2.0)
- Stay on `https://cdn.shopify.com/shopifycloud/polaris-2.0-rc.js` (2.0.0-rc.3), set as `polarisUrl` in both `app/routes/app.jsx` and `app/shopify.server.js`. Don't switch to `polaris-2.js` and never add a Polaris script tag by hand.
- Don't change `app/routes/app.qrcodes.$id.jsx` (the stages 1-3 screen).
- Everything must be realistic for a QR code app that has grown over a few years. Nothing built only to break later.
- Never deploy, publish, create charges, or open/print/commit `.env` or secrets. The user runs `shopify app dev` themselves.
- Commit after each step.
