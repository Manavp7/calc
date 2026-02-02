'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { useState } from 'react';

export default function ProjectDescription() {
    const { inputs, setProjectDescription } = usePricingStore();
    const [charCount, setCharCount] = useState(inputs.projectDescription.length);
    const maxChars = 500;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        if (value.length <= maxChars) {
            setProjectDescription(value);
            setCharCount(value.length);
        }
    };

    return (
        <section id="project-description" className="section bg-black flex flex-col justify-center py-20">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-section-title text-center mb-4">
                        Tell us about your project
                    </h2>
                    <p className="text-gray-400 text-center mb-12 text-lg max-w-3xl mx-auto">
                        Describe your vision in your own words. This helps us understand your unique needs and provide a more accurate estimate.
                    </p>
                </motion.div>

                <motion.div
                    className="max-w-4xl mx-auto"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <div className="relative">
                        <textarea
                            value={inputs.projectDescription}
                            onChange={handleChange}
                            placeholder="Example: I want to build a food delivery app for local restaurants. Users should be able to browse menus, place orders, track deliveries in real time, and save their favorite restaurants. Restaurant owners need a dashboard to manage orders and update menus..."
                            className="w-full h-64 px-6 py-4 bg-white/5 border-2 border-white/10 rounded-2xl text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-0 focus:border-primary-500 transition-all duration-300"
                            style={{
                                fontFamily: 'Inter, sans-serif',
                                fontSize: '16px',
                                lineHeight: '1.6',
                            }}
                        />

                        {/* Character Count */}
                        <div className="absolute bottom-4 right-4 text-sm text-gray-500">
                            {charCount} / {maxChars}
                        </div>

                        {/* Glow Effect */}
                        {inputs.projectDescription.length > 0 && (
                            <motion.div
                                className="absolute inset-0 bg-primary-500/10 rounded-2xl blur-xl -z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            />
                        )}
                    </div>

                    {/* Helpful Tips */}
                    <motion.div
                        className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-2xl mb-2">🎯</div>
                            <h4 className="text-sm font-semibold text-white mb-1">Be Specific</h4>
                            <p className="text-xs text-gray-400">
                                Mention key features, target users, and main goals
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-2xl mb-2">💡</div>
                            <h4 className="text-sm font-semibold text-white mb-1">Share Your Vision</h4>
                            <p className="text-xs text-gray-400">
                                What problem are you solving? Who is it for?
                            </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="text-2xl mb-2">✨</div>
                            <h4 className="text-sm font-semibold text-white mb-1">Think Big</h4>
                            <p className="text-xs text-gray-400">
                                Don't worry about technical details, just describe your idea
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
