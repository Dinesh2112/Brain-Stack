'use client';

import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    Brain,
    Download
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
    Cell,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    CartesianGrid,
    Area,
    AreaChart,
    PieChart,
    Pie,
    Line,
    ComposedChart
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

    // Data for category breakdown - Moved up to fix ReferenceError
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
            raw: `${data.correct}/${data.total}`,
            total: data.total,
            fullMark: 100
        })).sort((a, b) => b.score - a.score);
    }, [finalMcqs]);

    // Trajectory Data (Cumulative Accuracy over time)
    const trajectoryData = useMemo(() => {
        let correctCount = 0;
        return finalMcqs.map((m, i) => {
            if (m.isCorrect) correctCount++;
            return {
                question: `Q${i + 1}`,
                accuracy: Math.round((correctCount / (i + 1)) * 100),
                isCorrect: m.isCorrect ? 100 : 0
            };
        });
    }, [finalMcqs]);

    // Difficulty Data
    const difficultyData = useMemo(() => {
        const map: Record<string, { total: number, correct: number }> = { EASY: { total: 0, correct: 0 }, MEDIUM: { total: 0, correct: 0 }, HARD: { total: 0, correct: 0 } };
        finalMcqs.forEach(m => {
            const diff = m.difficulty || 'MEDIUM';
            if (map[diff]) {
                map[diff].total++;
                if (m.isCorrect) map[diff].correct++;
            }
        });
        return Object.entries(map).filter(([_, d]) => d.total > 0).map(([name, data]) => ({
            name,
            score: Math.round((data.correct / data.total) * 100) || 0,
            total: data.total,
            fill: name === 'EASY' ? '#22c55e' : name === 'MEDIUM' ? '#eab308' : '#ef4444'
        }));
    }, [finalMcqs]);

    // Badges calculation
    const badges = useMemo(() => {
        const list = [];
        if (percentage >= 80) list.push({ icon: Award, label: 'Scholar', color: '#FFB000', desc: 'Score > 80%' });
        if (avgTimePerQ < 15) list.push({ icon: Zap, label: 'Speedster', color: '#00f0ff', desc: '< 15s avg / question' });
        if (percentage === 100) list.push({ icon: Flame, label: 'Perfectionist', color: '#ff4d4d', desc: 'Correct on all questions' });
        if (score >= 3) list.push({ icon: Target, label: 'Consistent', color: '#ccff00', desc: 'Sustained accuracy' });
        return list;
    }, [percentage, avgTimePerQ, score]);

    // Insights State
    const [selectedAuditIdx, setSelectedAuditIdx] = React.useState(0);

    const insights = useMemo(() => {
        const correctTopics = categoryData.filter(d => d.score >= 70).map(d => d.name);
        const weakTopics = categoryData.filter(d => d.score < 50).map(d => d.name);
        return { strengths: correctTopics, weaknesses: weakTopics };
    }, [categoryData]);

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

    return (
        <div className="w-full max-w-7xl mx-auto px-4 pb-48">
            {/* Print Header */}
            <div className="hidden print:flex mb-6 border-b border-gray-300 pb-4 items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">BrainStack.AI Official Report</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Assessment Certificate</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Generated</p>
                    <p className="text-sm font-black">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Header / Gamified Banner */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-16 flex flex-col md:flex-row items-center justify-between gap-8 pt-10 print:mb-8"
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

            {/* BENTO GRID DASHBOARD */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20 print:hidden max-w-7xl mx-auto">
                
                {/* 1. KEY METRICS & GAUGE (Top Left, 4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#09090b] p-8 flex flex-col justify-between relative overflow-hidden h-full min-h-[350px]">
                    <div className="relative z-10 flex flex-col items-center text-center justify-center h-full">
                        <div className="relative w-48 h-48 mb-6">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={[{ value: percentage }, { value: 100 - percentage }]}
                                        cx="50%" cy="50%"
                                        innerRadius={70} outerRadius={90}
                                        startAngle={225} endAngle={-45}
                                        dataKey="value"
                                        stroke="none"
                                        cornerRadius={10}
                                    >
                                        <Cell fill="url(#gaugeGradient)" className="drop-shadow-[0_0_15px_rgba(204,255,0,0.4)]" />
                                        <Cell fill="#ffffff08" />
                                    </Pie>
                                    <defs>
                                        <linearGradient id="gaugeGradient" x1="0" y1="0" x2="1" y2="0">
                                            <stop offset="0%" stopColor="#10b981" />
                                            <stop offset="50%" stopColor="#ccff00" />
                                            <stop offset="100%" stopColor="#22c55e" />
                                        </linearGradient>
                                    </defs>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center mt-2">
                                <span className="text-5xl font-black tracking-tighter text-[#ccff00]">{percentage}%</span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">Accuracy</span>
                            </div>
                        </div>
                        <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-2">Total Score</h4>
                        <p className="text-3xl font-black">{score} <span className="text-lg text-gray-700">/ {finalMcqs.length}</span></p>
                    </div>
                </div>

                {/* 2. TRAJECTORY AREA CHART (Top Right, 8 cols) */}
                <div className="lg:col-span-8 rounded-3xl border border-white/5 bg-[#09090b] p-8 flex flex-col relative overflow-hidden h-full min-h-[350px]">
                    <div className="flex items-center justify-between mb-8 z-10">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
                            <h5 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Assessment Trajectory</h5>
                        </div>
                        <span className="text-[10px] font-semibold text-[#3b82f6] uppercase tracking-widest bg-[#3b82f6]/10 px-3 py-1.5 rounded-full border border-[#3b82f6]/20">Cumulative Accuracy</span>
                    </div>
                    <div className="w-full flex-1 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                                <XAxis dataKey="question" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} dy={10} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                                <Tooltip
                                    cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        padding: '12px 16px',
                                        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                                        backdropFilter: 'blur(8px)'
                                    }}
                                    itemStyle={{ color: '#3b82f6' }}
                                />
                                <Area type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} fill="url(#areaGradient)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 3. DIFFICULTY DONUT CHART (Bottom Left, 4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#09090b] p-8 flex flex-col relative overflow-hidden min-h-[350px]">
                    <div className="flex items-center justify-between mb-4 z-10">
                        <div className="flex items-center gap-3">
                            <Trophy className="w-5 h-5 text-[#f59e0b]" />
                            <h5 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Difficulty Mastery</h5>
                        </div>
                    </div>
                    <div className="w-full flex-1 flex flex-col items-center justify-center relative">
                        {difficultyData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={difficultyData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="total"
                                        stroke="none"
                                        cornerRadius={6}
                                    >
                                        {difficultyData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            borderRadius: '12px',
                                            fontSize: '13px',
                                            fontWeight: '600',
                                            padding: '12px 16px',
                                        }}
                                        formatter={(value: any, name: any, props: any) => [
                                            `${props.payload.score}% Accuracy (${props.payload.total} Qs)`,
                                            name
                                        ]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-xs uppercase tracking-widest">No Difficulty Data</div>
                        )}
                        
                        <div className="flex flex-wrap justify-center gap-4 mt-6">
                            {difficultyData.map(d => (
                                <div key={d.name} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                                    <span className="text-xs font-semibold text-gray-400">{d.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. COMPOSED CHART (Bottom Center, 4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#09090b] p-8 flex flex-col relative overflow-hidden min-h-[350px]">
                    <div className="flex items-center justify-between mb-8 z-10">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-[#a855f7]" />
                            <h5 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Subject Pulse</h5>
                        </div>
                    </div>
                    <div className="w-full flex-1 -ml-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="compBar" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" stopOpacity={0.2} />
                                        <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff0a" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#a1a1aa', fontSize: 10 }} dy={10} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={false} domain={[0, 'dataMax + 2']} />
                                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#a855f7', fontSize: 10 }} dx={10} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                        border: '1px solid rgba(168, 85, 247, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        padding: '12px 16px',
                                    }}
                                />
                                <Bar yAxisId="left" dataKey="total" name="Questions" fill="url(#compBar)" radius={[4, 4, 0, 0]} maxBarSize={30} />
                                <Line yAxisId="right" type="monotone" dataKey="score" name="Accuracy %" stroke="#a855f7" strokeWidth={3} dot={{ r: 4, fill: '#a855f7', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 5. RADAR CHART (Bottom Right, 4 cols) */}
                <div className="lg:col-span-4 rounded-3xl border border-white/5 bg-[#09090b] p-6 flex flex-col overflow-hidden group/radar relative min-h-[350px]">
                    <div className="flex items-center justify-between mb-4 relative z-10 px-2">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-[#f43f5e]" />
                            <h5 className="text-sm font-semibold uppercase tracking-widest text-gray-400">Knowledge Map</h5>
                        </div>
                    </div>

                    <div className="w-full flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={categoryData}>
                                <defs>
                                    <linearGradient id="radarGrad2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.6} />
                                        <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.1} />
                                    </linearGradient>
                                </defs>
                                <PolarGrid stroke="#ffffff15" />
                                <PolarAngleAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 500 }} />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} axisLine={false} tick={false} />
                                <Radar name="Score" dataKey="score" stroke="#f43f5e" strokeWidth={2} fill="url(#radarGrad2)" fillOpacity={1} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{
                                        backgroundColor: 'rgba(9, 9, 11, 0.95)',
                                        border: '1px solid rgba(244, 63, 94, 0.2)',
                                        borderRadius: '12px',
                                        fontSize: '13px',
                                        fontWeight: '600',
                                    }}
                                    itemStyle={{ color: '#f43f5e' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            {/* Performance Insights Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                <div className="glass-card p-10 bg-black/20 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#ccff00]" />
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400">Cognitive Strengths</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {insights.strengths.length > 0 ? insights.strengths.map(s => (
                            <span key={s} className="px-4 py-2 bg-[#ccff0011] text-[#ccff00] text-[12px] font-black uppercase rounded-lg border border-[#ccff0033]">{s}</span>
                        )) : <span className="text-gray-600 text-[12px] font-bold uppercase italic">Collecting more data...</span>}
                    </div>
                </div>
                <div className="glass-card p-10 bg-black/20 border border-white/5 space-y-6">
                    <div className="flex items-center gap-3">
                        <XCircle className="w-5 h-5 text-red-500" />
                        <h4 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-400">Logic Gaps Identified</h4>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        {insights.weaknesses.length > 0 ? insights.weaknesses.map(w => (
                            <span key={w} className="px-4 py-2 bg-red-500/10 text-red-500 text-[12px] font-black uppercase rounded-lg border border-red-500/20">{w}</span>
                        )) : <span className="text-[#FFB000] text-[12px] font-black uppercase bg-[#FFB00011] px-4 py-2 rounded-lg">No Severe Gaps Found</span>}
                    </div>
                </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap gap-6 mb-32 max-w-5xl mx-auto print:hidden">
                <button
                    onClick={onRestart}
                    className="premium-button primary flex-[2] py-8 h-20 min-w-[280px]"
                >
                    <RotateCcw className="w-6 h-6 text-black" />
                    <span className="text-xl font-black uppercase tracking-tighter text-black">Initiate Retake</span>
                </button>
                <button
                    onClick={() => window.print()}
                    className="premium-button secondary flex-1 py-8 h-20 min-w-[200px]"
                >
                    <Download className="w-6 h-6 text-gray-400" />
                    <span className="text-xl font-black uppercase tracking-tighter">Report</span>
                </button>
                <button
                    onClick={onGoHome}
                    className="premium-button secondary flex-1 py-8 h-20 min-w-[200px]"
                >
                    <Home className="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" />
                    <span className="text-xl font-black uppercase tracking-tighter">Exit</span>
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

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Audit Sidebar */}
                    <div className="lg:col-span-1 space-y-2">
                        <div className="mb-6 px-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mb-2">Navigator</h4>
                            <div className="h-1 w-8 bg-[#FFB000]" />
                        </div>
                        <div className="flex lg:flex-col gap-3 overflow-x-auto pb-4 lg:pb-0 px-2">
                            {finalMcqs.map((mcq, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedAuditIdx(idx)}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-5 rounded-xl border-2 transition-all min-w-[140px] lg:min-w-0 hover:bg-white/[0.02]",
                                        selectedAuditIdx === idx
                                            ? "bg-[#FFB00011] border-[#FFB000] text-white shadow-[0_0_20px_rgba(255,176,0,0.1)]"
                                            : "bg-black/40 border-white/[0.05] text-gray-500 hover:border-white/20"
                                    )}
                                >
                                    <span className="text-lg font-black shrink-0">{idx + 1}</span>
                                    <div className="flex-1 text-left min-w-0">
                                        <p className="text-[11px] font-black uppercase truncate tracking-tighter opacity-60 mb-1" title={mcq.topic}>{mcq.topic}</p>
                                        <div className="flex items-center justify-between">
                                            {mcq.isCorrect ? (
                                                <CheckCircle2 className="w-4 h-4 text-[#FFB000]" />
                                            ) : (
                                                <XCircle className="w-4 h-4 text-red-500" />
                                            )}

                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Active Question Environment */}
                    <div className="lg:col-span-3">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedAuditIdx}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className={cn(
                                    "glass-card p-12 bg-black/60 relative overflow-hidden transition-all duration-500",
                                    finalMcqs[selectedAuditIdx].isCorrect ? "border-l-[6px] border-l-[#FFB000]" : "border-l-[6px] border-l-red-500"
                                )}
                            >
                                <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/5">
                                    <div className="flex items-center gap-4">
                                        <span className="text-[10px] font-black text-gray-700 uppercase">Audit ID</span>
                                        <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-sm">
                                            {selectedAuditIdx + 1}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={cn(
                                            "px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase",
                                            finalMcqs[selectedAuditIdx].isCorrect ? "bg-[#FFB00022] text-[#FFB000] border border-[#FFB00033]" : "bg-red-500/10 text-red-500 border border-red-500/20"
                                        )}>
                                            {finalMcqs[selectedAuditIdx].isCorrect ? 'SUCCESSFUL MATCH' : 'LOGIC ERROR'}
                                        </span>
                                    </div>
                                </div>

                                <h3 className="text-3xl font-bold text-white mb-12 leading-tight">
                                    {finalMcqs[selectedAuditIdx].question}
                                </h3>

                                <div className="grid grid-cols-1 gap-4 mb-12">
                                    {finalMcqs[selectedAuditIdx].options.map((opt, oIdx) => {
                                        const isCorrect = opt === finalMcqs[selectedAuditIdx].correctAnswer;
                                        const isUserChoice = opt === finalMcqs[selectedAuditIdx].userAnswer;
                                        return (
                                            <div
                                                key={oIdx}
                                                className={cn(
                                                    "flex items-center gap-5 p-6 rounded-2xl border-2 transition-all duration-300",
                                                    isCorrect ? "bg-[#FFB0000a] border-[#FFB000]] border-2 text-[#FFB000]" :
                                                        isUserChoice ? "bg-red-500/[0.05] border-red-500/30 text-red-400" :
                                                            "bg-black/40 border-white/[0.05] text-gray-600"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black",
                                                    isCorrect ? "bg-[#FFB000] text-black" :
                                                        isUserChoice ? "bg-red-500 text-white" :
                                                            "bg-white/5 text-gray-700"
                                                )}>
                                                    {String.fromCharCode(65 + oIdx)}
                                                </div>
                                                <span className="font-bold text-sm">{opt}</span>
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
                                    <p className="text-gray-400 text-sm leading-relaxed font-medium italic">
                                        "{finalMcqs[selectedAuditIdx].explanation}"
                                    </p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
            {/* Print Footer */}
            <div className="hidden print:block mt-20 border-t border-gray-200 pt-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Verifiable Neural Assessment Payload via BrainStack.AI</p>
                <div className="mt-4 flex justify-center gap-10">
                    <div className="text-center">
                        <div className="w-24 h-0.5 bg-black mb-2" />
                        <p className="text-[8px] font-black uppercase">Candidate Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-24 h-0.5 bg-black mb-2" />
                        <p className="text-[8px] font-black uppercase">System Validation</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
