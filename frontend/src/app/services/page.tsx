"use client";

import ThreeGlobe from '@/components/ThreeGlobe';
import { motion } from 'framer-motion';
import { ShieldCheck, Cpu, Zap, Users } from 'lucide-react';
import Link from 'next/link';

const services = [
    {
        title: "AI Phishing Detection",
        description: "Our advanced neural networks analyze email content, headers, and metadata to catch zero-day phishing attempts with 99.9% accuracy.",
        icon: ShieldCheck,
        color: "text-blue-500"
    },
    {
        title: "Typosquatting Protection",
        description: "Real-time monitoring of lookalike domains and brand impersonation attempts across the global web.",
        icon: Cpu,
        color: "text-emerald-500"
    },
    {
        title: "Automated Incident Response",
        description: "Instantly neutralize threats with automated quarantine and alerting systems that integrate with your existing SOC.",
        icon: Zap,
        color: "text-purple-500"
    },
    {
        title: "Security Awareness Training",
        description: "Dynamic training modules and realistic simulations that adapt to your employees' risk profiles.",
        icon: Users,
        color: "text-orange-500"
    }
];

export default function ServicesPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
            <ThreeGlobe />

            <div className="relative z-10 container mx-auto px-4 py-16">
                <header className="flex justify-between items-center mb-20">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        SecureGuard AI
                    </Link>
                </header>

                <section className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold"
                        >
                            Enterprise <span className="text-blue-500">Defense</span> Services
                        </motion.h1>
                        <p className="text-slate-400 text-lg">Comprehensive protection powered by cutting-edge intelligence.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12">
                        {services.map((service, i) => (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-blue-500/50 transition-all group"
                            >
                                <service.icon className={`${service.color} mb-6 transition-transform group-hover:scale-110`} size={40} />
                                <h3 className="text-2xl font-bold mb-4">{service.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{service.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
