'use client';

import { ProtectedRoute } from '@/components/protected-component';

// Import POS-specific components (to be created)
import { POSHeader } from '@/features/pos/components/POSHeader';
import { POSOrderInterface } from '@/features/pos/components/POSOrderInterface';
import { Role } from '@/lib/rbac';

function POSRegisterPage() {
    return (
        <div className="flex flex-col h-full">
            {/* POS Header */}
            <POSHeader
                currentTab="register"
                tableNumber={null}
                branchName="Main Branch"
            />

            {/* Order Interface */}
            <div className="flex-1 overflow-hidden">
                <POSOrderInterface />
            </div>
        </div>
    );
}

export default function POSRegisterPageWrapper() {
    return (
        <ProtectedRoute
            requiredRoles={[Role.MANAGER, Role.WAITER, Role.CASHIER]}
        >
            <POSRegisterPage />
        </ProtectedRoute>
    );
}
