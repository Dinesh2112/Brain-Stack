"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_service_1 = __importDefault(require("../services/prisma.service"));
class AuthController {
    async signup(req, res) {
        const { email, password, name } = req.body;
        try {
            const existingUser = await prisma_service_1.default.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'User already exists' });
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 12);
            const user = await prisma_service_1.default.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || email.split('@')[0],
                }
            });
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
            res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
        }
        catch (error) {
            console.error('Signup error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async login(req, res) {
        const { email, password } = req.body;
        try {
            const user = await prisma_service_1.default.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }
            const isPasswordCorrect = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }
            const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
            res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map