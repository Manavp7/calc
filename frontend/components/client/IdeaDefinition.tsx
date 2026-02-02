'use client';

import { motion } from 'framer-motion';
import { usePricingStore } from '@/lib/store';
import { IDEA_TYPES } from '@/lib/constants';
import { Check, Sparkles } from 'lucide-react';

export default function IdeaDefinition() {
    const { inputs, setIdeaType } = usePricingStore();

    return (
        <section id="idea-definition" className="section relative py-20 overflow-hidden min-h-screen flex flex-col justify-center">
            {/* Deep Ambient Background */}
            <div className="absolute inset-0 bg-[#030712]">
                <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
            </div>

            <div className="container-custom relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-12"
                >
                    <span className="inline-block py-0.5 px-2.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-4 backdrop-blur-md">
                        Step 01
                    </span>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 pb-2">
                        What are you building?
                    </h2>
                    <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto leading-relaxed">
                        Choose the blueprint that best matches your vision.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {IDEA_TYPES.map((idea, index) => {
                        const isSelected = inputs.ideaType === idea.id;

                        return (
                            <motion.button
                                key={idea.id}
                                onClick={() => setIdeaType(idea.id)}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className={`
                                    group relative h-full text-left rounded-3xl overflow-hidden transition-all duration-300
                                    ${isSelected
                                        ? 'ring-1 ring-indigo-500 shadow-[0_0_30px_-12px_rgba(99,102,241,0.3)]'
                                        : 'hover:ring-1 hover:ring-white/20'
                                    }
                                `}
                            >
                                {/* Card Background */}
                                <div className={`absolute inset-0 transition-colors duration-300 ${isSelected ? 'bg-[#0f111a]' : 'bg-[#050609] group-hover:bg-[#0a0c10]'}`} />

                                {/* Inner Gradient Mesh */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-indigo-500/10 via-transparent to-rose-500/5`} />

                                <div className="relative p-6 h-full flex flex-col items-start z-10">
                                    {/* Icon Box */}
                                    <div className={`
                                        w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-6 transition-all duration-300 shadow-lg
                                        ${isSelected
                                            ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white scale-105 rotate-3'
                                            : 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white group-hover:scale-105'
                                        }
                                    `}>
                                        <span className="drop-shadow-sm">{idea.icon}</span>
                                    </div>

                                    <h3 className={`text-xl font-bold mb-3 transition-colors ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                                        {idea.title}
                                    </h3>

                                    <p className={`text-sm leading-relaxed mb-8 flex-grow transition-colors ${isSelected ? 'text-indigo-100/70' : 'text-slate-500 group-hover:text-slate-400'}`}>
                                        {idea.description}
                                    </p>

                                    {/* Bottom Action Area */}
                                    <div className="w-full flex items-center justify-between mt-auto pt-6 border-t border-white/5 group-hover:border-white/10 transition-colors">
                                        <span className={`text-xs font-semibold tracking-wide uppercase transition-colors ${isSelected ? 'text-indigo-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                                            Select
                                        </span>
                                        <div className={`
                                            w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300
                                            ${isSelected
                                                ? 'bg-indigo-500 border-indigo-500 text-white scale-100'
                                                : 'border-white/10 text-white/20 scale-90 group-hover:border-white/30 group-hover:text-white'
                                            }
                                        `}>
                                            <Check className={`w-4 h-4 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                                        </div>
                                    </div>
                                </div>
                            </motion.button>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
