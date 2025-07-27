'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

function POSMainPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to tables view by default
        router.replace('/app/pos/tables');
    }, [router]);

    return (
        <div className="flex items-center justify-center h-full">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-600">
                    Loading POS System...
                </h1>
                <p className="text-gray-500 mt-2">
                    Redirecting to floor plan...
                </p>
            </div>
        </div>
    );
}

export default function POSPage() {
    return (
        <ProtectedRoute
            requiredRoles={[Role.MANAGER, Role.WAITER, Role.CASHIER]}
        >
            <POSMainPage />
        </ProtectedRoute>
    );
}
