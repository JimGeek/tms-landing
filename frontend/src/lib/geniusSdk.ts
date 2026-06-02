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

export function createGeniusSdk(config: GeniusSdkConfig) {
    const { apiUrl, brandSlug, captureKey } = config;
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
    };
}

export type GeniusSdk = ReturnType<typeof createGeniusSdk>;
