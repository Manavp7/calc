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

        const secret = process.env.NEXTAUTH_SECRET || '';
        const url = process.env.NEXTAUTH_URL || '';

        const secretHasQuotes = secret.startsWith('"') || secret.startsWith("'");
        const secretIsWeak = secret.length < 10;

        const configCheck = {
            urlSet: !!url,
            urlValue: url || 'MISSING (Critical for Vercel)',
            secretSet: !!secret,
            secretLength: secret.length,
            secretHasQuotes: secretHasQuotes ? 'WARNING: Remove quotes!' : 'OK',
            trustHost: true // We enabled this in code
        };

        return NextResponse.json({
            status: isMatch && !!url && !!secret ? 'pass' : 'fail',
            message: 'Configuration Diagnosis',
            user: {
                found: true,
                email: user.email,
                role: user.role,
                passwordValid: isMatch
            },
            config: configCheck,
            tip: !url ? 'Add NEXTAUTH_URL to Vercel and REDEPLOY' : (secretHasQuotes ? 'Remove quotes from NEXTAUTH_SECRET in Vercel' : 'Config looks good!'),
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
