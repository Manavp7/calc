import { usePricingStore } from '@/lib/store';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CostBreakdownPie from './CostBreakdownPie';
import { generatePricingPDF } from '@/lib/pdf-export';
import { calculateInternalCost, calculateProfit } from '@/lib/pricing-engine';
import { Lock, Unlock } from 'lucide-react';
import LeadCaptureModal from './LeadCaptureModal';
import ProjectDetailsModal from '@/components/dashboard/ProjectDetailsModal';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!ref.current) return;

        // Kill any existing tweens
        gsap.killTweensOf(ref.current);

        const obj = { val: 0 };
        gsap.to(obj, {
            val: value,
            duration: 2,
            ease: "power2.out",
            onUpdate: () => {
                if (ref.current) {
                    ref.current.textContent = Math.round(obj.val).toString();
                }
            }
        });
    }, [value]);

    return (
        <span>
            {prefix}
            <span ref={ref}>0</span>
            {suffix}
        </span>
    );
}

export default function ResultsDisplay() {
    const { inputs, clientPrice, timeline, costBreakdown, showResults, setLeadInfo } = usePricingStore();
    const [isSaved, setIsSaved] = useState(false);
    const [projectId, setProjectId] = useState<string | null>(null);
    const [showBrochure, setShowBrochure] = useState(false);

    // Gating State
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);

    const sectionRef = useRef<HTMLElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // GSAP Entrance Animation
    useEffect(() => {
        if (showResults && containerRef.current) {
            gsap.registerPlugin(ScrollTrigger);

            const ctx = gsap.context(() => {
                gsap.fromTo(containerRef.current,
                    { opacity: 0, y: 50 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: sectionRef.current,
                            start: "top 80%",
                        }
                    }
                );
            }, sectionRef);

            return () => ctx.revert();
        }
    }, [showResults]);


    // Auto-save project data to MongoDB when results are displayed AND unlocked
    useEffect(() => {
        if (showResults && clientPrice && timeline && isUnlocked && !isSaved) {
            saveProjectData();
        }
    }, [showResults, clientPrice, timeline, isUnlocked, isSaved]);

    const saveProjectData = async () => {
        if (!clientPrice || !timeline) return;
        try {
            // Calculate actual internal costs using the pricing engine
            const internalCost = calculateInternalCost(inputs);
            const profitAnalysis = calculateProfit(clientPrice, internalCost);

            const projectData = {
                clientName: inputs.clientName,
                companyName: inputs.companyName,
                clientEmail: inputs.email,
                clientPhone: inputs.phone,
                inputs,
                clientPrice: {
                    min: clientPrice.priceRange.min,
                    max: clientPrice.priceRange.max,
                    timeline: timeline.totalWeeks,
                    teamSizeMin: timeline.teamSize.min,
                    teamSizeMax: timeline.teamSize.max,
                },
                timelineDetails: {
                    totalWeeks: timeline.totalWeeks,
                    phases: timeline.phases
                },
                internalCost: {
                    totalLaborCost: internalCost.totalLaborCost,
                    infrastructureCost: internalCost.infrastructureCost,
                    overheadCost: internalCost.overheadCost,
                    riskBuffer: internalCost.riskBuffer,
                    totalCost: internalCost.totalInternalCost,
                    laborCosts: internalCost.laborCosts,
                },
                profitAnalysis: {
                    clientPrice: profitAnalysis.clientPrice,
                    internalCost: profitAnalysis.internalCost,
                    profit: profitAnalysis.profit,
                    profitMargin: profitAnalysis.profitMargin,
                    healthStatus: profitAnalysis.healthStatus,
                },
                configVersionUsed: 1,
            };

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectData),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Project data saved successfully', data);
                setIsSaved(true);
                if (data.id) {
                    setProjectId(data.id);
                }
            }
        } catch (error) {
            console.error('Error saving project data:', error);
        }
    };

    const handleUnlockSubmit = (data: { clientName: string; companyName: string; email: string; phone: string }) => {
        setLeadInfo(data);
        setIsUnlocked(true);
        setShowUnlockModal(false);
    };

    if (!showResults || !clientPrice || !timeline) {
        return null;
    }

    const handleDownloadPDF = () => {
        generatePricingPDF(inputs, clientPrice, timeline, costBreakdown);
    };

    return (
        <section ref={sectionRef} id="results" className="section bg-gradient-to-b from-black via-gray-900 to-black relative min-h-screen flex flex-col justify-center">
            <div className="container-custom">
                <div ref={containerRef} className="opacity-0">
                    {/* Main Price */}
                    <div className="text-center mb-16 relative">
                        <p className="text-gray-400 text-xl mb-4">
                            Your Estimated Investment
                        </p>

                        <div className="relative inline-block">
                            {isUnlocked ? (
                                <h2 className="text-7xl md:text-8xl font-bold gradient-text mb-6">
                                    <AnimatedNumber
                                        value={clientPrice.totalPrice}
                                        prefix="$"
                                        suffix=""
                                    />
                                </h2>
                            ) : (
                                <div className="text-7xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-700 to-gray-500 mb-6 blur-sm select-none">
                                    $ XX,XXX
                                </div>
                            )}
                        </div>

                        {isUnlocked ? (
                            <p className="text-gray-400 text-lg">
                                Range: ${clientPrice.priceRange.min.toLocaleString()} - ${clientPrice.priceRange.max.toLocaleString()}
                            </p>
                        ) : (
                            <p className="text-gray-600 text-lg blur-sm select-none">Range: $XX,XXX - $XX,XXX</p>
                        )}
                    </div>

                    {/* Unlock CTA (Visible when locked) */}
                    {/* Unlock CTA / Inline Input Form */}
                    {!isUnlocked && (
                        <div className="max-w-xl mx-auto mb-20">
                            <AnimatePresence mode="wait">
                                {!showUnlockModal ? (
                                    <motion.div
                                        key="cta"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center"
                                    >
                                        <div className="glass p-8 rounded-3xl border-primary-500/30 shadow-[0_0_50px_-12px_rgba(14,165,233,0.3)]">
                                            <Lock className="w-12 h-12 text-primary-400 mx-auto mb-4" />
                                            <h3 className="text-3xl font-bold text-white mb-2">Unlock Your Estimate</h3>
                                            <p className="text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                                                Get the full breakdown, detailed timeline, and brochure sent to your email.
                                            </p>
                                            <button
                                                onClick={() => setShowUnlockModal(true)}
                                                className="w-full btn-primary py-4 text-lg shadow-lg shadow-primary-500/20 rounded-xl"
                                            >
                                                Unlock Full Details
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="form"
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                    >
                                        <LeadCaptureModal
                                            isOpen={true}
                                            variant="inline"
                                            onClose={() => setShowUnlockModal(false)}
                                            onSubmit={handleUnlockSubmit}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}

                    {/* Key Metrics */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16 transition-all duration-500 ${!isUnlocked ? 'blur-lg opacity-50 pointer-events-none select-none' : ''}`}>
                        <div className="glass rounded-2xl p-8 text-center">
                            <h3 className="text-gray-400 text-lg mb-2">Estimated Timeline</h3>
                            <p className="text-5xl font-bold text-primary-400 mb-6">
                                {isUnlocked ? <AnimatedNumber value={timeline.totalWeeks} suffix=" weeks" /> : 'XX weeks'}
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-8 text-center">
                            <h3 className="text-gray-400 text-lg mb-2">Team Size</h3>
                            <p className="text-5xl font-bold text-accent-400">
                                {isUnlocked ? `${timeline.teamSize.min}-${timeline.teamSize.max}` : 'X-X'}
                            </p>
                            <p className="text-gray-400 mt-2">professionals</p>
                        </div>
                    </div>

                    {/* Cost Breakdown - Only visible when unlocked */}
                    <div className={`transition-all duration-500 ${!isUnlocked ? 'blur-lg opacity-30 pointer-events-none select-none' : ''}`}>
                        <h3 className="text-3xl font-bold text-center mb-8">
                            Where Your Investment Goes
                        </h3>
                        {/* We hide the chart content when locked to prevent casual inspection */}
                        {isUnlocked ? <CostBreakdownPie /> : <div className="h-64 flex items-center justify-center text-gray-700">Chart Locked</div>}
                    </div>

                    {/* Bottom Actions - Actions only enabled when unlocked */}
                    {isUnlocked && (
                        <div className="text-center mt-16">
                            <p className="text-gray-400 mb-6 text-lg">
                                Ready to bring your idea to life?
                            </p>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button className="btn-primary">
                                    Schedule a Call
                                </button>
                                <button className="btn-secondary" onClick={handleDownloadPDF}>
                                    Download Estimate
                                </button>
                                {projectId && (
                                    <button
                                        className="px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary-500/50 transition-all font-semibold flex items-center gap-2"
                                        onClick={() => setShowBrochure(true)}
                                    >
                                        View Brochure
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            {/* LeadCaptureModal is now rendered inline above */}

            {projectId && (
                <ProjectDetailsModal
                    project={{ id: projectId }}
                    isOpen={showBrochure}
                    onClose={() => setShowBrochure(false)}
                    viewMode="client"
                />
            )}
        </section>
    );
}
