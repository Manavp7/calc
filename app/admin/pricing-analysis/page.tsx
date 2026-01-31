'use client';

import { useState, useEffect } from 'react';
import { usePricingStore } from '@/lib/store';
import AdminAuth from '@/components/admin/AdminAuth';
import EffortBreakdown from '@/components/admin/EffortBreakdown';
import RoleCostTable from '@/components/admin/RoleCostTable';
import ProfitAnalysis from '@/components/admin/ProfitAnalysis';
import RiskWarnings from '@/components/admin/RiskWarnings';
import { motion } from 'framer-motion';

interface AnalysisProject {
    _id: string;
    clientName: string;
    profitAnalysis: {
        profitMargin: number;
        healthStatus: string;
        clientPrice: number;
        internalCost: number;
        profit: number;
    };
}

export default function AdminPricingAnalysis() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const { clientPrice, internalCost, profitAnalysis, inputs } = usePricingStore();
    const [projects, setProjects] = useState<AnalysisProject[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Fetch projects list on auth
    useEffect(() => {
        if (isAuthenticated) {
            fetchProjects();
        }
    }, [isAuthenticated]);

    const fetchProjects = async () => {
        try {
            setLoadingProjects(true);
            const response = await fetch('/api/admin/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoadingProjects(false);
        }
    };

    const handleProjectSelect = async (projectId: string) => {
        try {
            setSelectedProjectId(projectId);
            setLoadingDetails(true);
            const response = await fetch(`/api/admin/projects/${projectId}`);

            if (response.ok) {
                const projectData = await response.json();

                // Populate store with project data
                usePricingStore.setState({
                    inputs: projectData.inputs,
                    clientPrice: projectData.profitAnalysis.clientPriceDetails || {
                        // Fallback if details aren't stored exactly matching type
                        totalPrice: projectData.profitAnalysis.clientPrice
                    },
                    internalCost: projectData.profitAnalysis.internalCostDetails || {
                        totalInternalCost: projectData.profitAnalysis.internalCost
                    },
                    profitAnalysis: {
                        clientPrice: projectData.profitAnalysis.clientPrice,
                        internalCost: projectData.profitAnalysis.internalCost,
                        profit: projectData.profitAnalysis.profit,
                        profitMargin: projectData.profitAnalysis.profitMargin,
                        healthStatus: projectData.profitAnalysis.healthStatus,
                    },
                    // We might need to reconstruct costBreakdown and others if not stored
                    showResults: true
                });
            }
        } catch (error) {
            console.error('Error loading project details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const hasData = clientPrice && profitAnalysis;

    return (
        <div className="min-h-screen bg-gray-900 flex">
            {!isAuthenticated ? (
                <div className="w-full">
                    <AdminAuth onAuthenticated={() => setIsAuthenticated(true)} />
                </div>
            ) : (
                <>
                    {/* Sidebar - Project List */}
                    <div className="w-80 border-r border-white/10 bg-black/50 overflow-y-auto h-screen p-4 hidden lg:block">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Projects</h2>
                            <button
                                onClick={fetchProjects}
                                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                ↻
                            </button>
                        </div>

                        {loadingProjects ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : (
                            <div className="space-y-2">
                                {projects.map((project) => (
                                    <button
                                        key={project._id}
                                        onClick={() => handleProjectSelect(project._id)}
                                        className={`w-full text-left p-4 rounded-xl transition-all ${selectedProjectId === project._id
                                            ? 'bg-primary-500/20 border border-primary-500/50 text-white'
                                            : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                            }`}
                                    >
                                        <p className="font-semibold truncate">{project.clientName || 'Anonymous'}</p>
                                        <div className="flex justify-between items-center mt-2 text-xs">
                                            <span>{(project.profitAnalysis.profitMargin).toFixed(0)}% Margin</span>
                                            <span className={`px-2 py-0.5 rounded-full ${project.profitAnalysis.healthStatus === 'healthy' ? 'bg-green-500/20 text-green-400' :
                                                project.profitAnalysis.healthStatus === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>
                                                {project.profitAnalysis.healthStatus}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                {projects.length === 0 && (
                                    <p className="text-gray-500 text-center py-8">No projects found</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-y-auto h-screen">
                        <div className="container-custom py-12">
                            {/* Header */}
                            <motion.div
                                className="mb-8"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h1 className="text-4xl font-bold gradient-text">
                                        Internal Pricing Analysis
                                    </h1>
                                    <a
                                        href="/"
                                        className="btn-secondary text-sm px-6 py-3"
                                    >
                                        ← Back to Calculator
                                    </a>
                                </div>
                                <p className="text-gray-400 text-lg">
                                    Select a project from the sidebar to view detailed analysis.
                                </p>
                            </motion.div>

                            {loadingDetails ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
                                </div>
                            ) : !hasData ? (
                                <motion.div
                                    className="glass rounded-2xl p-12 text-center"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <p className="text-gray-400 text-xl mb-6">
                                        Select a project to view analysis or create a new calculation.
                                    </p>
                                    <a href="/" className="btn-primary">
                                        Go to Calculator
                                    </a>
                                </motion.div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Profit Analysis */}
                                    <ProfitAnalysis />

                                    {/* Risk Warnings */}
                                    <RiskWarnings />

                                    {/* Role Cost Breakdown */}
                                    <RoleCostTable />

                                    {/* Effort Breakdown */}
                                    <EffortBreakdown />

                                    {/* Summary */}
                                    <motion.div
                                        className="glass rounded-2xl p-8"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <h3 className="text-2xl font-bold mb-6">Project Summary</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                                            <div>
                                                <p className="text-gray-400 mb-1">Idea Type</p>
                                                <p className="font-semibold text-white">{inputs.ideaType || 'Not selected'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-1">Product Format</p>
                                                <p className="font-semibold text-white">{inputs.productFormat || 'Not selected'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-1">Tech Stack</p>
                                                <p className="font-semibold text-white">{inputs.techStack || 'Not selected'}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-1">Features Selected</p>
                                                <p className="font-semibold text-white">{inputs.selectedFeatures.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-1">Delivery Speed</p>
                                                <p className="font-semibold text-white">{inputs.deliverySpeed}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-400 mb-1">Support Duration</p>
                                                <p className="font-semibold text-white">{inputs.supportDuration}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
