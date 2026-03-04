'use client';

import React, { useState } from 'react';
import axios from 'axios';
import {
    FileText,
    Globe,
    Search,
    Upload,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Hash,
    Settings2,
    Trophy,
    ArrowRight,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { MCQ, GeneratorMode } from '../types/mcq';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

let API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001/api/mcq').replace(/\/+$/, '');
if (!API_BASE.endsWith('/api/mcq')) {
    API_BASE += '/api/mcq';
}


interface GeneratorProps {
    onMCQsGenerated: (mcqs: MCQ[]) => void;
}

export const Generator: React.FC<GeneratorProps> = ({ onMCQsGenerated }) => {
    const [mode, setMode] = useState<GeneratorMode>('TOPIC');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Inputs
    const [topic, setTopic] = useState('');
    const [url, setUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [qCount, setQCount] = useState(10);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => setFile(acceptedFiles[0]),
        accept: {
            'application/pdf': ['.pdf'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/msword': ['.doc']
        },
        multiple: false
    });

    const handleGenerate = async () => {
        setLoading(true);
        setError(null);
        try {
            let response;
            if (mode === 'TOPIC') {
                response = await axios.post(`${API_BASE}/generate-topic`, { topic, difficulty, count: qCount });
            } else if (mode === 'URL') {
                response = await axios.post(`${API_BASE}/generate-url`, { url, difficulty, count: qCount });
            } else {
                if (!file) throw new Error("Please upload a file");
                const formData = new FormData();
                formData.append('file', file);
                formData.append('difficulty', difficulty);
                formData.append('count', String(qCount));
                response = await axios.post(`${API_BASE}/generate-file`, formData);
            }

            if (response.data.success) {
                onMCQsGenerated(response.data.mcqs);
            } else {
                throw new Error(response.data.error || "Generation failed");
            }
        } catch (err: any) {
            setError(err?.response?.data?.error || err.message || "An error occurred");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[900px] mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card overflow-hidden border-2 border-white/[0.05]"
            >
                {/* Control Header */}
                <div className="bg-white/[0.03] border-b border-white/[0.05] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black rounded-xl border border-white/10 flex items-center justify-center shadow-inner">
                            <Layout className="w-6 h-6 text-[#FFB000]" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black uppercase tracking-widest leading-none mb-1">Create Test</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Choose your source and difficulty</p>
                        </div>
                    </div>

                    <div className="flex bg-black/80 p-1.5 rounded-xl border border-white/[0.08]">
                        {[
                            { id: 'TOPIC', icon: Search, label: 'Topic' },
                            { id: 'URL', icon: Globe, label: 'Website' },
                            { id: 'FILE', icon: Upload, label: 'File' },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setMode(item.id as GeneratorMode)}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                    mode === item.id
                                        ? "bg-[#FFB000] text-black shadow-[0_0_20px_rgba(255,176,0,0.2)]"
                                        : "text-gray-500 hover:text-white"
                                )}
                            >
                                <item.icon className="w-4 h-4" />
                                <span className="hidden sm:inline">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-10 space-y-10 bg-black/60">
                    {/* Input Area */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            {mode === 'TOPIC' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Subject or Topic</label>
                                        <div className="px-2 py-0.5 rounded bg-[#FFB0001a] border border-[#FFB00033] text-[#FFB000] text-[9px] font-bold tracking-widest">TEXT INPUT</div>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Enter anything (e.g. History, Biology, React...)"
                                        className="premium-input w-full text-lg placeholder:opacity-30 border-2 border-transparent focus:border-[#FFB00033]"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                            )}

                            {mode === 'URL' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Website Address</label>
                                        <div className="px-2 py-0.5 rounded bg-[#00f0ff1a] border border-[#00f0ff33] text-[#00f0ff] text-[9px] font-bold tracking-widest">LINK</div>
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="Paste a link to an article or document..."
                                        className="premium-input w-full text-lg placeholder:opacity-30 border-2 border-transparent focus:border-[#00f0ff33]"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                    />
                                </div>
                            )}

                            {mode === 'FILE' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Upload Document</label>
                                        <div className="px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[9px] font-bold tracking-widest">PDF / DOCX</div>
                                    </div>
                                    <div
                                        {...getRootProps()}
                                        className={cn(
                                            "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer bg-black/40 border-white/10 hover:border-[#FFB00033] hover:bg-black/60",
                                            file ? "border-[#FFB00080] bg-[#FFB00005]" : ""
                                        )}
                                    >
                                        <input {...getInputProps()} />
                                        {file ? (
                                            <div className="flex flex-col items-center gap-4 text-[#FFB000]">
                                                <div className="p-4 rounded-full bg-[#FFB0001a] border border-[#FFB00033]">
                                                    <CheckCircle2 className="w-8 h-8" />
                                                </div>
                                                <span className="text-sm font-black uppercase tracking-widest">{file.name} / Ready</span>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <div className="w-16 h-16 bg-white/[0.05] rounded-full flex items-center justify-center mx-auto border border-white/[0.05]">
                                                    <Upload className="w-8 h-8 text-white" />
                                                </div>
                                                <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Click or Drag File Here</p>
                                                <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Max Size: 10MB</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Operational Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-white/[0.1]">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 flex items-center gap-2">
                                <Settings2 className="w-3 h-3" /> Select Difficulty
                            </label>
                            <select
                                className="premium-input w-full bg-[#0a0a0a] font-black uppercase text-[10px] tracking-widest cursor-pointer border-white/10"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="EASY">Beginner: Basic Recall</option>
                                <option value="MEDIUM">Intermediate: Analysis</option>
                                <option value="HARD">Expert: Deep Logic</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600 flex items-center gap-2">
                                <Hash className="w-3 h-3" /> How many questions?
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    className="premium-input w-full font-black uppercase text-xl tracking-tighter"
                                    min={1} max={50}
                                    value={qCount}
                                    onChange={(e) => setQCount(Number(e.target.value))}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-gray-700 tracking-widest">ITEMS</span>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-red-500/[0.1] border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-[11px] font-black uppercase tracking-widest"
                        >
                            <AlertCircle className="w-4 h-4" />
                            Error: {error}
                        </motion.div>
                    )}

                    <button
                        onClick={handleGenerate}
                        disabled={loading || (mode === 'TOPIC' && !topic) || (mode === 'URL' && !url) || (mode === 'FILE' && !file)}
                        className="premium-button primary w-full flex items-center justify-center gap-4 py-5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin text-black" />
                                <span className="text-black uppercase font-black tracking-[0.2em]">Crafting your test...</span>
                            </>
                        ) : (
                            <>
                                <Trophy className="w-6 h-6 text-black group-hover:rotate-12 transition-transform" />
                                <span className="text-xl uppercase font-black tracking-tighter text-black">Generate Practice Test</span>
                                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-2 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
