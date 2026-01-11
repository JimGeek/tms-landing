import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use'; // Need to install or implement simple hook, actually let's skip external hook for now

const CheckoutSuccess = () => {
    // Simple window size for confetti
    const width = window.innerWidth;
    const height = window.innerHeight;

    return (
        <div className="min-h-screen bg-metallic-50 flex items-center justify-center p-6 relative overflow-hidden">
            <Confetti width={width} height={height} recycle={false} numberOfPieces={200} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white max-w-lg w-full rounded-2xl shadow-xl p-10 text-center relative z-10"
            >
                <div className="flex justify-center mb-6">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                        className="bg-green-100 p-4 rounded-full"
                    >
                        <CheckCircle2 size={64} className="text-green-600" />
                    </motion.div>
                </div>

                <h1 className="text-3xl font-bold font-display mb-4">Payment Successful!</h1>
                <p className="text-metallic-600 mb-8">
                    Your order has been placed successfully. We have sent a confirmation email to your registered address.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Order Details</p>
                    <div className="flex justify-between items-center mb-2">
                        <span>Payment ID</span>
                        <span className="font-mono font-bold">#RZP-847291</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Status</span>
                        <span className="text-green-600 font-bold flex items-center gap-1">
                            Paid <CheckCircle2 size={14} />
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <Link
                        to="/store"
                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 transition-colors flex items-center justify-center gap-2"
                    >
                        Continue Shopping <ArrowRight size={18} />
                    </Link>
                    <Link
                        to="/"
                        className="w-full text-gray-500 py-2 hover:text-black transition-colors"
                    >
                        Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default CheckoutSuccess;
