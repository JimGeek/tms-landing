# FE-1: Wire Storefront to Live API — Design Spec

**Date:** 2026-06-01
**Status:** Approved (design); pending implementation
**Depends on:** BE-1 (shipped) — brand-scoped store API at `/api/v1/store/`
**Repo:** `themetalstore-landing/frontend`

---

## 1. Purpose

BE-1 made the GeniusOS store API serve a real brand-scoped catalog. FE-1 connects the storefront to it so products actually load, product-detail pages resolve (today they bounce), and the catalog reflects the live backend instead of hardcoded local data.

## 2. Problem (current state)

- **Store list** ([Store.jsx](../../frontend/src/pages/Store.jsx)) fetches live but each card links via `item.type === 'product' ? ... : '#'`. The live API has no `type` field (it's `product_type`), so **every card links to `#`** — nothing is clickable.
- **Product detail** ([StoreProductDetail.jsx](../../frontend/src/pages/StoreProductDetail.jsx)) reads hardcoded `src/data/store.js` by integer `id` and uses old field shapes (`has3D`, `customizationOptions`, `modelConfig`, `category`). Live products won't match → redirect to `/store`.
- **Data shape drift:** API returns `price: "12500.00"` (decimal string), `has_3d`, `model_config`, nested `options[].values[]`, `category`/`category_name`. Frontend assumes `"₹ 12,500"` strings, `has3D`, `customizationOptions`.
- **`?brand=` now required** — current fetches omit it and would get 400.

## 3. Scope

### In scope
- New `src/api/store.js`: typed fetch helpers + `normalizeProduct` mapper (single source of the API contract).
- `Store.jsx`: consume helper, fix card links to `slug`, add debounced search (`?search=`), render normalized price.
- `App.jsx`: route `store/product/:id` → `store/product/:slug`.
- `StoreProductDetail.jsx`: fetch live by slug; loading + not-found states; consume normalized shape; **Request-a-Quote (WhatsApp) CTA for `made_to_order`**, Add-to-Order for `stock`.
- Delete `src/data/store.js`.

### Out of scope (blocked on BE-2/BE-3)
- CartDrawer checkout (`/api/orders/create/` + `/verify/` don't exist yet), Razorpay prefill from user, real success-page order data. **Left untouched.**
- Automated FE test harness (none exists in repo) — verification is manual against the live API.

## 4. Data contract & normalization

`normalizeProduct(raw)` maps API → UI shape:

| API field | UI field | Notes |
|---|---|---|
| `slug` | `slug` | detail route key |
| `name`, `description`, `image` | same | |
| `category_name` | `category` | display string |
| `price` (str), `price_unit` | `priceNumber` (float), `displayPrice` (str) | see formatting below |
| `product_type` | `productType` | `stock` \| `made_to_order` |
| `has_3d` | `has3D` | |
| `model_config` | `modelConfig` | `{type, style}` or null |
| `options[].values[]` | `customizationOptions: [{name, type, values: [valueLabel]}]` | flatten value objects to labels; keep `price_modifier` ignored in FE-1 |

**`displayPrice` rules:**
- `price_unit === 'Free'` or price 0 with Free unit → `"Free"`
- `price_unit` like `/sqft` → `"Starting @ ₹450/sqft"` (made_to_order)
- else → `"₹12,500"` (`toLocaleString('en-IN')`)

**Brand slug:** `import.meta.env.VITE_BRAND_SLUG` (already set to `themetalstore`).

## 5. Made-to-order CTA

For `productType === 'made_to_order'`, the detail page replaces "Add to Order" with **"Request a Quote"** → opens `https://wa.me/919316723563` with a prefilled message: product name + any selected option values. Stock items keep the existing add-to-cart behavior. This avoids implying a working purchase flow for per-unit/quote items before BE-2.

## 6. Done criteria

1. Store page lists live products with clean prices and clickable cards.
2. Clicking a product opens `/store/product/<slug>` and loads live detail (no bounce).
3. Search filters the list via the API.
4. Made-to-order product shows Request-a-Quote (WhatsApp); stock shows Add-to-Order.
5. `src/data/store.js` deleted; no remaining import of it.
6. Dev server runs clean against the live API; no console errors on store/detail.

## 7. Risks

- **Live API images are null** (BE-1 seed couldn't fetch images in sandbox) — detail/list must tolerate `image: null` with a placeholder.
- **`?brand` required**: every store call must include it; centralizing in `store.js` mitigates.
- **Category filter field**: API products expose `category_name`; the existing pill filter compares against it — normalize so filtering still works.
