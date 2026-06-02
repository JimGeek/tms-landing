import React from 'react';
import { ArrowRight } from 'lucide-react';
import Store from './Store';
import Advantages from '../components/Advantages';
import { useEnquiry } from '../context/EnquiryContext';

const Home = () => {
    const { openEnquiry } = useEnquiry();
    return (
        <main>
            {/* Store-first hero */}
            <section className="pt-32 pb-10 bg-white text-center px-6">
                <p className="text-xs font-bold tracking-[0.32em] uppercase text-metallic-500 mb-4">
                    Fabricated in Vadodara · Since 2014
                </p>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight uppercase leading-[0.98] text-black">
                    Made of metal.<br /><span className="text-metallic-400">Made for you.</span>
                </h1>
                <p className="text-metallic-600 max-w-xl mx-auto mt-5 mb-8 text-base md:text-lg">
                    Premium gates, gazebos, grills &amp; hardware — buy off the shelf, or commission something custom.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <a href="#store" className="px-7 py-3.5 rounded-lg bg-black text-white font-bold text-sm tracking-wide uppercase hover:bg-metallic-800 transition-colors flex items-center gap-2">
                        Shop the Collection <ArrowRight size={18} />
                    </a>
                    <button onClick={() => openEnquiry({ sourcePage: 'hero' })}
                        className="px-7 py-3.5 rounded-lg border border-metallic-300 text-black font-bold text-sm tracking-wide uppercase hover:bg-metallic-50 transition-colors">
                        Start a Custom Project
                    </button>
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
