'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrendingUp,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    XCircle,
    BarChart3,
    PieChart,
    Activity,
    LogOut
} from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ProjectDetailsModal from '@/components/dashboard/ProjectDetailsModal';
import StarField from '@/components/three/StarField';

interface KPIData {
    overview: {
        totalQuotedValue: number;
        totalInternalCost: number;
        totalProfit: number;
        averageProfitMargin: number;
        totalProjects: number;
    };
    projectMetrics: Array<{
        id: string;
        clientName: string;
        clientPrice: number;
        profit: number;
        profitMargin: number;
        healthStatus: 'healthy' | 'warning' | 'critical';
        createdAt: string;
    }>;
    healthDistribution: {
        healthy: number;
        warning: number;
        critical: number;
    };
    riskWarnings: Array<{
        projectId: string;
        clientName: string;
        healthStatus: string;
        profitMargin: number;
        message: string;
    }>;
}

export default function CompanyHeadDashboard() {
    const [kpiData, setKpiData] = useState<KPIData | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    useEffect(() => {
        fetchKPIs();
    }, []);

    const fetchKPIs = async () => {
        try {
            const response = await fetch('/api/company-head/kpis');
            if (response.ok) {
                const data = await response.json();
                setKpiData(data);
            }
        } catch (error) {
            console.error('Error fetching KPIs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/company-head/login' });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatPercent = (value: number) => {
        return `${value.toFixed(1)}%`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
                <StarField />
                <div className="text-center z-10">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-400 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10
            }
        }
    };

    return (
        <div className="min-h-screen relative overflow-x-hidden">
            <StarField />

            <motion.div
                className="container-custom py-12 relative z-10"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div
                    className="flex justify-between items-center mb-12"
                    variants={itemVariants}
                >
                    <div>
                        <h1 className="text-5xl font-bold gradient-text mb-2 tracking-tight">
                            Command Center
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Welcome back, <span className="text-white font-semibold">{session?.user?.name || 'Chief'}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 transition-all duration-300 text-gray-400 hover:text-red-400 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Sign Out
                    </button>
                </motion.div>

                {!kpiData || kpiData.overview.totalProjects === 0 ? (
                    <motion.div
                        className="glass rounded-3xl p-16 text-center border-t border-white/10 shadow-2xl shadow-primary-500/5 backdrop-blur-xl"
                        variants={itemVariants}
                    >
                        <Activity className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">No Active Projects</h2>
                        <p className="text-gray-400 text-lg max-w-md mx-auto">
                            Waiting for client submissions. New projects will appear here automatically.
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <motion.div variants={itemVariants} className="h-full">
                                <div className="glass h-full rounded-2xl p-6 border-t border-white/10 hover:border-primary-500/30 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <DollarSign className="w-24 h-24 text-primary-400 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-primary-500/20 text-primary-400">
                                                <DollarSign className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Value</span>
                                        </div>
                                        <p className="text-4xl font-bold text-white mb-1 tracking-tight">
                                            {formatCurrency(kpiData.overview.totalQuotedValue)}
                                        </p>
                                        <p className="text-sm text-gray-500 flex items-center gap-1">
                                            across <span className="text-white font-medium">{kpiData.overview.totalProjects}</span> projects
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="h-full">
                                <div className="glass h-full rounded-2xl p-6 border-t border-white/10 hover:border-green-500/30 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp className="w-24 h-24 text-green-400 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                                                <TrendingUp className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Profit</span>
                                        </div>
                                        <p className="text-4xl font-bold text-white mb-1 tracking-tight">
                                            {formatCurrency(kpiData.overview.totalProfit)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Avg Margin: <span className="text-green-400 font-medium">{formatPercent(kpiData.overview.averageProfitMargin)}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="h-full">
                                <div className="glass h-full rounded-2xl p-6 border-t border-white/10 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <BarChart3 className="w-24 h-24 text-blue-400 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                                <BarChart3 className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Internal Cost</span>
                                        </div>
                                        <p className="text-4xl font-bold text-white mb-1 tracking-tight">
                                            {formatCurrency(kpiData.overview.totalInternalCost)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Total operational expenses
                                        </p>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants} className="h-full">
                                <div className="glass h-full rounded-2xl p-6 border-t border-white/10 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <PieChart className="w-24 h-24 text-purple-400 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                                <PieChart className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Avg Margin</span>
                                        </div>
                                        <p className="text-4xl font-bold text-white mb-1 tracking-tight">
                                            {formatPercent(kpiData.overview.averageProfitMargin)}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Overall profitability ratio
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Middle Section: Risk & Health */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Project Health Overview */}
                            <motion.div
                                className="lg:col-span-2 glass rounded-3xl p-8 border-t border-white/10 relative overflow-hidden"
                                variants={itemVariants}
                            >
                                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-primary-500/10 rounded-lg">
                                        <Activity className="w-6 h-6 text-primary-400" />
                                    </div>
                                    Project Health Overview
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-colors">
                                        <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {kpiData.healthDistribution.healthy}
                                        </p>
                                        <p className="text-sm font-medium text-green-400">Healthy Projects</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
                                        <AlertTriangle className="w-12 h-12 text-yellow-400 mb-3" />
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {kpiData.healthDistribution.warning}
                                        </p>
                                        <p className="text-sm font-medium text-yellow-400">Warning Projects</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-colors">
                                        <XCircle className="w-12 h-12 text-red-400 mb-3" />
                                        <p className="text-4xl font-bold text-white mb-1">
                                            {kpiData.healthDistribution.critical}
                                        </p>
                                        <p className="text-sm font-medium text-red-400">Critical Projects</p>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Risk Warnings Panel */}
                            <motion.div
                                className="glass rounded-3xl p-8 border-t border-white/10 relative"
                                variants={itemVariants}
                            >
                                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                    <div className="p-2 bg-yellow-500/10 rounded-lg">
                                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    Risk Radar
                                </h3>
                                {kpiData.riskWarnings.length > 0 ? (
                                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {kpiData.riskWarnings.map((warning: any, index: number) => (
                                            <div
                                                key={warning.projectId}
                                                className={`p-4 rounded-xl border transition-all hover:scale-[1.02] ${warning.healthStatus === 'critical'
                                                    ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                                                    : 'bg-yellow-500/10 border-yellow-500/20 hover:bg-yellow-500/20'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-semibold text-white truncate max-w-[120px]" title={warning.clientName}>
                                                        {warning.clientName}
                                                    </span>
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${warning.healthStatus === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                                                        }`}>
                                                        {formatPercent(warning.profitMargin)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-tight">
                                                    {warning.message}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex flex-col items-center justify-center text-center">
                                        <CheckCircle className="w-12 h-12 text-green-500/30 mb-3" />
                                        <p className="text-gray-500">No risks detected.</p>
                                        <p className="text-xs text-gray-600">All projects operating within healthy margins.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Recent Projects Table */}
                        <motion.div
                            className="glass rounded-3xl p-8 border-t border-white/10"
                            variants={itemVariants}
                        >
                            <h3 className="text-2xl font-bold mb-6">Recent Activity</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-gray-500 font-semibold text-sm uppercase tracking-wider">Client</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-semibold text-sm uppercase tracking-wider">Quote Value</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-semibold text-sm uppercase tracking-wider">Profit</th>
                                            <th className="text-right py-4 px-4 text-gray-500 font-semibold text-sm uppercase tracking-wider">Margin</th>
                                            <th className="text-center py-4 px-4 text-gray-500 font-semibold text-sm uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {kpiData.projectMetrics.slice(0, 10).map((project, index) => (
                                            <motion.tr
                                                key={project.id}
                                                onClick={() => {
                                                    setSelectedProject(project);
                                                    setIsModalOpen(true);
                                                }}
                                                className="hover:bg-white/5 transition-all cursor-pointer group"
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + (index * 0.05) }}
                                            >
                                                <td className="py-4 px-4 text-white font-medium group-hover:text-primary-400 transition-colors">
                                                    {project.clientName}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-300">
                                                    {formatCurrency(project.clientPrice)}
                                                </td>
                                                <td className="py-4 px-4 text-right text-gray-300">
                                                    {formatCurrency(project.profit)}
                                                </td>
                                                <td className="py-4 px-4 text-right">
                                                    <span className={`font-mono ${project.profitMargin < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                        {formatPercent(project.profitMargin)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 text-center">
                                                    <span
                                                        className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${project.healthStatus === 'healthy'
                                                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                                            : project.healthStatus === 'warning'
                                                                ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                            }`}
                                                    >
                                                        {project.healthStatus}
                                                    </span>
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    </div>
                )}
            </motion.div>

            {/* Project Details Modal */}
            <ProjectDetailsModal
                project={selectedProject}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedProject(null);
                }}
            />
        </div>
    );
}
