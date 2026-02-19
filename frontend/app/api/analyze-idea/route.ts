import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIAnalysis } from '@/lib/ai-types';

const SYSTEM_PROMPT = `You are an **Expert Product Strategist**. Your goal is to analyze the product idea and select the **single best-fit category**, then extract structured requirements using EXACTLY the IDs provided below.

### STEP 1: CATEGORY SELECTION (CRITICAL)
Analyze the user's intent to choose the correct 'project_type'.

**1. 'mobile-app'**
   - TRIGGERS: "App", "iOS", "Android", "Phone", "Mobile", "Downloadable".
   - Use this if the user wants a standalone mobile application.

**2. 'business-website'**
   - TRIGGERS: "Site", "Website", "Landing Page", "Portfolio", "Company Profile".
   - Use this for informational, marketing, or static content sites.
   - DO NOT use this if the user wants complex logins, dashboards, or SaaS features.

**3. 'startup-product' (Web App / SaaS)**
   - TRIGGERS: "Platform", "SaaS", "Portal", "Dashboard", "Tool", "Service".
   - Use this for web-based applications with functional logic (e.g., Airbnb clone, CRM, SaaS tool).
   - If it runs in a browser but does "work", it is a startup-product, NOT a business-website.

**4. 'website-mobile-app'**
   - TRIGGERS: "App and Website", "Cross-platform", "Full solution".
   - Use this if the user clearly wants BOTH a web dashboard and a mobile app.

**5. 'enterprise-software'**
   - TRIGGERS: "Internal", "ERP", "HR System", "Inventory", "Employee Management".
   - Focused on B2B, internal tools, and large-scale data.

**6. 'ai-powered-product'**
   - TRIGGERS: "AI", "Machine Learning", "GPT", "Bot", "Automation".
   - ONLY select this if AI is the CENTRAL value proposition.

### STEP 2: FEATURE DETECTION (LOGICAL INFERENCE)
You are an Architect, not just a keyword matcher. You must infer the **NECESSARY INFRASTRUCTURE** for the idea to work.

**CRITICAL RULE: "SaaS Baseline"**
If the idea is a **B2B tool, Dashboard, CRM, or SaaS**, it AUTOMATICALLY requires:
1. 'user-accounts' (Multi-tenant login)
2. 'admin-control' (To manage users/data)
3. 'analytics' (To see usage/stats)
4. 'notifications' (Email alerts)
5. 'search' (To find records)
6. 'data-security' (Role-based access)

**SPECIFIC DOMAIN TRIGGERS (Apply these strictly):**

**Invoice / Finance / Billing Systems:**
- IF idea involves "Invoices", "Matching", "Clearing", "Billing":
- MUST INCLUDE: 'file-uploads' (for invoice PDFs), 'search' (filtering invoices), 'reporting' (exporting data), 'admin-control' (approvals), 'notifications' (status updates).
- EXTRACT: 'invoicing', 'payments'.

**Marketplaces / E-commerce:**
- IF idea involves "Buying", "Selling", "Store":
- MUST INCLUDE: 'payments', 'search', 'reviews-ratings', 'chat'.

**Core Experience:**
- 'user-accounts': Login, profiles, dashboard access.
- 'social-login': Fast onboarding (Google/SSO).
- 'content-management': CMS, blog, editing capability.
- 'search': Filtering, looking up records (Required for any data-heavy app).
- 'file-uploads': Images, Documents, PDF parsing.

**Business Operations:**
- 'payments': Stripe, Subscription, unexpected charges.
- 'subscriptions': SaaS pricing, monthly plans.
- 'analytics': Dashboards, charts, performance metrics.
- 'booking-system': Scheduling, calendar, timeline.
- 'invoicing': Generating/Sending Bills, Invoice matching.
- 'reporting': Exporting CSV/PDF, monthly summaries.

**Growth & Engagement:**
- 'notifications': Email/Push alerts for status changes.
- 'chat': Support chat, internal messaging.
- 'ai-recommendations': Smart matching, insights, auto-suggestions.
- 'reviews-ratings': Feedback loops.
- 'multi-language': Support for multiple languages (Implied by "Global", "International").

**Trust & Administration:**
- 'admin-control': Super-admin panel to manage tenants/users.
- 'data-security': Roles, permissions, encryption.
- 'backups': Data integrity.
- 'compliance': Audit logs, legal requirements.

### STEP 3: JSON OUTPUT
Return ONLY valid JSON.

{
  "project_type": "One of the valid IDs above",
  "reasoning": "Brief explanation of why this category was chosen",
  "platforms": ["web", "android", "ios"],
  "required_features": ["Array of selected feature IDs"],
  "complexity_level": "basic | medium | advanced",
  "ai_features_required": boolean
}
`;

