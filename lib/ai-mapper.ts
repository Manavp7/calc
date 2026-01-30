import { AIAnalysis, FEATURE_COSTS, COMPLEXITY_MULTIPLIERS, PLATFORM_MULTIPLIERS, PROJECT_TYPE_COSTS } from './ai-types';
import { PricingInputs, ProductFormat, TechStack, DeliverySpeed, SupportDuration } from './types';

/**
 * Maps AI-extracted analysis to pricing engine inputs
 */
export function mapAIOutputToPricingInputs(aiData: AIAnalysis): Partial<PricingInputs> {
    const inputs: Partial<PricingInputs> = {};

    // Map project type to idea type and product format
    switch (aiData.project_type) {
        case 'website':
            inputs.ideaType = 'business-website';
            inputs.productFormat = 'website' as ProductFormat;
            break;
        case 'mobile_app':
            inputs.ideaType = 'mobile-app';
            inputs.productFormat = 'mobile-app' as ProductFormat;
            break;
        case 'web_and_app':
            inputs.ideaType = 'website-mobile-app';
            inputs.productFormat = 'website-and-app' as ProductFormat;
            break;
        case 'enterprise':
            inputs.ideaType = 'enterprise software';
            inputs.productFormat = 'full-ecosystem' as ProductFormat;
            break;
        case 'ai_product':
            inputs.ideaType = 'ai-powered-product';
            inputs.productFormat = 'full-ecosystem' as ProductFormat;
            break;
    }

    // Map platforms to tech stack
    if (aiData.platforms.includes('web')) {
        inputs.techStack = 'react-nextjs' as TechStack;
    } else if (aiData.platforms.includes('android') && aiData.platforms.includes('ios')) {
        inputs.techStack = 'react-native' as TechStack;
    } else if (aiData.platforms.includes('android')) {
        inputs.techStack = 'native-android' as TechStack;
    } else if (aiData.platforms.includes('ios')) {
        inputs.techStack = 'native-ios' as TechStack;
    }

    // Map features to selected features
    inputs.selectedFeatures = aiData.required_features;

    // Map complexity to delivery speed (inverse relationship)
    switch (aiData.complexity_level) {
        case 'basic':
            inputs.deliverySpeed = 'priority' as DeliverySpeed;
            break;
        case 'medium':
            inputs.deliverySpeed = 'faster' as DeliverySpeed;
            break;
        case 'advanced':
            inputs.deliverySpeed = 'standard' as DeliverySpeed;
            break;
    }

    // Map support needs based on complexity and project type
    if (aiData.project_type === 'enterprise' || aiData.complexity_level === 'advanced') {
        inputs.supportDuration = '12-months' as SupportDuration;
    } else if (aiData.complexity_level === 'medium') {
        inputs.supportDuration = '6-months' as SupportDuration;
    } else {
        inputs.supportDuration = '3-months' as SupportDuration;
    }

    // Explicitly map complexity level
    inputs.complexityLevel = aiData.complexity_level;

    return inputs;
}

/**
 * Calculate estimated price from AI analysis
 */
export function calculatePriceFromAI(aiData: AIAnalysis): {
    basePrice: number;
    featureCost: number;
    totalPrice: number;
    breakdown: { feature: string; cost: number }[];
} {
    // Get base price
    const basePrice = PROJECT_TYPE_COSTS[aiData.project_type];

    // Calculate feature costs
    const breakdown: { feature: string; cost: number }[] = [];
    let featureCost = 0;

    for (const feature of aiData.required_features) {
        if (FEATURE_COSTS[feature]) {
            const cost = FEATURE_COSTS[feature].cost;
            breakdown.push({
                feature: FEATURE_COSTS[feature].description,
                cost
            });
            featureCost += cost;
        }
    }

    // Apply complexity multiplier
    const complexityMultiplier = COMPLEXITY_MULTIPLIERS[aiData.complexity_level];

    // Apply platform multiplier
    const platformKey = aiData.platforms.sort().join(',');
    const platformMultiplier = PLATFORM_MULTIPLIERS[platformKey] || 1.0;

    // Calculate total
    const totalPrice = Math.round(
        (basePrice + featureCost) * complexityMultiplier * platformMultiplier
    );

    return {
        basePrice,
        featureCost,
        totalPrice,
        breakdown
    };
}

/**
 * Generate a human-readable summary of the AI analysis
 */
export function generateAnalysisSummary(aiData: AIAnalysis): string {
    const platformText = aiData.platforms.join(' + ');
    const featureCount = aiData.required_features.length;

    return `${aiData.project_type.replace('_', ' ')} for ${platformText} with ${featureCount} features (${aiData.complexity_level} complexity)`;
}

/**
 * Validate and sanitize AI output
 */
export function validateAIAnalysis(data: unknown): AIAnalysis | null {
    if (!data || typeof data !== 'object') {
        return null;
    }

    const analysis = data as any;

    // Check all required fields exist
    const requiredFields = [
        'project_type',
        'platforms',
        'idea_domain',
        'required_features',
        'complexity_level',
        'third_party_integrations',
        'risk_level',
        'admin_panel_required',
        'ai_features_required'
    ];

    for (const field of requiredFields) {
        if (!(field in analysis)) {
            console.error(`Missing required field: ${field}`);
            return null;
        }
    }

    return analysis as AIAnalysis;
}
