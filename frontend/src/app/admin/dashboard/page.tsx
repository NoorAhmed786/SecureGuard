"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    ShieldCheck,
    FileText,
    BarChart3,
    MoreVertical,
    Mail,
    UserPlus,
    X,
    Loader2,
    ShieldAlert,
    Clock,
    User
} from 'lucide-react';
import SimulationModal from '@/components/SimulationModal';
import ThreeGlobe from '@/components/ThreeGlobe';
import { CONFIG } from '@/lib/config';

interface UserData {
    id: string;
    email: string;
    full_name: string;
    role: string;
    risk_score: number;
    subscription_status: string;
    created_at: string;
    alert_count: number;
}

interface AlertData {
    id: string;
    user_email: string;
    user_full_name: string;
    sender: string;
    subject: string;
    status: string;
    threat_level: string;
    confidence_score: number;
    detected_at: string;
}

export default function AdminDashboard() {
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [users, setUsers] = useState<UserData[]>([]);
    const [alerts, setAlerts] = useState<AlertData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'alerts'>('users');

    // Form state for adding user
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        role: 'user'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [usersRes, alertsRes] = await Promise.all([
                fetch(`${CONFIG.API_BASE_URL}/api/v1/admin/users`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                }),
                fetch(`${CONFIG.API_BASE_URL}/api/v1/admin/alerts`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
            ]);

            if (usersRes.ok) setUsers(await usersRes.json());
            if (alertsRes.ok) setAlerts(await alertsRes.json());
        } catch (err) {
            console.error("Failed to fetch admin data", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/v1/admin/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) throw new Error('Failed to add user');

            await fetchAllData();
            setIsAddUserModalOpen(false);
            setFormData({ email: '', password: '', full_name: '', role: 'user' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const userEmails = users.map(u => u.email);

    const metrics = [
        { label: 'Overall Security Score', value: '78%', sub: '+3% from last month', icon: ShieldCheck, color: 'text-blue-500' },
        { label: 'Total Users', value: users.length.toString(), sub: 'Actual headcount', icon: Users, color: 'text-purple-500' },
        { label: 'Active Threats', value: alerts.filter(a => a.threat_level === 'high' || a.threat_level === 'critical').length.toString(), sub: 'Requires attention', icon: ShieldAlert, color: 'text-red-500' },
        { label: 'Total Scans', value: alerts.length.toString(), sub: 'Company-wide', icon: FileText, color: 'text-orange-500' },
    ];

    if (isLoading && users.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen">
            <ThreeGlobe />
            <header className="flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-2">Manage your organization's users and security alerts.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsSimModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all font-medium"
                    >
                        <Mail size={18} />
                        Phishing Simulation
                    </button>
                    <button
                        onClick={() => setIsAddUserModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-bold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        <UserPlus size={18} />
                        Add User
                    </button>
                </div>
            </header>

            <SimulationModal
                isOpen={isSimModalOpen}
                onClose={() => setIsSimModalOpen(false)}
                userEmails={userEmails}
            />

            {/* Add User Modal */}
            <AnimatePresence>
                {isAddUserModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md relative shadow-2xl"
                        >
                            <button
                                onClick={() => setIsAddUserModalOpen(false)}
                                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                            <h2 className="text-2xl font-bold text-white mb-6">Add New User</h2>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Create a password"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1.5">User Role</label>
                                        <select
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            <option value="user">Standard User</option>
                                            <option value="admin">Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-6 transition-all flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus size={18} />}
                                    Create User
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl hover:border-slate-700 transition-colors group"
                    >
                        <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg bg-slate-800/50 ${metric.color}`}>
                                <metric.icon size={20} />
                            </div>
                            <span className="text-2xl font-bold text-white tracking-tight">{metric.value}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-semibold text-slate-400">{metric.label}</p>
                            <p className={`text-xs mt-1 font-medium ${metric.color.replace('text-', 'text-opacity-70 text-')}`}>{metric.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Tabs & Content */}
            <div className="space-y-4 relative z-10">
                <div className="flex gap-4 border-b border-slate-800 pb-1">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeTab === 'users' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Users
                        {activeTab === 'users' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                    </button>
                    <button
                        onClick={() => setActiveTab('alerts')}
                        className={`pb-3 px-2 text-sm font-bold transition-all relative ${activeTab === 'alerts' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        Alerts
                        {activeTab === 'alerts' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full" />}
                    </button>
                </div>

                {activeTab === 'users' ? (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4 font-bold">User</th>
                                        <th className="px-6 py-4 font-bold">Role</th>
                                        <th className="px-6 py-4 font-bold text-center">Alert Count</th>
                                        <th className="px-6 py-4 font-bold">Joined</th>
                                        <th className="px-6 py-4 font-bold"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-blue-600/20 group-hover:text-blue-400 transition-colors">
                                                        <User size={14} />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-white font-bold text-sm tracking-tight">{user.full_name}</span>
                                                        <span className="text-[10px] text-slate-500 font-medium">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-sm font-bold ${user.alert_count > 5 ? 'text-red-400' : user.alert_count > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                                                    {user.alert_count}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <Clock size={14} className="opacity-50" />
                                                    <span className="text-xs font-semibold">{new Date(user.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-md">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                                        <th className="px-6 py-4 font-bold">Target User</th>
                                        <th className="px-6 py-4 font-bold">Sender Source</th>
                                        <th className="px-6 py-4 font-bold">Risk Level</th>
                                        <th className="px-6 py-4 font-bold text-center">Confidence</th>
                                        <th className="px-6 py-4 font-bold">Detected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {alerts.map((alert) => (
                                        <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-white font-bold text-sm tracking-tight">{alert.user_full_name}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{alert.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-300 font-semibold text-xs truncate max-w-[200px]">{alert.subject}</span>
                                                    <span className="text-[10px] text-slate-500 font-medium">{alert.sender}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${alert.threat_level === 'critical' || alert.threat_level === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : alert.threat_level === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                                    {alert.threat_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-blue-500 transition-all"
                                                            style={{ width: `${alert.confidence_score * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 font-bold">{(alert.confidence_score * 100).toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-slate-400 font-semibold">
                                                    {new Date(alert.detected_at).toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {alerts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 font-semibold italic text-sm">
                                                No active threats detected.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
