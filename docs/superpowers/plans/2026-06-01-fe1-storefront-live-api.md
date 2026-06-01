# FE-1: Wire Storefront to Live API — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. No automated test harness exists in this repo; verification is manual against the live API per Task 6.

**Goal:** Connect the storefront to the BE-1 brand-scoped API so products list, detail-by-slug resolves, search works, and made-to-order items show a Request-a-Quote CTA.

**Architecture:** A single `src/api/store.js` module owns the API contract (fetch helpers + `normalizeProduct` mapper). `Store.jsx` and `StoreProductDetail.jsx` consume it. Route changes from `:id` to `:slug`. Hardcoded `data/store.js` is deleted.

**Tech Stack:** React 18, Vite, React Router 6, fetch. Repo: `themetalstore-landing/frontend`. Brand slug from `import.meta.env.VITE_BRAND_SLUG`.

---

## Task 1: Create the store API module

**Files:** Create `frontend/src/api/store.js`

- [ ] **Step 1: Write the module.**

```js
const API_URL = import.meta.env.VITE_API_URL;
const BRAND = import.meta.env.VITE_BRAND_SLUG || 'themetalstore';

function unwrap(json) {
  // EnvelopeJSONRenderer: { success, data, errors }
  return json && json.data !== undefined ? json.data : json;
}

function formatPrice(raw) {
  const num = parseFloat(raw.price);
  const unit = (raw.price_unit || '').trim();
  if (unit.toLowerCase() === 'free' || (num === 0 && unit.toLowerCase().includes('free'))) {
    return { priceNumber: 0, displayPrice: 'Free' };
  }
  const formatted = `₹${num.toLocaleString('en-IN')}`;
  if (unit && unit.startsWith('/')) {
    return { priceNumber: num, displayPrice: `Starting @ ${formatted}${unit}` };
  }
  if (unit) {
    return { priceNumber: num, displayPrice: `${unit} ${formatted}`.trim() };
  }
  return { priceNumber: num, displayPrice: formatted };
}

export function normalizeProduct(raw) {
  const { priceNumber, displayPrice } = formatPrice(raw);
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    description: raw.description,
    image: raw.image || '/hero-bg.png',
    category: raw.category_name || '',
    priceNumber,
    displayPrice,
    productType: raw.product_type,
    has3D: !!raw.has_3d,
    modelConfig: raw.model_config || null,
    customizationOptions: (raw.options || []).map(opt => ({
      name: opt.name,
      type: opt.option_type,
      values: (opt.values || []).map(v => v.value),
    })),
  };
}

export async function fetchProducts({ search } = {}) {
  const params = new URLSearchParams({ brand: BRAND });
  if (search) params.set('search', search);
  const res = await fetch(`${API_URL}/api/v1/store/products/?${params}`);
  if (!res.ok) throw new Error('Failed to load products');
  const list = unwrap(await res.json());
  const arr = Array.isArray(list) ? list : (list.results || []);
  return arr.map(normalizeProduct);
}

export async function fetchProduct(slug) {
  const res = await fetch(`${API_URL}/api/v1/store/products/${slug}/?brand=${BRAND}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load product');
  return normalizeProduct(unwrap(await res.json()));
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/v1/store/categories/?brand=${BRAND}`);
  if (!res.ok) throw new Error('Failed to load categories');
  const list = unwrap(await res.json());
  const arr = Array.isArray(list) ? list : (list.results || []);
  return arr.map(c => c.name);
}
```

- [ ] **Step 2: Lint check.** Run: `cd frontend && npm run lint -- src/api/store.js` (or full `npm run lint`). Expected: no errors for this file.

- [ ] **Step 3: Commit.**
```bash
git add frontend/src/api/store.js
git commit -m "feat(store): add store API module with product normalization"
```

---

## Task 2: Route change :id → :slug

**Files:** Modify `frontend/src/App.jsx:54`

- [ ] **Step 1:** Change the route line:
```jsx
<Route path="store/product/:id" element={<StoreProductDetail />} />
```
to:
```jsx
<Route path="store/product/:slug" element={<StoreProductDetail />} />
```

- [ ] **Step 2: Commit.**
```bash
git add frontend/src/App.jsx
git commit -m "feat(store): route product detail by slug"
```

---

## Task 3: Rewire Store list page (fetch helper, links, search)

**Files:** Modify `frontend/src/pages/Store.jsx`

- [ ] **Step 1: Replace the data-fetching + state head.** Replace the `useEffect` fetch block (lines ~15-42) and add search state. New imports at top: `import { fetchProducts, fetchCategories } from '../api/store';` and add `Search` to the lucide import.

Replace state declarations + effect with:
```jsx
const [selectedCategory, setSelectedCategory] = useState('All');
const [products, setProducts] = useState([]);
const [categories, setCategories] = useState(['All']);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');
const { addToCart } = useCart();

useEffect(() => {
    fetchCategories().then(cats => setCategories(['All', ...cats])).catch(() => {});
}, []);

useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
        fetchProducts({ search })
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, 300); // debounce
    return () => clearTimeout(t);
}, [search]);
```

- [ ] **Step 2: Fix the category filter** to use normalized `category`:
```jsx
const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);
```

- [ ] **Step 3: Add the search input** above the category pills (inside the container, before the filters div):
```jsx
<div className="max-w-md mx-auto mb-8 relative">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-metallic-400" size={18} />
    <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full bg-white border border-metallic-200 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black/5"
    />
</div>
```

- [ ] **Step 4: Fix the card link and price.** Change the `<Link to=...>` (line ~107) to:
```jsx
to={`/store/product/${item.slug}`}
```
Change the category badge `{item.category_name}` → `{item.category}` and price `{item.price}` → `{item.displayPrice}`.

