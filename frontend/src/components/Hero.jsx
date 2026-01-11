import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const slides = [
    {
        id: 1,
        image: '/hero-bg.png', // Ensure this path is correct or use valid artifact path
        title: <>Crafting Vision <br /><span className="text-metallic-400">Into Reality</span>.</>,
        subtitle: "India's first fully managed metal fabrication brand. From gazebos to custom fabrication, we bring premium metal craftsmanship to your doorstep."
    },
    {
        id: 2,
        image: '/hero_gazebo_modern_pergola_1767735852525.png',
        title: <>Outdoor Living <br /><span className="text-metallic-400">Redefined</span>.</>,
        subtitle: "Experience luxury with our custom-designed modern pergolas and gazebos. Transform your outdoor space into a sanctuary."
    },
    {
        id: 3,
        image: '/service_gate_1767703947984.png',
        title: <>Precision <br /><span className="text-metallic-400">Engineering</span>.</>,
        subtitle: "State-of-the-art CNC cut gates and grills that blend security with aesthetic excellence. tailored to your architectural style."
    }
];

const Hero = () => {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-black">
            {/* Background Image Slider */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0 z-0"
                >
                    <img
                        src={slides[current].image}
                        alt="Hero Slide"
                        className="w-full h-full object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
                </motion.div>
            </AnimatePresence>

            {/* Content using AnimatePresence for text transitions */}
            <div className="relative z-10 container mx-auto px-6 text-center text-white">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={current}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="max-w-4xl mx-auto"
                    >
                        <h2 className="text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-metallic-300 mb-4">
                            The Metal Store
                        </h2>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">
                            {slides[current].title}
                        </h1>
                        <p className="text-lg md:text-xl text-metallic-200 mb-10 max-w-2xl mx-auto font-light">
                            {slides[current].subtitle}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#store"
                                className="px-8 py-4 rounded-full bg-white text-black font-semibold hover:bg-metallic-200 transition-colors flex items-center gap-2"
                            >
                                Explore Collection
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
                </AnimatePresence>
            </div>

            {/* Slider Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hidden md:block"
            >
                <ChevronLeft size={32} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all hidden md:block"
            >
                <ChevronRight size={32} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${current === index ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
};

export default Hero;
