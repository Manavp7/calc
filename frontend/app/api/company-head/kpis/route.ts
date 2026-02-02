import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Project } from '@/lib/models';

// GET - Fetch KPIs for company head dashboard
export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

        const res = await fetch(`${backendUrl}/api/projects/kpis`);
        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error proxying KPIs:', error);
        return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
    }
}
