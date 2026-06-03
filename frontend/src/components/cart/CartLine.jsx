export function CartLine({ line, onQtyChange, onRemove, dense }) {
  const inr = (s) => `₹${Number(s).toLocaleString('en-IN')}`;
  const dim = !line.valid;
  return (
    <div className={`flex gap-3 ${dense ? 'py-3' : 'py-4'} border-b border-slate-100 ${dim ? 'opacity-50' : ''}`}>
      <div className={`${dense ? 'w-14 h-14' : 'w-20 h-20'} rounded-lg bg-slate-100 overflow-hidden flex-shrink-0`}>
        {line.thumbnail_url && <img src={line.thumbnail_url} alt={line.title} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`${dense ? 'text-sm' : 'text-base'} font-semibold text-slate-900`}>{line.title}</div>
        {line.config && Object.keys(line.config).length > 0 && (
          <div className="text-xs text-slate-500 mt-1">
            {Object.entries(line.config).map(([k, v]) => `${k}: ${String(v)}`).join(' · ')}
          </div>
        )}
        {dim && (
          <div className="text-xs text-red-700 mt-1">
            {line.invalid_reason === 'SOURCE_EXPIRED' ? 'Quote expired' : 'No longer available'}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <div className="inline-flex items-center border border-slate-200 rounded-full">
            <button disabled={dim} onClick={() => onQtyChange(line.qty - 1)} className="w-7 h-7" aria-label="Decrease">−</button>
            <span className="min-w-6 text-center text-sm font-semibold">{line.qty}</span>
            <button disabled={dim} onClick={() => onQtyChange(line.qty + 1)} className="w-7 h-7" aria-label="Increase">+</button>
          </div>
          <div className={`${dense ? 'text-sm' : 'text-base'} font-bold text-slate-900`}>{inr(line.subtotal)}</div>
        </div>
        {Number(line.due_now_amount) < Number(line.subtotal) && (
          <div className="text-xs text-superhomes-500 mt-1 font-semibold">Pay now: {inr(line.due_now_amount)}</div>
        )}
        <button onClick={onRemove} className="text-xs text-slate-400 mt-2">Remove</button>
      </div>
    </div>
  );
}
