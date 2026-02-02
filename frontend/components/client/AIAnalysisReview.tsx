'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Edit3, ArrowRight, Sparkles } from 'lucide-react';
import { AIAnalysis, FEATURE_COSTS } from '@/lib/ai-types';
import { calculatePriceFromAI } from '@/lib/ai-mapper';

interface AIAnalysisReviewProps {
    analysis: AIAnalysis;
    onConfirm: (analysis: AIAnalysis) => void;
    onEdit: () => void;
}

export default function AIAnalysisReview({ analysis, onConfirm, onEdit }: AIAnalysisReviewProps) {
    const [editedAnalysis, setEditedAnalysis] = useState<AIAnalysis>(analysis);
    const priceEstimate = calculatePriceFromAI(editedAnalysis);

    const toggleFeature = (feature: string) => {
        setEditedAnalysis(prev => ({
            ...prev,
            required_features: prev.required_features.includes(feature)
                ? prev.required_features.filter(f => f !== feature)
                : [...prev.required_features, feature]
        }));
    };

    const projectTypeLabels = {
        website: 'Website',
        mobile_app: 'Mobile App',
        web_and_app: 'Web + Mobile App',
        enterprise: 'Enterprise Solution',
        ai_product: 'AI Product'
    };

    const complexityLabels = {
        basic: 'Basic',
        medium: 'Medium',
        advanced: 'Advanced'
    };

    return (
        <section className="section bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 mb-6"
                        >
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                            We Analyzed Your Idea
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Review the extracted details and make any adjustments before getting your estimate.
                        </p>
                    </div>

                    {/* Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {/* Project Type */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-xl p-6"
                        >
                            <h3 className="text-sm text-gray-400 mb-2">Project Type</h3>
                            <p className="text-2xl font-bold text-white">
                                {projectTypeLabels[editedAnalysis.project_type]}
                            </p>
                        </motion.div>

                        {/* Platforms */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass rounded-xl p-6"
                        >
                            <h3 className="text-sm text-gray-400 mb-2">Platforms</h3>
                            <div className="flex gap-2 flex-wrap">
                                {editedAnalysis.platforms.map((platform) => (
                                    <span
                                        key={platform}
                                        className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium capitalize"
                                    >
                                        {platform}
                                    </span>
                                ))}
                            </div>
                        </motion.div>

                        {/* Complexity */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass rounded-xl p-6"
                        >
                            <h3 className="text-sm text-gray-400 mb-2">Complexity Level</h3>
                            <p className="text-2xl font-bold text-white">
                                {complexityLabels[editedAnalysis.complexity_level]}
                            </p>
                        </motion.div>

                        {/* Domain */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass rounded-xl p-6"
                        >
                            <h3 className="text-sm text-gray-400 mb-2">Industry Domain</h3>
                            <p className="text-2xl font-bold text-white capitalize">
                                {editedAnalysis.idea_domain.replace('_', ' ')}
                            </p>
                        </motion.div>
                    </div>

                    {/* Features Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="glass rounded-2xl p-8 mb-8"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-white">Detected Features</h3>
                            <span className="text-sm text-gray-400">
                                Click to toggle features
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.keys(FEATURE_COSTS).map((featureKey, index) => {
                                const feature = FEATURE_COSTS[featureKey];
                                const isSelected = editedAnalysis.required_features.includes(featureKey);

                                return (
                                    <motion.button
                                        key={featureKey}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 + index * 0.05 }}
                                        onClick={() => toggleFeature(featureKey)}
                                        className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${isSelected
                                            ? 'bg-primary-500/10 border-primary-500/50 hover:border-primary-500'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected
                                                ? 'bg-primary-500 border-primary-500'
                                                : 'border-gray-500'
                                                }`}>
                                                {isSelected && (
                                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-white mb-1">
                                                    {feature.description}
                                                </p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-400">
                                                        {feature.category}
                                                    </span>
                                                    <span className="text-sm text-primary-400 font-medium">
                                                        +${(feature.cost / 1000).toFixed(0)}k
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Price Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 }}
                        className="glass rounded-2xl p-8 mb-8 border-2 border-primary-500/30"
                    >
                        <div className="text-center">
                            <p className="text-gray-400 mb-2">Estimated Investment</p>
                            <div className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 mb-4 blur-sm select-none">
                                $ XX,XXX
                            </div>
                            <p className="text-sm text-gray-400">
                                based on {editedAnalysis.required_features.length} features • {complexityLabels[editedAnalysis.complexity_level]} complexity
                            </p>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex gap-4 justify-center"
                    >
                        <button
                            onClick={() => onConfirm(editedAnalysis)}
                            className="btn-primary px-8 py-4 text-lg flex items-center gap-2"
                        >
                            <Sparkles className="w-5 h-5" />
                            Looks Good - Show Full Breakdown
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onEdit}
                            className="btn-secondary px-8 py-4 text-lg flex items-center gap-2"
                        >
                            <Edit3 className="w-5 h-5" />
                            Start Over
                        </button>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
