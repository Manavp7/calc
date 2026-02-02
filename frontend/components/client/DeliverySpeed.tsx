'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { DELIVERY_SPEEDS } from '@/lib/constants';
import { useState } from 'react';
import { Rocket, Zap, Clock } from 'lucide-react';

export default function DeliverySpeed() {
    const { inputs, setDeliverySpeed } = usePricingStore();
    const [sliderValue, setSliderValue] = useState(
        DELIVERY_SPEEDS.findIndex(s => s.id === inputs.deliverySpeed)
    );

    const handleSliderChange = (value: number) => {
        setSliderValue(value);
        setDeliverySpeed(DELIVERY_SPEEDS[value].id);
    };

    const currentSpeed = DELIVERY_SPEEDS[sliderValue];

    // Dynamic Color Logic
    const getColor = (index: number) => {
        if (index === 0) return '#3b82f6'; // Blue (Standard)
        if (index === 1) return '#a855f7'; // Purple (Fast)
        return '#f43f5e'; // Rose (Priority)
    };

    const activeColor = getColor(sliderValue);

    return (
        <section className="section bg-[#030712] relative py-12 overflow-hidden flex flex-col justify-center">
            {/* Background Pulse */}
            <motion.div
                animate={{
                    opacity: [0.05, 0.1, 0.05],
                    scale: [1, 1.1, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none"
                style={{ backgroundColor: activeColor }}
            />

            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                        How fast do you need it?
                    </h2>
                    <p className="text-slate-400 text-lg">
                        Adjust the velocity to match your timeline.
                    </p>
                </motion.div>

                <div className="max-w-3xl mx-auto">
                    {/* Main Interaction Area */}
                    <div className="bg-white/5 backdrop-blur-2xl rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/5">

                        {/* Speed Indicator */}
                        <div className="flex justify-center mb-10 relative">
                            <motion.div
                                key={currentSpeed.id}
                                initial={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.3 }}
                                className="text-center relative z-10"
                            >
                                <div className="text-xs font-bold tracking-[0.2em] uppercase mb-2" style={{ color: activeColor }}>
                                    {currentSpeed.title} MODE
                                </div>
                                <div className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter">
                                    {currentSpeed.title}
                                </div>
                                <p className="text-slate-400 text-base">
                                    {currentSpeed.description}
                                </p>
                            </motion.div>
                        </div>

                        {/* Custom Slider */}
                        <div className="relative h-4 bg-[#0f111a] rounded-full mb-10 cursor-pointer group ring-1 ring-white/5 shadow-inner">
                            {/* Track Background */}
                            <motion.div
                                className="absolute inset-y-0 left-0 rounded-full"
                                animate={{
                                    width: `${(sliderValue / (DELIVERY_SPEEDS.length - 1)) * 100}%`,
                                    background: `linear-gradient(90deg, transparent, ${activeColor})`
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            >
                                <motion.div
                                    layoutId="slider-thumb"
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-[#0f111a] bg-white shadow-[0_0_20px_currentColor] z-30 flex items-center justify-center transform translate-x-1/2"
                                    style={{ color: activeColor }}
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                </motion.div>
                            </motion.div>

                            <input
                                type="range"
                                min="0"
                                max={DELIVERY_SPEEDS.length - 1}
                                value={sliderValue}
                                onChange={(e) => handleSliderChange(parseInt(e.target.value))}
                                className="absolute inset-0 w-full height-full opacity-0 cursor-pointer z-40"
                            />

                            {/* Ticks */}
                            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center pointer-events-none z-0">
                                {DELIVERY_SPEEDS.map((speed, index) => (
                                    <div key={speed.id} className={`w-1 h-1 rounded-full transition-colors duration-300 ${index <= sliderValue ? 'bg-white/50' : 'bg-white/10'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Labels */}
                        <div className="grid grid-cols-3 gap-4 text-center">
                            {DELIVERY_SPEEDS.map((speed, index) => (
                                <button
                                    key={speed.id}
                                    onClick={() => handleSliderChange(index)}
                                    className={`group cursor-pointer transition-all duration-300 ${sliderValue === index ? 'opacity-100 scale-100' : 'opacity-40 hover:opacity-70 scale-95'}`}
                                >
                                    <div className={`flex justify-center mb-2 transition-colors ${sliderValue === index ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                        {index === 0 && <Clock size={24} />}
                                        {index === 1 && <Zap size={24} />}
                                        {index === 2 && <Rocket size={24} />}
                                    </div>
                                    <div className="font-bold text-xs tracking-wide text-white">{speed.title}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
