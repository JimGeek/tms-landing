import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const services = [
    {
        title: 'Gazebos',
        description: 'Custom designed outdoor sanctuaries.',
        image: '/hero-bg.png', // Reusing the great hero shot
        colSpan: 'md:col-span-2',
    },
    {
        title: 'Main Gates',
        description: 'Commanding entrances with robust security.',
        image: '/service-gate.png',
        colSpan: 'md:col-span-1',
    },
    {
        title: 'Staircases',
        description: 'Architectural centerpieces for your home.',
        image: '/service-staircase.png',
        colSpan: 'md:col-span-1',
    },
    {
        title: 'Window Grills',
        description: 'Modern patterns meeting safety.',
        image: '/service-grills.png',
        colSpan: 'md:col-span-2',
    },
    {
        title: 'Outdoor & Indoor Swings',
        description: 'Relaxation engineered with elegance.',
        image: '/service-swing.png',
        colSpan: 'md:col-span-3',
    },
];

const Services = () => {
    return (
        <section id="services" className="py-24 bg-white">
            <div className="container mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-16 text-center"
                >
                    <h2 className="text-sm font-semibold tracking-widest uppercase text-metallic-500 mb-3">
                        Our Expertise
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-metallic-900">
                        Premium Metal Fabrication
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {services.map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1, duration: 0.6 }}
                            className={`group relative h-[400px] overflow-hidden rounded-2xl bg-metallic-100 ${service.colSpan}`}
                        >
                            {/* Image */}
                            <img
                                src={service.image}
                                alt={service.title}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 opacity-60 group-hover:opacity-80" />

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 p-8 w-full text-white">
                                <div className="transform translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                                    <h4 className="text-2xl font-bold mb-2">{service.title}</h4>
                                    <p className="text-metallic-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                        {service.description}
                                    </p>
                                </div>

                                <div className="absolute top-8 right-8 opacity-0 -translate-y-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-black transition-colors">
                                        <ArrowUpRight size={24} />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;
