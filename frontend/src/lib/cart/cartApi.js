const API_URL = import.meta.env.VITE_API_URL || 'https://api.superhomes.app';

const DEVICE_ID_KEY = 'superhomes_cart_device_id';
const VERSION_STAMP_KEY = 'superhomes_cart_version';

export function getDeviceId() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(DEVICE_ID_KEY);
}

export function ensureDeviceId() {
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function clearDeviceId() {
  window.localStorage.removeItem(DEVICE_ID_KEY);
}

export function bumpCartVersion() {
  window.localStorage.setItem(VERSION_STAMP_KEY, String(Date.now()));
}

function authHeaders({ token, ensureDevice }) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
    return headers;
  }
  const id = ensureDevice ? ensureDeviceId() : getDeviceId();
  if (id) headers['X-Cart-Device-Id'] = id;
  return headers;
}

async function call(method, path, body, opts = {}) {
  const res = await fetch(`${API_URL}/api/v1/store${path}`, {
    method,
    headers: authHeaders(opts),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    const err = new Error(`Cart ${method} ${path} → ${res.status}`);
    err.status = res.status;
    err.detail = detail;
    throw err;
  }
  const json = await res.json();
  // Backend wraps in { success, data, errors }; unwrap data.
  return json?.data ?? json;
}

export const cartApi = {
  fetchCart: (token) => call('GET', '/cart/', null, { token }),
  addItem:  (input, token) => call('POST', '/cart/items/', input, { token, ensureDevice: !token }),
  patchItem:(id, body, token) => call('PATCH', `/cart/items/${id}/`, body, { token }),
  removeItem:(id, token) => call('DELETE', `/cart/items/${id}/`, null, { token }),
  clear:    (token) => call('POST', '/cart/clear/', {}, { token }),
  refresh:  (token) => call('POST', '/cart/refresh-snapshots/', {}, { token }),
  mergeDeviceIntoContact: (deviceIds, token) =>
    call('POST', '/cart/merge/', { device_ids: deviceIds }, { token }),
  checkout: (input, token) => call('POST', '/cart/checkout/', input, { token }),
  pollCheckoutSession: (id, token) =>
    call('GET', `/cart/checkout-session/${id}/`, null, { token }),
};
