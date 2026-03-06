import { geminiService, MCQ } from './gemini.service';
import { openAIService } from './openai.service';
import { groqService } from './groq.service';
import { mockService } from './mock.service';
import prisma from './prisma.service';
import crypto from 'crypto';

export class GeneratorService {
    private generateCacheKey(content: string, difficulty: string): string {
        // Use SHA-256 for a stable, unique key based on content and difficulty
        const hash = crypto.createHash('sha256').update(content + difficulty).digest('hex');
        return hash;
    }

    async generateMCQs(content: string, count: number = 5, difficulty: string = "MEDIUM"): Promise<MCQ[]> {
        const cacheKey = this.generateCacheKey(content, difficulty);

        // --- LAYER 0: PERSISTENT CACHE (Speed & Cost Optimization) ---
        try {
            const cachedResult = await prisma.cache.findUnique({
                where: { key: cacheKey }
            });

            if (cachedResult && Array.isArray(cachedResult.questions) && cachedResult.questions.length >= count) {
                console.log(`[GENERATOR] Cache Hit: Returning ${count} stored questions for ${cacheKey.substring(0, 8)}`);
                const allQs = cachedResult.questions as unknown as MCQ[];
                return allQs.slice(0, count);
            }
        } catch (cacheErr) {
            console.warn("[GENERATOR] Cache read failed, proceeding to live AI...");
        }

        console.log(`[GENERATOR] Initializing Neural Cascade for: ${content.substring(0, 30)}...`);

        // --- NEURAL CASCADE (Provider Failover Strategy) ---

        // Strategy 1: Gemini (Primary - High Context/Reasoning)
        try {
            console.log("[GENERATOR] Attempting Strategy 1: Google Gemini...");
            const mcqs = await geminiService.generateMCQs(content, count, difficulty as any);
            if (mcqs?.length > 0) return await this.persistAndReturn(cacheKey, difficulty, mcqs);
        } catch (e: any) {
            console.error(`[GENERATOR] Strategy 1 (Gemini) Failed: ${e.message}`);
        }

        // Strategy 2: OpenAI (Secondary - High Reliability)
        try {
            console.log("[GENERATOR] Attempting Strategy 2: OpenAI GPT...");
            const mcqs = await openAIService.generateMCQs(content, count, difficulty);
            if (mcqs?.length > 0) return await this.persistAndReturn(cacheKey, difficulty, mcqs);
        } catch (e: any) {
            console.error(`[GENERATOR] Strategy 2 (OpenAI) Failed: ${e.message}`);
        }

        // Strategy 3: Groq (Tertiary - Fast Fallback)
        try {
            console.log("[GENERATOR] Attempting Strategy 3: Groq Llama...");
            const mcqs = await groqService.generateMCQs(content, count, difficulty);
            if (mcqs?.length > 0) return await this.persistAndReturn(cacheKey, difficulty, mcqs);
        } catch (e: any) {
            console.error(`[GENERATOR] Strategy 3 (Groq) Failed: ${e.message}`);
        }

        // --- LAYER INFINITY: GLOBAL FAILSAFE (Mock Backup) ---
        console.warn("[GENERATOR] CRITICAL: All AI Neural Paths Exhausted. Deploying Mock Engine.");
        return await mockService.getMockMCQs(count);
    }

    private async persistAndReturn(key: string, difficulty: string, mcqs: MCQ[]): Promise<MCQ[]> {
        try {
            await prisma.cache.upsert({
                where: { key },
                update: { questions: mcqs as any },
                create: {
                    key,
                    difficulty,
                    questions: mcqs as any
                }
            });
            console.log(`[GENERATOR] Persistence Successful: Cached ${mcqs.length} questions.`);
        } catch (err) {
            console.warn("[GENERATOR] Persistence Failed: Questions served but not cached.");
        }
        return mcqs;
    }
}

export const generatorService = new GeneratorService();
