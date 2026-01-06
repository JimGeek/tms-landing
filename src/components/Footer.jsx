import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black py-12 border-t border-metallic-800 text-metallic-400">
            <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <img src="/logo.png" alt="The Metal Store" className="h-8 w-auto grayscale opacity-80" />
                    <span className="font-semibold text-metallic-500">THE METAL STORE</span>
                </div>

                <div className="text-sm">
                    &copy; {new Date().getFullYear()} The Metal Store. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
