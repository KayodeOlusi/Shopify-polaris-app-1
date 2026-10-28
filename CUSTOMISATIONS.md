# Customisations (Stage 4, FF1)

The app is still on Polaris 1: unversioned `polaris.js`, which serves 1.1.0, with `@shopify/shopify-app-react-router` 1.2.1 and `@shopify/polaris-types` 1.1.0. These are the changes a QR code app would collect over a few years of work, on top of the tutorial screens. `app/routes/app.qrcodes.$id.jsx` is unchanged.

## Shared

| Customisation | Where | Why it's realistic |
|---|---|---|
| App stylesheet with brand colours and Polaris 1 tokens (radius, container shadow, spacing, text and surface colours) copied by hand from the `--p-*` fallbacks in `polaris.js`, plus a comment saying where they came from | `app/styles/app.css` | Teams copy tokens from DevTools so their own blocks match Polaris, because Polaris doesn't publish them as a stylesheet for web components. |
| Stylesheet loaded with a `links` export on the app layout (`?url` import) | `app/routes/app.jsx` | This is the standard React Router way to add a global stylesheet. |

## Screen 1: QR codes list (`app/routes/app._index.jsx`)

| Customisation | Where | Why it's realistic |
|---|---|---|
| Summary cards for total codes, total scans and codes with no scans | `app/components/StatCard.jsx`, `.stat-card*` | Polaris 1 has no metric card, so apps build their own "Polaris-looking" card from the copied tokens. |
| Filter bar: title search (`s-search-field`), destination filter and sort (`s-select`), and a "Clear filters" button | `FilterBar` | Once a merchant has dozens of codes, search and filters are the first feature they ask for. |
| Friendly empty state when no codes match the filters, alongside the existing tutorial empty state for zero codes | `NoMatchesState` | Without it, a filtered table just goes blank, which reads as a bug. |
| Custom status pill ("Scanned" / "No scans yet") in its own colours | `app/components/StatusPill.jsx`, `.status-pill*` | Teams want status in brand colours, and `s-badge` tones are fixed. |
| Row actions menu (Edit, Download, Delete) using `s-button` + `s-menu` | `QRTableRow` | Per-row actions in an overflow menu is the standard index-table pattern. |
| Delete confirmation in an `s-modal`, which deletes through the existing `deleteQRCode` model function (list route `action`) and shows a toast | `DeleteModal`, `action` | Deleting without opening each code saves time, and destructive actions need confirmation. |
| CSS overrides on Polaris components: table row hover, font family on the page wrapper, and brand colour and radius on primary `s-button`s | `.qr-list-page …` in `app.css` | This is how developers usually try to restyle Polaris: element and attribute selectors on the custom element hosts. |
| Sticky action bar fixed to the bottom of the page, with the code count and "Create QR code" | `StickyActionBar`, `.qr-sticky-bar` | Long lists push the page header's action out of view. |
| Product images and the default sort come from the shop's settings | `loader` | The list respects the merchant's preferences from the Settings page. |

## Screen 2: Settings (`app/routes/app.settings.jsx`)

| Customisation | Where | Why it's realistic |
|---|---|---|
| "Settings" replaces "Additional page" in the app nav, and the template's `app.additional.jsx` is removed | `app/routes/app.jsx` | The template page gets replaced by the app's first real secondary page. |
| Branded header (brand colour background, the shop's saved brand label or "QR Studio" if it's empty, short description) above the Polaris content | `.settings-header` | Apps add their branding to settings or "home" pages, and merchants expect to see their own name once they've set one. |
| Custom tab bar (General, Appearance, Advanced) built from our own `<button role="tab">` elements and CSS | `app/components/SettingsTabs.jsx`, `.settings-tabs*` | Polaris 1 web components have no tabs component, so teams build their own. |
| Settings form with validation: default scan destination (`s-select`), brand label (required, 40 characters max, with a counter), QR foreground and background colours, "Show product images in the list" (`s-switch`), and the default list sort | form + `validateSettings` | This is a typical settings page. Validation is on the server, and the first failing field's tab is opened. |
| `ColorInput`: a native `<input type="color">` next to a hex `s-text-field`, kept in sync | `app/components/ColorInput.jsx`, `.color-input*` | A common lightweight colour control, used instead of the heavier colour field. |
| App Bridge save bar for unsaved changes, using the same `ui-save-bar` pattern as the QR form, and a toast on a successful save | `ui-save-bar`, `shopify.toast.show` | This is the documented embedded-app pattern the team already uses on the QR form. |
| Help popover next to the brand label (`s-button` + `s-popover`) | General tab | Inline help is the usual fix for "what is this field for?" support tickets. |
| Advanced tab with "Reset settings", which asks for confirmation in an `s-modal` | Advanced tab | Merchants who experiment need a way back to the defaults. |
| Settings stored per shop in the app's Prisma database: `ShopSettings` model, migration `20261028120000_add_shop_settings`, and `app/models/Settings.server.js` | `prisma/` | Per-shop preferences belong in the app database next to sessions. |
| A shared constant module, so the client page can use the 40-character limit without importing server code | `app/constants/settings.js` | React Router doesn't let a page component import `.server` modules. |
