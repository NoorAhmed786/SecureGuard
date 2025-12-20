"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Search, Globe, AlertTriangle, CheckCircle, Loader2, BarChart4, Lock, Activity } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';

export default function ScannerPage() {
    const [url, setUrl] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [scanResult, setScanResult] = useState<any>(null);
    const [scanStep, setScanStep] = useState('');

    const steps = [
        "Initializing scan engine...",
        "Resolving domain...",
        "Checking SSL/TLS certificates...",
        "Analyzing security headers...",
        "Scanning for subdomains...",
        "Checking typosquatting registry...",
        "Generating final report..."
    ];

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setIsScanning(true);
        setScanResult(null);
        setProgress(0);

        try {
            // Visual feedback - faster progress at the start
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + (Math.random() * 5), 90));
            }, 500);

            // Set some initial labels
            setScanStep("Initializing network probes...");
            await new Promise(r => setTimeout(r, 1000));
            setScanStep("Connecting to target host...");

            const response = await fetch("http://localhost:8000/api/v1/scanner/scan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url })
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error("Scan failed");
            }

            const data = await response.json();

            // Map icon strings to Lucide components
            const iconMap: any = {
                "Lock": Lock,
                "Shield": Shield,
                "Activity": Activity,
                "Globe": Globe,
                "AlertTriangle": AlertTriangle
            };

            const mappedFindings = data.findings.map((f: any) => ({
                ...f,
                icon: iconMap[f.icon] || Shield
            }));

            setProgress(100);
            setScanStep("Finalizing report...");
            await new Promise(r => setTimeout(r, 500));

            setScanResult({
                ...data,
                findings: mappedFindings
            });
        } catch (error) {
            console.error(error);
            setScanResult({
                domain: url,
                score: 0,
                findings: [{
                    id: 0,
                    title: "Scan Error",
                    status: "Critical",
                    icon: AlertTriangle,
                    color: "text-red-500",
                    detail: "Could not complete the security analysis for this domain."
                }]
            });
        } finally {
            setIsScanning(false);
        }
    };

    const getGrade = (score: number) => {
        if (score >= 90) return { label: 'A Grade', color: 'text-emerald-400' };
        if (score >= 80) return { label: 'B Grade', color: 'text-blue-400' };
        if (score >= 70) return { label: 'C Grade', color: 'text-yellow-400' };
        if (score >= 60) return { label: 'D Grade', color: 'text-orange-400' };
        return { label: 'F Grade', color: 'text-red-400' };
    };

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto relative min-h-screen">
            <ThreeGlobe />

            <header className="relative z-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/50 mb-6">
                    <Shield className="text-blue-500" size={32} />
                </div>
                <h1 className="text-4xl font-bold text-white">Vulnerability Scanner</h1>
                <p className="text-slate-400 max-w-2xl mx-auto">
                    SecureGuard AI analyzes your company's public assets to identify vulnerabilities,
                    misconfigurations, and potential phishing vectors.
                </p>
            </header>

            <div className="relative z-10">
                <form onSubmit={handleScan} className="max-w-2xl mx-auto">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Globe className="text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="Enter company URL (e.g., company.com)"
                            className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl py-5 pl-12 pr-32 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all backdrop-blur-xl"
                            disabled={isScanning}
                        />
                        <button
                            type="submit"
                            disabled={isScanning || !url}
                            className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            {isScanning ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            {isScanning ? "Scanning..." : "Run Scan"}
                        </button>
                    </div>
                </form>
            </div>

            <AnimatePresence>
                {isScanning && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative z-10"
                    >
                        <div className="space-y-6">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-500 font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={16} className="animate-pulse" />
                                    {scanStep}
                                </span>
                                <span className="text-slate-400 font-mono">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <motion.div
                                    className="h-full bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {scanResult && !isScanning && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-4xl mx-auto space-y-8 relative z-10"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="col-span-1 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center">
                                <h3 className="text-slate-400 text-sm font-bold uppercase mb-4">Security Score</h3>
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-slate-800"
                                        />
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="58"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            strokeDasharray={364.4}
                                            strokeDashoffset={364.4 - (364.4 * scanResult.score) / 100}
                                            className={getGrade(scanResult.score).color}
                                        />
                                    </svg>
                                    <span className="absolute text-3xl font-bold text-white">{scanResult.score}</span>
                                </div>
                                <p className={`mt-4 font-bold text-sm ${getGrade(scanResult.score).color}`}>{getGrade(scanResult.score).label}</p>
                            </div>

                            <div className="col-span-2 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <BarChart4 className="text-blue-500" size={24} />
                                    Vulnerability Assessment
                                </h3>
                                <div className="grid grid-cols-1 gap-4">
                                    {scanResult.findings.map((finding: any) => (
                                        <div key={finding.id} className="flex items-start gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all">
                                            <div className={`p-2 rounded-lg bg-slate-900/50 ${finding.color}`}>
                                                <finding.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <h4 className="font-bold text-white">{finding.title}</h4>
                                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${finding.status === 'Secure' || finding.status === 'Clear' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                                        {finding.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-slate-400">{finding.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="space-y-2">
                                <h3 className="text-xl font-bold text-white">Detailed Penetration Report</h3>
                                <p className="text-slate-400 text-sm">Upgrade to Pro to receive the full JSON report including server versioning and deeper vector analysis.</p>
                            </div>
                            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap">
                                Get Full Report
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
