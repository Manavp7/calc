'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function AdminAuth({ onAuthenticated }: { onAuthenticated: () => void }) {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Simple password check (in production, use proper authentication)
        const adminPassword = 'pricing2024';

        if (password === adminPassword) {
            onAuthenticated();
        } else {
            setError('Invalid password');
            setPassword('');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-black to-gray-900">
            <motion.div
                className="glass rounded-2xl p-12 max-w-md w-full mx-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <h2 className="text-3xl font-bold gradient-text mb-2 text-center">
                    Admin Access
                </h2>
                <p className="text-gray-400 text-center mb-8">
                    Enter password to view internal pricing analysis
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500 transition-colors"
                            placeholder="Enter admin password"
                            autoFocus
                        />
                        {error && (
                            <motion.p
                                className="text-red-400 text-sm mt-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {error}
                            </motion.p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full btn-primary"
                    >
                        Access Dashboard
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <a href="/" className="text-gray-400 hover:text-primary-400 transition-colors text-sm">
                        ← Back to Calculator
                    </a>
                </div>

                <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-400 text-xs text-center">
                        <strong>Demo:</strong> Default password is "pricing2024"
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