- [ ] **Step 5: Run dev server, verify.** `cd frontend && npm run dev`; open the store page; confirm products load with clean prices, search filters, cards are clickable. (Detail target wired in Task 4.)

- [ ] **Step 6: Commit.**
```bash
git add frontend/src/pages/Store.jsx
git commit -m "feat(store): live fetch, search, and slug-linked product cards"
```

---

## Task 4: Rewrite Product Detail (live fetch by slug + quote CTA)

**Files:** Modify `frontend/src/pages/StoreProductDetail.jsx`

- [ ] **Step 1: Replace imports + data loading.** Remove `import { storeProducts } from '../data/store';`. Add `import { fetchProduct } from '../api/store';`. Change `useParams` to `const { slug } = useParams();`.

Replace the load `useEffect` (lines ~20-42) with:
```jsx
const [notFound, setNotFound] = useState(false);

useEffect(() => {
    let active = true;
    fetchProduct(slug).then(found => {
        if (!active) return;
        if (!found) { setNotFound(true); return; }
        setProduct(found);
        setPrice(found.displayPrice);
        const initial = {};
        (found.customizationOptions || []).forEach(opt => { initial[opt.name] = opt.values[0]; });
        setSelections(initial);
        if (found.has3D) setViewMode('3d');
    }).catch(() => setNotFound(true));
    return () => { active = false; };
}, [slug]);

if (notFound) return (
    <div className="pt-32 text-center">
        <p className="text-xl font-bold mb-4">Product not found.</p>
        <button onClick={() => navigate('/store')} className="text-black underline font-bold">Back to Store</button>
    </div>
);
```
(Keep the existing `if (!product) return <Loading/>` line after this.)

- [ ] **Step 2: Quote-vs-cart CTA.** Replace the single Add-to-Order button block (lines ~155-165) with a conditional. Add a `handleRequestQuote` function next to `handleAddToCart`:
```jsx
const handleRequestQuote = () => {
    const opts = Object.entries(selections).map(([k, v]) => `${k}: ${v}`).join(', ');
    const msg = `Hi, I'd like a quote for "${product.name}"${opts ? ` (${opts})` : ''}.`;
    window.open(`https://wa.me/919316723563?text=${encodeURIComponent(msg)}`, '_blank');
};
```
CTA block:
```jsx
<div className="flex flex-col gap-4 mb-8">
    {product.productType === 'made_to_order' ? (
        <button onClick={handleRequestQuote}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-black/10">
            <ShoppingCart size={20} /> Request a Quote
        </button>
    ) : (
        <button onClick={handleAddToCart}
            className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-black/10">
            <ShoppingCart size={20} /> Add to Order
        </button>
    )}
    <p className="text-center text-xs text-gray-400">
        {product.productType === 'made_to_order'
            ? 'Custom fabrication • Our team will share a tailored quote'
            : 'Secure payment via RazorPay • Free Shipping > ₹50k'}
    </p>
</div>
```

- [ ] **Step 3: Fix remaining shape refs.** `product.modelConfig?.style` already matches normalized output (kept). Category display `{product.category}` already matches. Ensure `handleAddToCart` keeps using `product` (now includes `displayPrice`); update the cart item to carry `price: product.displayPrice` and `priceNumber` so CartContext can render. Specifically in `handleAddToCart`, the `addToCart({...})` payload: add `price: product.displayPrice`.

- [ ] **Step 4: Verify in dev server.** Click a stock product → Add to Order works (drawer opens). Click the CNC Gate (made_to_order) → 3D shows, "Request a Quote" opens WhatsApp with prefilled text. Bad slug → "Product not found".

- [ ] **Step 5: Commit.**
```bash
git add frontend/src/pages/StoreProductDetail.jsx
git commit -m "feat(store): live product detail by slug with made-to-order quote CTA"
```

---

## Task 5: Delete hardcoded catalog

**Files:** Delete `frontend/src/data/store.js`

- [ ] **Step 1: Confirm no remaining importers.** Run: `grep -rn "data/store" frontend/src`. Expected: no results (Task 4 removed the only import).

- [ ] **Step 2: Delete + commit.**
```bash
git rm frontend/src/data/store.js
git commit -m "chore(store): remove hardcoded product data"
```

---

## Task 6: End-to-end verification against live API

**Files:** none

- [ ] **Step 1: Build + lint.** Run `cd frontend && npm run lint && npm run build`. Expected: build succeeds, no lint errors.

- [ ] **Step 2: Run against live API.** `npm run dev`. With the live `VITE_API_URL=https://api.superhomes.app`, the seeded TMS catalog (6 products) should appear ONLY if production DB is seeded. If production is empty, point `.env` `VITE_API_URL` at a locally running backend (`http://127.0.0.1:8000`) that has been seeded, OR note that production seeding is a separate deploy step.

- [ ] **Step 3: Manual checklist (done criteria):**
  - Store lists products, clean prices, clickable cards
  - Detail resolves by slug, no bounce; bad slug → not-found
  - Search filters
  - Made-to-order → Request a Quote (WhatsApp); stock → Add to Order
  - No console errors

- [ ] **Step 4: Note production data state** to the user (seeding production DB is a deploy task, not part of this frontend plan).

---

## Done criteria (maps to spec §6)
1. Store lists live products with clean prices + clickable cards — Tasks 3.
2. Detail resolves by slug, no bounce — Task 4.
3. Search filters via API — Task 3.
4. Made-to-order quote CTA vs stock add-to-order — Task 4.
5. `data/store.js` deleted — Task 5.
6. Dev runs clean against live API — Task 6.

## Out of scope (do NOT touch): CartDrawer checkout, Razorpay prefill, success page (BE-2/BE-3).
