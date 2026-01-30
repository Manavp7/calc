'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, UserPlus, Trash2, Mail, Shield, Lock, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import StarField from '@/components/three/StarField';

export default function AdminUserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'company_head' // Default to company_head
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setCreating(true);

        try {
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'User created successfully' });
                setFormData({ name: '', email: '', password: '', role: 'company_head' });
                setShowForm(false);
                fetchUsers(); // Refresh list
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to create user' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
        } finally {
            setCreating(false);
        }
    };

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
                            <h1 className="text-3xl font-bold gradient-text">User Management</h1>
                            <p className="text-gray-400">Manage admin access and roles</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="btn-primary flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Add New User
                    </button>
                </motion.div>

                {/* Create User Form */}
                {showForm && (
                    <motion.div
                        className="glass rounded-2xl p-6 mb-8 border border-primary-500/20"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                    >
                        <h2 className="text-xl font-bold mb-4 text-white">Add New Company Head</h2>
                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="admin@company.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-black/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 focus:border-primary-500 focus:outline-none"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Role</label>
                                    <select
                                        className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-primary-500 focus:outline-none"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        <option value="company_head">Company Head (Admin)</option>
                                        <option value="admin">Super Admin</option>
                                        <option value="client">Client</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-sm text-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                                    Create User
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}

                {/* Status Message */}
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
                        {message.text}
                    </motion.div>
                )}

                {/* Users List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                        </div>
                    ) : users.map((user) => (
                        <motion.div
                            key={user._id}
                            className="glass p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                                        user.role === 'company_head' ? 'bg-blue-500/20 text-blue-400' :
                                            'bg-green-500/20 text-green-400'
                                    }`}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                        user.role === 'company_head' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                            'bg-green-500/10 text-green-400 border border-green-500/20'
                                    }`}>
                                    {user.role}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-white mb-1">{user.name}</h3>
                            <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                                <Mail className="w-3 h-3" />
                                {user.email}
                            </div>

                            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-gray-500 text-sm">
                                <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                                {(user.role !== 'admin') && ( // Prevent deleting main admin ideally
                                    <button className="text-red-400 hover:text-red-300 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
