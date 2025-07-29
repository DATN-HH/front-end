'use client';

import React, { useState, useEffect } from 'react';
import { KDSBranchSelection } from './KDSBranchSelection';
import { KDSKanbanBoard } from './KDSKanbanBoard';
import { useAuth } from '@/contexts/auth-context';

export function KDSPage() {
    const { user } = useAuth();
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

    const handleBranchSelect = (branchId: number) => {
        setSelectedBranch(branchId);
    };

    const handleBackToBranchSelection = () => {
        setSelectedBranch(null);
    };

    // Auto-select user's branch if available
    useEffect(() => {
        if (user?.branch?.id && !selectedBranch) {
            setSelectedBranch(user.branch.id);
        }
    }, [user?.branch?.id, selectedBranch]);

    // If user has a branch assigned, skip selection and go directly to KDS board
    if (user?.branch?.id && selectedBranch === user.branch.id) {
        return (
            <KDSKanbanBoard
                branchId={user.branch.id}
                onBack={handleBackToBranchSelection}
            />
        );
    }

    // If no branch selected and user doesn't have a branch assigned, show selection
    if (!selectedBranch) {
        return <KDSBranchSelection onBranchSelect={handleBranchSelect} />;
    }

    // Show KDS board for manually selected branch
    return (
        <KDSKanbanBoard
            branchId={selectedBranch}
            onBack={handleBackToBranchSelection}
        />
    );
}
