/**
 * ProductCard.jsx
 * Displays a single catalogue item with variant picker (if needed) and add-to-cart.
 * Industrial dark+amber TMS aesthetic.
 */
import React, { useState } from 'react';
import { Plus, Package } from 'lucide-react';
import { useQuoteStore } from '../../lib/quoteStore';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export function ProductCard({ item }) {
  const addToCart = useQuoteStore((s) => s.addToCart);
  const cart = useQuoteStore((s) => s.cart);

  // For variant items, user must pick before adding
  const hasVariants = item.pricing_kind === 'variants' && item.variants?.length > 0;
  const [selectedVariantId, setSelectedVariantId] = useState(
    hasVariants ? null : undefined
  );
  const [justAdded, setJustAdded] = useState(false);

  const selectedVariant = hasVariants
    ? item.variants.find((v) => v.id === selectedVariantId)
    : null;

  const displayRate = hasVariants
    ? selectedVariant
      ? selectedVariant.rate
      : null
    : item.default_rate;

  // Determine if this exact SKU is already in cart
  const cartKey = hasVariants
    ? selectedVariantId
      ? `${item.id}-v${selectedVariantId}`
      : null
    : `${item.id}-flat`;
  const inCartQty = cartKey && cart[cartKey] ? cart[cartKey].quantity : 0;

  const handleAdd = () => {
    if (hasVariants && !selectedVariantId) return;
    const label = hasVariants
      ? `${item.name} — ${selectedVariant.name}`
      : item.name;
    const unit_rate = hasVariants ? selectedVariant.rate : item.default_rate;
    addToCart({
      catalogue_item_id: item.id,
      ...(hasVariants ? { catalogue_variant_id: selectedVariantId } : {}),
      label,
      unit_rate: String(unit_rate),
      quantity: 1,
      unit: item.default_unit || 'piece',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex flex-col gap-3 hover:border-amber-500/60 transition-colors">
      {/* Icon placeholder */}
      <div className="w-full h-24 bg-zinc-800 rounded flex items-center justify-center text-zinc-600">
        <Package size={32} />
      </div>

      {/* Name + category */}
      <div>
        <h3 className="text-white font-semibold text-sm leading-tight">{item.name}</h3>
        {item.description && (
          <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{item.description}</p>
        )}
      </div>

      {/* Variant picker */}
      {hasVariants && (
        <div className="flex flex-wrap gap-1.5">
          {item.variants.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVariantId(v.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                selectedVariantId === v.id
                  ? 'bg-amber-500 text-black border-amber-500'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-600 hover:border-amber-400'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Price row + add button */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div>
          {displayRate ? (
            <>
              <span className="text-amber-400 font-bold text-base">{inr(displayRate)}</span>
              <span className="text-zinc-500 text-xs ml-1">/ {item.default_unit || 'piece'}</span>
            </>
          ) : (
            <span className="text-zinc-500 text-xs italic">
              {hasVariants ? 'Select variant' : 'Price on request'}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={hasVariants && !selectedVariantId}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all
            ${justAdded
              ? 'bg-green-600 text-white scale-95'
              : hasVariants && !selectedVariantId
              ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 text-black active:scale-95'
            }`}
        >
          <Plus size={13} />
          {justAdded ? 'Added!' : inCartQty > 0 ? `+1 (${inCartQty})` : 'Add'}
        </button>
      </div>
    </div>
  );
}
