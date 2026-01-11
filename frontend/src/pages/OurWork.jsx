import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { projects } from '../data/projects';
import { ArrowRight } from 'lucide-react';

const OurWork = () => {
    return (
        <div className="pt-24 min-h-screen bg-metallic-50">
            {/* Header */}
            <div className="bg-black text-white py-20 mb-12">
                <div className="container mx-auto px-6 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold mb-4 font-display"
                    >
                        Our Masterpieces
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-metallic-400 max-w-2xl mx-auto"
                    >
                        Explore a collection of our finest engineering and design achievements.
                    </motion.p>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project, index) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
                        >
                            {/* Image Container */}
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={project.image}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 left-4 bg-black/80 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    {project.category}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <h3 className="text-2xl font-bold text-metallic-900 mb-2 font-display group-hover:text-black transition-colors">
                                    {project.title}
                                </h3>
                                <p className="text-metallic-600 mb-6 line-clamp-2">
                                    {project.summary}
                                </p>
                                <Link
                                    to={`/work/${project.id}`}
                                    className="inline-flex items-center gap-2 text-black font-semibold hover:gap-3 transition-all"
                                >
                                    View Project <ArrowRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OurWork;
