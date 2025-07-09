'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UserDtoResponse } from '@/api/v1/auth';

interface AddLeaveForEmployeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employees: UserDtoResponse[];
    shifts: any[];
    onSubmit: (data: {
        employeeId: number;
        startDate: string;
        endDate: string;
        reason: string;
        shiftIds: number[];
    }) => void;
    isLoading?: boolean;
}

// Format time helper
const formatTime = (time: any) => {
    if (typeof time === 'string') return time;
    if (time && typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    return time?.toString() || '';
};

export function AddLeaveForEmployeeModal({
    open,
    onOpenChange,
    employees,
    shifts,
    onSubmit,
    isLoading = false,
}: AddLeaveForEmployeeModalProps) {
    const [formData, setFormData] = useState({
        employeeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        selectedShiftIds: [] as number[]
    });

    useEffect(() => {
        if (open) {
            setFormData({
                employeeId: '',
                startDate: '',
                endDate: '',
                reason: '',
                selectedShiftIds: []
            });
        }
    }, [open]);

    const handleShiftChange = (shiftId: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            selectedShiftIds: checked
                ? [...prev.selectedShiftIds, shiftId]
                : prev.selectedShiftIds.filter(id => id !== shiftId)
        }));
    };

    const getSelectedShiftsNames = () => {
        return formData.selectedShiftIds
            .map(id => shifts.find(shift => shift.id === id)?.name)
            .filter(Boolean)
            .join(', ');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.employeeId || !formData.startDate || !formData.endDate ||
            !formData.reason || formData.selectedShiftIds.length === 0) {
            return;
        }

        onSubmit({
            employeeId: parseInt(formData.employeeId),
            startDate: formData.startDate,
            endDate: formData.endDate,
            reason: formData.reason,
            shiftIds: formData.selectedShiftIds
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Leave for Employee</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="employeeId">Employee</Label>
                        <Select
                            value={formData.employeeId}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, employeeId: value }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select employee" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                        {employee.fullName} ({employee.email})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                                required
                            // No min date restriction - managers can add historical leave
                            />
                        </div>
                        <div>
                            <Label htmlFor="endDate">End Date</Label>
                            <Input
                                id="endDate"
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                                required
                            // No min date restriction - managers can add historical leave
                            />
                        </div>
                    </div>

                    <div>
                        <Label>Select Shifts</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {shifts.map((shift) => (
                                <div key={shift.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`shift-${shift.id}`}
                                        checked={formData.selectedShiftIds.includes(shift.id)}
                                        onCheckedChange={(checked) => handleShiftChange(shift.id, checked as boolean)}
                                    />
                                    <Label htmlFor={`shift-${shift.id}`} className="text-sm">
                                        {shift.name} ({formatTime(shift.startTime)} - {formatTime(shift.endTime)})
                                    </Label>
                                </div>
                            ))}
                        </div>
                        {formData.selectedShiftIds.length > 0 && (
                            <p className="text-sm text-gray-600 mt-2">
                                Selected: {getSelectedShiftsNames()}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="reason">Reason</Label>
                        <Textarea
                            id="reason"
                            value={formData.reason}
                            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                            required
                            rows={3}
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
                            disabled={isLoading || !formData.employeeId || !formData.startDate || !formData.endDate || !formData.reason || formData.selectedShiftIds.length === 0}
                        >
                            {isLoading ? 'Adding...' : 'Add Leave'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 