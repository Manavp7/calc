'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full glass p-8 rounded-2xl text-center border border-red-500/20"
            >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldAlert className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-gray-400 mb-8">
                    You do not have permission to access this page. Please log in with the correct account privileges.
                </p>

                <div className="space-y-3">
                    <Link
                        href="/company-head/login"
                        className="block w-full py-3 px-4 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-medium transition-colors"
                    >
                        Login as Company Head
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
