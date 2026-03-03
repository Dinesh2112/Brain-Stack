'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail,
    Lock,
    X,
    Github,
    ArrowRight,
    Chrome,
    Shield
} from 'lucide-react';
import axios from 'axios';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
    const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const endpoint = mode === 'LOGIN' ? '/api/auth/login' : '/api/auth/signup';
            const API_BASE = (process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5001').replace('/api/mcq', '');


            const response = await axios.post(`${API_BASE}${endpoint}`, {
                email,
                password,
                ...(mode === 'SIGNUP' && { name })
            });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                onClose();
                window.location.reload();
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: string) => {
        setIsLoading(true);
        setError(null);
        try {
            if (provider === 'Google') {
                const result = await signInWithPopup(auth, googleProvider);
                const user = result.user;

                const loggedInUser = {
                    id: user.uid,
                    email: user.email,
                    name: user.displayName || 'Google User',
                };

                localStorage.setItem('token', await user.getIdToken());
                localStorage.setItem('user', JSON.stringify(loggedInUser));

                onClose();
                window.location.reload();
            } else {
                setError("GitHub integration is pending.");
            }
        } catch (err: any) {
            console.error('Social Login Error:', err);
            setError(err.message || 'Social authentication failed.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="glass-card w-full max-w-md p-10 relative overflow-hidden bg-[#0a0a0a]"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-gray-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-[#FFB000] rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-6 shadow-[0_0_30px_rgba(255,176,0,0.2)]">
                                <Lock className="w-8 h-8 text-black" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">
                                {mode === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                                {isLoading ? 'Verifying Credentials...' : 'Secure Access Protocol'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-[11px] font-bold uppercase tracking-wider flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                onClick={() => handleSocialLogin('GitHub')}
                                disabled={isLoading}
                                className="w-full premium-button secondary justify-center py-4 bg-white/[0.03] border-white/10 hover:bg-white/5"
                            >
                                <Github className="w-5 h-5" />
                                <span>Continue with GitHub</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin('Google')}
                                disabled={isLoading}
                                className="w-full premium-button secondary justify-center py-4 bg-white/[0.03] border-white/10 hover:bg-white/5"
                            >
                                <Chrome className="w-5 h-5" />
                                <span>Continue with Google</span>
                            </button>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="px-4 bg-[#0a0a0a] text-[10px] font-black uppercase text-gray-600 tracking-widest">or use email</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'SIGNUP' && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="premium-input w-full bg-black/60 border-white/10 focus:border-[#FFB00033]"
                                            required={mode === 'SIGNUP'}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="email"
                                            placeholder="name@company.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="premium-input w-full pl-12 bg-black/60 border-white/10 focus:border-[#FFB00033]"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-600 ml-1">Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="premium-input w-full pl-12 bg-black/60 border-white/10 focus:border-[#FFB00033]"
                                            required
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full premium-button primary justify-center py-5 mt-6 shadow-[0_0_20px_rgba(255,176,0,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-black">
                                        {isLoading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            mode === 'LOGIN' ? 'Sign In' : 'Create Account'
                                        )}
                                    </span>
                                </button>
                            </form>

                            <p className="text-center text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-8">
                                {mode === 'LOGIN' ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setMode(mode === 'LOGIN' ? 'SIGNUP' : 'LOGIN')}
                                    className="text-[#FFB000] ml-2 hover:underline"
                                >
                                    {mode === 'LOGIN' ? 'Sign Up' : 'Log In'}
                                </button>
                            </p>
                        </div>
                        <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-center gap-2">
                            <Shield className="w-3 h-3 text-gray-700" />
                            <span className="text-[10px] font-medium text-gray-700 uppercase tracking-widest">Secure Connection</span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
