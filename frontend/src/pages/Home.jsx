import React from 'react';
import { ArrowRight } from 'lucide-react';
import Store from './Store';
import Advantages from '../components/Advantages';
import { useEnquiry } from '../context/EnquiryContext';

const Home = () => {
    const { openEnquiry } = useEnquiry();
    return (
        <main>
            {/* Store-first hero — full-bleed image band */}
            <section className="relative min-h-[520px] flex items-center overflow-hidden bg-[#0e0e10]">
                <img
                    src="/hero_gazebo_modern_pergola_1767735852525.png"
                    alt="Premium metal fabrication by The Metal Store"
                    className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" />
                <div className="relative z-10 container mx-auto px-6 md:px-10 pt-28 pb-16 max-w-3xl text-white">
                    <p className="text-xs font-bold tracking-[0.34em] uppercase text-metallic-300 mb-4">
                        Fabricated in Vadodara · Since 2014
                    </p>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight uppercase leading-[0.95]">
                        Made of metal.<br /><span className="text-metallic-400">Made for you.</span>
                    </h1>
                    <p className="text-metallic-200 max-w-lg mt-6 mb-8 text-base md:text-lg">
                        Premium gates, gazebos, grills &amp; hardware — buy off the shelf, or commission something custom.
                    </p>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <a href="#store" className="px-7 py-3.5 rounded-lg bg-white text-black font-bold text-sm tracking-wide uppercase hover:bg-metallic-200 transition-colors flex items-center gap-2">
                            Shop the Collection <ArrowRight size={18} />
                        </a>
                        <button onClick={() => openEnquiry({ sourcePage: 'hero' })}
                            className="px-7 py-3.5 rounded-lg border border-white/40 text-white font-bold text-sm tracking-wide uppercase hover:bg-white/10 transition-colors">
                            Start a Custom Project
                        </button>
                    </div>
                </div>
            </section>

            {/* Store grid (already has search + filters) */}
            <section id="store">
                <Store isPage={false} />
            </section>

            {/* Trust strip */}
            <section id="advantages">
                <Advantages />
            </section>
        </main>
    );
};

export default Home;
