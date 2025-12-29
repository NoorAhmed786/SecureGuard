"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertTriangle, CheckCircle2, Users } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface SimulationModalProps {
    isOpen: boolean;
    onClose: () => void;
    userEmails: string[];
}

export default function SimulationModal({ isOpen, onClose, userEmails }: SimulationModalProps) {
    const [selectedTemplate, setSelectedTemplate] = useState('password_reset');
    const [isSending, setIsSending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const templates = [
        { id: 'password_reset', name: 'Urgent Password Reset', description: 'Tricks users into clicking a fake reset link.' },
        { id: 'payment_failure', name: 'Billing Update Failure', description: 'Alerts users to a fake failed payment.' },
    ];

    const handleBlast = async () => {
        setIsSending(true);
        try {
            await apiRequest('/api/v1/simulation/blast', {
                method: 'POST',
                body: JSON.stringify({
                    template_id: selectedTemplate,
                    target_users: userEmails // In a real app, we'd pull IDs, but emails work for this mock
                })
            });
            setIsSuccess(true);
            setTimeout(() => {
                setIsSuccess(false);
                onClose();
            }, 2000);
        } catch (err) {
            console.error("Simulation error:", err);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 text-blue-500 rounded-lg">
                                    <AlertTriangle size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-white">Blast Phishing Simulation</h2>
                            </div>
                            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 space-y-8">
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Select Attack Template</p>
                                <div className="grid grid-cols-1 gap-4">
                                    {templates.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`
                                                w-full text-left p-4 rounded-xl border transition-all
                                                ${selectedTemplate === t.id
                                                    ? 'bg-blue-600/10 border-blue-500 text-white'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'}
                                            `}
                                        >
                                            <p className="font-bold">{t.name}</p>
                                            <p className="text-xs mt-1 opacity-70">{t.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Users size={18} />
                                    <span className="text-sm font-medium">Targeting all <strong className="text-white">{userEmails.length}</strong> active users.</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-950 border-t border-slate-800 flex justify-end gap-4">
                            <button onClick={onClose} className="px-6 py-2 text-slate-400 hover:text-white font-bold transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={handleBlast}
                                disabled={isSending || isSuccess}
                                className={`
                                    px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg
                                    ${isSuccess
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-blue-600 text-white hover:bg-blue-500 active:scale-95 shadow-blue-500/20'}
                                    disabled:opacity-50
                                `}
                            >
                                {isSuccess ? (
                                    <>
                                        <CheckCircle2 size={20} />
                                        Simulation Sent!
                                    </>
                                ) : (
                                    <>
                                        {isSending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Send size={18} /></motion.div> : <Send size={20} />}
                                        Launch Blast
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
