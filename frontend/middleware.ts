import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    const { pathname } = request.nextUrl;

    // Skip authentication for login page
    if (pathname.startsWith('/company-head/login')) {
        return NextResponse.next();
    }

    // Protect admin routes
    if (pathname.startsWith('/admin')) {
        if (!token) {
            return NextResponse.redirect(new URL('/company-head/login?callbackUrl=/admin', request.url));
        }

        if (token.role !== 'admin') {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Protect company-head routes (company head + admin)
    if (pathname.startsWith('/company-head')) {
        if (!token) {
            return NextResponse.redirect(new URL('/company-head/login?callbackUrl=/company-head', request.url));
        }

        if (!['admin', 'company_head'].includes(token.role as string)) {
            return NextResponse.redirect(new URL('/unauthorized', request.url));
        }
    }

    // Protect admin API routes
    if (pathname.startsWith('/api/admin')) {
        if (!token || token.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // Protect company-head API routes
    if (pathname.startsWith('/api/company-head')) {
        if (!token || !['admin', 'company_head'].includes(token.role as string)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/company-head/:path*',
        '/api/admin/:path*',
        '/api/company-head/:path*',
    ],
};
