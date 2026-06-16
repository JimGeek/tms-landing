/**
 * DepositSummary.jsx
 * Post-finalize screen showing order total, deposit amount, and Pay CTA.
 * Handles the payment/order → Razorpay → payment/verify flow.
 */
import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Loader, AlertCircle } from 'lucide-react';
import { createPaymentOrder, openRazorpayCheckout, verifyPayment } from '../../lib/quoteApi';

const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

export function DepositSummary({ finalizeResult, draftId, accessToken, onPaymentSuccess }) {
  const { quotation_id, frozen_total, deposit, hmac_signature } = finalizeResult;
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const inFlight = React.useRef(false);

  const depositAmount = deposit?.amount;
  const depositKind = deposit?.kind; // 'fixed' | 'percent' | null

  const handlePay = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPaying(true);
    setPayError('');

    try {
      const signedPayload = {
        quotation_id: draftId, // CRITICAL: must equal draftId per spec
        frozen_total: frozen_total,
        deposit_amount: depositAmount,
      };

      const order = await createPaymentOrder({
        draftId,
        accessToken,
        signedPayload,
        hmacSignature: hmac_signature,
      });

      await openRazorpayCheckout(order, {
        onSuccess: async (payData) => {
          try {
            await verifyPayment({
              draftId,
              accessToken,
              razorpayOrderId: payData.razorpay_order_id,
              razorpayPaymentId: payData.razorpay_payment_id,
              razorpaySignature: payData.razorpay_signature,
              signedPayload,
              hmacSignature: hmac_signature,
            });
            onPaymentSuccess();
          } catch (err) {
            setPayError(err.message || 'Payment verification failed. Contact support.');
          } finally {
            setPaying(false);
            inFlight.current = false;
          }
        },
        onDismiss: () => {
          setPaying(false);
          inFlight.current = false;
          setPayError('Payment was cancelled. You can try again below.');
        },
      });
    } catch (err) {
      setPayError(err.message || 'Failed to start payment.');
      setPaying(false);
      inFlight.current = false;
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-zinc-800 px-6 py-5 border-b border-zinc-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <CheckCircle2 size={20} className="text-amber-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">Order Confirmed</h3>
              <p className="text-zinc-400 text-xs">Quotation #{quotation_id}</p>
            </div>
          </div>
        </div>

        {/* Summary rows */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Order Total</span>
            <span className="text-white font-semibold">{inr(frozen_total)}</span>
          </div>

          {depositAmount && (
            <>
              <div className="border-t border-zinc-700 pt-3 flex justify-between text-sm">
                <span className="text-zinc-400">
                  Deposit{' '}
                  {depositKind === 'percent'
                    ? `(${Math.round((depositAmount / frozen_total) * 100)}%)`
                    : ''}
                </span>
                <span className="text-amber-400 font-bold text-base">{inr(depositAmount)}</span>
              </div>
              <p className="text-zinc-500 text-xs">
                Pay the deposit now to confirm your order. Balance due on delivery.
              </p>
            </>
          )}

          {!depositAmount && (
            <p className="text-zinc-500 text-xs">
              No deposit required. Our team will get in touch to finalise.
            </p>
          )}
        </div>

        {/* CTA */}
        {depositAmount && (
          <div className="px-6 pb-6 space-y-3">
            {payError && (
              <div className="flex items-start gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-xs">{payError}</p>
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={paying}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
            >
              {paying ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Opening payment…
                </>
              ) : (
                <>
                  <CreditCard size={16} />
                  Pay {inr(depositAmount)} deposit
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
