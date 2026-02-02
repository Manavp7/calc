import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AIAnalysis } from '@/lib/ai-types';

const SYSTEM_PROMPT = `You are a world-class software architect and product strategist. Your task is to deeply analyze project ideas and extract structured, high-quality requirements.

You must return ONLY valid JSON with no additional text.

Required JSON structure:
{
  "project_type": "website | mobile_app | web_and_app | enterprise | ai_product",
  "platforms": ["web", "android", "ios"],
  "idea_domain": "string (e.g., ecommerce, booking, education, fintech, health)",
  "required_features": ["array of feature strings"],
  "complexity_level": "basic | medium | advanced",
  "third_party_integrations": ["array of integrations"],
  "risk_level": "low | medium | high",
  "admin_panel_required": true/false,
  "ai_features_required": true/false
}

Feature strings should use snake_case and be from this list:
- user_authentication
- online_payments
- booking_system
- admin_dashboard
- real_time_chat
- ai_recommendations
- push_notifications
- social_login
- analytics_dashboard
- file_upload
- search_functionality
- geolocation
- video_streaming
- multi_language
- email_notifications

Rules:
- Return ONLY the JSON object
- No markdown, no explanations
- All fields are required
- Use lowercase for enum values
- Infer complexity from feature count and description
- Be generous with feature detection; if a user hints at something, include the relevant feature.
- Accurately assess risk and complexity based on the implied scope.

Example Input:
"I want a uber for dog walking where people can book walkers and track them."

Example Output:
{
  "project_type": "mobile_app",
  "platforms": ["android", "ios"],
  "idea_domain": "on_demand_service",
  "required_features": ["user_authentication", "booking_system", "geolocation", "real_time_chat", "online_payments", "push_notifications", "admin_dashboard"],
  "complexity_level": "advanced",
  "third_party_integrations": ["Google Maps API", "Stripe/PayPal", "Firebase"],
  "risk_level": "medium",
  "admin_panel_required": true,
  "ai_features_required": false
}

Detailed Guidelines:
1. **Complexity:** If the app involves real time tracking, video streaming, or AI, it is 'advanced'. Standard CRUD apps are 'medium'. Simple landing pages are 'basic'.
2. **Features:** Always include 'user_authentication' and 'admin_dashboard' if the app implies user accounts or management.
3. **Integrations:** Suggest real-world tools (e.g., Stripe for payments, AWS/Firebase for infrastructure).`;

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

        if (!Array.isArray(data.third_party_integrations)) {
            console.error('Invalid third_party_integrations array');
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
            // Try the verified available model or fallback to pro
            const model = genAI.getGenerativeModel({
                model: "gemini-2.0-flash", // Using the one we saw in the list
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
