import { useCart } from '../../lib/cart/cartStore.js';

export function CartButton() {
  const cart = useCart((s) => s.cart);
  const open = useCart((s) => s.openDrawer);
  const count = useCart((s) => s.itemCount());
  if (count === 0 && !cart) return null;
  return (
    <button
      onClick={open}
      aria-label={`Cart with ${count} item${count === 1 ? '' : 's'}`}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 8h12l-1.5 10.5a2 2 0 0 1-2 1.5h-5a2 2 0 0 1-2-1.5L6 8z" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M9 8V6a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6"/>
      </svg>
      <span>{count}</span>
    </button>
  );
}
