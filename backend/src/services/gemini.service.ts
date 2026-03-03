import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const PRIMARY_MODEL = "gemini-1.5-flash";

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

    private getModel() {
        if (this.model) return this.model;
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("[GEMINI] CRITICAL: GEMINI_API_KEY is missing from environment.");
            throw new Error("AI Service configuration missing.");
        }
        this.model = genAI.getGenerativeModel({ model: PRIMARY_MODEL });
        console.log(`[GEMINI] Service initialized with model: ${PRIMARY_MODEL}`);
        return this.model;
    }

    constructor() {
        // Model initialized lazily when needed
    }



    private chunkContent(content: string, maxLen: number = 20000): string {
        if (content.length <= maxLen) return content;
        // Basic strategy: Take the first part, middle part and end part to get a decent coverage
        const third = Math.floor(maxLen / 3);
        const start = content.substring(0, third);
        const mid = content.substring(content.length / 2 - third / 2, content.length / 2 + third / 2);
        const end = content.substring(content.length - third);
        return `${start}\n...[truncated]...\n${mid}\n...[truncated]...\n${end}`;
    }

    async generateMCQs(content: string, count: number = 5, difficulty: string = "MEDIUM", retryCount: number = 2): Promise<MCQ[]> {
        const activeModel = this.getModel();
        console.log(`[GEMINI] Generating MCQs with model: ${activeModel.model}...`);
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
        } catch (error: any) {
            // Retry logic for 503 / Service Unavailable
            if (retryCount > 0 && (error.message.includes("503") || error.message.includes("Service Unavailable") || error.message.includes("overloaded"))) {
                console.warn(`[GEMINI] Service busy, retrying... (${retryCount} retries left)`);
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
                return this.generateMCQs(content, count, difficulty, retryCount - 1);
            }

            console.error("Gemini Error Details:", {
                message: error.message,
                stack: error.stack,
                details: error.response?.data || error
            });
            throw new Error(`Failed to generate MCQs: ${error.message}`);
        }
    }
}

export const geminiService = new GeminiService();
