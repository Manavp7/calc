import {
    PricingInputs,
    ClientPrice,
    InternalCost,
    ProfitAnalysis,
    Timeline,
    CostBreakdown,
    RiskWarning,
    RoleCost,
    PricingConfiguration,
} from './types';
import {
    FEATURES_DATA,
    BASE_IDEA_HOURS,
    INFRASTRUCTURE_COSTS,
    getComplexityMultiplier,
    getRiskBuffer,
    DEFAULT_CONFIG,
} from './pricing-data';
import {
    HOURLY_RATES,
    OVERHEAD_PERCENTAGE,
    DELIVERY_SPEEDS,
    CLIENT_COST_CATEGORIES,
} from './constants';

/**
 * Calculate total hours by role for selected features
 */
function calculateFeatureHours(featureIds: string[]) {
    const totals = {
        frontend: 0,
        backend: 0,
        designer: 0,
        qa: 0,
        pm: 0,
    };

    featureIds.forEach((featureId) => {
        const feature = FEATURES_DATA.find((f) => f.id === featureId);
        if (feature) {
            totals.frontend += feature.baseHours.frontend;
            totals.backend += feature.baseHours.backend;
            totals.designer += feature.baseHours.designer;
            totals.qa += feature.baseHours.qa;
            totals.pm += feature.baseHours.pm;
        }
    });

    return totals;
}

/**
 * Calculate internal cost (what it actually costs us)
 */
export function calculateInternalCost(inputs: PricingInputs, config: PricingConfiguration = DEFAULT_CONFIG): InternalCost {
    if (!inputs.ideaType) {
        return {
            laborCosts: [],
            totalLaborCost: 0,
            infrastructureCost: 0,
            overheadCost: 0,
            riskBuffer: 0,
            totalInternalCost: 0,
        };
    }

    // Get base hours for the idea type
    const baseHours = BASE_IDEA_HOURS[inputs.ideaType];

    // Get feature hours
    const featureHours = calculateFeatureHours(inputs.selectedFeatures);

    // Combine base + features
    const totalHours = {
        frontend: baseHours.frontend + featureHours.frontend,
        backend: baseHours.backend + featureHours.backend,
        designer: baseHours.designer + featureHours.designer,
        qa: baseHours.qa + featureHours.qa,
        pm: baseHours.pm + featureHours.pm,
    };

    // Apply format multiplier to hours
    const formatMultiplier = inputs.productFormat
        ? config.formatMultipliers[inputs.productFormat]
        : 1.0;

    // Apply delivery speed multiplier (faster = more resources)
    const speedMultiplier = config.timelineMultipliers[inputs.deliverySpeed] || 1.0;
    const deliveryAdjustment = speedMultiplier > 1 ? 1.2 : 1.0; // 20% more hours for faster delivery

    // Calculate labor costs per role
    // Fallback to constants if config version missing (migration safety)
    const rates = config.hourlyRates || HOURLY_RATES;

    const laborCosts: RoleCost[] = [
        {
            role: 'frontend',
            hours: Math.round(totalHours.frontend * formatMultiplier * deliveryAdjustment),
            hourlyRate: rates.frontend,
            totalCost: 0,
        },
        {
            role: 'backend',
            hours: Math.round(totalHours.backend * formatMultiplier * deliveryAdjustment),
            hourlyRate: rates.backend,
            totalCost: 0,
        },
        {
            role: 'designer',
            hours: Math.round(totalHours.designer * formatMultiplier * deliveryAdjustment),
            hourlyRate: rates.designer,
            totalCost: 0,
        },
        {
            role: 'qa',
            hours: Math.round(totalHours.qa * formatMultiplier * deliveryAdjustment),
            hourlyRate: rates.qa,
            totalCost: 0,
        },
        {
            role: 'pm',
            hours: Math.round(totalHours.pm * formatMultiplier * deliveryAdjustment),
            hourlyRate: rates.pm,
            totalCost: 0,
        },
    ];

    // Calculate total cost per role
    laborCosts.forEach((role) => {
        role.totalCost = role.hours * role.hourlyRate;
    });

    const totalLaborCost = laborCosts.reduce((sum, role) => sum + role.totalCost, 0);

    // Infrastructure cost (estimate 6 months average)
    // TODO: Make infrastructure costs dynamic in config if needed, currently using constant map but could use config.
    // For now we use the constant as it wasn't explicitly in the plan to move generic infra costs to config,
    // although `PricingConfiguration` has `infrastructureCosts`. Let's use it.
    const infraCostMonthly = config.infrastructureCosts ? config.infrastructureCosts[inputs.ideaType] : INFRASTRUCTURE_COSTS[inputs.ideaType];
    const infrastructureCost = infraCostMonthly * 6;

    // Overhead (15% of labor)
    const overheadCost = totalLaborCost * OVERHEAD_PERCENTAGE;

    // Risk buffer (10-20% based on complexity)
    const hasAI = inputs.selectedFeatures.includes('ai-recommendations') ||
        inputs.ideaType === 'ai-powered-product';
    const riskBufferPercentage = getRiskBuffer(inputs.selectedFeatures.length, hasAI);
    const riskBuffer = (totalLaborCost + infrastructureCost + overheadCost) * riskBufferPercentage;

    const totalInternalCost = totalLaborCost + infrastructureCost + overheadCost + riskBuffer;

    return {
        laborCosts,
        totalLaborCost,
        infrastructureCost,
        overheadCost,
        riskBuffer,
        totalInternalCost,
    };
}

