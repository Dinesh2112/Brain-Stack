import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../services/prisma.service';

export class AuthController {
    async signup(req: Request, res: Response) {
        const { email, password, name } = req.body;

        try {
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ success: false, error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 12);
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name: name || email.split('@')[0],
                }
            });

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
        } catch (error: any) {
            console.error('Signup error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async login(req: Request, res: Response) {
        const { email, password } = req.body;

        try {
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }

            const isPasswordCorrect = await bcrypt.compare(password, user.password);
            if (!isPasswordCorrect) {
                return res.status(400).json({ success: false, error: 'Invalid credentials' });
            }

            const token = jwt.sign(
                { userId: user.id },
                process.env.JWT_SECRET || 'secret',
                { expiresIn: '7d' }
            );

            res.json({ success: true, token, user: { id: user.id, email: user.email, name: user.name } });
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

export const authController = new AuthController();
