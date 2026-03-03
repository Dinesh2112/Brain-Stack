import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mcqRoutes from './routes/mcq.routes';
import authRoutes from './routes/auth.routes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Global Rate Limiter - Protects AI credits from abuse
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max 100 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later.' }
});

app.use(limiter);
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`[REQ] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/mcq', mcqRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req: Request, res: Response) => {
    res.json({
        service: 'BrainStack Neural Engine API',
        status: 'Operational',
        version: '1.1.0',
        environment: process.env.NODE_ENV || 'production'
    });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: any) => {
    logger.error("Global Catch-All Error Handler", err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// ONLY listen on local port during development (Not on Vercel)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        logger.info(`Server initialized successfully on http://localhost:${PORT}`);
    });
} else {
    logger.info("Server running in Serverless Mode (Vercel)");
}

// CRITICAL for Vercel Serverless
export default app;



