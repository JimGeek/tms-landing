/**
 * CartPanel.jsx
 * Right-side sticky cart panel showing current cart lines, qty steppers,
 * subtotal, and the Checkout CTA.
 * TMS industrial dark+amber aesthetic.
 */
import React from 'react';
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus } from 'lucide-react';
import { useQuoteStore } from '../../lib/quoteStore';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export function CartPanel({ onCheckout, checkoutLoading }) {
  const cart = useQuoteStore((s) => s.cart);
  const setQty = useQuoteStore((s) => s.setQty);
  const removeFromCart = useQuoteStore((s) => s.removeFromCart);
  const subtotal = useQuoteStore((s) => s.subtotal());
  const itemCount = useQuoteStore((s) => s.itemCount());

  const lines = Object.values(cart);

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg flex flex-col h-full max-h-[calc(100vh-120px)] sticky top-4">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-700 flex items-center gap-2">
        <ShoppingCart size={16} className="text-amber-400" />
        <h2 className="text-white font-bold text-sm tracking-wide uppercase">
          Your Cart
          {itemCount > 0 && (
            <span className="ml-2 bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </h2>
      </div>

      {/* Lines */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {lines.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart size={36} className="text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">Your cart is empty.</p>
            <p className="text-zinc-600 text-xs mt-1">
              Browse products on the left and add items.
            </p>
          </div>
        )}

        {lines.map((line) => {
          const variantId = line.catalogue_variant_id || null;
          const lineTotal = Number(line.unit_rate) * line.quantity;
          return (
            <div
              key={`${line.catalogue_item_id}-${variantId || 'flat'}`}
              className="bg-zinc-800 rounded-lg p-3"
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <p className="text-white text-xs font-medium leading-tight flex-1">
                  {line.label}
                </p>
                <button
                  onClick={() => removeFromCart(line.catalogue_item_id, variantId)}
                  className="text-zinc-500 hover:text-red-400 transition-colors flex-shrink-0"
                  aria-label="Remove item"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                {/* Qty stepper */}
                <div className="flex items-center gap-1 bg-zinc-700 rounded">
                  <button
                    onClick={() =>
                      setQty(line.catalogue_item_id, variantId, line.quantity - 1)
                    }
                    className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={11} />
                  </button>
                  <span className="text-white text-xs font-bold w-5 text-center">
                    {line.quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQty(line.catalogue_item_id, variantId, line.quantity + 1)
                    }
                    className="w-7 h-7 flex items-center justify-center text-zinc-300 hover:text-white transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus size={11} />
                  </button>
                </div>

                {/* Line total */}
                <div className="text-right">
                  <div className="text-amber-400 font-bold text-sm">{inr(lineTotal)}</div>
                  <div className="text-zinc-500 text-xs">
                    {inr(line.unit_rate)} / {line.unit}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer: subtotal + CTA */}
      {lines.length > 0 && (
        <div className="border-t border-zinc-700 px-4 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Subtotal</span>
            <span className="text-white font-bold">{inr(subtotal)}</span>
          </div>
          <button
            onClick={onCheckout}
            disabled={checkoutLoading}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors active:scale-[0.98] text-sm"
          >
            {checkoutLoading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                Saving cart…
              </>
            ) : (
              <>
                Checkout
                <ArrowRight size={15} />
              </>
            )}
          </button>
          <p className="text-zinc-600 text-xs text-center">
            You'll verify your phone number next.
          </p>
        </div>
      )}
    </div>
  );
}
