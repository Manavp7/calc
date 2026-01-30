import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Company Head',
};

export default function CompanyHeadLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
