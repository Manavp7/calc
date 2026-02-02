import { dbConnect } from './db';
import { User } from './models';
import bcrypt from 'bcryptjs';

export async function seedDefaultUsers() {
    try {
        await dbConnect();

        // Check if users already exist
        const existingAdmin = await User.findOne({ email: 'admin@example.com' });
        const existingHead = await User.findOne({ email: 'head@example.com' });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: 'admin@example.com',
                name: 'Admin User',
                password: hashedPassword,
                role: 'admin',
            });
            console.log('✅ Admin user created');
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        if (!existingHead) {
            const hashedPassword = await bcrypt.hash('head123', 10);
            await User.create({
                email: 'head@example.com',
                name: 'Company Head',
                password: hashedPassword,
                role: 'company_head',
            });
            console.log('✅ Company Head user created');
        } else {
            console.log('ℹ️  Company Head user already exists');
        }

        return { success: true };
    } catch (error) {
        console.error('Error seeding users:', error);
        return { success: false, error };
    }
}
