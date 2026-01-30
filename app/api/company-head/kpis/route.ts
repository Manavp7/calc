import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Project } from '@/lib/models';

// GET - Fetch KPIs for company head dashboard
export async function GET() {
    try {
        await dbConnect();

        const projects = await Project.find({});

        // Calculate aggregated KPIs
        const totalQuotedValue = projects.reduce((sum, p) => sum + p.profitAnalysis.clientPrice, 0);
        const totalInternalCost = projects.reduce((sum, p) => sum + p.profitAnalysis.internalCost, 0);
        const totalProfit = projects.reduce((sum, p) => sum + p.profitAnalysis.profit, 0);
        const averageProfitMargin = projects.length > 0
            ? projects.reduce((sum, p) => sum + p.profitAnalysis.profitMargin, 0) / projects.length
            : 0;

        // Per-project metrics
        const projectMetrics = projects.map(p => ({
            id: p._id,
            clientName: p.clientName || 'Anonymous',
            clientPrice: p.profitAnalysis.clientPrice,
            profit: p.profitAnalysis.profit,
            profitMargin: p.profitAnalysis.profitMargin,
            healthStatus: p.profitAnalysis.healthStatus,
            createdAt: p.createdAt,
        }));

        // Health distribution
        const healthDistribution = {
            healthy: projects.filter(p => p.profitAnalysis.healthStatus === 'healthy').length,
            warning: projects.filter(p => p.profitAnalysis.healthStatus === 'warning').length,
            critical: projects.filter(p => p.profitAnalysis.healthStatus === 'critical').length,
        };

        // Risk warnings
        const riskWarnings = projects
            .filter(p => p.profitAnalysis.healthStatus !== 'healthy')
            .map(p => ({
                projectId: p._id,
                clientName: p.clientName || 'Anonymous',
                healthStatus: p.profitAnalysis.healthStatus,
                profitMargin: p.profitAnalysis.profitMargin,
                message: p.profitAnalysis.healthStatus === 'critical'
                    ? 'Critical: Profit margin below 30%'
                    : 'Warning: Profit margin below 45%',
            }));

        return NextResponse.json({
            overview: {
                totalQuotedValue,
                totalInternalCost,
                totalProfit,
                averageProfitMargin,
                totalProjects: projects.length,
            },
            projectMetrics,
            healthDistribution,
            riskWarnings,
        });
    } catch (error) {
        console.error('Error fetching KPIs:', error);
        return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 });
    }
}
