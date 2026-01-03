"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Key, Code, Copy, CheckCircle, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface APIKey {
    id: string;
    name: string;
    key: string;
    is_active: boolean;
    created_at: string;
    usage_count: number;
}

export default function IntegrationPage() {
    const [apiKeys, setApiKeys] = useState<APIKey[]>([]);
    const [newKeyName, setNewKeyName] = useState('');
    const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
    const [copiedKey, setCopiedKey] = useState('');
    const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());

    useEffect(() => {
        let isMounted = true;
        const loadKeys = async () => {
            try {
                const data = await apiRequest('/api/v1/api-keys/list') as APIKey[];
                if (isMounted) {
                    setApiKeys(data);
                }
            } catch (error) {
                console.error('Failed to fetch API keys:', error);
            }
        };
        loadKeys();
        return () => { isMounted = false; };
    }, []);

    const generateAPIKey = async () => {
        if (!newKeyName) return;

        try {
            const newKey = await apiRequest('/api/v1/api-keys/generate', {
                method: 'POST',
                body: JSON.stringify({ name: newKeyName })
            }) as APIKey;
            setApiKeys([newKey, ...apiKeys]);
            setNewKeyName('');
            setShowNewKeyDialog(false);
            setCopiedKey(newKey.key);
        } catch (error) {
            console.error('Failed to generate API key:', error);
        }
    };

    const revokeAPIKey = async (keyId: string) => {
        if (!confirm('Are you sure you want to revoke this API key?')) return;

        try {
            await apiRequest(`/api/v1/api-keys/${keyId}`, {
                method: 'DELETE'
            });
            setApiKeys(apiKeys.filter(k => k.id !== keyId));
        } catch (error) {
            console.error('Failed to revoke API key:', error);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(text);
        setTimeout(() => setCopiedKey(''), 2000);
    };

    const toggleKeyVisibility = (keyId: string) => {
        const newRevealed = new Set(revealedKeys);
        if (newRevealed.has(keyId)) {
            newRevealed.delete(keyId);
        } else {
            newRevealed.add(keyId);
        }
        setRevealedKeys(newRevealed);
    };

    const getWidgetCode = (apiKey: string) => {
        return `<!-- SecureGuard Phishing Protection Widget -->
<script src="http://localhost:3000/widget.js" 
        data-api-key="${apiKey}">
</script>`;
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Code className="w-10 h-10 text-blue-500" />
                        <h1 className="text-4xl font-bold text-white">Integration & API Keys</h1>
                    </div>
                    <p className="text-slate-400 text-lg">
                        Embed phishing protection on your website with our JavaScript widget
                    </p>
                </motion.div>

                {/* API Keys Section */}
                <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Key className="w-6 h-6" />
                            Your API Keys
                        </h2>
                        <button
                            onClick={() => setShowNewKeyDialog(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Generate New Key
                        </button>
                    </div>

                    {showNewKeyDialog && (
                        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                            <h3 className="text-white font-semibold mb-4">Generate New API Key</h3>
                            <div className="flex gap-4">
                                <input
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Key name (e.g., Production Website)"
                                    className="flex-1 bg-slate-900 text-white px-4 py-2 rounded-lg border border-slate-700 focus:border-blue-500 focus:outline-none"
                                />
                                <button
                                    onClick={generateAPIKey}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Generate
                                </button>
                                <button
                                    onClick={() => setShowNewKeyDialog(false)}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {apiKeys.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">
                                No API keys yet. Generate one to get started!
                            </p>
                        ) : (
                            apiKeys.map((key) => (
                                <div
                                    key={key.id}
                                    className="bg-slate-800 rounded-xl p-6 border border-slate-700"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-white font-semibold mb-2">{key.name}</h3>
                                            <div className="flex items-center gap-2">
                                                <code className="bg-slate-900 text-blue-400 px-3 py-1 rounded font-mono text-sm">
                                                    {revealedKeys.has(key.id) ? key.key : key.key}
                                                </code>
                                                <button
                                                    onClick={() => toggleKeyVisibility(key.id)}
                                                    className="text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {revealedKeys.has(key.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(key.key)}
                                                    className="text-slate-400 hover:text-white transition-colors"
                                                >
                                                    {copiedKey === key.key ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => revokeAPIKey(key.id)}
                                            className="text-red-500 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-6 text-sm text-slate-400">
                                        <span>Created: {new Date(key.created_at).toLocaleDateString()}</span>
                                        <span>Usage: {key.usage_count} requests</span>
                                        <span className={key.is_active ? 'text-green-500' : 'text-red-500'}>
                                            {key.is_active ? 'Active' : 'Revoked'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Integration Guide */}
                {apiKeys.length > 0 && (
                    <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800">
                        <h2 className="text-2xl font-bold text-white mb-6">How to Integrate</h2>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-white font-semibold mb-3">Step 1: Add the Widget Script</h3>
                                <p className="text-slate-400 mb-3">
                                    Copy and paste this code into the <code className="text-blue-400">&lt;head&gt;</code> section of your website:
                                </p>
                                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800 relative">
                                    <pre className="text-sm text-slate-300 overflow-x-auto">
                                        {getWidgetCode(apiKeys[0].key)}
                                    </pre>
                                    <button
                                        onClick={() => copyToClipboard(getWidgetCode(apiKeys[0].key))}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {copiedKey === getWidgetCode(apiKeys[0].key) ? (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Copy className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-3">Step 2: That&apos;s It!</h3>
                                <p className="text-slate-400">
                                    The widget will automatically monitor all links on your website and warn users before they click on potentially dangerous URLs.
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <h4 className="text-blue-400 font-semibold mb-2">What the Widget Does:</h4>
                                <ul className="text-slate-300 space-y-2 text-sm">
                                    <li>✓ Monitors all link clicks on your website</li>
                                    <li>✓ Checks URLs against SecureGuard&apos;s threat database</li>
                                    <li>✓ Shows warning modal for suspicious links</li>
                                    <li>✓ Blocks known phishing and malware sites</li>
                                    <li>✓ Lightweight (&lt;10KB) and fast</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
