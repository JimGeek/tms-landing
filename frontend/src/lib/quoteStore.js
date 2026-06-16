/**
 * quoteStore.js
 * Zustand store for the TMS flat-cart quote flow.
 * Cart is keyed by `${catalogue_item_id}-${catalogue_variant_id || 'flat'}`.
 */
import { create } from 'zustand';

const key = (itemId, variantId) =>
  variantId ? `${itemId}-v${variantId}` : `${itemId}-flat`;

export const useQuoteStore = create((set, get) => ({
  // cart: Map-like object keyed by cart key → cart entry
  cart: {},

  // draft state
  draftId: null,
  frozenTotal: null,

  // auth state (scoped to quote flow — mirrors AuthContext tokens for the
  // verified phone that just completed OTP in this flow)
  accessToken: null,
  contactId: null,

  // finalize result
  finalizeResult: null, // { quotation_id, frozen_total, deposit, hmac_signature }

  // payment order result
  paymentOrder: null, // { order_id, amount, currency, key_id }

  /** Add or update quantity of an item in the flat cart */
  addToCart(item) {
    // item: { catalogue_item_id, catalogue_variant_id?, label, unit_rate, quantity, unit }
    const k = key(item.catalogue_item_id, item.catalogue_variant_id);
    set((state) => {
      const existing = state.cart[k];
      return {
        cart: {
          ...state.cart,
          [k]: existing
            ? { ...existing, quantity: existing.quantity + (item.quantity || 1) }
            : { ...item, quantity: item.quantity || 1 },
        },
      };
    });
  },

  /** Set exact quantity (0 = remove) */
  setQty(itemId, variantId, qty) {
    const k = key(itemId, variantId);
    set((state) => {
      if (qty <= 0) {
        const { [k]: _removed, ...rest } = state.cart;
        return { cart: rest };
      }
      const existing = state.cart[k];
      return {
        cart: existing ? { ...state.cart, [k]: { ...existing, quantity: qty } } : state.cart,
      };
    });
  },

  /** Remove an item from the cart */
  removeFromCart(itemId, variantId) {
    const k = key(itemId, variantId);
    set((state) => {
      const { [k]: _removed, ...rest } = state.cart;
      return { cart: rest };
    });
  },

  /** Clear entire cart */
  clearCart() {
    set({ cart: {}, draftId: null, frozenTotal: null, finalizeResult: null, paymentOrder: null });
  },

  /** Derived: flat array of cart lines */
  cartLines() {
    return Object.values(get().cart);
  },

  /** Derived: total item count */
  itemCount() {
    return Object.values(get().cart).reduce((s, l) => s + l.quantity, 0);
  },

  /** Derived: subtotal in paise-less rupees */
  subtotal() {
    return Object.values(get().cart).reduce(
      (s, l) => s + Number(l.unit_rate) * l.quantity,
      0
    );
  },

  setDraft(draftId, frozenTotal) {
    set({ draftId, frozenTotal });
  },

  setAuth(accessToken, contactId) {
    set({ accessToken, contactId });
  },

  setFinalizeResult(result) {
    set({ finalizeResult: result });
  },

  setPaymentOrder(order) {
    set({ paymentOrder: order });
  },
}));
