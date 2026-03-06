import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const PRIMARY_MODEL = "gemini-1.5-flash";
const FALLBACK_MODEL = "gemini-1.5-flash-latest";

export interface MCQ {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    topic: string;
}

export class GeminiService {
    private model: any;

    private getModel(useFallback: boolean = false) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[GEMINI] CRITICAL: GEMINI_API_KEY is missing from environment.");
            throw new Error("AI Service configuration missing.");
        }

        const modelName = useFallback ? FALLBACK_MODEL : PRIMARY_MODEL;
        this.model = genAI.getGenerativeModel({ model: modelName });
        console.log(`[GEMINI] Service initialized with model: ${modelName}`);
        return this.model;
    }

    constructor() {
        // Model initialized lazily when needed
    }

    private chunkContent(content: string, maxLen: number = 20000): string {
        if (content.length <= maxLen) return content;
        const third = Math.floor(maxLen / 3);
        const start = content.substring(0, third);
        const mid = content.substring(content.length / 2 - third / 2, content.length / 2 + third / 2);
        const end = content.substring(content.length - third);
        return `${start}\n...[truncated]...\n${mid}\n...[truncated]...\n${end}`;
    }

    async generateMCQs(content: string, count: number = 5, difficulty: string = "MEDIUM", retryCount: number = 2): Promise<MCQ[]> {
        // Use the current model or initialize it
        const currentModel = this.model || this.getModel(retryCount === 0);
        console.log(`[GEMINI] Generating MCQs with model: ${PRIMARY_MODEL}...`);
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
            const result = await currentModel.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            const jsonMatch = text.match(/\[.*\]/s);
            if (!jsonMatch) {
                throw new Error("Invalid response format from AI");
            }
            return JSON.parse(jsonMatch[0]);
        } catch (error: any) {
            // Handle 404 by switching model
            if (error.status === 404 || error.message.includes("404") || error.message.includes("not found")) {
                console.warn(`[GEMINI] Model ${PRIMARY_MODEL} not found. Retrying with fallback...`);
                this.model = this.getModel(true); // Switch to fallback
                if (retryCount > 0) {
                    return this.generateMCQs(content, count, difficulty, retryCount - 1);
                }
            }

            // Retry logic for 503 / Service Unavailable
            if (retryCount > 0 && (error.message.includes("503") || error.message.includes("Service Unavailable") || error.message.includes("overloaded"))) {
                console.warn(`[GEMINI] Service busy, retrying... (${retryCount} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.generateMCQs(content, count, difficulty, retryCount - 1);
            }

            console.error("Gemini Error Details:", error);
            throw new Error(`Failed to generate MCQs: ${error.message}`);
        }
    }
}

export const geminiService = new GeminiService();
