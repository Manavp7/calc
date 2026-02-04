import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const analyzeProjectComplexity = async (req: Request, res: Response) => {
    try {
        const { projectDescription, features, ideaType } = req.body;

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        You are an expert software estimator. Analyze the following project details and determine its complexity level.

        Project Type: ${ideaType}
        Description: ${projectDescription}
        Selected Features: ${features.join(', ')}

        Analyze the technical requirements, potential unknowns, and integration challenges.
        
        Categorize the project into one of these 3 complexity levels:
        1. 'basic' - Standard CRUD, simple logic, few integrations.
        2. 'medium' - specific business logic, some third-party APIs, moderate customization.
        3. 'advanced' - Complex algorithms, real-time features, heavy data processing, AI/ML, or enterprise-grade security/compliance.

        Return ONLY a raw JSON object with no markdown formatting:
        {
            "complexityLevel": "basic" | "medium" | "advanced",
            "reasoning": "Short explanation of why",
            "technical_risks": ["risk 1", "risk 2"]
        }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean markdown if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonStr);

        res.json(data);

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze complexity' });
    }
};
