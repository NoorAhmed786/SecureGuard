"use client";

import ThreeGlobe from '@/components/ThreeGlobe';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Zap, ArrowRight, Eye } from 'lucide-react';

export default function Home() {
  return (
    <main className="h-screen w-full bg-slate-950 text-white relative overflow-hidden flex flex-col">
      <ThreeGlobe />

      {/* Background Elements (Same as Login Page) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col h-full container mx-auto px-4 md:px-8">
        {/* Header - Compact */}
        <header className="py-4 flex justify-between items-center bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-xl mt-4 px-6">
          <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            SecureGuard AI
          </div>
          <nav className="hidden md:flex gap-6 items-center text-xs font-medium text-slate-400">
            <Link href="/services" className="hover:text-blue-400 transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-blue-400 transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-blue-400 transition-colors">Contact</Link>
            <Link href="/login">
              <button className="px-5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-500 transition-all shadow-[0_0_10px_rgba(37,99,235,0.4)] text-white font-semibold">
                Login
              </button>
            </Link>
          </nav>
        </header>

        {/* Professional Hero Section - Centered and Responsive */}
        <section className="flex-1 flex flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl space-y-6 md:space-y-8"
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold"
            >
              <Zap className="w-3.5 h-3.5" />
              Next-Gen Cybersecurity Powered by AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]"
            >
              Protect What <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-emerald-400">
                Matters Most
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed"
            >
              Enterprise-grade security simplified. SecureGuard AI provides real-time phishing defense, advanced security scanning, and interactive training.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 justify-center pt-2"
            >
              <Link href="/scanner">
                <button className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-emerald-600 font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center gap-2.5 transform hover:scale-[1.03] active:scale-95 text-sm">
                  Start Free Scan
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/demo">
                <button className="px-7 py-3.5 rounded-xl border border-slate-700 bg-slate-900/40 backdrop-blur-sm hover:bg-slate-800 transition-all flex items-center gap-2.5 transform hover:scale-[1.03] active:scale-95 text-sm">
                  View Live Demo
                  <Eye className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>

            {/* Live Indicator - Subtle */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex items-center justify-center gap-2.5 pt-4"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-slate-500 text-[13px] font-medium">Monitoring 1,200+ systems in real-time</span>
            </motion.div>
          </motion.div>
        </section>

        {/* Compact Footer */}
        <footer className="py-6 border-t border-slate-800/30 flex flex-col md:flex-row justify-between items-center gap-4 text-[12px] text-slate-500">
          <div>© 2024 SecureGuard AI. Intelligent Security Solutions.</div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-blue-400 transition-all">Privacy</Link>
            <Link href="/terms" className="hover:text-blue-400 transition-all">Terms</Link>
            <Link href="/status" className="hover:text-blue-400 transition-all">Status</Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
