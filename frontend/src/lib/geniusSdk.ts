/**
 * GeniusOS Storefront SDK — Marvel Homes landing.
 *
 * One module per landing site so each brand can ship without depending on
 * a published NPM package. Identical contract to the canonical SDK at
 * frontend/src/lib/storefrontSdk.ts in the GeniusOS repo + the matching
 * vendored copies in just-bathrooms, vantage-landing, and themetalstore-landing.
 *
 * The SDK speaks to the four storefront endpoints + lead capture:
 *   /api/v1/store/catalog?brand=<slug>          (Phase 5.3)
 *   /api/v1/store/inventory?product=&location=  (Phase 5.3)
 *   /api/v1/store/invoice/<order_id>            (Phase 5.4)
 *   /api/v1/payments/razorpay/order             (Phase 4.2)
 *   /api/v1/crm/inquiries/capture/              (anonymous lead capture)
 */

export interface StoreBrand {
    id: number;
    slug: string;
    name: string;
    type?: 'sub' | 'super';
}

export interface StoreProduct {
    id: number;
    slug: string;
    name: string;
    description: string;
    price: string;
    price_unit: string;
    tax_rate: string;
    hsn: string;
    type: 'sourced' | 'manufactured' | 'material';
    image: string;
    owner_brand: StoreBrand;
    category: { id: number; name: string; slug: string } | null;
}

export interface CatalogResponse {
    brand: StoreBrand;
    count: number;
    results: StoreProduct[];
}

export interface InventoryResponse {
    product_id: number;
    totals: { qty_on_hand: string; qty_reserved: string; available: string };
    by_location: Array<{
        location: { id: number; name: string };
        qty_on_hand: string;
        qty_reserved: string;
        available: string;
    }>;
}

export interface PaymentIntent {
    transaction_id: number;
    order_id: string;
    amount: string;
    currency: string;
    status: string;
    key_id: string;
}

interface CaptureInput {
    name: string;
    phone: string;
    email?: string;
    meta?: Record<string, unknown>;
}

export interface GeniusSdkConfig {
    apiUrl: string;
    brandSlug: string;
    captureKey: string;
    /**
     * Origin of the SSO bridge (`https://auth.superhomes.app` in prod).
     * Omit to disable cross-brand session sharing; the SDK still works
     * for everything else when this is unset.
     */
    ssoOrigin?: string;
}

function unwrap<T>(json: unknown): T {
    if (json && typeof json === 'object' && 'data' in json) {
        const wrapped = (json as { data: T }).data;
        if (wrapped !== undefined && wrapped !== null) return wrapped;
    }
    return json as T;
}

async function jsonOrThrow<T>(p: Promise<Response>): Promise<T> {
    const res = await p;
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    return unwrap<T>(await res.json());
}

interface SsoTokenPayload {
    access: string;
    refresh: string;
    issued_at?: number | null;
}

/**
 * Phase 2 SSO helpers — implemented inline so a landing site doesn't need
 * a separate module. All three are no-ops if `ssoOrigin` is unset.
 *
 *   bootstrapSso({ onToken, onNoSession }) — silent iframe check on app boot
 *   pushToSso({ access, refresh, returnTo }) — call after a successful login
 *   clearSso({ returnTo }) — call on logout
 */