/**
 * Calculate client-facing price
 */
export function calculateClientPrice(inputs: PricingInputs, config: PricingConfiguration = DEFAULT_CONFIG): ClientPrice {
    if (!inputs.ideaType) {
        return {
            basePrice: 0,
            featuresCost: 0,
            techMultiplier: 1,
            complexityMultiplier: 1,
            timelineMultiplier: 1,
            supportCost: 0,
            totalPrice: 0,
            priceRange: { min: 0, max: 0 },
        };
    }

    // Base price for idea type
    const basePrice = config.baseIdeaCosts[inputs.ideaType];

    // Features cost
    // Use specific feature cost if available, otherwise fallback to base feature cost
    let featuresCost = 0;
    if (config.featureCosts && Object.keys(config.featureCosts).length > 0) {
        inputs.selectedFeatures.forEach(featureId => {
            const cost = config.featureCosts[featureId] !== undefined
                ? config.featureCosts[featureId]
                : config.featureBaseCost;
            featuresCost += cost;
        });
    } else {
        featuresCost = inputs.selectedFeatures.length * config.featureBaseCost;
    }

    // Tech multiplier
    const techMultiplier = inputs.techStack
        ? config.techMultipliers[inputs.techStack]
        : 1.0;

    // Complexity multiplier (Feature based)
    let complexityMultiplier = getComplexityMultiplier(inputs.selectedFeatures.length);

    // AI Explicit Complexity Multiplier (overrides or stacks)
    if (inputs.complexityLevel) {
        const aiComplexityMult = config.complexityMultipliers[inputs.complexityLevel];
        // We act intelligently: if AI says advanced, we ensure at least that multiplier applies
        // But we also respect feature count. We take the higher of the two representations to be safe.
        complexityMultiplier = Math.max(complexityMultiplier, aiComplexityMult);
    }

    // Timeline multiplier
    const timelineMultiplier = config.timelineMultipliers[inputs.deliverySpeed] || 1.0;

    // Support cost
    const supportMonths = inputs.supportDuration === '3-months' ? 3
        : inputs.supportDuration === '6-months' ? 6
            : inputs.supportDuration === '12-months' ? 12
                : 0;

    // Use config support packages if available (total cost for duration or monthly?)
    // The constant `SUPPORT_COSTS` in `constants.ts` (which mapped to config.supportPackages)
    // was defined as TOTAL cost for the duration (e.g. 6000 for 3 months).
    // So we just grab the value directly.
    const supportCost = config.supportPackages[inputs.supportDuration] || 0;

    // Calculate total
    let totalPrice = (basePrice + featuresCost) * techMultiplier * complexityMultiplier * timelineMultiplier;
    totalPrice += supportCost;

    // Round to nearest 1000
    totalPrice = Math.round(totalPrice / 1000) * 1000;

    // Price range (±15%)
    const priceRange = {
        min: Math.round(totalPrice * 0.85 / 1000) * 1000,
        max: Math.round(totalPrice * 1.15 / 1000) * 1000,
    };

    return {
        basePrice,
        featuresCost,
        techMultiplier,
        complexityMultiplier,
        timelineMultiplier,
        supportCost,
        totalPrice,
        priceRange,
    };
}

