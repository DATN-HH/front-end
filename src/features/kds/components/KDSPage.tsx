'use client';

import React, { useState } from 'react';
import { KDSBranchSelection } from './KDSBranchSelection';
import { KDSKanbanBoard } from './KDSKanbanBoard';

export function KDSPage() {
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

    const handleBranchSelect = (branchId: number) => {
        setSelectedBranch(branchId);
    };

    const handleBackToBranchSelection = () => {
        setSelectedBranch(null);
    };

    if (!selectedBranch) {
        return <KDSBranchSelection onBranchSelect={handleBranchSelect} />;
    }

    return (
        <KDSKanbanBoard 
            branchId={selectedBranch} 
            onBack={handleBackToBranchSelection} 
        />
    );
}
