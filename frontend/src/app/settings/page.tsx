"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Lock, Bell, Shield, Save, Loader2, Mail } from 'lucide-react';
import ThreeGlobe from '@/components/ThreeGlobe';
import { jwtDecode } from 'jwt-decode';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [user, setUser] = useState({
        email: '...',
        name: '...',
        role: '...'
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Dynamically import to avoid SSR issues if not using "use client" correctly
                // or just use typical import if we are sure it's client-side
                const decoded = jwtDecode(token) as { sub?: string; name?: string; role?: string };
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser({
                    email: decoded.sub || 'No Email Found',
                    name: decoded.name || decoded.sub?.split('@')[0] || 'User',
                    role: decoded.role || 'user'
                });
            } catch (e) {
                console.error("Token decode error:", e);
            }
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        alert("Settings saved successfully!");
    };

    const sections = [
        { id: 'profile', title: 'Profile Information', icon: User },
        { id: 'security', title: 'Security', icon: Lock },
        { id: 'notifications', title: 'Notifications', icon: Bell },
    ];

    const [activeSection, setActiveSection] = useState('profile');

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto relative min-h-screen">
            <ThreeGlobe />

            <header className="relative z-10">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-blue-500" size={32} />
                    Account Settings
                </h1>
                <p className="text-slate-400 mt-2">Manage your personal information, security preferences, and account settings.</p>
            </header>

            <div className="flex flex-col md:flex-row gap-8 relative z-10">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSection === section.id
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                                }`}
                        >
                            <section.icon size={20} />
                            <span className="font-medium">{section.title}</span>
                        </button>
                    ))}
                </aside>

                {/* Content Area */}
                <main className="flex-1">
                    <motion.div
                        key={activeSection}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
                    >
                        {activeSection === 'profile' && (
                            <form onSubmit={handleSave} className="space-y-6">
                                <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={user.name}
                                                onChange={(e) => setUser({ ...user, name: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-12 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            />
                                            <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                value={user.email}
                                                onChange={(e) => setUser({ ...user, email: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-3 pl-12 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                                            />
                                            <Mail className="absolute left-4 top-3.5 text-slate-500" size={18} />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase">Employee ID / Role</label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={user.role}
                                        className="w-full bg-slate-800/30 border border-slate-700/50 rounded-xl p-3 text-slate-500 cursor-not-allowed"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all flex items-center gap-2 mt-8 shadow-lg shadow-blue-600/20"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                    Save Changes
                                </button>
                            </form>
                        )}

                        {activeSection === 'security' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Password & Authentication</h3>
                                        <p className="text-slate-400 text-sm mt-1">Manage your access and security preferences.</p>
                                    </div>
                                    <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg flex items-center gap-2 text-xs font-bold">
                                        <Shield size={14} />
                                        Secured
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <button className="w-full flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all text-left">
                                        <div>
                                            <p className="font-bold text-white">Change Password</p>
                                            <p className="text-xs text-slate-500">Last updated 2 months ago</p>
                                        </div>
                                        <ChevronRight className="text-slate-600" size={20} />
                                    </button>
                                    <button className="w-full flex items-center justify-between p-4 bg-slate-800/30 border border-slate-700/50 rounded-2xl hover:bg-slate-800 transition-all text-left">
                                        <div>
                                            <p className="font-bold text-white">Two-Factor Authentication</p>
                                            <p className="text-xs text-emerald-600">Enabled (SMS + App)</p>
                                        </div>
                                        <ChevronRight className="text-slate-600" size={20} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold text-white">Notification Preferences</h3>
                                <div className="space-y-6">
                                    {[
                                        { label: 'Security Alerts', desc: 'Notify me of high-risk phishing attempts.', active: true },
                                        { label: 'System Updates', desc: 'Alerts for platform maintenance and updates.', active: true },
                                        { label: 'Weekly Reports', desc: 'Summary of security metrics and incident counts.', active: false },
                                    ].map((pref) => (
                                        <div key={pref.label} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-white">{pref.label}</p>
                                                <p className="text-sm text-slate-500">{pref.desc}</p>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${pref.active ? 'bg-blue-600' : 'bg-slate-700'}`}>
                                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${pref.active ? 'translate-x-6' : ''}`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}

// Helper for ChevronRight since it was missing in original imports
const ChevronRight = ({ className, size }: { className?: string, size?: number }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);
