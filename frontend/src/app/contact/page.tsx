"use client";

import ThreeGlobe from '@/components/ThreeGlobe';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white relative overflow-hidden">
      <ThreeGlobe />

      <div className="relative z-10 container mx-auto px-4 py-16">
        <header className="flex justify-between items-center mb-20">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            SecureGuard AI
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start max-w-6xl mx-auto">
          <div className="space-y-8">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-bold"
            >
              Let&apos;s Talk <span className="text-blue-500">Security</span>
            </motion.h1>
            <p className="text-slate-400 text-lg max-w-md">
              Have questions about our AI models or need a custom enterprise solution? Our team of security experts is here to help.
            </p>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                  <Mail size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email Us</p>
                  <p className="font-medium">contact@secureguard.ai</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                  <MapPin size={24} />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Global HQ</p>
                  <p className="font-medium">Cyber Hub, Tech City, 10101</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl"
          >
            <form className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">First Name</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="Jane" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400">Last Name</label>
                  <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Email Address</label>
                <input type="email" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="jane@company.com" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Message</label>
                <textarea rows={4} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-sans" placeholder="Tell us about your security needs..." />
              </div>
              <button disabled className="w-full py-4 bg-blue-600 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all cursor-not-allowed opacity-70">
                <Send size={18} />
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
