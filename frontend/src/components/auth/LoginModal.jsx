import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const TRUST_CHIPS = ['Made-To-Order', 'Custom Metal', 'In-House Fabrication'];
const PHONE_DISPLAY = '+91 99099 12345';
const PHONE_TEL = '+919909912345';

const LoginModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('phone'); // phone, otp
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/otp/send/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setStep('otp');
            } else {
                const errorMsg = data.errors?.[0] || data.error || 'Failed to send OTP';
                alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/otp/verify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: phoneNumber, code: otp })
            });
            const data = await response.json();
            if (response.ok && data.success) {
                login(data.data);
                onClose();
            } else {
                const errorMsg = data.errors?.[0] || data.error || 'Invalid OTP';
                alert(typeof errorMsg === 'object' ? JSON.stringify(errorMsg) : errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative shadow-2xl"
                >
                    {/* Metallic accent bar */}
                    <div
                        aria-hidden="true"
                        className="h-1 w-full bg-gradient-to-r from-metallic-700 via-metallic-900 to-metallic-700"
                    />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="px-8 pt-8 pb-6">
                        <span className="inline-block text-[11px] font-bold tracking-[0.16em] uppercase text-metallic-700 mb-3">
                            The Metal Store
                        </span>
                        <h2 className="text-[26px] font-bold font-display leading-tight tracking-tight mb-2">
                            {step === 'phone' ? 'Welcome.' : 'Verify your phone'}
                        </h2>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            {step === 'phone'
                                ? "Phone-only. We'll text you a 6-digit code. New here? An account is created automatically."
                                : `We sent a 6-digit code to ${phoneNumber}.`}
                        </p>

                        {step === 'phone' && (
                            <div className="flex flex-wrap gap-2 mt-5">
                                {TRUST_CHIPS.map((chip) => (
                                    <span
                                        key={chip}
                                        className="text-xs font-semibold px-3 py-1.5 rounded-full bg-metallic-100 text-metallic-800"
                                    >
                                        {chip}
                                    </span>
                                ))}
                            </div>
                        )}

                        <div className="mt-6">
                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                                            Phone Number
                                        </label>
                                        <div className="relative">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="tel"
                                                required
                                                placeholder="+91 98765 43210"
                                                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-12 pr-4 font-medium focus:outline-none focus:border-metallic-800 focus:ring-2 focus:ring-metallic-900/10 transition"
                                                value={phoneNumber}
                                                onChange={(e) => setPhoneNumber(e.target.value)}
                                                autoFocus
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || !phoneNumber.trim()}
                                        className="w-full bg-metallic-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-metallic-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader className="animate-spin" size={18} /> : <>Continue <ArrowRight size={18} /></>}
                                    </button>
                                    <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                                        By continuing you agree to our <u>Terms</u> and <u>Privacy Policy</u>.
                                    </p>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-4">
                                    <div>
                                        <label className="block text-[11px] font-bold tracking-[0.12em] uppercase text-gray-500 mb-2">
                                            6-Digit Code
                                        </label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            required
                                            maxLength={6}
                                            placeholder="123456"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl py-4 px-4 text-center text-2xl font-bold tracking-[0.4em] focus:outline-none focus:border-metallic-800 focus:ring-2 focus:ring-metallic-900/10 transition"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            autoFocus
                                        />
                                        <p className="text-center text-sm text-gray-500 mt-2">
                                            Sent to {phoneNumber}{' '}
                                            <button
                                                type="button"
                                                onClick={() => { setStep('phone'); setOtp(''); }}
                                                className="text-metallic-900 font-bold hover:underline"
                                            >
                                                Change
                                            </button>
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={loading || otp.length !== 6}
                                        className="w-full bg-metallic-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-metallic-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader className="animate-spin" size={18} /> : 'Verify & Login'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {step === 'phone' && (
                        <div className="px-8 pb-6 text-center">
                            <div className="text-[11px] text-gray-400 mb-3">100% privacy guaranteed. No spam.</div>
                            <div className="border-t border-gray-100 pt-4 text-sm text-gray-500">
                                Or call us:{' '}
                                <a
                                    href={`tel:${PHONE_TEL}`}
                                    className="text-metallic-900 font-semibold no-underline hover:underline"
                                >
                                    {PHONE_DISPLAY}
                                </a>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
