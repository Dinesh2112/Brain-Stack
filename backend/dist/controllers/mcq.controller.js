"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mcqController = exports.MCQController = void 0;
const parser_service_1 = require("../services/parser.service");
const generator_service_1 = require("../services/generator.service");
class MCQController {
    async generateFromTopic(req, res) {
        const { topic, difficulty, count } = req.body;
        if (!topic)
            return res.status(400).json({ success: false, error: "Topic is required" });
        try {
            const content = `The topic is ${topic}. Please generate accurate and high-quality MCQs covering key concepts, definitions, and applications related to this topic.`;
            const mcqs = await generator_service_1.generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async generateFromURL(req, res) {
        const { url, difficulty, count } = req.body;
        if (!url)
            return res.status(400).json({ success: false, error: "URL is required" });
        try {
            const content = await parser_service_1.parserService.parseWebsite(url);
            const mcqs = await generator_service_1.generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async generateFromFile(req, res) {
        const { difficulty, count } = req.body;
        const file = req.file;
        if (!file)
            return res.status(400).json({ success: false, error: "No file uploaded" });
        try {
            let content = "";
            if (file.mimetype === 'application/pdf') {
                content = await parser_service_1.parserService.parsePDF(file.buffer);
            }
            else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.mimetype === 'application/msword') {
                content = await parser_service_1.parserService.parseWord(file.buffer);
            }
            else {
                return res.status(400).json({ success: false, error: `Unsupported file type: ${file.mimetype}` });
            }
            // Check content length to avoid token limits (advanced chunking will follow)
            if (content.length > 30000) {
                content = content.substring(0, 30000); // Temporary limit for basic version
            }
            const mcqs = await generator_service_1.generatorService.generateMCQs(content, count || 5, difficulty || "MEDIUM");
            res.json({ success: true, mcqs });
        }
        catch (error) {
            console.error("Controller Error:", error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.MCQController = MCQController;
exports.mcqController = new MCQController();
//# sourceMappingURL=mcq.controller.js.map