export function createGeniusSdk(config: GeniusSdkConfig) {
    const { apiUrl, brandSlug, captureKey, ssoOrigin } = config;
    return {
        catalog(slug: string = brandSlug): Promise<CatalogResponse> {
            return jsonOrThrow<CatalogResponse>(
                fetch(`${apiUrl}/api/v1/store/catalog?brand=${encodeURIComponent(slug)}`),
            );
        },
        inventory(productId: number, locationId?: number): Promise<InventoryResponse> {
            const qs = new URLSearchParams({ product: String(productId) });
            if (locationId !== undefined) qs.set('location', String(locationId));
            return jsonOrThrow<InventoryResponse>(
                fetch(`${apiUrl}/api/v1/store/inventory?${qs}`),
            );
        },
        invoicePdfUrl(orderId: number): string {
            return `${apiUrl}/api/v1/store/invoice/${orderId}?format=pdf`;
        },
        captureLead(input: CaptureInput): Promise<{ inquiry_id: number | null }> {
            return jsonOrThrow<{ status: string; inquiry_id: number | null }>(
                fetch(`${apiUrl}/api/v1/crm/inquiries/capture/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Capture-Key': captureKey,
                    },
                    body: JSON.stringify({
                        brand_slug: brandSlug,
                        name: input.name,
                        phone: input.phone,
                        email: input.email ?? '',
                        meta: input.meta ?? {},
                        website: '',
                    }),
                }),
            ).then((r) => ({ inquiry_id: r.inquiry_id }));
        },
        createPaymentIntent(args: {
            amount: number | string;
            receipt: string;
            idempotencyKey: string;
            accessToken: string;
            brandDescriptors?: string[];
        }): Promise<PaymentIntent> {
            return jsonOrThrow<PaymentIntent>(
                fetch(`${apiUrl}/api/v1/payments/razorpay/order`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${args.accessToken}`,
                    },
                    body: JSON.stringify({
                        amount: args.amount,
                        receipt: args.receipt,
                        idempotency_key: args.idempotencyKey,
                        brand_descriptors: args.brandDescriptors ?? [brandSlug],
                    }),
                }),
            );
        },

        /**
         * Silent cross-brand SSO check. Embeds an invisible iframe pointing
         * at `${ssoOrigin}/sso-check`; the iframe postMessages back whether
         * there's an active central session. Always cleans up.
         *
         * Call this once on app boot. If the user is already locally
         * authenticated, skip — the SDK does not check that itself
         * because each landing site stores its local token differently.
         */
        bootstrapSso(args: {
            onToken: (tokens: SsoTokenPayload) => void;
            onNoSession?: () => void;
            timeoutMs?: number;
        }): void {
            if (typeof window === 'undefined' || !ssoOrigin) {
                args.onNoSession?.();
                return;
            }
            let resolved = false;
            const cleanup = (iframe: HTMLIFrameElement, listener: (e: MessageEvent) => void) => {
                window.removeEventListener('message', listener);
                if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
            };
            const iframe = document.createElement('iframe');
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.position = 'absolute';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = '0';
            iframe.style.visibility = 'hidden';
            iframe.src = `${ssoOrigin}/sso-check`;
            const listener = (event: MessageEvent) => {
                // Critical: only trust messages from the SSO bridge origin.
                if (event.origin !== ssoOrigin) return;
                const data = event.data as { type?: string; access?: string; refresh?: string; issued_at?: number | null } | null;
                if (!data || typeof data.type !== 'string') return;
                if (resolved) return;
                resolved = true;
                if (data.type === 'geniusos_sso_token' && data.access && data.refresh) {
                    args.onToken({
                        access: data.access,
                        refresh: data.refresh,
                        issued_at: data.issued_at ?? null,
                    });
                } else {
                    args.onNoSession?.();
                }
                cleanup(iframe, listener);
            };
            window.addEventListener('message', listener);
            document.body.appendChild(iframe);
            // Bounded wait: if the iframe never responds, treat as no session.
            window.setTimeout(() => {
                if (resolved) return;
                resolved = true;
                args.onNoSession?.();
                cleanup(iframe, listener);
            }, args.timeoutMs ?? 4000);
        },

        /**
         * Push the local JWT pair to the central SSO bridge so other brand
         * sites can pick it up on their next visit. Navigates the user
         * briefly to `${ssoOrigin}/sso-set#access=…&refresh=…&return_to=…`;
         * the bridge stores the tokens and bounces the user back.
         *
         * Call AFTER a successful login. If `ssoOrigin` is unset, this is
         * a no-op — the brand site stays single-tenant.
         */
        pushToSso(args: { access: string; refresh: string; returnTo: string }): void {
            if (typeof window === 'undefined' || !ssoOrigin) return;
            const params = new URLSearchParams({
                access: args.access,
                refresh: args.refresh,
                return_to: args.returnTo,
            });
            window.location.href = `${ssoOrigin}/sso-set#${params.toString()}`;
        },

        /**
         * Tear down the central SSO session so a subsequent visit to any
         * brand site doesn't silently re-login. Navigates to
         * `${ssoOrigin}/sso-clear?return_to=…`.
         */
        clearSso(args: { returnTo: string }): void {
            if (typeof window === 'undefined' || !ssoOrigin) return;
            const params = new URLSearchParams({ return_to: args.returnTo });
            window.location.href = `${ssoOrigin}/sso-clear?${params.toString()}`;
        },
    };
}

export type GeniusSdk = ReturnType<typeof createGeniusSdk>;
