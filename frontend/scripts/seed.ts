import bcrypt from 'bcryptjs';
import { dbConnect } from '../lib/db';
import { User, PricingConfig, TeamConfig } from '../lib/models';
import { IDEA_COSTS, TECH_MULTIPLIERS, DELIVERY_MULTIPLIERS, SUPPORT_COSTS, HOURLY_RATES } from '../lib/constants';
import { FEATURES_DATA } from '../lib/pricing-data';

async function seed() {
    await dbConnect();

    console.log('🌱 Seeding database...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.findOneAndUpdate(
        { email: 'admin@example.com' },
        {
            email: 'admin@example.com',
            name: 'Admin User',
            password: adminPassword,
            role: 'admin',
        },
        { upsert: true, new: true }
    );
    console.log('✅ Admin user created:', admin.email);

    // Create company head user
    const companyHeadPassword = await bcrypt.hash('head123', 10);
    const companyHead = await User.findOneAndUpdate(
        { email: 'head@example.com' },
        {
            email: 'head@example.com',
            name: 'Company Head',
            password: companyHeadPassword,
            role: 'company_head',
        },
        { upsert: true, new: true }
    );
    console.log('✅ Company Head user created:', companyHead.email);

    // Create initial pricing configuration
    const featureCosts: Record<string, number> = {};
    FEATURES_DATA.forEach(feature => {
        const totalHours = Object.values(feature.baseHours).reduce((sum, h) => sum + h, 0);
        featureCosts[feature.id] = totalHours * 80; // Average rate
    });

    const pricingConfig = await PricingConfig.findOneAndUpdate(
        { version: 1 },
        {
            version: 1,
            isActive: true,
            baseIdeaCosts: IDEA_COSTS,
            featureCosts,
            techMultipliers: TECH_MULTIPLIERS,
            complexityMultipliers: {
                low: 1.0,
                medium: 1.2,
                high: 1.5,
            },
            timelineMultipliers: DELIVERY_MULTIPLIERS,
            supportPricing: SUPPORT_COSTS,
            createdBy: admin._id,
        },
        { upsert: true, new: true }
    );
    console.log('✅ Pricing config created: version', pricingConfig.version);

    // Create initial team configuration
    const teamConfig = await TeamConfig.findOneAndUpdate(
        { isActive: true },
        {
            roles: [
                {
                    name: 'frontend',
                    hourlyRate: HOURLY_RATES.frontend,
                    defaultHours: {
                        'business-website': 120,
                        'mobile-app': 150,
                        'website-mobile-app': 200,
                        'startup-product': 180,
                        'enterprise-software': 250,
                        'ai-powered-product': 200,
                    },
                },
                {
                    name: 'backend',
                    hourlyRate: HOURLY_RATES.backend,
                    defaultHours: {
                        'business-website': 80,
                        'mobile-app': 120,
                        'website-mobile-app': 180,
                        'startup-product': 200,
                        'enterprise-software': 300,
                        'ai-powered-product': 250,
                    },
                },
                {
                    name: 'designer',
                    hourlyRate: HOURLY_RATES.designer,
                    defaultHours: {
                        'business-website': 60,
                        'mobile-app': 80,
                        'website-mobile-app': 100,
                        'startup-product': 90,
                        'enterprise-software': 120,
                        'ai-powered-product': 100,
                    },
                },
                {
                    name: 'qa',
                    hourlyRate: HOURLY_RATES.qa,
                    defaultHours: {
                        'business-website': 40,
                        'mobile-app': 60,
                        'website-mobile-app': 80,
                        'startup-product': 70,
                        'enterprise-software': 100,
                        'ai-powered-product': 80,
                    },
                },
                {
                    name: 'pm',
                    hourlyRate: HOURLY_RATES.pm,
                    defaultHours: {
                        'business-website': 30,
                        'mobile-app': 40,
                        'website-mobile-app': 50,
                        'startup-product': 45,
                        'enterprise-software': 60,
                        'ai-powered-product': 50,
                    },
                },
            ],
            overhead: 0.15,
            riskBufferMin: 0.10,
            riskBufferMax: 0.20,
            infrastructureCost: 5000,
            isActive: true,
            createdBy: admin._id,
        },
        { upsert: true, new: true }
    );
    console.log('✅ Team config created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Company Head: head@example.com / head123');

    process.exit(0);
}

seed().catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
});
