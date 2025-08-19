import { SelfOrderClient } from './client';

// This is a Server Component
interface SelfOrderPageProps {
    params: Promise<{
        orderId: string;
    }>;
}

export default async function SelfOrderPage({ params }: SelfOrderPageProps) {
    const { orderId } = await params;
    return <SelfOrderClient orderId={orderId} />;
}
