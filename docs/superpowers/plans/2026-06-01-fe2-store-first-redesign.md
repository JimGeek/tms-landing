# FE-2: Store-First Redesign + Lead-Gen Form — Implementation Plan

> **For agentic workers:** Steps use checkbox (`- [ ]`) syntax. No automated test harness exists; verify via `npm run build` + browser walkthrough (Task 8).

**Goal:** Make the homepage the storefront in a clean black-&-white industrial style, with a unified product grid (Buy vs Get-Quote), All/Products/Services filter, and a real lead-gen form posting to the existing CRM capture endpoint.

**Architecture:** Reuse FE-1's `src/api/store.js`. Add `src/api/leads.js` (capture POST) + `EnquiryModal` + a small `EnquiryContext` so any component can open the form. Recompose `Home.jsx` to store-first, restyle `Store.jsx`/cards, swap the product-detail WhatsApp path for the modal. Backend unchanged (capture endpoint already exists).

**Tech Stack:** React 18, Vite, React Router 6, framer-motion, Tailwind, lucide-react. Repo: `themetalstore-landing/frontend`. Env: `VITE_API_URL`, `VITE_BRAND_SLUG`, new `VITE_CAPTURE_KEY`.

---

## Task 1: Env + leads API module

**Files:** Modify `frontend/.env`; Create `frontend/src/api/leads.js`

- [ ] **Step 1: Add the capture key to `.env`.** Append:
```
VITE_CAPTURE_KEY=8c664d67-b863-4f91-9a88-d19b4fdad88e
```
(Public website capture key for themetalstore; same pattern as sibling brand sites.)

- [ ] **Step 2: Create `frontend/src/api/leads.js`.**
```js
const API_URL = import.meta.env.VITE_API_URL;
const BRAND = import.meta.env.VITE_BRAND_SLUG || 'themetalstore';
const CAPTURE_KEY = import.meta.env.VITE_CAPTURE_KEY;

/**
 * Submit a website enquiry to the GeniusOS CRM capture endpoint.
 * @returns {Promise<{ok: boolean, inquiryId?: number}>}
 */
export async function submitEnquiry({ name, phone, email = '', message = '', product = '', productSlug = '', sourcePage = '' }) {
  if (!CAPTURE_KEY) {
    throw new Error('Enquiry is not configured (missing capture key).');
  }
  const res = await fetch(`${API_URL}/api/v1/crm/inquiries/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Capture-Key': CAPTURE_KEY },
    body: JSON.stringify({
      brand_slug: BRAND,
      name,
      phone,
      email,
      website: '', // honeypot — must stay empty
      meta: { product, product_slug: productSlug, source_page: sourcePage, message },
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error('Could not submit your enquiry. Please try again.');
  }
  const data = json && json.data !== undefined ? json.data : json;
  return { ok: true, inquiryId: data?.inquiry_id };
}
```

- [ ] **Step 3: Commit.**
```bash
git add frontend/.env frontend/src/api/leads.js
git commit -m "feat(leads): add CRM capture API module + env key"
```

---

## Task 2: EnquiryContext (global trigger)

**Files:** Create `frontend/src/context/EnquiryContext.jsx`

- [ ] **Step 1: Create the context.**
```jsx
import React, { createContext, useContext, useState } from 'react';

const EnquiryContext = createContext();

export const useEnquiry = () => useContext(EnquiryContext);

export const EnquiryProvider = ({ children }) => {
  const [enquiry, setEnquiry] = useState({ open: false, product: null, sourcePage: '' });

  const openEnquiry = ({ product = null, sourcePage = '' } = {}) =>
    setEnquiry({ open: true, product, sourcePage });
  const closeEnquiry = () =>
    setEnquiry((prev) => ({ ...prev, open: false }));

  return (
    <EnquiryContext.Provider value={{ ...enquiry, openEnquiry, closeEnquiry }}>
      {children}
    </EnquiryContext.Provider>
  );
};
```

- [ ] **Step 2: Commit.**
```bash
git add frontend/src/context/EnquiryContext.jsx
git commit -m "feat(leads): add EnquiryContext for global modal trigger"
```

---

## Task 3: EnquiryModal component

**Files:** Create `frontend/src/components/EnquiryModal.jsx`

- [ ] **Step 1: Create the modal** (styling mirrors `auth/LoginModal.jsx`).
```jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, ArrowRight, Check } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { submitEnquiry } from '../api/leads';

