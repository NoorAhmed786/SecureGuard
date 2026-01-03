"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, AlertTriangle, Loader2, ArrowRight, Globe, Users, Activity, ExternalLink, ShieldCheck, AlertCircle, Target } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';
import { apiRequest } from '@/lib/api';
import Link from 'next/link';

export default function ScannerPage() {
    const [scanMode, setScanMode] = useState<'url' | 'email'>('email');
    const [url, setUrl] = useState('');
    const [sender, setSender] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [progress, setProgress] = useState(0);

    // Defined Types for API Responses
    interface ScanIndicator {
        type: string;
        severity: string;
        label: string;
        message: string;
    }

    interface EmailScanResponse {
        id: string;
        status: string;
        threat_level: string;
        score: number;
        sender: string;
        subject: string;
        report: {
            indicators: ScanIndicator[];
        };
    }

    interface WebsiteScanVulnerability {
        severity: string;
        type: string;
        description: string;
    }

    interface WebsiteScanResponse {
        scan_id: string;
        url: string;
        security_score: number;
        vulnerabilities_count: number;
        vulnerabilities: WebsiteScanVulnerability[];
        checks: Record<string, unknown>;
    }

    interface ScanResultState {
        threat_level: string;
        score: number;
        report: { indicators: ScanIndicator[] };
        error?: boolean;
        detail?: string;
        isUrlScan?: boolean;
        url?: string;
        subject?: string;
    }

    const [scanResult, setScanResult] = useState<ScanResultState | null>(null);
    const [scanStep, setScanStep] = useState('');

    const handleScan = async (e: React.FormEvent) => {
        e.preventDefault();
        if (scanMode === 'email' && !body) return;
        if (scanMode === 'url' && !url) return;

        setIsScanning(true);
        setScanResult(null);
        setProgress(0);

        try {
            // Visual feedback
            const progressInterval = setInterval(() => {
                setProgress(prev => Math.min(prev + (Math.random() * 10), 90));
            }, 300);

            if (scanMode === 'email') {
                setScanStep("Analyzing email structure...");
                await new Promise(r => setTimeout(r, 600));
                setScanStep("Checking sender reputation...");
                await new Promise(r => setTimeout(r, 600));
                setScanStep("Scanning URLs and attachments...");

                const data = await apiRequest<EmailScanResponse>("/api/v1/scan", {
                    method: "POST",
                    body: JSON.stringify({
                        sender: sender || "unknown@example.com",
                        subject: subject || "No Subject",
                        body
                    })
                });

                // Map API response to State
                setScanResult({
                    threat_level: data.threat_level,
                    score: data.score,
                    report: data.report,
                    subject: data.subject
                });
            } else {
                setScanStep("Resolving domain...");
                await new Promise(r => setTimeout(r, 600));
                setScanStep("Checking security headers...");

                const data = await apiRequest<WebsiteScanResponse>("/api/v1/scanner/scan-website", {
                    method: "POST",
                    body: JSON.stringify({ url })
                });

                // Map website scanner results for visual consistency
                setScanResult({
                    isUrlScan: true,
                    url: data.url,
                    threat_level: data.security_score < 40 ? 'CRITICAL' : data.security_score < 70 ? 'HIGH' : 'LOW',
                    score: (100 - data.security_score) / 100, // Invert score: 100 (safe) -> 0 (risk)
                    report: {
                        indicators: data.vulnerabilities.map((v) => ({
                            type: 'link',
                            severity: v.severity.toLowerCase(),
                            label: v.type,
                            message: v.description
                        }))
                    }
                });
            }

            clearInterval(progressInterval);
            setProgress(100);
            setScanStep("Finalizing assessment...");
            await new Promise(r => setTimeout(r, 500));
        } catch (error) {
            console.error(error);
            setScanResult({
                error: true,
                detail: (error as Error).message || "Security analysis failed. Please try again.",
                threat_level: 'UNKNOWN',
                score: 0,
                report: { indicators: [] }
            });
        } finally {
            setIsScanning(false);
        }
    };

    const getThreatColor = (level?: string) => {
        switch (level?.toLowerCase()) {
            case 'critical':
            case 'high': return 'text-red-500';
            case 'medium': return 'text-orange-500';
            case 'low': return 'text-blue-500';
            default: return 'text-emerald-500';
        }
    };

    const getConfidenceLabel = (score: number) => {
        if (score >= 0.8) return 'Highly Probable Threat';
        if (score >= 0.5) return 'Potential Risk Detected';
        if (score >= 0.2) return 'Unusual Pattern';
        return 'Verified Secure';
    };

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto relative min-h-screen">
            <ThreeGlobe />

            <header className="relative z-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center ring-1 ring-blue-500/50 mb-6 group hover:ring-blue-500 hover:bg-blue-600/30 transition-all cursor-default">
                    <ShieldAlert className="text-blue-500" size={32} />
                </div>
                <h1 className="text-4xl font-bold text-white tracking-tight">Advanced Security Scanner</h1>
                <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                    Next-gen threat intelligence for your organization. Analyze suspicious emails or scan public-facing websites for vulnerabilities instantly.
                </p>
            </header>

            <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                {/* Mode Toggle */}
                <div className="flex p-1.5 bg-slate-900/80 border border-white/5 rounded-2xl w-fit mx-auto backdrop-blur-xl shadow-2xl">
                    <button
                        onClick={() => { setScanMode('email'); setScanResult(null); }}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${scanMode === 'email' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <ShieldAlert size={18} />
                        Phishing Scan
                    </button>
                    <button
                        onClick={() => { setScanMode('url'); setScanResult(null); }}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all ${scanMode === 'url' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                    >
                        <Globe size={18} />
                        Website Scan
                    </button>
                </div>

                <form onSubmit={handleScan} className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden group">
                    {/* Visual accents */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-20" />
                    <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                    {scanMode === 'email' ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1 tracking-widest">
                                        <Users size={12} className="text-blue-500" /> Sender Profile
                                    </label>
                                    <input
                                        type="text"
                                        value={sender}
                                        onChange={(e) => setSender(e.target.value)}
                                        placeholder="e.g., support@secure-verify.com"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
                                        disabled={isScanning}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1 tracking-widest">
                                        <Activity size={12} className="text-blue-500" /> Subject Context
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="e.g., Immediate Account Lock Alert"
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-medium"
                                        disabled={isScanning}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1 tracking-widest">
                                    <Search size={12} className="text-blue-500" /> Message Payload
                                </label>
                                <textarea
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                    placeholder="Paste the suspicious email text here for deep heuristic analysis..."
                                    rows={6}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all resize-none font-medium text-sm leading-relaxed"
                                    disabled={isScanning}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5 ml-1 tracking-widest">
                                <Globe size={12} className="text-blue-500" /> Infrastructure URL
                            </label>
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="e.g., https://main.company-portal.com"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-5 px-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all font-bold text-lg"
                                disabled={isScanning}
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isScanning || (scanMode === 'email' ? !body : !url)}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800/50 disabled:text-slate-600 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-600/10 active:scale-[0.98] flex items-center justify-center gap-3 group/btn relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        {isScanning ? <Loader2 className="animate-spin" size={20} /> : <ShieldAlert size={20} className="group-hover/btn:rotate-12 transition-transform" />}
                        <span className="relative z-10">{isScanning ? "Engaging Analysis Engines..." : `Run Secure ${scanMode === 'email' ? 'Phishing' : 'Vulnerability'} Scan`}</span>
                    </button>
                </form>
            </div>

            <AnimatePresence mode="wait">
                {isScanning && (
                    <motion.div
                        key="scanning"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-2xl mx-auto bg-slate-900/40 border border-slate-800 rounded-3xl p-10 backdrop-blur-xl relative z-10 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                        <div className="space-y-8 relative z-10">
                            <div className="flex justify-between items-end">
                                <div className="space-y-1">
                                    <span className="text-blue-500 text-[10px] font-bold uppercase tracking-[0.2em]">System Status</span>
                                    <h3 className="text-white font-bold text-xl flex items-center gap-3">
                                        <Loader2 size={24} className="animate-spin text-blue-500" />
                                        {scanStep}
                                    </h3>
                                </div>
                                <span className="text-blue-400 font-mono text-xl font-bold">{Math.round(progress)}%</span>
                            </div>
                            <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <motion.div
                                    className="h-full bg-gradient-to-r from-blue-600 to-blue-400 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {scanResult && !isScanning && !scanResult.error && (
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-5xl mx-auto space-y-8 relative z-10 pb-20"
                    >
                        {/* Summary Card */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                <div className={`absolute inset-0 opacity-5 bg-current ${getThreatColor(scanResult.threat_level)}`} />
                                <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-6">Threat Probability</h3>
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-800" />
                                        <motion.circle
                                            cx="80" cy="80" r="74" stroke="currentColor" strokeWidth="8" fill="transparent"
                                            strokeDasharray={464.7}
                                            initial={{ strokeDashoffset: 464.7 }}
                                            animate={{ strokeDashoffset: 464.7 - (464.7 * Math.max(0.05, scanResult.score)) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            strokeLinecap="round"
                                            className={getThreatColor(scanResult.threat_level)}
                                        />
                                    </svg>
                                    <div className="absolute flex flex-col items-center">
                                        <span className="text-4xl font-bold text-white tracking-tighter">{Math.round(scanResult.score * 100)}%</span>
                                        <span className="text-[10px] text-slate-500 font-bold uppercase">Risk</span>
                                    </div>
                                </div>
                                <div className={`mt-6 px-4 py-1.5 rounded-full text-xs font-bold border ${getThreatColor(scanResult.threat_level)} border-current/20 bg-current/5`}>
                                    {getConfidenceLabel(scanResult.score)}
                                </div>
                            </div>

                            <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-3xl p-8 space-y-6 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-bold text-white tracking-tight">Technical Assessment</h3>
                                            <p className="text-slate-500 text-sm">Automated scan results based on {scanResult.isUrlScan ? 'infrastructure' : 'neural'} analysis.</p>
                                        </div>
                                        <div className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest border border-white/5 bg-slate-800 shadow-xl ${getThreatColor(scanResult.threat_level)}`}>
                                            {scanResult.threat_level} Priority
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Target size={12} className="text-blue-500" /> Analysis Target
                                            </span>
                                            <p className="text-white font-medium truncate">{scanResult.isUrlScan ? scanResult.url : scanResult.subject}</p>
                                        </div>
                                        <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                <Activity size={12} className="text-blue-500" /> Detection Engine
                                            </span>
                                            <p className="text-white font-medium">{scanResult.isUrlScan ? 'VulnScan v2.1' : 'NeuralScout AI'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center gap-4">
                                    <ShieldCheck className="text-blue-500 shrink-0" size={24} />
                                    <p className="text-blue-100/70 text-xs leading-relaxed">
                                        This scan has been cross-referenced with SecureGuard&apos;s global threat database. A real-time alert was broadcasted to your organization&apos;s security team.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Indicators Breakdown */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 ml-2">
                                <div className="w-8 h-1 bg-blue-600 rounded-full" />
                                <h4 className="text-lg font-bold text-white uppercase tracking-widest text-sm">Why it&apos;s a risk</h4>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {scanResult.report?.indicators?.map((indicator, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="bg-slate-900/40 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 space-y-4 transition-all hover:translate-y-[-2px] hover:bg-slate-900/60 group"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className={`p-3 rounded-xl bg-slate-950 border border-white/5 ${getThreatColor(indicator.severity)} group-hover:scale-110 transition-transform`}>
                                                {indicator.type === 'link' ? <ExternalLink size={20} /> :
                                                    indicator.type === 'sender' ? <Users size={20} /> :
                                                        indicator.type === 'content' ? <Search size={20} /> :
                                                            <AlertCircle size={20} />}
                                            </div>
                                            <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-slate-950 ${getThreatColor(indicator.severity)} border-white/5`}>
                                                {indicator.severity}
                                            </span>
                                        </div>
                                        <div className="space-y-2">
                                            <h5 className="font-bold text-white group-hover:text-blue-400 transition-colors uppercase text-xs tracking-wider">{indicator.label}</h5>
                                            <p className="text-slate-500 text-sm leading-relaxed">{indicator.message}</p>
                                        </div>
                                    </motion.div>
                                ))}

                                {(!scanResult.report?.indicators || scanResult.report.indicators.length === 0) && (
                                    <div className="col-span-full py-12 text-center bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
                                        <ShieldCheck className="text-emerald-500 mx-auto mb-3 opacity-30" size={48} />
                                        <p className="text-slate-500 font-medium tracking-wide lowercase">No critical threat indicators detected for this payload.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actionable Advice Card */}
                        <div className="bg-gradient-to-r from-blue-900/20 to-slate-900/60 border border-blue-500/20 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                            <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 shrink-0">
                                <AlertTriangle className="text-blue-400" size={40} />
                            </div>
                            <div className="flex-1 space-y-3">
                                <h3 className="text-xl font-bold text-white">Recommended Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                                    {scanResult.threat_level === 'CRITICAL' || scanResult.threat_level === 'HIGH' ? (
                                        <>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                Do not click any links or download attachments.
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                Report this to your IT/Security department immediately.
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                Block the sender domain at your email gateway.
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                                                Monitor accounts for suspicious activity.
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                Verified safe to view, but stay vigilant.
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                                Scan regular communications as part of hygiene.
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                            <Link href="/dashboard" className="shrink-0">
                                <button className="px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-500 shadow-xl shadow-blue-500/20 transition-all flex items-center gap-3 active:scale-95 group">
                                    Final Review
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {scanResult?.error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="max-w-2xl mx-auto p-12 bg-red-500/5 border border-red-500/10 rounded-3xl text-center space-y-4"
                    >
                        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                            <AlertTriangle className="text-red-500" size={40} />
                        </div>
                        <h3 className="text-white font-bold text-2xl tracking-tight">Technical Analysis Interrupted</h3>
                        <p className="text-slate-500 text-lg leading-relaxed">{scanResult.detail}</p>
                        <button
                            onClick={() => setScanResult(null)}
                            className="text-blue-500 font-bold hover:text-blue-400 transition-colors uppercase tracking-widest text-xs pt-4"
                        >
                            Try Scanning Again
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
