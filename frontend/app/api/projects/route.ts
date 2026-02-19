import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Project } from '@/lib/models';

export const dynamic = 'force-dynamic';

// POST - Save a new project/quote
export async function POST(request: NextRequest) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
        const body = await request.json();

        const res = await fetch(`${backendUrl}/api/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error proxying create project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

// GET - Fetch all projects (for dashboards) or specific project by ID
export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';
        const id = request.nextUrl.searchParams.get('id');
        const url = id ? `${backendUrl}/api/projects?id=${id}` : `${backendUrl}/api/projects`;

        const res = await fetch(url);
        const data = await res.json();

        return NextResponse.json(data, { status: res.status });
    } catch (error) {
        console.error('Error proxying project(s):', error);
        return NextResponse.json({ error: 'Failed to fetch project(s)' }, { status: 500 });
    }
}
