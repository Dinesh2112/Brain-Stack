'use client';

import React, { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Clock,
    RotateCcw,
    Home,
    CheckCircle2,
    XCircle,
    TrendingUp,
    Award,
    Activity,
    FileText,
    Zap,
    Target,
    Trophy,
    Flame,
    Brain
} from 'lucide-react';

import { MCQ } from '../types/mcq';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import confetti from 'canvas-confetti';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ResultsViewProps {
    finalMcqs: MCQ[];
    totalTime: number;
    onRestart: () => void;
    onGoHome: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ finalMcqs, totalTime, onRestart, onGoHome }) => {
    const score = useMemo(() => finalMcqs.filter(m => m.isCorrect).length, [finalMcqs]);
    const percentage = useMemo(() => Math.round((score / finalMcqs.length) * 100), [score, finalMcqs]);
    const avgTimePerQ = useMemo(() => totalTime / finalMcqs.length, [totalTime, finalMcqs]);

    // Badges calculation
    const badges = useMemo(() => {
        const list = [];
        if (percentage >= 80) list.push({ icon: Award, label: 'Scholar', color: '#FFB000', desc: 'Score > 80%' });
        if (avgTimePerQ < 15) list.push({ icon: Zap, label: 'Speedster', color: '#00f0ff', desc: '< 15s avg / question' });
        if (percentage === 100) list.push({ icon: Flame, label: 'Perfectionist', color: '#ff4d4d', desc: 'Correct on all questions' });
        if (score >= 3) list.push({ icon: Target, label: 'Consistent', color: '#ccff00', desc: 'Sustained accuracy' });
        return list;
    }, [percentage, avgTimePerQ, score]);

    useEffect(() => {
        if (percentage >= 70) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFB000', '#00f0ff', '#ffffff']
            });
        }
    }, [percentage]);

    // Data for category breakdown
    const categoryData = useMemo(() => {
        const map: Record<string, { total: number, correct: number }> = {};
        finalMcqs.forEach(m => {
            const topic = m.topic || 'General';
            if (!map[topic]) map[topic] = { total: 0, correct: 0 };
            map[topic].total++;
            if (m.isCorrect) map[topic].correct++;
        });
        return Object.entries(map).map(([name, data]) => ({
            name,
            score: Math.round((data.correct / data.total) * 100),
            raw: `${data.correct}/${data.total}`
        })).sort((a, b) => b.score - a.score);
    }, [finalMcqs]);

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-48">
            {/* Header / Gamified Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-10"
            >
                <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-[#FFB000] rounded-2xl flex items-center justify-center border border-white/10 relative shadow-[0_0_30px_rgba(255,176,0,0.2)] overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#FFB00022] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Brain className="w-8 h-8 text-black" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-white">BrainStack <span className="text-[#FFB000]">Verdict</span></h1>
                        <p className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                            Assessment Cycle <span className="w-1 h-1 rounded-full bg-[#FFB000]" /> Verified Result
                        </p>
                    </div>

                </div>

                <div className="flex -space-x-4">
                    {badges.map((badge, bIdx) => (
                        <div
                            key={bIdx}
                            className="w-12 h-12 rounded-full border-2 border-black bg-[#1a1a1a] flex items-center justify-center group relative cursor-help transition-transform hover:scale-110"
                            style={{ borderColor: badge.color }}
                        >
                            <badge.icon className="w-5 h-5" style={{ color: badge.color }} />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 bg-black border border-white/10 rounded-xl hidden group-hover:block w-32 z-50 shadow-2xl">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1" style={{ color: badge.color }}>{badge.label}</p>
                                <p className="text-[9px] text-gray-500 font-bold uppercase">{badge.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20">
                {/* Score Focus */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-4 glass-card p-12 bg-black/40 flex flex-col items-center justify-center text-center relative overflow-hidden h-full min-h-[450px]"
                >
                    <div className="absolute top-0 left-0 p-8 opacity-[0.02]">
                        <Activity className="w-64 h-64 text-[#FFB000]" />
                    </div>

                    <div className="relative mb-12">
                        <div className="w-60 h-60 rounded-full border-[10px] border-white/[0.02] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 1, type: "spring" }}
                                className="w-full h-full rounded-full bg-gradient-to-br from-[#1a1a1a] to-black border border-white/5 flex flex-col items-center justify-center shadow-2xl"
                            >
                                <span className="text-7xl font-black tracking-tighter text-[#FFB000]">{percentage}<span className="text-3xl opacity-50">%</span></span>
                                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-600 mt-2">Accuracy</span>
                            </motion.div>
                        </div>
                        {/* Status Chip */}
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-black border border-white/10 rounded-full shadow-2xl backdrop-blur-xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB000]">
                                {percentage >= 90 ? 'Master' : percentage >= 70 ? 'Expert' : 'Practitioner'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h4 className="text-sm font-black uppercase tracking-widest text-gray-400">Total Score</h4>
                        <p className="text-4xl font-black">{score}<span className="text-xl text-gray-700"> / {finalMcqs.length}</span></p>
                    </div>
                </motion.div>

                {/* Sub-Metric Grid */}
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                    {/* Time Metric */}
                    <div className="glass-card p-10 bg-[#0a0a0a] border-l-4 border-l-[#00f0ff] flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Clock className="w-5 h-5 text-[#00f0ff]" />
                                <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Efficiency</h5>
                            </div>
                            <p className="text-4xl font-black mb-1">{Math.floor(totalTime / 60)}m {totalTime % 60}s</p>
                            <p className="text-[10px] text-gray-700 font-bold uppercase tracking-widest">Spent on Neural Processing</p>
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/[0.05]">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Avg Pulse</span>
                                <span className="text-[10px] font-black text-[#00f0ff] uppercase tracking-widest">{avgTimePerQ.toFixed(1)}s / Q</span>
                            </div>
                            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((avgTimePerQ / 60) * 100, 100)}%` }}
                                    className="h-full bg-[#00f0ff]"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category Analysis (Visual) */}
                    <div className="glass-card p-10 bg-[#0a0a0a] border-l-4 border-l-[#ccff00] flex flex-col h-full overflow-hidden">
                        <div className="flex items-center gap-3 mb-6">
                            <TrendingUp className="w-5 h-5 text-[#ccff00]" />
                            <h5 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500">Subject Pulse</h5>
                        </div>

                        <div className="flex-1 w-full min-h-[200px] -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical">
                                    <XAxis type="number" hide domain={[0, 100]} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        width={80}
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#444', fontSize: '9px', fontWeight: '900' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', fontSize: '10px' }}
                                    />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.score >= 80 ? '#ccff00' : entry.score >= 50 ? '#FFB000' : '#ff4d4d'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-6 mb-32 max-w-4xl mx-auto">
                <button
                    onClick={onRestart}
                    className="premium-button primary flex-1 py-8 h-20 min-w-[280px]"
                >
                    <RotateCcw className="w-6 h-6 text-black" />
                    <span className="text-xl font-black uppercase tracking-tighter text-black">Initiate Retake</span>
                </button>
                <button
                    onClick={onGoHome}
                    className="premium-button secondary flex-1 py-8 h-20 min-w-[280px]"
                >
                    <Home className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-xl font-black uppercase tracking-tighter">Exit Engine</span>
                </button>
            </div>

            {/* Detailed Questions / Review Environment */}
            <div className="space-y-12">
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-10">
                    <div>
                        <h3 className="text-3xl font-black uppercase tracking-tight mb-1">Deep Review</h3>
                        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.4em]">Audit Trail / Response Validation</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Correct</span>
                            <span className="text-lg font-black text-[#FFB000]">{score}</span>
                        </div>
                        <div className="flex flex-col items-end pl-6 border-l border-white/5">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Errors</span>
                            <span className="text-lg font-black text-red-500">{finalMcqs.length - score}</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    {finalMcqs.map((mcq, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.98 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true, margin: "-100px" }}
                            className={cn(
                                "glass-card p-12 bg-black/60 relative overflow-hidden transition-all duration-500 hover:border-white/20",
                                mcq.isCorrect ? "border-l-[6px] border-l-[#FFB000]" : "border-l-[6px] border-l-red-500"
                            )}
                        >
                            {/* Decorative Watermark */}
                            <div className="absolute -top-10 -right-10 opacity-[0.01] pointer-events-none">
                                {mcq.isCorrect ? <CheckCircle2 className="w-64 h-64" /> : <XCircle className="w-64 h-64" />}
                            </div>

                            <div className="flex items-start gap-10 mb-12">
                                <div className="hidden sm:flex flex-col items-center">
                                    <span className="text-[10px] font-black text-gray-700 uppercase mb-2">UID</span>
                                    <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-lg">
                                        {idx + 1}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[8px] font-black tracking-widest uppercase",
                                            mcq.isCorrect ? "bg-[#FFB00022] text-[#FFB000]" : "bg-red-500/10 text-red-500"
                                        )}>
                                            {mcq.isCorrect ? 'VALID' : 'FAILED'}
                                        </span>
                                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">{mcq.topic}</span>
                                    </div>
                                    <p className="text-2xl font-bold text-white leading-tight z-10">{mcq.question}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12 relative z-10">
                                {mcq.options.map((opt, oIdx) => {
                                    const isCorrect = opt === mcq.correctAnswer;
                                    const isUserChoice = opt === mcq.userAnswer;
                                    return (
                                        <div
                                            key={oIdx}
                                            className={cn(
                                                "flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-300",
                                                isCorrect ? "bg-[#FFB0000a] border-[#FFB00033] text-[#FFB000] scale-[1.02]" :
                                                    isUserChoice ? "bg-red-500/[0.03] border-red-500/20 text-red-400 opacity-80" :
                                                        "bg-black/40 border-white/[0.02] text-gray-600 opacity-60"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-colors",
                                                isCorrect ? "bg-[#FFB000] text-black" :
                                                    isUserChoice ? "bg-red-500 text-white" :
                                                        "bg-white/5 text-gray-700"
                                            )}>
                                                {String.fromCharCode(65 + oIdx)}
                                            </div>
                                            <span className="font-bold text-sm tracking-tight">{opt}</span>
                                            <div className="ml-auto">
                                                {isCorrect && <CheckCircle2 className="w-5 h-5 text-[#FFB000]" />}
                                                {!isCorrect && isUserChoice && <XCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-[#1a1a1a44] border-t border-white/[0.05] -mx-12 -mb-12 p-12 mt-12 group/explanation">
                                <div className="flex items-center gap-3 mb-4">
                                    <Target className="w-4 h-4 text-[#FFB000] opacity-50 group-hover/explanation:opacity-100 transition-opacity" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-600 group-hover/explanation:text-[#FFB000] transition-colors">Analytical Breakdown</span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium">
                                    {mcq.explanation}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};
