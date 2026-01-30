import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function getCurrentUser() {
    const session = await getSession();
    return session?.user;
}

export function hasRole(userRole: string, allowedRoles: string[]) {
    return allowedRoles.includes(userRole);
}

export function isAdmin(userRole: string) {
    return userRole === 'admin';
}

export function isCompanyHead(userRole: string) {
    return userRole === 'company_head';
}

export function canEditConfigs(userRole: string) {
    return userRole === 'admin';
}

export function canViewDashboard(userRole: string) {
    return ['admin', 'company_head'].includes(userRole);
}
