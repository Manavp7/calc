'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { TECH_STACKS } from '@/lib/constants';

export default function TechnologyPreference() {
    const { inputs, setTechStack } = usePricingStore();

    return (
        <section className="section bg-[#030712] relative py-16 border-t border-white/5 z-20 min-h-screen flex flex-col justify-center">
            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-10"
                >
                    <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                        Technology preference
                        <span className="text-white/20 text-xl ml-3 font-normal">(Optional)</span>
                    </h2>
                    <p className="text-slate-400 text-base max-w-xl mx-auto">
                        Have a specific stack in mind? Select it below. If you're unsure, let our experts decide the best fit for you.
                    </p>
                </motion.div>

                <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
                    {TECH_STACKS.map((tech, index) => {
                        const isSelected = inputs.techStack === tech.id;

                        return (
                            <motion.button
                                key={tech.id}
                                onClick={() => setTechStack(tech.id)}
                                initial={{ opacity: 0, scale: 0 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20,
                                    delay: index * 0.03
                                }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={`
                                    relative px-6 py-3 rounded-full border flex items-center gap-2.5 transition-all duration-300 overflow-hidden group
                                    ${isSelected
                                        ? 'bg-blue-500/10 border-blue-400/50 shadow-[0_0_20px_-5px_rgba(56,189,248,0.2)]'
                                        : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
                                    }
                                `}
                            >
                                {/* Glow Background */}
                                {isSelected && (
                                    <div className="absolute inset-0 bg-blue-400/10 blur-xl transition-all duration-300" />
                                )}

                                {/* Tech Indicator Dot */}
                                <div className={`
                                    w-2 h-2 rounded-full transition-all duration-300 relative z-10
                                    ${isSelected
                                        ? 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                                        : 'bg-slate-600 group-hover:bg-slate-500'
                                    }
                                `} />

                                <div className="text-left relative z-10">
                                    <span className={`block text-sm font-bold transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                        {tech.title}
                                    </span>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
