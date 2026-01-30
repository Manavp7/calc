
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PricingConfig, User } from '@/lib/models';
import connectToDatabase from '@/lib/db';
import { DEFAULT_CONFIG } from '@/lib/pricing-data';

// GET: Fetch the active pricing configuration
export async function GET() {
    try {
        await connectToDatabase();

        // Find the most recent active configuration
        const config = await PricingConfig.findOne({ isActive: true })
            .sort({ version: -1 })
            .lean();

        if (!config) {
            // If no active config found in DB, return the default file-based config
            return NextResponse.json(DEFAULT_CONFIG);
        }

        // Return the DB config
        // Verify structure consistency or return mixed?
        // We assume DB structure matches PricingConfiguration interface mostly.
        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching pricing config:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pricing configuration' },
            { status: 500 }
        );
    }
}

// POST: Create/Update pricing configuration
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectToDatabase();

        // Check if user is admin or company_head
        const user = await User.findOne({ email: session.user.email });
        if (!user || (user.role !== 'admin' && user.role !== 'company_head')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const data = await req.json();

        // Get latest version number
        const latestConfig = await PricingConfig.findOne().sort({ version: -1 });
        const newVersion = (latestConfig?.version || 0) + 1;

        // Deactivate all previous configs
        await PricingConfig.updateMany({}, { isActive: false });

        // Create new config
        const newConfig = await PricingConfig.create({
            ...data,
            version: newVersion,
            isActive: true,
            createdBy: user._id,
        });

        return NextResponse.json(newConfig);
    } catch (error) {
        console.error('Error saving pricing config:', error);
        return NextResponse.json(
            { error: 'Failed to save pricing configuration' },
            { status: 500 }
        );
    }
}
