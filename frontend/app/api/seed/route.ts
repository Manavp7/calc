import { NextResponse } from 'next/server';
import { seedDefaultUsers } from '@/lib/seed';

export async function GET() {
    try {
        const result = await seedDefaultUsers();

        if (result.success) {
            return NextResponse.json({
                message: 'Default users seeded successfully',
                success: true
            });
        } else {
            return NextResponse.json({
                error: 'Failed to seed users',
                details: result.error
            }, { status: 500 });
        }
    } catch (error) {
        console.error('Seed API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
