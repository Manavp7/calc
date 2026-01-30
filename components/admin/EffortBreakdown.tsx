'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { FEATURES_DATA } from '@/lib/pricing-data';
import { useState } from 'react';

export default function EffortBreakdown() {
    const { inputs } = usePricingStore();
    const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

    const selectedFeaturesData = FEATURES_DATA.filter(f =>
        inputs.selectedFeatures.includes(f.id)
    );

    if (selectedFeaturesData.length === 0) {
        return (
            <motion.div
                className="glass rounded-2xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h2 className="text-3xl font-bold mb-4">Feature Effort Breakdown</h2>
                <p className="text-gray-400">No features selected</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
        >
            <h2 className="text-3xl font-bold mb-6">Feature Effort Breakdown</h2>
            <p className="text-gray-400 mb-6">
                Detailed hour estimates for each selected feature
            </p>

            <div className="space-y-4">
                {selectedFeaturesData.map((feature, index) => {
                    const isExpanded = expandedFeature === feature.id;
                    const totalHours = Object.values(feature.baseHours).reduce((sum, h) => sum + h, 0);

                    return (
                        <motion.div
                            key={feature.id}
                            className="bg-white/5 rounded-xl overflow-hidden"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                                        {index + 1}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold text-white text-lg">
                                            {feature.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm">
                                            {feature.description}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-primary-400">
                                            {totalHours}h
                                        </p>
                                        <p className="text-gray-400 text-sm">total hours</p>
                                    </div>

                                    <motion.svg
                                        className="w-6 h-6 text-gray-400"
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        animate={{ rotate: isExpanded ? 180 : 0 }}
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </motion.svg>
                                </div>
                            </button>

                            {/* Expanded Content */}
                            {isExpanded && (
                                <motion.div
                                    className="px-6 pb-6"
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                >
                                    <div className="pt-4 border-t border-white/10">
                                        <div className="grid grid-cols-5 gap-4">
                                            {Object.entries(feature.baseHours).map(([role, hours]) => (
                                                <div key={role} className="text-center">
                                                    <div className="bg-white/10 rounded-lg p-4 mb-2">
                                                        <p className="text-3xl font-bold text-white">
                                                            {hours}
                                                        </p>
                                                    </div>
                                                    <p className="text-gray-400 text-sm capitalize">
                                                        {role}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-primary-500/10 border border-primary-500/30 rounded-xl p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-xl font-bold text-white mb-1">
                            Total Feature Hours
                        </h4>
                        <p className="text-gray-400 text-sm">
                            Across {selectedFeaturesData.length} selected feature{selectedFeaturesData.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-bold text-primary-400">
                            {selectedFeaturesData.reduce((sum, f) =>
                                sum + Object.values(f.baseHours).reduce((s, h) => s + h, 0), 0
                            )}h
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
