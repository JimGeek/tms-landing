/**
 * Quote.jsx
 * Native TMS quote/cart page.
 *
 * Flow:
 *   1. Load config + categories + full catalogue on mount
 *   2. Customer browses by category, adds items to flat cart (no sections UI)
 *   3. Checkout → saveDraft → OTP modal → verifyOtp → finalizeDraft
 *   4. DepositSummary → Razorpay payment → verifyPayment → Success screen
 *
 * Flat-cart architecture: ONE implicit section named 'Cart'.
 * saveDraft payload always wraps items in: { sections: [{ name:'Cart', items:[...] }] }
 *
 * Route: /quote  (inside MainLayout so nav/footer render)
 */
import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, CheckCircle2, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { ProductCard } from '../components/quote/ProductCard';
import { CartPanel } from '../components/quote/CartPanel';
import { OtpModal } from '../components/quote/OtpModal';
import { DepositSummary } from '../components/quote/DepositSummary';
import { useQuoteStore } from '../lib/quoteStore';
import {
  fetchConfig,
  fetchCategories,
  fetchCatalogue,
  saveDraft,
  finalizeDraft,
} from '../lib/quoteApi';

// ── UI helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <span className="inline-block w-8 h-8 border-2 border-zinc-600 border-t-amber-500 rounded-full animate-spin" />
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="bg-red-900/30 border border-red-700/50 rounded-lg px-4 py-3 flex items-start gap-3">
      <span className="text-red-400 mt-0.5">⚠</span>
      <div className="flex-1">
        <p className="text-red-300 text-sm">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-amber-400 hover:text-amber-300 text-xs mt-1 flex items-center gap-1"
          >
            <RefreshCw size={11} /> Retry
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Quote() {
  // ── Data state ──
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState('');

  // ── Filter state ──
  const [activeCategorySlug, setActiveCategorySlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Flow state ──
  // 'browse' → 'otp' → 'deposit' → 'success'
  const [flowStep, setFlowStep] = useState('browse');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // ── Store ──
  // Select the stable `cart` object and derive lines/count in render. (Calling
  // a selector that returns a NEW array each time — s.cartLines() — caused an
  // infinite re-render: React #185.)
  const cart = useQuoteStore((s) => s.cart);
  const cartLines = Object.values(cart);
  const itemCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const {
    draftId,
    frozenTotal,
    accessToken,
    finalizeResult,
    setDraft,
    setAuth,
    setFinalizeResult,
    clearCart,
  } = useQuoteStore();

  // ── Load data on mount ──
  const loadData = useCallback(async () => {
    setDataLoading(true);
    setDataError('');
    try {
      const [cfg, cats, items] = await Promise.all([
        fetchConfig(),
        fetchCategories(),
        fetchCatalogue(),
      ]);
      setConfig(cfg);
      setCategories(cats);
      setCatalogue(items);
    } catch (err) {
      setDataError(err.message || 'Failed to load products. Please try again.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ── Filtered catalogue ──
  const filteredCatalogue = catalogue.filter((item) => {
    const categoryMatch =
      activeCategorySlug === 'all' ||
      categories.find((c) => c.slug === activeCategorySlug)?.id === item.category;
    const searchMatch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return categoryMatch && searchMatch;
  });

  // ── Checkout: saveDraft → open OTP modal ──
  const handleCheckout = async () => {
    if (cartLines.length === 0) return;
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const result = await saveDraft({
        draftId: draftId || undefined,
        items: cartLines,
      });
      setDraft(result.draft_id, result.frozen_total);
      setFlowStep('otp');
    } catch (err) {
      setCheckoutError(err.message || 'Failed to save cart. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  // ── OTP verified → finalize draft ──
  const handleOtpSuccess = async (authData) => {
    // authData: { access, refresh, contact_id, draft_id }
    setAuth(authData.access, authData.contact_id);
    setFlowStep('browse'); // Close OTP modal while finalizing
    try {
      const result = await finalizeDraft({
        draftId: authData.draft_id || draftId,
        accessToken: authData.access,
      });
      setFinalizeResult(result);
      setFlowStep('deposit');
    } catch (err) {
      setCheckoutError(err.message || 'Failed to finalize order. Please try again.');
    }
  };

  // ── Payment success ──
  const handlePaymentSuccess = () => {
    setFlowStep('success');
  };

  // ── Start over ──
  const handleStartOver = () => {
    clearCart();
    setFlowStep('browse');
    setCheckoutError('');
  };

  // ── Deposit screen ──
  if (flowStep === 'deposit' && finalizeResult) {
    return (
      <div className="min-h-screen bg-[#1F1F1F]">
        <SEO
          title="Complete Your Order | The Metal Store"
          description="Review your order and pay the deposit to confirm your custom metal fabrication."
        />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="mb-8 text-center">
            <h1 className="text-white font-bold text-2xl mb-2">Complete Your Order</h1>
            <p className="text-zinc-400 text-sm">
              Review your order below and pay the deposit to secure your build slot.
            </p>
          </div>
          <DepositSummary
            finalizeResult={finalizeResult}
            draftId={draftId}
            accessToken={accessToken}
            onPaymentSuccess={handlePaymentSuccess}
          />
          <div className="mt-6 text-center">
            <button
              onClick={handleStartOver}
              className="text-zinc-500 hover:text-zinc-300 text-xs underline transition-colors"
            >
              Start a new cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Success screen ──
  if (flowStep === 'success') {
    return (
      <div className="min-h-screen bg-[#1F1F1F] flex items-center justify-center px-4">
        <SEO
          title="Order Placed | The Metal Store"
          description="Your Metal Store order has been placed successfully."
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-zinc-900 border border-zinc-700 rounded-xl px-8 py-10 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-white font-bold text-xl mb-2">Order Placed!</h2>
          <p className="text-zinc-400 text-sm mb-6">
            Your deposit has been received. Our team will reach out within 24 hours to
            confirm your custom build details.
          </p>
          <div className="bg-zinc-800 rounded-lg px-4 py-3 mb-6 text-left space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Quotation</span>
              <span className="text-white font-medium">#{finalizeResult?.quotation_id}</span>
            </div>
          </div>
          <button
            onClick={handleStartOver}
            className="bg-amber-500 hover:bg-amber-400 text-black font-bold py-3 px-6 rounded-lg text-sm transition-colors"
          >
            Start a new order
          </button>
        </motion.div>
      </div>
    );
  }

  // ── Browse screen (main) ──
  return (
    <div className="min-h-screen bg-[#1F1F1F]">
      <SEO
        title="Build Your Cart | The Metal Store"
        description="Browse Door Hardware and Railings. Add to your cart and checkout — custom metal fabricated in-house."
      />

      {/* Page header */}
      <div className="border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-amber-400 text-xs font-bold tracking-widest uppercase mb-1">
                Metal Store
              </p>
              <h1 className="text-white font-bold text-3xl sm:text-4xl leading-tight">
                Build Your Cart
              </h1>
              <p className="text-zinc-400 text-sm mt-1">
                Custom fabricated in-house. Add items, then checkout.
              </p>
            </div>
            {/* Mobile cart summary */}
            {itemCount > 0 && (
              <div className="lg:hidden">
                <span className="bg-amber-500 text-black text-xs font-bold px-3 py-1.5 rounded-full">
                  {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Error banner */}
        {(dataError || checkoutError) && (
          <div className="mb-4">
            <ErrorBanner
              message={dataError || checkoutError}
              onRetry={dataError ? loadData : undefined}
            />
          </div>
        )}

        {dataLoading ? (
          <Spinner />
        ) : (
          <div className="flex gap-6 items-start">
            {/* ── Left: product catalogue ── */}
            <div className="flex-1 min-w-0">
              {/* Filters row */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search */}
                <div className="relative flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products…"
                    className="w-full bg-zinc-800 border border-zinc-600 rounded-lg pl-9 pr-3 py-2.5 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>

                {/* Category tabs */}
                <div className="flex gap-2 items-center overflow-x-auto pb-1 flex-shrink-0">
                  <SlidersHorizontal size={14} className="text-zinc-500 flex-shrink-0" />
                  <button
                    onClick={() => setActiveCategorySlug('all')}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                      activeCategorySlug === 'all'
                        ? 'bg-amber-500 text-black'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-600'
                    }`}
                  >
                    All Products
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => setActiveCategorySlug(cat.slug)}
                      className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                        activeCategorySlug === cat.slug
                          ? 'bg-amber-500 text-black'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-600'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product grid */}
              {filteredCatalogue.length === 0 ? (
                <div className="text-center py-16 text-zinc-500">
                  <p className="text-sm">No products match your filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <AnimatePresence mode="popLayout">
                    {filteredCatalogue.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <ProductCard item={item} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* ── Right: sticky cart panel (desktop) ── */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <CartPanel
                onCheckout={handleCheckout}
                checkoutLoading={checkoutLoading}
              />
            </div>
          </div>
        )}

        {/* Mobile: floating checkout bar */}
        {!dataLoading && itemCount > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 px-4 py-3 z-40">
            <button
              onClick={handleCheckout}
              disabled={checkoutLoading}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors"
            >
              {checkoutLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-black/40 border-t-black rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                `Checkout · ${itemCount} item${itemCount !== 1 ? 's' : ''}`
              )}
            </button>
          </div>
        )}
      </div>

      {/* OTP Modal */}
      <AnimatePresence>
        {flowStep === 'otp' && draftId && (
          <OtpModal
            draftId={draftId}
            onSuccess={handleOtpSuccess}
            onClose={() => setFlowStep('browse')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
