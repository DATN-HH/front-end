'use client';

import { useState, useEffect } from 'react';

import { ShiftLeaveBalanceDto } from '@/api/v1/shift-leave-management';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface UpdateLeaveBalanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    selectedEmployee: ShiftLeaveBalanceDto | null;
    currentYear: number;
    onSubmit: (data: {
        year: number;
        bonusShifts: number;
        reason: string;
    }) => void;
    isLoading?: boolean;
}

export function UpdateLeaveBalanceModal({
    open,
    onOpenChange,
    selectedEmployee,
    currentYear,
    onSubmit,
    isLoading = false,
}: UpdateLeaveBalanceModalProps) {
    const [formData, setFormData] = useState({
        year: currentYear,
        bonusShifts: 0,
        reason: '',
    });

    useEffect(() => {
        if (open) {
            setFormData({
                year: currentYear,
                bonusShifts: 0,
                reason: '',
            });
        }
    }, [open, currentYear]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.reason) {
            return;
        }

        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Update Shift Leave Balance</DialogTitle>
                </DialogHeader>

                {selectedEmployee && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">
                            {selectedEmployee.user.fullName}
                        </div>
                        <div className="text-sm text-gray-600">
                            {selectedEmployee.user.email}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Current Available:{' '}
                            {selectedEmployee.availableShifts} shifts
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="font-medium">Year</Label>
                        <p className="text-lg font-semibold text-blue-600">
                            {currentYear}
                        </p>
                        <p className="text-sm text-gray-500">
                            Balance will be updated for current year
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="bonusShifts">
                            Bonus Shifts (can be negative)
                        </Label>
                        <Input
                            id="bonusShifts"
                            type="number"
                            value={formData.bonusShifts}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    bonusShifts: parseInt(e.target.value) || 0,
                                }))
                            }
                            required
                            placeholder="Enter bonus shifts"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Positive number to add shifts, negative to subtract
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    reason: e.target.value,
                                }))
                            }
                            required
                            rows={3}
                            placeholder="Explain the reason for this balance adjustment"
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.reason}
                        >
                            {isLoading ? 'Updating...' : 'Update Balance'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
