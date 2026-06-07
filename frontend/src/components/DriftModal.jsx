/**
 * DriftModal — surfaces a 409 PRICE_DRIFT from /from-estimate/checkout/.
 * Mandatory: every delta surfaces (no silent-accept tolerance).
 * PART_A_PHASE2 §4.4.
 */
import { useEffect } from "react";

export function DriftModal({ drift, onContinue, onCancel }) {
    useEffect(() => {
        const onEsc = (e) => { if (e.key === "Escape") onCancel(); };
        if (drift) document.addEventListener("keydown", onEsc);
        return () => document.removeEventListener("keydown", onEsc);
    }, [drift, onCancel]);

    if (!drift) return null;

    const deltaNum = Number(drift.delta);
    const isIncrease = deltaNum > 0;
    const deltaLabel = isIncrease
        ? `Increased by ₹${Math.abs(deltaNum).toLocaleString("en-IN")}`
        : `Decreased by ₹${Math.abs(deltaNum).toLocaleString("en-IN")}`;
    const deltaClass = isIncrease ? "text-amber-700" : "text-emerald-700";

    return (
        <div role="dialog" aria-modal="true" aria-labelledby="drift-title"
             className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 mx-4">
                <h2 id="drift-title" className="text-lg font-bold text-[#111110]">Prices have updated</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Rates changed between your estimate and now. Please confirm the current price before continuing.
                </p>
                <dl className="mt-4 space-y-1 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Your estimate</dt>
                        <dd className="tabular-nums">₹{Number(drift.signed_total).toLocaleString("en-IN")}</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-gray-500">Current price</dt>
                        <dd className="tabular-nums font-bold text-[#111110]">
                            ₹{Number(drift.current_total).toLocaleString("en-IN")}
                        </dd>
                    </div>
                    <div className="flex justify-between border-t pt-1 mt-2">
                        <dt className="text-gray-500">Difference</dt>
                        <dd className={`tabular-nums font-semibold ${deltaClass}`}>{deltaLabel}</dd>
                    </div>
                </dl>
                <div className="flex justify-end gap-2 mt-5">
                    <button type="button" onClick={onCancel}
                            className="px-3 py-1.5 text-sm rounded-md border text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="button" onClick={() => onContinue(drift.new_signatures)}
                            className="px-4 py-1.5 text-sm font-semibold rounded-md bg-[#111110] text-white hover:bg-black">
                        Continue at new price
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DriftModal;
