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

        // --- CACHE LAYER (Performance & Stability) ---
        try {
            const cached = await (prisma as any).cache.findUnique({
                where: { key: cacheKey }
            });

            if (cached && (cached.questions as any).length >= count) {
                console.log(`[GENERATOR] Cache HIT: Serving ${count} MCQs from Database.`);
                return (cached.questions as any).slice(0, count);
            }
        } catch (cacheError) {
            console.warn("[GENERATOR] Cache lookup failed, proceeding to AI layers...", cacheError);
        }

        // AI GENERATION WRAPPER (To store result in cache)
        const runGeneration = async (): Promise<MCQ[]> => {
            // LAYER 1: Gemini (Paid / Primary)
            try {
                console.log(`[GENERATOR] Attempting Gemini (count: ${count}, diff: ${difficulty})`);
                const mcqs = await geminiService.generateMCQs(content, count, difficulty);
                console.log(`[GENERATOR] Gemini success: ${mcqs.length} MCQs`);
                return mcqs;
            } catch (geminiError: any) {
                console.warn(`[GENERATOR] Gemini failed: ${geminiError.message}`);

                // LAYER 2: OpenAI (Paid / Secondary)
                try {
                    const openaiKey = process.env.OPENAI_API_KEY;
                    if (!openaiKey) throw new Error("Missing OpenAI Key");

                    console.log("[GENERATOR] Falling back to OpenAI (gpt-4o-mini)...");
                    const mcqs = await openAIService.generateMCQs(content, count, difficulty);
                    console.log(`[GENERATOR] OpenAI success: ${mcqs.length} MCQs`);
                    return mcqs;
                } catch (openaiError: any) {
                    console.error(`[GENERATOR] OpenAI also failed: ${openaiError.message}`);

                    // LAYER 3: Groq (FREE / 3rd Fallback)
                    try {
                        const groqKey = process.env.GROQ_API_KEY;
                        if (!groqKey) throw new Error("Missing Groq Key");

                        console.log("[GENERATOR] Falling back to Groq (llama-3.3-70b)...");
                        const mcqs = await groqService.generateMCQs(content, count, difficulty);
                        console.log(`[GENERATOR] Groq success: ${mcqs.length} MCQs`);
                        return mcqs;
                    } catch (groqError: any) {
                        console.error(`[GENERATOR] Groq also failed: ${groqError.message}`);

                        // FINAL LAYER: Mock Data (User Experience Safety Net)
                        console.log("[GENERATOR] CRITICAL FAIL: Returning high-quality Mock Data to ensure UX stability.");
                        return await mockService.getMockMCQs(count);
                    }
                }
            }
        };

        const result = await runGeneration();

        // Save result to cache for future users
        if (result && result.length > 0) {
            try {
                await (prisma as any).cache.upsert({
                    where: { key: cacheKey },
                    update: { questions: result as any },
                    create: {
                        key: cacheKey,
                        difficulty: difficulty,
                        questions: result as any
                    }
                });
                console.log(`[GENERATOR] Result cached successfully for key: ${cacheKey}`);
            } catch (err) {
                console.error("[GENERATOR] Failed to save result to cache:", err);
            }
        }

        return result;
    }
}

export const generatorService = new GeneratorService();
