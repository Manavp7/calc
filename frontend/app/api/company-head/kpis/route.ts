import { NextResponse } from 'next/server';
import { calculateInternalCost, calculateClientPrice, calculateProfit } from '@/lib/pricing-engine';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

// GET - Fetch KPIs for company head dashboard
// We recalculate these on-the-fly to ensure latest pricing formulas are applied to all stored projects
export async function GET() {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001';

        // 1. Parallelize Fetching: Get Projects + Active Users simultaneously
        const [projectsRes, activeUsers] = await Promise.all([
            fetch(`${backendUrl}/api/projects`, { cache: 'no-store' }),
            (async () => {
                try {
                    await dbConnect();
                    return await User.countDocuments();
                } catch (dbError) {
                    console.error('Error counting users:', dbError);
                    return 0;
                }
            })()
        ]);

        let projects = [];
        if (projectsRes.ok) {
            const data = await projectsRes.json();
            projects = data.projects || [];
        } else {
            console.error('Failed to fetch projects from backend');
        }

        // 3. Recalculate KPIs using current engine logic
        const recalculatedProjects = projects.map((p: any) => {
            // Recalculate based on stored inputs
            // Handle legacy projects or missing inputs gracefully
            if (!p.inputs) return p;

            try {
                const internalCost = calculateInternalCost(p.inputs);
                const clientPrice = calculateClientPrice(p.inputs);
                const profitAnalysis = calculateProfit(clientPrice, internalCost);

                return {
                    ...p,
                    internalCost,
                    clientPrice,
                    profitAnalysis
                };
            } catch (e) {
                console.error(`Failed to recalculate project ${p._id}`, e);
                return p; // Fallback to stored data
            }
        });

        // ---------------------------------------------------------
        // Aggregation Logic (Mirrors Backend Logic but uses new data)
        // ---------------------------------------------------------

        const totalQuotedValue = recalculatedProjects.reduce((sum: number, p: any) => sum + (p.profitAnalysis?.clientPrice || 0), 0);
        const totalInternalCost = recalculatedProjects.reduce((sum: number, p: any) => sum + (p.profitAnalysis?.internalCost || 0), 0);
        const totalProfit = recalculatedProjects.reduce((sum: number, p: any) => sum + (p.profitAnalysis?.profit || 0), 0);

        const validProjectsCount = recalculatedProjects.filter((p: any) => p.profitAnalysis).length;
        const averageProfitMargin = validProjectsCount > 0
            ? recalculatedProjects.reduce((sum: number, p: any) => sum + (p.profitAnalysis?.profitMargin || 0), 0) / validProjectsCount
            : 0;

        // Per-project metrics
        const projectMetrics = recalculatedProjects.map((p: any) => ({
            id: p._id,
            clientName: p.clientName || p.inputs?.clientName || 'Anonymous',
            clientPrice: p.profitAnalysis?.clientPrice || 0,
            profit: p.profitAnalysis?.profit || 0,
            profitMargin: p.profitAnalysis?.profitMargin || 0,
            healthStatus: p.profitAnalysis?.healthStatus || 'unknown',
            createdAt: p.createdAt,
        }));

        // Health distribution
        const healthDistribution = {
            healthy: recalculatedProjects.filter((p: any) => p.profitAnalysis?.healthStatus === 'healthy').length,
            warning: recalculatedProjects.filter((p: any) => p.profitAnalysis?.healthStatus === 'warning').length,
            critical: recalculatedProjects.filter((p: any) => p.profitAnalysis?.healthStatus === 'critical').length,
        };

        // Risk warnings
        const riskWarnings = recalculatedProjects
            .filter((p: any) => p.profitAnalysis?.healthStatus !== 'healthy' && p.profitAnalysis?.healthStatus !== 'unknown')
            .map((p: any) => ({
                projectId: p._id,
                clientName: p.clientName || p.inputs?.clientName || 'Anonymous',
                healthStatus: p.profitAnalysis?.healthStatus,
                profitMargin: p.profitAnalysis?.profitMargin,
                message: p.profitAnalysis?.healthStatus === 'critical'
                    ? 'Critical: Profit margin below 30%'
                    : 'Warning: Profit margin below 45%',
            }));

        const kpiData = {
            overview: {
                totalQuotedValue,
                totalInternalCost,
                totalProfit,
                averageProfitMargin,
                totalProjects: recalculatedProjects.length,
                activeUsers, // Added real users count
            },
            projectMetrics,
            healthDistribution,
            riskWarnings,
        };

        return NextResponse.json(kpiData);
    } catch (error) {
        console.error('Error calculating KPIs:', error);
        return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
    }
}