/**
 * Calculate profit analysis
 */
export function calculateProfit(
    clientPrice: ClientPrice,
    internalCost: InternalCost
): ProfitAnalysis {
    const profit = clientPrice.totalPrice - internalCost.totalInternalCost;
    const profitMargin = (profit / clientPrice.totalPrice) * 100;

    let healthStatus: 'healthy' | 'warning' | 'critical';
    if (profitMargin >= 45) healthStatus = 'healthy';
    else if (profitMargin >= 30) healthStatus = 'warning';
    else healthStatus = 'critical';

    return {
        clientPrice: clientPrice.totalPrice,
        internalCost: internalCost.totalInternalCost,
        profit,
        profitMargin,
        healthStatus,
    };
}

/**
 * Calculate project timeline
 */
export function calculateTimeline(inputs: PricingInputs, internalCost: InternalCost, config: PricingConfiguration = DEFAULT_CONFIG): Timeline {
    if (!inputs.ideaType) {
        return {
            phases: [],
            totalWeeks: 0,
            teamSize: { min: 0, max: 0 },
        };
    }

    // Calculate total hours
    const totalHours = internalCost.laborCosts.reduce((sum, role) => sum + role.hours, 0);

    // Estimate team size (2-8 people typical)
    const baseMin = Math.max(2, Math.ceil(inputs.selectedFeatures.length / 4));
    const baseMax = Math.min(8, Math.ceil(inputs.selectedFeatures.length / 2) + 3);

    const teamSize = {
        min: Math.min(baseMin, baseMax),
        max: Math.max(baseMin, baseMax),
    };

    // Calculate initial raw weeks
    const avgTeamSize = (teamSize.min + teamSize.max) / 2;
    const rawWeeks = Math.ceil(totalHours / (avgTeamSize * 40));

    // Apply delivery speed adjustment to get FINAL weeks
    let finalWeeks = rawWeeks;
    const speedMultiplier = config.timelineMultipliers[inputs.deliverySpeed] || 1.0;

    if (speedMultiplier > 1) {
        // Use a more consistent divisor based on the multiplier itself to be mathematically accurate
        // If speed is 1.3x faster, time is 1/1.3
        finalWeeks = Math.ceil(rawWeeks / speedMultiplier);
    }

    // Ensure at least 1 week
    finalWeeks = Math.max(1, finalWeeks);

    // Define phases with weights
    const phaseWeights = [
        { name: 'Discovery & Planning', weight: 0.15 },
        { name: 'Design', weight: 0.20 },
        { name: 'Development', weight: 0.45 },
        { name: 'Testing & QA', weight: 0.12 },
        { name: 'Launch & Handoff', weight: 0.08 },
    ];

    // Distribute weeks ensuring sum equals finalWeeks
    let remainingWeeks = finalWeeks;
    const phases = phaseWeights.map((p, i) => {
        // For the last item, give it the remaining weeks to ensure sum is exact
        if (i === phaseWeights.length - 1) {
            return { name: p.name, duration: Math.max(1, remainingWeeks) };
        }

        let duration = Math.round(finalWeeks * p.weight);

        // Ensure strictly positive phases if possible, but respect total
        if (duration === 0 && finalWeeks > 3) duration = 1;

        // Clamp duration to remaining
        duration = Math.min(duration, remainingWeeks);

        remainingWeeks -= duration;
        return { name: p.name, duration: Math.max(0, duration) };
    });

    // Safety check: Recalculate total weeks from phases to be 100% sure they match
    // This handles any edge case in the rounding logic above
    const calculatedTotalWeeks = phases.reduce((acc, p) => acc + p.duration, 0);

    return {
        phases,
        totalWeeks: calculatedTotalWeeks, // Use the sum of phases as the source of truth
        teamSize,
    };
}

/**
 * Generate client-facing cost breakdown (business-friendly labels)
 */
