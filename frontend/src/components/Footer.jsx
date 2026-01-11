import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black py-16 border-t border-metallic-800 text-metallic-400">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="The Metal Store" className="h-8 w-auto grayscale opacity-80" />
                            <span className="font-semibold text-white tracking-widest uppercase">The Metal Store</span>
                        </div>
                        <p className="text-xs text-metallic-600 uppercase tracking-widest">
                            Part of <a href="https://alevate.space" target="_blank" rel="noopener noreferrer" className="hover:text-metallic-300 transition-colors">Alevate Spaces Private Limited</a>
                        </p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-1 text-center md:text-right">
                        <span className="font-bold text-white tracking-wider flex items-center gap-2">
                            🇮🇳 MAKE IN INDIA
                        </span>
                        <span className="text-sm text-metallic-500">Made with Dedication in Vadodara, Gujarat</span>
                    </div>
                </div>

                <div className="border-t border-metallic-900 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-metallic-600">
                    <div>&copy; {new Date().getFullYear()} The Metal Store. All rights reserved.</div>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                        <a href="#" className="hover:text-white transition-colors">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
