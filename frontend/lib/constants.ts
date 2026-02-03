import { IdeaType, ProductFormat, TechStack, DeliverySpeed, SupportDuration } from './types';

// Idea Type Options
export const IDEA_TYPES = [
    {
        id: 'business-website' as IdeaType,
        title: 'Business Website',
        description: 'Professional website for your business',
        icon: '🌐',
    },
    {
        id: 'mobile-app' as IdeaType,
        title: 'Mobile App',
        description: 'Native mobile application',
        icon: '📱',
    },
    {
        id: 'website-mobile-app' as IdeaType,
        title: 'Website + Mobile App',
        description: 'Complete digital presence',
        icon: '🚀',
    },
    {
        id: 'startup-product' as IdeaType,
        title: 'Startup Product',
        description: 'MVP for your startup idea',
        icon: '💡',
    },
    {
        title: 'Enterprise Software',
        description: 'Large scale business solution',
        icon: '🏢',
    },
    {
        id: 'ai-powered-product' as IdeaType,
        title: 'AI Powered Product',
        description: 'Intelligent application with AI',
        icon: '🤖',
    },
];

// Product Format Options
export const PRODUCT_FORMATS = [
    {
        id: 'website' as ProductFormat,
        title: 'Website',
        description: 'Web based application',
    },
    {
        id: 'mobile-app' as ProductFormat,
        title: 'Mobile App',
        description: 'iOS & Android app',
    },
    {
        id: 'website-and-app' as ProductFormat,
        title: 'Website + App',
        description: 'Both platforms',
    },
    {
        id: 'full-ecosystem' as ProductFormat,
        title: 'Full Ecosystem',
        description: 'App + Web + Admin',
    },
];

// Technology Options
export const TECH_STACKS = [
    {
        id: 'react-nextjs' as TechStack,
        title: 'React / Next.js',
        description: 'Modern web framework',
    },
    {
        id: 'react-native' as TechStack,
        title: 'React Native',
        description: 'Cross platform mobile',
    },
    {
        id: 'flutter' as TechStack,
        title: 'Flutter',
        description: 'Google\'s UI toolkit',
    },
    {
        id: 'vue-nuxt' as TechStack,
        title: 'Vue.js / Nuxt',
        description: 'Progressive framework',
    },
    {
        id: 'angular' as TechStack,
        title: 'Angular',
        description: 'Enterprise framework',
    },
    {
        id: 'nodejs' as TechStack,
        title: 'Node.js',
        description: 'JavaScript runtime',
    },
    {
        id: 'python-django' as TechStack,
        title: 'Python / Django',
        description: 'Powerful backend',
    },
    {
        id: 'native-ios' as TechStack,
        title: 'Native iOS',
        description: 'Swift / SwiftUI',
    },
    {
        id: 'native-android' as TechStack,
        title: 'Native Android',
        description: 'Kotlin / Jetpack',
    },
    {
        id: 'expert-choice' as TechStack,
        title: 'Let Experts Decide',
        description: 'We\'ll recommend the best fit',
    },
];

// Functional Needs (Grouped)
export const FEATURE_GROUPS = {
    'core-experience': {
        title: 'Core Experience',
        features: [
            { id: 'user-accounts', name: 'User Accounts', description: 'Registration & login' },
            { id: 'content-management', name: 'Content Management', description: 'Manage your content' },
            { id: 'search', name: 'Search', description: 'Find content quickly' },
        ],
    },
    'business-operations': {
        title: 'Business Operations',
        features: [
            { id: 'payments', name: 'Payments', description: 'Accept payments online' },
            { id: 'subscriptions', name: 'Subscriptions', description: 'Recurring billing' },
            { id: 'analytics', name: 'Analytics', description: 'Track user behavior' },
        ],
    },
    'growth-engagement': {
        title: 'Growth & Engagement',
        features: [
            { id: 'notifications', name: 'Notifications', description: 'Push & email alerts' },
            { id: 'chat', name: 'Chat', description: 'Real time messaging' },
            { id: 'ai-recommendations', name: 'AI Recommendations', description: 'Personalized suggestions' },
        ],
    },
    'trust-safety': {
        title: 'Trust & Safety',
        features: [
            { id: 'admin-control', name: 'Admin Control', description: 'Manage your platform' },
            { id: 'data-security', name: 'Data Security', description: 'Enterprise grade security' },
            { id: 'backups', name: 'Backups', description: 'Automated data backups' },
        ],
    },
};

// Delivery Speed Options
export const DELIVERY_SPEEDS = [
    {
        id: 'standard' as DeliverySpeed,
        title: 'Standard',
        description: 'Normal timeline',
        multiplier: 1.0,
    },
    {
        id: 'faster' as DeliverySpeed,
        title: 'Faster Go Live',
        description: '20% faster delivery',
        multiplier: 1.3,
    },
    {
        id: 'priority' as DeliverySpeed,
        title: 'Priority Launch',
        description: '40% faster delivery',
        multiplier: 1.6,
    },
];

