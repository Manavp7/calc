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
        case 'startup_product':
            inputs.ideaType = 'startup-product';
            inputs.productFormat = 'website-and-app' as ProductFormat;
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

    // Map features using smart selection logic
    inputs.selectedFeatures = applyImplicitFeatures(aiData);

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
 * Smart Logic: deterministic feature selection based on project context
 */
function applyImplicitFeatures(aiData: AIAnalysis): string[] {
    const features = new Set<string>();

    // 1. Normalize AI suggestions (snake_case from Prompt -> kebab-case from UI/Pricing constant)
    const normalizedSuggestions = normalizeAIFeatures(aiData.required_features || []);
    normalizedSuggestions.forEach(f => features.add(f));

    const { complexity_level, project_type } = aiData;
    const isStatic = project_type === 'website' && complexity_level === 'basic';

    // 2. Feature Auto-Selection Matrix (by Complexity)

    // BASIC
    if (complexity_level === 'basic') {
        // Nothing by default
    }

    // STANDARD
    if (['medium', 'advanced'].includes(complexity_level) && !isStatic) {
        features.add('user-accounts');   // User registration
        features.add('admin-control');   // Admin panel
        features.add('notifications');   // Email notification
        features.add('file-uploads');    // File upload
    }

    // ADVANCED
    if (complexity_level === 'advanced') {
        features.add('user-accounts');
        features.add('admin-control');
        features.add('notifications');
        features.add('file-uploads');
        features.add('analytics');       // Analytics
        features.add('search');          // Advanced Search
    }

    // ENTERPRISE (treated as superset of Advanced usually, but mapped via project_type 'enterprise')
    if (project_type === 'enterprise') {
        features.add('user-accounts');
        features.add('admin-control');
        features.add('notifications');
        features.add('file-uploads');
        features.add('analytics');
        features.add('search');
        features.add('data-security');   // Role-based admin / Security
        features.add('backups');         // Monitoring & logs proxy
        // multi-language not in pricing constants, skipping to respect "pricing logic untouched"
    }

    // 3. Project-Type-Based Overrides

    // Calculator / Utility (Simulated by 'website' + 'basic', or specific heuristic)
    // If specifically a "utility tool" (hard to detect without prompt text, but let's assume Basic Website might be it)
    if (project_type === 'website' && complexity_level === 'basic') {
        features.delete('user-accounts');
        features.delete('admin-control');
        features.delete('notifications');
        features.delete('analytics'); // advanced analytics
    }

    // Web App / SaaS (mobile_app, web_and_app, startup_product, ai_product)
    if (['mobile_app', 'web_and_app', 'startup_product', 'ai_product'].includes(project_type)) {
        features.add('user-accounts');
        features.add('admin-control');
        features.add('notifications');
        features.add('file-uploads');
    }

    // Marketplace (heuristic: needs payments + booking/subscriptions)
    if (project_type === 'startup_product' && normalizedSuggestions.includes('payments')) {
        // If suggest payments, likely marketplace-ish
        features.add('payments');
        // features.add('booking-system'); // Only if implicit? User said "Marketplace ... booking".
        // Let's be safe and only add if context suggests, or if specifically requested.
        // For now, if AI suggested 'online_payments', 'payments' is added.
    }

    // Enterprise / AI Specifics
    if (project_type === 'ai_product') {
        features.add('ai-recommendations');
    }

    return Array.from(features);
}

/**
 * Maps snake_case AI output to kebab-case frontend constants
 */
function normalizeAIFeatures(aiFeatures: string[]): string[] {
    const mapping: Record<string, string> = {
        'user_authentication': 'user-accounts',
        'online_payments': 'payments',
        'booking_system': 'booking-system',
        'admin_dashboard': 'admin-control',
        'real_time_chat': 'chat',
        'ai_recommendations': 'ai-recommendations',
        'push_notifications': 'notifications',
        'email_notifications': 'notifications', // Map both to generic notifications
        'social_login': 'social-login',
        'analytics_dashboard': 'analytics',
        'file_upload': 'file-uploads',
        'search_functionality': 'search',
        'geolocation': 'geolocation', // Not in pricing-data? Check.
        'video_streaming': 'video-calls', // Check mapping
        'multi_language': 'multi-language', // Not in pricing-data, will be ignored by engine but nice to have in state
        'data_security': 'data-security',
        'backups': 'backups',
        'compliance': 'compliance'
    };

    return aiFeatures.map(f => mapping[f] || f); // Fallback to original if no mapping found (e.g. valid kebab)
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
