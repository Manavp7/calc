import 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            role: 'client' | 'admin' | 'company_head';
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        role: 'client' | 'admin' | 'company_head';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        role: 'client' | 'admin' | 'company_head';
    }
}
