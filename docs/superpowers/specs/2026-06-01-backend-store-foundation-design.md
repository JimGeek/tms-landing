# BE-1: Backend Store Foundation — Design Spec

**Date:** 2026-06-01
**Status:** Approved (design); pending implementation plan
**Owner:** The Metal Store storefront
**Backend project:** `/Users/macbookpro/ProductionProjects/Ongoing/GeniusOS/backend` (`ecommerce` app)
**Frontend project:** `/Users/macbookpro/ProductionProjects/Ongoing/themetalstore-landing/frontend`

---

## 1. Purpose & Context

The Metal Store website is a React/Vite SPA whose **primary purpose is an online store**, with a **secondary purpose of generating leads** for custom fabrication services (gates, railings, staircases, gazebos, grills). Target audiences: **homeowners** and **architects/interior designers**. The hero conversion action for the services path is "Book a site visit / call."

The frontend already calls `GET /api/v1/store/products/` and `/categories/` on the shared **GeniusOS backend** (`https://api.superhomes.app`), but receives empty arrays. Investigation revealed the root cause and several structural gaps:

- **The catalog table is empty** for The Metal Store — the endpoints work, there is just no data.
- **The ecommerce app has no brand concept.** `Product`/`Category` are global, shared across all brands (Marvel Homes, Just Bathrooms, etc.). There is no brand FK, no brand filter, no brand middleware.
- The frontend product **detail** page reads 6 hardcoded local products (`src/data/store.js`) while the **list** loads live — so most products bounce users back. (Fixed later in FE-1; this spec makes the live detail data available.)

The Metal Store is **brand id 5, slug `themetalstore`** in the `brands.Brand` table (confirmed via the working chat endpoint).

This spec covers **BE-1 only**: a brand-scoped, richly-modeled product catalog with seeded demo data and live API. Checkout, payments, customer auth, and all frontend work are explicitly out of scope (see §8 Roadmap).

---

## 2. Scope

### In scope (BE-1)
- Add brand scoping to `Category` and `Product`.
- Add rich-catalog fields to support hybrid checkout (stock vs made-to-order) and the frontend's existing product-detail features (3D, customization options with variant pricing, multiple images).
- New models: `ProductImage`, `ProductOption`, `ProductOptionValue`.
- Brand-filtered store API (`?brand=<slug>`), with a product **detail-by-slug** endpoint returning full nested options/images.
- Safe 3-step migration (add nullable brand → backfill → make required + unique constraints).
- Rewrite `seed_products` management command: brand-scoped, richly-modeled, idempotent, resilient image download.
- Django admin updates: brand columns/filters + inlines for images and options.
- Tests (models, API, seed) targeting 80% coverage on touched modules.

### Out of scope (roadmapped)
- **BE-2:** Razorpay `create`/`verify` endpoints + hybrid enquiry/quote checkout. (Frontend currently calls `/api/orders/create/` + `/verify/` which **do not exist**.)
- **BE-3:** Customer auth/identity reconciliation. OTP login issues a `crm.Contact` token; Google login issues a Django `User`; cart/checkout only works for Django `User`. OTP also requires a pre-existing customer (no signup).
- **FE-1/2/3:** Frontend — product detail live fetch + slug routing, real order data on success page, checkout prefill from logged-in user, search, service-lead forms, new marketing sections.

---

## 3. Data Model

All changes in `backend/ecommerce/models.py`.

### Category (modified)
| Field | Type | Notes |
|---|---|---|
| `brand` | FK → `brands.Brand` | CASCADE, `related_name='categories'`, **required** (after migration) |
| `name` | CharField | existing |
| `slug` | SlugField | **uniqueness changes to `unique_together(brand, slug)`** (drop global unique) |
| `image` | ImageField | existing |
| `description` | TextField | existing |

### Product (modified)
| Field | Type | Notes |
|---|---|---|
| `brand` | FK → `brands.Brand` | CASCADE, `related_name='products'`, **required** (after migration) |
| `category` | FK → Category | existing (CASCADE) |
| `product_type` | CharField(choices) | `stock` \| `made_to_order`. Drives later checkout routing (stock→Razorpay, made_to_order→enquiry). Default `stock`. |
| `name` | CharField | existing |
| `slug` | SlugField | **`unique_together(brand, slug)`** |
| `description` | TextField | existing |
| `price` | DecimalField | existing; base price. For `made_to_order`, interpreted as a "starting at" value. |
| `price_unit` | CharField(blank) | e.g. `""`, `"/sqft"`, `"Free"`, `"Starting @"`. Lets the frontend render strings like `"Starting @ ₹ 450/sqft"` from data rather than hardcoding. |
| `image` | ImageField | existing; treated as the **primary/list** image. |
| `stock_quantity` | PositiveInt | existing, default 0 |
| `is_featured` | Boolean | existing |
| `is_active` | Boolean | existing, default True |
| `has_3d` | Boolean | default False. Mirrors frontend `has3D`. |
| `model_config` | JSONField | nullable/blank. Mirrors frontend `{type:'gate', style:'classic'}`. |
| `created_at` / `updated_at` | DateTime | existing |
| `@property in_stock` | — | existing |

