import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, ShoppingBag, LogOut, ChevronDown } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginModal from './auth/LoginModal';
import { useCart } from '../lib/cart/cartStore.js';
import { useAuth } from '../context/AuthContext';

const firstName = (u) => {
    if (!u) return '';
    const raw = (u.name || u.full_name || u.first_name || u.phone || '').toString().trim();
    if (!raw) return '';
    return raw.split(/\s+/)[0];
};

const initial = (u) => {
    const fn = firstName(u);
    return fn ? fn[0].toUpperCase() : 'U';
};

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const openDrawer = useCart((s) => s.openDrawer);
    const cartCount = useCart((s) => s.itemCount());
    const setIsCartOpen = () => openDrawer();
    const { user, logout } = useAuth();
    const isAuthed = !!user;

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Click-outside to close the user menu
    useEffect(() => {
        if (!isUserMenuOpen) return;
        const onClick = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setIsUserMenuOpen(false);
            }
        };
        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, [isUserMenuOpen]);

    const isHome = location.pathname === '/';

    const handleNavigation = (e, href) => {
        e.preventDefault();
        setIsMobileMenuOpen(false);
        if (href.startsWith('#')) {
            const elementId = href.substring(1);
            if (isHome) {
                document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/');
                setTimeout(() => {
                    document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        } else {
            navigate(href);
            window.scrollTo(0, 0);
        }
    };

    const navLinks = [
        { name: 'Shop', href: '/' },
        { name: 'Our Work', href: '/work' },
        { name: 'Inspiration', href: '/inspiration' },
        { name: 'About', href: '/about' },
    ];

    const headerClass = !isHome || isScrolled || isMobileMenuOpen
        ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-metallic-100 py-4'
        : 'bg-transparent py-6';

    const textColorClass = !isHome || isScrolled
        ? 'text-metallic-700 hover:text-black'
        : 'text-white hover:text-metallic-300';

    const logoSizeClass = !isHome || isScrolled ? 'h-10' : 'h-16';
    const darkOnLight = !isHome || isScrolled;

    const handleLogout = () => {
        setIsUserMenuOpen(false);
        logout();
    };

    return (
        <>
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${headerClass}`}>
                <div className="container mx-auto px-6 flex items-center justify-between">
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
                            aria-label="Open cart"
                        >
                            <ShoppingBag size={24} />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {isAuthed ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen((o) => !o)}
                                    className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-full font-semibold text-sm transition-all border ${darkOnLight
                                        ? 'bg-white text-metallic-900 border-metallic-200 hover:bg-metallic-100'
                                        : 'bg-white/95 text-metallic-900 border-white/40 hover:bg-white'
                                        }`}
                                    aria-haspopup="menu"
                                    aria-expanded={isUserMenuOpen}
                                >
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-metallic-900 text-white font-bold text-[13px]">
                                        {initial(user)}
                                    </span>
                                    <span className="max-w-[120px] truncate">{firstName(user) || 'Account'}</span>
                                    <ChevronDown size={14} className="opacity-70" />
                                </button>

                                <AnimatePresence>
                                    {isUserMenuOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            transition={{ duration: 0.14 }}
                                            role="menu"
                                            className="absolute right-0 mt-2 min-w-[220px] bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden z-50"
                                        >
                                            <div className="px-4 pt-3 pb-3 border-b border-metallic-100">
                                                <div className="text-xs uppercase tracking-wider text-metallic-400 font-bold">
                                                    Signed in as
                                                </div>
                                                <div className="text-sm font-semibold text-metallic-900 truncate">
                                                    {user?.name || user?.full_name || 'Account'}
                                                </div>
                                                {user?.phone && (
                                                    <div className="text-xs text-metallic-500 mt-0.5">
                                                        +91 {user.phone}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-3 text-left text-sm font-medium text-metallic-800 hover:bg-metallic-50 flex items-center gap-2"
                                                role="menuitem"
                                            >
                                                <LogOut size={16} className="opacity-70" /> Log out
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsLoginOpen(true)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-base transition-all ${darkOnLight
                                    ? 'bg-black text-white hover:bg-metallic-800'
                                    : 'bg-white text-black hover:bg-metallic-100'
                                    }`}
                            >
                                <User size={18} />
                                Login
                            </button>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className={`relative p-2 rounded-full transition-colors ${darkOnLight ? 'text-black' : 'text-white'}`}
                            aria-label="Open cart"
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
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} className={darkOnLight ? 'text-black' : 'text-white'} />}
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

                                {isAuthed ? (
                                    <div className="mt-4 pt-4 border-t border-metallic-100">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-metallic-900 text-white font-bold">
                                                {initial(user)}
                                            </span>
                                            <div>
                                                <div className="text-sm font-semibold text-metallic-900 truncate">
                                                    {user?.name || user?.full_name || 'Account'}
                                                </div>
                                                {user?.phone && (
                                                    <div className="text-xs text-metallic-500">+91 {user.phone}</div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                                            className="w-full text-center px-6 py-3 rounded-full bg-metallic-100 text-metallic-900 font-semibold hover:bg-metallic-200 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <LogOut size={16} /> Log out
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }}
                                        className="mt-4 w-full text-center px-6 py-3 rounded-full bg-black text-white font-semibold hover:bg-metallic-800 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <User size={18} /> Login / Sign Up
                                    </button>
                                )}
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
