import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingCart, ArrowLeft, Check, Truck, Shield, Box, View } from 'lucide-react';
import { storeProducts } from '../data/store';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import Gate3D from '../components/Gate3D';

const StoreProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState(null);
    const [selections, setSelections] = useState({});
    const [viewMode, setViewMode] = useState('image'); // 'image' or '3d'
    const [price, setPrice] = useState('');

    useEffect(() => {
        const found = storeProducts.find(p => p.id === parseInt(id));
        if (found) {
            setProduct(found);
            setPrice(found.price); // Set initial price

            // Initialize selections with first option
            const initialSelections = {};
            if (found.customizationOptions) {
                found.customizationOptions.forEach(opt => {
                    initialSelections[opt.name] = opt.values[0];
                });
            }
            setSelections(initialSelections);

            // Default to 3D view if available and it's a Gate
            if (found.has3D) {
                setViewMode('3d');
            }
        } else {
            navigate('/store');
        }
    }, [id, navigate]);

    if (!product) return <div className="pt-32 text-center text-xl font-bold">Loading...</div>;

    // Helper to map selection to visualizer material
    const getMaterialKey = () => {
        const color = selections['Finish'] || selections['Color'] || 'Black';
        if (color.includes('Silver')) return 'steel';
        if (color.includes('Gold')) return 'aluminum';
        return 'iron';
    };

    const handleSelectionChange = (optionName, value) => {
        setSelections(prev => ({ ...prev, [optionName]: value }));
    };

    const handleAddToCart = () => {
        // Create descriptive string of selections
        const variantDesc = Object.entries(selections).map(([k, v]) => `${k}: ${v}`).join(', ');
        const variantId = `${product.id}-${Object.values(selections).join('-')}`;

        addToCart({
            ...product, // Base details
            name: `${product.name} (${variantDesc})`,
            id: variantId,
            selectedOptions: selections
        });
    };

    return (
        <div className="pt-24 min-h-screen bg-white">
            <SEO title={product.name} description={product.description} image={product.image} />

            <div className="container mx-auto px-6 py-8">
                <button onClick={() => navigate('/store')} className="flex items-center gap-2 text-gray-500 hover:text-black mb-8 group">
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Store
                </button>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Media Gallery (Image / 3D) */}
                    <div className="flex-1">
                        <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-sm aspect-square relative group">
                            {viewMode === '3d' && product.has3D ? (
                                <div className="w-full h-full">
                                    <Gate3D
                                        width={10}
                                        height={6}
                                        material={getMaterialKey()}
                                        design={product.modelConfig?.style || 'modern'}
                                    />
                                    <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold pointer-events-none flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Live Preview
                                    </div>
                                </div>
                            ) : (
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                            )}

                            {/* View Toggle (Only if 3D is available) */}
                            {product.has3D && (
                                <div className="absolute top-4 right-4 flex gap-2 bg-white/10 backdrop-blur p-1 rounded-full">
                                    <button
                                        onClick={() => setViewMode('image')}
                                        className={`p-2 rounded-full transition-all ${viewMode === 'image' ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-white/50'}`}
                                        title="View Image"
                                    >
                                        <Box size={20} />
                                    </button>
                                    <button
                                        onClick={() => setViewMode('3d')}
                                        className={`p-2 rounded-full transition-all ${viewMode === '3d' ? 'bg-black text-white shadow-lg' : 'text-black hover:bg-white/50'}`}
                                        title="View in 3D"
                                    >
                                        <View size={20} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="flex-1">
                        <div className="mb-6">
                            <span className="text-sm font-bold text-metallic-500 uppercase tracking-wider">{product.category}</span>
                            <h1 className="text-4xl font-bold font-display mt-1 mb-2">{product.name}</h1>
                            <div className="text-3xl font-bold">{price}</div>
                        </div>

                        {/* Dynamic Customization Options */}
                        {product.customizationOptions?.length > 0 && (
                            <div className="space-y-6 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                {product.customizationOptions.map(option => (
                                    <div key={option.name}>
                                        <label className="block text-sm font-bold mb-2 text-gray-700">{option.name}</label>
                                        <div className="flex flex-wrap gap-2">
                                            {option.values.map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleSelectionChange(option.name, val)}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${selections[option.name] === val
                                                        ? 'border-black bg-black text-white shadow-md'
                                                        : 'border-gray-200 bg-white hover:border-black text-gray-700'
                                                        }`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 mb-8">
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-metallic-900 transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-xl shadow-black/10"
                            >
                                <ShoppingCart size={20} /> Add to Order
                            </button>
                            <p className="text-center text-xs text-gray-400">
                                Secure payment via RazorPay • Free Shipping &gt; ₹50k
                            </p>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8 border-l-4 border-black pl-4">
                            {product.description}
                        </p>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-2 gap-4 border-t pt-8">
                            <div className="flex items-center gap-3">
                                <Truck className="text-gray-400" />
                                <span className="text-sm font-medium">Pan-India Delivery</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="text-gray-400" />
                                <span className="text-sm font-medium">5-Year Structural Warranty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StoreProductDetail;
