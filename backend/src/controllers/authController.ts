import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models';
import { dbConnect } from '../config/db';

export const login = async (req: Request, res: Response) => {
    try {
        await dbConnect();
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Missing credentials' });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

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