// Support & Maintenance Options
export const SUPPORT_PACKAGES = [
    {
        id: 'none' as SupportDuration,
        title: 'No Support',
        description: 'One time delivery',
        monthlyCost: 0,
        monthlyHours: 0,
    },
    {
        id: '3-months' as SupportDuration,
        title: '3 Months',
        description: 'Quarterly support',
        monthlyHours: 15,
    },
    {
        id: '6-months' as SupportDuration,
        title: '6 Months',
        description: 'Semiannual support',
        monthlyHours: 20,
    },
    {
        id: '12-months' as SupportDuration,
        title: '12 Months',
        description: 'Annual support',
        monthlyHours: 25,
    },
];

// Client-Facing Cost Breakdown Labels
export const CLIENT_COST_CATEGORIES = [
    {
        label: 'Product Engineering',
        color: '#0ea5e9',
        description: 'Building your product features',
    },
    {
        label: 'UX & Design',
        color: '#8b5cf6',
        description: 'User experience and visual design',
    },
    {
        label: 'Business Logic & Automation',
        color: '#ec4899',
        description: 'Backend systems and workflows',
    },
    {
        label: 'QA & Testing',
        color: '#10b981',
        description: 'Testing and quality assurance',
    },
    {
        label: 'Security & Data Protection',
        color: '#f59e0b',
        description: 'Keeping your data safe',
    },
    {
        label: 'Product Management',
        color: '#6366f1',
        description: 'Coordination and delivery',
    },
    {
        label: 'Infrastructure & Tools',
        color: '#14b8a6',
        description: 'Hosting and development tools',
    },
    {
        label: 'Support & Risk Coverage',
        color: '#ef4444',
        description: 'Maintenance and contingency',
    },
];

// Hourly Rates
export const HOURLY_RATES = {
    frontend: 35, // Product Engineering
    backend: 35,  // Business Logic & Automation
    designer: 35, // UI / UX Design
    qa: 25,       // Quality Assurance & Testing
    pm: 45,       // Project Management
    infrastructure: 35, // Infrastructure & Tools
    security: 35, // Security & Data Protection
    support: 35, // Support & Risk Coverage
};

export const DEFAULT_CLIENT_HOURLY_RATE = 180; // Updated to maintain margin with new internal rates

// Role Display Labels
export const ROLE_LABELS: Record<string, string> = {
    frontend: 'Product Engineering',
    backend: 'Business Logic & Automation',
    designer: 'UI / UX Design',
    qa: 'QA & Testing',
    pm: 'Product Management',
    infrastructure: 'Infrastructure & Tools',
    security: 'Security & Data Protection',
    support: 'Support & Risk Coverage',
};

// Overhead & Risk
export const OVERHEAD_PERCENTAGE = 0.15; // 15%
export const RISK_BUFFER_MIN = 0.10; // 10%
export const RISK_BUFFER_MAX = 0.20; // 20%

// Dynamic Hourly Rates by Idea Type (User Request)
export const DYNAMIC_HOURLY_RATES: Record<string, number> = {
    'business-website': 45,
    'startup-product': 50,
    'mobile-app': 60,
    'website-mobile-app': 75,
    'ai-powered-product': 95,
    'enterprise software': 150,
};

// Sanity Caps (Circuit Breakers)
export const MAX_PRICE_CAPS: Record<string, number> = {
    'business-website': 25000,
    'startup-product': 85000,
    'mobile-app': 100000,
    'website-mobile-app': 120000,
    'ai-powered-product': 150000,
    // Enterprise has no hard cap, but we rely on the rate
};

// Export pricing constants for database seeding
export const IDEA_COSTS: Record<IdeaType, number> = {
    'business-website': 15000,
    'mobile-app': 25000,
    'website-mobile-app': 40000,
    'startup-product': 50000,
    'enterprise software': 100000,
    'ai-powered-product': 80000,
};

export const TECH_MULTIPLIERS: Record<string, number> = {
    'react-nextjs': 1.0,
    'react-native': 1.2,
    'flutter': 1.2,
    'expert-choice': 1.0,
    'vue-nuxt': 1.1,
    'angular': 1.1,
    'nodejs': 1.0,
    'python-django': 1.3,
    'native-ios': 1.5,
    'native-android': 1.5
};

export const DELIVERY_MULTIPLIERS: Record<DeliverySpeed, number> = {
    'standard': 1.0,
    'faster': 1.3,
    'priority': 1.6,
};

export const SUPPORT_COSTS: Record<SupportDuration, number> = {
    'none': 0,
    '3-months': 6000,  // 3 * 2000
    '6-months': 10800, // 6 * 1800
    '12-months': 18000, // 12 * 1500
};

export const SUPPORT_HOURS: Record<SupportDuration, number> = {
    'none': 0,
    '3-months': 15,
    '6-months': 20,
    '12-months': 25,
};
