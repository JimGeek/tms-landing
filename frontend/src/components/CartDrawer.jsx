import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.superhomes.app';
const BRAND_SLUG = import.meta.env.VITE_BRAND_SLUG || 'themetalstore';

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const { user } = useAuth() || {};
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        const accessToken = localStorage.getItem('tms_token');
        if (!accessToken) {
            alert('Please sign in before checking out.');
            return;
        }
        setIsCheckingOut(true);
        try {
            // 1. Create the payment intent against the unified GeniusOS Phase 4
            //    endpoint. The server picks the amount (paise → /100 here is the
            //    converse Razorpay does on its side; we send rupees).
            const idempotencyKey = `tms-${user?.id ?? 'guest'}-${Date.now()}`;
            const response = await fetch(`${API_URL}/api/v1/payments/razorpay/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    amount: cartTotal,
                    receipt: `tms-cart-${idempotencyKey}`,
                    idempotency_key: idempotencyKey,
                    brand_descriptors: [BRAND_SLUG],
                }),
            });

            if (!response.ok) {
                if (response.status === 503) {
                    alert('Payments are temporarily unavailable. Please try again shortly.');
                } else if (response.status === 401) {
                    alert('Your session expired. Please sign in again.');
                } else {
                    alert('Could not start checkout. Please try again.');
                }
                throw new Error(`Phase 4 intent failed: ${response.status}`);
            }

            const envelope = await response.json();
            const intent = envelope.data ?? envelope;

            // 2. Open Razorpay Checkout. The Phase 4 webhook on the API server
            //    will receive payment.captured and flip the PaymentTransaction
            //    state — we don't need a client-side verify round trip anymore.
            const options = {
                key: intent.key_id,
                amount: Number(intent.amount) * 100, // paise
                currency: intent.currency,
                name: 'The Metal Store',
                description: 'Custom metalwork order',
                image: '/logo.png',
                order_id: intent.order_id,
                handler: function () {
                    // Razorpay's success callback runs once payment.authorized
                    // fires. The server-side webhook is authoritative.
                    clearCart();
                    setIsCartOpen(false);
                    navigate('/checkout/success');
                },
                prefill: {
                    name: user?.name || user?.username || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: { color: '#000000' },
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error?.description || 'Payment failed');
            });
            rzp1.open();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[TMS checkout]', error);
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsCartOpen(false)}
                        className="fixed inset-0 bg-black z-[60]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        <div className="p-5 border-b flex justify-between items-center bg-metallic-50">
                            <h2 className="text-xl font-bold font-display flex items-center gap-2">
                                <ShoppingBag size={20} /> Your Cart ({cartItems.length})
                            </h2>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cartItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-metallic-500 space-y-4">
                                    <ShoppingBag size={48} className="opacity-20" />
                                    <p>Your cart is empty.</p>
                                    <button
                                        onClick={() => { setIsCartOpen(false); navigate('/store'); }}
                                        className="text-black underline font-bold"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                cartItems.map(item => (
                                    <div key={item.id} className="flex gap-4 p-3 bg-white border border-metallic-100 rounded-xl shadow-sm">
                                        <div className="h-20 w-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-sm line-clamp-1">{item.name}</h3>
                                                <p className="text-xs text-metallic-500">{item.category}</p>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="font-bold text-sm">{item.price}</span>

                                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm">
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 self-start"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {cartItems.length > 0 && (
                            <div className="p-5 border-t bg-gray-50 space-y-4">
                                <div className="flex justify-between items-center text-lg font-bold">
                                    <span>Total</span>
                                    <span>₹ {cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut}
                                    className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
                                >
                                    {isCheckingOut ? <Loader2 className="animate-spin" /> : 'Proceed to Checkout'}
                                </button>
                                <p className="text-xs text-center text-gray-500">
                                    Shipping & taxes calculated at checkout.
                                </p>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default CartDrawer;
