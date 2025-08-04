'use client';

import { Percent, Save, Edit3, Settings } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
    usePreOrderConfig,
    useUpdatePreOrderConfig,
    PreOrderConfigRequest,
} from '@/api/v1/pre-order-config';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

export function DepositConfigCard() {
    const { user } = useAuth();
    const { success, error: toastError } = useCustomToast();
    const [isEditing, setIsEditing] = useState(false);
    const [depositPercentage, setDepositPercentage] = useState<number>(15);

    // Fetch current config
    const {
        data: config,
        isLoading,
        error,
    } = usePreOrderConfig(user?.branch.id || 0);

    // Update mutation
    const updateConfigMutation = useUpdatePreOrderConfig();

    // Set initial value when config is loaded
    useEffect(() => {
        if (config) {
            setDepositPercentage(config.depositPercentage);
        }
    }, [config]);

    const handleSave = async () => {
        // Validation
        if (depositPercentage < 0 || depositPercentage > 100) {
            toastError(
                'Invalid Value',
                'Deposit percentage must be between 0 and 100'
            );
            return;
        }

        if (!user?.branch.id) {
            toastError('Error', 'Branch information not available');
            return;
        }

        try {
            const request: PreOrderConfigRequest = {
                branchId: user.branch.id,
                depositPercentage,
            };

            await updateConfigMutation.mutateAsync(request);

            success('Success', 'Deposit configuration updated successfully');
            setIsEditing(false);
        } catch (error: any) {
            toastError(
                'Error',
                error.response?.data?.message ||
                    'Failed to update deposit configuration'
            );
        }
    };

    const handleCancel = () => {
        if (config) {
            setDepositPercentage(config.depositPercentage);
        }
        setIsEditing(false);
    };

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="space-y-4">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-10 w-24" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Deposit Configuration
                    </CardTitle>
                    <CardDescription className="text-red-500">
                        Failed to load deposit configuration
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Deposit Configuration
                </CardTitle>
                <CardDescription>
                    Configure deposit percentage for pre-orders in{' '}
                    {user?.branch.name}
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Current Configuration Display */}
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium text-gray-900">
                                Current Deposit Percentage
                            </h4>
                            <p className="text-sm text-gray-600">
                                Percentage of total amount required as deposit
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1">
                                <span className="text-2xl font-bold text-green-600">
                                    {config?.depositPercentage || 15}%
                                </span>
                            </div>
                            {!config?.id && (
                                <span className="text-xs text-gray-500">
                                    Default value
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                {isEditing ? (
                    <div className="space-y-4 p-4 border rounded-lg">
                        <div className="space-y-2">
                            <Label htmlFor="deposit-percentage">
                                Deposit Percentage (0-100)
                            </Label>
                            <div className="relative">
                                <Input
                                    id="deposit-percentage"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                    value={depositPercentage}
                                    onChange={(e) =>
                                        setDepositPercentage(
                                            parseFloat(e.target.value) || 0
                                        )
                                    }
                                    className="pr-8"
                                />
                                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            </div>
                            <p className="text-sm text-gray-500">
                                Enter the percentage of total order amount that
                                customers need to pay as deposit
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                onClick={handleSave}
                                disabled={updateConfigMutation.isPending}
                                className="flex-1"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {updateConfigMutation.isPending
                                    ? 'Saving...'
                                    : 'Save Changes'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={handleCancel}
                                disabled={updateConfigMutation.isPending}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                            Last updated:{' '}
                            {config?.id
                                ? new Date().toLocaleDateString()
                                : 'Using default'}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(true)}
                        >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    </div>
                )}

                {/* Example Calculation */}
                <div className="border-t pt-4">
                    <h5 className="font-medium text-sm text-gray-700 mb-2">
                        Example
                    </h5>
                    <div className="text-xs text-gray-600 space-y-1">
                        <div>Order total: ₫500,000</div>
                        <div>
                            Deposit required: ₫
                            {(
                                (500000 * (config?.depositPercentage || 15)) /
                                100
                            ).toLocaleString()}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
