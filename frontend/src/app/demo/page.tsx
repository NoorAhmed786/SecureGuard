"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Globe, MessageSquare, CheckCircle, Play } from 'lucide-react';
import Link from 'next/link';
import ThreeGlobe from '@/components/ThreeGlobe';

export default function DemoPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [isSimulating, setIsSimulating] = useState(false);
    const [demoProgress, setDemoProgress] = useState(0);

    const steps = [
        {
            title: "AI Security Assistant",
            icon: MessageSquare,
            description: "Interact with our RAG-powered AI that knows your company's security policies and can identify real-time threats.",
            color: "text-blue-400",
            bg: "bg-blue-500/10"
        },
        {
            title: "Website Vulnerability Scanner",
            icon: Globe,
            description: "Scan your public-facing assets for misconfigurations, outdated certificates, and phishing vulnerabilities.",
            color: "text-emerald-400",
            bg: "bg-emerald-500/10"
        },
        {
            title: "Real-time Phishing Protection",
            icon: Shield,
            description: "Our embeddable widget blocks threats at the edge before they reach your users' inboxes.",
            color: "text-purple-400",
            bg: "bg-purple-500/10"
        }
    ];

    const runSimulation = () => {
        setIsSimulating(true);
        setDemoProgress(0);
        const timer = setInterval(() => {
            setDemoProgress((oldProgress) => {
                if (oldProgress === 100) {
                    clearInterval(timer);
                    setIsSimulating(false);
                    return 100;
                }
                const array = new Uint32Array(1);
                const randomVal = window.crypto.getRandomValues(array)[0] / 4294967295;
                const diff = randomVal * 15;
                return Math.min(oldProgress + diff, 100);
            });
        }, 500);
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden flex flex-col">
            <ThreeGlobe />

            {/* Background elements (consistency with login/home) */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-600/5 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col h-full container mx-auto px-6 py-8">
                {/* Minimal Header */}
                <header className="flex justify-between items-center mb-12">
                    <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400 flex items-center gap-2">
                        <Shield className="text-blue-500 w-6 h-6" />
                        SecureGuard AI <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 ml-2 border border-blue-500/30 uppercase tracking-widest">Live Demo</span>
                    </Link>
                    <Link href="/login">
                        <button className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all font-bold text-sm shadow-lg shadow-blue-500/20">
                            Get Full Version
                        </button>
                    </Link>
                </header>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    {/* Left: Interactive Controls */}
                    <div className="lg:col-span-5 space-y-8">
                        <div>
                            <h2 className="text-4xl font-extrabold mb-4 leading-tight">Interactive <br />Feature Showcase</h2>
                            <p className="text-slate-400 text-lg">Experience how SecureGuard AI protects your digital environment in three steps.</p>
                        </div>

                        <div className="space-y-4">
                            {steps.map((step, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setActiveStep(idx); setDemoProgress(0); }}
                                    className={`w-full flex items-start gap-4 p-5 rounded-2xl border transition-all text-left ${activeStep === idx
                                        ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/10'
                                        : 'bg-slate-900/30 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className={`p-3 rounded-xl ${step.bg} ${step.color}`}>
                                        <step.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold mb-1 ${activeStep === idx ? 'text-white' : 'text-slate-300'}`}>{step.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Simulation Area */}
                    <div className="lg:col-span-7">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl h-[500px] flex flex-col"
                        >
                            {/* Window Header */}
                            <div className="flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                                </div>
                                <div className="text-xs font-mono text-slate-500 flex items-center gap-2">
                                    <Zap size={14} className="text-blue-500" />
                                    SIMULATED_ENVIRONMENT_V2.0
                                </div>
                            </div>

                            {/* Content based on Active Step */}
                            <div className="flex-1 flex flex-col justify-center items-center relative">
                                <AnimatePresence mode="wait">
                                    {!isSimulating && demoProgress < 100 && (
                                        <motion.button
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onClick={runSimulation}
                                            className="group flex flex-col items-center gap-4 text-blue-400 hover:text-blue-300 transition-all"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600/30 transition-all">
                                                <Play size={28} className="ml-1 fill-current" />
                                            </div>
                                            <span className="font-bold text-sm uppercase tracking-widest">Launch interactive simulation</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>

                                {isSimulating && (
                                    <div className="w-full max-w-sm space-y-6">
                                        <div className="flex justify-between text-xs font-mono mb-2">
                                            <span className="text-blue-400">EXECUTING_PROBE...</span>
                                            <span className="text-slate-500">{Math.round(demoProgress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${demoProgress}%` }}
                                            />
                                        </div>
                                        <div className="text-center text-[10px] text-slate-500 font-mono animate-pulse">
                                            ACCESSING_VECTOR_DATABASE // TOKENIZING_NEURAL_REPORTS
                                        </div>
                                    </div>
                                )}

                                {demoProgress === 100 && !isSimulating && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full h-full flex flex-col gap-6"
                                    >
                                        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-4">
                                            <CheckCircle className="text-emerald-400 w-8 h-8 flex-shrink-0" />
                                            <div>
                                                <div className="font-bold text-emerald-400">Simulation Complete</div>
                                                <div className="text-sm text-slate-400">Features verified successfully in the simulated sandbox environment.</div>
                                            </div>
                                        </div>

                                        <div className="flex-1 bg-slate-800/20 border border-slate-800 rounded-2xl p-6 font-mono text-xs text-slate-500 overflow-auto whitespace-pre">
                                            {`> ANALYZING_REPORT_ID: SG-AI-8839\n> SCORE_VERDICT: [CRITICAL_PROTECTED]\n> THREATS_MITIGATED: 12\n> SYSTEM_INTEGRITY: 99.8%\n\n---\n\nREAL-TIME_FEEDBACK:\n"A phishing attempt targeting hr@domain.io was automatically\nneutralized using AI-derived link blacklisting."`}
                                        </div>

                                        <button
                                            onClick={() => setDemoProgress(0)}
                                            className="text-xs text-slate-500 hover:text-white transition-colors self-center"
                                        >
                                            Reset Simulation
                                        </button>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Footer Link */}
                <div className="py-8 flex justify-center border-t border-slate-900">
                    <p className="text-slate-500 text-sm flex items-center gap-2">
                        Ready to protect your real organization?
                        <Link href="/login" className="text-blue-400 font-bold hover:underline">Get SecureGuard AI Pro</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
