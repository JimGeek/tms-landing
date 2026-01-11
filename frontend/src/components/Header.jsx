import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingBag, Phone } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './auth/LoginModal';
import { useCart } from '../context/CartContext';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { setIsCartOpen, cartItems } = useCart();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isHome = location.pathname === '/';

    const handleNavigation = (e, href) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);

        if (href.startsWith('#')) {
            const elementId = href.substring(1);
            if (isHome) {
                const element = document.getElementById(elementId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            } else {
                navigate('/');
                setTimeout(() => {
                    const element = document.getElementById(elementId);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth' });
                    }
                }, 100);
            }
        } else {
            navigate(href);
            window.scrollTo(0, 0);
        }
    };

    const navLinks = [
        { name: 'Our Work', href: '/work' },
        { name: 'Inspiration', href: '/inspiration' },
        { name: 'About', href: '/about' },
        { name: 'Contact', href: '#contact' },
    ];

    const headerClass = !isHome || isScrolled || isMobileMenuOpen
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-metallic-100 py-4'
        : 'bg-transparent py-6';

    const textColorClass = !isHome || isScrolled
        ? 'text-metallic-700 hover:text-black'
        : 'text-white hover:text-metallic-300';

    const logoSizeClass = !isHome || isScrolled ? 'h-10' : 'h-16';

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group" onClick={() => window.scrollTo(0, 0)}>
                        <img
                            src="/logo.png"
                            alt="The Metal Store"
                            className={`${logoSizeClass} w-auto object-contain transition-all duration-300 group-hover:scale-105`}
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={(e) => handleNavigation(e, link.href)}
                                className={`text-base font-medium tracking-wide transition-colors duration-200 cursor-pointer ${textColorClass}`}
                            >
                                {link.name}
                            </a>
                        ))}

                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={`relative p-2 rounded-full transition-colors ${textColorClass}`}
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setIsLoginOpen(true)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-base transition-all ${!isHome || isScrolled
                                ? 'bg-black text-white hover:bg-metallic-800'
                                : 'bg-white text-black hover:bg-metallic-100'
                                }`}
                        >
                            <User size={18} />
                            Login
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={`relative p-2 rounded-full transition-colors ${!isHome || isScrolled ? 'text-black' : 'text-white'}`}
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <button
                            className="p-2 text-metallic-800"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} className={!isHome || isScrolled ? 'text-black' : 'text-white'} />}
                        </button>
                    </div>
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
                                        onClick={(e) => handleNavigation(e, link.href)}
                                        className="text-lg font-medium text-metallic-800 hover:text-black"
                                    >
                                        {link.name}
                                    </a>
                                ))}
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
                                    className="mt-4 w-full text-center px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-metallic-800 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User size={18} /> Login / Sign Up
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    );
};

export default Header;
