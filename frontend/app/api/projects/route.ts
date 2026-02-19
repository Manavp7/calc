import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Project } from '@/lib/models';

export const dynamic = 'force-dynamic';

// POST - Save a new project/quote (directly to MongoDB)
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const body = await request.json();

        const project = await Project.create(body);

        return NextResponse.json({
            success: true,
            id: project._id,
            message: 'Project saved successfully',
        }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating project:', error);
        return NextResponse.json(
            { error: 'Failed to create project', details: error.message },
            { status: 500 }
        );
    }
}

// GET - Fetch all projects or specific project by ID
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const id = request.nextUrl.searchParams.get('id');

        if (id) {
            const project = await Project.findById(id);
            if (!project) {
                return NextResponse.json({ error: 'Project not found' }, { status: 404 });
            }
            return NextResponse.json(project);
        }

        const projects = await Project.find({}).sort({ createdAt: -1 }).limit(100);
        return NextResponse.json({ projects });
    } catch (error: any) {
        console.error('Error fetching projects:', error);
        return NextResponse.json(
            { error: 'Failed to fetch projects', details: error.message },
            { status: 500 }
        );
    }
}