function validateAIOutput(data: any): AIAnalysis | null {
    try {
        // Normalization fixes for common AI quirks
        if (data.project_type === 'mobile_app') data.project_type = 'mobile-app';
        if (data.project_type === 'web_app') data.project_type = 'startup-product'; // Common hallucination
        if (data.project_type === 'website') data.project_type = 'business-website';

        // Check required fields (relaxed)
        if (!data.required_features || !Array.isArray(data.required_features)) {
            data.required_features = [];
        }

        // Validate enums (Updated to match exact IDs)
        const validProjectTypes = ['business-website', 'mobile-app', 'website-mobile-app', 'startup-product', 'enterprise-software', 'ai-powered-product'];

        // Auto-correct invalid project types to closest match
        if (!validProjectTypes.includes(data.project_type)) {
            console.warn(`AI returned invalid project_type: ${data.project_type}. Defaulting to startup-product.`);
            data.project_type = 'startup-product';
        }

        // Ensure platforms exist
        if (!data.platforms || !Array.isArray(data.platforms)) {
            if (data.project_type === 'mobile-app') data.platforms = ['ios', 'android'];
            else if (data.project_type === 'website-mobile-app') data.platforms = ['web', 'ios', 'android'];
            else data.platforms = ['web'];
        }

        // Add dummy fields if missing to satisfy strict parsing downstream
        if (!data.idea_domain) data.idea_domain = 'General';
        if (!data.risk_level) data.risk_level = 'low';
        if (data.ai_features_required === undefined) data.ai_features_required = false;

        return data as AIAnalysis;
    } catch (error) {
        console.error('Validation error:', error);
        return null; // Fallback to local if truly broken
    }
}


// Import logic
import { analyzeIdeaLocally } from '@/lib/local-analyzer';
import { geminiCircuitBreaker } from '@/lib/circuit-breaker';

export async function POST(request: NextRequest) {
    let ideaText = '';

    try {
        const body = await request.json();
        ideaText = body.ideaText;

        if (!ideaText || typeof ideaText !== 'string' || ideaText.trim().length < 20) {
            return NextResponse.json(
                { error: 'Please provide a detailed project description (at least 20 characters)' },
                { status: 400 }
            );
        }

        // --- LAYER 1: CIRCUIT BREAKER + AI CHECK ---
        let aiAnalysis: AIAnalysis | null = null;
        let source: 'ai' | 'heuristic' | 'heuristic_emergency' = 'ai';

        try {
            if (!process.env.GEMINI_API_KEY) {
                console.error("CRITICAL: Missing GEMINI_API_KEY");
                // HARD STOP RULE: Do not guess if API key is missing. This is a configuration error.
                throw new Error('API_KEY_MISSING');
            }

            // Circuit Breaker Execution
            aiAnalysis = await geminiCircuitBreaker.execute(async () => {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

                // Upgraded to Gemini 2.5 Pro (Latest Verified) for superior reasoning
                const model = genAI.getGenerativeModel({
                    model: "gemini-2.5-pro",
                    generationConfig: { responseMimeType: "application/json" }
                });

                const fewShotExamples = `
### EXAMPLES (STRICTLY FOLLOW THIS PATTERN)

Example 1:
Input: "A basic company website with contact forms and CMS for a local business."
Output:
{
  "project_type": "business-website",
  "reasoning": "User wants a simple informational site with basic content management.",
  "platforms": ["web"],
  "required_features": ["content-management", "contact-form"],
  "complexity_level": "basic",
  "ai_features_required": false
}

Example 2:
Input: "An enterprise SaaS platform with analytics, role-based access, and AI forecasting."
Output:
{
  "project_type": "enterprise-software",
  "reasoning": "B2B SaaS implies complex roles, high data volume, and analytics.",
  "platforms": ["web"],
  "required_features": ["user-accounts", "admin-control", "analytics", "data-security"],
  "complexity_level": "advanced",
  "ai_features_required": true
}
`;

                const prompt = `${SYSTEM_PROMPT}\n${fewShotExamples}\n\nAnalyze this project description:\nInput: "${ideaText}"\n\nReturn the JSON object.`;

                // Set explicit timeout for API call (15 seconds)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 15000);

                try {
                    const result = await model.generateContent({
                        contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    }, { signal: controller.signal } as any); // Type cast for signal support if needed

                    clearTimeout(timeoutId);
                    const responseText = result.response.text();

                    if (!responseText) throw new Error('Empty AI response');

                    console.log('🤖 Raw AI Response:', responseText.substring(0, 200) + '...');

                    const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const parsedData = JSON.parse(cleanText);
                    const validated = validateAIOutput(parsedData);

                    if (!validated) throw new Error('Schema Validation Failed');

                    // High confidence check
                    return {
                        ...validated,
                        confidence: 0.95, // AI is usually high confidence if schema passes
                        classificationSource: 'ai' as const
                    };

                } catch (err) {
                    clearTimeout(timeoutId);
                    throw err;
                }
            });

        } catch (apiError: any) {
            console.warn('⚠️ Layer 1 (AI) Failed:', apiError.message);

            // --- CRITICAL FAILURE HANDLING (NO HALT REOUESTED) ---
            if (apiError.message === 'API_KEY_MISSING' || apiError.message.includes('Circuit breaker is OPEN')) {
                console.error('🛑 Critical Failure (Auth/Circuit) -> Triggering Emergency Fallback (Silent)');
                source = 'heuristic_emergency';
            } else {
                // Normal timeout/quota error
                source = 'heuristic';
            }
        }

        // --- LAYER 2: HEURISTIC FALLBACK ---
        if (!aiAnalysis) {
            console.log('🔄 Logic Fallback: Running Heuristic Analysis...');
            aiAnalysis = analyzeIdeaLocally(ideaText);
            // Keep existing source if it was set to emergency
            if (source !== 'heuristic_emergency') source = 'heuristic';
        }

        // --- FINAL RESPONSE ---
        return NextResponse.json({
            success: true,
            analysis: aiAnalysis,
            source: source
        });

    } catch (error: any) {
        console.error('Critical Error in analyze-idea:', error);
        return NextResponse.json(
            { error: 'Failed to analyze idea.' },
            { status: 500 }
        );
    }
}
