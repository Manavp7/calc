import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIAnalysis } from '@/lib/ai-types';

const SYSTEM_PROMPT = `You are an **Expert Product Strategist**. Your goal is to analyze the product idea and select the **single best-fit category**, then extract structurd requirements.

### STEP 1: CATEGORY SELECTION (STRICT DECISION RULES)

1. **AI Powered Product** (Map to 'ai_product')
   - Choose ONLY if AI is the *core differentiator* (e.g., AI hiring screener, Trading bot).
   - If product loses major value without AI -> It IS an AI Product.
   - If AI just adds insights/alerts -> It is NOT an AI Product.

2. **Enterprise Software** (Map to 'enterprise')
   - Internal business operations, dashboards, ERP, CRM.
   - Multi-user, role-based, B2B focus.
   - **TIE-BREAKER**: If it looks like Enterprise Software (dashboards, workflows) BUT has AI features, classify as **Enterprise Software** with 'ai_features_required': true.

3. **Startup Product** (Map to 'startup_product')
   - Early-stage MVP, market validation focus.
   - Broad idea, evolving scope, often B2C or B2B2C.

4. **Business Website** (Map to 'website')
   - Marketing sites, landing pages, company presence.
   - Standard content, no complex business logic.

5. **Mobile App** (Map to 'mobile_app')
   - Mobile-first usage, on-the-go consumers.
   - Heavy device interaction (GPS, Camera).

6. **Website + Mobile App** (Map to 'web_and_app')
   - CLEARLY requires both platforms for consumer scale.
   - Only choose if omni-channel is essential.

### STEP 2: JSON EXTRACTION

Return ONLY valid JSON.

{
  "project_type": "website | mobile_app | web_and_app | enterprise | ai_product | startup_product",
  "platforms": ["web", "android", "ios"],
  "idea_domain": "string",
  "required_features": ["user_authentication", "online_payments", "booking_system", "admin_dashboard", "real_time_chat", "ai_recommendations", "push_notifications", "social_login", "analytics_dashboard", "file_upload", "search_functionality", "geolocation", "video_streaming", "multi_language", "email_notifications"],
  "complexity_level": "basic | medium | advanced",
  "third_party_integrations": ["string"],
  "risk_level": "low | medium | high",
  "admin_panel_required": boolean,
  "ai_features_required": boolean,
  "strategic_insights": "Detailed strategic analysis explaining the categorization.",
  "recommended_stack": ["string"]
}

### FEW-SHOT EXAMPLES

**Input:** "OpsPulse is a cloud-based enterprise operations platform with AI-driven anomaly detection."
**Logic:** It has dashboards, workflows, and role-based access (Enterprise). AI is for alerts/insights, not the core function.
**Result:** "project_type": "enterprise", "ai_features_required": true

**Input:** "Web-based dashboard to manage sales & expenses with AI alerts."
**Logic:** Internal tool + AI matches "Enterprise". AI is not core.
**Result:** "project_type": "enterprise", "ai_features_required": true

**Input:** "An AI system that predicts inventory demand and auto-purchases."
**Logic:** AI is central. Without AI, it does nothing.
**Result:** "project_type": "ai_product", "ai_features_required": true

**Input:** "A fitness tracking app for mobile users."
**Logic:** Mobile first.
**Result:** "project_type": "mobile_app", "ai_features_required": false

**Input:** "MVP to test a new food delivery concept."
**Logic:** MVP / validation focus.
**Result:** "project_type": "startup_product", "ai_features_required": false
`;

function validateAIOutput(data: any): AIAnalysis | null {
    try {
        // Check required fields
        const requiredFields = [
            'project_type',
            'platforms',
            'required_features',
            'complexity_level',
            'ai_features_required'
        ];

        for (const field of requiredFields) {
            if (!(field in data)) {
                console.error(`Missing required field: ${field}`);
                return null;
            }
        }

        // Validate enums
        const validProjectTypes = ['website', 'mobile_app', 'web_and_app', 'enterprise', 'ai_product', 'startup_product'];
        if (!validProjectTypes.includes(data.project_type)) {
            console.error(`Invalid project_type: ${data.project_type}`);
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
