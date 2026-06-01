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
    customizationOptions: (raw.options || []).map((opt) => ({
      name: opt.name,
      type: opt.option_type,
      values: (opt.values || []).map((v) => v.value),
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
  return arr.map((c) => c.name);
}
