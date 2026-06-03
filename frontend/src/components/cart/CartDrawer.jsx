import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../lib/cart/cartStore.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { CartLine } from './CartLine.jsx';

export function CartDrawer() {
  const { cart, drawerOpen: open, closeDrawer: close, refresh, patchItem, removeItem } = useCart();
  const { accessToken } = useAuth();

  useEffect(() => {
    if (!open) return;
    refresh(accessToken).catch(() => {});
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open, accessToken, refresh]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  if (!open) return null;
  const inr = (s) => `₹${Number(s).toLocaleString('en-IN')}`;
  const totals = cart?.totals;
  const groups = cart?.lines_by_brand ?? [];
  const empty = groups.every((g) => g.lines.length === 0);

  return (
    <>
      <div onClick={close} className="fixed inset-0 z-[1900] bg-slate-900/50 backdrop-blur-sm" />
      <aside className="fixed top-0 right-0 bottom-0 z-[1950] w-[420px] max-w-full bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-2xl flex flex-col">
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold tracking-tight m-0">Your cart</h3>
          <button onClick={close} aria-label="Close cart" className="w-8 h-8 rounded-lg border border-slate-200 text-slate-500">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {empty ? (
            <div className="text-center py-16 text-sm text-slate-500">Your cart is empty.</div>
          ) : groups.map((g) => (
            <div key={g.brand.id} className="mb-4">
              <div className="text-xs font-bold tracking-widest uppercase text-slate-400 mb-1">{g.brand.name}</div>
              {g.lines.map((line) => (
                <CartLine
                  key={line.id}
                  line={line} dense
                  onQtyChange={(next) => patchItem(line.id, { qty: next }, accessToken)}
                  onRemove={() => removeItem(line.id, accessToken)}
                />
              ))}
            </div>
          ))}
        </div>
        {!empty && totals && (
          <div className="border-t border-slate-100 px-6 py-4 bg-white/60">
            <div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Subtotal</span><span>{inr(totals.subtotal)}</span></div>
            <div className="flex justify-between text-sm font-bold mb-3"><span>Due now</span><span className="text-superhomes-500">{inr(totals.due_now)}</span></div>
            <Link
              to="/cart" onClick={close}
              className="block text-center bg-superhomes-500 hover:bg-superhomes-600 text-white rounded-xl px-5 py-3.5 font-bold text-sm"
            >
              Proceed · Pay {inr(totals.due_now)}
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