export function generateClientCostBreakdown(internalCost: InternalCost): CostBreakdown[] {
    const total = internalCost.totalInternalCost;

    // Map internal costs to client-friendly categories
    const frontend = internalCost.laborCosts.find(r => r.role === 'frontend')?.totalCost || 0;
    const backend = internalCost.laborCosts.find(r => r.role === 'backend')?.totalCost || 0;
    const designer = internalCost.laborCosts.find(r => r.role === 'designer')?.totalCost || 0;
    const qa = internalCost.laborCosts.find(r => r.role === 'qa')?.totalCost || 0;
    const pm = internalCost.laborCosts.find(r => r.role === 'pm')?.totalCost || 0;

    return [
        {
            label: CLIENT_COST_CATEGORIES[0].label, // Product Engineering
            percentage: Math.round((frontend / total) * 100),
            amount: Math.round(frontend),
            color: CLIENT_COST_CATEGORIES[0].color,
            description: CLIENT_COST_CATEGORIES[0].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[1].label, // UX & Design
            percentage: Math.round((designer / total) * 100),
            amount: Math.round(designer),
            color: CLIENT_COST_CATEGORIES[1].color,
            description: CLIENT_COST_CATEGORIES[1].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[2].label, // Business Logic
            percentage: Math.round((backend / total) * 100),
            amount: Math.round(backend),
            color: CLIENT_COST_CATEGORIES[2].color,
            description: CLIENT_COST_CATEGORIES[2].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[3].label, // Quality
            percentage: Math.round((qa / total) * 100),
            amount: Math.round(qa),
            color: CLIENT_COST_CATEGORIES[3].color,
            description: CLIENT_COST_CATEGORIES[3].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[4].label, // Security
            percentage: Math.round((internalCost.overheadCost * 0.3 / total) * 100),
            amount: Math.round(internalCost.overheadCost * 0.3),
            color: CLIENT_COST_CATEGORIES[4].color,
            description: CLIENT_COST_CATEGORIES[4].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[5].label, // PM
            percentage: Math.round((pm / total) * 100),
            amount: Math.round(pm),
            color: CLIENT_COST_CATEGORIES[5].color,
            description: CLIENT_COST_CATEGORIES[5].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[6].label, // Infrastructure
            percentage: Math.round(((internalCost.infrastructureCost + internalCost.overheadCost * 0.7) / total) * 100),
            amount: Math.round(internalCost.infrastructureCost + internalCost.overheadCost * 0.7),
            color: CLIENT_COST_CATEGORIES[6].color,
            description: CLIENT_COST_CATEGORIES[6].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[7].label, // Support & Risk
            percentage: Math.round((internalCost.riskBuffer / total) * 100),
            amount: Math.round(internalCost.riskBuffer),
            color: CLIENT_COST_CATEGORIES[7].color,
            description: CLIENT_COST_CATEGORIES[7].description,
        },
    ];
}

/**
 * Generate risk warnings for admin
 */
export function generateRiskWarnings(
    inputs: PricingInputs,
    profit: ProfitAnalysis,
    timeline: Timeline
): RiskWarning[] {
    const warnings: RiskWarning[] = [];

    // Low margin warning
    if (profit.profitMargin < 30) {
        warnings.push({
            type: 'margin',
            severity: 'high',
            message: `Profit margin is ${profit.profitMargin.toFixed(1)}% - below recommended 30% minimum`,
        });
    } else if (profit.profitMargin < 40) {
        warnings.push({
            type: 'margin',
            severity: 'medium',
            message: `Profit margin is ${profit.profitMargin.toFixed(1)}% - below target 40%`,
        });
    }

    // Tight timeline warning
    if (inputs.deliverySpeed !== 'standard') {
        warnings.push({
            type: 'timeline',
            severity: inputs.deliverySpeed === 'priority' ? 'high' : 'medium',
            message: `Accelerated timeline (${inputs.deliverySpeed}) increases execution risk`,
        });
    }

    // High complexity warning
    if (inputs.selectedFeatures.length > 8) {
        warnings.push({
            type: 'complexity',
            severity: 'medium',
            message: `${inputs.selectedFeatures.length} features selected - high complexity project`,
        });
    }

    // AI complexity
    if (inputs.selectedFeatures.includes('ai-recommendations') || inputs.ideaType === 'ai-powered-product') {
        warnings.push({
            type: 'complexity',
            severity: 'medium',
            message: 'AI features add technical complexity and uncertainty',
        });
    }

    return warnings;
}
