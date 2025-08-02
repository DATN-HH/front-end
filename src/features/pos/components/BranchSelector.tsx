'use client';

import { Building2, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';

import { useBranches, type BranchResponseDto } from '@/api/v1/branches';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface BranchSelectorProps {
    onBranchSelect: (branch: BranchResponseDto) => void;
    selectedBranch?: BranchResponseDto | null;
}

export function BranchSelector({
    onBranchSelect,
    selectedBranch,
}: BranchSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Fetch branches
    const { data: branches = [], isLoading } = useBranches({
        page: 0,
        size: 100,
        status: 'ACTIVE',
    });

    const handleBranchSelect = (branch: BranchResponseDto) => {
        onBranchSelect(branch);
        setIsOpen(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading branches...</p>
                </div>
            </div>
        );
    }

    if (!selectedBranch) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md p-8">
                    <div className="text-center mb-6">
                        <Building2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            Select Branch
                        </h1>
                        <p className="text-gray-600">
                            Choose a branch to access the POS system
                        </p>
                    </div>

                    <div className="space-y-3">
                        {branches.map((branch) => (
                            <Button
                                key={branch.id}
                                variant="outline"
                                className="w-full justify-start p-4 h-auto hover:bg-purple-50 hover:border-purple-300"
                                onClick={() => handleBranchSelect(branch)}
                            >
                                <div className="text-left">
                                    <div className="font-medium text-gray-900">
                                        {branch.name}
                                    </div>
                                    {branch.address && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            {branch.address}
                                        </div>
                                    )}
                                </div>
                            </Button>
                        ))}
                    </div>

                    {branches.length === 0 && (
                        <div className="text-center py-8">
                            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">
                                No branches available
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        );
    }

    // Branch selector dropdown for when a branch is already selected
    return (
        <div className="relative">
            <Button
                variant="outline"
                className="w-full justify-between bg-white border-gray-300 hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center">
                    <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="font-medium">{selectedBranch.name}</span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </Button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {branches.map((branch) => (
                        <button
                            key={branch.id}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            onClick={() => handleBranchSelect(branch)}
                        >
                            <div>
                                <div className="font-medium text-gray-900">
                                    {branch.name}
                                </div>
                                {branch.address && (
                                    <div className="text-sm text-gray-500">
                                        {branch.address}
                                    </div>
                                )}
                            </div>
                            {selectedBranch.id === branch.id && (
                                <Check className="w-4 h-4 text-purple-600" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
