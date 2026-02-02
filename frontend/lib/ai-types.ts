// AI Analysis Types
export interface AIAnalysis {
    project_type: 'website' | 'mobile_app' | 'web_and_app' | 'enterprise' | 'ai_product';
    platforms: ('web' | 'android' | 'ios')[];
    idea_domain: string;
    required_features: string[];
    complexity_level: 'basic' | 'medium' | 'advanced';
    third_party_integrations: string[];
    risk_level: 'low' | 'medium' | 'high';
    admin_panel_required: boolean;
    ai_features_required: boolean;
}

export interface FeatureMapping {
    [key: string]: {
        category: string;
        cost: number;
        description: string;
    };
}

// Feature cost mappings
export const FEATURE_COSTS: FeatureMapping = {
    user_authentication: {
        category: 'User Management',
        cost: 5000,
        description: 'User registration, login, password reset'
    },
    online_payments: {
        category: 'Payment Integration',
        cost: 10000,
        description: 'Payment gateway integration (Stripe/PayPal)'
    },
    booking_system: {
        category: 'Custom Logic',
        cost: 12000,
        description: 'Booking/reservation system with calendar'
    },
    admin_dashboard: {
        category: 'Admin Panel',
        cost: 8000,
        description: 'Admin panel for management'
    },
    real_time_chat: {
        category: 'Communication',
        cost: 15000,
        description: 'Real time chat/messaging'
    },
    ai_recommendations: {
        category: 'AI/ML',
        cost: 20000,
        description: 'AI-powered recommendations'
    },
    push_notifications: {
        category: 'Notifications',
        cost: 4000,
        description: 'Push notification system'
    },
    social_login: {
        category: 'Authentication',
        cost: 3000,
        description: 'Social media login (Google, Facebook)'
    },
    analytics_dashboard: {
        category: 'Analytics',
        cost: 7000,
        description: 'Analytics and reporting dashboard'
    },
    file_upload: {
        category: 'Storage',
        cost: 5000,
        description: 'File upload and management'
    },
    search_functionality: {
        category: 'Search',
        cost: 6000,
        description: 'Advanced search with filters'
    },
    geolocation: {
        category: 'Location',
        cost: 8000,
        description: 'GPS/location-based features'
    },
    video_streaming: {
        category: 'Media',
        cost: 18000,
        description: 'Video streaming capabilities'
    },
    multi_language: {
        category: 'Localization',
        cost: 5000,
        description: 'Multi-language support'
    },
    email_notifications: {
        category: 'Notifications',
        cost: 3000,
        description: 'Email notification system'
    }
};

// Complexity multipliers
export const COMPLEXITY_MULTIPLIERS = {
    basic: 1.0,
    medium: 1.3,
    advanced: 1.6
};

// Platform multipliers
export const PLATFORM_MULTIPLIERS: { [key: string]: number } = {
    web: 1.0,
    android: 1.2,
    ios: 1.2,
    'android,ios': 1.5,
    'web,android': 1.4,
    'web,ios': 1.4,
    'web,android,ios': 1.8
};

// Base project costs
export const PROJECT_TYPE_COSTS = {
    website: 4000,
    mobile_app: 8000,
    web_and_app: 12000,
    enterprise: 25000,
    ai_product: 15000
};
