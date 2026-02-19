'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface IdeaInputProps {
    onAnalysisComplete: (analysis: any) => void;
    onSkip: () => void;
}

export default function IdeaInput({ onAnalysisComplete, onSkip }: IdeaInputProps) {
    const [ideaText, setIdeaText] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const examplePrompts = [
        "I want to build a mobile app for booking fitness classes...",
        "Create an e-commerce website with payment gateway and admin panel...",
        "Build a food delivery app with real time tracking and ratings...",
    ];

    const handleAnalyze = async () => {
        if (ideaText.trim().length < 20) {
            setError('Please provide a more detailed description (at least 20 characters)');
            return;
        }

        setIsAnalyzing(true);
        setError(null);

        try {
            const response = await fetch('/api/analyze-idea', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ideaText: ideaText.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to analyze your idea');
            }

            if (data.success && data.analysis) {
                onAnalysisComplete(data.analysis);
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (err: any) {
            console.error('Analysis error:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            handleAnalyze();
        }
    };

    return (
        <section className="section bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="container-custom">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Header */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring' }}
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 mb-6"
                        >
                            <Sparkles className="w-8 h-8 text-white" />
                        </motion.div>
                        <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                            Describe Your Idea
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                            Tell us about your project in your own words. Our AI will analyze it and provide an instant estimate.
                        </p>
                    </div>

                    {/* Input Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-2xl p-8 border-2 border-white/10 hover:border-primary-500/30 transition-all duration-300"
                    >
                        <textarea
                            value={ideaText}
                            onChange={(e) => setIdeaText(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Example: I want to build a mobile app for booking fitness classes. Users should be able to sign up, browse classes, book sessions, pay online, and receive notifications. Trainers should manage their schedules and track attendance. Admins should see revenue analytics and manage all users."
                            className="w-full bg-transparent text-white placeholder-gray-500 border-none outline-none focus:outline-none focus:ring-0 focus:border-none resize-none text-lg leading-relaxed min-h-[200px]"
                            disabled={isAnalyzing}
                        />

                        {/* Character Counter */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <span className={`text-sm ${ideaText.length < 20 ? 'text-gray-500' : 'text-primary-400'}`}>
                                {ideaText.length} characters {ideaText.length >= 20 ? '✓' : '(min 20)'}
                            </span>
                            <span className="text-xs text-gray-500">
                                Press Cmd/Ctrl + Enter to analyze
                            </span>
                        </div>
                    </motion.div>

                    {/* Example Prompts & Upload */}
                    {!ideaText && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-6 flex flex-col md:flex-row justify-between items-start gap-6"
                        >
                            <div className="flex-1">
                                <p className="text-sm text-gray-500 mb-3">Try these examples:</p>
                                <div className="flex flex-wrap gap-3">
                                    {examplePrompts.map((prompt, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setIdeaText(prompt)}
                                            className="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-200 border border-white/10 hover:border-primary-500/30"
                                        >
                                            {prompt.slice(0, 40)}...
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="w-full md:w-auto">
                                <p className="text-sm text-gray-500 mb-3 block md:hidden">Or upload:</p>
                                <label className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 cursor-pointer transition-all group">
                                    <input
                                        type="file"
                                        accept=".pdf,.docx"
                                        className="hidden"
                                        onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;

                                            setIsAnalyzing(true);
                                            try {
                                                const formData = new FormData();
                                                formData.append('file', file);

                                                const res = await fetch('/api/extract-text', {
                                                    method: 'POST',
                                                    body: formData,
                                                });

                                                const data = await res.json();
                                                if (data.success && data.text) {
                                                    setIdeaText(prev => (prev ? prev + '\n\n' : '') + `[Analyzed Document: ${file.name}]\n` + data.text);
                                                } else {
                                                    setError('Failed to read file content');
                                                }
                                            } catch (err) {
                                                console.error(err);
                                                setError('Error uploading file');
                                            } finally {
                                                setIsAnalyzing(false);
                                                // Reset input
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <div className="p-2 rounded-lg bg-primary-500/10 group-hover:bg-primary-500/20 text-primary-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-white font-medium text-sm">Upload Document</span>
                                        <span className="block text-xs text-gray-500">PDF or DOCX</span>
                                    </div>
                                </label>
                            </div>
                        </motion.div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-400 font-semibold">Analysis Failed</p>
                                <p className="text-red-300 text-sm mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="flex gap-4 justify-center mt-8"
                    >
                        <button
                            onClick={handleAnalyze}
                            disabled={isAnalyzing || ideaText.trim().length < 20}
                            className="btn-primary px-8 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isAnalyzing ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing Your Idea...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Analyze My Idea
                                </>
                            )}
                        </button>
                        <button
                            onClick={onSkip}
                            disabled={isAnalyzing}
                            className="btn-secondary px-8 py-4 text-lg disabled:opacity-50"
                        >
                            Skip & Fill Manually
                        </button>
                    </motion.div>

                    {/* Loading State */}
                    {isAnalyzing && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-8 text-center"
                        >
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-primary-500/10 border border-primary-500/20">
                                <div className="flex gap-1">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-primary-400"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-primary-400"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                    />
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-primary-400"
                                        animate={{ y: [0, -8, 0] }}
                                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                    />
                                </div>
                                <span className="text-primary-400 text-sm font-medium">
                                    AI is analyzing your project...
                                </span>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </div>
        </section>
    );
}
