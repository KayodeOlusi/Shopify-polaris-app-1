@AGENTS.md

# Hard rules for this project

This is a sample app for a Shopify crowdtesting study (updating embedded apps to Polaris 2.0). It runs on the development store "first-polaris-app". These rules always apply:

## Current stage: Stage 2 (Polaris 2.0 update)
- Work only on the `polaris2-update` branch. Never commit to `main`; it is the rollback point.
- Allowed in this stage: upgrade `@shopify/shopify-app-react-router` to 2.1.x (not 3.x unless I say so), fix its 2.0 breaking changes, set `polarisUrl` to `https://cdn.shopify.com/shopifycloud/polaris-2.0-rc.js` in BOTH `app/routes/app.jsx` (AppProvider) and `app/shopify.server.js` (shopifyApp) with identical values, update `@shopify/polaris-types` to `^2.0.0-rc.0`, and fix the QR code create/edit screen (`app/routes/app.qrcodes.$id.jsx`).
- Never add a Polaris `<script>` tag by hand. Exactly one Polaris bundle must load.
- Keep changes limited to the plan. Don't refactor or restyle other screens unless I ask.
- Follow the Polaris 2 update guide (https://shopify.dev/docs/apps/build/app-home/polaris2) and the v2.0 RC component reference (https://shopify.dev/docs/api/app-home/v2.0-rc/web-components). If something isn't covered by those docs, tell me instead of working around it, because I have to report workarounds.

## Always
- Use Polaris web components only (`s-page`, `s-section`, etc.). No `@shopify/polaris` React components.
- Never run `shopify app deploy` or `shopify app release`. Never publish, create billing/charges, or touch a production store.
- Never open, print, or commit `.env` files, API keys, or tokens.
- I run `shopify app dev` myself in another terminal. Don't start or stop it; tell me when I need to restart it or approve new scopes in the admin.
- Commit after each step with a clear message, and tell me what changed so I can note it in my report.
