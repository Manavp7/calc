'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ScrollRevealProps {
    children: ReactNode;
    direction?: 'up' | 'down' | 'left' | 'right';
    delay?: number;
    duration?: number;
}

export default function ScrollReveal({
    children,
    direction = 'up',
    delay = 0,
    duration = 1,
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.registerPlugin(ScrollTrigger);

        const el = ref.current;
        if (!el) return;

        const x = direction === 'left' ? 50 : direction === 'right' ? -50 : 0;
        const y = direction === 'up' ? 50 : direction === 'down' ? -50 : 0;

        const anim = gsap.fromTo(
            el,
            {
                opacity: 0,
                x,
                y,
                willChange: 'opacity, transform'
            },
            {
                opacity: 1,
                x: 0,
                y: 0,
                duration: duration,
                delay: delay,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%", // Start when top of element hits 85% of viewport
                    toggleActions: "play none none reverse",
                }
            }
        );

        return () => {
            anim.kill();
        };
    }, [direction, delay, duration]);

    return (
        <div ref={ref} className="opacity-0">
            {children}
        </div>
    );
}
