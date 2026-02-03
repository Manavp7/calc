import {
    PricingInputs,
    CalculationInputs,
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
    DYNAMIC_HOURLY_RATES,
    MAX_PRICE_CAPS,
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
export function calculateInternalCost(inputs: CalculationInputs, config: PricingConfiguration = DEFAULT_CONFIG): InternalCost {
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
    const baseHours = config.baseIdeaHours ? config.baseIdeaHours[inputs.ideaType] : BASE_IDEA_HOURS[inputs.ideaType];

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

    // Calculate Complexity Multiplier
    // Used to scale both Rate (difficulty) and Hours (team size/effort)
    let complexityMultiplier = getComplexityMultiplier(inputs.selectedFeatures.length);
    if (inputs.complexityLevel) {
        // Use the explicit level if set, or just the feature count logic
        const levelMultiplier = config.complexityMultipliers[inputs.complexityLevel];
        // Take the higher of the two to be safe, or just multiply them? 
        // Let's take the higher one to represent the overall project strain.
        complexityMultiplier = Math.max(complexityMultiplier, levelMultiplier);
    }

    // Apply tech stack multiplier to hours (harder tech = more time)
    const techMultiplier = inputs.techStack ? config.techMultipliers[inputs.techStack] : 1.0;

    // Determine multipliers
    // "if more hard number of people working can be increased" -> Scale Hours
    const hoursComplexityMultiplier = complexityMultiplier;

    // "if more hard then more rate" -> Scale Rate
    // We dampen the rate multiplier slightly so it doesn't balloon too crazily (e.g. 1.5x rate AND 1.5x hours = 2.25x cost)
    // But user asked for it. "if more hard then more rate". Let's use the full multiplier.
    const rateComplexityMultiplier = complexityMultiplier;

    // Calculate labor costs per role
    // Fallback to constants if config version missing (migration safety)
    const rates = config.hourlyRates || HOURLY_RATES;

    const laborCosts: RoleCost[] = [
        {
            role: 'frontend',
            hours: Math.round(totalHours.frontend * formatMultiplier * techMultiplier * deliveryAdjustment * hoursComplexityMultiplier),
            hourlyRate: Math.round(rates.frontend * rateComplexityMultiplier),
            totalCost: 0,
        },
        {
            role: 'backend',
            hours: Math.round(totalHours.backend * formatMultiplier * techMultiplier * deliveryAdjustment * hoursComplexityMultiplier),
            hourlyRate: Math.round(rates.backend * rateComplexityMultiplier),
            totalCost: 0,
        },
        {
            role: 'designer',
            hours: Math.round(totalHours.designer * formatMultiplier * techMultiplier * deliveryAdjustment * hoursComplexityMultiplier),
            hourlyRate: Math.round(rates.designer * rateComplexityMultiplier),
            totalCost: 0,
        },
        {
            role: 'qa',
            hours: Math.round(totalHours.qa * formatMultiplier * techMultiplier * deliveryAdjustment * hoursComplexityMultiplier),
            hourlyRate: Math.round(rates.qa * rateComplexityMultiplier),
            totalCost: 0,
        },
        {
            role: 'pm',
            hours: Math.round(totalHours.pm * formatMultiplier * techMultiplier * deliveryAdjustment * hoursComplexityMultiplier),
            hourlyRate: Math.round(rates.pm * rateComplexityMultiplier),
            totalCost: 0,
        },
    ];

    // Calculate total cost per role
    laborCosts.forEach((role) => {
        role.totalCost = role.hours * role.hourlyRate;
    });

    // Calculate core labor total for overhead derivation
    const coreLaborCost = laborCosts.reduce((sum, cost) => sum + cost.totalCost, 0);

    // Calculate Additional Roles (Infra, Security, Support) based on % of Core
    // Using average of ranges provided: Infra (4-7% -> 5.5%), Sec (3-6% -> 4.5%), Sup (3-5% -> 4%)
    const additionalRoles = [
        { role: 'infrastructure', rate: rates.infrastructure || 35, pct: 0.055 },
        { role: 'security', rate: rates.security || 35, pct: 0.045 },
        { role: 'support', rate: rates.support || 35, pct: 0.04 }
    ];

    additionalRoles.forEach(({ role, rate, pct }) => {
        const cost = coreLaborCost * pct;
        const hours = Math.round(cost / rate);
        laborCosts.push({
            role: role as any,
            hours: hours,
            hourlyRate: rate,
            totalCost: hours * rate
        });
    });

    const totalLaborCost = laborCosts.reduce((sum, item) => sum + item.totalCost, 0);

    // Infrastructure cost (Monthly Server Costs) - Kept separate from labor
    const infraCostMonthly = config.infrastructureCosts ? config.infrastructureCosts[inputs.ideaType] : INFRASTRUCTURE_COSTS[inputs.ideaType];
    const infrastructureCost = infraCostMonthly * 6; // Est 6 months

    // Removed generic overhead as specific roles now cover it
    const overheadCost = 0;

    // Risk buffer remains as a separate reserve
    const hasAI = inputs.selectedFeatures.includes('ai-recommendations') ||
        inputs.ideaType === 'ai-powered-product';
    const riskBufferPercentage = getRiskBuffer(inputs.selectedFeatures.length, hasAI);
    const riskBuffer = (totalLaborCost + infrastructureCost) * riskBufferPercentage;

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

/**
 * Calculate client-facing price
 */
export function calculateClientPrice(inputs: CalculationInputs, config: PricingConfiguration = DEFAULT_CONFIG): ClientPrice {
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

    // 1. Calculate Base Hours
    const baseHoursObj = config.baseIdeaHours ? config.baseIdeaHours[inputs.ideaType] : BASE_IDEA_HOURS[inputs.ideaType];
    const baseHoursTotal = Object.values(baseHoursObj).reduce((sum, h) => sum + h, 0);

    // 2. Calculate Feature Hours
    const featureHoursObj = calculateFeatureHours(inputs.selectedFeatures);
    const featureHoursTotal = Object.values(featureHoursObj).reduce((sum, h) => sum + h, 0);

    // 3. Multipliers
    // Format multiplier
    const formatMultiplier = inputs.productFormat
        ? config.formatMultipliers[inputs.productFormat]
        : 1.0;

    // Tech multiplier
    const techMultiplier = inputs.techStack
        ? config.techMultipliers[inputs.techStack]
        : 1.0;

    // Complexity multiplier
    let complexityMultiplier = getComplexityMultiplier(inputs.selectedFeatures.length);
    if (inputs.complexityLevel) {
        const aiComplexityMult = config.complexityMultipliers[inputs.complexityLevel];
        complexityMultiplier = Math.max(complexityMultiplier, aiComplexityMult);
    }

    // Timeline multiplier
    const timelineMultiplier = config.timelineMultipliers[inputs.deliverySpeed] || 1.0;

    // 4. Calculate Adjusted Development Hours
    // Apply multipliers.
    // DAMPENER: If multiple high multipliers exist, dampen them slightly to avoid explosion.
    let combinedMultiplier = formatMultiplier * techMultiplier * complexityMultiplier * timelineMultiplier;
    // Cap combined multiplier to sensible limit (e.g., 3.5x max) unless valid heavy enterprise
    if (inputs.ideaType !== 'enterprise software') {
        combinedMultiplier = Math.min(combinedMultiplier, 3.5);
    }

    const adjustedDevHours = (baseHoursTotal + featureHoursTotal) * combinedMultiplier;

    // 5. Determine Hourly Rate
    // Use dynamic rate based on Idea Type (Startup=Low, Enterprise=High)
    // Fallback to configured rate or constant
    const DYNAMIC_RATES = (config as any).DYNAMIC_HOURLY_RATES || DYNAMIC_HOURLY_RATES;
    let hourlyRate = DYNAMIC_RATES[inputs.ideaType] || config.clientHourlyRate || 100;

    // 6. Calculate Development Cost (The Build Price)
    const devCost = adjustedDevHours * hourlyRate;

    // 7. Calculate Support Cost (Separate Add-on)
    const supportMonths = inputs.supportDuration === '3-months' ? 3
        : inputs.supportDuration === '6-months' ? 6
            : inputs.supportDuration === '12-months' ? 12
                : 0;

    // Monthly hours from config
    const monthlySupportHours = config.supportHours[inputs.supportDuration] || 0;
    const totalSupportHours = monthlySupportHours * supportMonths;
    // Support usually billed at standard rate or slightly discounted/premium depending on model.
    // Let's use the same rate for simplicity but it's separate line item.
    const supportCost = totalSupportHours * hourlyRate;

    // 8. Total Price (Build Cost Only)
    // Support is now excluded from the main 'Estimated Investment' to behave like an add-on.
    let totalPrice = devCost;

    // 9. Sanity Cap (Circuit Breaker)
    const MAX_CAPS = (config as any).MAX_PRICE_CAPS || MAX_PRICE_CAPS;
    if (MAX_CAPS[inputs.ideaType]) {
        const cap = MAX_CAPS[inputs.ideaType];
        if (totalPrice > cap) {
            console.warn(`Price clamped for ${inputs.ideaType}: ${totalPrice} -> ${cap}`);
            totalPrice = cap;
        }
    }

    // Round to nearest 100
    totalPrice = Math.round(totalPrice / 100) * 100;

    // Price range (±15%)
    const priceRange = {
        min: Math.round(totalPrice * 0.85 / 100) * 100,
        max: Math.round(totalPrice * 1.15 / 100) * 100,
    };

    // For breakdown consistency
    const basePrice = (totalPrice * (baseHoursTotal / (baseHoursTotal + featureHoursTotal)));
    const featuresCost = totalPrice - basePrice;

    return {
        basePrice,
        featuresCost,
        techMultiplier,
        complexityMultiplier,
        timelineMultiplier,
        supportCost, // Returned separately, not in totalPrice
        totalPrice,
        priceRange,
        totalDevHours: Math.round(adjustedDevHours),
        totalSupportHours: Math.round(totalSupportHours),
        hourlyRate,
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
export function calculateTimeline(inputs: CalculationInputs, internalCost: InternalCost, config: PricingConfiguration = DEFAULT_CONFIG): Timeline {
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
    let baseMin = Math.max(2, Math.ceil(inputs.selectedFeatures.length / 4));
    let baseMax = Math.min(8, Math.ceil(inputs.selectedFeatures.length / 2) + 3);

    // Dynamic Complexity Adjustment (User Request)
    if (inputs.complexityLevel === 'advanced') {
        baseMin += 2;
        baseMax += 3;
    } else if (inputs.complexityLevel === 'medium') {
        baseMin += 1;
        baseMax += 1;
    }

    const teamSize = {
        min: Math.min(baseMin, baseMax),
        max: Math.max(baseMin, baseMax),
    };

    // Calculate initial raw weeks
    const avgTeamSize = (teamSize.min + teamSize.max) / 2;
    const rawWeeks = Math.ceil(totalHours / (avgTeamSize * 40));

    // Apply delivery speed adjustment to get FINAL weeks
    let calculatedWeeks = rawWeeks;
    const speedMultiplier = config.timelineMultipliers[inputs.deliverySpeed] || 1.0;

    if (speedMultiplier > 1) {
        // Use a more consistent divisor based on the multiplier itself to be mathematically accurate
        // If speed is 1.3x faster, time is 1/1.3
        calculatedWeeks = Math.ceil(rawWeeks / speedMultiplier);
    }

    // Define phases with weights
    const phaseWeights = [
        { name: 'Discovery & Planning', weight: 0.15 },
        { name: 'Design', weight: 0.20 },
        { name: 'Development', weight: 0.45 },
        { name: 'Testing & QA', weight: 0.12 },
        { name: 'Launch & Handoff', weight: 0.08 },
    ];

    // CRITICAL FIX: Ensure every phase gets at least 1 week.
    // This implies a minimum project duration of 5 weeks (1 per phase).
    // For "Startup MVP" small projects, this is actually more realistic than 3 weeks.
    const minWeeks = phaseWeights.length; // 5
    const finalWeeks = Math.max(minWeeks, calculatedWeeks);

    // Distribute weeks
    // We start by giving everyone their weighted share
    // BUT we enforce a floor of 1 for everyone.
    let remainingWeeks = finalWeeks;

    // First pass: Calculate ideal weighted duration, floor at 1
    const phaseDurations = phaseWeights.map(p => {
        let duration = Math.round(finalWeeks * p.weight);
        if (duration < 1) duration = 1;
        return { name: p.name, duration };
    });

    // Check sum
    let currentSum = phaseDurations.reduce((acc, p) => acc + p.duration, 0);

    // Adjust to match finalWeeks
    if (currentSum !== finalWeeks) {
        // If we assumed finalWeeks but the sum of (weight * final) differed due to rounding or flooring
        // actually, simpler logic:
        // Since we floored at 1, the sum is likely >= 5.
        // If sum > finalWeeks, we might need to increase finalWeeks to match the sum (since we mandated min 1).
        // If finalWeeks was 5, sum is 5.
        // If finalWeeks was large, rounding errors might make sum != finalWeeks.

        // Let's just trust the Sum as the Truth. 
        // If the calculation says "6 weeks" but forcing min-1 pushes it to 7, so be it.
        // BUT we should try to respect the calculated finalWeeks if it's large enough.

        const diff = finalWeeks - currentSum;

        if (diff > 0) {
            // We have spare weeks to distribute (e.g. calculated 10, sum is 8)
            // Add to Development (heaviest) or evenly?
            // Add to Development
            const devPhase = phaseDurations.find(p => p.name === 'Development');
            if (devPhase) devPhase.duration += diff;
        }
        // If diff < 0, it means our "min 1 week" rule pushed us over the calculated amount.
        // That's fine, we return the higher amount (Detailed Sum) as the robust answer.
    }

    // Final check to be safe
    const finalPhases = phaseDurations;
    const finalTotalWeeks = finalPhases.reduce((acc, p) => acc + p.duration, 0);

    return {
        phases: finalPhases,
        totalWeeks: finalTotalWeeks,
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

    // New explicit roles
    const security = internalCost.laborCosts.find(r => r.role === 'security')?.totalCost || 0;
    const infraLabor = internalCost.laborCosts.find(r => r.role === 'infrastructure')?.totalCost || 0;
    const supportLabor = internalCost.laborCosts.find(r => r.role === 'support')?.totalCost || 0;

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
            label: CLIENT_COST_CATEGORIES[4].label, // Security & Data
            percentage: Math.round((security / total) * 100),
            amount: Math.round(security),
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
            label: CLIENT_COST_CATEGORIES[6].label, // Infrastructure & Tools
            // Includes labor + actual server costs
            percentage: Math.round(((infraLabor + internalCost.infrastructureCost) / total) * 100),
            amount: Math.round(infraLabor + internalCost.infrastructureCost),
            color: CLIENT_COST_CATEGORIES[6].color,
            description: CLIENT_COST_CATEGORIES[6].description,
        },
        {
            label: CLIENT_COST_CATEGORIES[7].label, // Support & Risk
            // Includes support labor + risk buffer
            percentage: Math.round(((supportLabor + internalCost.riskBuffer) / total) * 100),
            amount: Math.round(supportLabor + internalCost.riskBuffer),
            color: CLIENT_COST_CATEGORIES[7].color,
            description: CLIENT_COST_CATEGORIES[7].description,
        },
    ];
}

/**
 * Generate risk warnings for admin
 */
export function generateRiskWarnings(
    inputs: CalculationInputs,
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
