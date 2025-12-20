"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield, Zap, Target, Loader2 } from 'lucide-react';
import CheckoutButton from '@/components/CheckoutButton';

export default function PricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const plans = [
        {
            id: 'free',
            name: 'Essential',
            price: '$0',
            description: 'Perfect for individuals starting their security journey.',
            features: [
                'Basic Phishing Detection',
                '3 Training Modules',
                'Email Support',
                'Single User Access'
            ],
            icon: Shield,
            color: 'text-slate-400',
            current: true,
        },
        {
            id: 'pro',
            name: 'Professional',
            price: '$29',
            description: 'Advanced protection for growing businesses and teams.',
            features: [
                'AI-Powered URL Scanning',
                'Full Course Library Access',
                'Real-time Threat Alerts',
                'Up to 10 Users',
                'Priority Support'
            ],
            icon: Zap,
            color: 'text-blue-500',
            highlight: true,
        },
        {
            id: 'enterprise',
            name: 'Enterprise',
            price: '$99',
            description: 'The ultimate security suite for large organizations.',
            features: [
                'Custom Phishing Simulations',
                'Dedicated Security Officer',
                'API Access & Integrations',
                'Unlimited Users',
                'SLA Guarantees'
            ],
            icon: Target,
            color: 'text-purple-500',
        }
    ];

    const handleUpgrade = async (planId: string) => {
        if (planId === 'free') return;

        setLoadingPlan(planId);
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
            const response = await fetch(`${apiBase}/api/v1/payment/create-checkout-session?plan_id=${planId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Server responded with ${response.status}`);
            }

            const data = await response.json();
            if (data.checkout_url) {
                window.location.href = data.checkout_url;
            } else {
                throw new Error('No checkout URL received from server');
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            alert(error.message || "Connection error. Is the backend running?");
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 lg:p-16 flex flex-col items-center">
            <header className="text-center space-y-4 max-w-2xl mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl lg:text-6xl font-bold text-white tracking-tight"
                >
                    Secure Your Future. <br />
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                        Choose Your Plan.
                    </span>
                </motion.h1>
                <p className="text-slate-400 text-lg">
                    Join 10,000+ companies using SecureGuard to stay ahead of cyber threats.
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                {plans.map((plan, i) => (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`
                            relative flex flex-col p-8 rounded-3xl border transition-all overflow-hidden
                            ${plan.highlight
                                ? 'bg-slate-900 border-blue-500/50 shadow-2xl shadow-blue-500/10'
                                : 'bg-slate-950 border-slate-800'}
                        `}
                    >
                        {plan.highlight && (
                            <div className="absolute top-0 right-0 p-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-bl-xl">
                                Recommended
                            </div>
                        )}

                        <div className="space-y-6 flex-1">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-2xl bg-white/5 ${plan.color}`}>
                                    <plan.icon size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Monthly Plan</p>
                                </div>
                            </div>

                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-bold text-white">{plan.price}</span>
                                <span className="text-slate-500 font-medium">/mo</span>
                            </div>

                            <p className="text-slate-400 text-sm leading-relaxed">
                                {plan.description}
                            </p>

                            <ul className="space-y-4 py-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-slate-300 text-sm">
                                        <div className="p-0.5 rounded-full bg-blue-500/20 text-blue-500">
                                            <Check size={14} />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8">
                            <CheckoutButton
                                planId={plan.id}
                                price={plan.price}
                                isCurrentPlan={plan.current}
                                isLoading={loadingPlan === plan.id}
                                onClick={() => handleUpgrade(plan.id)}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            <footer className="mt-16 text-slate-500 text-sm">
                Billed monthly. All plans include automated daily security backups.
            </footer>
        </div>
    );
}
