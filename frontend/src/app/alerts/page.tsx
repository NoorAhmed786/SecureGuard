"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertCircle, CheckCircle, Clock, Filter, Search, ChevronRight } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';
import { apiRequest } from '@/lib/api';

interface Incident {
    id: string | number;
    title: string;
    level: string;
    time: string;
    detail: string;
}

export default function AlertsPage() {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchIncidents() {
            try {
                const data = await apiRequest('/api/v1/dashboard/all-alerts');
                setIncidents(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Fetch incidents error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchIncidents();
    }, []);

    const filteredIncidents = incidents.filter(alert => {
        const level = alert.level?.toLowerCase() || '';
        const matchesFilter = filter === 'all' ||
            (filter === 'high' && level === 'high');

        const matchesSearch =
            alert.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            alert.detail?.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesFilter && matchesSearch;
    });

    const getStatusIcon = (status: string) => {
        const s = status.toLowerCase();
        if (s.includes('pend')) return <Clock className="text-yellow-500" size={18} />;
        if (s.includes('crit')) return <ShieldAlert className="text-purple-500" size={18} />;
        if (s.includes('high') || s.includes('analyz') || s.includes('confirm')) return <ShieldAlert className="text-red-500" size={18} />;
        return <CheckCircle className="text-emerald-500" size={18} />;
    };

    const getLevelBadge = (level: string) => {
        const l = level?.toLowerCase() || 'low';
        if (l === 'critical') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-purple-600/30 text-purple-400 border-purple-600/50">Critical</span>;
        }
        if (l === 'high') {
            return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-red-500/20 text-red-500 border-red-500/50">High</span>;
        }
        if (l === 'medium') return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-orange-500/20 text-orange-500 border-orange-500/50">Medium</span>;
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border bg-blue-500/20 text-blue-500 border-blue-500/50">Low</span>;
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
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'high' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-slate-400 hover:text-white'}`}
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
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
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
                                filteredIncidents.map((alert) => (
                                    <tr key={alert.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {(alert.level?.toLowerCase() === 'high' || alert.level?.toLowerCase() === 'critical') ? (
                                                    <ShieldAlert className="text-red-500 shrink-0" size={18} />
                                                ) : (
                                                    <CheckCircle className="text-emerald-500 shrink-0" size={18} />
                                                )}
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-white font-medium text-sm truncate max-w-[200px]">{alert.title}</span>
                                                    <span className="text-xs text-slate-500 truncate max-w-[200px]">{alert.detail}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getLevelBadge(alert.level)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${(alert.level?.toLowerCase() === 'high' || alert.level?.toLowerCase() === 'critical') ? 'bg-red-500' : 'bg-blue-500'}`}
                                                        style={{ width: (alert.level?.toLowerCase() === 'high' || alert.level?.toLowerCase() === 'critical') ? '15%' : '94%' }}
                                                    />
                                                </div>
                                                <span className="text-xs font-mono text-slate-400">
                                                    {(alert.level?.toLowerCase() === 'high' || alert.level?.toLowerCase() === 'critical') ? '15%' : '94%'}
                                                </span>
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
                            {!isLoading && filteredIncidents.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-slate-500 italic">
                                        No phishing threats match your filters.
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
