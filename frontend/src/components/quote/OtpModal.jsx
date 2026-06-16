/**
 * OtpModal.jsx
 * Phone OTP gate for the TMS quote flow.
 * Two-step: enter phone → enter 6-digit OTP.
 * Test phone 7778884410 accepts any OTP.
 */
import React, { useState, useRef, useEffect } from 'react';
import { X, Phone, Shield, ArrowRight, Loader } from 'lucide-react';
import { sendOtp, verifyOtp } from '../../lib/quoteApi';

export function OtpModal({ draftId, onSuccess, onClose }) {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [verificationId, setVerificationId] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const otpRefs = useRef([]);

  // Focus first OTP box when step changes
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 80);
    }
  }, [step]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const data = await sendOtp({ phone: cleaned });
      setVerificationId(data.verification_id);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpInput = (index, value) => {
    // Accept only digits; handle paste
    const digits = value.replace(/\D/g, '').split('');
    if (digits.length > 1) {
      // Paste handling — fill from current index
      const next = [...otp];
      digits.slice(0, 6 - index).forEach((d, i) => {
        next[index + i] = d;
      });
      setOtp(next);
      const focusAt = Math.min(index + digits.length, 5);
      otpRefs.current[focusAt]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = digits[0] || '';
    setOtp(newOtp);
    if (digits[0] && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length < 6) {
      setError('Enter the 6-digit code.');
      return;
    }
    setLoading(true);
    try {
      const data = await verifyOtp({
        verificationId,
        otp: code,
        phone: phone.replace(/\D/g, ''),
        draftId,
        name: name.trim() || undefined,
      });
      // data: { access, refresh, contact_id, draft_id }
      onSuccess(data);
    } catch (err) {
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2000] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-700">
          <div className="flex items-center gap-2">
            {step === 'phone' ? (
              <Phone size={18} className="text-amber-400" />
            ) : (
              <Shield size={18} className="text-amber-400" />
            )}
            <h2 className="text-white font-bold text-base">
              {step === 'phone' ? 'Verify your number' : 'Enter OTP'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <p className="text-zinc-400 text-sm">
                We'll send a one-time code to confirm your order.
              </p>
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-1">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-zinc-400 text-xs font-medium block mb-1">
                  Mobile number <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center bg-zinc-800 border border-zinc-600 rounded-lg overflow-hidden focus-within:border-amber-500 transition-colors">
                  <span className="px-3 text-zinc-400 text-sm border-r border-zinc-600 py-2.5">
                    +91
                  </span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={10}
                    inputMode="numeric"
                    required
                    className="flex-1 bg-transparent px-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>
                    Send OTP <ArrowRight size={15} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <p className="text-zinc-400 text-sm">
                Code sent to{' '}
                <span className="text-white font-medium">+91 {phone}</span>.{' '}
                <button
                  type="button"
                  onClick={() => { setStep('phone'); setOtp(['', '', '', '', '', '']); setError(''); }}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Change
                </button>
              </p>

              {/* 6-box OTP input */}
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRefs.current[i] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpInput(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 bg-zinc-800 border border-zinc-600 rounded-lg text-center text-white text-lg font-bold focus:outline-none focus:border-amber-500 transition-colors"
                    aria-label={`OTP digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && <p className="text-red-400 text-xs text-center">{error}</p>}

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
              >
                {loading ? (
                  <Loader size={16} className="animate-spin" />
                ) : (
                  <>
                    Verify &amp; Continue <ArrowRight size={15} />
                  </>
                )}
              </button>

              <p className="text-zinc-600 text-xs text-center">
                Didn't receive?{' '}
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="text-amber-400 hover:text-amber-300 underline"
                >
                  Resend OTP
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
