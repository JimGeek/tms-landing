/**
 * computePrice — landing-page client for POST /api/v1/pricing/landing/compute/.
 * JS version for the Vite/React codebase (no TS).
 * PART_A_PHASE2 §2.3.
 *
 * Returned object is the unwrapped engine response — the backend wraps via
 * {success, data, errors} so we unwrap here so callers work with the priced
 * payload directly.
 */

const API = import.meta.env.VITE_API_URL || "https://api.superhomes.app";
const BRAND_SLUG = import.meta.env.VITE_BRAND_SLUG || "themetalstore";
const CAPTURE_KEY = import.meta.env.VITE_CAPTURE_KEY || "";

export async function computePrice(scope, params, quantity = 1) {
    const r = await fetch(`${API}/api/v1/pricing/landing/compute/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Capture-Key": CAPTURE_KEY,
        },
        body: JSON.stringify({ brand_slug: BRAND_SLUG, scope, params, quantity }),
    });
    if (!r.ok) {
        const body = await r.json().catch(() => ({ error: `HTTP_${r.status}` }));
        const err = new Error(body.message || body.error || `HTTP_${r.status}`);
        Object.assign(err, body);
        throw err;
    }
    const wrapped = await r.json();
    return wrapped?.data ?? wrapped;
}
