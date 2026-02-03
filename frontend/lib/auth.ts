import { getServerSession } from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import type { UserRole } from '@/types/next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { dbConnect } from '@/lib/db';
import { User } from '@/lib/models';
import bcrypt from 'bcryptjs';


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
                        return null;
                    }

                    await dbConnect();

                    // Case-insensitive email search
                    const email = credentials.email.toLowerCase();
                    const user = await User.findOne({ email });

                    if (!user) {
                        console.log('❌ [Auth] User not found:', email);
                        return null;
                    }

                    // Check password
                    // Try bcrypt first
                    let isValid = await bcrypt.compare(credentials.password, user.password);

                    // Fallback for plain text passwords (legacy/demo data)
                    if (!isValid && user.password === credentials.password) {
                        console.log('⚠️ [Auth] Allowing plain text password match for:', email);
                        isValid = true;
                    }

                    if (!isValid) {
                        console.log('❌ [Auth] Invalid password for:', email);
                        return null;
                    }

                    console.log('✅ [Auth] Authorization successful for:', email);
                    return {
                        id: user._id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role,
                    };
                } catch (error) {
                    console.error('🚨 [Auth] Authorization error:', error);
                    return null;
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
