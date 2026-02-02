'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ParallaxSectionProps {
    children: ReactNode;
    speed?: number;
    className?: string;
}

export default function ParallaxSection({
    children,
    speed = 0.5,
    className = '',
}: ParallaxSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        if (!ref.current || !contentRef.current) return;

        // Calculate movement based on speed
        // Speed 0.5 means move 50% of the scroll distance
        // Negative speed moves opposite to scroll
        const yMovement = speed * 100;

        const anim = gsap.to(contentRef.current, {
            yPercent: yMovement,
            ease: "none",
            scrollTrigger: {
                trigger: ref.current,
                start: "top bottom", // Start when top of section hits bottom of viewport
                end: "bottom top",   // End when bottom of section hits top of viewport
                scrub: 0, // Smooth scrubbing
            }
        });

        return () => {
            anim.kill();
        };
    }, [speed]);

    return (
        <div ref={ref} className={`overflow-hidden ${className}`}>
            <div ref={contentRef}>
                {children}
            </div>
        </div>
    );
}
