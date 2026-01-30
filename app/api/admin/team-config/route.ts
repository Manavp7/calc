import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { TeamConfig } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// GET - Fetch active team configuration
export async function GET() {
    try {
        await dbConnect();

        const config = await TeamConfig.findOne({ isActive: true });

        if (!config) {
            return NextResponse.json({ error: 'No active team configuration found' }, { status: 404 });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching team config:', error);
        return NextResponse.json({ error: 'Failed to fetch team configuration' }, { status: 500 });
    }
}

// PUT - Update team configuration
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Deactivate all previous configs
        await TeamConfig.updateMany({}, { isActive: false });

        // Create new config
        const newConfig = await TeamConfig.create({
            ...body,
            isActive: true,
            createdBy: user.id,
        });

        return NextResponse.json(newConfig);
    } catch (error) {
        console.error('Error updating team config:', error);
        return NextResponse.json({ error: 'Failed to update team configuration' }, { status: 500 });
    }
}
