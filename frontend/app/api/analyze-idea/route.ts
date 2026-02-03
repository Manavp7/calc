import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIAnalysis } from '@/lib/ai-types';

const SYSTEM_PROMPT = `You are a world-class software architect and product strategist. Your task is to deeply analyze project ideas and extract structured, high-quality requirements.

You have access to a paid, high-performance API, so be thorough and detailed.

You must return ONLY valid JSON with no additional text.

### CLIASSIFICATION RULES (STRICT)

1. **Platform Classification**
   - Classify the product into ONLY ONE platform type unless explicitly asked for multiple.
   - Browser-based or Cloud-hosted -> **web**
   - Mobile store release -> **android** / **ios**
   - Do NOT infer "mobile_app" just because a site is "responsive".

2. **AI Role Classification**
   - **Core AI Product**: The product CANNOT function without AI (e.g., Midjourney, ChatGPT). Map to 'ai_product'.
   - **AI-Enhanced Software**: The product works without AI, but AI adds value (e.g., Sales Dashboard with AI insights). Map to 'website' or 'mobile_app' with 'ai_features_required': true.
   - **Non-AI Software**: No AI features.

### FEW-SHOT TRAINING EXAMPLES

✅ **Example 1 (AI-Enhanced Web App)**
Input: "A web-based dashboard for sales tracking with AI-generated insights."
Output Logic:
- Platform: Web Application
- AI Classification: AI-Enhanced (Not Core)
- Result: "project_type": "website", "ai_features_required": true

✅ **Example 2 (Core AI Product)**
Input: "An LLM that generates legal contracts."
Output Logic:
- Platform: API/Web
- AI Classification: Core AI
- Result: "project_type": "ai_product", "ai_features_required": true

✅ **Example 3 (Standard Web App)**
Input: "A browser-based invoicing tool."
Output Logic:
- Platform: Web Application
- AI Classification: Non-AI
- Result: "project_type": "website", "ai_features_required": false

### FINAL VALIDATION CHECK
- ❓ Can the product work without AI? -> Yes -> Do NOT select 'ai_product'.
- ❓ Is installation required on a phone? -> No -> Do NOT select 'mobile_app'.

### REQUIRED JSON OUTPUT FORMAT
{
  "project_type": "website | mobile_app | web_and_app | enterprise | ai_product",
  "platforms": ["web", "android", "ios"],
  "idea_domain": "string (e.g., fintech, health, ecommerce)",
  "required_features": ["array of feature strings (snake_case)"],
  "complexity_level": "basic | medium | advanced",
  "third_party_integrations": ["array of strings"],
  "risk_level": "low | medium | high",
  "admin_panel_required": true/false,
  "ai_features_required": true/false,
  "strategic_insights": "Detailed strategic analysis (2-3 paragraphs). Explain the classification logic used.",
  "recommended_stack": ["Next.js", "React Native", "PostgreSQL", "etc"]
}

Feature strings list:
- user_authentication, online_payments, booking_system, admin_dashboard, real_time_chat, ai_recommendations, push_notifications, social_login, analytics_dashboard, file_upload, search_functionality, geolocation, video_streaming, multi_language, email_notifications
`;

function validateAIOutput(data: any): AIAnalysis | null {
    try {
        // Check required fields
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
            // strategic_insights and recommended_stack are optional in type but we want them if possible
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                console.error(`Missing required field: ${field}`);
                return null;
            }
        }

        // Validate enums
        const validProjectTypes = ['website', 'mobile_app', 'web_and_app', 'enterprise', 'ai_product'];
        if (!validProjectTypes.includes(data.project_type)) {
            console.error(`Invalid project_type: ${data.project_type}`);
            return null;
        }

        const validComplexity = ['basic', 'medium', 'advanced'];
        if (!validComplexity.includes(data.complexity_level)) {
            console.error(`Invalid complexity_level: ${data.complexity_level}`);
            return null;
        }

        const validRisk = ['low', 'medium', 'high'];
        if (!validRisk.includes(data.risk_level)) {
            console.error(`Invalid risk_level: ${data.risk_level}`);
            return null;
        }

        // Validate arrays
        if (!Array.isArray(data.platforms) || data.platforms.length === 0) {
            console.error('Invalid platforms array');
            return null;
        }

        if (!Array.isArray(data.required_features)) {
            console.error('Invalid required_features array');
            return null;
        }

        return data as AIAnalysis;
    } catch (error) {
        console.error('Validation error:', error);
        return null;
    }
}


// Import logic
import { analyzeIdeaLocally } from '@/lib/local-analyzer';

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

        // --- TRY 1: GEMINI API ---
        try {
            if (!process.env.GEMINI_API_KEY) throw new Error('No API Key');

            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            // Using gemini-1.5-pro for maximum reasoning capability
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-pro",
                generationConfig: { responseMimeType: "application/json" }
            });

            const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this project description:\n\n${ideaText}\n\nReturn the JSON object.`;
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            if (!responseText) throw new Error('Empty AI response');

            const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsedData = JSON.parse(cleanText);
            const aiAnalysis = validateAIOutput(parsedData);

            if (aiAnalysis) {
                return NextResponse.json({ success: true, analysis: aiAnalysis });
            }

        } catch (apiError: any) {
            console.warn('⚠️ Gemini API Failed (Quota or Error), switching to Local Fallback:', apiError.message);
            // Proceed to fallback...
        }

        // --- FALBACK: LOCAL ALGORITHM ---
        console.log('🔄 Running Local Analysis Fallback...');
        const localAnalysis = analyzeIdeaLocally(ideaText);

        // Simulating a short delay so it feels like "processing"
        await new Promise(r => setTimeout(r, 1500));

        return NextResponse.json({
            success: true,
            analysis: localAnalysis,
            source: 'local_heuristic' // Optional debug flag
        });

    } catch (error: any) {
        console.error('Critical Error in analyze-idea:', error);
        // Last resort fallback if even local logic explodes (unlikely)
        return NextResponse.json(
            { error: 'Failed to analyze idea.' },
            { status: 500 }
        );
    }
}
