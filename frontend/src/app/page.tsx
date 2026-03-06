'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,

  BookOpen,
  Zap,
  ShieldCheck,
  Cpu,
  Layers,
  ArrowRight,
  Globe,
  FileText,
  Brain
} from 'lucide-react';
import { Generator } from '../components/Generator';
import { QuizView } from '../components/QuizView';
import { ResultsView } from '../components/ResultsView';
import { AIGlow } from '../components/AIGlow';
import { AuthModal } from '../components/AuthModal';
import { MCQ } from '../types/mcq';
import { useEffect } from 'react';

export default function Home() {
  const [view, setView] = useState<'IDLE' | 'QUIZ' | 'RESULTS'>('IDLE');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [results, setResults] = useState<{ finalMcqs: MCQ[], totalTime: number } | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.reload();
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [view]);

  const [quizDuration, setQuizDuration] = useState(10); // Minutes

  const startQuiz = (generatedMcqs: MCQ[], durationMinutes: number) => {
    setMcqs(generatedMcqs);
    setQuizDuration(durationMinutes);
    setView('QUIZ');
  };

  const finishQuiz = (finalMcqs: MCQ[], totalTime: number) => {
    setResults({ finalMcqs, totalTime });
    setView('RESULTS');
  };

  const goHome = () => {
    setView('IDLE');
    setMcqs([]);
    setResults(null);
  };

  return (
    <main className="min-h-screen selection:bg-[#ccff0033] selection:text-[#ccff00]">
      <AIGlow />

      {/* Modern Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 border-b border-white/[0.05] bg-black/60 backdrop-blur-3xl">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-4 cursor-pointer group"
            onClick={goHome}
          >
            <div className="w-10 h-10 bg-[#FFB000] rounded-lg flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 shadow-[0_0_20px_rgba(255,176,0,0.3)]">
              <Brain className="w-6 h-6 text-black fill-current" />
            </div>
            <div className="leading-tight">
              <h1 className="text-xl font-black tracking-tighter text-white">BRAIN<span className="text-[#FFB000]">STACK</span>.AI</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Neural Assessment Engine</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10 text-[13px] font-extrabold uppercase tracking-widest text-gray-200">
            <a href="#features" className="hover:text-[#FFB000] transition-all hover:scale-105">Features</a>
            <a href="#architecture" className="hover:text-[#FFB000] transition-all hover:scale-105">Architecture</a>
            <a href="#about" className="hover:text-[#FFB000] transition-all hover:scale-105">Technology</a>
          </div>


          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Authorized User</span>
                  <span className="text-sm font-black text-white">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors border border-red-500/20 px-3 py-1 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="text-sm font-bold text-gray-200 hover:text-[#FFB000] transition-colors px-4"
                >
                  Log In
                </button>
                <button
                  onClick={() => document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' })}
                  className="premium-button primary"
                >
                  Start Now <ArrowRight className="w-4 h-4 text-black" />
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-40 pb-32">
        <AnimatePresence mode="wait">
          {view === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-32"
            >
              {/* Hero Section */}
              <section className="text-center space-y-10 px-6 max-w-5xl mx-auto">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-[#FFB000]"
                >
                  <Sparkles className="w-3 h-3" /> Live & Active Now
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] text-white">
                  Master Any  Topic.
                  Faster Than Ever.
                </h1>

                <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed">
                  Turn articles, websites, and notes into professional practice tests
                  instantly. Powered by advanced AI for deep learning.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-8 pt-6">
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-200">
                    <div className="w-2 h-2 rounded-full bg-[#FFB000]" /> Instant Scan
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-200">
                    <div className="w-2 h-2 rounded-full bg-[#00f0ff]" /> Smart Questions
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest text-gray-200">
                    <div className="w-2 h-2 rounded-full bg-purple-500" /> Easy Analytics
                  </div>
                </div>
              </section>

              <div id="generator" className="relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#FFB0000a] to-transparent pointer-events-none" />
                <Generator onMCQsGenerated={startQuiz} />
              </div>

              {/* Bento Grid Features */}
              <section id="features" className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-6 scroll-mt-40">

                <div className="md:col-span-2 glass-card p-10 flex flex-col justify-end min-h-[300px] overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-all duration-700">
                    <Layers className="w-40 h-40 text-[#FFB000]" />
                  </div>
                  <h4 className="text-2xl font-black mb-2">Deep Learning</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">Our AI doesn't just scan; it understands. It creates questions that truly test your knowledge and logic.</p>
                </div>

                <div className="glass-card p-10 border-b-2 border-b-[#00f0ff80]">
                  <Globe className="w-8 h-8 text-[#00f0ff] mb-6" />
                  <h4 className="text-xl font-bold mb-2">Website Scanner</h4>
                  <p className="text-sm text-gray-200 leading-relaxed">Paste any article or link. We'll automatically turn it into a test.</p>
                </div>

                <div className="glass-card p-10 border-b-2 border-b-purple-500/50">
                  <FileText className="w-8 h-8 text-purple-400 mb-6" />
                  <h4 className="text-xl font-bold mb-2">PDF & Word</h4>
                  <p className="text-sm text-gray-200 leading-relaxed">Full support for your own notes and document files with high accuracy.</p>
                </div>
              </section>

              {/* Technical Pipeline Visualization */}
              <section id="architecture" className="max-w-[1400px] mx-auto px-8 py-32 border-t border-white/[0.1] scroll-mt-32">
                <div className="text-center mb-20 space-y-4">
                  <h2 className="text-5xl font-black tracking-tighter">The Neural Pipeline.</h2>
                  <p className="text-gray-300 font-medium text-lg max-w-2xl mx-auto">How we transform raw data into high-precision engineering assessments.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                  {/* Pipeline Step 1 */}
                  <div className="glass-card p-8 bg-white/[0.02] border-t-2 border-t-[#FFB000] relative group">
                    <div className="w-12 h-12 rounded-lg bg-[#FFB00011] flex items-center justify-center mb-6">
                      <Globe className="w-6 h-6 text-[#FFB000]" />
                    </div>
                    <h4 className="text-lg font-black mb-3">Ingestion</h4>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                      OCR, JSDOM Parsing, and Multi-format extraction for websites, PDFs, and raw text.
                    </p>
                    <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-white/10" />
                    </div>
                  </div>

                  {/* Pipeline Step 2 */}
                  <div className="glass-card p-8 bg-white/[0.02] border-t-2 border-t-[#00f0ff]">
                    <div className="w-12 h-12 rounded-lg bg-[#00f0ff11] flex items-center justify-center mb-6">
                      <Brain className="w-6 h-6 text-[#00f0ff]" />
                    </div>
                    <h4 className="text-lg font-black mb-3">Contextualizing</h4>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                      Vector embeddings and semantic analysis to find the core logic within the data.
                    </p>
                    <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-white/10" />
                    </div>
                  </div>

                  {/* Pipeline Step 3 */}
                  <div className="glass-card p-8 bg-white/[0.02] border-t-2 border-t-purple-500">
                    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-6">
                      <Cpu className="w-6 h-6 text-purple-400" />
                    </div>
                    <h4 className="text-lg font-black mb-3">Generation</h4>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                      Chain-of-thought prompting via Gemini & GPT-4o to craft distracting yet logical options.
                    </p>
                    <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-white/10" />
                    </div>
                  </div>

                  {/* Pipeline Step 4 */}
                  <div className="glass-card p-8 bg-[#ccff000a] border-t-2 border-t-[#ccff00]">
                    <div className="w-12 h-12 rounded-lg bg-[#ccff0011] flex items-center justify-center mb-6">
                      <ShieldCheck className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <h4 className="text-lg font-black mb-3">Validation</h4>
                    <p className="text-gray-400 text-xs font-bold leading-relaxed uppercase tracking-wider">
                      Self-Correction Loops and Hallucination Checks prior to assessment deployment.
                    </p>
                  </div>
                </div>
              </section>

              {/* About / System Architecture Section */}
              <section id="about" className="max-w-[1400px] mx-auto px-8 py-32 border-t border-white/[0.1] scroll-mt-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[0.4em] text-gray-500">
                      System Architecture
                    </div>
                    <h2 className="text-5xl font-black leading-tight">
                      Built for <br />
                      <span className="text-gradient">Precision & Scale.</span>
                    </h2>
                    <p className="text-gray-200 text-lg font-medium leading-relaxed max-w-xl">
                      BRAINSTACK.AI isn't just a wrapper. It's a multi-layered neural engine designed to solve the "Hallucination Problem" in AI-generated assessments. By combining symbolic parsing with large language models, we ensure academic-grade accuracy.
                    </p>@

                    <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                        <Cpu className="w-5 h-5 text-[#FFB000] mb-3" />
                        <h5 className="text-xs font-black uppercase tracking-widest mb-1">Triple-Stack AI</h5>
                        <p className="text-[10px] text-gray-500 font-bold uppercase transition-colors group-hover:text-gray-300">Gemini + GPT-4o + Llama 3</p>
                      </div>

                      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
                        <Layers className="w-5 h-5 text-[#00f0ff] mb-3" />
                        <h5 className="text-xs font-black uppercase tracking-widest mb-1">Vector Parsing</h5>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Multi-format OCR & Web Scraping</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#FFB00033] to-[#00f0ff33] rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative glass-card p-12 bg-black/80 aspect-square flex flex-col justify-center gap-10">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                          <span>Intelligence Accuracy</span>
                          <span>99.4%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '99.4%' }}
                            transition={{ duration: 1.5, delay: 0.5 }}
                            className="h-full bg-gradient-to-r from-[#FFB000] to-[#00f0ff]"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-gray-600">
                          <span>Processing Latency</span>
                          <span>&lt; 1.2s</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: '30%' }}
                            transition={{ duration: 1.5, delay: 0.7 }}
                            className="h-full bg-gradient-to-r from-purple-500 to-[#FFB000]"
                          />
                        </div>
                      </div>

                      <div className="pt-10 border-t border-white/[0.05] flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-10 h-10 rounded-full bg-black border-2 border-white/10 flex items-center justify-center">
                              <ShieldCheck className="w-5 h-5 text-gray-600" />
                            </div>
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#FFB000]">Security Verified</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}


          {view === 'QUIZ' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <QuizView
                mcqs={mcqs}
                durationMinutes={quizDuration}
                onFinish={finishQuiz}
                onCancel={goHome}
              />
            </motion.div>
          )}

          {view === 'RESULTS' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <ResultsView
                finalMcqs={results.finalMcqs}
                totalTime={results.totalTime}
                onRestart={() => setView('QUIZ')}
                onGoHome={goHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="border-t border-white/[0.05] py-20 px-8 bg-black/40 backdrop-blur-md">


        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Brain className="w-5 h-5 text-gray-700" />
              <h1 className="text-sm font-black uppercase tracking-[0.5em] text-gray-600">BRAINSTACK.AI</h1>
            </div>
            <p className="text-[11px] font-bold text-gray-300 uppercase tracking-widest leading-loose">
              Advanced AI Learning Platform <br />
              Ref: IQ-2026 / Built for Success
            </p>
          </div>

          <div className="flex gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <a href="#about" className="hover:text-[#FFB000] transition-colors">Documentation</a>
            <a href="#architecture" className="hover:text-[#FFB000] transition-colors">Architecture</a>

          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </main>
  );
}
