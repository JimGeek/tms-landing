import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { inspirationCategories } from '../data/inspiration';
import { ArrowRight } from 'lucide-react';

const Inspiration = () => {
    return (
        <div className="pt-24 min-h-screen bg-metallic-50">
            <div className="container mx-auto px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-metallic-900 mb-6 font-display">
                        Inspiration Gallery
                    </h1>
                    <p className="text-xl text-metallic-600 max-w-2xl mx-auto">
                        Browse our curated collections to find your perfect design.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {inspirationCategories.map((cat, index) => (
                        <Link to={`/inspiration/${cat.id}`} key={cat.id}>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                whileHover={{ y: -10 }}
                                transition={{ delay: index * 0.1 }}
                                className="group relative h-96 rounded-2xl overflow-hidden cursor-pointer shadow-lg"
                            >
                                <img
                                    src={cat.image}
                                    alt={cat.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <h3 className="text-2xl font-bold text-white mb-2 font-display">{cat.title}</h3>
                                    <p className="text-metallic-300 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0">
                                        {cat.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-metallic-400">{cat.count} Designs</span>
                                        <span className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white group-hover:bg-white group-hover:text-black transition-colors">
                                            <ArrowRight size={20} />
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Inspiration;
