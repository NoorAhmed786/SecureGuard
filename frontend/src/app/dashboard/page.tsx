"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Activity, GraduationCap, TrendingUp, AlertTriangle, Megaphone, CheckCircle2 } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';
import { apiRequest, broadcastAlert } from '@/lib/api';
import { CONFIG } from '@/lib/config';

interface Alert {
    id: string | number;
    title: string;
    level: string;
    time: string;
    detail: string;
}

export default function Dashboard() {
    const [data, setData] = useState<{
        total_scans: number;
        threats_detected: number;
        training_progress: number;
        security_score: number;
        alerts: Alert[];
    }>({
        total_scans: 0,
        threats_detected: 0,
        training_progress: 0,
        security_score: 0,
        alerts: []
    });
    const [, setIsLoading] = useState(true);
    const [broadcastStatus, setBroadcastStatus] = useState<Record<string, 'idle' | 'sending' | 'sent'>>({});
    const [activeBroadcast, setActiveBroadcast] = useState<{ title: string, message: string } | null>(null);
    const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);

    useEffect(() => {
        // Decode role from token
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = JSON.parse(atob(token.split('.')[1])) as { role?: 'admin' | 'user' };
                setUserRole(decoded.role || 'user');
            } catch (err) {
                console.error("Failed to decode token:", err);
            }
        }

        async function fetchStats() {
            try {
                const stats = await apiRequest<{
                    total_scans: number;
                    threats_detected: number;
                    training_progress: number;
                    security_score: number;
                    alerts: Alert[];
                }>('/api/v1/dashboard/stats');
                console.log("📊 Fetched Dashboard Stats:", stats);
                setData(stats);
            } catch (err) {
                console.error("Dashboard Fetch Error:", err);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();

        // Establish WebSocket connection for real-time alerts
        let socket: WebSocket | null = null;
        let reconnectTimeout: NodeJS.Timeout;

        function connect() {
            try {
                const wsUrl = CONFIG.WS_URL;
                if (!wsUrl) return;

                console.log("🚀 Attempting WebSocket connection to:", wsUrl);

                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log("✅ WebSocket connected successfully to:", wsUrl);
                };

                socket.onmessage = (event) => {
                    try {
                        const newAlert = JSON.parse(event.data);
                        if (newAlert.type === 'phishing_alert') {
                            setData(prev => ({
                                ...prev,
                                threats_detected: prev.threats_detected + 1,
                                alerts: [newAlert, ...prev.alerts].slice(0, 10) // Keep latest 10
                            }));
                        } else if (newAlert.type === 'broadcast_warning') {
                            setActiveBroadcast({
                                title: newAlert.title,
                                message: newAlert.message
                            });
                            // Auto-hide after 10 seconds
                            setTimeout(() => setActiveBroadcast(null), 10000);
                        }
                    } catch (err) {
                        console.error("❌ WebSocket message parse error:", err, "Raw data:", event.data);
                    }
                };

                socket.onerror = (err) => {
                    // Browser WebSocket errors don't contain much info for security reasons,
                    // but we can at least log the state of the socket.
                    console.error(`❌ WebSocket error event triggered for ${wsUrl}. Current State:`,
                        socket ? ["CONNECTING", "OPEN", "CLOSING", "CLOSED"][socket.readyState] : "NULL",
                        err
                    );
                };

                socket.onclose = (event) => {
                    if (event.wasClean) {
                        console.log(`ℹ️ WebSocket connection closed cleanly, code=${event.code} reason=${event.reason}`);
                    } else {
                        console.warn('⚠️ WebSocket connection died. Check if backend is running at:', wsUrl);
                    }

                    // Only reconnect if we didn't unmount
                    reconnectTimeout = setTimeout(() => {
                        console.log("🔄 Attempting to reconnect...");
                        connect();
                    }, 3000);
                };
            } catch (err) {
                console.error("❌ Failed to initiate WebSocket connection:", err);
            }
        }

        connect();

        return () => {
            if (socket) {
                socket.onclose = null; // Prevent reconnection on intentional close
                socket.close();
            }
            clearTimeout(reconnectTimeout);
        };
    }, []);

    const stats = [
        { label: 'Total Scans', value: data.total_scans.toString(), icon: Activity, color: 'text-blue-500' },
        { label: 'Threats Blocked', value: data.threats_detected.toString(), icon: ShieldAlert, color: 'text-red-500' },
        { label: 'Training Progress', value: `${data.training_progress}%`, icon: GraduationCap, color: 'text-emerald-500' },
        { label: 'Security Score', value: data.security_score.toString(), icon: TrendingUp, color: 'text-purple-500' },
    ];

    const alerts = data.alerts;

    const getAlertColor = (level: string) => {
        switch (level) {
            case 'Critical':
            case 'High': return 'border-red-500/50 bg-red-500/10 text-red-500';
            case 'Medium': return 'border-orange-500/50 bg-orange-500/10 text-orange-500';
            case 'Low': return 'border-yellow-500/50 bg-yellow-500/10 text-yellow-500';
            default: return 'border-slate-700 bg-slate-800/50 text-slate-400';
        }
    };

    const handleBroadcast = async (incidentId: string | number) => {
        setBroadcastStatus(prev => ({ ...prev, [incidentId]: 'sending' as const }));
        try {
            await broadcastAlert(incidentId);
            setBroadcastStatus(prev => ({ ...prev, [incidentId]: 'sent' as const }));
            setTimeout(() => {
                setBroadcastStatus(prev => ({ ...prev, [incidentId]: 'idle' as const }));
            }, 3000);
        } catch (err) {
            console.error("Broadcast failed:", err);
            setBroadcastStatus(prev => ({ ...prev, [incidentId]: 'idle' as const }));
        }
    };

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen">
            <ThreeGlobe />

            {/* Global Broadcast Banner */}
            {activeBroadcast && (
                <motion.div
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4"
                >
                    <div className="bg-red-600 border-2 border-white/20 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 backdrop-blur-xl">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <Megaphone className="animate-bounce" size={24} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-black tracking-tight">{activeBroadcast.title}</h3>
                            <p className="text-sm font-medium opacity-90">{activeBroadcast.message}</p>
                        </div>
                    </div>
                </motion.div>
            )}

            <header className="relative z-10 text-center lg:text-left">
                <h1 className="text-3xl font-bold text-white">Security Command Center</h1>
                <p className="text-slate-400 mt-2">Welcome back, {userRole === 'admin' ? 'Admin' : 'Team Member'}. Your system is 85% secure.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <stat.icon className={`${stat.color} opacity-80`} size={24} />
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</span>
                        </div>
                        <div className="mt-4">
                            <h3 className="text-3xl font-bold text-white">{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Real-time Alerts */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <AlertTriangle className="text-orange-500" size={20} />
                            Real-time Phishing Alerts
                        </h2>
                        <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</button>
                    </div>

                    <div className="space-y-4">
                        {alerts.map((alert) => (
                            <motion.div
                                key={alert.id}
                                whileHover={{ scale: 1.01 }}
                                className={`p-5 rounded-xl border ${getAlertColor(alert.level)} transition-all`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{alert.title}</h4>
                                        <p className="text-sm mt-1 opacity-80">{alert.detail}</p>

                                        {/* Remediation Action - Admin Only */}
                                        {userRole === 'admin' && (alert.level === 'High' || alert.level === 'Critical') && (
                                            <div className="mt-4">
                                                <button
                                                    onClick={() => handleBroadcast(alert.id)}
                                                    disabled={broadcastStatus[alert.id] === 'sending' || broadcastStatus[alert.id] === 'sent'}
                                                    className={`text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all ${broadcastStatus[alert.id] === 'sent'
                                                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                        : 'bg-white text-black hover:bg-slate-200 shadow-lg'
                                                        }`}
                                                >
                                                    {broadcastStatus[alert.id] === 'sending' ? (
                                                        <>Broadcasting...</>
                                                    ) : broadcastStatus[alert.id] === 'sent' ? (
                                                        <><CheckCircle2 size={14} /> Alert Sent to Team</>
                                                    ) : (
                                                        <><Megaphone size={14} /> Broadcast Warning to Team</>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs opacity-70 font-mono">{alert.time}</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Training Progress Container */}
                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6 relative z-10">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <GraduationCap className="text-emerald-500" size={20} />
                        Training Progress
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Security Fundamentals</span>
                                <span className="text-emerald-400 font-bold">85%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '85%' }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Phishing Simulation #4</span>
                                <span className="text-blue-400 font-bold">40%</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '40%' }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-slate-200 transition-colors">
                                Resume Training
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
