"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    PlayCircle,
    FileText,
    HelpCircle,
    ChevronRight,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

export default function TrainingModulePage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [isWrong, setIsWrong] = useState(false);

    const moduleData = {
        title: 'Identifying Phishing URLs',
        description: 'Attackers often use deceptive URLs to trick you into visiting malicious sites.',
        steps: [
            {
                type: 'video',
                title: 'Introduction to URL Structure',
                content: 'In this video, we will break down the components of a URL and show you where attackers usually hide their tricks.',
                videoUrl: 'https://placeholder.com/video',
            },
            {
                type: 'reading',
                title: 'The "Top-Level Domain" Trap',
                content: 'Often, attackers will use domains like "google-support.security" instead of "google.com". Always check the part right before the last dot.',
            },
            {
                type: 'quiz',
                title: 'Quick Check',
                question: 'Which of the following URLs is MOST likely a phishing link?',
                options: [
                    'https://accounts.google.com/login',
                    'https://login.microsoftonline.com',
                    'https://secure-paypal-login.net/verify',
                    'https://amazon.com/orders'
                ],
                correct: 2,
            }
        ]
    };

    const handleNext = () => {
        if (currentStep < moduleData.steps.length - 1) {
            setCurrentStep(currentStep + 1);
            setQuizAnswer(null);
            setIsWrong(false);
        }
    };

    const handleQuizSubmit = (index: number) => {
        setQuizAnswer(index);
        if (index === moduleData.steps[currentStep].correct) {
            setIsWrong(false);
        } else {
            setIsWrong(true);
            setTimeout(() => setIsWrong(false), 500);
        }
    };

    const progress = ((currentStep + 1) / moduleData.steps.length) * 100;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/training" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                        Back to Library
                    </Link>
                    <div className="flex flex-col items-center flex-1">
                        <h1 className="text-sm font-bold text-white uppercase tracking-widest">{moduleData.title}</h1>
                        <div className="mt-2 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-500">
                        STEP {currentStep + 1} OF {moduleData.steps.length}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center items-center p-6 bg-slate-900/20">
                <div className="max-w-3xl w-full">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-8 lg:p-12 shadow-2xl space-y-8"
                        >
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    {moduleData.steps[currentStep].type === 'video' && <PlayCircle className="text-blue-500" />}
                                    {moduleData.steps[currentStep].type === 'reading' && <FileText className="text-purple-500" />}
                                    {moduleData.steps[currentStep].type === 'quiz' && <HelpCircle className="text-orange-500" />}
                                    <h2 className="text-2xl font-bold text-white">{moduleData.steps[currentStep].title}</h2>
                                </div>
                                <p className="text-slate-400 leading-relaxed text-lg">
                                    {moduleData.steps[currentStep].content}
                                </p>
                            </div>

                            {/* Interaction Area */}
                            {moduleData.steps[currentStep].type === 'video' && (
                                <div className="aspect-video bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 group cursor-pointer relative overflow-hidden">
                                    <div className="absolute inset-0 bg-blue-600/5 group-hover:bg-blue-600/10 transition-colors" />
                                    <PlayCircle size={64} className="text-white opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                                    <span className="absolute bottom-4 text-xs font-mono text-slate-600 uppercase tracking-widest">Video Player Placeholder</span>
                                </div>
                            )}

                            {moduleData.steps[currentStep].type === 'quiz' && (
                                <div className="space-y-6">
                                    <p className="text-xl font-medium text-white">{moduleData.steps[currentStep].question}</p>
                                    <div className="grid grid-cols-1 gap-4">
                                        {moduleData.steps[currentStep].options?.map((option, idx) => {
                                            const isCorrect = idx === moduleData.steps[currentStep].correct;
                                            const isSelected = quizAnswer === idx;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleQuizSubmit(idx)}
                                                    className={`
                                                        w-full text-left p-5 rounded-xl border font-medium transition-all flex items-center justify-between group
                                                        ${isSelected
                                                            ? (isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' : 'bg-red-500/10 border-red-500 text-red-500')
                                                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'}
                                                        ${isWrong && isSelected ? 'animate-shake' : ''}
                                                    `}
                                                >
                                                    {option}
                                                    {isSelected && isCorrect && <CheckCircle2 size={20} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Footer Controls */}
                    <div className="mt-8 flex justify-between items-center px-4">
                        <button
                            disabled={currentStep === 0}
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-6 py-3 text-slate-500 hover:text-white disabled:opacity-0 transition-all font-bold"
                        >
                            Previous
                        </button>

                        {(moduleData.steps[currentStep].type !== 'quiz' || (quizAnswer === moduleData.steps[currentStep].correct)) && (
                            <button
                                onClick={handleNext}
                                className="px-10 py-4 bg-white text-black rounded-full font-bold shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                {currentStep === moduleData.steps.length - 1 ? 'Complete Module' : 'Continue'}
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}
