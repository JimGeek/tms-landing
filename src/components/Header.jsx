import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Services', href: '#services' },
        { name: 'Advantages', href: '#advantages' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled || isMobileMenuOpen
                ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-metallic-100 py-4'
                : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <a href="#" className="flex items-center gap-2 group">
                    <img
                        src="/logo.png"
                        alt="The Metal Store"
                        className={`${isScrolled ? 'h-10' : 'h-16'} w-auto object-contain transition-all duration-300 group-hover:scale-105`}
                    />
                    {/* Fallback text if needed, but logo image is preferred */}
                    {/* <span className={`text-xl font-bold tracking-tight ${isScrolled ? 'text-metallic-900' : 'text-white'}`}>THE METAL STORE</span> */}
                </a>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            className={`text-base font-medium tracking-wide transition-colors duration-200 ${isScrolled ? 'text-metallic-700 hover:text-black' : 'text-white hover:text-metallic-300'
                                }`}
                        >
                            {link.name}
                        </a>
                    ))}
                    <a
                        href="mailto:contact@themetal.store"
                        className={`px-5 py-2.5 rounded-full text-base font-semibold transition-all duration-300 ${isScrolled
                            ? 'bg-black text-white hover:bg-metallic-800'
                            : 'bg-black text-white hover:bg-metallic-800 shadow-lg'
                            }`}
                    >
                        Get a Quote
                    </a>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-metallic-800"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-metallic-100 overflow-hidden"
                    >
                        <div className="flex flex-col p-6 gap-4">
                            {navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-metallic-800 hover:text-black"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </a>
                            ))}
                            <a
                                href="mailto:contact@themetal.store"
                                className="mt-4 w-full text-center px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-metallic-800 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Get a Quote
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Header;
