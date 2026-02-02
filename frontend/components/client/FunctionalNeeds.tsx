'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { FEATURE_GROUPS } from '@/lib/constants';
import { FEATURES_DATA } from '@/lib/pricing-data';
import { Check, Plus } from 'lucide-react';

export default function FunctionalNeeds() {
    const { inputs, toggleFeature } = usePricingStore();

    return (
        <section className="section bg-[#030712] relative py-8 flex flex-col justify-center">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        What features do you need?
                    </h2>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Assemble your application with these core blocks.
                    </p>
                </motion.div>

                <div className="space-y-16 max-w-5xl mx-auto">
                    {Object.entries(FEATURE_GROUPS).map(([key, group], groupIndex) => (
                        <div key={key} className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: groupIndex * 0.1 }}
                                className="flex items-center gap-4 mb-8"
                            >
                                <div className="h-0.5 w-8 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full" />
                                <h3 className="text-xl font-bold text-white tracking-wide uppercase">
                                    {group.title}
                                </h3>
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {group.features.map((feature, featureIndex) => {
                                    const isSelected = inputs.selectedFeatures.includes(feature.id);

                                    return (
                                        <motion.button
                                            key={feature.id}
                                            onClick={() => toggleFeature(feature.id)}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            viewport={{ once: true, margin: "50px" }}
                                            transition={{ duration: 0.2, delay: (groupIndex * 0.05) + (featureIndex * 0.02) }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className={`
                                                relative p-6 rounded-2xl text-left transition-all duration-300 group overflow-hidden h-full flex flex-col
                                                ${isSelected
                                                    ? 'bg-[#1e1b4b]/30 ring-1 ring-indigo-500/50 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)]'
                                                    : 'bg-white/5 hover:bg-white/10 ring-1 ring-white/10 hover:ring-white/20'
                                                }
                                            `}
                                        >
                                            {/* Selection Gradient Background */}
                                            <div className={`
                                                absolute inset-0 transition-opacity duration-500 pointer-events-none
                                                ${isSelected ? 'opacity-100' : 'opacity-0'}
                                                bg-gradient-to-br from-indigo-500/10 via-transparent to-sky-500/5
                                            `} />

                                            <div className="flex justify-between items-start mb-4 relative z-10 w-full">
                                                <div className={`
                                                    w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                                                    ${isSelected
                                                        ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                                        : 'bg-white/10 text-slate-400 group-hover:text-white group-hover:bg-white/20'
                                                    }
                                                `}>
                                                    {isSelected ? <Check size={16} strokeWidth={3} /> : <Plus size={16} />}
                                                </div>
                                            </div>

                                            <h4 className={`text-lg font-bold mb-2 transition-colors relative z-10 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                                                {feature.name}
                                            </h4>

                                            <p className={`text-sm leading-relaxed transition-colors relative z-10 ${isSelected ? 'text-indigo-200/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                                {feature.description}
                                            </p>
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
