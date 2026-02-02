'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function ParticleField({ count = 2000, color = '#0ea5e9' }: { count?: number; color?: string }) {
    const points = useRef<THREE.Points>(null);

    // Generate random particle positions
    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 10;
            positions[i3 + 1] = (Math.random() - 0.5) * 10;
            positions[i3 + 2] = (Math.random() - 0.5) * 10;
        }

        return positions;
    }, [count]);

    // Animate particles
    useFrame((state) => {
        if (!points.current) return;

        const time = state.clock.getElapsedTime();
        points.current.rotation.x = time * 0.05;
        points.current.rotation.y = time * 0.075;
    });

    return (
        <Points ref={points} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color={color}
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export default function ParticleBackground({ color = '#0ea5e9' }: { color?: string }) {
    return (
        <div className="absolute inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 3], fov: 75 }}
                style={{ background: 'transparent' }}
            >
                <ParticleField color={color} />
            </Canvas>
        </div>
    );
}
