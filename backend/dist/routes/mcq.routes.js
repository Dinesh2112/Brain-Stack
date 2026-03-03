"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mcq_controller_1 = require("../controllers/mcq.controller");
const multer_1 = __importDefault(require("multer"));
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
const router = (0, express_1.Router)();
router.post('/generate-topic', (req, res) => mcq_controller_1.mcqController.generateFromTopic(req, res));
router.post('/generate-url', (req, res) => mcq_controller_1.mcqController.generateFromURL(req, res));
router.post('/generate-file', upload.single('file'), (req, res) => mcq_controller_1.mcqController.generateFromFile(req, res));
exports.default = router;
//# sourceMappingURL=mcq.routes.js.map