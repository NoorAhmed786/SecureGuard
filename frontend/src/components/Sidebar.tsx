"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    ShieldAlert,
    GraduationCap,
    Settings,
    Users,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Search,
    CreditCard,
    Globe,
    Code
} from 'lucide-react';

interface SidebarProps {
    role: 'admin' | 'user' | null;
    userEmail: string | null;
}

export default function Sidebar({ role, userEmail }: SidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', roles: ['user', 'admin'] },
        { name: 'Security Scanner', icon: Search, href: '/scanner', roles: ['user', 'admin'] },
        { name: 'Phishing Alerts', icon: ShieldAlert, href: '/alerts', roles: ['user', 'admin'] },
        { name: 'Security Training', icon: GraduationCap, href: '/training', roles: ['user', 'admin'] },
        { name: 'Widget Integration', icon: Code, href: '/integration', roles: ['user', 'admin'] },
        { name: 'Subscription Plan', icon: CreditCard, href: '/pricing', roles: ['user'] },
        { name: 'Admin Dashboard', icon: Users, href: '/admin/dashboard', roles: ['admin'] },
        { name: 'System Settings', icon: Settings, href: '/settings', roles: ['user', 'admin'] },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    return (
        <motion.div
            animate={{ width: isCollapsed ? '80px' : '280px' }}
            className="h-screen bg-slate-950 border-r border-slate-800 flex flex-col sticky top-0 transition-all duration-300 z-50 overflow-hidden"
        >
            {/* Logo Section */}
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white">S</div>
                        <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            SecureGuard
                        </span>
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-2 hover:bg-slate-900 rounded-lg text-slate-400 transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.filter(item => item.roles.includes(role || 'user')).map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href}>
                            <div className={`
                                flex items-center gap-4 px-4 py-3 rounded-xl transition-all group
                                ${isActive ? 'bg-blue-600/10 text-blue-400' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}
                            `}>
                                <item.icon size={22} className={isActive ? 'text-blue-500' : 'group-hover:text-blue-400'} />
                                {!isCollapsed && (
                                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                                )}
                                {isActive && !isCollapsed && (
                                    <motion.div layoutId="active" className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full" />
                                )}
                            </div>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-slate-800 space-y-4">
                {!isCollapsed && userEmail && (
                    <div className="px-4 py-2 bg-slate-900/50 rounded-xl border border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-500 flex items-center justify-center text-xs font-bold ring-1 ring-blue-500/50">
                                {userEmail[0].toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white truncate">{userEmail}</span>
                                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">{role} Account</span>
                            </div>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all group"
                >
                    <LogOut size={22} className="group-hover:text-red-500" />
                    {!isCollapsed && <span className="font-medium">Sign Out</span>}
                </button>
            </div>
        </motion.div>
    );
}
