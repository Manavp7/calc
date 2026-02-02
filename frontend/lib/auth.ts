import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { UserRole } from '@/types/next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';


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
                        throw new Error('Missing credentials');
                    }

                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
                    console.log(`📡 [Auth] Connecting to backend at ${backendUrl}...`);

                    const res = await fetch(`${backendUrl}/api/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: credentials.email,
                            password: credentials.password,
                        }),
                    });

                    const user = await res.json();

                    if (!res.ok) {
                        console.log('❌ [Auth] Backend rejected login:', user.message);
                        throw new Error(user.message || 'Login failed');
                    }

                    console.log('✅ [Auth] Authorization successful');
                    return user;
                } catch (error) {
                    console.error('🚨 [Auth] Authorization error:', error);
                    throw error;
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
