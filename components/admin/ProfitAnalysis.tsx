'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';

export default function ProfitAnalysis() {
    const { clientPrice, internalCost, profitAnalysis } = usePricingStore();

    if (!profitAnalysis || !clientPrice || !internalCost) return null;

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-400';
            case 'warning':
                return 'text-yellow-400';
            case 'critical':
                return 'text-red-400';
            default:
                return 'text-gray-400';
        }
    };

    const getHealthBg = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500/20 border-green-500/50';
            case 'warning':
                return 'bg-yellow-500/20 border-yellow-500/50';
            case 'critical':
                return 'bg-red-500/20 border-red-500/50';
            default:
                return 'bg-gray-500/20 border-gray-500/50';
        }
    };

    return (
        <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <h2 className="text-3xl font-bold mb-6">Profit Analysis</h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Client Price */}
                <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Client Price</p>
                    <p className="text-3xl font-bold text-primary-400">
                        ${profitAnalysis.clientPrice.toLocaleString()}
                    </p>
                </div>

                {/* Internal Cost */}
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Internal Cost</p>
                    <p className="text-3xl font-bold text-orange-400">
                        ${profitAnalysis.internalCost.toLocaleString()}
                    </p>
                </div>

                {/* Profit */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                    <p className="text-gray-400 text-sm mb-2">Profit</p>
                    <p className="text-3xl font-bold text-green-400">
                        ${profitAnalysis.profit.toLocaleString()}
                    </p>
                </div>

                {/* Margin */}
                <div className={`${getHealthBg(profitAnalysis.healthStatus)} border rounded-xl p-6`}>
                    <p className="text-gray-400 text-sm mb-2">Profit Margin</p>
                    <p className={`text-3xl font-bold ${getHealthColor(profitAnalysis.healthStatus)}`}>
                        {profitAnalysis.profitMargin.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Health Indicator */}
            <div className={`${getHealthBg(profitAnalysis.healthStatus)} border rounded-xl p-6`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold mb-2">
                            Project Health:{' '}
                            <span className={getHealthColor(profitAnalysis.healthStatus)}>
                                {profitAnalysis.healthStatus.toUpperCase()}
                            </span>
                        </h3>
                        <p className="text-gray-400">
                            {profitAnalysis.healthStatus === 'healthy' && 'Excellent profit margin. This project is financially sound.'}
                            {profitAnalysis.healthStatus === 'warning' && 'Acceptable margin but below target. Consider optimizing scope or pricing.'}
                            {profitAnalysis.healthStatus === 'critical' && 'Low margin. High risk project. Review pricing and scope carefully.'}
                        </p>
                    </div>

                    {/* Visual Indicator */}
                    <div className="relative w-24 h-24">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="rgba(255,255,255,0.1)"
                                strokeWidth="8"
                                fill="none"
                            />
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke={
                                    profitAnalysis.healthStatus === 'healthy' ? '#10b981' :
                                        profitAnalysis.healthStatus === 'warning' ? '#f59e0b' :
                                            '#ef4444'
                                }
                                strokeWidth="8"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 40}`}
                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - profitAnalysis.profitMargin / 100)}`}
                                initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - profitAnalysis.profitMargin / 100) }}
                                transition={{ duration: 1.5, ease: 'easeOut' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-xl font-bold ${getHealthColor(profitAnalysis.healthStatus)}`}>
                                {profitAnalysis.profitMargin.toFixed(0)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breakdown */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Labor Cost</p>
                    <p className="font-semibold text-white">
                        ${(internalCost.totalLaborCost || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Infrastructure</p>
                    <p className="font-semibold text-white">
                        ${(internalCost.infrastructureCost || 0).toLocaleString()}
                    </p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-gray-400 mb-1">Overhead</p>
                    <p className="font-semibold text-white">
                        ${(internalCost.overheadCost || 0).toLocaleString()}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
