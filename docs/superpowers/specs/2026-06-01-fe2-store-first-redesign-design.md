# FE-2: Store-First Redesign + Lead-Gen Form — Design Spec

**Date:** 2026-06-01
**Status:** Approved (design); pending implementation
**Depends on:** BE-1 (live catalog API), FE-1 (storefront wired). Backend lead-capture endpoint **already exists** — no backend work.
**Repo:** `themetalstore-landing/frontend`

---

## 1. Purpose

Reposition the site as an **online store first**, with custom/services offered as products in the same catalog and custom requirements captured via a proper **lead-gen form** (replacing FE-1's WhatsApp path). Visual direction: **industrial layout, clean black-&-white palette** (no color accent).

## 2. Design direction (locked in brainstorming)

- **Store IS the homepage.** Marketing pages (Our Work / Inspiration / About) become secondary nav.
- **Layout** = "Forge" industrial structure: centered hero with a kicker line, large uppercase headline, dual CTAs; horizontal chip filter row; structured bordered product cards with a price/action row.
- **Palette** = "Showroom" clean **black & white**, pure ink (`#18181b`) on white. **No amber/color accent.**
- **Unified product grid**: stock items → "Buy Now"; made-to-order → "Get Quote". One grid, with an **All / Products / Services** segmented filter plus category chips.
- **Headline** default: *"Made of metal. Made for you."* (copy is provisional, finalize later).
- **Kicker** default: *"Fabricated in Vadodara · Since 2014"* (provisional).

## 3. Scope

### In scope
1. **Store-first homepage** (`Home.jsx` + `Store.jsx`): hero band → search → All/Products/Services segment + category chips → unified grid → trust strip → footer. Remove the old marketing-first homepage stack (Hero carousel / Advantages / Contact as the primary home sections).
2. **Restyle** the store list + product cards to the locked black-&-white industrial look.
3. **Type filter**: `All / Products / Services` mapped to `productType` (`stock` = Products, `made_to_order` = Services), composed with existing category + search filters.
4. **Header**: Shop-led nav; "Shop" primary, marketing links secondary; keep cart + login.
5. **Lead-gen form** (`EnquiryModal`): name, phone, email (optional), message/requirement, hidden product context + honeypot. POSTs to the existing capture endpoint; success + error states.
6. **Wire the form** to: product-detail "Get Quote" (made_to_order), and hero "Start a Custom Project". Replaces FE-1's WhatsApp `window.open`.
7. **Env**: add `VITE_CAPTURE_KEY` (public website capture key).

### Out of scope
- Checkout/payments (BE-2), customer auth (BE-3).
- The `Hero`, `Advantages`, `Contact`, `Calculator` components stay in the repo; the homepage simply stops composing them as primary. (Contact form remains as-is for now.)
- Final marketing copy / real product photography.
- Automated test harness (none in repo) — verify via build + browser walkthrough.

## 4. Backend reuse (no changes)

Lead capture uses the **existing** public endpoint discovered in `GeniusOS/backend/crm/views.py` (`InquiryViewSet.capture`, route `POST /api/v1/crm/inquiries/capture/`):

- **Headers:** `X-Capture-Key: <brand.capture_key>`, `Content-Type: application/json`
- **Body:** `{ brand_slug, name, phone, email?, website (honeypot, leave empty), meta: { ... } }`
  - `meta` is a string→string dict; we pass `{ product, product_slug, source_page, message }`.
- **Serializer:** `WebsiteInquirySerializer` — requires `name`, `phone`; `email` optional; creates a `crm.Contact` + `Inquiry` via `resolve_contact_and_inquiry(source='website')`.
- **Security (server-side, already built):** capture-key check, IP rate limit (10/hr), honeypot, soft Origin check against `brand.domain` (`https://themetal.store`).
- **Success:** `{ status: 'received', inquiry_id }` (wrapped in the `{success,data,errors}` envelope).

**Production capture_key for `themetalstore`:** `8c664d67-b863-4f91-9a88-d19b4fdad88e` (this is a *public* website key by design — safe in a `VITE_` var, consistent with sibling brand sites like vantage/gravity). Goes in `.env`/Vercel env, not hardcoded in source.

## 5. Components & data flow

- **`src/api/leads.js`** (new): `submitEnquiry({ name, phone, email, message, product, productSlug, sourcePage })` → POST capture endpoint with header + honeypot; returns `{ ok, inquiryId }` or throws a friendly error. Reads `VITE_CAPTURE_KEY` + `VITE_BRAND_SLUG`.
- **`src/components/EnquiryModal.jsx`** (new): controlled modal form (framer-motion, matches LoginModal styling). Props: `isOpen`, `onClose`, `product?` (name+slug for context + prefill), `sourcePage`. Client-side validation (name + phone required, phone format), loading/success/error UI.
- **`src/context/EnquiryContext.jsx`** (new, small): `openEnquiry({ product?, sourcePage })` / `closeEnquiry()` so any component (hero, product detail, cards) can trigger the modal without prop-drilling. Mounted once in `App.jsx` like CartDrawer.
- **`Store.jsx`**: add `typeFilter` state (`all|stock|made_to_order`); compose with category + search; restyle cards (black/white, price/action row, Buy vs Get-Quote per `productType`); "Get Quote" on a made_to_order card opens the enquiry modal with that product.
- **`StoreProductDetail.jsx`**: replace `handleRequestQuote` (WhatsApp) with `openEnquiry({ product, sourcePage:'product-detail' })`.
- **`Home.jsx`**: recompose to store-first (hero band → `Store` as page-style → trust strip). Hero "Start a Custom Project" → `openEnquiry({ sourcePage:'hero' })`.
- **`Header.jsx`**: reorder nav so "Shop" points to `/` (the store is now the homepage); keep `/store` as a working alias route. Marketing links (Our Work / Inspiration / About) become secondary. Keep cart/login.

## 6. Error handling

- Form: inline field validation; on network/4xx, show a non-blocking error message and keep the form open with entered values (immutable state updates). Honeypot field hidden from users.
- Capture-key missing (env not set): the form surfaces a clear "configuration error" rather than silently failing; logged to console in dev only.
- Envelope parsing reuses the `unwrap` approach from `api/store.js`.

## 7. Done criteria

1. Visiting `/` shows the store-first homepage (hero + unified product grid) in the black-&-white industrial style.
2. All/Products/Services segment + category chips + search all filter the grid together correctly.
3. Stock cards → "Buy Now" (add to cart); made_to_order cards + product detail → "Get Quote" opens the enquiry modal.
4. Submitting the enquiry form creates a lead (verified: returns `inquiry_id`; visible in CRM) and shows a success state.
5. Honeypot + required-field validation work; no WhatsApp `window.open` remains for quotes.
6. `npm run build` succeeds; no console errors on home/store/detail; responsive on mobile.

## 8. Risks

- **Origin check**: capture endpoint soft-checks `Origin` against `https://themetal.store`. From `localhost` dev it only logs (doesn't block), so testing works; production origin matches. No action needed but noted.
- **Rate limit**: 10/hr per IP — fine for real use; repeated test submits may 429. Use distinct data / spacing when testing.
- **Scope creep**: redesign touches the most-seen page. Keep marketing components intact (just not composed on home) so nothing else breaks and they remain reachable by route.
