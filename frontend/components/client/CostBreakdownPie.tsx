'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { useState } from 'react';

export default function CostBreakdownPie() {
    const { costBreakdown } = usePricingStore();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    if (costBreakdown.length === 0) return null;

    // Calculate cumulative percentages for pie slices
    let cumulativePercentage = 0;
    const slices = costBreakdown.map((item, index) => {
        const startPercentage = cumulativePercentage;
        cumulativePercentage += item.percentage;
        const endPercentage = cumulativePercentage;

        return {
            ...item,
            startPercentage,
            endPercentage,
            index,
        };
    });

    // Filter slices if one is selected
    const displayedSlices = selectedIndex !== null
        ? slices.filter(slice => slice.index === selectedIndex)
        : slices;

    // Convert percentage to angle (0-360)
    const percentageToAngle = (percentage: number) => (percentage / 100) * 360;

    // Create SVG path for pie slice
    const createArc = (startAngle: number, endAngle: number, radius: number, isHovered: boolean) => {
        const adjustedRadius = isHovered ? radius + 10 : radius;
        const startRad = (startAngle - 90) * (Math.PI / 180);
        const endRad = (endAngle - 90) * (Math.PI / 180);

        const x1 = 200 + adjustedRadius * Math.cos(startRad);
        const y1 = 200 + adjustedRadius * Math.sin(startRad);
        const x2 = 200 + adjustedRadius * Math.cos(endRad);
        const y2 = 200 + adjustedRadius * Math.sin(endRad);

        const largeArc = endAngle - startAngle > 180 ? 1 : 0;

        return `M 200 200 L ${x1} ${y1} A ${adjustedRadius} ${adjustedRadius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };

    const handleSliceClick = (index: number) => {
        // Toggle selection: if clicking the same slice, deselect it
        setSelectedIndex(selectedIndex === index ? null : index);
    };

    return (
        <div className="max-w-6xl mx-auto" onMouseLeave={() => setHoveredIndex(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Pie Chart */}
                <motion.div
                    className="relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <svg
                        viewBox="0 0 400 400"
                        className="w-full max-w-md mx-auto"
                        style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.3))' }}
                    >
                        {slices.map((slice) => {
                            const startAngle = percentageToAngle(slice.startPercentage);
                            const endAngle = percentageToAngle(slice.endPercentage);
                            const isHovered = hoveredIndex === slice.index;
                            const isSelected = selectedIndex === slice.index;
                            const isOtherSelected = selectedIndex !== null && selectedIndex !== slice.index;

                            return (
                                <motion.path
                                    key={slice.label}
                                    d={createArc(startAngle, endAngle, 150, isHovered || isSelected)}
                                    fill={slice.color}
                                    stroke="#0a0a0a"
                                    strokeWidth="2"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: isOtherSelected ? 0.2 : 1,
                                        scale: 1
                                    }}
                                    transition={{ duration: 0.6, delay: slice.index * 0.1 }}
                                    onMouseEnter={() => setHoveredIndex(slice.index)}

                                    onClick={() => handleSliceClick(slice.index)}
                                    style={{
                                        cursor: 'pointer',
                                        transformOrigin: '200px 200px',
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                />
                            );
                        })}

                        {/* Center Circle */}
                        <circle
                            cx="200"
                            cy="200"
                            r="80"
                            fill="#0a0a0a"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="2"
                        />

                        {/* Center Text */}
                        <text
                            x="200"
                            y="190"
                            textAnchor="middle"
                            fill="white"
                            fontSize="16"
                            fontWeight="600"
                        >
                            Cost
                        </text>
                        <text
                            x="200"
                            y="215"
                            textAnchor="middle"
                            fill="white"
                            fontSize="16"
                            fontWeight="600"
                        >
                            Breakdown
                        </text>
                    </svg>

                    {/* Click hint */}
                    {selectedIndex === null && (
                        <motion.p
                            className="text-center text-gray-500 text-sm mt-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1 }}
                        >
                            Click any segment to focus
                        </motion.p>
                    )}
                    {selectedIndex !== null && (
                        <motion.button
                            className="text-center text-primary-400 text-sm mt-4 hover:text-primary-300 transition-colors w-full"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            onClick={() => setSelectedIndex(null)}
                        >
                            ← Show all segments
                        </motion.button>
                    )}
                </motion.div>

                {/* Legend */}
                <div className="space-y-4">
                    {displayedSlices.map((slice) => (
                        <motion.div
                            key={slice.label}
                            className={`
                glass rounded-xl p-4 transition-all duration-300 cursor-pointer
                ${hoveredIndex === slice.index || selectedIndex === slice.index ? 'bg-white/10 scale-105' : ''}
              `}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: slice.index * 0.1 }}
                            onMouseEnter={() => setHoveredIndex(slice.index)}

                            onClick={() => handleSliceClick(slice.index)}
                        >
                            <div className="flex items-center gap-4">
                                {/* Color Indicator */}
                                <div
                                    className="w-6 h-6 rounded-lg flex-shrink-0"
                                    style={{ backgroundColor: slice.color }}
                                />

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-white">
                                            {slice.label}
                                        </h4>
                                        <span className="text-primary-400 font-bold text-lg">
                                            {slice.percentage}%
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400">
                                        {slice.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Tooltip for Hovered/Selected Slice */}
            {(hoveredIndex !== null || selectedIndex !== null) && (
                <motion.div
                    className="text-center mt-8 glass rounded-xl p-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h4 className="text-xl font-bold mb-2" style={{ color: slices[selectedIndex ?? hoveredIndex!].color }}>
                        {slices[selectedIndex ?? hoveredIndex!].label}
                    </h4>
                    <p className="text-gray-300">
                        {slices[selectedIndex ?? hoveredIndex!].description}
                    </p>
                    <div className="mt-4 space-y-2">
                        <p className="text-3xl font-bold text-white">
                            {slices[selectedIndex ?? hoveredIndex!].percentage}%
                        </p>
                        <p className="text-2xl font-semibold text-primary-400">
                            ${slices[selectedIndex ?? hoveredIndex!].amount.toLocaleString()}
                        </p>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
