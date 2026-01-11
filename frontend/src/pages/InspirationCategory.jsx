import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';
import { getCategoryImages, inspirationCategories } from '../data/inspiration';
import { ArrowLeft, ZoomIn } from 'lucide-react';

const InspirationCategory = () => {
    const { categoryId } = useParams();
    const images = getCategoryImages(categoryId);
    const categoryInfo = inspirationCategories.find(c => c.id === categoryId);

    const breakpointColumnsObj = {
        default: 3,
        1100: 2,
        700: 1
    };

    if (!categoryInfo) return <div className="pt-32 text-center">Category not found</div>;

    return (
        <div className="pt-24 min-h-screen bg-metallic-50">
            <div className="container mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
                    <div>
                        <Link to="/inspiration" className="inline-flex items-center text-metallic-600 hover:text-black mb-4 transition-colors">
                            <ArrowLeft size={20} className="mr-2" /> Back to Collections
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-bold font-display text-metallic-900">
                            {categoryInfo.title}
                        </h1>
                    </div>
                </div>

                {/* Masonry Grid */}
                <Masonry
                    breakpointCols={breakpointColumnsObj}
                    className="my-masonry-grid flex w-auto -ml-8"
                    columnClassName="my-masonry-grid_column pl-8 bg-clip-padding"
                >
                    {images.map((img, index) => (
                        <motion.div
                            key={img.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.05 }}
                            className="mb-8 group relative rounded-xl overflow-hidden cursor-zoom-in"
                        >
                            <img
                                src={img.src}
                                alt={img.title}
                                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                style={{ minHeight: '200px' }}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white bg-black/50 p-3 rounded-full backdrop-blur-sm transition-opacity duration-300">
                                    <ZoomIn size={24} />
                                </span>
                            </div>
                            <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <p className="text-white font-medium">{img.title}</p>
                            </div>
                        </motion.div>
                    ))}
                </Masonry>
            </div>
        </div>
    );
};

export default InspirationCategory;
