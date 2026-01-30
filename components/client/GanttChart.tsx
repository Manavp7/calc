'use client';

import { motion } from 'framer-motion';
import { Timeline } from '@/lib/types';
import { useMemo } from 'react';

interface GanttChartProps {
    timeline: Timeline;
    className?: string;
}

export default function GanttChart({ timeline, className = '' }: GanttChartProps) {
    const phases = useMemo(() => {
        let currentWeek = 0;
        return timeline.phases.map((phase) => {
            const start = currentWeek;
            currentWeek += phase.duration;
            return {
                ...phase,
                start,
                end: currentWeek,
                color: getPhaseColor(phase.name),
            };
        });
    }, [timeline]);

    function getPhaseColor(name: string) {
        if (name.includes('Discovery') || name.includes('Planning')) return 'bg-blue-500';
        if (name.includes('Design')) return 'bg-purple-500';
        if (name.includes('Development') || name.includes('Engineering')) return 'bg-primary-500';
        if (name.includes('Testing') || name.includes('QA')) return 'bg-yellow-500';
        if (name.includes('Deployment') || name.includes('Launch')) return 'bg-green-500';
        return 'bg-gray-500';
    }

    return (
        <div className={`glass rounded-2xl p-6 ${className}`}>
            <h3 className="text-xl font-bold mb-6">Project Timeline Phases</h3>

            {/* Header */}
            <div className="flex justify-between text-sm text-gray-400 mb-2 border-b border-white/10 pb-2">
                <span>Phase</span>
                <span>Duration</span>
            </div>

            <div className="space-y-4 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 flex justify-between pointer-events-none opacity-10">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-full w-px bg-white" />
                    ))}
                </div>

                {phases.map((phase, index) => (
                    <motion.div
                        key={phase.name}
                        className="relative"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-white text-sm">{phase.name}</span>
                            <span className="text-xs text-gray-400">{phase.duration} weeks</span>
                        </div>

                        <div className="h-10 bg-white/5 rounded-lg relative overflow-hidden">
                            <motion.div
                                className={`absolute top-0 bottom-0 ${phase.color} rounded-lg opacity-80 backdrop-blur-sm`}
                                style={{
                                    left: `${(phase.start / timeline.totalWeeks) * 100}%`,
                                    width: `${(phase.duration / timeline.totalWeeks) * 100}%`,
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${(phase.duration / timeline.totalWeeks) * 100}%` }}
                                transition={{ duration: 0.8, delay: 0.5 + index * 0.2 }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full h-full transform -skew-x-12" />
                            </motion.div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-6 flex justify-between items-center text-sm text-gray-400 border-t border-white/10 pt-4">
                <span>Start</span>
                <span className="text-white font-bold">{timeline.totalWeeks} Weeks Total</span>
                <span>Completion</span>
            </div>
        </div>
    );
}
