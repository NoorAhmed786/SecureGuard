"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    ShieldCheck,
    FileText,
    Bell,
    BarChart3,
    MoreVertical,
    Mail,
    UserPlus
} from 'lucide-react';
import SimulationModal from '@/components/SimulationModal';
import ThreeGlobe from '@/components/ThreeGlobe';

export default function AdminDashboard() {
    const [isSimModalOpen, setIsSimModalOpen] = useState(false);
    const [users, setUsers] = useState([
        { id: 1, name: 'Alice Smith', email: 'alice@company.com', status: 'Active', progress: 85, lastSimulation: 'Pass' },
        { id: 2, name: 'Bob Johnson', email: 'bob@company.com', status: 'Active', progress: 40, lastSimulation: 'Fail' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@company.com', status: 'Pending', progress: 0, lastSimulation: 'N/A' },
    ]);

    const userEmails = users.map(u => u.email);

    const metrics = [
        { label: 'Overall Security Score', value: '78%', sub: '+3% from last month', icon: ShieldCheck, color: 'text-blue-500' },
        { label: 'Total Users', value: '452', sub: '12 new this week', icon: Users, color: 'text-purple-500' },
        { label: 'SIM Failure Rate', value: '14%', sub: '-2% from last month', icon: BarChart3, color: 'text-red-500' },
        { label: 'Pending Training', value: '28', sub: 'Urgent focus needed', icon: FileText, color: 'text-orange-500' },
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto relative min-h-screen">
            <ThreeGlobe />
            <header className="flex justify-between items-center relative z-10">
                <div>
                    <h1 className="text-3xl font-bold text-white">Organization Security Posture</h1>
                    <p className="text-slate-400 mt-2">Managing security for SecureGuard Enterprise.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsSimModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 hover:text-white transition-all"
                    >
                        <Mail size={18} />
                        Blast Simulation
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20">
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {metrics.map((metric, i) => (
                    <motion.div
                        key={metric.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
                    >
                        <div className="flex items-center justify-between">
                            <metric.icon className={`${metric.color}`} size={24} />
                            <span className="text-xl font-bold text-white">{metric.value}</span>
                        </div>
                        <div className="mt-4">
                            <p className="text-sm font-medium text-slate-400">{metric.label}</p>
                            <p className={`text-xs mt-1 ${metric.color.replace('text-', 'text-opacity-70 text-')}`}>{metric.sub}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* User Management Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-xl relative z-10">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
                    <h2 className="text-xl font-bold text-white">User Training Status</h2>
                    <div className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                className="bg-slate-800/50 border border-slate-700 rounded-lg py-1.5 pl-8 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            />
                            <Users size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-slate-500 text-sm border-b border-slate-800">
                                <th className="px-6 py-4 font-semibold">Employee</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold">Training Progress</th>
                                <th className="px-6 py-4 font-semibold">Last Sim</th>
                                <th className="px-6 py-4 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-white font-medium">{user.name}</span>
                                            <span className="text-xs text-slate-500">{user.email}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden min-w-[100px]">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${user.progress}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400">{user.progress}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm ${user.lastSimulation === 'Pass' ? 'text-emerald-400' : user.lastSimulation === 'Fail' ? 'text-red-400' : 'text-slate-500'
                                            }`}>
                                            {user.lastSimulation}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="text-slate-500 hover:text-white transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