### ProductImage (new)
| Field | Type | Notes |
|---|---|---|
| `product` | FK → Product | CASCADE, `related_name='images'` |
| `image` | ImageField | required |
| `alt_text` | CharField(blank) | |
| `sort_order` | PositiveInt | default 0; ordering key |

### ProductOption (new) — a customization axis (e.g. "Finish")
| Field | Type | Notes |
|---|---|---|
| `product` | FK → Product | CASCADE, `related_name='options'` |
| `name` | CharField | e.g. "Finish", "Material", "Roof Material" |
| `option_type` | CharField(choices) | `color` \| `select` (mirrors frontend `type`) |
| `sort_order` | PositiveInt | default 0 |

### ProductOptionValue (new) — a choice within an option (e.g. "Matte Black")
| Field | Type | Notes |
|---|---|---|
| `option` | FK → ProductOption | CASCADE, `related_name='values'` |
| `value` | CharField | e.g. "Matte Black", "Iron" |
| `price_modifier` | DecimalField | default 0; added to base price when selected |
| `sort_order` | PositiveInt | default 0 |

**Design rationale:** Option→OptionValue with per-value `price_modifier` mirrors the frontend's existing `customizationOptions` shape (`{name, type, values:[]}`) while making variant pricing real and server-driven. Every product belongs to exactly one brand (required FK), giving clean brand isolation.

---

## 4. API & Brand Filtering

