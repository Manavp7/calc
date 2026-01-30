'use client';

import { useRef, useEffect } from 'react';
import { Sparkles, Edit3 } from 'lucide-react';
import ParticleBackground from '../three/ParticleBackground';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface HeroSectionProps {
    onStartAI: () => void;
    onStartManual: () => void;
}

export default function HeroSection({ onStartAI, onStartManual }: HeroSectionProps) {
    const containerRef = useRef<HTMLElement>(null);
    const bgRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subtitleRef = useRef<HTMLParagraphElement>(null);
    const buttonsRef = useRef<HTMLDivElement>(null);
    const badgesRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);
        const ctx = gsap.context(() => {
            // Background Parallax
            gsap.to(bgRef.current, {
                yPercent: 50,
                ease: "none",
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom top",
                    scrub: true
                }
            });

            // Entrance Timeline
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(titleRef.current,
                { y: 100, opacity: 0, skewY: 7 },
                { y: 0, opacity: 1, skewY: 0, duration: 1.2 }
            )
                .fromTo(subtitleRef.current,
                    { y: 30, opacity: 0 },
                    { y: 0, opacity: 1, duration: 1 },
                    "-=0.8"
                )
                .fromTo(buttonsRef.current,
                    { y: 20, opacity: 0 },
                    { y: 0, opacity: 1, duration: 0.8 },
                    "-=0.6"
                )
                .fromTo(badgesRef.current,
                    { opacity: 0 },
                    { opacity: 1, duration: 0.8 },
                    "-=0.4"
                );

            // Floating animations for orbs
            gsap.to(".orb-1", {
                y: -30,
                duration: 4,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

            gsap.to(".orb-2", {
                y: 30,
                duration: 5,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });

        }, containerRef);

        return () => ctx.revert();
    }, []);

    const handleStartClick = (flow: 'ai' | 'manual') => {
        if (flow === 'ai') {
            onStartAI();
        } else {
            onStartManual();
        }
    };

    return (
        <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
            {/* Background Layer with Parallax */}
            <div ref={bgRef} className="absolute inset-0 z-0">
                <ParticleBackground />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0 pointer-events-none" />

            {/* Floating Orbs */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl orb-1 z-0 mix-blend-screen" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl orb-2 z-0 mix-blend-screen" />

            {/* Content */}
            <div className="container-custom relative z-10 text-center">

                <h1 ref={titleRef} className="text-6xl md:text-8xl font-bold gradient-text mb-8 tracking-tighter opacity-0">
                    Turn your idea into
                    <br />a real product
                </h1>

                <p ref={subtitleRef} className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto opacity-0 font-light">
                    Answer a few questions and get a <span className="text-white font-medium">transparent cost estimate</span>.
                    <br />
                    See exactly where your investment goes.
                </p>

                <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-5 justify-center items-center opacity-0">
                    {/* AI-Powered Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleStartClick('ai');
                        }}
                        className="group relative overflow-hidden px-10 py-5 rounded-2xl bg-white text-black font-bold text-lg transition-transform duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Describe with AI
                        </span>
                    </button>

                    {/* Manual Button */}
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            handleStartClick('manual');
                        }}
                        className="group relative overflow-hidden px-10 py-5 rounded-2xl border border-white/20 text-white font-medium text-lg transition-all duration-300 hover:scale-105 hover:bg-white/5 hover:border-white/40 backdrop-blur-sm"
                    >
                        <span className="relative z-10 flex items-center gap-2">
                            <Edit3 className="w-5 h-5" />
                            Manual Setup
                        </span>
                    </button>
                </div>

                {/* Feature Badges */}
                <div ref={badgesRef} className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-gray-400 opacity-0">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
                        Instant AI Analysis
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
                        Transparent Pricing
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/5 backdrop-blur-md">
                        <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_10px_rgba(192,132,252,0.5)]"></span>
                        Detailed Breakdown
                    </span>
                </div>
            </div>
        </section>
    );
}
