'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        // Initialize Lenis with "buttery" settings
        const lenis = new Lenis({
            duration: 1.5, // Increased for more momentum (less stiff)
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1.2, // Faster response to wheel
            touchMultiplier: 2,
        });

        lenisRef.current = lenis;

        // Sync with GSAP ScrollTrigger
        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', ScrollTrigger.update);

        // Add is-scrolling class to body to disable heavy hover effects
        let isScrollingTimeout: NodeJS.Timeout;

        lenis.on('scroll', () => {
            document.body.classList.add('is-scrolling');

            clearTimeout(isScrollingTimeout);
            isScrollingTimeout = setTimeout(() => {
                document.body.classList.remove('is-scrolling');
            }, 100); // 100ms debounce
        });

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            gsap.ticker.remove((time) => {
                lenis.raf(time * 1000);
            });
            clearTimeout(isScrollingTimeout);
            document.body.classList.remove('is-scrolling');
        };
    }, []);

    return (
        <div className="smooth-scroll-wrapper w-full min-h-screen">
            {children}
        </div>
    );
}
