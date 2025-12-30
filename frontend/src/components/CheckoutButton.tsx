"use client";

import { CreditCard, Loader2 } from 'lucide-react';

interface CheckoutButtonProps {
    planId: string;
    price: string;
    isCurrentPlan?: boolean;
    isLoading?: boolean;
    onClick: () => void;
}

export default function CheckoutButton({ price, isCurrentPlan, isLoading, onClick }: CheckoutButtonProps) {
    if (isCurrentPlan) {
        return (
            <button disabled className="w-full py-3 rounded-xl bg-slate-800 text-slate-500 font-bold cursor-not-allowed">
                Current Plan
            </button>
        );
    }

    return (
        <button
            onClick={onClick}
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
        >
            {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
            ) : (
                <CreditCard size={20} />
            )}
            {isLoading ? "Redirecting..." : `Upgrade for ${price}`}
        </button>
    );
}
