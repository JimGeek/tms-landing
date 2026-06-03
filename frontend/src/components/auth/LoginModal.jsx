import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HERO_IMAGE = '/hero-bg.png';
const HERO_PILL = 'CUSTOM METAL FABRICATION';
const HERO_TITLE = 'Sign in to track your custom build.';
const HERO_SUBTITLE =
    'Made-to-order metal work — gates, grills, staircases, swings. Fabricated in-house. Zero middlemen.';
const HERO_STATS = [
    { value: 'Custom', label: 'Made-to-Order' },
    { value: 'In-House', label: 'Fabrication' },
    { value: '100+', label: 'Projects' },
];

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
                body: JSON.stringify({ phone: phoneNumber }),
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
                body: JSON.stringify({ phone: phoneNumber, code: otp }),
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
            <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.97, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.97, y: 12 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="relative grid grid-cols-1 md:grid-cols-2 w-full max-w-[880px] bg-white rounded-[22px] overflow-hidden shadow-2xl ring-1 ring-black/5 min-h-[540px]"
                >
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/15 text-white md:text-gray-700 flex items-center justify-center"
                    >
                        <X size={16} />
                    </button>

                    {/* LEFT pane — hero photo + brand stats */}
                    <div
                        aria-hidden="true"
                        className="relative overflow-hidden min-h-[200px] md:min-h-[540px] p-6 md:p-8 flex flex-col justify-between text-white"
                    >
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundImage: `url(${HERO_IMAGE})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/85" />

                        <div className="relative z-10 font-bold text-lg tracking-[0.12em] font-display">
                            THE METAL STORE
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block px-3.5 py-1.5 rounded-full bg-gradient-to-b from-metallic-700 to-metallic-900 text-white text-[11px] font-bold tracking-[0.12em] uppercase mb-3.5">
                                {HERO_PILL}
                            </span>
                            <h3 className="text-[22px] md:text-[28px] font-bold leading-tight tracking-tight text-white font-display mb-2.5">
                                {HERO_TITLE}
                            </h3>
                            <p className="text-[13px] text-white/85 leading-relaxed mb-6">
                                {HERO_SUBTITLE}
                            </p>
                            <div className="flex gap-4 md:gap-7">
                                {HERO_STATS.map((s) => (
                                    <div key={s.label}>
                                        <div className="text-[18px] md:text-[22px] font-bold text-white tracking-tight font-display">
                                            {s.value}
                                        </div>
                                        <div className="text-[11px] text-white/70 tracking-wide mt-0.5">
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT pane — form */}
                    <div className="p-9 overflow-y-auto">
                        <span className="block text-[10px] font-bold tracking-[0.18em] uppercase text-gray-500 mb-2.5">
                            Sign in or sign up
                        </span>
                        <h2 className="text-[24px] font-bold leading-tight tracking-tight text-gray-900 font-display mb-2">
                            {step === 'phone' ? 'Welcome.' : 'Verify your phone'}
                        </h2>
                        <p className="text-[13px] text-gray-500 leading-relaxed">
                            {step === 'phone'
                                ? "Phone-only. We'll text you a 6-digit code. New here? An account is created automatically."
                                : `We sent a 6-digit code to ${phoneNumber}.`}
                        </p>

                        <div className="mt-6">
                            {step === 'phone' ? (
                                <form onSubmit={handleSendOtp} className="space-y-3.5">
                                    <div className="flex items-stretch rounded-xl border border-gray-200 focus-within:border-metallic-800 focus-within:ring-2 focus-within:ring-metallic-900/10 overflow-hidden bg-gray-50">
                                        <div className="px-4 flex items-center font-semibold text-gray-600 border-r border-gray-200">
                                            +91
                                        </div>
                                        <input
                                            type="tel"
                                            required
                                            placeholder="98765 43210"
                                            className="flex-1 bg-transparent py-3.5 px-4 font-medium focus:outline-none"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                            autoFocus
                                        />
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
                                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
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
                                    <p className="text-center text-sm text-gray-500">
                                        Sent to +91 {phoneNumber}{' '}
                                        <button
                                            type="button"
                                            onClick={() => { setStep('phone'); setOtp(''); }}
                                            className="text-metallic-900 font-bold hover:underline"
                                        >
                                            Change
                                        </button>
                                    </p>
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

                        {step === 'phone' && (
                            <div className="mt-6 pt-4 border-t border-gray-100 text-center text-[13px] text-gray-500">
                                No spam. No pushy sales. Just honest advice.
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
