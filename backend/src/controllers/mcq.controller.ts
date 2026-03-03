import { Request, Response } from 'express';
import { parserService } from '../services/parser.service';
import { generatorService } from '../services/generator.service';

export class MCQController {
    async generateFromTopic(req: Request, res: Response) {
        const { topic, difficulty, count } = req.body;
        if (!topic) return res.status(400).json({ success: false, error: "Topic is required" });

        try {
            const content = `The topic is ${topic}. Please generate accurate and high-quality MCQs covering key concepts, definitions, and applications related to this topic.`;
            const mcqs = await generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async generateFromURL(req: Request, res: Response) {
        const { url, difficulty, count } = req.body;
        if (!url) return res.status(400).json({ success: false, error: "URL is required" });

        try {
            const content = await parserService.parseWebsite(url);
            const mcqs = await generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async generateFromFile(req: Request, res: Response) {
        const { difficulty, count } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ success: false, error: "No file uploaded" });

        try {
            let content = "";
            if (file.mimetype === 'application/pdf') {
                content = await parserService.parsePDF(file.buffer);
            } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
                content = await parserService.parseWord(file.buffer);
            } else {
                return res.status(400).json({ success: false, error: `Unsupported file type: ${file.mimetype}` });
            }

            // Check content length to avoid token limits (advanced chunking will follow)
            if (content.length > 30000) {
                content = content.substring(0, 30000); // Temporary limit for basic version
            }

            const mcqs = await generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        } catch (error: any) {
            console.error("Controller Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const mcqController = new MCQController();
