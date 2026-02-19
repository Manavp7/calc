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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showResults, clientPrice, timeline, isUnlocked, isSaved]);

    const saveProjectData = async () => {
        if (!clientPrice || !timeline) return;
        try {
            // Calculate actual internal costs using the pricing engine
            // Use getState() to ensure we have the absolute latest inputs (including just-set lead info)
            const currentInputs = usePricingStore.getState().inputs;
            const internalCost = calculateInternalCost(currentInputs);
            const profitAnalysis = calculateProfit(clientPrice, internalCost);

            const projectData = {
                clientName: currentInputs.clientName,
                companyName: currentInputs.companyName,
                clientEmail: currentInputs.email,
                clientPhone: currentInputs.phone,
                inputs: currentInputs,
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
        // Create masked inputs for privacy - Client download should not show personal PII
        // This matches the user's specific request to hide name/email/phone/company in the client-facing PDF
        const maskedInputs = {
            ...inputs,
            clientName: 'Valued Client',
            companyName: '', // Hide company name
            email: '',       // Hide email
            phone: '',       // Hide phone
        };
        generatePricingPDF(maskedInputs, clientPrice, timeline, costBreakdown);
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
                            {/* Show placeholder if not unlocked or no valid price, otherwise show actual price */}
                            {clientPrice.totalPrice > 0 && isUnlocked ? (
                                <h2 className="text-7xl md:text-8xl font-bold gradient-text mb-6">
                                    <AnimatedNumber
                                        value={clientPrice.totalPrice}
                                        prefix="$"
                                        suffix=""
                                    />
                                </h2>
                            ) : (
                                <div className="text-7xl md:text-8xl font-bold text-gray-600 mb-6 blur-md select-none">
                                    $ XX,XXX
                                </div>
                            )}
                        </div>

                        {/* Show range only if unlocked and valid price */}
                        {clientPrice.totalPrice > 0 && isUnlocked ? (
                            <p className="text-gray-400 text-lg">
                                Range: ${clientPrice.priceRange.min.toLocaleString()} - ${clientPrice.priceRange.max.toLocaleString()}
                            </p>
                        ) : (
                            <p className="text-gray-600 text-lg blur-sm select-none">
                                Range: $XX,XXX - $XX,XXX
                            </p>
                        )}
                    </div>

                    {/* Unlock CTA (Visible when locked) */}
                    {/* Unlock CTA / Inline Input Form */}
                    {/* Unlock CTA */}
                    {!isUnlocked && (
                        <div className="max-w-xl mx-auto mb-20 text-center">
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

                            <LeadCaptureModal
                                isOpen={showUnlockModal}
                                variant="modal"
                                onClose={() => setShowUnlockModal(false)}
                                onSubmit={handleUnlockSubmit}
                            />
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

                    {/* AI Strategic Insights (Visible if available) */}
                    {isUnlocked && usePricingStore.getState().aiAnalysis?.strategic_insights && (
                        <div className="max-w-4xl mx-auto mb-16 relative">
                            <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-purple-500/20 rounded-2xl blur"></div>
                            <div className="glass rounded-2xl p-8 relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 rounded-lg bg-primary-500/10">
                                        <div className="w-5 h-5 text-primary-400">✨</div>
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Strategic AI Analysis</h3>
                                </div>
                                <p className="text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                                    {usePricingStore.getState().aiAnalysis?.strategic_insights}
                                </p>
                                {usePricingStore.getState().aiAnalysis?.recommended_stack && (
                                    <div className="mt-6 pt-6 border-t border-white/10">
                                        <h4 className="text-sm text-gray-400 mb-3 uppercase tracking-wider font-semibold">Recommended Stack</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {usePricingStore.getState().aiAnalysis?.recommended_stack?.map((tech, i) => (
                                                <span key={i} className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sky-300 text-sm font-mono">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Hourly Breakdown */}
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-16 transition-all duration-500 ${!isUnlocked ? 'blur-lg opacity-50 pointer-events-none select-none' : ''}`}>
                        <div className="glass rounded-2xl p-6 text-center border-t-4 border-t-sky-500">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Development</h3>
                            <p className="text-3xl font-bold text-white mb-1">
                                {isUnlocked ? <AnimatedNumber value={clientPrice.totalDevHours || 0} suffix=" hrs" /> : 'XXX hrs'}
                            </p>
                            <p className="text-xs text-gray-500">Design, Code, QA, PM</p>
                        </div>

                        <div className="glass rounded-2xl p-6 text-center border-t-4 border-t-purple-500">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Support & Maint.</h3>
                            <p className="text-3xl font-bold text-white mb-1">
                                {isUnlocked ? <AnimatedNumber value={clientPrice.totalSupportHours || 0} suffix=" hrs" /> : 'XX hrs'}
                            </p>
                            <p className="text-xs text-gray-500">Server, Updates, fixes</p>
                        </div>

                        <div className="glass rounded-2xl p-6 text-center border-t-4 border-t-emerald-500">
                            <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Hourly Rate</h3>
                            <p className="text-3xl font-bold text-white mb-1">
                                {isUnlocked ? `$${clientPrice.hourlyRate || 120}` : '$XXX'}
                            </p>
                            <p className="text-xs text-gray-500">Blended team rate</p>
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

                    {/* Modify Selections Button - Only visible after unlock */}
                    {isUnlocked && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => {
                                    const { enableEditMode } = usePricingStore.getState();
                                    enableEditMode();
                                    // Scroll to project description section
                                    setTimeout(() => {
                                        const targetSection = document.querySelector('#idea-definition') ||
                                            document.querySelector('section');
                                        targetSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 100);
                                }}
                                className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 transition-all font-semibold text-gray-300 hover:text-white flex items-center gap-2 mx-auto"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Modify Selections
                            </button>
                            <p className="text-gray-500 text-sm mt-2">
                                Want to adjust your choices? Click above to edit and recalculate.
                            </p>
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
