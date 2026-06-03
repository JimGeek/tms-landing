import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartApi, bumpCartVersion, clearDeviceId, getDeviceId } from './cartApi.js';

export const useCart = create(
  persist(
    (set, get) => ({
      cart: null,
      loading: false,
      error: null,
      drawerOpen: false,

      setCart: (cart) => set({ cart, error: null }),

      fetchCart: async (token) => {
        set({ loading: true });
        try {
          const cart = await cartApi.fetchCart(token ?? null);
          set({ cart, loading: false, error: null });
        } catch (e) {
          set({ loading: false, error: e?.message || 'Failed to load cart' });
        }
      },

      addItem: async (input, token) => {
        const cart = await cartApi.addItem(input, token ?? null);
        set({ cart, error: null });
        bumpCartVersion();
      },

      patchItem: async (itemId, body, token) => {
        const cart = await cartApi.patchItem(itemId, body, token ?? null);
        set({ cart });
        bumpCartVersion();
      },

      removeItem: async (itemId, token) => {
        const cart = await cartApi.removeItem(itemId, token ?? null);
        set({ cart });
        bumpCartVersion();
      },

      clear: async (token) => {
        const cart = await cartApi.clear(token ?? null);
        set({ cart });
        bumpCartVersion();
      },

      refresh: async (token) => {
        const result = await cartApi.refresh(token ?? null);
        set({ cart: result });
      },

      mergeDeviceCart: async (token) => {
        const id = getDeviceId();
        if (!id) return;
        const cart = await cartApi.mergeDeviceIntoContact([id], token);
        clearDeviceId();
        set({ cart });
        bumpCartVersion();
      },

      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),

      itemCount: () => {
        const c = get().cart;
        if (!c) return 0;
        return c.lines_by_brand.reduce(
          (s, g) => s + g.lines.reduce((ss, l) => ss + l.qty, 0), 0,
        );
      },
    }),
    {
      name: 'superhomes_cart_state',
      partialize: (state) => ({ cart: state.cart }),
    },
  ),
);
