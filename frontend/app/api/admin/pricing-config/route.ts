import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { PricingConfig } from '@/lib/models';
import { getCurrentUser } from '@/lib/auth';

// GET - Fetch active pricing configuration
export async function GET() {
    try {
        await dbConnect();

        const config = await PricingConfig.findOne({ isActive: true }).sort({ version: -1 });

        if (!config) {
            return NextResponse.json({ error: 'No active pricing configuration found' }, { status: 404 });
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching pricing config:', error);
        return NextResponse.json({ error: 'Failed to fetch pricing configuration' }, { status: 500 });
    }
}

// PUT - Update pricing configuration (creates new version)
export async function PUT(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user || user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await request.json();

        // Get current active config to increment version
        const currentConfig = await PricingConfig.findOne({ isActive: true }).sort({ version: -1 });
        const newVersion = currentConfig ? currentConfig.version + 1 : 1;

        // Deactivate all previous configs
        await PricingConfig.updateMany({}, { isActive: false });

        // Create new config version
        const newConfig = await PricingConfig.create({
            ...body,
            version: newVersion,
            isActive: true,
            createdBy: user.id,
        });

        return NextResponse.json(newConfig);
    } catch (error) {
        console.error('Error updating pricing config:', error);
        return NextResponse.json({ error: 'Failed to update pricing configuration' }, { status: 500 });
    }
}
