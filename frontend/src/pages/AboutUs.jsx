import React from 'react';
import { motion } from 'framer-motion';
import { Users, Factory, Award, Target, PenTool, Wrench, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    return (
        <div className="pt-24 min-h-screen bg-white">
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-12 md:py-20 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl font-bold font-display text-metallic-900 mb-6"
                >
                    Redefining Metal Fabrication
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl text-metallic-600 max-w-3xl mx-auto leading-relaxed"
                >
                    We are India's first fully managed metal fabrication brand, bridging the gap between artistic vision and industrial precision.
                </motion.p>
            </div>

            {/* Our Story */}
            <section className="py-20 bg-metallic-50">
                <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-4xl font-bold font-display mb-6">Our Story</h2>
                        <div className="space-y-4 text-metallic-700 text-lg">
                            <p>
                                The Metal Store was born from a simple observation: the metal fabrication sector in India was fragmented, unorganized, and often lacked transparency. Homeowners and architects struggled to find reliable partners who could deliver high-quality, custom metalwork on time.
                            </p>
                            <p>
                                We set out to change that. By combining traditional craftsmanship with modern project management and state-of-the-art technology, we created a seamless experience for our clients.
                            </p>
                            <p>
                                Today, we are proud to be the one-stop solution for gates, gazebos, railings, and structural art, delivering excellence across the country.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative h-96 rounded-2xl overflow-hidden shadow-xl"
                    >
                        <img
                            src="/hero-bg.png"
                            alt="Our Workshop"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                    </motion.div>
                </div>
            </section>

            {/* Stats / Features */}
            <section className="py-20 bg-black text-white">
                <div className="container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div className="p-4">
                        <Users className="w-10 h-10 mx-auto mb-4 text-metallic-400" />
                        <h3 className="text-4xl font-bold mb-2">500+</h3>
                        <p className="text-metallic-400">Projects Completed</p>
                    </div>
                    <div className="p-4">
                        <Factory className="w-10 h-10 mx-auto mb-4 text-metallic-400" />
                        <h3 className="text-4xl font-bold mb-2">25k</h3>
                        <p className="text-metallic-400">Sq. Ft. Facility</p>
                    </div>
                    <div className="p-4">
                        <Award className="w-10 h-10 mx-auto mb-4 text-metallic-400" />
                        <h3 className="text-4xl font-bold mb-2">10 Yr</h3>
                        <p className="text-metallic-400">Warranty</p>
                    </div>
                    <div className="p-4">
                        <Target className="w-10 h-10 mx-auto mb-4 text-metallic-400" />
                        <h3 className="text-4xl font-bold mb-2">100%</h3>
                        <p className="text-metallic-400">On-Time Delivery</p>
                    </div>
                </div>
            </section>

            {/* Process */}
            <section className="py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">How We Work</h2>
                        <p className="text-metallic-600">From concept to installation, we handle everything.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: PenTool,
                                title: "Design & Consultation",
                                desc: "We sit down with you to understand your vision. Our designers create detailed 3D models and CAD drawings for your approval."
                            },
                            {
                                icon: Wrench,
                                title: "Precision Fabrication",
                                desc: "At our facility, skilled artisans and modern CNC machines bring the design to life using high-grade materials and protective coatings."
                            },
                            {
                                icon: Truck,
                                title: "Installation",
                                desc: "Our expert team transports and installs the structure at your site, ensuring perfect fit and finish with minimal disruption."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="bg-metallic-50 p-8 rounded-2xl border border-metallic-100 text-center"
                            >
                                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                                    <step.icon className="w-8 h-8 text-black" />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                                <p className="text-metallic-600">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Founders/Team */}
            <section className="py-20 bg-metallic-900 text-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold font-display mb-4">Meet The Team</h2>
                        <p className="text-metallic-400">The minds behind the metal.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {/* Founder 1 */}
                        <div className="bg-metallic-800 rounded-xl overflow-hidden text-center group">
                            <div className="h-80 bg-metallic-700 w-full mb-6 relative overflow-hidden">
                                {/* Placeholder for founder image */}
                                <div className="absolute inset-0 flex items-center justify-center text-metallic-500 font-bold text-xl">
                                    Founder Image
                                </div>
                            </div>
                            <div className="pb-8 px-6">
                                <h3 className="text-2xl font-bold mb-1">Founder Name</h3>
                                <p className="text-metallic-400 mb-4">Co-Founder & CEO</p>
                                <p className="text-sm text-metallic-300">
                                    Visionary leader with 15+ years in infrastructure and design.
                                </p>
                            </div>
                        </div>
                        {/* Founder 2 */}
                        <div className="bg-metallic-800 rounded-xl overflow-hidden text-center group">
                            <div className="h-80 bg-metallic-700 w-full mb-6 relative overflow-hidden">
                                {/* Placeholder for founder image */}
                                <div className="absolute inset-0 flex items-center justify-center text-metallic-500 font-bold text-xl">
                                    Founder Image
                                </div>
                            </div>
                            <div className="pb-8 px-6">
                                <h3 className="text-2xl font-bold mb-1">Co-Founder Name</h3>
                                <p className="text-metallic-400 mb-4">Head of Operations</p>
                                <p className="text-sm text-metallic-300">
                                    Expert in manufacturing processes and quality control.
                                </p>
                            </div>
                        </div>
                        {/* Founder 3 / Team */}
                        <div className="bg-metallic-800 rounded-xl overflow-hidden text-center group">
                            <div className="h-80 bg-metallic-700 w-full mb-6 relative overflow-hidden">
                                {/* Placeholder for founder image */}
                                <div className="absolute inset-0 flex items-center justify-center text-metallic-500 font-bold text-xl">
                                    Team Image
                                </div>
                            </div>
                            <div className="pb-8 px-6">
                                <h3 className="text-2xl font-bold mb-1">Our Artisans</h3>
                                <p className="text-metallic-400 mb-4">The Core Team</p>
                                <p className="text-sm text-metallic-300">
                                    A dedicated team of 50+ skilled fabricators and engineers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 text-center">
                <h2 className="text-3xl font-bold mb-6">Ready to create something unique?</h2>
                <Link
                    to="/contact"
                    className="inline-block bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-metallic-800 transition-colors shadow-lg"
                >
                    Get in Touch
                </Link>
            </section>
        </div>
    );
};

export default AboutUs;
