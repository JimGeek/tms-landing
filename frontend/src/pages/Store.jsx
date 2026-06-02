import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, MessageSquare, Filter, ArrowRight, Search } from 'lucide-react';
import SEO from '../components/SEO';
import { useCart } from '../context/CartContext';
import { useEnquiry } from '../context/EnquiryContext';
import { fetchProducts, fetchCategories } from '../api/store';

const Store = ({ isPage = true }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all | stock | made_to_order
    const { addToCart } = useCart();
    const { openEnquiry } = useEnquiry();

    useEffect(() => {
        fetchCategories()
            .then(cats => setCategories(['All', ...cats]))
            .catch(() => { });
    }, []);

    useEffect(() => {
        setLoading(true);
        const t = setTimeout(() => {
            fetchProducts({ search })
                .then(setProducts)
                .catch(() => setProducts([]))
                .finally(() => setLoading(false));
        }, 300); // debounce search
        return () => clearTimeout(t);
    }, [search]);

    const filteredProducts = products.filter(p => {
        const catOk = selectedCategory === 'All' || p.category === selectedCategory;
        const typeOk = typeFilter === 'all' || p.productType === typeFilter;
        return catOk && typeOk;
    });

    return (
        <div className={isPage ? "pt-24 min-h-screen bg-metallic-50" : "py-24 bg-white"}>
            {isPage && (
                <SEO
                    title="Store & Services"
                    description="Browse our collection of premium gates, gazebos, and hardware. Get instant quotes for custom fabrication."
                />
            )}
            <div className="container mx-auto px-6">

                {/* Header Section */}
                <div className="text-center mb-12 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold font-display mb-4 text-black">
                        The Metal Store
                    </h1>
                    <p className="text-lg text-metallic-600">
                        Explore our curated collection of premium hardware and customized fabrication services.
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-md mx-auto mb-8 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-metallic-400" size={18} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search products..."
                        className="w-full bg-white border border-metallic-200 rounded-full py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-black/5"
                    />
                </div>

                {/* Type segment */}
                <div className="flex justify-center mb-6">
                    <div className="inline-flex bg-metallic-100 rounded-full p-1">
                        {[['all', 'All'], ['stock', 'Products'], ['made_to_order', 'Services']].map(([val, label]) => (
                            <button
                                key={val}
                                onClick={() => setTypeFilter(val)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${typeFilter === val ? 'bg-black text-white shadow' : 'text-metallic-600 hover:text-black'}`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Horizontal Filters */}
                <div className="flex justify-center mb-12 overflow-x-auto pb-4 no-scrollbar">
                    <div className="flex bg-metallic-100 p-1 rounded-full">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                                    ? 'bg-black text-white shadow-lg'
                                    : 'text-metallic-600 hover:text-black hover:bg-white/50'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {filteredProducts.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-metallic-100 group flex flex-col h-full"
                            >
                                {/* Clickable Area */}
                                <Link
                                    to={`/store/product/${item.slug}`}
                                    className={'flex-1 flex flex-col cursor-pointer'}
                                >
                                    <div className="h-64 overflow-hidden relative">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-black border border-metallic-100 shadow-sm">
                                            {item.category}
                                        </div>
                                        {item.has3D && (
                                            <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-white flex items-center gap-1 shadow-sm">
                                                <span>3D View</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="text-2xl font-bold mb-2 font-display group-hover:text-metallic-700 transition-colors">{item.name}</h3>
                                        <p className="text-metallic-500 mb-6 line-clamp-2">{item.description}</p>

                                        <div className="mt-auto flex items-end justify-between border-t border-metallic-100 pt-6">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-metallic-400 font-bold uppercase tracking-wider mb-1">Price</span>
                                                <span className="text-xl font-bold text-black font-display">{item.displayPrice}</span>
                                            </div>

                                            {item.productType === 'made_to_order' ? (
                                                <button
                                                    onClick={(e) => { e.preventDefault(); openEnquiry({ product: item, sourcePage: 'store-grid' }); }}
                                                    className="bg-white text-black border border-black px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-black hover:text-white transition-colors"
                                                >
                                                    Get Quote <ArrowRight size={16} />
                                                </button>
                                            ) : (
                                                <div className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 group-hover:bg-metallic-800 transition-colors">
                                                    Buy Now <ArrowRight size={16} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {!loading && filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-metallic-400 text-lg">No products found in this category.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Store;
