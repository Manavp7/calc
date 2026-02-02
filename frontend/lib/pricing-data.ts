import { Feature, IdeaType, ProductFormat, TechStack } from './types';

// Feature to Effort Mapping (in hours per role)
export const FEATURES_DATA: Feature[] = [
    // Core Experience
    {
        id: 'user-accounts',
        name: 'User Accounts',
        category: 'core-experience',
        description: 'Registration, login, profile management',
        baseHours: {
            frontend: 40,
            backend: 60,
            designer: 20,
            qa: 25,
            pm: 15,
        },
    },
    {
        id: 'social-login',
        name: 'Social Login',
        category: 'core-experience',
        description: 'Login with Google, Facebook, Apple',
        baseHours: {
            frontend: 25,
            backend: 35,
            designer: 15,
            qa: 20,
            pm: 10,
        },
    },
    {
        id: 'content-management',
        name: 'Content Management',
        category: 'core-experience',
        description: 'CMS for managing content',
        baseHours: {
            frontend: 60,
            backend: 80,
            designer: 30,
            qa: 35,
            pm: 20,
        },
    },
    {
        id: 'search',
        name: 'Search',
        category: 'core-experience',
        description: 'Full-text search functionality',
        baseHours: {
            frontend: 30,
            backend: 50,
            designer: 15,
            qa: 20,
            pm: 10,
        },
    },
    {
        id: 'file-uploads',
        name: 'File Uploads',
        category: 'core-experience',
        description: 'Upload and manage files/images',
        baseHours: {
            frontend: 35,
            backend: 45,
            designer: 20,
            qa: 25,
            pm: 12,
        },
    },
    // Business Operations
    {
        id: 'payments',
        name: 'Payments',
        category: 'business-operations',
        description: 'Payment processing integration',
        baseHours: {
            frontend: 50,
            backend: 70,
            designer: 25,
            qa: 40,
            pm: 20,
        },
    },
    {
        id: 'subscriptions',
        name: 'Subscriptions',
        category: 'business-operations',
        description: 'Recurring billing system',
        baseHours: {
            frontend: 45,
            backend: 65,
            designer: 20,
            qa: 35,
            pm: 18,
        },
    },
    {
        id: 'analytics',
        name: 'Analytics',
        category: 'business-operations',
        description: 'User behavior tracking',
        baseHours: {
            frontend: 35,
            backend: 55,
            designer: 25,
            qa: 20,
            pm: 12,
        },
    },
    {
        id: 'booking-system',
        name: 'Booking System',
        category: 'business-operations',
        description: 'Appointments and reservations',
        baseHours: {
            frontend: 60,
            backend: 75,
            designer: 30,
            qa: 40,
            pm: 22,
        },
    },
    {
        id: 'invoicing',
        name: 'Invoicing',
        category: 'business-operations',
        description: 'Generate and manage invoices',
        baseHours: {
            frontend: 40,
            backend: 50,
            designer: 20,
            qa: 25,
            pm: 15,
        },
    },
    {
        id: 'reporting',
        name: 'Reporting',
        category: 'business-operations',
        description: 'Custom reports and dashboards',
        baseHours: {
            frontend: 50,
            backend: 60,
            designer: 30,
            qa: 30,
            pm: 18,
        },
    },
    // Growth & Engagement
    {
        id: 'notifications',
        name: 'Notifications',
        category: 'growth-engagement',
        description: 'Push and email notifications',
        baseHours: {
            frontend: 40,
            backend: 60,
            designer: 20,
            qa: 25,
            pm: 15,
        },
    },
    {
        id: 'chat',
        name: 'Chat',
        category: 'growth-engagement',
        description: 'Real time messaging',
        baseHours: {
            frontend: 70,
            backend: 90,
            designer: 35,
            qa: 45,
            pm: 25,
        },
    },
    {
        id: 'ai-recommendations',
        name: 'AI Recommendations',
        category: 'growth-engagement',
        description: 'ML-powered personalization',
        baseHours: {
            frontend: 50,
            backend: 120,
            designer: 30,
            qa: 40,
            pm: 30,
        },
    },
    {
        id: 'email-marketing',
        name: 'Email Marketing',
        category: 'growth-engagement',
        description: 'Email campaigns and automation',
        baseHours: {
            frontend: 45,
            backend: 55,
            designer: 25,
            qa: 30,
            pm: 18,
        },
    },
    {
        id: 'video-calls',
        name: 'Video Calls',
        category: 'growth-engagement',
        description: 'Video conferencing integration',
        baseHours: {
            frontend: 60,
            backend: 70,
            designer: 30,
            qa: 40,
            pm: 22,
        },
    },
    {
        id: 'reviews-ratings',
        name: 'Reviews & Ratings',
        category: 'growth-engagement',
        description: 'User reviews and rating system',
        baseHours: {
            frontend: 40,
            backend: 50,
            designer: 25,
            qa: 30,
            pm: 15,
        },
    },
    // Trust & Safety
    {
        id: 'admin-control',
        name: 'Admin Control',
        category: 'trust-safety',
        description: 'Admin dashboard and controls',
        baseHours: {
            frontend: 80,
            backend: 70,
            designer: 40,
            qa: 35,
            pm: 20,
        },
    },
    {
        id: 'data-security',
        name: 'Data Security',
        category: 'trust-safety',
        description: 'Security hardening and compliance',
        baseHours: {
            frontend: 20,
            backend: 80,
            designer: 10,
            qa: 50,
            pm: 25,
        },
    },
    {
        id: 'backups',
        name: 'Backups',
        category: 'trust-safety',
        description: 'Automated backup system',
        baseHours: {
            frontend: 10,
            backend: 40,
            designer: 5,
            qa: 15,
            pm: 8,
        },
    },
    {
        id: 'compliance',
        name: 'Compliance',
        category: 'trust-safety',
        description: 'GDPR, HIPAA, SOC2 compliance',
        baseHours: {
            frontend: 30,
            backend: 60,
            designer: 15,
            qa: 40,
            pm: 20,
        },
    },
];

