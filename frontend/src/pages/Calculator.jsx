import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Ruler, CheckCircle2, Calculator as CalcIcon, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import Gate3D from '../components/Gate3D'; // We will create this next
import SEO from '../components/SEO';

const Calculator = () => {
    const [step, setStep] = useState(1);
    const [dimensions, setDimensions] = useState({ width: 10, height: 6 });
    const [material, setMaterial] = useState('iron'); // iron, steel, aluminum
    const [design, setDesign] = useState('modern'); // modern, classic, minimal
    const [contact, setContact] = useState({ email: '', phone: '' });
    const [showQuote, setShowQuote] = useState(false);

    const materials = [
        { id: 'iron', name: 'Wrought Iron', rate: 120, desc: 'Classic, heavy, durable.' },
        { id: 'steel', name: 'Stainless Steel (304)', rate: 350, desc: 'Modern, rust-proof, premium.' },
        { id: 'aluminum', name: 'Aluminum', rate: 280, desc: 'Lightweight, modern, corrosion-resistant.' },
    ];

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    const calculateEstimate = () => {
        const area = dimensions.width * dimensions.height;
        const selectedMat = materials.find(m => m.id === material);
        const basePrice = area * selectedMat.rate;
        // Design complexity multipliers
        const multipliers = { modern: 1.2, classic: 1.5, minimal: 1.0 };
        return Math.round(basePrice * multipliers[design]);
    };

    const handleGetQuote = (e) => {
        e.preventDefault();
        // Here you would send lead to backend
        setShowQuote(true);
    };

    return (
        <div className="pt-24 min-h-screen bg-metallic-50">
            <SEO title="Cost Calculator - Get Instant Quote" description="Estimate the cost of your custom gate or railing instantly." />

            <div className="container mx-auto px-6 py-8">
                <div className="flex flex-col lg:flex-row gap-12 h-[80vh]">

                    {/* Left: 3D Visualizer */}
                    <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-inner relative overflow-hidden flex flex-col">
                        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                            <RefreshCw size={12} className="animate-spin-slow" /> Live 3D Preview
                        </div>

                        <div className="flex-1 w-full h-full">
                            <Gate3D width={dimensions.width} height={dimensions.height} material={material} design={design} />
                        </div>

                        {/* Dimensions Inputs Overlay */}
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg flex gap-6 z-10 w-11/12 max-w-sm">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Width (ft)</label>
                                <input
                                    type="range" min="3" max="20" step="0.5"
                                    value={dimensions.width}
                                    onChange={(e) => setDimensions({ ...dimensions, width: parseFloat(e.target.value) })}
                                    className="w-full accent-black mt-1"
                                />
                                <div className="text-center font-bold">{dimensions.width} ft</div>
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Height (ft)</label>
                                <input
                                    type="range" min="3" max="12" step="0.5"
                                    value={dimensions.height}
                                    onChange={(e) => setDimensions({ ...dimensions, height: parseFloat(e.target.value) })}
                                    className="w-full accent-black mt-1"
                                />
                                <div className="text-center font-bold">{dimensions.height} ft</div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Wizard Form */}
                    <div className="flex-1 max-w-lg mx-auto w-full flex flex-col justify-center">
                        <div className="mb-8">
                            <h1 className="text-4xl font-bold font-display mb-2">Build Your Gate</h1>
                            <div className="flex gap-2">
                                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
                                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
                                <div className={`h-1 flex-1 rounded-full ${step >= 3 ? 'bg-black' : 'bg-gray-200'}`} />
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Choose Material</h2>
                                    <div className="space-y-4">
                                        {materials.map(mat => (
                                            <button
                                                key={mat.id}
                                                onClick={() => setMaterial(mat.id)}
                                                className={`w-full p-4 rounded-xl border-2 text-left transition-all ${material === mat.id
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-transparent bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-lg">{mat.name}</span>
                                                    {material === mat.id && <CheckCircle2 size={20} />}
                                                </div>
                                                <p className={`text-sm ${material === mat.id ? 'text-gray-300' : 'text-gray-500'}`}>{mat.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={nextStep} className="mt-8 w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 flex items-center justify-center gap-2">
                                        Next: Design Style <ArrowRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">Select Design Style</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        {['modern', 'classic', 'minimal'].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDesign(d)}
                                                className={`p-6 rounded-xl border-2 capitalize font-bold text-center transition-all ${design === d
                                                        ? 'border-black bg-black text-white shadow-lg'
                                                        : 'border-transparent bg-white hover:bg-gray-50'
                                                    }`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex gap-4 mt-8">
                                        <button onClick={prevStep} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-black hover:bg-gray-100">
                                            Back
                                        </button>
                                        <button onClick={nextStep} className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 flex items-center justify-center gap-2">
                                            Next: Get Quote <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && !showQuote && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    <h2 className="text-2xl font-bold mb-6">See Your Price</h2>
                                    <p className="text-gray-600 mb-6">Enter your details to reveal the instant estimated cost for this project.</p>
                                    <form onSubmit={handleGetQuote} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Email Address</label>
                                            <input
                                                type="email" required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                                placeholder="john@example.com"
                                                value={contact.email}
                                                onChange={e => setContact({ ...contact, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">Phone Number</label>
                                            <input
                                                type="tel" required
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                                                placeholder="+91 98765 43210"
                                                value={contact.phone}
                                                onChange={e => setContact({ ...contact, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-4 mt-8">
                                            <button type="button" onClick={prevStep} className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:text-black hover:bg-gray-100">
                                                Back
                                            </button>
                                            <button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 flex items-center justify-center gap-2">
                                                Safe Estimates <CalcIcon size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {showQuote && (
                                <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                                    <div className="bg-black text-white p-8 rounded-2xl text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-metallic-700/20 rounded-full blur-3xl" />
                                        <h2 className="text-xl font-medium text-metallic-300 mb-2">Estimated Cost</h2>
                                        <div className="text-5xl font-bold mb-2 break-words">₹ {calculateEstimate().toLocaleString()}</div>
                                        <p className="text-sm text-metallic-400 mb-8">*Approximate cost including fabrication. Installation extra.</p>

                                        <div className="bg-white/10 rounded-xl p-4 text-left space-y-2 mb-8">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-metallic-300">Dimensions</span>
                                                <span className="font-bold">{dimensions.width}' x {dimensions.height}' ({dimensions.width * dimensions.height} sq.ft)</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-metallic-300">Material</span>
                                                <span className="font-bold capitalize">{materials.find(m => m.id === material).name}</span>
                                            </div>
                                        </div>

                                        <button className="w-full bg-white text-black py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                                            Book Consultation Call
                                        </button>
                                    </div>
                                    <button onClick={() => setShowQuote(false)} className="mt-4 w-full text-center text-gray-500 underline">
                                        Edit Configuration
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Calculator;
