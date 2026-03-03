'use client';

import React from 'react';
import { motion } from 'framer-motion';

export const AIGlow: React.FC = () => {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
            {/* Solid Amber Glow - More focused and premium */}
            <motion.div
                animate={{
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.05, 1],
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 w-[60%] h-[60%] bg-[#FFB000] blur-[200px] opacity-[0.1]"
            />

            <motion.div
                animate={{
                    opacity: [0.08, 0.15, 0.08],
                    translateY: [0, -30, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-20 -left-20 w-[60%] h-[60%] bg-[#f59e0b] blur-[220px] opacity-[0.1]"
            />

            {/* Faint Grid Overlay with Very Low Opacity */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />
        </div>
    );
};
