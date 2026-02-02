'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { FEATURE_GROUPS } from '@/lib/constants';
import { FEATURES_DATA } from '@/lib/pricing-data';
import { Check, Plus } from 'lucide-react';

export default function FunctionalNeeds() {
    const { inputs, toggleFeature } = usePricingStore();

    return (
        <section className="section bg-[#030712] relative py-20 min-h-screen flex flex-col justify-center">
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

                <div className="space-y-12 max-w-5xl mx-auto">
                    {Object.entries(FEATURE_GROUPS).map(([key, group], groupIndex) => (
                        <div key={key} className="relative">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: groupIndex * 0.1 }}
                                className="flex items-center gap-3 mb-6"
                            >
                                <div className="h-0.5 w-6 bg-sky-500 rounded-full" />
                                <h3 className="text-xl font-bold text-white tracking-wide uppercase">
                                    {group.title}
                                </h3>
                            </motion.div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {group.features.map((feature, featureIndex) => {
                                    const isSelected = inputs.selectedFeatures.includes(feature.id);

                                    const featureData = FEATURES_DATA.find(f => f.id === feature.id);
                                    const totalHours = featureData
                                        ? Object.values(featureData.baseHours).reduce((a, b) => a + b, 0)
                                        : 0;

                                    return (
                                        <motion.button
                                            key={feature.id}
                                            onClick={() => toggleFeature(feature.id)}
                                            initial={{ opacity: 0, y: 10 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: (groupIndex * 0.1) + (featureIndex * 0.05) }}
                                            whileHover={{ y: -2 }}
                                            className={`
                                                relative p-5 rounded-xl border text-left transition-all duration-300 group overflow-hidden
                                                ${isSelected
                                                    ? 'bg-sky-900/10 border-sky-500/50 shadow-[0_0_20px_-10px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/20'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                                }
                                            `}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className={`
                                                    p-1.5 rounded-lg transition-all duration-300
                                                    ${isSelected ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30' : 'bg-white/5 text-slate-500 group-hover:text-white group-hover:bg-white/10'}
                                                `}>
                                                    {isSelected ? <Check size={14} strokeWidth={3} /> : <Plus size={14} />}
                                                </div>
                                                <div className="text-xs font-mono text-sky-400 bg-sky-500/10 px-2 py-1 rounded">
                                                    {totalHours} hrs
                                                </div>
                                            </div>

                                            <h4 className={`text-base font-bold mb-1.5 transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                                {feature.name}
                                            </h4>

                                            <p className={`text-xs leading-relaxed transition-colors ${isSelected ? 'text-sky-200/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
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
