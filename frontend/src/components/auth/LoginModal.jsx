import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, Mail, ArrowRight, Loader2 } from 'lucide-react';

const LoginModal = ({ isOpen, onClose }) => {
    const [step, setStep] = useState('method'); // method, mobile, otp
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGoogleLogin = () => {
        // In a real app, this would redirect to Google OAuth URL or use Google SDK
        // For now, we simulate the redirection to our backend endpoint logic
        window.location.href = 'http://localhost:8000/api/auth/google/login/';
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/social/mobile/generate/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber })
            });
            if (response.ok) {
                setStep('otp');
            } else {
                alert('Failed to send OTP');
            }
        } catch (error) {
            console.error(error);
            alert('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/social/mobile/verify/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone_number: phoneNumber, otp })
            });
            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token); // Store mock token
                alert('Login Successful!');
                onClose();
            } else {
                alert('Invalid OTP');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="p-8">
                        <h2 className="text-2xl font-bold text-center mb-8 font-display">Welcome Back</h2>

                        {step === 'method' && (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setStep('mobile')}
                                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all font-bold"
                                >
                                    <Smartphone size={20} />
                                    Continue with Mobile
                                </button>
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full flex items-center justify-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all font-bold"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.2 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>
                            </div>
                        )}

                        {step === 'mobile' && (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                                    <input
                                        type="tel"
                                        required
                                        placeholder="+91 98765 43210"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <>Get OTP <ArrowRight size={18} /></>}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('method')}
                                    className="w-full text-sm text-gray-500 hover:text-black"
                                >
                                    Back
                                </button>
                            </form>
                        )}

                        {step === 'otp' && (
                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                                    <p className="text-xs text-gray-500 mb-4">Sent to {phoneNumber}</p>
                                    <input
                                        type="text"
                                        required
                                        placeholder="XXXX"
                                        maxLength={4}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full p-4 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-black transition-all text-center text-2xl tracking-widest"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-black text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : 'Verify & Login'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep('mobile')}
                                    className="w-full text-sm text-gray-500 hover:text-black"
                                >
                                    Change Number
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
