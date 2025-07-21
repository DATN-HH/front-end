'use client';

import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { UserDtoResponse } from '@/api/v1/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

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

// Format time helper - only show hours and minutes
const formatTime = (time: any) => {
  if (typeof time === 'string') {
    // If it's already a string, parse it and reformat
    const [hours, minutes] = time.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  if (
    time &&
    typeof time === 'object' &&
    time.hour !== undefined &&
    time.minute !== undefined
  ) {
    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
  }
  return time?.toString() || '';
};

// Convert time to minutes for sorting
const timeToMinutes = (time: any) => {
  if (typeof time === 'string') {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  if (
    time &&
    typeof time === 'object' &&
    time.hour !== undefined &&
    time.minute !== undefined
  ) {
    return time.hour * 60 + time.minute;
  }
  return 0;
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
    selectedShiftIds: [] as number[],
  });
  const [employeeComboOpen, setEmployeeComboOpen] = useState(false);
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');

  // Sort shifts by start time for timeline display
  const sortedShifts = useMemo(() => {
    return [...shifts].sort((a, b) => {
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });
  }, [shifts]);

  // Filter employees based on search term
  const filteredEmployees = useMemo(() => {
    if (!employeeSearchTerm) return employees;
    const searchLower = employeeSearchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        emp.fullName.toLowerCase().includes(searchLower) ||
        emp.email.toLowerCase().includes(searchLower)
    );
  }, [employees, employeeSearchTerm]);

  useEffect(() => {
    if (open) {
      setFormData({
        employeeId: '',
        startDate: '',
        endDate: '',
        reason: '',
        selectedShiftIds: [],
      });
    }
  }, [open]);

  const handleShiftChange = (shiftId: number, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedShiftIds: checked
        ? [...prev.selectedShiftIds, shiftId]
        : prev.selectedShiftIds.filter((id) => id !== shiftId),
    }));
  };

  const handleSelectAllShifts = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedShiftIds: checked ? sortedShifts.map((shift) => shift.id) : [],
    }));
  };

  const getSelectedEmployee = () => {
    return employees.find((emp) => emp.id.toString() === formData.employeeId);
  };

  const getSelectedShiftsNames = () => {
    return formData.selectedShiftIds
      .map((id) => sortedShifts.find((shift) => shift.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  const isAllShiftsSelected = () => {
    return (
      sortedShifts.length > 0 &&
      formData.selectedShiftIds.length === sortedShifts.length
    );
  };

  const isSomeShiftsSelected = () => {
    return (
      formData.selectedShiftIds.length > 0 &&
      formData.selectedShiftIds.length < sortedShifts.length
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.employeeId ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason ||
      formData.selectedShiftIds.length === 0
    ) {
      return;
    }

    onSubmit({
      employeeId: parseInt(formData.employeeId),
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      shiftIds: formData.selectedShiftIds,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Leave for Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Employee Selection with Search */}
          <div className="space-y-2 relative">
            <Label htmlFor="employeeId">Employee</Label>
            <div className="relative">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-between"
                onClick={() => setEmployeeComboOpen(!employeeComboOpen)}
              >
                {getSelectedEmployee()
                  ? `${getSelectedEmployee()?.fullName} (${getSelectedEmployee()?.email})`
                  : 'Select employee...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>

              {employeeComboOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setEmployeeComboOpen(false)}
                  />

                  {/* Dropdown */}
                  <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                    {/* Search Input */}
                    <div className="flex items-center border-b px-3 py-2">
                      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                      <Input
                        placeholder="Search employees..."
                        value={employeeSearchTerm}
                        onChange={(e) => setEmployeeSearchTerm(e.target.value)}
                        className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
                        autoFocus
                      />
                    </div>

                    {/* Employee List - This should now scroll with mouse wheel */}
                    <div
                      className="max-h-[200px] overflow-y-scroll"
                      style={{ scrollBehavior: 'smooth' }}
                    >
                      {filteredEmployees.length === 0 ? (
                        <div className="py-6 text-center text-sm text-gray-500">
                          No employee found.
                        </div>
                      ) : (
                        <div className="p-1">
                          {filteredEmployees.map((employee) => (
                            <div
                              key={employee.id}
                              className={cn(
                                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-blue-50 hover:text-blue-900 transition-colors',
                                formData.employeeId ===
                                  employee.id.toString() &&
                                  'bg-blue-100 text-blue-900'
                              )}
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  employeeId: employee.id.toString(),
                                }));
                                setEmployeeComboOpen(false);
                                setEmployeeSearchTerm('');
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  formData.employeeId === employee.id.toString()
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <span className="truncate">
                                {employee.fullName} ({employee.email})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                required
              />
            </div>
          </div>

          {/* Select Shifts with Timeline View */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Select Shifts</Label>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all-shifts"
                  checked={isAllShiftsSelected()}
                  ref={(el) => {
                    if (el) {
                      const checkbox = el.querySelector(
                        'input[type="checkbox"]'
                      ) as HTMLInputElement;
                      if (checkbox) {
                        checkbox.indeterminate = isSomeShiftsSelected();
                      }
                    }
                  }}
                  onCheckedChange={(checked) =>
                    handleSelectAllShifts(checked as boolean)
                  }
                />
                <Label
                  htmlFor="select-all-shifts"
                  className="text-sm font-medium"
                >
                  Select All ({sortedShifts.length} shifts)
                </Label>
              </div>
            </div>

            {/* Timeline View of Shifts */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="space-y-3">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Shifts Timeline (sorted by start time)
                </div>

                {sortedShifts.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No shifts available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sortedShifts.map((shift, index) => (
                      <div
                        key={shift.id}
                        className={cn(
                          'flex items-center p-3 rounded-lg border transition-colors',
                          formData.selectedShiftIds.includes(shift.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:bg-gray-50'
                        )}
                      >
                        <Checkbox
                          id={`shift-${shift.id}`}
                          checked={formData.selectedShiftIds.includes(shift.id)}
                          onCheckedChange={(checked) =>
                            handleShiftChange(shift.id, checked as boolean)
                          }
                        />

                        <div className="ml-3 flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label
                                htmlFor={`shift-${shift.id}`}
                                className="font-medium cursor-pointer"
                              >
                                {shift.name}
                              </Label>
                              <div className="text-sm text-gray-600">
                                {formatTime(shift.startTime)} -{' '}
                                {formatTime(shift.endTime)}
                              </div>
                            </div>

                            {/* Timeline Visual Indicator */}
                            <div className="flex items-center space-x-2">
                              <div className="text-xs text-gray-400">
                                #{index + 1}
                              </div>
                              <div
                                className={cn(
                                  'w-12 h-2 rounded-full',
                                  formData.selectedShiftIds.includes(shift.id)
                                    ? 'bg-blue-400'
                                    : 'bg-gray-300'
                                )}
                                style={{
                                  // Simple timeline visualization based on start time
                                  marginLeft: `${(timeToMinutes(shift.startTime) / (24 * 60)) * 20}px`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Shifts Summary */}
            {formData.selectedShiftIds.length > 0 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-900 mb-1">
                  Selected Shifts ({formData.selectedShiftIds.length})
                </div>
                <div className="text-sm text-blue-700">
                  {getSelectedShiftsNames()}
                </div>
              </div>
            )}
          </div>

          {/* Reason */}
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
              placeholder="Enter the reason for leave..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
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
              disabled={
                isLoading ||
                !formData.employeeId ||
                !formData.startDate ||
                !formData.endDate ||
                !formData.reason ||
                formData.selectedShiftIds.length === 0
              }
            >
              {isLoading ? 'Adding...' : 'Add Leave'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