// Base costs for different idea types (in USD)
export const BASE_IDEA_COSTS: Record<IdeaType, number> = {
    'business-website': 15000,
    'mobile-app': 25000,
    'website-mobile-app': 40000,
    'startup-product': 50000,
    'enterprise software': 100000,
    'ai-powered-product': 80000,
};

// Base hours for different idea types (foundation work)
export const BASE_IDEA_HOURS: Record<IdeaType, {
    frontend: number;
    backend: number;
    designer: number;
    qa: number;
    pm: number;
}> = {
    'business-website': {
        frontend: 80,
        backend: 40,
        designer: 60,
        qa: 30,
        pm: 20,
    },
    'mobile-app': {
        frontend: 120,
        backend: 80,
        designer: 80,
        qa: 50,
        pm: 30,
    },
    'website-mobile-app': {
        frontend: 200,
        backend: 120,
        designer: 120,
        qa: 80,
        pm: 50,
    },
    'startup-product': {
        frontend: 180,
        backend: 150,
        designer: 100,
        qa: 80,
        pm: 60,
    },
    'enterprise software': {
        frontend: 300,
        backend: 350,
        designer: 150,
        qa: 200,
        pm: 120,
    },
    'ai-powered-product': {
        frontend: 200,
        backend: 250,
        designer: 120,
        qa: 120,
        pm: 80,
    },
};

// Technology stack multipliers
export const TECH_MULTIPLIERS: Record<TechStack, number> = {
    'react-nextjs': 1.0,
    'react-native': 1.15,
    'flutter': 1.1,
    'vue-nuxt': 1.0,
    'angular': 1.05,
    'nodejs': 1.0,
    'python-django': 1.05,
    'native-ios': 1.2,
    'native-android': 1.2,
    'expert-choice': 1.0,
};

// Product format multipliers
export const FORMAT_MULTIPLIERS: Record<ProductFormat, number> = {
    'website': 1.0,
    'mobile-app': 1.2,
    'website-and-app': 1.8,
    'full-ecosystem': 2.2,
};

// Explicit complexity multipliers from AI analysis
export const AI_COMPLEXITY_MULTIPLIERS = {
    'basic': 1.0,
    'medium': 1.25,
    'advanced': 1.6,
};

// Infrastructure costs (monthly, will be calculated for project duration)
export const INFRASTRUCTURE_COSTS: Record<IdeaType, number> = {
    'business-website': 100,
    'mobile-app': 200,
    'website-mobile-app': 300,
    'startup-product': 500,
    'enterprise software': 2000,
    'ai-powered-product': 1500,
};

// Risk buffer based on complexity
export const getComplexityMultiplier = (featureCount: number): number => {
    if (featureCount <= 3) return 1.0;
    if (featureCount <= 6) return 1.15;
    if (featureCount <= 9) return 1.3;
    return 1.5;
};

// Risk buffer based on complexity
export const getRiskBuffer = (featureCount: number, hasAI: boolean): number => {
    let buffer = 0.10; // Base 10%

    if (featureCount > 6) buffer += 0.03;
    if (featureCount > 9) buffer += 0.02;
    if (hasAI) buffer += 0.05;

    return Math.min(buffer, 0.20); // Cap at 20%
};

import { PricingConfiguration } from './types';
import { DELIVERY_MULTIPLIERS, SUPPORT_COSTS, DEFAULT_CLIENT_HOURLY_RATE, SUPPORT_HOURS, HOURLY_RATES } from './constants';

export const DEFAULT_CONFIG: PricingConfiguration = {
    baseIdeaHours: BASE_IDEA_HOURS,
    techMultipliers: TECH_MULTIPLIERS,
    formatMultipliers: FORMAT_MULTIPLIERS,
    timelineMultipliers: DELIVERY_MULTIPLIERS,
    complexityMultipliers: AI_COMPLEXITY_MULTIPLIERS,
    infrastructureCosts: INFRASTRUCTURE_COSTS,
    supportPackages: SUPPORT_COSTS,
    featureBaseCost: 5000,
    featureCosts: {}, // Empty by default, falling back to featureBaseCost
    clientHourlyRate: DEFAULT_CLIENT_HOURLY_RATE,
    supportHours: SUPPORT_HOURS,
    hourlyRates: HOURLY_RATES,
};
