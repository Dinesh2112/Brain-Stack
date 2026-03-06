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
    PolarRadiusAxis
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
            fullMark: 100
        })).sort((a, b) => b.score - a.score);
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
            <div className="hidden print:block mb-10 border-b-2 border-black pb-6">
                <h1 className="text-3xl font-black uppercase tracking-tighter">BrainStack.AI Official Report</h1>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-600">Generated: {new Date().toLocaleDateString()} | Assessment Certificate</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-20 print:hidden">
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

                {/* Efficiency Section */}
                <div className="lg:col-span-8 flex flex-col gap-8">
                    <div className="glass-card p-12 bg-[#0a0a0a] border-l-4 border-l-[#00f0ff] flex flex-col justify-between overflow-hidden relative group/eff hover:border-l-white transition-all h-full">
                        <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover/eff:opacity-10 transition-opacity">
                            <Clock className="w-48 h-48 text-[#00f0ff]" />
                        </div>
                        <div className="relative">
                            <div className="flex items-center gap-3 mb-8">
                                <Clock className="w-5 h-5 text-[#00f0ff] animate-pulse" />
                                <h5 className="text-[12px] font-black uppercase tracking-[0.4em] text-gray-500">Efficiency Audit</h5>
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-black text-[#00f0ff] uppercase tracking-widest opacity-50">Time Taken</p>
                                <p className="text-5xl font-black tracking-tighter">
                                    {Math.floor(Math.max(0, totalTime) / 60)}<span className="text-xl text-gray-700">m</span> {Math.max(0, totalTime) % 60}<span className="text-xl text-gray-700">s</span>
                                </p>
                            </div>
                            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Session Persistence Verified
                            </p>
                        </div>
                        <div className="mt-12 pt-8 border-t border-white/[0.05]">
                            <div className="flex justify-between items-center mb-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block leading-none">Avg Pulse</span>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block opacity-50">Neural Response Time</span>
                                </div>
                                <span className="text-xl font-black text-[#00f0ff] tracking-tighter uppercase">{avgTimePerQ.toFixed(1)}s <span className="text-xs opacity-50">/ Q</span></span>
                            </div>
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((avgTimePerQ / 45) * 100, 100)}%` }}
                                    className="h-full bg-gradient-to-r from-[#00f0ff22] to-[#00f0ff]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Knowledge Map - NOW FULL WIDTH (col-span-12) FOR MASSIVE VISIBILITY */}
                <div className="lg:col-span-12 glass-card p-16 bg-[#0a0a0a] border-l-4 border-l-purple-500 flex flex-col overflow-hidden group/radar relative min-h-[700px]">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover/radar:opacity-10 transition-opacity">
                        <Target className="w-64 h-64 text-purple-500 rotate-12" />
                    </div>
                    <div className="flex items-center justify-between mb-16 relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <h5 className="text-[16px] font-black uppercase tracking-[0.5em] text-gray-300">Knowledge Map Breakdown</h5>
                        </div>
                    </div>

                    <div className="w-full flex-1 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height={550}>
                            <RadarChart
                                cx="50%"
                                cy="50%"
                                outerRadius="70%"
                                data={categoryData}
                                margin={{ top: 20, right: 150, bottom: 20, left: 150 }}
                            >
                                <PolarGrid stroke="#ffffff0a" />
                                <PolarAngleAxis
                                    dataKey="name"
                                    tick={{ fill: '#ffffffcc', fontSize: 13, fontWeight: 900 }}
                                />
                                <PolarRadiusAxis
                                    angle={90}
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tick={false}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#FFB000"
                                    fill="#FFB000"
                                    fillOpacity={0.4}
                                    strokeWidth={3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="mb-20 print:hidden">
                {/* Category Analysis (Visual) */}
                <div className="glass-card p-10 bg-[#0a0a0a] border-l-4 border-l-[#ccff00] flex flex-col overflow-hidden group/chart">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-5 h-5 text-[#ccff00] group-hover/chart:scale-110 transition-transform" />
                            <h5 className="text-[14px] font-black uppercase tracking-[0.4em] text-gray-400">Subject Pulse</h5>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-black text-[#ccff00] uppercase tracking-widest bg-[#ccff0011] px-4 py-2 rounded-full border border-[#ccff0022]">Top Performance</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>

                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={450}>
                            <BarChart
                                data={categoryData}
                                layout="vertical"
                                margin={{ top: 20, right: 80, left: 20, bottom: 20 }}
                                barSize={32}
                            >
                                <XAxis type="number" hide domain={[0, 100]} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={160}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{
                                        fill: '#ffffffbb',
                                        fontSize: '12px',
                                        fontWeight: '900',
                                        textAnchor: 'end'
                                    }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(204, 255, 0, 0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#000',
                                        border: '1px solid #ccff0033',
                                        borderRadius: '16px',
                                        fontSize: '13px',
                                        fontWeight: '900',
                                        padding: '16px',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                    }}
                                    itemStyle={{ color: '#ccff00' }}
                                />
                                <Bar
                                    dataKey="score"
                                    radius={[0, 16, 16, 0]}
                                    label={{
                                        position: 'right',
                                        fill: '#ffffff',
                                        fontSize: 13,
                                        fontWeight: 900,
                                        formatter: (val: any) => `${val}%`,
                                        offset: 20
                                    }}
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.score >= 80 ? '#ccff00' : entry.score >= 50 ? '#FFB000' : '#ff4d4d'}
                                            className="transition-all duration-700 hover:opacity-90 shadow-[0_0_15px_rgba(204,255,0,0.2)]"
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
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
                                    <span className="text-lg font-black">{idx + 1}</span>
                                    <div className="flex-1 text-left">
                                        <p className="text-[11px] font-black uppercase truncate tracking-tighter opacity-60 mb-1">{mcq.topic}</p>
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
