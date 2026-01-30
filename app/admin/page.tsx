'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    Settings,
    Database,
    Users,
    TrendingUp,
    Shield,
    LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import StarField from '@/components/three/StarField';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [kpiData, setKpiData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                // Reuse company-head KPIs as it's the same data
                const response = await fetch('/api/company-head/kpis');
                if (response.ok) {
                    const data = await response.json();
                    setKpiData(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchKPIs();
    }, []);

    const handleLogout = () => {
        signOut({ callbackUrl: '/' });
    };

    const adminTools = [
        {
            title: 'Pricing Analysis',
            description: 'View detailed cost breakdowns, profit margins, and risk analysis for all projects',
            icon: BarChart3,
            href: '/admin/pricing-analysis',
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/20',
        },
        {
            title: 'System Configuration',
            description: 'Manage pricing models, role costs, and system-wide settings',
            icon: Settings,
            href: '/admin/config',
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/20',
        },
        {
            title: 'Database Management',
            description: 'View and manage all stored projects and user data',
            icon: Database,
            href: '/admin/database',
            color: 'from-green-500 to-emerald-500',
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500/20',
        },
        {
            title: 'User Management',
            description: 'Manage user accounts, roles, and permissions',
            icon: Users,
            href: '/admin/users',
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500/20',
        },
        {
            title: 'Analytics & Reports',
            description: 'Generate comprehensive reports and analytics',
            icon: TrendingUp,
            href: '/admin/analytics',
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/20',
        },
        {
            title: 'Security & Audit',
            description: 'View security logs and audit trails',
            icon: Shield,
            href: '/admin/security',
            color: 'from-red-500 to-pink-500',
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500/20',
        },
    ];

    return (
        <div className="min-h-screen bg-black relative overflow-x-hidden">
            <StarField />

            <div className="container-custom py-12 relative z-10">
                {/* Header */}
                <motion.div
                    className="flex justify-between items-center mb-12"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div>
                        <h1 className="text-4xl font-bold gradient-text mb-2">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Welcome back, <span className="text-white font-semibold">{session?.user?.name || 'Admin'}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="glass rounded-xl px-4 py-2 hidden md:block">
                            <p className="text-sm text-gray-400">
                                <span className="text-primary-400 font-semibold">Admin Access</span>
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 transition-all duration-300 text-gray-400 hover:text-red-400 group"
                        >
                            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Sign Out
                        </button>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    className="glass rounded-2xl p-8 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <h2 className="text-2xl font-bold mb-6">System Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold gradient-text mb-2">
                                {loading ? '-' : kpiData?.overview?.totalProjects || 0}
                            </p>
                            <p className="text-gray-400 text-sm">Total Projects</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold gradient-text mb-2">
                                {loading ? '-' : '24'} {/* Hardcoded for now as user data isn't in KPIs yet */}
                            </p>
                            <p className="text-gray-400 text-sm">Active Users</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold gradient-text mb-2">
                                {loading ? '-' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpiData?.overview?.totalQuotedValue || 0)}
                            </p>
                            <p className="text-gray-400 text-sm">Total Value</p>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold gradient-text mb-2">
                                {loading ? '-' : `${(kpiData?.overview?.averageProfitMargin || 0).toFixed(1)}%`}
                            </p>
                            <p className="text-gray-400 text-sm">Avg Margin</p>
                        </div>
                    </div>
                </motion.div>

                {/* Admin Tools Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {adminTools.map((tool, index) => {
                        const Icon = tool.icon;
                        const isAvailable = tool.href === '/admin/pricing-analysis' ||
                            tool.href === '/admin/config' ||
                            tool.href === '/admin/database' ||
                            tool.href === '/admin/users';

                        return (
                            <motion.div
                                key={tool.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * (index + 2) }}
                            >
                                {isAvailable ? (
                                    <Link href={tool.href}>
                                        <div className={`glass rounded-2xl p-6 border ${tool.borderColor} hover:scale-105 transition-all duration-300 cursor-pointer group h-full`}>
                                            <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                                <Icon className={`w-7 h-7 bg-gradient-to-r ${tool.color} bg-clip-text text-transparent`} style={{ stroke: 'url(#gradient)' }} />
                                                <svg width="0" height="0">
                                                    <defs>
                                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                            <stop offset="0%" stopColor="#3b82f6" />
                                                            <stop offset="100%" stopColor="#06b6d4" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-bold mb-2 text-white group-hover:text-primary-400 transition-colors">
                                                {tool.title}
                                            </h3>
                                            <p className="text-gray-400 text-sm leading-relaxed">
                                                {tool.description}
                                            </p>
                                        </div>
                                    </Link>
                                ) : (
                                    <div className={`glass rounded-2xl p-6 border ${tool.borderColor} opacity-50 cursor-not-allowed h-full`}>
                                        <div className={`w-14 h-14 rounded-xl ${tool.bgColor} flex items-center justify-center mb-4`}>
                                            <Icon className="w-7 h-7 text-gray-500" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2 text-white">
                                            {tool.title}
                                        </h3>
                                        <p className="text-gray-400 text-sm leading-relaxed mb-3">
                                            {tool.description}
                                        </p>
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">
                                            Coming Soon
                                        </span>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Quick Actions */}
                <motion.div
                    className="glass rounded-2xl p-8 mt-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/admin/pricing-analysis" className="btn-primary text-center">
                            View Pricing Analysis
                        </Link>
                        <button className="btn-secondary opacity-50 cursor-not-allowed" disabled>
                            Export Reports
                        </button>
                        <Link href="/admin/config" className="btn-secondary text-center">
                            System Settings
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
