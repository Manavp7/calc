import { Request, Response } from 'express';
import { dbConnect } from '../config/db';
import { Project } from '../models';

export const createProject = async (req: Request, res: Response) => {
    try {
        await dbConnect();
        const project = await Project.create(req.body);
        return res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return res.status(500).json({ message: 'Failed to create project' });
    }
};

export const getProjects = async (req: Request, res: Response) => {
    try {
        await dbConnect();
        const { id } = req.query;

        if (id) {
            const project = await Project.findById(id);
            if (!project) {
                return res.status(404).json({ message: 'Project not found' });
            }
            return res.status(200).json(project);
        }

        const projects = await Project.find({}).sort({ createdAt: -1 }).limit(100);
        return res.status(200).json({ projects });
    } catch (error) {
        console.error('Error fetching projects:', error);
        return res.status(500).json({ message: 'Failed to fetch projects' });
    }
};

export const getKPIs = async (req: Request, res: Response) => {
    try {
        await dbConnect();
        const projects = await Project.find({});

        // Calculate aggregated KPIs
        const totalQuotedValue = projects.reduce((sum: number, p: any) => sum + p.profitAnalysis.clientPrice, 0);
        const totalInternalCost = projects.reduce((sum: number, p: any) => sum + p.profitAnalysis.internalCost, 0);
        const totalProfit = projects.reduce((sum: number, p: any) => sum + p.profitAnalysis.profit, 0);
        const averageProfitMargin = projects.length > 0
            ? projects.reduce((sum: number, p: any) => sum + p.profitAnalysis.profitMargin, 0) / projects.length
            : 0;

        // Per-project metrics
        const projectMetrics = projects.map((p: any) => ({
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
            healthy: projects.filter((p: any) => p.profitAnalysis.healthStatus === 'healthy').length,
            warning: projects.filter((p: any) => p.profitAnalysis.healthStatus === 'warning').length,
            critical: projects.filter((p: any) => p.profitAnalysis.healthStatus === 'critical').length,
        };

        // Risk warnings
        const riskWarnings = projects
            .filter((p: any) => p.profitAnalysis.healthStatus !== 'healthy')
            .map((p: any) => ({
                projectId: p._id,
                clientName: p.clientName || 'Anonymous',
                healthStatus: p.profitAnalysis.healthStatus,
                profitMargin: p.profitAnalysis.profitMargin,
                message: p.profitAnalysis.healthStatus === 'critical'
                    ? 'Critical: Profit margin below 30%'
                    : 'Warning: Profit margin below 45%',
            }));

        return res.status(200).json({
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
        return res.status(500).json({ message: 'Failed to fetch KPIs' });
    }
};
