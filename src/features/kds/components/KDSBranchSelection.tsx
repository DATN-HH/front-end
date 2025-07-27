'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Clock, ChefHat, Loader2 } from 'lucide-react';
import { useKDSBranches } from '@/api/v1/kds-orders';



interface KDSBranchSelectionProps {
    onBranchSelect: (branchId: number) => void;
}

export function KDSBranchSelection({ onBranchSelect }: KDSBranchSelectionProps) {
    const [selectedBranch, setSelectedBranch] = useState<number | null>(null);

    // Use real API call
    const { data: branches, isLoading, error } = useKDSBranches();

    const handleBranchSelect = (branchId: number) => {
        setSelectedBranch(branchId);
    };

    const handleContinue = () => {
        if (selectedBranch) {
            onBranchSelect(selectedBranch);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading branches...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load branches</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <ChefHat className="h-8 w-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
                    </div>
                    <p className="text-gray-600">Select a branch to access the kitchen display</p>
                </div>

                {/* Branch Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {branches?.map((branch) => (
                        <Card
                            key={branch.id}
                            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                                selectedBranch === branch.id
                                    ? 'ring-2 ring-blue-500 shadow-lg'
                                    : 'hover:shadow-md'
                            } ${
                                branch.status === 'offline'
                                    ? 'opacity-60 cursor-not-allowed'
                                    : ''
                            }`}
                            onClick={() => branch.status === 'online' && handleBranchSelect(branch.id)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5 text-blue-600" />
                                        <CardTitle className="text-lg">{branch.name}</CardTitle>
                                    </div>
                                    <Badge
                                        variant={branch.status === 'online' ? 'default' : 'secondary'}
                                        className={
                                            branch.status === 'online'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-600'
                                        }
                                    >
                                        {branch.status}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{branch.address}</p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {/* Order Statistics */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center p-2 bg-orange-50 rounded-lg">
                                            <div className="text-lg font-bold text-orange-600">
                                                {branch.pendingOrders}
                                            </div>
                                            <div className="text-xs text-orange-700">To Cook</div>
                                        </div>
                                        <div className="text-center p-2 bg-blue-50 rounded-lg">
                                            <div className="text-lg font-bold text-blue-600">
                                                {branch.activeOrders}
                                            </div>
                                            <div className="text-xs text-blue-700">Active</div>
                                        </div>
                                    </div>

                                    {/* Staff Count */}
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                        <Users className="h-4 w-4" />
                                        <span>{branch.staff} staff online</span>
                                    </div>

                                    {/* Last Update */}
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        <span>Updated 2 min ago</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Continue Button */}
                <div className="text-center">
                    <Button
                        onClick={handleContinue}
                        disabled={!selectedBranch}
                        className="px-8 py-3 text-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
                    >
                        Continue to Kitchen Display
                    </Button>
                </div>
            </div>
        </div>
    );
}
