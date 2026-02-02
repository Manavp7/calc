'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';

export default function RoleCostTable() {
    const { internalCost } = usePricingStore();

    if (!internalCost) return null;

    return (
        <motion.div
            className="glass rounded-2xl p-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <h2 className="text-3xl font-bold mb-6">Role-Based Cost Breakdown</h2>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="text-left py-4 px-4 text-gray-400 font-semibold">Role</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-semibold">Hours</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-semibold">Hourly Rate</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-semibold">Total Cost</th>
                            <th className="text-right py-4 px-4 text-gray-400 font-semibold">% of Labor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {internalCost.laborCosts.map((role, index) => {
                            const percentage = (role.totalCost / internalCost.totalLaborCost) * 100;

                            return (
                                <motion.tr
                                    key={role.role}
                                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <td className="py-4 px-4">
                                        <span className="font-semibold text-white capitalize">
                                            {role.role}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right text-gray-300">
                                        {role.hours.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4 text-right text-gray-300">
                                        ${role.hourlyRate}
                                    </td>
                                    <td className="py-4 px-4 text-right font-bold text-primary-400">
                                        ${role.totalCost.toLocaleString()}
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-primary-500"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${percentage}%` }}
                                                    transition={{ duration: 1, delay: index * 0.1 }}
                                                />
                                            </div>
                                            <span className="text-gray-400 text-sm w-12">
                                                {percentage.toFixed(1)}%
                                            </span>
                                        </div>
                                    </td>
                                </motion.tr>
                            );
                        })}

                        {/* Total Row */}
                        <tr className="bg-white/5 font-bold">
                            <td className="py-4 px-4 text-white">Total Labor Cost</td>
                            <td className="py-4 px-4 text-right text-white">
                                {internalCost.laborCosts.reduce((sum, role) => sum + role.hours, 0).toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right text-gray-400">—</td>
                            <td className="py-4 px-4 text-right text-primary-400 text-xl">
                                ${internalCost.totalLaborCost.toLocaleString()}
                            </td>
                            <td className="py-4 px-4 text-right text-white">100%</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Additional Costs */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Infrastructure (6mo avg)</p>
                    <p className="text-2xl font-bold text-orange-400">
                        ${internalCost.infrastructureCost.toLocaleString()}
                    </p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Overhead (15%)</p>
                    <p className="text-2xl font-bold text-yellow-400">
                        ${internalCost.overheadCost.toLocaleString()}
                    </p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-1">Risk Buffer</p>
                    <p className="text-2xl font-bold text-red-400">
                        ${internalCost.riskBuffer.toLocaleString()}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}
