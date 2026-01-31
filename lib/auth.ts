import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { UserRole } from '@/types/next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    console.log('🔐 [Auth] Starting authorization for:', credentials?.email);

                    if (!credentials?.email || !credentials?.password) {
                        console.log('❌ [Auth] Missing credentials');
                        throw new Error('Invalid credentials');
                    }

                    console.log('📡 [Auth] Connecting to database...');
                    await dbConnect();
                    console.log('✅ [Auth] Database connected');

                    const user = await User.findOne({ email: credentials.email });
                    console.log('👤 [Auth] User lookup result:', user ? 'Found' : 'Not Found');

                    if (!user) {
                        console.log('❌ [Auth] User not found');
                        throw new Error('No user found with this email');
                    }

                    const isPasswordValid = await bcrypt.compare(
                        credentials.password,
                        user.password
                    );
                    console.log('🔑 [Auth] Password valid:', isPasswordValid);

                    if (!isPasswordValid) {
                        console.log('❌ [Auth] Invalid password');
                        throw new Error('Invalid password');
                    }

                    console.log('✅ [Auth] Authorization successful');
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('🚨 [Auth] Authorization error:', error);
                    throw error; // Rethrow to let NextAuth handle it
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        },
    },
    pages: {
        signIn: '/company-head/login',
        error: '/company-head/login', // Redirect errors back to login page
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    // Fix for Vercel deployments where NEXTAUTH_URL might not be set
    trustHost: true,
};

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]) {
    return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: UserRole) {
    return userRole === 'admin';
}

export function isCompanyHead(userRole: UserRole) {
    return userRole === 'company_head';
}

export function canEditConfigs(userRole: UserRole) {
    return userRole === 'admin';
}

export function canViewDashboard(userRole: UserRole) {
    return ['admin', 'company_head'].includes(userRole);
}
