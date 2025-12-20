"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertTriangle, CheckCircle, XCircle, Loader2, Globe, Lock, FileWarning } from 'lucide-react';

interface Vulnerability {
    type: string;
    severity: string;
    description: string;
}

interface ScanResult {
    scan_id: string;
    url: string;
    security_score: number;
    vulnerabilities_count: number;
    vulnerabilities: Vulnerability[];
    checks: {
        ssl: any;
        headers: any;
        typosquatting: any;
        forms: any;
    };
}

export default function WebsiteScannerPage() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [error, setError] = useState('');

    const handleScan = async () => {
        if (!url) {
            setError('Please enter a URL');
            return;
        }

        setLoading(true);
        setError('');
        setScanResult(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/v1/scanner/scan-website', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                throw new Error('Scan failed');
            }

            const data = await response.json();
            setScanResult(data);
        } catch (err: any) {
            setError(err.message || 'Failed to scan website');
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toUpperCase()) {
            case 'CRITICAL': return 'text-red-500 bg-red-500/10 border-red-500/30';
            case 'HIGH': return 'text-orange-500 bg-orange-500/10 border-orange-500/30';
            case 'MEDIUM': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
            case 'LOW': return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
            default: return 'text-slate-500 bg-slate-500/10 border-slate-500/30';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Globe className="w-12 h-12 text-blue-500" />
                        <h1 className="text-4xl font-bold text-white">Website Security Scanner</h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Scan any website for security vulnerabilities and get detailed reports
                    </p>
                </motion.div>

                {/* Scan Input */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-900 rounded-2xl p-8 border border-slate-800 mb-8"
                >
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                            placeholder="Enter website URL (e.g., https://example.com)"
                            className="flex-1 bg-slate-800 text-white px-6 py-4 rounded-xl border border-slate-700 focus:border-blue-500 focus:outline-none transition-colors"
                        />
                        <button
                            onClick={handleScan}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Scanning...
                                </>
                            ) : (
                                <>
                                    <Shield className="w-5 h-5" />
                                    Scan Website
                                </>
                            )}
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-500 mt-4 flex items-center gap-2">
                            <XCircle className="w-4 h-4" />
                            {error}
                        </p>
                    )}
                </motion.div>

                {/* Scan Results */}
                {scanResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        {/* Security Score */}
                        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-white mb-2">Security Score</h2>
                                    <p className="text-slate-400">{scanResult.url}</p>
                                </div>
                                <div className={`text-6xl font-bold ${getScoreColor(scanResult.security_score)}`}>
                                    {scanResult.security_score}
                                    <span className="text-2xl">/100</span>
                                </div>
                            </div>
                        </div>

                        {/* Vulnerabilities */}
                        {scanResult.vulnerabilities_count > 0 ? (
                            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <AlertTriangle className="w-6 h-6 text-orange-500" />
                                    {scanResult.vulnerabilities_count} Vulnerabilities Found
                                </h3>
                                <div className="space-y-4">
                                    {scanResult.vulnerabilities.map((vuln, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border ${getSeverityColor(vuln.severity)}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h4 className="font-semibold">{vuln.type}</h4>
                                                <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border">
                                                    {vuln.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm opacity-90">{vuln.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                                <div className="flex items-center gap-3 text-green-500">
                                    <CheckCircle className="w-8 h-8" />
                                    <div>
                                        <h3 className="text-xl font-bold">No Vulnerabilities Found</h3>
                                        <p className="text-slate-400">This website appears to be secure</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Detailed Checks */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SSL Check */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <Lock className={scanResult.checks.ssl.secure ? 'text-green-500' : 'text-red-500'} />
                                    <h4 className="font-bold text-white">SSL/HTTPS</h4>
                                </div>
                                <p className="text-sm text-slate-400">{scanResult.checks.ssl.message}</p>
                            </div>

                            {/* Security Headers */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <Shield className="text-blue-500" />
                                    <h4 className="font-bold text-white">Security Headers</h4>
                                </div>
                                <p className="text-sm text-slate-400">
                                    {scanResult.checks.headers.present?.length || 0} of {scanResult.checks.headers.total_checked} headers present
                                </p>
                            </div>

                            {/* Typosquatting */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <AlertTriangle className={scanResult.checks.typosquatting.is_suspicious ? 'text-red-500' : 'text-green-500'} />
                                    <h4 className="font-bold text-white">Domain Check</h4>
                                </div>
                                <p className="text-sm text-slate-400">{scanResult.checks.typosquatting.message}</p>
                            </div>

                            {/* Forms */}
                            <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
                                <div className="flex items-center gap-3 mb-4">
                                    <FileWarning className="text-yellow-500" />
                                    <h4 className="font-bold text-white">Forms Security</h4>
                                </div>
                                <p className="text-sm text-slate-400">{scanResult.checks.forms.message}</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
