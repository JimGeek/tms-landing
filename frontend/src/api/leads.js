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
