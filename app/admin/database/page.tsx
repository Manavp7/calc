'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Database, Calendar, DollarSign, User } from 'lucide-react';
import Link from 'next/link';
import StarField from '@/components/three/StarField';

interface Project {
    _id: string;
    clientName: string;
    email: string;
    createdAt: string;
    inputs: {
        ideaType: string;
        productFormat: string;
    };
    profitAnalysis: {
        clientPrice: number;
    };
}

export default function AdminDatabasePage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('/api/admin/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data.projects || []);
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(project =>
        project.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black relative overflow-x-hidden text-white">
            <StarField />

            <div className="container-custom py-12 relative z-10">
                {/* Header */}
                <motion.div
                    className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex items-center gap-4">
                        <Link href="/admin" className="p-2 glass rounded-lg hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold gradient-text">Database Management</h1>
                            <p className="text-gray-400">View and manage all project records</p>
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary-500 w-64 md:w-80 transition-colors"
                        />
                    </div>
                </motion.div>

                {/* Projects Table */}
                <motion.div
                    className="glass rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 font-semibold text-gray-300">Client</th>
                                    <th className="p-4 font-semibold text-gray-300">Project Type</th>
                                    <th className="p-4 font-semibold text-gray-300">Platform</th>
                                    <th className="p-4 font-semibold text-gray-300">Value</th>
                                    <th className="p-4 font-semibold text-gray-300">Date</th>
                                    <th className="p-4 font-semibold text-gray-300 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            Loading records...
                                        </td>
                                    </tr>
                                ) : filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">
                                            No projects found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <tr key={project._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                        {(project.clientName || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-white">{project.clientName || 'Anonymous'}</p>
                                                        <p className="text-xs text-gray-500">{project.email || 'No email'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-300 capitalize">
                                                {project.inputs?.ideaType?.replace(/-/g, ' ') || '-'}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs border ${project.inputs?.productFormat === 'mobile-app' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                                                    project.inputs?.productFormat === 'website' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                                                        'border-green-500/30 text-green-400 bg-green-500/10'
                                                    }`}>
                                                    {project.inputs?.productFormat?.replace(/-/g, ' ') || 'Website'}
                                                </span>
                                            </td>
                                            <td className="p-4 font-medium text-white">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(project.profitAnalysis?.clientPrice || 0)}
                                            </td>
                                            <td className="p-4 text-gray-400 text-sm">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link
                                                    href={`/admin/pricing-analysis`} // Ideally verify if we can pass ID via query param or store, but for now linking to analysis is good.
                                                    onClick={() => {
                                                        // We might want to pass state or just let user select there.
                                                        // Actually, the Analysis page has a selector.
                                                    }}
                                                    className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
                                                >
                                                    View Analysis
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 border-t border-white/10 text-center text-xs text-gray-500">
                        Showing {filteredProjects.length} of {projects.length} records in database
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
