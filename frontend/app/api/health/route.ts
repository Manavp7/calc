import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const start = Date.now();
        await dbConnect();
        const connectionTime = Date.now() - start;

        const userCount = await User.countDocuments();

        return NextResponse.json({
            status: 'ok',
            message: 'Database connected successfully',
            dbName: 'calculator',
            userCount,
            connectionTime: `${connectionTime}ms`,
            timestamp: new Date().toISOString(),
            envCheck: {
                hasMongoUri: !!process.env.MONGODB_URI,
                mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
            }
        });
    } catch (error: any) {
        console.error('Health check failed:', error);
        return NextResponse.json({
            status: 'error',
            message: error.message,
            stack: error.stack,
            envCheck: {
                hasMongoUri: !!process.env.MONGODB_URI,
            }
        }, { status: 500 });
    }
}
