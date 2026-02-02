import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db';
import { Project } from '@/lib/models';
import { calculateInternalCost, calculateClientPrice, calculateProfit } from '@/lib/pricing-engine';

// GET - Fetch single project details by ID
// Recalculates pricing on-the-fly to ensure consistency with latest formulas
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();

        const project = await Project.findById(params.id).lean(); // Use lean() to get a plain JS object we can modify

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        // Perform Live Recalculation if inputs exist
        if (project.inputs) {
            try {
                // 1. Recalculate Internal Cost (with new Tech Multiplier)
                const internalCost = calculateInternalCost(project.inputs);

                // 2. Recalculate Client Price (with new Format Multiplier)
                const clientPrice = calculateClientPrice(project.inputs);

                // 3. Recalculate Profit Analysis
                const profitAnalysis = calculateProfit(clientPrice, internalCost);

                // 4. Override stored values with fresh calculations
                project.internalCost = internalCost;
                project.clientPrice = clientPrice; // Note: clientPrice structure in DB might differ slightly, but this ensures pricing engine consistency
                project.profitAnalysis = profitAnalysis;

                // Also update the top-level clientPrice/profit fields if they exist on the schema
                // (Though usually UI reads from profitAnalysis)
            } catch (calcError) {
                console.error("Error recalculating project pricing:", calcError);
                // Fallback to stored values if calculation fails
            }
        }

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 });
    }
}
