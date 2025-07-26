'use client';

import { useParams } from 'next/navigation';

import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

// Import POS-specific components (to be created)
import { POSHeader } from '@/features/pos/components/POSHeader';
import { POSOrderInterface } from '@/features/pos/components/POSOrderInterface';

function POSTableOrderPage() {
    const params = useParams();
    const tableId = params.tableId as string;

    return (
        <div className="flex flex-col h-full">
            {/* POS Header */}
            <POSHeader 
                currentTab="register"
                tableNumber={tableId}
                branchName="Main Branch"
            />

            {/* Order Interface */}
            <div className="flex-1 overflow-hidden">
                <POSOrderInterface tableId={tableId} />
            </div>
        </div>
    );
}

export default function POSTableOrderPageWrapper() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.WAITER, Role.CASHIER]}>
            <POSTableOrderPage />
        </ProtectedRoute>
    );
}
