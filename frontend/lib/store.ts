import { create } from 'zustand';
import {
    PricingInputs,
    ClientPrice,
    InternalCost,
    ProfitAnalysis,
    Timeline,
    CostBreakdown,
    RiskWarning,
    IdeaType,
    ProductFormat,
    TechStack,
    DeliverySpeed,
    SupportDuration,
    PricingConfiguration,
} from './types';
import {
    calculateClientPrice,
    calculateInternalCost,
    calculateProfit,
    calculateTimeline,
    generateClientCostBreakdown,
    generateRiskWarnings,
} from './pricing-engine';
import { AIAnalysis } from './ai-types';
import { mapAIOutputToPricingInputs } from './ai-mapper';

interface PricingState {
    // Inputs
    inputs: PricingInputs;

    // Calculated results
    clientPrice: ClientPrice | null;
    internalCost: InternalCost | null;
    profitAnalysis: ProfitAnalysis | null;
    timeline: Timeline | null;
    costBreakdown: CostBreakdown[];
    riskWarnings: RiskWarning[];

    // UI state
    currentStep: number;
    showResults: boolean;

    // AI mode
    aiMode: boolean;
    aiAnalysis: AIAnalysis | null;

    // Config
    pricingConfig: PricingConfiguration | null;

    // Actions
    setProjectDescription: (description: string) => void;
    setIdeaType: (ideaType: IdeaType) => void;
    setProductFormat: (format: ProductFormat) => void;
    setTechStack: (tech: TechStack) => void;
    toggleFeature: (featureId: string) => void;
    setDeliverySpeed: (speed: DeliverySpeed) => void;
    setSupportDuration: (duration: SupportDuration) => void;
    setCurrentStep: (step: number) => void;
    calculateResults: () => void;
    reset: () => void;

    // Config actions
    fetchPricingConfig: () => Promise<void>;

    // AI actions
    setAIMode: (enabled: boolean) => void;
    setAIAnalysis: (analysis: AIAnalysis) => void;
    populateFromAI: (analysis: AIAnalysis) => void;
    setLeadInfo: (info: { clientName: string; companyName: string; email: string; phone: string }) => void;
    analyzeProjectComplexity: () => Promise<void>;
}

const initialInputs: PricingInputs = {
    projectDescription: '',
    clientName: '',
    companyName: '',
    email: '',
    phone: '',
    ideaType: null,
    productFormat: null,
    techStack: null,
    selectedFeatures: [],
    deliverySpeed: 'standard',
    supportDuration: 'none',
    complexityLevel: 'basic',
};

export const usePricingStore = create<PricingState>((set, get) => ({
    // Initial state
    inputs: initialInputs,
    clientPrice: null,
    internalCost: null,
    profitAnalysis: null,
    timeline: null,
    costBreakdown: [],
    riskWarnings: [],
    currentStep: 0,
    showResults: false,
    aiMode: false,
    aiAnalysis: null,
    pricingConfig: null,

    // Actions
    setProjectDescription: (description) => {
        set((state) => ({
            inputs: { ...state.inputs, projectDescription: description },
        }));
    },

    setIdeaType: (ideaType) => {
        set((state) => ({
            inputs: { ...state.inputs, ideaType },
        }));
    },

    setProductFormat: (format) => {
        set((state) => ({
            inputs: { ...state.inputs, productFormat: format },
        }));
    },

    setTechStack: (tech) => {
        set((state) => ({
            inputs: { ...state.inputs, techStack: tech },
        }));
    },

    toggleFeature: (featureId) => {
        set((state) => {
            const features = state.inputs.selectedFeatures;
            const newFeatures = features.includes(featureId)
                ? features.filter((id) => id !== featureId)
                : [...features, featureId];

            return {
                inputs: { ...state.inputs, selectedFeatures: newFeatures },
            };
        });
    },

    setDeliverySpeed: (speed) => {
        set((state) => ({
            inputs: { ...state.inputs, deliverySpeed: speed },
        }));
    },

    setSupportDuration: (duration) => {
        set((state) => ({
            inputs: { ...state.inputs, supportDuration: duration },
        }));
    },

    setCurrentStep: (step) => {
        set({ currentStep: step });
    },

    calculateResults: () => {
        const { inputs, pricingConfig } = get();

        // Calculate all results using loaded config or undefined (engine falls back to default)
        const configToUse = pricingConfig || undefined;

        const clientPrice = calculateClientPrice(inputs, configToUse);
        const internalCost = calculateInternalCost(inputs, configToUse);
        const profitAnalysis = calculateProfit(clientPrice, internalCost);
        const timeline = calculateTimeline(inputs, internalCost, configToUse);
        const costBreakdown = generateClientCostBreakdown(internalCost);
        const riskWarnings = generateRiskWarnings(inputs, profitAnalysis, timeline);

        set({
            clientPrice,
            internalCost,
            profitAnalysis,
            timeline,
            costBreakdown,
            riskWarnings,
            showResults: true,
        });
    },

    reset: () => {
        set({
            inputs: initialInputs,
            clientPrice: null,
            internalCost: null,
            profitAnalysis: null,
            timeline: null,
            costBreakdown: [],
            riskWarnings: [],
            currentStep: 0,
            showResults: false,
            aiMode: false,
            aiAnalysis: null,
        });
    },

    // Config actions
    fetchPricingConfig: async () => {
        try {
            const response = await fetch('/api/admin/config');
            if (response.ok) {
                const config = await response.json();
                set({ pricingConfig: config });
                console.log('Pricing config loaded:', config);
            }
        } catch (error) {
            console.error('Failed to fetch pricing config:', error);
        }
    },

    // AI actions
    setAIMode: (enabled) => {
        set({ aiMode: enabled });
    },

    setAIAnalysis: (analysis) => {
        set({ aiAnalysis: analysis });
    },

    populateFromAI: (analysis) => {
        const aiInputs = mapAIOutputToPricingInputs(analysis);
        set((state) => ({
            inputs: { ...state.inputs, ...aiInputs },
            aiAnalysis: analysis,
            aiMode: true,
        }));

        // Automatically calculate results
        get().calculateResults();
    },

    setLeadInfo: (info) => {
        set((state) => ({
            inputs: {
                ...state.inputs,
                ...info,
            },
        }));
    },

    analyzeProjectComplexity: async () => {
        const { inputs } = get();
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5001'}/api/ai/analyze-complexity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectDescription: inputs.projectDescription,
                    features: inputs.selectedFeatures,
                    ideaType: inputs.ideaType,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('AI Complexity Analysis:', data);

                // Update store with AI findings
                set((state) => ({
                    inputs: {
                        ...state.inputs,
                        complexityLevel: data.complexityLevel,
                    },
                    riskWarnings: [
                        ...state.riskWarnings,
                        ...(data.technical_risks || []).map((risk: string) => ({
                            type: 'complexity',
                            severity: 'medium',
                            message: risk
                        }))
                    ]
                }));

                // Recalculate with new complexity
                get().calculateResults();
            }
        } catch (error) {
            console.error('Failed to analyze complexity:', error);
        }
    },
}));
