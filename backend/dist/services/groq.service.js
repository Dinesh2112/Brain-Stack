"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqService = exports.GroqService = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const groq = new groq_sdk_1.default({
    apiKey: process.env.GROQ_API_KEY || "",
});
class GroqService {
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
            You are an expert academic assessment AI.
            Generate exactly ${count} multiple choice questions (MCQs) from the provided content.
            The format MUST be a valid JSON object with a key "questions" containing an array of MCQs.

            Difficulty level: ${difficulty}
            
            Content:
            ${processedContent}

            Each MCQ should follow this structure exactly:
            {
                "question": "The question text",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correctAnswer": "The exact correct option string",
                "explanation": "Why this is correct and why others are wrong",
                "difficulty": "${difficulty}",
                "topic": "The main topic or sub-topic"
            }
        `;
        try {
            const completion = await groq.chat.completions.create({
                messages: [
                    {
                        role: "system",
                        content: "You are a professional quiz generator. You only respond with valid JSON.",
                    },
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: "llama-3.3-70b-versatile",
                response_format: { type: "json_object" },
            });
            const text = completion.choices[0]?.message?.content || "{}";
            const data = JSON.parse(text);
            if (data.questions && Array.isArray(data.questions)) {
                return data.questions.slice(0, count);
            }
            throw new Error("Invalid output format from Groq");
        }
        catch (error) {
            console.error("[GROQ ERROR]", error);
            throw new Error(`Groq processing failed: ${error.message}`);
        }
    }
}
exports.GroqService = GroqService;
exports.groqService = new GroqService();
//# sourceMappingURL=groq.service.js.map