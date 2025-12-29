"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { loginRequest, apiRequest } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [isLogin, setIsLogin] = useState(true);
    const [fullName, setFullName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (isLogin) {
                // Login Logic
                const formData = new URLSearchParams();
                formData.append('username', email);
                formData.append('password', password);

                const data: any = await loginRequest(formData);
                localStorage.setItem('token', data.access_token);

                // Decode role for redirection
                try {
                    const { jwtDecode }: any = await import('jwt-decode');
                    const decoded: any = jwtDecode(data.access_token);
                    const role = decoded.role || 'user';

                    // Clear fields before redirect
                    setEmail('');
                    setPassword('');

                    // Role-based redirect
                    const searchParams = new URLSearchParams(window.location.search);
                    const redirectPath = searchParams.get('redirect');

                    if (redirectPath) {
                        window.location.href = redirectPath;
                    } else if (role === 'admin') {
                        window.location.href = '/admin/dashboard';
                    } else {
                        window.location.href = '/dashboard';
                    }
                } catch (e) {
                    const searchParams = new URLSearchParams(window.location.search);
                    const redirectPath = searchParams.get('redirect');
                    window.location.href = redirectPath || '/dashboard';
                }
            } else {
                // Register Logic
                await apiRequest('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, password, full_name: fullName }),
                });

                alert('Registration successful! Please login.');
                // Clear fields
                setEmail('');
                setPassword('');
                setFullName('');
                setIsLogin(true);
            }
        } catch (error: any) {
            console.error("Auth Error:", error);
            alert(error.message || "An authentication error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10"
            >
                <div className="text-center mb-8">
                    <Link href="/" className="inline-block mb-8 text-sm text-slate-400 hover:text-white transition-colors">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-slate-400">
                        {isLogin ? 'Sign in to your SecureGuard account' : 'Get started with SecureGuard AI'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                required={!isLogin}
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="name@company.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] flex items-center justify-center ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                            }`}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                processing...
                            </>
                        ) : (
                            isLogin ? 'Sign In' : 'Create Account'
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-slate-400">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-400 hover:text-blue-300 font-medium focus:outline-none"
                    >
                        {isLogin ? 'Sign Up' : 'Log In'}
                    </button>
                </div>
            </motion.div>
        </main>
    );
}
