"use client";

import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock, Award, BookOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function TrainingPage() {
    const courses = [
        {
            id: 'security-fundamentals',
            title: 'Security Fundamentals',
            description: 'Learn the core principles of digital security and how to protect yourself online.',
            duration: '45 mins',
            modules: 5,
            level: 'Beginner',
            progress: 100,
            image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800',
        },
        {
            id: 'phishing-advanced',
            title: 'Advanced Phishing Detection',
            description: 'Identify even the most sophisticated social engineering and spearphishing attacks.',
            duration: '60 mins',
            modules: 8,
            level: 'Advanced',
            progress: 40,
            image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
        },
        {
            id: 'password-hygiene',
            title: 'Password Management Mastery',
            description: 'Best practices for creating and maintaining secure passwords across all platforms.',
            duration: '30 mins',
            modules: 3,
            level: 'Beginner',
            progress: 0,
            image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800',
        }
    ];

    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <header className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cybersecurity Academy</h1>
                    <p className="text-slate-400 mt-2">Personalized training to keep you and your organization safe.</p>
                </div>
                <div className="flex gap-4 mb-1">
                    <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-lg flex items-center gap-2">
                        <Award className="text-yellow-500" size={18} />
                        <span className="text-white font-bold text-sm">3 Certifications</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, i) => (
                    <motion.div
                        key={course.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all shadow-xl hover:shadow-blue-500/5"
                    >
                        <div className="h-48 overflow-hidden relative">
                            <Image
                                src={course.image}
                                alt={course.title}
                                width={800}
                                height={450}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                            <div className="absolute top-4 left-4">
                                <span className="px-2 py-1 bg-blue-600 text-[10px] font-bold uppercase rounded text-white tracking-widest">{course.level}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <h3 className="text-xl font-bold text-white line-clamp-1">{course.title}</h3>
                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed">{course.description}</p>

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <Clock size={14} />
                                    {course.duration}
                                </div>
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                    <BookOpen size={14} />
                                    {course.modules} Modules
                                </div>
                            </div>

                            <div className="pt-2">
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-slate-500">{course.progress === 100 ? 'Completed' : 'Course Progress'}</span>
                                    <span className={course.progress === 100 ? 'text-emerald-400 font-bold' : 'text-slate-300 font-bold'}>{course.progress}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${course.progress}%` }}
                                        className={`h-full ${course.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Link href={`/training/${course.id}`}>
                                    <button className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${course.progress === 100
                                        ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                                        : 'bg-white text-black hover:bg-slate-200'
                                        }`}>
                                        {course.progress === 100 ? <CheckCircle2 size={18} /> : <Play size={18} />}
                                        {course.progress === 100 ? 'Review Module' : course.progress > 0 ? 'Resume Course' : 'Start Course'}
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
