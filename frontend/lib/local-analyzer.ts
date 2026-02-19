import { AIAnalysis } from './ai-types';

export function analyzeIdeaLocally(text: string): AIAnalysis {
    const lowerText = text.toLowerCase();
    const features: string[] = [];
    let complexity: 'basic' | 'medium' | 'advanced' = 'basic';
    let risk: 'low' | 'medium' | 'high' = 'low';
    const integrations: string[] = [];

    // 1. Detect Features
    const keywordMap: Record<string, string[]> = {
        user_authentication: ['login', 'sign up', 'account', 'user', 'auth', 'profile', 'member', 'registration', 'access'],
        online_payments: ['pay', 'stripe', 'money', 'transaction', 'subscription', 'buy', 'sell', 'store', 'shop', 'ecommerce', 'billing', 'cart', 'checkout', 'invoice', 'clearing'],
        booking_system: ['book', 'schedule', 'reservation', 'appointment', 'calendar', 'date', 'meeting'],
        real_time_chat: ['chat', 'message', 'messaging', 'talk', 'communicate', 'dm', 'inbox'],
        admin_dashboard: ['admin', 'panel', 'dashboard', 'control', 'manage', 'analytics', 'report', 'cms', 'system', 'clearing', 'matching', 'automation'],
        ai_recommendations: ['ai', 'recommend', 'intelligence', 'robot', 'learn', 'suggest', 'ml', 'machine learning', 'gpt', 'bot', 'automation'],
        geolocation: ['map', 'location', 'gps', 'track', 'route', 'navigation', 'nearby'],
        push_notifications: ['notify', 'notification', 'alert', 'remind', 'push', 'update'],
        file_upload: ['upload', 'image', 'picture', 'file', 'video', 'document', 'media', 'gallery', 'invoice', 'bill', 'receipt'],
        social_login: ['google', 'facebook', 'social', 'oauth', 'apple'],
        search_functionality: ['search', 'find', 'filter', 'query', 'lookup', 'matching', 'clearing'],
        video_streaming: ['video', 'stream', 'live', 'zoom', 'broadcast'],
        multi_language: ['language', 'translation', 'translate', 'english', 'spanish', 'localization', 'global'],
        data_security: ['secure', 'security', 'private', 'privacy', 'encrypt', 'financial', 'clearing'],
    };

    // Always assume basic auth if not explicitly mentioned but implied by "app"
    if (lowerText.length > 50) features.push('user_authentication');

    for (const [feature, keywords] of Object.entries(keywordMap)) {
        if (keywords.some(k => lowerText.includes(k))) {
            features.push(feature);
        }
    }

    // 2. Assess Complexity
    const advancedKeywords = ['ai', 'intelligence', 'crypto', 'blockchain', 'streaming', 'real time', 'game', 'vr', 'ar'];
    const mediumKeywords = ['marketplace', 'social', 'booking', 'tracking', 'platform'];

    if (advancedKeywords.some(k => lowerText.includes(k)) || features.length > 8) {
        complexity = 'advanced';
        risk = 'high';
    } else if (mediumKeywords.some(k => lowerText.includes(k)) || features.length > 4) {
        complexity = 'medium';
        risk = 'medium';
    }

    // 3. Determine Project Type
    let projectType: any = 'website';
    if (lowerText.includes('app') && lowerText.includes('web')) projectType = 'web_and_app';
    else if (lowerText.includes('app') || lowerText.includes('ios') || lowerText.includes('android')) projectType = 'mobile_app';
    else if (lowerText.includes('ai') || lowerText.includes('intelligence')) projectType = 'ai_product';
    else if (lowerText.includes('enterprise') || lowerText.includes('saas')) projectType = 'enterprise';

    // 4. Integrations
    if (features.includes('online_payments')) integrations.push('Stripe');
    if (features.includes('geolocation')) integrations.push('Google Maps');
    if (features.includes('user_authentication')) integrations.push('Firebase Auth');
    if (features.includes('email_notifications')) integrations.push('SendGrid');
    if (features.includes('ai_recommendations')) integrations.push('OpenAI/Gemini');

    return {
        project_type: projectType,
        platforms: projectType.includes('app') ? ['web', 'ios', 'android'] : ['web'],
        idea_domain: 'custom_project',
        required_features: [...new Set(features)], // Dedupe
        complexity_level: complexity,
        third_party_integrations: integrations,
        risk_level: risk,
        admin_panel_required: features.includes('admin_dashboard') || complexity === 'advanced',
        ai_features_required: features.includes('ai_recommendations'),
        confidence: 0.5, // Low confidence for heuristic fallback
        classificationSource: 'heuristic',
        reasoning: 'Heuristic analysis based on keyword matching.',
    };
}
