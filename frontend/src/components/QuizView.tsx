'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ArrowLeft,
    Timer,
    Volume2,
    VolumeX,
    Target
} from 'lucide-react';
import { MCQ } from '../types/mcq';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface QuizViewProps {
    mcqs: MCQ[];
    onFinish: (finalMcqs: MCQ[], totalTime: number) => void;
    onCancel: () => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ mcqs, onFinish, onCancel }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(mcqs.length * 60); // 60s per question
    const [isVoiceOn, setIsVoiceOn] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleAnswer = (answer: string) => {
        setAnswers({ ...answers, [currentIndex]: answer });
    };

    const handleNext = () => {
        if (currentIndex < mcqs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        const finalMcqs = mcqs.map((m, idx) => ({
            ...m,
            userAnswer: answers[idx],
            isCorrect: answers[idx] === m.correctAnswer
        }));
        onFinish(finalMcqs, (mcqs.length * 60) - timeLeft);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const speakQuestion = () => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const currentQ = mcqs[currentIndex];
        const text = `Question ${currentIndex + 1}. ${currentQ.question}. Your options are: ${currentQ.options.join(', ')}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    useEffect(() => {
        if (isVoiceOn) {
            speakQuestion();
        }
    }, [currentIndex, isVoiceOn]);

    return (
        <div className="w-full max-w-5xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onCancel}
                        className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black uppercase tracking-widest">Test in Progress</h2>
                            <div className="px-2 py-0.5 rounded bg-[#FFB0001a] border border-[#FFB00033] text-[#FFB000] text-[9px] font-black animate-pulse uppercase tracking-widest">Live</div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Question {currentIndex + 1} of {mcqs.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 bg-[#0a0a0a] border border-white/10 p-2 rounded-2xl">
                    <div className="flex items-center gap-3 px-6 py-3 bg-black/60 rounded-xl border border-white/5">
                        <Timer className={cn("w-5 h-5", timeLeft < 30 ? "text-red-500 animate-pulse" : "text-[#FFB000]")} />
                        <span className={cn("text-xl font-black tabular-nums tracking-tighter", timeLeft < 30 ? "text-red-500" : "text-white")}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsVoiceOn(!isVoiceOn)}
                        className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center transition-all",
                            isVoiceOn ? "bg-[#FFB000] text-black" : "bg-white/5 text-gray-400 hover:text-white"
                        )}
                    >
                        {isVoiceOn ? <Volume2 className="w-5 h-5 text-black" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Progress Vertical Bar */}
                <div className="hidden lg:flex flex-col gap-3">
                    <h3 className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-2 px-2">Progress</h3>
                    {mcqs.map((_, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "h-12 flex items-center gap-4 px-4 rounded-xl border transition-all",
                                idx === currentIndex
                                    ? "bg-[#FFB00005] border-[#FFB00033] text-[#FFB000]"
                                    : answers[idx]
                                        ? "bg-white/[0.02] border-white/10 text-white"
                                        : "bg-transparent border-transparent text-gray-700"
                            )}
                        >
                            <span className="text-[10px] font-black w-4">{idx + 1}</span>
                            <div className={cn("flex-1 h-1 rounded-full", idx === currentIndex ? "bg-[#FFB00033]" : answers[idx] ? "bg-white/[0.05]" : "bg-transparent")}>
                                {idx === currentIndex && <motion.div layoutId="progress" className="h-full bg-[#FFB000]" initial={false} />}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Question Card */}
                <div className="lg:col-span-3 space-y-10">
                    <div className="glass-card p-12 bg-black/80 relative overflow-hidden">
                        <div className="flex items-center gap-3 mb-8">
                            <Target className="w-5 h-5 text-[#FFB000]" />
                            <span className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-500">Practice Question</span>
                        </div>

                        <h3 className="text-3xl font-black tracking-tight text-white mb-12 leading-snug">
                            {mcqs[currentIndex].question}
                        </h3>

                        <div className="grid grid-cols-1 gap-4">
                            {mcqs[currentIndex].options.map((option, idx) => {
                                const isSelected = answers[currentIndex] === option;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        className={cn(
                                            "flex items-center justify-between p-6 rounded-2xl border-2 text-left transition-all duration-300 group",
                                            isSelected
                                                ? "bg-[#FFB0001a] border-[#FFB000] text-white shadow-[0_0_20px_rgba(255,176,0,0.1)]"
                                                : "bg-[#0f1115] border-white/[0.05] text-gray-400 hover:border-white/20 hover:bg-white/[0.02] hover:text-white"
                                        )}
                                    >
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                "w-8 h-8 rounded-lg border-2 flex items-center justify-center text-[10px] font-black uppercase transition-all",
                                                isSelected ? "bg-[#FFB000] border-[#FFB000] text-black" : "border-white/10 group-hover:border-white/30 text-gray-600 group-hover:text-white"
                                            )}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className="font-bold text-lg">{option}</span>
                                        </div>
                                        {isSelected && <CheckCircle2 className="w-6 h-6 text-[#FFB000]" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <div className="text-[10px] font-black uppercase tracking-widest text-gray-700">
                            Keep going! You're doing great.
                        </div>
                        <button
                            onClick={handleNext}
                            disabled={!answers[currentIndex]}
                            className="premium-button primary group h-16 px-12"
                        >
                            <span className="text-xl font-black uppercase tracking-tighter text-black">
                                {currentIndex === mcqs.length - 1 ? 'Finish Test' : 'Next Question'}
                            </span>
                            <ArrowRight className="w-6 h-6 text-black group-hover:translate-x-2 transition-all" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
