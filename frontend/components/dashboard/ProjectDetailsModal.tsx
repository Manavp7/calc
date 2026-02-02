'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, TrendingUp, DollarSign, Users, Calendar, Mail, Phone, Building, Layers } from 'lucide-react';
import { generatePricingPDF } from '@/lib/pdf-export';
import { useEffect, useState } from 'react';
import { calculateInternalCost, calculateProfit } from '@/lib/pricing-engine';
import GanttChart from '@/components/client/GanttChart';
import { Timeline } from '@/lib/types';

interface ProjectDetailsModalProps {
    project: any;
    isOpen: boolean;
    onClose: () => void;
    viewMode?: 'admin' | 'client';
}

export default function ProjectDetailsModal({ project, isOpen, onClose, viewMode = 'admin' }: ProjectDetailsModalProps) {
    const [fullProject, setFullProject] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && project?.id) {
            fetchProjectDetails();
        }
    }, [isOpen, project?.id]);

    const fetchProjectDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/projects/${project.id}`);
            if (response.ok) {
                const data = await response.json();
                setFullProject(data);
            }
        } catch (error) {
            console.error('Error fetching project details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!project || !fullProject) return null;

    // Recalculate costs if they are zero (backward compatibility or save error fix)
    let displayCost = fullProject.internalCost;
    let displayProfit = fullProject.profitAnalysis;

    if ((!displayCost.totalCost || displayCost.totalCost === 0) && fullProject.inputs) {
        try {
            const recalculatedCost = calculateInternalCost(fullProject.inputs);

            // Reconstruct client price object for profit calculation
            const clientPriceObj = {
                totalPrice: fullProject.profitAnalysis.clientPrice,
                priceRange: { min: 0, max: 0 }, // Not needed for profit calc
                basePrice: 0,
                featuresCost: 0,
                techMultiplier: 1,
                complexityMultiplier: 1,
                timelineMultiplier: 1,
                supportCost: 0,
            };

            const recalculatedProfit = calculateProfit(clientPriceObj, recalculatedCost);

            displayCost = {
                totalLaborCost: recalculatedCost.totalLaborCost,
                infrastructureCost: recalculatedCost.infrastructureCost,
                overheadCost: recalculatedCost.overheadCost,
                riskBuffer: recalculatedCost.riskBuffer,
                totalCost: recalculatedCost.totalInternalCost,
                laborCosts: recalculatedCost.laborCosts,
            };

            displayProfit = {
                ...fullProject.profitAnalysis,
                internalCost: recalculatedProfit.internalCost,
                profit: recalculatedProfit.profit,
                profitMargin: recalculatedProfit.profitMargin,
                healthStatus: recalculatedProfit.healthStatus,
            };
        } catch (err) {
            console.error("Failed to recalculate costs", err);
        }
    }

    // specific timeline object reconstruction for GanttChart
    const timelineData: Timeline | null = fullProject.timelineDetails ? {
        totalWeeks: fullProject.timelineDetails.totalWeeks,
        phases: fullProject.timelineDetails.phases,
        teamSize: {
            min: fullProject.clientPrice.teamSizeMin,
            max: fullProject.clientPrice.teamSizeMax,
        }
    } : null;

    const handleExport = () => {
        // Create mock data for PDF export
        const inputs = fullProject.inputs;
        const clientPrice = {
            totalPrice: displayProfit.clientPrice,
            priceRange: {
                min: fullProject.clientPrice.min,
                max: fullProject.clientPrice.max,
            },
            basePrice: 0,
            featuresCost: 0,
            techMultiplier: 1,
            complexityMultiplier: 1,
            timelineMultiplier: 1,
            supportCost: 0,
        };
        const timeline = timelineData || {
            totalWeeks: fullProject.clientPrice.timeline,
            teamSize: {
                min: fullProject.clientPrice.teamSizeMin,
                max: fullProject.clientPrice.teamSizeMax,
            },
            phases: [],
        };
        const costBreakdown: Parameters<typeof generatePricingPDF>[3] = []; // Not used in current PDF export extensively, but required by type

        generatePricingPDF(inputs, clientPrice, timeline, costBreakdown);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <div className="glass rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                            {/* Close Button Absolute */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-lg transition-colors z-10"
                                aria-label="Close"
                            >
                                <X className="w-6 h-6" />
                            </button>

                            {/* Header - Only show in Admin mode */}
                            {viewMode === 'admin' && (
                                <div className="mb-8 p-6 glass rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10">
                                    <h2 className="text-3xl font-bold gradient-text mb-4">
                                        Project Details
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Users className="w-4 h-4 text-primary-400 shrink-0" />
                                                <span className="font-medium text-white">{fullProject.inputs?.clientName || project.clientName || 'Anonymous Client'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Building className="w-4 h-4 text-primary-400 shrink-0" />
                                                <span>{fullProject.inputs?.companyName || 'No Company Name'}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Mail className="w-4 h-4 text-primary-400 shrink-0" />
                                                <span>{fullProject.inputs?.email || 'No Email Provided'}</span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-400">
                                                <Phone className="w-4 h-4 text-primary-400 shrink-0" />
                                                <span>{fullProject.inputs?.phone || 'No Phone Provided'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {viewMode === 'client' && (
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold gradient-text mb-4">
                                        Project Brochure
                                    </h2>
                                    <p className="text-gray-400">
                                        A detailed breakdown of your project estimate and timeline.
                                    </p>
                                </div>
                            )}

                            {/* Key Metrics Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                <div className="glass rounded-xl p-4 border-l-4 border-primary-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <DollarSign className="w-5 h-5 text-primary-400" />
                                        <p className="text-sm text-gray-400">Quote Value</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        ${displayProfit.clientPrice.toLocaleString()}
                                    </p>
                                </div>

                                <div className="glass rounded-xl p-4 border-l-4 border-accent-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-accent-400" />
                                        <p className="text-sm text-gray-400">Profit</p>
                                    </div>
                                    <p className="text-2xl font-bold text-accent-400">
                                        ${displayProfit.profit.toLocaleString()}
                                    </p>
                                </div>

                                <div className="glass rounded-xl p-4 border-l-4 border-purple-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        <p className="text-sm text-gray-400">Team Size</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {fullProject.clientPrice.teamSizeMin}-{fullProject.clientPrice.teamSizeMax}
                                    </p>
                                </div>

                                <div className="glass rounded-xl p-4 border-l-4 border-blue-500">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-5 h-5 text-blue-400" />
                                        <p className="text-sm text-gray-400">Timeline</p>
                                    </div>
                                    <p className="text-2xl font-bold">
                                        {fullProject.clientPrice.timeline} weeks
                                    </p>
                                </div>
                            </div>

                            {/* Timeline Visualization (Gantt) - Only show for client view */}
                            {viewMode !== 'admin' && timelineData && timelineData.phases.length > 0 && (
                                <div className="glass rounded-2xl p-6 mb-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Layers className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-bold">Project Schedule</h3>
                                    </div>
                                    <GanttChart timeline={timelineData} className="bg-black/20" />
                                </div>
                            )}

                            {/* Cost Breakdown */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4">Cost Breakdown</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-gray-400 shrink-0">Labor Cost</span>
                                            <span className="font-semibold truncate ml-2">
                                                ${displayCost.totalLaborCost.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-gray-400 shrink-0">Infrastructure</span>
                                            <span className="font-semibold truncate ml-2">
                                                ${displayCost.infrastructureCost.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-gray-400 shrink-0">Overhead</span>
                                            <span className="font-semibold truncate ml-2">
                                                ${displayCost.overheadCost.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                            <span className="text-gray-400 shrink-0">Risk Buffer</span>
                                            <span className="font-semibold truncate ml-2">
                                                ${displayCost.riskBuffer.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="border-t border-white/10 pt-4 mt-2 flex justify-between items-center">
                                            <span className="text-lg font-bold shrink-0">Total Internal Cost</span>
                                            <span className="text-lg font-bold text-primary-400 truncate ml-2">
                                                ${displayCost.totalCost.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Profit Analysis */}
                                <div className="glass rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4">Profit Analysis</h3>
                                    <div className="h-full flex flex-col justify-between py-2">
                                        <div className="text-center p-4 rounded-xl bg-white/5 flex-grow mb-4 flex flex-col justify-center">
                                            <p className="text-sm text-gray-400 mb-1">Net Profit</p>
                                            <p className="text-3xl font-bold text-accent-400 mb-1">
                                                ${displayProfit.profit.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-gray-500">After all expenses</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center p-3 rounded-xl bg-white/5">
                                                <p className="text-xs text-gray-400 mb-1">Margin</p>
                                                <p className={`text-xl font-bold ${displayProfit.healthStatus === 'healthy' ? 'text-green-400' :
                                                    displayProfit.healthStatus === 'warning' ? 'text-yellow-400' :
                                                        'text-red-400'
                                                    }`}>
                                                    {displayProfit.profitMargin.toFixed(1)}%
                                                </p>
                                            </div>
                                            <div className="text-center p-3 rounded-xl bg-white/5">
                                                <p className="text-xs text-gray-400 mb-1">Health</p>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${displayProfit.healthStatus === 'healthy' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                                    displayProfit.healthStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                                                        'bg-red-500/0 text-red-400 border border-red-500/20'
                                                    }`}>
                                                    {displayProfit.healthStatus}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Project Details Footer */}
                            <div className="glass rounded-2xl p-6 mb-8">
                                <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Project Type</p>
                                        <p className="font-semibold capitalize text-white">
                                            {fullProject.inputs.ideaType?.replace(/-/g, ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Platform</p>
                                        <p className="font-semibold capitalize text-white">
                                            {fullProject.inputs.productFormat?.replace(/-/g, ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Tech Stack</p>
                                        <p className="font-semibold capitalize text-white">
                                            {fullProject.inputs.techStack?.replace(/-/g, ' ')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Scale</p>
                                        <p className="font-semibold text-white">
                                            {fullProject.inputs.selectedFeatures?.length || 0} features
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4">
                                <button
                                    onClick={handleExport}
                                    className="btn-primary flex-1 flex items-center justify-center gap-2 group"
                                >
                                    <Download className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                                    Download Quotation PDF
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-8 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors font-semibold"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
