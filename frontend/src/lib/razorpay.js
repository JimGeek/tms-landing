/**
 * Razorpay Checkout launcher. Loads the SDK on demand and opens the modal
 * with the order_id returned by /quotations/from-estimate/checkout/.
 * Backend webhook (/api/v1/payments/razorpay/webhook) handles server-side
 * verification — this client just launches the UI.
 * PART_A_PHASE2 §4.3.
 */

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
const SDK_URL = "https://checkout.razorpay.com/v1/checkout.js";

let sdkLoading = null;

function loadSdk() {
    if (typeof window === "undefined") return Promise.reject(new Error("SSR"));
    if (window.Razorpay) return Promise.resolve();
    if (sdkLoading) return sdkLoading;
    sdkLoading = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = SDK_URL;
        s.async = true;
        s.onload = () => resolve();
        s.onerror = () => { sdkLoading = null; reject(new Error("Razorpay SDK failed to load")); };
        document.body.appendChild(s);
    });
    return sdkLoading;
}

/**
 * handle: { razorpay_order_id, amount, currency, sealed_quotation_version_id, quotation_id }
 * cb: { prefill?, onSuccess?, onDismiss? }
 */
export async function openRazorpayCheckout(handle, cb = {}) {
    if (!RAZORPAY_KEY) throw new Error("VITE_RAZORPAY_KEY_ID is not configured");
    await loadSdk();
    if (!window.Razorpay) throw new Error("Razorpay SDK unavailable");
    const opts = {
        key: RAZORPAY_KEY,
        amount: Math.round(Number(handle.amount) * 100),  // rupees → paise
        currency: handle.currency || "INR",
        order_id: handle.razorpay_order_id,
        name: "The Metal Store",
        description: `Quotation #${handle.quotation_id}`,
        prefill: cb.prefill || {},
        notes: {
            sealed_quotation_version_id: String(handle.sealed_quotation_version_id),
            quotation_id: String(handle.quotation_id),
        },
        handler: cb.onSuccess,
        modal: { ondismiss: cb.onDismiss },
        theme: { color: "#000000" },
    };
    const rzp = new window.Razorpay(opts);
    rzp.open();
}
