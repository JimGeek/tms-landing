# GeniusOS Backend Integration — The Metal Store

Talks to the unified GeniusOS API at `api.superhomes.app`. Contract:
`GeniusOS/docs/superpowers/specs/brand_integration.md`.

Vite + React (not Next.js). Env vars are read at build time via
`import.meta.env.VITE_*` and baked into the bundle.

## Environment variables (`frontend/.env`)

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `https://api.superhomes.app` | API base URL. |
| `VITE_BRAND_SLUG` | `themetalstore` | Brand slug. |
| `VITE_CAPTURE_KEY` | `8c664d67-b863-4f91-9a88-d19b4fdad88e` | Public lead-capture key. |

Each module also hard-defaults to the production values so a missing env
var doesn't silently break the build.

## Endpoint usage

| File | Backend endpoint | Status |
|---|---|---|
| `src/api/leads.js` | `POST /api/v1/crm/inquiries/capture/` | ✅ Live |
| `src/api/store.js` | `GET /api/v1/store/products/?brand=…`, `GET /api/v1/store/products/<slug>/?brand=…`, `GET /api/v1/store/categories/?brand=…` | ✅ Live (existing ProductViewSet + CategoryViewSet from Phase 5 router) |
| `src/components/auth/LoginModal.jsx` | `POST /api/v1/auth/otp/send/`, `POST /api/v1/auth/otp/verify/` | ✅ Live |
| `src/components/ChatWidget.jsx` | `POST /api/v1/chat/`, `POST /api/v1/chat/<id>/send_message/`, `POST /api/v1/chat/<id>/mark_read/`, `GET /api/v1/chat/<id>/` | ✅ Live |
| `src/components/CartDrawer.jsx` (checkout) | `POST /api/v1/payments/razorpay/order` (Phase 4). Razorpay webhook on the API side handles server-side capture; the client just shows success on Razorpay's success callback. | ✅ Migrated from the legacy `/api/orders/create/` + `/api/orders/verify/` paths that never existed on the unified backend. |

## Storefront SDK

`src/lib/geniusSdk.ts` is the canonical typed client. Use it for any new
calls into the unified API; the legacy `src/api/*.js` modules continue
to work for backwards compat.

## Razorpay flow

1. User authenticates via the OTP modal → JWT stored in `localStorage` as `tms_token`.
2. Checkout: `POST /api/v1/payments/razorpay/order` with `Authorization: Bearer <token>`, returns `{ order_id, key_id, amount, currency }`.
3. Razorpay Checkout.js fires `handler(response)` on success.
4. **No client-side verify call.** The Razorpay webhook on `api.superhomes.app/api/v1/payments/razorpay/webhook` updates the `PaymentTransaction` state authoritatively.

## Smoke test

```bash
# Lead capture
curl -X POST 'https://api.superhomes.app/api/v1/crm/inquiries/capture/' \
  -H 'Content-Type: application/json' \
  -H 'X-Capture-Key: 8c664d67-b863-4f91-9a88-d19b4fdad88e' \
  -H 'Origin: https://themetal.store' \
  -d '{"brand_slug":"themetalstore","name":"smoke","phone":"9999999993","email":"s@x"}'
# → {"success":true,"data":{"status":"received","inquiry_id":<id>},"errors":[]}
```
