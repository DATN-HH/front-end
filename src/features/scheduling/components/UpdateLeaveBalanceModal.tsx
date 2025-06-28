'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, Plus, Minus } from 'lucide-react';
import {
    useUpdateEmployeeLeaveBalance,
    UpdateLeaveBalanceDto
} from '@/api/v1/leave-management';
import { useUsers } from '@/api/v1/users';
import { UserDtoResponse } from '@/api/v1/auth';
import { useCustomToast } from '@/lib/show-toast';
import { useAuth } from '@/contexts/auth-context';

interface UpdateLeaveBalanceModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function UpdateLeaveBalanceModal({ open, onOpenChange }: UpdateLeaveBalanceModalProps) {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();
    const branchId = user?.branch?.id;

    // Form state
    const [formData, setFormData] = useState<UpdateLeaveBalanceDto>({
        userId: 0,
        year: currentYear,
        bonusDays: 0,
        reason: ''
    });

    const [selectedEmployee, setSelectedEmployee] = useState<UserDtoResponse | null>(null);

    // API hooks
    const { data: employeesData, isLoading: isLoadingEmployees, error: employeesError } = useUsers({
        status: 'ACTIVE',
        branchId: branchId,
        isEmployee: true,
        page: 0,
        size: 1000
    });
    const employees = employeesData?.data || [];
    const updateMutation = useUpdateEmployeeLeaveBalance();

    // Debug logs
    console.log('🔍 Debug - UpdateLeaveBalanceModal:', {
        branchId,
        isLoadingEmployees,
        employeesData,
        employees: employees.length,
        employeesError
    });

    // Reset form when modal opens/closes
    useEffect(() => {
        if (open) {
            setFormData({
                userId: 0,
                year: currentYear,
                bonusDays: 0,
                reason: ''
            });
            setSelectedEmployee(null);
        }
    }, [open, currentYear]);

    // Update selected employee when user changes
    useEffect(() => {
        if (formData.userId > 0) {
            const employee = employees.find(emp => emp.id === formData.userId);
            setSelectedEmployee(employee || null);
        } else {
            setSelectedEmployee(null);
        }
    }, [formData.userId, employees]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.userId) {
            error('Error', 'Please select an employee');
            return;
        }

        if (!formData.reason.trim()) {
            error('Error', 'Please provide a reason for this adjustment');
            return;
        }

        if (formData.bonusDays === 0) {
            error('Error', 'Please enter a non-zero bonus days value');
            return;
        }

        try {
            await updateMutation.mutateAsync(formData);
            success('Success', `Leave balance updated successfully for ${selectedEmployee?.fullName || selectedEmployee?.username}`);
            handleClose();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to update leave balance');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const canSubmitForm = formData.userId > 0 && formData.reason.trim() && formData.bonusDays !== 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[90vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="flex-shrink-0 border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Settings className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Update Leave Balance</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Adjust employee leave balance by adding or removing bonus days
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Body with fixed height and scroll */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="py-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Employee Selection */}
                            <div className="space-y-2">
                                <Label htmlFor="employee">Employee *</Label>
                                <Select
                                    value={formData.userId > 0 ? formData.userId.toString() : ''}
                                    onValueChange={(value) => setFormData({ ...formData, userId: parseInt(value) })}
                                    disabled={isLoadingEmployees || !branchId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={
                                            isLoadingEmployees ? "Loading employees..." :
                                                !branchId ? "Branch ID not found" :
                                                    employees.length === 0 ? "No employees found" :
                                                        "Select employee"
                                        } />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map(employee => (
                                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                                <div className="flex items-center justify-between w-full">
                                                    <span>{employee.fullName || employee.username}</span>
                                                    <Badge variant="outline" className="ml-2">
                                                        {employee.email}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <div className="text-xs text-muted-foreground">
                                    Year: {currentYear} (Current year will be used for this adjustment)
                                    {employees.length > 0 && (
                                        <span className="ml-2 text-green-600">• {employees.length} employees found</span>
                                    )}
                                </div>
                            </div>



                            {/* Bonus Days Adjustment */}
                            <div className="space-y-2">
                                <Label htmlFor="bonusDays">Bonus Days Adjustment *</Label>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, bonusDays: formData.bonusDays - 1 })}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <Input
                                        id="bonusDays"
                                        type="number"
                                        value={formData.bonusDays}
                                        onChange={(e) => setFormData({ ...formData, bonusDays: parseInt(e.target.value) || 0 })}
                                        className="text-center"
                                        step="0.5"
                                        placeholder="0"
                                    />
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setFormData({ ...formData, bonusDays: formData.bonusDays + 1 })}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Use positive numbers to add days, negative to subtract
                                </div>
                            </div>

                            {/* Reason */}
                            <div className="space-y-2">
                                <Label htmlFor="reason">Reason for Adjustment *</Label>
                                <Textarea
                                    id="reason"
                                    placeholder="Please provide a detailed reason for this leave balance adjustment..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows={3}
                                    required
                                />
                                <div className="text-xs text-muted-foreground">
                                    This reason will be logged for audit purposes
                                </div>
                            </div>


                        </form>
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="flex-shrink-0 border-t pt-6 bg-muted/30">
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="px-8 h-11 flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={updateMutation.isPending || !canSubmitForm}
                            className="px-8 h-11 flex-1"
                        >
                            {updateMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Settings className="h-4 w-4 mr-2" />
                            )}
                            Update Balance
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 