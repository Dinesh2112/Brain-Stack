"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatorService = exports.GeneratorService = void 0;
const gemini_service_1 = require("./gemini.service");
const openai_service_1 = require("./openai.service");
const groq_service_1 = require("./groq.service");
const mock_service_1 = require("./mock.service");
class GeneratorService {
    async generateMCQs(content, count = 5, difficulty = "MEDIUM") {
        // LAYER 1: Gemini (Paid / Primary)
        try {
            console.log(`[GENERATOR] Attempting Gemini (count: ${count}, diff: ${difficulty})`);
            const mcqs = await gemini_service_1.geminiService.generateMCQs(content, count, difficulty);
            console.log(`[GENERATOR] Gemini success: ${mcqs.length} MCQs`);
            return mcqs;
        }
        catch (geminiError) {
            console.warn(`[GENERATOR] Gemini failed: ${geminiError.message}`);
            // LAYER 2: OpenAI (Paid / Secondary)
            try {
                const openaiKey = process.env.OPENAI_API_KEY;
                if (!openaiKey)
                    throw new Error("Missing OpenAI Key");
                console.log("[GENERATOR] Falling back to OpenAI (gpt-4o-mini)...");
                const mcqs = await openai_service_1.openAIService.generateMCQs(content, count, difficulty);
                console.log(`[GENERATOR] OpenAI success: ${mcqs.length} MCQs`);
                return mcqs;
            }
            catch (openaiError) {
                console.error(`[GENERATOR] OpenAI also failed: ${openaiError.message}`);
                // LAYER 3: Groq (FREE / 3rd Fallback)
                try {
                    const groqKey = process.env.GROQ_API_KEY;
                    if (!groqKey)
                        throw new Error("Missing Groq Key");
                    console.log("[GENERATOR] Falling back to Groq (llama-3.3-70b)...");
                    const mcqs = await groq_service_1.groqService.generateMCQs(content, count, difficulty);
                    console.log(`[GENERATOR] Groq success: ${mcqs.length} MCQs`);
                    return mcqs;
                }
                catch (groqError) {
                    console.error(`[GENERATOR] Groq also failed: ${groqError.message}`);
                    // FINAL LAYER: Mock Data (User Experience Safety Net)
                    console.log("[GENERATOR] CRITICAL FAIL: Returning high-quality Mock Data to ensure UX stability.");
                    return await mock_service_1.mockService.getMockMCQs(count);
                }
            }
        }
    }
}
exports.GeneratorService = GeneratorService;
exports.generatorService = new GeneratorService();
//# sourceMappingURL=generator.service.js.map