import React from 'react';
import { Mail, ArrowRight, Phone } from 'lucide-react';

const Contact = () => {
    return (
        <section id="contact" className="py-24 bg-black text-white relative overflow-hidden">
            {/* Background accents */}
            <div className="absolute top-0 right-0 w-1/3 h-full bg-metallic-900/20 skew-x-12" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Text Content */}
                    <div className="lg:w-1/2">
                        <h2 className="text-sm font-semibold tracking-widest uppercase text-metallic-400 mb-3">
                            Get in Touch
                        </h2>
                        <h3 className="text-3xl md:text-5xl font-bold mb-8">
                            Let's craft something <br />
                            <span className="text-metallic-400">extraordinary.</span>
                        </h3>
                        <p className="text-metallic-300 text-lg mb-12 max-w-lg font-light">
                            Ready to start your project? Contact us for a consultation or quote.
                        </p>

                        <div className="flex flex-col gap-6 mb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-metallic-800 rounded-full">
                                    <Mail size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-metallic-400 mb-1">Email us at</p>
                                    <a href="mailto:contact@themetal.store" className="text-2xl font-bold hover:text-metallic-300 transition-colors">
                                        contact@themetal.store
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-metallic-800 rounded-full">
                                    <Phone size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-metallic-400 mb-1">Call / WhatsApp</p>
                                    <a href="https://wa.me/919316723563" target="_blank" rel="noopener noreferrer" className="text-2xl font-bold hover:text-metallic-300 transition-colors">
                                        +91 93167 23563
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:w-1/2 bg-metallic-900/50 backdrop-blur-sm p-8 rounded-3xl border border-metallic-800">
                        <form className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-metallic-400 mb-2">Name</label>
                                    <input type="text" className="w-full bg-black/50 border border-metallic-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="John Doe" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-metallic-400 mb-2">Phone</label>
                                    <input type="tel" className="w-full bg-black/50 border border-metallic-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="+91 98765 43210" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-metallic-400 mb-2">Service of Interest</label>
                                <select className="w-full bg-black/50 border border-metallic-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition-colors text-metallic-300">
                                    <option>Select a service...</option>
                                    <option>Gazebos</option>
                                    <option>Main Gates</option>
                                    <option>Window Grills</option>
                                    <option>Staircases</option>
                                    <option>Swings</option>
                                    <option>Other Custom Fabrication</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-metallic-400 mb-2">Message</label>
                                <textarea rows="4" className="w-full bg-black/50 border border-metallic-700 rounded-lg px-4 py-3 focus:outline-none focus:border-white transition-colors" placeholder="Tell us about your project..." />
                            </div>

                            <button type="submit" className="bg-white text-black font-bold py-4 rounded-xl hover:bg-metallic-200 transition-colors flex items-center justify-center gap-2">
                                Send Message
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Contact;
