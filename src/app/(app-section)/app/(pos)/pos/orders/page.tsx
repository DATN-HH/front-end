'use client';

import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

// Import POS-specific components (to be created)
import { POSHeader } from '@/features/pos/components/POSHeader';
import { POSOrdersList } from '@/features/pos/components/POSOrdersList';

function POSOrdersPage() {
    return (
        <div className="flex flex-col h-full">
            {/* POS Header */}
            <POSHeader
                currentTab="orders"
                tableNumber={null}
                branchName="Main Branch"
            />

            {/* Orders List */}
            <div className="flex-1 overflow-hidden">
                <POSOrdersList />
            </div>
        </div>
    );
}

export default function POSOrdersPageWrapper() {
    return (
        <ProtectedRoute
            requiredRoles={[Role.MANAGER, Role.WAITER, Role.CASHIER]}
        >
            <POSOrdersPage />
        </ProtectedRoute>
    );
}
