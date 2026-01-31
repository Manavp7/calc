import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();

        const email = 'admin@demo.com';
        const passwordCandidate = 'admin123';

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({
                status: 'error',
                message: 'User not found',
                email
            });
        }

        const isMatch = await bcrypt.compare(passwordCandidate, user.password);

        return NextResponse.json({
            status: 'ok',
            email: user.email,
            passwordCandidate,
            isMatch,
            roles: user.role,
            passwordHashPrefix: user.password.substring(0, 10) + '...',
            userId: user._id,
            envCheck: {
                hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
                secretLength: process.env.NEXTAUTH_SECRET ? process.env.NEXTAUTH_SECRET.length : 0,
                nextAuthUrl: process.env.NEXTAUTH_URL || 'Not Set (Vercel Default)',
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
