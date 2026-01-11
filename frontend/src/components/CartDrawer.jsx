import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Plus, Minus, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
    const { cartItems, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const navigate = useNavigate();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // 1. Create Order on Backend
            const productIds = cartItems.map(item => item.id);
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/create/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_ids: productIds })
            });

            if (!response.ok) throw new Error('Failed to create order');

            const orderData = await response.json();

            // 2. Open RazorPay Modal
            const options = {
                key: orderData.key_id,
                amount: orderData.amount * 100, // paise
                currency: orderData.currency,
                name: "The Metal Store",
                description: "Payment for Custom Metalwork",
                image: "/logo.png",
                order_id: orderData.razorpay_order_id,
                handler: async function (response) {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/verify/`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        if (verifyRes.ok) {
                            clearCart();
                            setIsCartOpen(false);
                            navigate('/checkout/success');
                        } else {
                            alert('Payment Verification Failed');
                        }
                    } catch (error) {
                        console.error(error);
                        alert('Error Verifying Payment');
                    }
                },
                prefill: {
                    name: "Customer Name", // Should come from user context
                    email: "customer@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#000000"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.on('payment.failed', function (response) {
                alert(response.error.description);
            });
            rzp1.open();

        } catch (error) {
            console.error(error);
            alert('Checkout Failed. Please try again.');
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
