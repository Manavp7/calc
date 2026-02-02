'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowLeft, RotateCcw, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import StarField from '@/components/three/StarField';
import { PricingConfiguration } from '@/lib/types';
import { DEFAULT_CONFIG } from '@/lib/pricing-data';

export default function AdminConfigPage() {
    const [config, setConfig] = useState<PricingConfiguration | null>(null);
    const [originalConfig, setOriginalConfig] = useState<PricingConfiguration | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Fetch config on mount
    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/config');
            if (res.ok) {
                const data = await res.json();
                // Merge with default config to ensure all fields exist (handling migration/missing fields)
                const fullConfig = { ...DEFAULT_CONFIG, ...data };

                // Deep merge specific objects if needed to avoid overwriting entire objects with partial data
                if (data.infrastructureCosts) fullConfig.infrastructureCosts = { ...DEFAULT_CONFIG.infrastructureCosts, ...data.infrastructureCosts };
                if (data.formatMultipliers) fullConfig.formatMultipliers = { ...DEFAULT_CONFIG.formatMultipliers, ...data.formatMultipliers };
                if (data.hourlyRates) fullConfig.hourlyRates = { ...DEFAULT_CONFIG.hourlyRates, ...data.hourlyRates };

                setConfig(fullConfig);
                setOriginalConfig(fullConfig);
            } else {
                throw new Error('Failed to fetch config');
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to load configuration' });
            // Fallback to default if API fails? Maybe strictly show error.
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!config) return;

        try {
            setSaving(true);
            setMessage(null);

            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                const updated = await res.json();
                setConfig(updated);
                setOriginalConfig(updated);
                setMessage({ type: 'success', text: 'Configuration saved successfully' });
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Failed to save configuration' });
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (originalConfig) {
            setConfig(JSON.parse(JSON.stringify(originalConfig)));
            setMessage({ type: 'success', text: 'Reset to last saved version' });
        }
    };

    const updateBaseCost = (key: string, value: string) => {
        if (!config) return;
        const numValue = parseInt(value) || 0;
        setConfig({
            ...config,
            baseIdeaCosts: {
                ...config.baseIdeaCosts,
                [key]: numValue
            }
        });
    };

    const updateTechMultiplier = (key: string, value: string) => {
        if (!config) return;
        const numValue = parseFloat(value) || 1.0;
        setConfig({
            ...config,
            techMultipliers: {
                ...config.techMultipliers,
                [key]: numValue
            }
        });
    };

    const updateFormatMultiplier = (key: string, value: string) => {
        if (!config) return;
        const numValue = parseFloat(value) || 1.0;
        setConfig({
            ...config,
            formatMultipliers: {
                ...config.formatMultipliers,
                [key]: numValue
            }
        });
    };

    const updateTimelineMultiplier = (key: string, value: string) => {
        if (!config) return;
        const numValue = parseFloat(value) || 1.0;
        setConfig({
            ...config,
            timelineMultipliers: {
                ...config.timelineMultipliers,
                [key]: numValue
            }
        });
    };

    const updateComplexityMultiplier = (key: 'basic' | 'medium' | 'advanced', value: string) => {
        if (!config) return;
        const numValue = parseFloat(value) || 1.0;
        setConfig({
            ...config,
            complexityMultipliers: {
                ...config.complexityMultipliers,
                [key]: numValue
            }
        });
    };

    const updateSupportPackage = (key: string, value: string) => {
        if (!config) return;
        const numValue = parseInt(value) || 0;
        setConfig({
            ...config,
            supportPackages: {
                ...config.supportPackages,
                [key]: numValue
            }
        });
    };

    const updateFeatureBaseCost = (value: string) => {
        if (!config) return;
        const numValue = parseInt(value) || 0;
        setConfig({ ...config, featureBaseCost: numValue });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
        );
    }

    if (!config) return null;

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
                            <h1 className="text-3xl font-bold gradient-text">System Configuration</h1>
                            <p className="text-gray-400">Manage global pricing parameters</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleReset}
                            className="btn-secondary flex items-center gap-2"
                            disabled={saving}
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn-primary flex items-center gap-2"
                            disabled={saving}
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </motion.div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        {message.text}
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Base Costs */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-primary-400 border-b border-white/10 pb-2">Base Idea Costs (USD)</h2>
                        <div className="space-y-4">
                            {Object.entries(config.baseIdeaCosts).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <label className="text-gray-300 capitalize">{key.replace(/-/g, ' ')}</label>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => updateBaseCost(key, e.target.value)}
                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-32 text-right focus:border-primary-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Format Multipliers */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-purple-400 border-b border-white/10 pb-2">Platform Multipliers</h2>
                        <div className="space-y-4">
                            {config.formatMultipliers && Object.entries(config.formatMultipliers).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <label className="text-gray-300 capitalize">{key.replace(/-/g, ' ')}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={value}
                                        onChange={(e) => updateFormatMultiplier(key, e.target.value)}
                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-24 text-right focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            ))}
                            <div className="flex justify-between items-center pt-4 border-t border-white/10">
                                <label className="text-gray-300 font-medium">Feature Base Cost (USD)</label>
                                <input
                                    type="number"
                                    value={config.featureBaseCost}
                                    onChange={(e) => updateFeatureBaseCost(e.target.value)}
                                    className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-32 text-right focus:border-purple-500 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>
                    </motion.section>

                    {/* Tech & Complexity Multipliers */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-secondary-400 border-b border-white/10 pb-2">Complexity & Tech</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">AI Complexity Levels</h3>
                                <div className="space-y-3">
                                    {Object.entries(config.complexityMultipliers).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <label className="text-gray-300 capitalize">{key}</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={value}
                                                onChange={(e) => updateComplexityMultiplier(key as any, e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-24 text-right focus:border-secondary-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Tech Stack Multipliers</h3>
                                <div className="space-y-3">
                                    {Object.entries(config.techMultipliers).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <label className="text-gray-300 capitalize">{key.replace(/-/g, ' ')}</label>
                                            <input
                                                type="number"
                                                step="0.05"
                                                value={value}
                                                onChange={(e) => updateTechMultiplier(key, e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-24 text-right focus:border-secondary-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Infrastructure Costs */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-orange-400 border-b border-white/10 pb-2">Infrastructure Costs (Monthly USD)</h2>
                        <div className="space-y-4">
                            {config.infrastructureCosts && Object.entries(config.infrastructureCosts).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <label className="text-gray-300 capitalize">{key.replace(/-/g, ' ')}</label>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                            if (!config) return;
                                            const numValue = parseInt(e.target.value) || 0;
                                            setConfig({
                                                ...config,
                                                infrastructureCosts: {
                                                    ...config.infrastructureCosts,
                                                    [key]: numValue
                                                }
                                            });
                                        }}
                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-32 text-right focus:border-orange-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Hourly Rates (Internal) */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-blue-400 border-b border-white/10 pb-2">Internal Team Hourly Rates (USD/hr)</h2>
                        <div className="space-y-4">
                            {config.hourlyRates && Object.entries(config.hourlyRates).map(([key, value]) => (
                                <div key={key} className="flex justify-between items-center">
                                    <label className="text-gray-300 capitalize">{key}</label>
                                    <input
                                        type="number"
                                        value={value}
                                        onChange={(e) => {
                                            if (!config) return;
                                            const numValue = parseInt(e.target.value) || 0;
                                            setConfig({
                                                ...config,
                                                hourlyRates: {
                                                    ...config.hourlyRates,
                                                    [key]: numValue
                                                }
                                            });
                                        }}
                                        className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-32 text-right focus:border-blue-500 focus:outline-none transition-colors"
                                    />
                                </div>
                            ))}
                            {!config.hourlyRates && (
                                <p className="text-gray-500 text-sm italic">Save configuration to initialize hourly rates.</p>
                            )}
                        </div>
                    </motion.section>


                    {/* Timeline & Support */}
                    <motion.section
                        className="glass p-6 rounded-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-emerald-400 border-b border-white/10 pb-2">Timeline & Support</h2>
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Delivery Speed Multipliers</h3>
                                <div className="space-y-3">
                                    {Object.entries(config.timelineMultipliers).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <label className="text-gray-300 capitalize">{key}</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                value={value}
                                                onChange={(e) => updateTimelineMultiplier(key, e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-24 text-right focus:border-emerald-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Support Packages (Total Cost USD)</h3>
                                <div className="space-y-3">
                                    {Object.entries(config.supportPackages).map(([key, value]) => (
                                        <div key={key} className="flex justify-between items-center">
                                            <label className="text-gray-300 capitalize">{key.replace(/-/g, ' ')}</label>
                                            <input
                                                type="number"
                                                value={value}
                                                onChange={(e) => updateSupportPackage(key, e.target.value)}
                                                className="bg-black/50 border border-white/10 rounded-lg px-3 py-1 w-32 text-right focus:border-emerald-500 focus:outline-none transition-colors"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                </div>
            </div >
        </div >
    );
}
