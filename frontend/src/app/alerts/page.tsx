"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle, Clock, Filter, Search, ChevronRight } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';

interface Incident {
    id: string;
    sender_email: string;
    subject: string;
    threat_level: string;
    status: string;
    detected_at: string;
    confidence_score: number;
}

export default function AlertsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        async function fetchIncidents() {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://localhost:8000/api/v1/dashboard/stats', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setIncidents(data.alerts || []);
                }
            } catch (err) {
                console.error("Fetch incidents error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchIncidents();
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock className="text-yellow-500" size={18} />;
            case 'analyzed': return <ShieldAlert className="text-red-500" size={18} />;
            case 'resolved': return <CheckCircle className="text-emerald-500" size={18} />;
            default: return <AlertCircle className="text-slate-500" size={18} />;
        }
    };

    const getLevelBadge = (level: string) => {
        const colors: any = {
            'High': 'bg-red-500/20 text-red-500 border-red-500/50',
            'Medium': 'bg-orange-500/20 text-orange-500 border-orange-500/50',
            'Low': 'bg-blue-500/20 text-blue-500 border-blue-500/50'
        };
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${colors[level] || 'bg-slate-500/20 text-slate-500 border-slate-500/50'}`}>
                {level}
            </span>
        );
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen">
            <ThreeGlobe />

            <header className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <ShieldAlert className="text-red-500" size={32} />
                        Phishing Alerts
                    </h1>
                    <p className="text-slate-400 mt-2">Monitor and manage all detected security threats across your organization.</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-2 rounded-xl backdrop-blur-xl">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('high')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'high' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-400 hover:text-white'}`}
                    >
                        High Risk
                    </button>
                </div>
            </header>

            <div className="relative z-10 bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex items-center gap-4">
                    <Search className="text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by sender or subject..."
                        className="bg-transparent border-none focus:ring-0 text-sm text-slate-300 w-full"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs uppercase font-bold text-slate-500 border-b border-slate-800">
                                <th className="px-6 py-4">Sender / Subject</th>
                                <th className="px-6 py-4">Threat Level</th>
                                <th className="px-6 py-4">Security Score</th>
                                <th className="px-6 py-4">Detection Time</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {isLoading ? (
                                [1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-6 py-4"><div className="h-10 bg-slate-800 rounded w-48" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-800 rounded w-20" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-800 rounded w-12" /></td>
                                        <td className="px-6 py-4"><div className="h-6 bg-slate-800 rounded w-32" /></td>
                                        <td className="px-6 py-4 text-right"><div className="h-8 bg-slate-800 rounded w-24 inline-block" /></td>
                                    </tr>
                                ))
                            ) : (
                                incidents.map((alert: any) => (
                                    <tr key={alert.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-white font-medium text-sm truncate max-w-[200px]">{alert.title}</span>
                                                <span className="text-xs text-slate-500 truncate max-w-[200px]">{alert.detail}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getLevelBadge(alert.level)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: '92%' }} />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400">92%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">
                                            {new Date(alert.time).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-bold text-white hover:bg-slate-700 transition-all flex items-center gap-2 ml-auto">
                                                View Details
                                                <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            {!isLoading && incidents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                                        No phishing threats detected recently. Your organization is secure.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
