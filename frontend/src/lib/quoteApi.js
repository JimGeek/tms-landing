/**
 * quoteApi.js
 * API helper for the TMS native quote/cart experience.
 * All calls hit the GeniusOS backend at VITE_API_URL.
 * Response envelope: { success, data, errors } — we unwrap via .data
 */

const API_URL = import.meta.env.VITE_API_URL || 'https://api.superhomes.app';
const BRAND = 'themetalstore';
const BASE = `${API_URL}/api/v1/quotations/customer/${BRAND}`;

/** Unwrap the GeniusOS envelope, throw on failure */
async function unwrap(res) {
  let body;
  try {
    body = await res.json();
  } catch {
    throw new Error(`HTTP ${res.status}: invalid JSON`);
  }
  if (!res.ok || body.success === false) {
    const msg =
      (Array.isArray(body.errors) && body.errors.length > 0
        ? (typeof body.errors[0] === 'string' ? body.errors[0] : JSON.stringify(body.errors[0]))
        : null) ||
      body.message ||
      body.detail ||
      `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return body.data;
}

/** GET /config/ */
export async function fetchConfig() {
  const res = await fetch(`${BASE}/config/`);
  return unwrap(res);
}

/** GET /categories/ */
export async function fetchCategories() {
  const res = await fetch(`${BASE}/categories/`);
  return unwrap(res);
}

/** GET /catalogue/?category=<slug>&search=<q> */
export async function fetchCatalogue({ category = '', search = '' } = {}) {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const qs = params.toString();
  const res = await fetch(`${BASE}/catalogue/${qs ? `?${qs}` : ''}`);
  return unwrap(res);
}

/**
 * POST /drafts/
 * items: Array<{ catalogue_item_id, catalogue_variant_id?, label, unit_rate, quantity, unit }>
 * draft_id optional for updates
 */
export async function saveDraft({ draftId, items }) {
  const payload = {
    ...(draftId ? { draft_id: draftId } : {}),
    sections: [
      {
        name: 'Cart',
        items: items.map((item) => ({
          source_strategy: item.catalogue_variant_id ? 'variants' : 'catalogue',
          catalogue_item_id: item.catalogue_item_id,
          ...(item.catalogue_variant_id ? { catalogue_variant_id: item.catalogue_variant_id } : {}),
          label: item.label,
          unit_rate: item.unit_rate,
          quantity: item.quantity,
          unit: item.unit,
        })),
      },
    ],
  };
  const res = await fetch(`${BASE}/drafts/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return unwrap(res); // { draft_id, frozen_total }
}

/** POST /otp/send/ → { verification_id } */
export async function sendOtp({ phone }) {
  const res = await fetch(`${BASE}/otp/send/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  return unwrap(res);
}

/** POST /otp/verify/ → { access, refresh, contact_id, draft_id } */
export async function verifyOtp({ verificationId, otp, phone, draftId, name }) {
  const res = await fetch(`${BASE}/otp/verify/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      verification_id: verificationId,
      otp,
      phone,
      draft_id: draftId,
      ...(name ? { name } : {}),
    }),
  });
  return unwrap(res);
}

/** POST /drafts/<id>/finalize/ [Bearer] → { quotation_id, frozen_total, deposit, hmac_signature } */
export async function finalizeDraft({ draftId, accessToken }) {
  const res = await fetch(`${BASE}/drafts/${draftId}/finalize/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return unwrap(res);
}

/**
 * POST /drafts/<id>/payment/order/ [Bearer]
 * signed_payload: { quotation_id, frozen_total, deposit_amount }
 * → { order_id, amount, currency, key_id }
 */
export async function createPaymentOrder({ draftId, accessToken, signedPayload, hmacSignature }) {
  const res = await fetch(`${BASE}/drafts/${draftId}/payment/order/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ signed_payload: signedPayload, hmac_signature: hmacSignature }),
  });
  return unwrap(res); // { order_id, amount, currency, key_id }
}

/**
 * POST /drafts/<id>/payment/verify/ [Bearer]
 * → { status: 'sealed' }
 */
export async function verifyPayment({
  draftId,
  accessToken,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  signedPayload,
  hmacSignature,
}) {
  const res = await fetch(`${BASE}/drafts/${draftId}/payment/verify/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      signed_payload: signedPayload,
      hmac_signature: hmacSignature,
    }),
  });
  return unwrap(res); // { status: 'sealed' }
}

/** Dynamically load Razorpay SDK on demand */
let rzpSdkPromise = null;
export function loadRazorpaySdk() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'));
  if (window.Razorpay) return Promise.resolve();
  if (rzpSdkPromise) return rzpSdkPromise;
  rzpSdkPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.async = true;
    s.onload = resolve;
    s.onerror = () => {
      rzpSdkPromise = null;
      reject(new Error('Failed to load Razorpay SDK'));
    };
    document.body.appendChild(s);
  });
  return rzpSdkPromise;
}

/**
 * Open Razorpay checkout modal.
 * order: { order_id, amount, currency, key_id }
 * handlers: { onSuccess(paymentData), onDismiss? }
 */
export async function openRazorpayCheckout(order, handlers = {}) {
  await loadRazorpaySdk();
  const rzp = new window.Razorpay({
    key: order.key_id,
    order_id: order.order_id,
    amount: order.amount, // already in paise from backend
    currency: order.currency || 'INR',
    name: 'The Metal Store',
    description: 'Quotation deposit',
    theme: { color: '#F59E0B' },
    handler: handlers.onSuccess,
    modal: { ondismiss: handlers.onDismiss || (() => {}) },
  });
  rzp.open();
}
