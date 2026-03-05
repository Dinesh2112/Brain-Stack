"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.openAIService = exports.OpenAIService = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || "",
});
class OpenAIService {
    chunkContent(content, maxLen = 20000) {
        if (content.length <= maxLen)
            return content;
        const half = Math.floor(maxLen / 2);
        const start = content.substring(0, half);
        const end = content.substring(content.length - half);
        return `${start}\n...[truncated]...\n${end}`;
    }
    async generateMCQs(content, count = 5, difficulty = "MEDIUM") {
        const processedContent = this.chunkContent(content);
        const prompt = `
      You are an expert educational AI specialized in ${difficulty} level assessments. 
      Generate exactly ${count} high-quality Multiple Choice Questions (MCQs) in a JSON object with a "questions" key.
      
      Content:
      ${processedContent}
      
      Requirements:
      1. Difficulty: ${difficulty}
      2. Smart Distractors: Options must be plausible and target common misconceptions.
      3. Focus on: Extracting the most critical concepts, definitions, and logic.
      
      JSON Structure:
      {
        "questions": [
          {
            "question": "...",
            "options": ["...", "...", "...", "..."],
            "correctAnswer": "The exact string from options",
            "explanation": "Briefly explain the concept and why the other options are wrong.",
            "difficulty": "${difficulty}",
            "topic": "Specific sub-topic or concept name"
          }
        ]
      }
    `;
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "You are a professional quiz maker AI. Always respond with a valid JSON object." },
                    { role: "user", content: prompt }
                ],
                response_format: { type: "json_object" }
            });
            const text = response.choices[0].message.content || "{}";
            const data = JSON.parse(text);
            if (data.questions && Array.isArray(data.questions)) {
                return data.questions;
            }
            // Fallback: try to find any array in the object
            const firstArray = Object.values(data).find(Array.isArray);
            if (firstArray)
                return firstArray;
            throw new Error("No MCQ array found in AI response");
        }
        catch (error) {
            console.error("OpenAI Error Details:", error);
            throw new Error(`Failed to generate MCQs via OpenAI: ${error.message}`);
        }
    }
}
exports.OpenAIService = OpenAIService;
exports.openAIService = new OpenAIService();
//# sourceMappingURL=openai.service.js.map