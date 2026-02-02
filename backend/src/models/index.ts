import mongoose, { Schema, Document, Model } from 'mongoose';

// User Model
export interface IUser extends Document {
    email: string;
    name: string;
    password: string;
    role: 'client' | 'admin' | 'company_head';
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['client', 'admin', 'company_head'],
        default: 'client',
        required: true
    },
}, { timestamps: true });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Pricing Configuration Model
export interface IPricingConfig extends Document {
    version: number;
    isActive: boolean;
    baseIdeaCosts: {
        'business-website': number;
        'mobile-app': number;
        'website-mobile-app': number;
        'startup-product': number;
        'enterprise-software': number;
        'ai-powered-product': number;
    };
    featureCosts: Record<string, number>;
    techMultipliers: {
        'react-nextjs': number;
        'react-native': number;
        'flutter': number;
        'expert-choice': number;
    };
    complexityMultipliers: {
        low: number;
        medium: number;
        high: number;
    };
    timelineMultipliers: {
        standard: number;
        faster: number;
        priority: number;
    };
    supportPricing: {
        none: number;
        '3-months': number;
        '6-months': number;
        '12-months': number;
    };
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const PricingConfigSchema = new Schema<IPricingConfig>({
    version: { type: Number, required: true },
    isActive: { type: Boolean, default: false },
    baseIdeaCosts: {
        'business-website': { type: Number, required: true },
        'mobile-app': { type: Number, required: true },
        'website-mobile-app': { type: Number, required: true },
        'startup-product': { type: Number, required: true },
        'enterprise software': { type: Number, required: true },
        'ai-powered-product': { type: Number, required: true },
    },
    featureCosts: { type: Map, of: Number, required: true },
    techMultipliers: {
        'react-nextjs': { type: Number, required: true },
        'react-native': { type: Number, required: true },
        'flutter': { type: Number, required: true },
        'expert-choice': { type: Number, required: true },
    },
    complexityMultipliers: {
        low: { type: Number, required: true },
        medium: { type: Number, required: true },
        high: { type: Number, required: true },
    },
    timelineMultipliers: {
        standard: { type: Number, required: true },
        faster: { type: Number, required: true },
        priority: { type: Number, required: true },
    },
    supportPricing: {
        none: { type: Number, required: true },
        '3-months': { type: Number, required: true },
        '6-months': { type: Number, required: true },
        '12-months': { type: Number, required: true },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const PricingConfig: Model<IPricingConfig> =
    mongoose.models.PricingConfig || mongoose.model<IPricingConfig>('PricingConfig', PricingConfigSchema);

// Team Configuration Model
export interface ITeamConfig extends Document {
    roles: {
        name: string;
        hourlyRate: number;
        defaultHours: Record<string, number>;
    }[];
    overhead: number;
    riskBufferMin: number;
    riskBufferMax: number;
    infrastructureCost: number;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const TeamConfigSchema = new Schema<ITeamConfig>({
    roles: [{
        name: { type: String, required: true },
        hourlyRate: { type: Number, required: true },
        defaultHours: { type: Map, of: Number, required: true },
    }],
    overhead: { type: Number, required: true, default: 0.15 },
    riskBufferMin: { type: Number, required: true, default: 0.10 },
    riskBufferMax: { type: Number, required: true, default: 0.20 },
    infrastructureCost: { type: Number, required: true, default: 5000 },
    isActive: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const TeamConfig: Model<ITeamConfig> =
    mongoose.models.TeamConfig || mongoose.model<ITeamConfig>('TeamConfig', TeamConfigSchema);

// Project/Quote Model
export interface IProject extends Document {
    clientName?: string;
    companyName?: string; // NEW
    clientEmail?: string;
    clientPhone?: string; // NEW
    projectDescription?: string; // NEW: Client's project description
    aiAnalysis?: {  // NEW: AI analysis data if AI flow was used
        project_type: string;
        platforms: string[];
        idea_domain: string;
        required_features: string[];
        complexity_level: string;
        third_party_integrations: string[];
        risk_level: string;
        admin_panel_required: boolean;
        ai_features_required: boolean;
    };
    inputs: {
        ideaType: string;
        productFormat: string;
        techStack?: string;
        selectedFeatures: string[];
        deliverySpeed: string;
        supportDuration: string;
    };
    clientPrice: {
        min: number;
        max: number;
        timeline: number;
        teamSizeMin: number;
        teamSizeMax: number;
    };
    timelineDetails?: { // NEW
        totalWeeks: number;
        phases: {
            name: string;
            duration: number;
        }[];
    };
    internalCost: {
        totalLaborCost: number;
        infrastructureCost: number;
        overheadCost: number;
        riskBuffer: number;
        totalCost: number;
        laborCosts: {
            role: string;
            hours: number;
            hourlyRate: number;
            totalCost: number;
        }[];
    };
    profitAnalysis: {
        clientPrice: number;
        internalCost: number;
        profit: number;
        profitMargin: number;
        healthStatus: string;
    };
    configVersionUsed: number;
    teamConfigUsed: mongoose.Types.ObjectId;
    status: 'draft' | 'sent' | 'accepted' | 'rejected';
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>({
    clientName: { type: String },
    companyName: { type: String }, // NEW
    clientEmail: { type: String },
    clientPhone: { type: String }, // NEW
    projectDescription: { type: String }, // NEW
    aiAnalysis: {  // NEW
        project_type: String,
        platforms: [String],
        idea_domain: String,
        required_features: [String],
        complexity_level: String,
        third_party_integrations: [String],
        risk_level: String,
        admin_panel_required: Boolean,
        ai_features_required: Boolean,
    },
    inputs: {
        ideaType: { type: String, required: true },
        productFormat: { type: String, required: true },
        techStack: { type: String },
        selectedFeatures: [{ type: String }],
        deliverySpeed: { type: String, required: true },
        supportDuration: { type: String, required: true },
    },
    clientPrice: {
        min: { type: Number, required: true },
        max: { type: Number, required: true },
        timeline: { type: Number, required: true },
        teamSizeMin: { type: Number, required: true },
        teamSizeMax: { type: Number, required: true },
    },
    timelineDetails: {
        totalWeeks: { type: Number },
        phases: [{
            name: String,
            duration: Number
        }]
    },
    internalCost: {
        totalLaborCost: { type: Number, required: true },
        infrastructureCost: { type: Number, required: true },
        overheadCost: { type: Number, required: true },
        riskBuffer: { type: Number, required: true },
        totalCost: { type: Number, required: true },
        laborCosts: [{
            role: { type: String, required: true },
            hours: { type: Number, required: true },
            hourlyRate: { type: Number, required: true },
            totalCost: { type: Number, required: true },
        }],
    },
    profitAnalysis: {
        clientPrice: { type: Number, required: true },
        internalCost: { type: Number, required: true },
        profit: { type: Number, required: true },
        profitMargin: { type: Number, required: true },
        healthStatus: { type: String, required: true },
    },
    configVersionUsed: { type: Number, required: true },
    teamConfigUsed: { type: Schema.Types.ObjectId, ref: 'TeamConfig' },
    status: {
        type: String,
        enum: ['draft', 'sent', 'accepted', 'rejected'],
        default: 'draft'
    },
}, { timestamps: true });

export const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

// Audit Log Model
export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    resourceType: 'pricing_config' | 'team_config' | 'project' | 'user';
    resourceId?: mongoose.Types.ObjectId;
    changes: Record<string, any>;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resourceType: {
        type: String,
        enum: ['pricing_config', 'team_config', 'project', 'user'],
        required: true
    },
    resourceId: { type: Schema.Types.ObjectId },
    changes: { type: Map, of: Schema.Types.Mixed, required: true },
    metadata: { type: Map, of: Schema.Types.Mixed },
}, { timestamps: true });

export const AuditLog: Model<IAuditLog> =
    mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
