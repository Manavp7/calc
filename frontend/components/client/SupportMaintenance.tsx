'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { SUPPORT_PACKAGES } from '@/lib/constants';

export default function SupportMaintenance() {
    const { inputs, setSupportDuration, calculateResults } = usePricingStore();

    return (
        <section className="section bg-gradient-to-b from-gray-900 to-black min-h-screen flex flex-col justify-center">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-section-title text-center mb-4">
                        Support & Maintenance
                    </h2>
                    <p className="text-gray-400 text-center mb-12 text-lg">
                        Choose your post-launch support duration
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
                    {SUPPORT_PACKAGES.map((pkg, index) => (
                        <motion.button
                            key={pkg.id}
                            onClick={() => setSupportDuration(pkg.id)}
                            className={`
                p-8 rounded-2xl border-2 transition-all duration-300
                ${inputs.supportDuration === pkg.id
                                    ? 'border-accent-500 bg-accent-500/10 glow-accent'
                                    : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'
                                }
                card-hover
              `}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <h3 className="text-2xl font-bold mb-2 text-white">
                                {pkg.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-4">
                                {pkg.description}
                            </p>

                            {pkg.monthlyCost > 0 && (
                                <div className="text-primary-400 font-bold text-lg">
                                    ${pkg.monthlyCost.toLocaleString()}/mo
                                </div>
                            )}

                            {inputs.supportDuration === pkg.id && (
                                <motion.div
                                    className="mt-4 w-full h-1 bg-gradient-to-r from-accent-500 to-primary-500 rounded-full"
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ duration: 0.3 }}
                                />
                            )}
                        </motion.button>
                    ))}
                </div>

                {/* Calculate Button */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <button
                        onClick={() => {
                            calculateResults();
                            setTimeout(() => {
                                document.getElementById('results')?.scrollIntoView({
                                    behavior: 'smooth'
                                });
                            }, 100);
                        }}
                        disabled={!inputs.ideaType}
                        className={`
              btn-primary text-xl px-12 py-6
              ${!inputs.ideaType ? 'opacity-50 cursor-not-allowed' : ''}
            `}
                    >
                        Calculate My Estimate
                        <motion.span
                            className="inline-block ml-2"
                            animate={{ x: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            →
                        </motion.span>
                    </button>

                    {!inputs.ideaType && (
                        <p className="text-red-400 mt-4 text-sm">
                            Please select at least an idea type to continue
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
