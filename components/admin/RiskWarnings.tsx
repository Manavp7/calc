'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';

export default function RiskWarnings() {
    const { riskWarnings } = usePricingStore();

    if (!riskWarnings || riskWarnings.length === 0) {
        return (
            <motion.div
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-green-400"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-green-400">No Risk Warnings</h3>
                        <p className="text-gray-400">This project has no identified risk factors</p>
                    </div>
                </div>
            </motion.div>
        );
    }

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'high':
                return {
                    bg: 'bg-red-500/10',
                    border: 'border-red-500/30',
                    text: 'text-red-400',
                    icon: 'bg-red-500/20',
                };
            case 'medium':
                return {
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/30',
                    text: 'text-yellow-400',
                    icon: 'bg-yellow-500/20',
                };
            case 'low':
                return {
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/30',
                    text: 'text-blue-400',
                    icon: 'bg-blue-500/20',
                };
            default:
                return {
                    bg: 'bg-gray-500/10',
                    border: 'border-gray-500/30',
                    text: 'text-gray-400',
                    icon: 'bg-gray-500/20',
                };
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'timeline':
                return (
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'margin':
                return (
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'complexity':
                return (
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                );
        }
    };

    return (
        <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
        >
            <h2 className="text-3xl font-bold mb-6">Risk Warnings</h2>

            <div className="space-y-4">
                {riskWarnings.map((warning, index) => {
                    const colors = getSeverityColor(warning.severity);

                    return (
                        <motion.div
                            key={index}
                            className={`${colors.bg} border ${colors.border} rounded-xl p-6`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-full ${colors.icon} flex items-center justify-center flex-shrink-0 ${colors.text}`}>
                                    {getTypeIcon(warning.type)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className={`font-bold text-lg ${colors.text} capitalize`}>
                                            {warning.type} Risk
                                        </h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors.bg} ${colors.text} uppercase`}>
                                            {warning.severity}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">
                                        {warning.message}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Summary */}
            <div className="mt-6 bg-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Total Warnings:</span>
                    <span className="font-bold text-white">{riskWarnings.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">High Severity:</span>
                    <span className="font-bold text-red-400">
                        {riskWarnings.filter(w => w.severity === 'high').length}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
