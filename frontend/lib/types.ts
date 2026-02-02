// Pricing System Types

export type IdeaType =
    | 'business-website'
    | 'mobile-app'
    | 'website-mobile-app'
    | 'startup-product'
    | 'enterprise software'
    | 'ai-powered-product';

export type ProductFormat =
    | 'website'
    | 'mobile-app'
    | 'website-and-app'
    | 'full-ecosystem';

export type TechStack =
    | 'react-nextjs'
    | 'react-native'
    | 'flutter'
    | 'vue-nuxt'
    | 'angular'
    | 'nodejs'
    | 'python-django'
    | 'native-ios'
    | 'native-android'
    | 'expert-choice';

export type DeliverySpeed =
    | 'standard'
    | 'faster'
    | 'priority';

export type SupportDuration =
    | 'none'
    | '3-months'
    | '6-months'
    | '12-months';

export type FeatureCategory =
    | 'core-experience'
    | 'business-operations'
    | 'growth-engagement'
    | 'trust-safety';

export interface Feature {
    id: string;
    name: string;
    category: FeatureCategory;
    description: string;
    baseHours: {
        frontend: number;
        backend: number;
        designer: number;
        qa: number;
        pm: number;
    };
}

export interface PricingInputs {
    projectDescription: string; // Client's project description

    // Contact Details
    clientName: string;
    companyName: string;
    email: string;
    phone: string;

    ideaType: IdeaType | null;
    productFormat: ProductFormat | null;
    techStack: TechStack | null;
    selectedFeatures: string[];
    deliverySpeed: DeliverySpeed;
    supportDuration: SupportDuration;
    complexityLevel?: 'basic' | 'medium' | 'advanced';
}

export interface RoleCost {
    role: 'frontend' | 'backend' | 'designer' | 'qa' | 'pm' | 'infrastructure' | 'security' | 'support';
    hours: number;
    hourlyRate: number;
    totalCost: number;
}

export interface InternalCost {
    laborCosts: RoleCost[];
    totalLaborCost: number;
    infrastructureCost: number;
    overheadCost: number;
    riskBuffer: number;
    totalInternalCost: number;
}

export interface ClientPrice {
    basePrice: number;
    featuresCost: number;
    techMultiplier: number;
    complexityMultiplier: number;
    timelineMultiplier: number;
    supportCost: number;
    totalPrice: number;
    priceRange: {
        min: number;
        max: number;
    };
    totalDevHours?: number; // Added for hourly breakdown
    totalSupportHours?: number; // Added for hourly breakdown
    hourlyRate?: number; // Added for hourly breakdown
}

export interface ProfitAnalysis {
    clientPrice: number;
    internalCost: number;
    profit: number;
    profitMargin: number;
    healthStatus: 'healthy' | 'warning' | 'critical';
}

export interface Timeline {
    phases: {
        name: string;
        duration: number; // in weeks
    }[];
    totalWeeks: number;
    teamSize: {
        min: number;
        max: number;
    };
}

export interface CostBreakdown {
    label: string;
    percentage: number;
    amount: number; // Dollar amount for this category
    color: string;
    description: string;
}

export interface RiskWarning {
    type: 'timeline' | 'margin' | 'complexity' | 'stakeholder';
    severity: 'low' | 'medium' | 'high';
    message: string;
}

export interface RoleHours {
    frontend: number;
    backend: number;
    designer: number;
    qa: number;
    pm: number;
}

export interface PricingConfiguration {
    baseIdeaHours: Record<IdeaType, RoleHours>;
    techMultipliers: Record<TechStack, number>;
    formatMultipliers: Record<ProductFormat, number>;
    timelineMultipliers: Record<DeliverySpeed, number>;
    complexityMultipliers: {
        basic: number;
        medium: number;
        advanced: number;
    };
    infrastructureCosts: Record<IdeaType, number>;
    supportPackages: Record<SupportDuration, number>;
    featureBaseCost: number;
    featureCosts: Record<string, number>;
    clientHourlyRate: number;
    supportHours: Record<SupportDuration, number>;
    hourlyRates: {
        frontend: number;
        backend: number;
        designer: number;
        qa: number;
        pm: number;
        infrastructure: number;
        security: number;
        support: number;
    };
}
