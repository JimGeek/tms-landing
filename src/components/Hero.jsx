import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image */}
            <div className="absolute inset-0 z-0">
                <img
                    src="/hero-bg.png"
                    alt="Modern Metal Architecture"
                    className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-6 text-center text-white">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-4xl mx-auto"
                >
                    <h2 className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-metallic-300 mb-4">
                        The Metal Store
                    </h2>
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                        Crafting Vision <br />
                        <span className="text-metallic-400">Into Reality</span>.
                    </h1>
                    <p className="text-lg md:text-xl text-metallic-200 mb-10 max-w-2xl mx-auto font-light">
                        India's first fully managed metal fabrication brand.
                        From gazebos to custom fabrication, we bring
                        premium metal craftsmanship to your doorstep.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a
                            href="#services"
                            className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-metallic-200 transition-colors flex items-center gap-2"
                        >
                            Explore Our Work
                            <ArrowRight size={20} />
                        </a>
                        <a
                            href="#contact"
                            className="px-8 py-4 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
                        >
                            Get a Quote
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 1 }}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
            >
                <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
            </motion.div>
        </section>
    );
};

export default Hero;
