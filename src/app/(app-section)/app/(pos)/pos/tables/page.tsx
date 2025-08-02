'use client';

import { useState, useEffect } from 'react';

import { type BranchResponseDto } from '@/api/v1/branches';
import { useFloorsByBranch } from '@/api/v1/floors';
import { ProtectedRoute } from '@/components/protected-component';
import { useAuth } from '@/contexts/auth-context';
import { OdooPOSInterface } from '@/features/pos/components/OdooPOSInterface';
import { Role } from '@/lib/rbac';

// Import new Odoo-style POS interface

function POSTablesPage() {
    const { user } = useAuth();

    // State for branch selection
    const [selectedBranch, setSelectedBranch] =
        useState<BranchResponseDto | null>(null);

    // Get branch from user or selected branch
    const branchId = selectedBranch?.id || user?.branch?.id;

    // API hooks
    const { data: floors = [], isLoading: isLoadingFloors } = useFloorsByBranch(
        branchId || 0,
        false // Don't include deleted floors
    );

    // Initialize selected branch from user's branch if available
    useEffect(() => {
        if (user?.branch && !selectedBranch) {
            setSelectedBranch({
                id: user.branch.id,
                name: user.branch.name,
                address: user.branch.address || '',
                phone: user.branch.phone || '',
                status: 'ACTIVE' as const,
                createdAt: '',
                createdBy: 0,
                updatedAt: '',
                updatedBy: 0,
                createdUsername: '',
                updatedUsername: '',
            });
        }
    }, [user?.branch, selectedBranch]);

    return (
        <div className="h-screen">
            <OdooPOSInterface
                floors={floors}
                isLoading={isLoadingFloors}
                selectedBranch={selectedBranch}
                onBranchSelect={setSelectedBranch}
            />
        </div>
    );
}

export default function POSTablesPageWrapper() {
    return (
        <ProtectedRoute
            requiredRoles={[Role.MANAGER, Role.WAITER, Role.CASHIER]}
        >
            <POSTablesPage />
        </ProtectedRoute>
    );
}