const EnquiryModal = () => {
  const { open, product, sourcePage, closeEnquiry } = useEnquiry();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setError('');
      setForm({
        name: '', phone: '', email: '',
        message: product ? `I'm interested in: ${product.name}` : '',
      });
    }
  }, [open, product]);

  if (!open) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await submitEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        product: product?.name || '',
        productSlug: product?.slug || '',
        sourcePage,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative"
        >
          <button onClick={closeEnquiry} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>

          <div className="p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} />
                </div>
                <h2 className="text-2xl font-bold font-display mb-2">Enquiry received</h2>
                <p className="text-gray-500 mb-6">Our team will reach out shortly with a tailored quote.</p>
                <button onClick={closeEnquiry} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-metallic-900 transition-colors">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold font-display mb-2">Request a Quote</h2>
                <p className="text-gray-500 mb-6">
                  {product ? `Tell us about your ${product.name} requirement.` : 'Tell us about your custom project.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" required placeholder="Your name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.name} onChange={(e) => update('name', e.target.value)} />
                  <input type="tel" required placeholder="Phone number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                  <input type="email" placeholder="Email (optional)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.email} onChange={(e) => update('email', e.target.value)} />
                  <textarea rows="3" placeholder="Your requirement"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.message} onChange={(e) => update('message', e.target.value)} />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={status === 'loading'}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-metallic-900 transition-colors disabled:opacity-70">
                    {status === 'loading' ? <Loader className="animate-spin" /> : <>Submit Enquiry <ArrowRight size={18} /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnquiryModal;
```

- [ ] **Step 2: Commit.**
```bash
git add frontend/src/components/EnquiryModal.jsx
git commit -m "feat(leads): add EnquiryModal form with success/error states"
```

---

## Task 4: Wire provider + modal into App

**Files:** Modify `frontend/src/App.jsx`

- [ ] **Step 1: Add imports** (after the `AuthProvider` import line):
```jsx
import { EnquiryProvider } from './context/EnquiryContext';
import EnquiryModal from './components/EnquiryModal';
```

- [ ] **Step 2: Wrap providers + mount modal.** Change the provider nesting so `EnquiryProvider` wraps `Router`, and mount `<EnquiryModal />` next to `<CartDrawer />`:
```jsx
      <AuthProvider>
        <CartProvider>
          <EnquiryProvider>
            <Router>
              <AnalyticsTracker />
              <SEO />
              <CartDrawer />
              <EnquiryModal />
              <Routes>
                ...unchanged...
              </Routes>
              <ChatWidget />
            </Router>
          </EnquiryProvider>
        </CartProvider>
      </AuthProvider>
```
(Keep all existing `<Routes>`/`<ChatWidget>` content exactly as-is; only add the provider wrapper + `<EnquiryModal />` line.)

- [ ] **Step 3: Verify build.** Run: `cd frontend && npm run build`. Expected: builds clean.

- [ ] **Step 4: Commit.**
```bash
git add frontend/src/App.jsx
git commit -m "feat(leads): mount EnquiryProvider and modal in app shell"
```

---

## Task 5: Restyle Store list — black/white industrial + type filter

**Files:** Modify `frontend/src/pages/Store.jsx`

- [ ] **Step 1: Add type-filter state + enquiry hook.** In the imports add:
```jsx
import { useEnquiry } from '../context/EnquiryContext';
```
After the `search` state line add:
```jsx
const [typeFilter, setTypeFilter] = useState('all'); // all | stock | made_to_order
const { openEnquiry } = useEnquiry();
```

- [ ] **Step 2: Compose type filter into `filteredProducts`.** Replace the existing `filteredProducts` declaration with:
```jsx
const filteredProducts = products.filter(p => {
  const catOk = selectedCategory === 'All' || p.category === selectedCategory;
  const typeOk = typeFilter === 'all' || p.productType === typeFilter;
  return catOk && typeOk;
});
```

- [ ] **Step 3: Add the All/Products/Services segment** directly above the category pills block (before the `{/* Horizontal Filters */}` div). Use:
```jsx
{/* Type segment */}
<div className="flex justify-center mb-6">
  <div className="inline-flex bg-metallic-100 rounded-full p-1">
    {[['all','All'],['stock','Products'],['made_to_order','Services']].map(([val,label]) => (
      <button key={val} onClick={() => setTypeFilter(val)}
        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${typeFilter === val ? 'bg-black text-white shadow' : 'text-metallic-600 hover:text-black'}`}>
        {label}
      </button>
    ))}
  </div>
</div>
```

- [ ] **Step 4: Make the card CTA type-aware.** In the product card, the price/action row currently always links into the card. Change the action chip so made_to_order shows "Get Quote" and opens the modal instead of navigating. Replace the action `<div>` (the `Buy Now`/`Enquire` chip from FE-1) with:
```jsx
{item.productType === 'made_to_order' ? (
  <button
    onClick={(e) => { e.preventDefault(); openEnquiry({ product: item, sourcePage: 'store-grid' }); }}
    className="bg-white text-black border border-black px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
  >
    Get Quote <ArrowRight size={16} />
  </button>
) : (
  <div className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 group-hover:bg-metallic-800 transition-colors">
    Buy Now <ArrowRight size={16} />
  </div>
)}
```
NOTE: because the card is wrapped in a `<Link>`, the made_to_order button calls `e.preventDefault()` so clicking "Get Quote" opens the modal rather than navigating. The rest of the card still links to detail.

- [ ] **Step 5: Verify in dev.** `npm run build` (clean), and visual check in Task 8.

- [ ] **Step 6: Commit.**
```bash
git add frontend/src/pages/Store.jsx
git commit -m "feat(store): add Products/Services type filter and Get-Quote card CTA"
```

---

## Task 6: Product detail — modal instead of WhatsApp

**Files:** Modify `frontend/src/pages/StoreProductDetail.jsx`

- [ ] **Step 1: Swap the import + handler.** Add import:
```jsx
import { useEnquiry } from '../context/EnquiryContext';
```
Add the hook near the other hooks:
```jsx
const { openEnquiry } = useEnquiry();
```
Replace the `handleRequestQuote` function (the WhatsApp `window.open` from FE-1) with:
```jsx
const handleRequestQuote = () => {
  openEnquiry({ product: { name: product.name, slug: product.slug }, sourcePage: 'product-detail' });
};
```

- [ ] **Step 2: Verify build.** `npm run build` clean. The made_to_order CTA already calls `handleRequestQuote` (from FE-1), now opening the modal.

- [ ] **Step 3: Commit.**
```bash
git add frontend/src/pages/StoreProductDetail.jsx
git commit -m "feat(store): product-detail Get-Quote opens enquiry modal"
```

---

## Task 7: Store-first homepage + Shop-led nav

**Files:** Modify `frontend/src/pages/Home.jsx`, `frontend/src/components/Header.jsx`

- [ ] **Step 1: Recompose `Home.jsx`** to a compact store-first hero + the store grid + Advantages as a trust strip. Replace the whole file with:
```jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import Store from './Store';
import Advantages from '../components/Advantages';
import { useEnquiry } from '../context/EnquiryContext';

const Home = () => {
    const { openEnquiry } = useEnquiry();
    return (
        <main>
            {/* Store-first hero */}
            <section className="pt-32 pb-10 bg-white text-center px-6">
                <p className="text-xs font-bold tracking-[0.32em] uppercase text-metallic-500 mb-4">
                    Fabricated in Vadodara · Since 2014
                </p>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.98] text-black">
                    Made of metal.<br /><span className="text-metallic-400">Made for you.</span>
                </h1>
                <p className="text-metallic-600 max-w-xl mx-auto mt-5 mb-8 text-base md:text-lg">
                    Premium gates, gazebos, grills &amp; hardware — buy off the shelf, or commission something custom.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="#store" className="px-7 py-3.5 rounded-lg bg-black text-white font-bold text-sm tracking-wide uppercase hover:bg-metallic-800 transition-colors flex items-center gap-2">
                        Shop the Collection <ArrowRight size={18} />
                    </a>
                    <button onClick={() => openEnquiry({ sourcePage: 'hero' })}
                        className="px-7 py-3.5 rounded-lg border border-metallic-300 text-black font-bold text-sm tracking-wide uppercase hover:bg-metallic-50 transition-colors">
                        Start a Custom Project
                    </button>
                </div>
            </section>

            {/* Store grid (already has search + filters) */}
            <section id="store">
                <Store isPage={false} />
            </section>

            {/* Trust strip */}
            <section id="advantages">
                <Advantages />
            </section>
        </main>
    );
};

export default Home;
```
NOTE: This removes the full-screen `Hero` carousel and `Contact` section from the homepage. `Hero.jsx` and `Contact.jsx` remain in the repo (unused by Home; Contact still reachable if routed elsewhere). The `#contact` nav anchor is updated in Step 2.

- [ ] **Step 2: Update `Header.jsx` nav** to be Shop-led. Replace the `navLinks` array (lines ~52-57) with:
```jsx
    const navLinks = [
        { name: 'Shop', href: '/' },
        { name: 'Our Work', href: '/work' },
        { name: 'Inspiration', href: '/inspiration' },
        { name: 'About', href: '/about' },
    ];
```
(Removes the dead `#contact` anchor — Contact is no longer a homepage section. Cart + Login buttons unchanged.)

- [ ] **Step 3: Verify build.** `cd frontend && npm run build`. Expected: clean.

- [ ] **Step 4: Commit.**
```bash
git add frontend/src/pages/Home.jsx frontend/src/components/Header.jsx
git commit -m "feat(store): store-first homepage and shop-led navigation"
```

---

## Task 8: End-to-end verification

**Files:** none

- [ ] **Step 1: Build + lint-via-build.** `cd frontend && npm run build`. Expected: succeeds, no errors.

- [ ] **Step 2: Run dev against live API.** `npm run dev` (uses production `VITE_API_URL` + the new `VITE_CAPTURE_KEY`). Open the site.

- [ ] **Step 3: Manual checklist (done criteria):**
  - `/` shows the store-first homepage (compact hero + product grid), black & white.
  - All/Products/Services segment + category chips + search filter together.
  - Stock card → "Buy Now" adds to cart; made_to_order card → "Get Quote" opens modal.
  - Product detail made_to_order → "Request a Quote" opens modal (not WhatsApp).
  - Hero "Start a Custom Project" opens modal.
  - Submitting the form shows the success state and returns an `inquiry_id`.
  - No console errors; mobile layout intact.

- [ ] **Step 4: Verify the lead landed (optional, via prod shell).** A submitted enquiry should appear as a `crm.Inquiry`/`Contact` for brand themetalstore. (Spacing test submits avoids the 10/hr rate limit.)

---

## Done criteria (maps to spec §7)
1. Store-first homepage in black-&-white industrial style — Task 7.
2. Combined type + category + search filtering — Task 5.
3. Buy vs Get-Quote per product type — Tasks 5, 6.
4. Enquiry form creates a CRM lead with success state — Tasks 1-3, 8.
5. Honeypot + required-field validation; no WhatsApp quote path — Tasks 1, 3, 6.
6. Build clean, responsive, no console errors — Task 8.

## Out of scope (do NOT touch): checkout/payments (BE-2), auth (BE-3), final copy, product photography.
