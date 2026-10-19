@AGENTS.md

# Hard rules for this project

This is a sample app for a Shopify crowdtesting study (updating embedded apps to Polaris 2.0). It runs on the development store "first-polaris-app". These rules always apply:

- Do NOT change how Polaris is loaded: no `polarisUrl`, no `polaris-2.0-rc.js`, no extra Polaris script tags, and do not upgrade `@shopify/shopify-app-react-router`. The app must stay on its current Polaris version for the study's setup check.
- Use Polaris web components only (`s-page`, `s-section`, etc.), as in Shopify's "Build a Shopify app using React Router" tutorial. No `@shopify/polaris` React components.
- Never run `shopify app deploy` or `shopify app release`. Never publish, create billing/charges, or touch a production store.
- Never open, print, or commit `.env` files, API keys, or tokens.
- The user runs `shopify app dev` themselves in another terminal. Don't start or stop it; tell the user when they need to restart it or approve new scopes in the admin.
- Commit to git after each step with a clear message.
