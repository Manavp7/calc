import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { dbConnect } from '../config/db';

export const login = async (req: Request, res: Response) => {
    try {
        await dbConnect();
        const { email, password } = req.body;

        console.log(`🔐 [Login] Attempt for: ${email}`);

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }

        // 1. Fix: Case-insensitive email search
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            console.log(`❌ [Login] User not found: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 2. Fix: Check password (hashed)
        let isPasswordValid = await bcrypt.compare(password, user.password);

        // 3. Fix: Fallback to plain text (for demo/seeded users)
        if (!isPasswordValid && user.password === password) {
            console.log(`⚠️ [Login] Plain text password match for: ${email}`);
            isPasswordValid = true;
        }

        if (!isPasswordValid) {
            console.log(`❌ [Login] Password mismatch for: ${email}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log(`✅ [Login] Success: ${email}`);
        return res.status(200).json({
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