Routes unchanged (prefix `/api/v1/store/` via `config/urls.py` → `ecommerce.urls`). Brand declared via **query param `?brand=<slug>`** (chosen for simplicity, parity with the chat endpoint's `brand_slug`, and CDN/cache friendliness).

### Brand resolution helper — `ecommerce/brand_utils.py` (new)
```python
def resolve_brand(request):
    """Return the Brand from ?brand=<slug>, or raise a clean 400."""
    slug = request.query_params.get('brand')
    if not slug:
        raise ValidationError("brand query param is required")  # → envelope 400
    return get_object_or_404(Brand, slug=slug)
```
Keeps views thin and the `{success, data, errors}` envelope consistent.

### ProductViewSet.get_queryset (`ecommerce/views.py`)
```python
brand = resolve_brand(self.request)
qs = (Product.objects
      .filter(brand=brand, is_active=True)            # NOTE: adds missing is_active filter
      .select_related('category')
      .prefetch_related('images', 'options__values'))
# preserved filters: category__slug, is_featured, search (name icontains)
# new filter: product_type
```
- **Adds the missing `is_active=True` filter** (today the endpoint leaks inactive products).
- `CategoryViewSet.get_queryset`: `Category.objects.filter(brand=brand)`.

### Serializers (`ecommerce/serializers.py`)
Extend `ProductSerializer` to:
- Nest `images` (ordered by `sort_order`), `options` (each with nested `values` incl. `price_modifier`).
- Expose `product_type`, `price_unit`, `has_3d`, `model_config`.
- **Keep backward-compatible field names** the frontend already consumes: `category`, `category_name`, and `image` (primary) for the list view. The `{success, data}` envelope is already handled by `Store.jsx`.

### Endpoints (URLs unchanged; now brand-scoped)
| Method | URL | Behavior |
|---|---|---|
| GET | `/api/v1/store/products/?brand=themetalstore` | List: brand-filtered, `is_active=True` only. Supports `category__slug`, `is_featured`, `search`, `product_type`. |
| GET | `/api/v1/store/products/<slug>/?brand=themetalstore` | **Detail by slug** (lookup `brand` + `slug`). Returns full nested options/images. 404 if slug not in that brand. |
| GET | `/api/v1/store/categories/?brand=themetalstore` | List brand categories. |

**Detail lookup = slug** (SEO-friendly, e.g. `/store/product/premium-swing-mechanism`). The `ProductViewSet` uses `lookup_field = 'slug'`; the frontend route migrates `:id` → `:slug` in FE-1.

### Backward compatibility
Making `brand` a **required** query param means a caller with no `?brand=` now gets a **400** instead of `[]`. The only caller is this storefront, and the catalog is empty, so this is safe. Documented here as the one breaking change.

---

## 5. Migrations

Adding a **required** FK to a possibly-non-empty table uses the standard safe 3-step. The live table is currently empty, so risk is low, but the steps remain correct either way.

1. **Migration A (additive):** add `brand` as **nullable** FK to `Category`/`Product`; add `product_type`, `price_unit`, `has_3d`, `model_config`; create `ProductImage`, `ProductOption`, `ProductOptionValue`. (Do **not** yet change slug uniqueness.)
2. **Data migration (backfill):** set `brand` = The Metal Store (`Brand.objects.get(slug='themetalstore')`) on any existing `Category`/`Product` rows. Guard for the brand not existing (skip/raise with clear message).
3. **Migration C (constraints):** make `brand` **non-null**; replace global `slug` unique with `unique_together(brand, slug)` on both models.

Migrations must apply cleanly on the live (empty) DB and locally.

---

## 6. Seeding — rewrite `ecommerce/management/commands/seed_products.py`

- Resolve `brand = Brand.objects.get(slug='themetalstore')`; attach to every category and product.
- Seed the **6 demo products** (Swing Mechanism, CNC Gate, Pergola Kit, Staircase Railing Consultation, Laser Cut Panel, Sliding Gate) with:
  - `product_type`: e.g. Swing Mechanism / Pergola Kit / Laser Cut Panel = `stock`; CNC Gate Design / Staircase Consultation = `made_to_order`.
  - `price_unit` set where relevant (`"/sqft"`, `"Free"`, etc.).
  - `has_3d=True` + `model_config={type:'gate', style:'classic'}` for the CNC Gate.
- Seed `ProductOption`/`ProductOptionValue` for the CNC Gate:
  - Finish (`color`): Matte Black, Gold, Silver (with price modifiers).
  - Material (`select`): Iron, Steel, Aluminum (with price modifiers).
  - Pergola Kit Roof Material (`select`): Polycarbonate, Glass, Louvered.
- **Idempotent:** `update_or_create` keyed on `(brand, slug)` for categories and products — re-running does not duplicate.
- **Resilient images:** wrap image download (currently from `themetalstore.in`) so a failed/missing fetch logs a warning and continues rather than aborting the whole seed.

**Real catalog:** the 6 seeded products are demo "proof-of-life" data. Real Metal Store products are added later via Django admin (which §7 makes capable of full product entry).

---

## 7. Django Admin (`ecommerce/admin.py`)

- `ProductAdmin` / `CategoryAdmin`: add `brand` to `list_display` and `list_filter`.
- `ProductAdmin` inlines: `ProductImageInline`, `ProductOptionInline` (with nested option-value editing or a linked `ProductOptionValueInline` on the option admin).
- `prepopulated_fields` for slug remains, scoped within brand context.
- Goal: a non-developer can create a brand-scoped product with multiple images and customization options entirely from admin.

---

## 8. Testing & Done Criteria

### Tests (`backend/ecommerce/tests/`, pytest)
- **Models:** brand-scoped slug uniqueness (two brands may both have slug `gates`; same brand may not duplicate); option `price_modifier` arithmetic; `Product.in_stock`.
- **API:** `?brand=themetalstore` returns only TMS active products; missing `?brand` → 400; another brand's slug → only that brand's items (isolation); inactive products excluded; detail-by-slug returns nested options/images; wrong-brand slug → 404.
- **Seed:** running `seed_products` twice is idempotent (no dupes) and attaches the correct brand.
- Target 80% coverage on touched modules (project rule).

### Done criteria
1. `GET /api/v1/store/products/?brand=themetalstore` returns the 6 seeded products with nested images/options.
2. `GET /api/v1/store/categories/?brand=themetalstore` returns TMS categories.
3. Detail-by-slug returns full customization data.
4. Brand isolation verified — another brand sees its own/empty catalog, never TMS's.
5. Admin can create a brand-scoped product with images + options.
6. Tests pass; migrations apply cleanly on the live (empty) DB.

---

## 9. Roadmap (subsequent sub-projects)

| ID | Title | Summary |
|---|---|---|
| **BE-2** | Checkout + payments (hybrid) | Build Razorpay `create`/`verify` (frontend calls these but they don't exist); route `stock`→Razorpay, `made_to_order`→enquiry/quote lead. |
| **BE-3** | Customer auth & identity | Reconcile `crm.Contact` (OTP) vs Django `User` (Google) so a logged-in customer can own a cart and order; enable customer signup (OTP currently 404s for unknown numbers). |
| **FE-1** | Storefront completion | Product detail live fetch + `:slug` route, delete hardcoded `data/store.js`, real order data on success page, checkout prefill from logged-in user, search/filter. |
| **FE-2** | Service lead-gen | Working enquiry + "Book a site visit / call" forms (Contact form is currently dead; Calculator lead not sent), service sections. |
| **FE-3** | Marketing sections | Testimonials, process/"how it works", FAQ, trust signals. |

---

## 10. Key Risks

- **Identity/checkout mismatch (BE-3):** OTP customers (`Contact`) cannot use the `User`-bound cart/checkout today. BE-1 doesn't touch this, but it blocks a working purchase until BE-3.
- **Shared global catalog today:** other brands may already rely on the un-scoped behavior. Mitigated by the backfill migration and the empty live table, but verify no other brand has ecommerce data before deploy.
- **Image source dependency:** seed pulls from `themetalstore.in`; resilient download prevents seed failure, but real product images should be uploaded via admin/media for production.
