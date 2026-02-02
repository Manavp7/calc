'use client';

import { useState, useRef } from 'react';
import HeroSection from '@/components/client/HeroSection';
import IdeaInput from '@/components/client/IdeaInput';
import AIAnalysisReview from '@/components/client/AIAnalysisReview';
import ProjectDescription from '@/components/client/ProjectDescription';
import IdeaDefinition from '@/components/client/IdeaDefinition';
import ProductFormat from '@/components/client/ProductFormat';
import TechnologyPreference from '@/components/client/TechnologyPreference';
import FunctionalNeeds from '@/components/client/FunctionalNeeds';
import DeliverySpeed from '@/components/client/DeliverySpeed';
import SupportMaintenance from '@/components/client/SupportMaintenance';
import ResultsDisplay from '@/components/client/ResultsDisplay';
import ScrollReveal from '@/components/client/ScrollReveal';
import ParallaxSection from '@/components/client/ParallaxSection';
import { usePricingStore } from '@/lib/store';
import { AIAnalysis } from '@/lib/ai-types';

export default function Home() {
    const [flowMode, setFlowMode] = useState<'none' | 'ai' | 'manual'>('none');
    const [aiAnalysis, setAIAnalysis] = useState<AIAnalysis | null>(null);
    const [showAIReview, setShowAIReview] = useState(false);
    const showResults = usePricingStore((state) => state.showResults);
    const populateFromAI = usePricingStore((state) => state.populateFromAI);
    const resultsRef = useRef<HTMLDivElement>(null);

    const handleStartAI = () => {
        console.log('AI button clicked');
        setFlowMode('ai');
        // Scroll to content
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
    };

    const handleStartManual = () => {
        console.log('Manual button clicked');
        setFlowMode('manual');
        // Scroll to content
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
    };

    const handleAIAnalysisComplete = (analysis: AIAnalysis) => {
        setAIAnalysis(analysis);
        setShowAIReview(true);
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
    };

    const handleAIConfirm = (analysis: AIAnalysis) => {
        // Populate pricing store from AI analysis
        populateFromAI(analysis);
        // Switch to results view
        setShowAIReview(false);
        // Scroll to results specifically
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const handleSkipAI = () => {
        setFlowMode('manual');
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
    };

    const handleEditAI = () => {
        setShowAIReview(false);
        setAIAnalysis(null);
        setTimeout(() => {
            window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
        }, 100);
    };

    return (
        <main className="relative">
            {/* Hero - Always shown */}
            <HeroSection onStartAI={handleStartAI} onStartManual={handleStartManual} />

            {/* AI Flow */}
            {flowMode === 'ai' && !showAIReview && !showResults && (
                <IdeaInput
                    onAnalysisComplete={handleAIAnalysisComplete}
                    onSkip={handleSkipAI}
                />
            )}

            {/* AI Review */}
            {flowMode === 'ai' && showAIReview && aiAnalysis && (
                <AIAnalysisReview
                    analysis={aiAnalysis}
                    onConfirm={handleAIConfirm}
                    onEdit={handleEditAI}
                />
            )}

            {/* Manual Flow */}
            {flowMode === 'manual' && (
                <>
                    {/* Project Description */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.3}>
                            <ProjectDescription />
                        </ParallaxSection>
                    </ScrollReveal>

                    {/* Idea Definition */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.3}>
                            <IdeaDefinition />
                        </ParallaxSection>
                    </ScrollReveal>

                    {/* Product Format */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.2}>
                            <ProductFormat />
                        </ParallaxSection>
                    </ScrollReveal>

                    {/* Technology Preference */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.3}>
                            <TechnologyPreference />
                        </ParallaxSection>
                    </ScrollReveal>

                    {/* Functional Needs */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <FunctionalNeeds />
                    </ScrollReveal>

                    {/* Delivery Speed */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.3}>
                            <DeliverySpeed />
                        </ParallaxSection>
                    </ScrollReveal>

                    {/* Support & Maintenance */}
                    <ScrollReveal direction="up" delay={0.1}>
                        <ParallaxSection speed={-0.2}>
                            <SupportMaintenance />
                        </ParallaxSection>
                    </ScrollReveal>
                </>
            )}

            {/* Results - Shown for both flows */}
            {(flowMode === 'manual' || (flowMode === 'ai' && !showAIReview)) && (
                <div ref={resultsRef}>
                    <ScrollReveal direction="up" delay={0.2}>
                        <ResultsDisplay />
                    </ScrollReveal>
                </div>
            )}

            {/* Footer - Only shown when active */}
            {flowMode !== 'none' && (
                <ScrollReveal direction="up" delay={0.1}>
                    <footer className="bg-black border-t border-white/10 py-12">
                        <div className="container-custom text-center">
                            <p className="text-gray-400">
                                © 2026 Pricing Calculator. Built with precision and transparency.
                            </p>
                            <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
                                <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>
                                <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a>
                            </div>
                        </div>
                    </footer>
                </ScrollReveal>
            )}
        </main>
    );
}
