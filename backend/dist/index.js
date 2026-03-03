"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
// import { PrismaClient } from '@prisma/client';
const mcq_routes_1 = __importDefault(require("./routes/mcq.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/mcq', mcq_routes_1.default);
app.get('/', (req, res) => {
    res.json({ message: 'AI MCQ Practice Platform Backend IS UP AND RUNNING! 🚀' });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map