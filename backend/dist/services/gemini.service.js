"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geminiService = exports.GeminiService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
class GeminiService {
    model;
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }
    chunkContent(content, maxLen = 20000) {
        if (content.length <= maxLen)
            return content;
        // Basic strategy: Take the first part, middle part and end part to get a decent coverage
        const third = Math.floor(maxLen / 3);
        const start = content.substring(0, third);
        const mid = content.substring(content.length / 2 - third / 2, content.length / 2 + third / 2);
        const end = content.substring(content.length - third);
        return `${start}\n...[truncated]...\n${mid}\n...[truncated]...\n${end}`;
    }
    async generateMCQs(content, count = 5, difficulty = "MEDIUM") {
        const processedContent = this.chunkContent(content);
        const prompt = `
      You are an expert educational AI specialized in ${difficulty} level assessments. 
      Generate exactly ${count} high-quality Multiple Choice Questions (MCQs) in JSON format from the following content.
      
      Content:
      ${processedContent}
      
      Requirements:
      1. Difficulty: ${difficulty}
      2. Smart Distractors: Options must be plausible and target common misconceptions.
      3. Focus on: Extracting the most critical concepts, definitions, and logic.
      4. Format: Valid JSON array of objects.
      
      JSON Structure:
      [
        {
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "The exact string from options",
          "explanation": "Briefly explain the concept and why the other options are wrong.",
          "difficulty": "${difficulty}",
          "topic": "Specific sub-topic or concept name"
        }
      ]
    `;
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            // Clean the response (sometimes Gemini adds json blocks)
            const jsonMatch = text.match(/\[.*\]/s);
            if (!jsonMatch) {
                throw new Error("Invalid response format from AI");
            }
            return JSON.parse(jsonMatch[0]);
        }
        catch (error) {
            console.error("Gemini Error Details:", {
                message: error.message,
                stack: error.stack,
                details: error.response?.data || error
            });
            throw new Error(`Failed to generate MCQs: ${error.message}`);
        }
    }
}
exports.GeminiService = GeminiService;
exports.geminiService = new GeminiService();
//# sourceMappingURL=gemini.service.js.map