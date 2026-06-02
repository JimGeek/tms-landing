import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader, ArrowRight, Check } from 'lucide-react';
import { useEnquiry } from '../context/EnquiryContext';
import { submitEnquiry } from '../api/leads';

const EnquiryModal = () => {
  const { open, product, sourcePage, closeEnquiry } = useEnquiry();
  const [form, setForm] = useState({ name: '', phone: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setError('');
      setForm({
        name: '', phone: '', email: '',
        message: product ? `I'm interested in: ${product.name}` : '',
      });
    }
  }, [open, product]);

  if (!open) return null;

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      setError('Name and phone are required.');
      return;
    }
    setStatus('loading');
    setError('');
    try {
      await submitEnquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
        product: product?.name || '',
        productSlug: product?.slug || '',
        sourcePage,
      });
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setError(err.message || 'Something went wrong.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-md overflow-hidden relative"
        >
          <button onClick={closeEnquiry} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>

          <div className="p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={28} />
                </div>
                <h2 className="text-2xl font-bold font-display mb-2">Enquiry received</h2>
                <p className="text-gray-500 mb-6">Our team will reach out shortly with a tailored quote.</p>
                <button onClick={closeEnquiry} className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-metallic-900 transition-colors">Done</button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold font-display mb-2">Request a Quote</h2>
                <p className="text-gray-500 mb-6">
                  {product ? `Tell us about your ${product.name} requirement.` : 'Tell us about your custom project.'}
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="text" required placeholder="Your name"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.name} onChange={(e) => update('name', e.target.value)} />
                  <input type="tel" required placeholder="Phone number"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.phone} onChange={(e) => update('phone', e.target.value)} />
                  <input type="email" placeholder="Email (optional)"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.email} onChange={(e) => update('email', e.target.value)} />
                  <textarea rows="3" placeholder="Your requirement"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 font-medium focus:outline-none focus:ring-2 focus:ring-black/5"
                    value={form.message} onChange={(e) => update('message', e.target.value)} />
                  {error && <p className="text-sm text-red-600">{error}</p>}
                  <button type="submit" disabled={status === 'loading'}
                    className="w-full bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-metallic-900 transition-colors disabled:opacity-70">
                    {status === 'loading' ? <Loader className="animate-spin" /> : <>Submit Enquiry <ArrowRight size={18} /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EnquiryModal;
