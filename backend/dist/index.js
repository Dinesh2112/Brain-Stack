"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const mcq_routes_1 = __importDefault(require("./routes/mcq.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const logger_1 = require("./utils/logger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Global Rate Limiter - Protects AI credits from abuse
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});
app.use(limiter);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Request logging middleware
app.use((req, res, next) => {
    logger_1.logger.info(`[REQ] ${req.method} ${req.url}`);
    next();
});
// Routes
app.use('/api/mcq', mcq_routes_1.default);
app.use('/api/auth', auth_routes_1.default);
app.get('/', async (req, res) => {
    try {
        // Simple health check for DB
        await (req.app.get('prisma') || Promise.resolve().then(() => __importStar(require('./services/prisma.service'))).then(m => m.default)).$connect();
        res.json({
            name: 'BrainStack AI Assessment Engine',
            status: 'Operational',
            db: 'Connected',
            version: '1.2.0',
            region: process.env.VERCEL_REGION || 'local'
        });
    }
    catch (e) {
        res.json({
            name: 'BrainStack AI Assessment Engine',
            status: 'Operational (DB Warning)',
            db: 'Disconnected',
            error: e.message,
            version: '1.2.0'
        });
    }
});
// Global Error Handler
app.use((err, req, res, next) => {
    logger_1.logger.error("Global Catch-All Error Handler", err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});
// ONLY listen on local port during development (Not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        logger_1.logger.info(`Server initialized successfully on http://localhost:${PORT}`);
    });
}
else {
    logger_1.logger.info("Server running in Serverless Mode (Vercel)");
}
// CRITICAL for Vercel Serverless
exports.default = app;
//# sourceMappingURL=index.js.map