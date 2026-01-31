import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Project } from '@/lib/models';

// POST - Save a new project/quote
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();

        const project = await Project.create(body);

        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}

// GET - Fetch all projects (for dashboards) or specific project by ID
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        await dbConnect();

        // If ID is provided, fetch specific project
        if (id) {
            const project = await Project.findById(id);

            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }

            return NextResponse.json(project);
        }

        // Otherwise, fetch all projects (for dashboards)
        const projects = await Project.find({})
            .sort({ createdAt: -1 })
            .limit(100);

        return NextResponse.json({ projects });
    } catch (error) {
        console.error('Error fetching project(s):', error);
        return NextResponse.json({ error: 'Failed to fetch project(s)' }, { status: 500 });
    }
}
