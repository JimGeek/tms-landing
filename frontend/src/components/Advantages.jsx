import React from 'react';
import { Award, Layers, PenTool, LayoutDashboard, ShieldCheck } from 'lucide-react';

const advantages = [
    {
        icon: <Award size={40} />,
        title: 'First Managed Brand',
        description: 'India\'s first fully managed metal fabrication brand, ensuring professional service standards.'
    },
    {
        icon: <Layers size={40} />,
        title: 'Extensive Variety',
        description: 'A massive collection of materials and finishes to match your exact aesthetic vision.'
    },
    {
        icon: <PenTool size={40} />,
        title: 'Full Customization',
        description: 'If you can dream it, we can fabricate it. Tailored solutions for every requirement.'
    },
    {
        icon: <LayoutDashboard size={40} />,
        title: 'One-Stop Solution',
        description: 'From raw material to final installation, everything related to metal is here.'
    },
    {
        icon: <ShieldCheck size={40} />,
        title: '2-10 Year Warranty',
        description: 'Peace of mind with our substantial warranty coverage on all fabrication work.'
    }
];

const Advantages = () => {
    return (
        <section id="advantages" className="py-24 bg-metallic-100">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-sm font-semibold tracking-widest uppercase text-metallic-600 mb-3">
                        Why Choose Us
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-bold text-metallic-900 mb-6">
                        The Metal Store Advantage
                    </h3>
                    <p className="text-metallic-600 text-lg">
                        We are redefining the metal fabrication industry with professionalism, quality, and trust.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {advantages.map((item, index) => (
                        <div
                            key={index}
                            className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-metallic-100"
                        >
                            <div className="mb-6 text-black p-4 bg-metallic-100 inline-block rounded-xl">
                                {item.icon}
                            </div>
                            <h4 className="text-xl font-bold mb-3 text-metallic-900">{item.title}</h4>
                            <p className="text-metallic-600 leading-relaxed">
                                {item.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Advantages;
