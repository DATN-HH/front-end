import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { CalendarIcon, UserPlus } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
    useAddLeaveForEmployee,
    LeaveType,
    LeaveDuration,
    getLeaveTypeLabel,
    getLeaveDurationLabel,
    type AddLeaveForEmployeeDto,
} from '@/api/v1/leave-management';
import { useUsers } from '@/api/v1/users';
import { toast } from 'sonner';

interface AddLeaveForEmployeeModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branchId: number;
}

export function AddLeaveForEmployeeModal({
    open,
    onOpenChange,
    branchId,
}: AddLeaveForEmployeeModalProps) {
    const [formData, setFormData] = useState<{
        employeeId: string;
        leaveType: LeaveType | '';
        startDate: Date | undefined;
        endDate: Date | undefined;
        leaveDuration: LeaveDuration | '';
        reason: string;
    }>({
        employeeId: '',
        leaveType: '',
        startDate: undefined,
        endDate: undefined,
        leaveDuration: '',
        reason: '',
    });

    const addLeaveForEmployeeMutation = useAddLeaveForEmployee();

    // Fetch employees for the branch
    const { data: employeesData, isLoading: isLoadingEmployees } = useUsers({
        status: 'ACTIVE',
        branchId: branchId,
        isEmployee: true,
        page: 0,
        size: 1000,
    });

    const employees = employeesData?.data || [];

    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    };

    const resetForm = () => {
        setFormData({
            employeeId: '',
            leaveType: '',
            startDate: undefined,
            endDate: undefined,
            leaveDuration: '',
            reason: '',
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.employeeId) {
            toast.error('Please select an employee');
            return;
        }
        if (!formData.leaveType) {
            toast.error('Please select a leave type');
            return;
        }
        if (!formData.startDate) {
            toast.error('Please select a start date');
            return;
        }
        if (!formData.endDate) {
            toast.error('Please select an end date');
            return;
        }
        if (!formData.leaveDuration) {
            toast.error('Please select leave duration');
            return;
        }
        if (!formData.reason.trim()) {
            toast.error('Please provide a reason for the leave');
            return;
        }

        // Check if end date is after start date
        if (formData.endDate < formData.startDate) {
            toast.error('End date must be after start date');
            return;
        }

        const requestData: AddLeaveForEmployeeDto = {
            employeeId: parseInt(formData.employeeId),
            leaveType: formData.leaveType as LeaveType,
            startDate: format(formData.startDate, 'yyyy-MM-dd'),
            endDate: format(formData.endDate, 'yyyy-MM-dd'),
            leaveDuration: formData.leaveDuration as LeaveDuration,
            reason: formData.reason.trim(),
        };

        try {
            await addLeaveForEmployeeMutation.mutateAsync(requestData);
            toast.success('Leave request added successfully');
            handleClose();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to add leave request'
            );
        }
    };

    const leaveTypes = Object.values(LeaveType);
    const leaveDurations = Object.values(LeaveDuration);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Add Leave for Employee</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Create a leave request on behalf of an employee
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="employeeId">Employee *</Label>
                        <Select
                            value={formData.employeeId}
                            onValueChange={(value: string) =>
                                setFormData(prev => ({ ...prev, employeeId: value }))
                            }
                            disabled={isLoadingEmployees}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={
                                    isLoadingEmployees
                                        ? "Loading employees..."
                                        : "Select an employee"
                                } />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((employee) => (
                                    <SelectItem key={employee.id} value={employee.id.toString()}>
                                        {employee.fullName || employee.username}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Leave Type */}
                    <div className="space-y-2">
                        <Label htmlFor="leaveType">Leave Type *</Label>
                        <Select
                            value={formData.leaveType}
                            onValueChange={(value: LeaveType) =>
                                setFormData(prev => ({ ...prev, leaveType: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                        {getLeaveTypeLabel(type)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Start Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !formData.startDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.startDate ? (
                                            format(formData.startDate, 'MMM dd, yyyy')
                                        ) : (
                                            'Pick start date'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.startDate}
                                        onSelect={(date) =>
                                            setFormData(prev => ({ ...prev, startDate: date }))
                                        }
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>End Date *</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !formData.endDate && 'text-muted-foreground'
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {formData.endDate ? (
                                            format(formData.endDate, 'MMM dd, yyyy')
                                        ) : (
                                            'Pick end date'
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={formData.endDate}
                                        onSelect={(date) =>
                                            setFormData(prev => ({ ...prev, endDate: date }))
                                        }
                                        initialFocus
                                        disabled={(date) =>
                                            formData.startDate ? date < formData.startDate : false
                                        }
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    {/* Leave Duration */}
                    <div className="space-y-2">
                        <Label htmlFor="leaveDuration">Leave Duration *</Label>
                        <Select
                            value={formData.leaveDuration}
                            onValueChange={(value: LeaveDuration) =>
                                setFormData(prev => ({ ...prev, leaveDuration: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select leave duration" />
                            </SelectTrigger>
                            <SelectContent>
                                {leaveDurations.map((duration) => (
                                    <SelectItem key={duration} value={duration}>
                                        {getLeaveDurationLabel(duration)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Reason */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason *</Label>
                        <Textarea
                            id="reason"
                            placeholder="Enter reason for leave request"
                            value={formData.reason}
                            onChange={(e) =>
                                setFormData(prev => ({ ...prev, reason: e.target.value }))
                            }
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-8 h-11"
                        disabled={addLeaveForEmployeeMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="px-8 h-11"
                        disabled={addLeaveForEmployeeMutation.isPending}
                    >
                        {addLeaveForEmployeeMutation.isPending ? 'Adding...' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
