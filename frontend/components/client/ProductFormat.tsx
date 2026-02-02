'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { PRODUCT_FORMATS } from '@/lib/constants';
import { Monitor, Smartphone, Globe, Layers } from 'lucide-react';

export default function ProductFormat() {
    const { inputs, setProductFormat } = usePricingStore();

    // Helper to get icons if not in constants
    const getIcon = (id: string) => {
        if (id.includes('web')) return <Globe size={28} />;
        if (id.includes('mobile')) return <Smartphone size={28} />;
        if (id.includes('both')) return <Layers size={28} />;
        return <Monitor size={28} />;
    };

    return (
        <section className="section relative py-8 overflow-hidden bg-[#030712] flex flex-col justify-center">
            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <span className="inline-block py-0.5 px-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-purple-300 mb-4 backdrop-blur-md">
                        Step 02
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">
                        Choose your platform
                    </h2>
                    <p className="text-slate-400 text-lg font-light">
                        Where will your product live?
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4">
                    {PRODUCT_FORMATS.map((format, index) => {
                        const isSelected = inputs.productFormat === format.id;

                        return (
                            <motion.button
                                key={format.id}
                                onClick={() => setProductFormat(format.id)}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "50px" }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                className={`
                                    relative p-6 rounded-2xl flex flex-col items-center text-center transition-all duration-300 overflow-hidden group
                                    ${isSelected
                                        ? 'bg-purple-900/20 ring-1 ring-purple-500 shadow-[0_0_30px_-10px_rgba(168,85,247,0.3)]'
                                        : 'bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20'
                                    }
                                `}
                            >
                                {/* Vivid Background Gradient */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-transparent opacity-100" />
                                )}

                                {/* Icon Circle */}
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-300
                                    ${isSelected
                                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'bg-[#151720] text-gray-500 group-hover:text-white group-hover:bg-[#1a1d26]'
                                    }
                                `}>
                                    <div className={`transform transition-transform duration-300 ${isSelected ? 'scale-110' : 'group-hover:scale-105'}`}>
                                        {/* Use icons from constants or fallback */}
                                        {/* @ts-ignore - Assuming format might have icon, if not fallback to generic visual */}
                                        {format.icon || getIcon(format.id)}
                                    </div>
                                </div>

                                <h3 className={`text-lg font-bold mb-2 transition-colors ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                    {format.title}
                                </h3>

                                <p className={`text-xs text-center leading-relaxed transition-colors ${isSelected ? 'text-purple-200/70' : 'text-gray-500 group-hover:text-gray-400'}`}>
                                    {format.description}
                                </p>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function TiltCard() { return null; }
