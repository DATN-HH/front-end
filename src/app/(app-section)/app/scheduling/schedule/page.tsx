'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    parseISO,
    isWithinInterval,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
} from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Filter,
    Edit,
    Trash2,
    X,
    Plus,
    Pencil,
    LayoutGrid,
    CalendarPlus2Icon as CalendarIcon2,
    Trash,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColumnDef } from '@tanstack/react-table';
import {
    Shift,
    Requirement,
    putShift,
    getShifts,
    postShift,
    deleteShift,
} from '@/features/scheduling/api/api-shift';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/components/Table/DataTable';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

// Mock roles
const mockRoles = [
    { name: 'WAITER', hexColor: '#4CAF50' },
    { name: 'CASHIER', hexColor: '#2196F3' },
    { name: 'KITCHEN', hexColor: '#FF5722' },
    { name: 'MANAGER', hexColor: '#9C27B0' },
    { name: 'SUPPORT', hexColor: '#607D8B' },
];

// Mock branches
const mockBranches = [
    { id: 1, name: 'Downtown Branch' },
    { id: 2, name: 'Uptown Branch' },
    { id: 3, name: 'Westside Branch' },
];

// Mock staff
const mockStaff = [
    {
        id: 101,
        fullName: 'John Doe',
        userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        displayName: 'John D.',
    },
    {
        id: 102,
        fullName: 'Mike Johnson',
        userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        displayName: 'Mike J.',
    },
    {
        id: 103,
        fullName: 'Emily Clark',
        userRoles: [{ role: { name: 'CASHIER', hexColor: '#2196F3' } }],
        displayName: 'Emily C.',
    },
    {
        id: 104,
        fullName: 'Robert Wilson',
        userRoles: [{ role: { name: 'KITCHEN', hexColor: '#FF5722' } }],
        displayName: 'Robert W.',
    },
    {
        id: 105,
        fullName: 'Sarah Adams',
        userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        displayName: 'Sarah A.',
    },
];

// Mock data for staff shifts
const initialStaffShifts = [
    {
        id: 1,
        date: '2025-05-22',
        note: 'Regular shift',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 101,
            fullName: 'John Doe',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
            displayName: 'John D.',
        },
        shift: {
            id: 1,
            startTime: '08:00:00',
            endTime: '12:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
    {
        id: 2,
        date: '2025-05-22',
        note: 'Covering for Sarah',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 102,
            fullName: 'Mike Johnson',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
            displayName: 'Mike J.',
        },
        shift: {
            id: 1,
            startTime: '08:00:00',
            endTime: '12:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
    {
        id: 3,
        date: '2025-05-22',
        note: '',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 103,
            fullName: 'Emily Clark',
            userRoles: [{ role: { name: 'CASHIER', hexColor: '#2196F3' } }],
            displayName: 'Emily C.',
        },
        shift: {
            id: 2,
            startTime: '09:00:00',
            endTime: '13:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'CASHIER', quantity: 1 }],
        },
    },
    {
        id: 4,
        date: '2025-05-22',
        note: '',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 104,
            fullName: 'Robert Wilson',
            userRoles: [{ role: { name: 'KITCHEN', hexColor: '#FF5722' } }],
            displayName: 'Robert W.',
        },
        shift: {
            id: 3,
            startTime: '07:00:00',
            endTime: '15:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'KITCHEN', quantity: 3 }],
        },
    },
    {
        id: 5,
        date: '2025-05-23',
        note: '',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 101,
            fullName: 'John Doe',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
            displayName: 'John D.',
        },
        shift: {
            id: 2,
            startTime: '12:00:00',
            endTime: '20:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
    {
        id: 6,
        date: '2025-05-23',
        note: '',
        shiftStatus: 'PUBLISHED',
        staff: {
            id: 105,
            fullName: 'Sarah Adams',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
            displayName: 'Sarah A.',
        },
        shift: {
            id: 2,
            startTime: '12:00:00',
            endTime: '20:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
];

type StaffShift = {
    id: number;
    date: string;
    note: string;
    shiftStatus: string;
    staff: {
        id: number;
        fullName: string;
        userRoles: { role: { name: string; hexColor: string } }[];
        displayName: string;
    };
    shift: {
        id: number;
        startTime: string;
        endTime: string;
        branchName: string;
        requirements: { role: string; quantity: number }[];
    };
};

export default function SchedulePage() {
    // State for page view
    const [activeView, setActiveView] = useState<'shifts' | 'schedule'>(
        'schedule'
    );

    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { error: toastError, success } = useCustomToast();

    const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentShift, setCurrentShift] = useState<Shift>({
        startTime: '07:00:00',
        endTime: '11:00:00',
        branchId: 1,
        requirements: [{ role: 'WAITER', quantity: 1 }],
    });

    // State for schedule management
    const [date, setDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'staff' | 'role' | 'time'>(
        'staff'
    );
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStaff, setSelectedStaff] = useState<number | 'all'>('all');
    const [staffShifts, setStaffShifts] =
        useState<StaffShift[]>(initialStaffShifts);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStaffShift, setSelectedStaffShift] =
        useState<StaffShift | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [draggedShift, setDraggedShift] = useState<StaffShift | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const ganttRef = useRef<HTMLDivElement>(null);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const { data: fetchedShifts = [] as Shift[], isLoading: shiftsLoading } =
        useQuery({
            queryKey: ['shifts', shifts],
            queryFn: () => getShifts(user?.branch.id),
        });

    // Update shifts state when data is fetched
    useEffect(() => {
        if (fetchedShifts.length > 0) {
            setShifts(fetchedShifts);
        }
    }, [fetchedShifts]);

    // Create shift mutation
    const createShiftMutation = useMutation({
        mutationFn: postShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            success('Success', 'Shift created successfully');
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to create shift'
            );
            console.error('Create shift error:', error);
        },
    });

    // Update shift mutation
    const updateShiftMutation = useMutation({
        mutationFn: (shift: Shift) => {
            if (!shift.id) {
                throw new Error('Shift ID is required for update');
            }
            return putShift(String(shift.id), shift);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            success('Success', 'Shift updated successfully');
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to update shift'
            );
            console.error('Update shift error:', error);
        },
    });

    // Delete shift mutation
    const deleteShiftMutation = useMutation({
        mutationFn: deleteShift,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shifts'] });
            success('Success', 'Shift deleted successfully');
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to delete shift'
            );
            console.error('Delete shift error:', error);
        },
    });

    // Calculate date range based on current date and time range
    const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
    const endDate =
        timeRange === 'week'
            ? endOfWeek(date, { weekStartsOn: 1 })
            : addDays(startDate, 30);

    const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

    // Navigate to previous/next period
    const navigatePrevious = () => {
        if (timeRange === 'week') {
            setDate(subWeeks(date, 1));
        } else {
            setDate(subMonths(date, 1));
        }
    };

    const navigateNext = () => {
        if (timeRange === 'week') {
            setDate(addWeeks(date, 1));
        } else {
            setDate(addMonths(date, 1));
        }
    };

    // Format time for display
    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    // SHIFTS MANAGEMENT FUNCTIONS
    // Handle form input changes
    const handleInputChange = (field: keyof Shift, value: any) => {
        setCurrentShift((prev) => ({ ...prev, [field]: value }));
    };

    // Handle requirement changes
    const handleRequirementChange = (
        index: number,
        field: keyof Requirement,
        value: any
    ) => {
        const updatedRequirements = [...currentShift.requirements];
        updatedRequirements[index] = {
            ...updatedRequirements[index],
            [field]: value,
        };
        setCurrentShift((prev) => ({
            ...prev,
            requirements: updatedRequirements,
        }));
    };

    // Add a new requirement
    const addRequirement = () => {
        setCurrentShift((prev) => ({
            ...prev,
            requirements: [
                ...prev.requirements,
                { role: 'WAITER', quantity: 1 },
            ],
        }));
    };

    // Remove a requirement
    const removeRequirement = (index: number) => {
        const updatedRequirements = [...currentShift.requirements];
        updatedRequirements.splice(index, 1);
        setCurrentShift((prev) => ({
            ...prev,
            requirements: updatedRequirements,
        }));
    };

    // Open dialog for creating a new shift
    const openCreateDialog = () => {
        setIsEditMode(false);
        setCurrentShift({
            startTime: '09:00:00',
            endTime: '17:00:00',
            branchId: 1,
            requirements: [{ role: 'WAITER', quantity: 1 }],
        });
        setIsShiftDialogOpen(true);
    };

    // Open dialog for editing an existing shift
    const openEditDialog = (shift: Shift) => {
        setIsEditMode(true);
        setCurrentShift({ ...shift });
        setIsShiftDialogOpen(true);
    };

    // Save the current shift (create or update)
    const saveShift = () => {
        if (isEditMode) {
            // Update existing shift
            console.log('Updating shift:', currentShift);
            updateShiftMutation.mutate(currentShift);
        } else {
            // Create new shift
            createShiftMutation.mutate(currentShift);
        }
        setIsShiftDialogOpen(false);
    };

    // SCHEDULE MANAGEMENT FUNCTIONS
    // Filter shifts based on selected role and staff
    const filteredStaffShifts = staffShifts.filter((staffShift) => {
        const roleMatch =
            selectedRole === 'all' ||
            staffShift.staff.userRoles[0].role.name === selectedRole;
        const staffMatch =
            selectedStaff === 'all' || staffShift.staff.id === selectedStaff;

        // Check if the shift date is within the current view range
        const shiftDate = parseISO(staffShift.date);
        const dateMatch = isWithinInterval(shiftDate, {
            start: startDate,
            end: endDate,
        });

        return roleMatch && staffMatch && dateMatch;
    });

    // Group shifts by staff, role, or time
    const groupedShifts = () => {
        if (viewMode === 'staff') {
            // Group by staff
            const staffGroups: Record<number, StaffShift[]> = {};
            filteredStaffShifts.forEach((shift) => {
                if (!staffGroups[shift.staff.id]) {
                    staffGroups[shift.staff.id] = [];
                }
                staffGroups[shift.staff.id].push(shift);
            });
            return staffGroups;
        } else if (viewMode === 'role') {
            // Group by role
            const roleGroups: Record<string, StaffShift[]> = {};
            filteredStaffShifts.forEach((shift) => {
                const role = shift.staff.userRoles[0].role.name;
                if (!roleGroups[role]) {
                    roleGroups[role] = [];
                }
                roleGroups[role].push(shift);
            });
            return roleGroups;
        } else {
            // Group by time (shift)
            const timeGroups: Record<string, StaffShift[]> = {};
            filteredStaffShifts.forEach((shift) => {
                const timeKey = `${shift.shift.startTime}-${shift.shift.endTime}`;
                if (!timeGroups[timeKey]) {
                    timeGroups[timeKey] = [];
                }
                timeGroups[timeKey].push(shift);
            });
            return timeGroups;
        }
    };

    // Calculate position and width for Gantt bars
    const calculateShiftPosition = (shift: StaffShift, dayWidth: number) => {
        const shiftDate = parseISO(shift.date);
        const dayIndex = daysInRange.findIndex(
            (day) =>
                day.getDate() === shiftDate.getDate() &&
                day.getMonth() === shiftDate.getMonth() &&
                day.getFullYear() === shiftDate.getFullYear()
        );

        if (dayIndex === -1) return { left: 0, width: 0 };

        // Parse shift times
        const [startHour, startMinute] = shift.shift.startTime
            .split(':')
            .map(Number);
        const [endHour, endMinute] = shift.shift.endTime.split(':').map(Number);

        // Calculate position as percentage of day
        const dayStart = 6; // 6 AM
        const dayEnd = 22; // 10 PM
        const dayLength = dayEnd - dayStart;

        const shiftStartHourNormalized =
            startHour + startMinute / 60 - dayStart;
        const shiftEndHourNormalized = endHour + endMinute / 60 - dayStart;

        const startPercent = Math.max(
            0,
            (shiftStartHourNormalized / dayLength) * 100
        );
        const endPercent = Math.min(
            100,
            (shiftEndHourNormalized / dayLength) * 100
        );
        const width = endPercent - startPercent;

        return {
            left: dayIndex * dayWidth + (startPercent / 100) * dayWidth,
            width: (width / 100) * dayWidth,
        };
    };

    // Handle edit dialog open
    const handleEditClick = (shift: StaffShift, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStaffShift({ ...shift });
        setIsEditDialogOpen(true);
    };

    // Handle delete dialog open
    const handleDeleteClick = (shift: StaffShift, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStaffShift(shift);
        setIsDeleteDialogOpen(true);
    };

    // Handle shift update
    const handleUpdateStaffShift = () => {
        if (!selectedStaffShift) return;

        // Update shift in state
        setStaffShifts((prev) =>
            prev.map((shift) =>
                shift.id === selectedStaffShift.id
                    ? { ...selectedStaffShift }
                    : shift
            )
        );

        setIsEditDialogOpen(false);
    };

    // Handle shift delete
    const handleDeleteStaffShift = () => {
        if (!selectedStaffShift) return;

        // Remove shift from state
        setStaffShifts((prev) =>
            prev.filter((shift) => shift.id !== selectedStaffShift.id)
        );

        setIsDeleteDialogOpen(false);
    };

    // Drag and drop functionality
    const handleDragStart = (shift: StaffShift, e: React.MouseEvent) => {
        e.stopPropagation();
        setDraggedShift(shift);
        setIsDragging(true);

        // Calculate offset from the mouse position to the top-left corner of the element
        const target = e.currentTarget as HTMLElement;
        const rect = target.getBoundingClientRect();
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    const handleDragMove = (e: MouseEvent) => {
        if (!isDragging || !draggedShift || !ganttRef.current) return;

        const ganttRect = ganttRef.current.getBoundingClientRect();
        const dayWidth = 100; // Same as in calculateShiftPosition

        // Calculate the day index based on mouse position
        const relativeX = e.clientX - ganttRect.left - dragOffset.x;
        const dayIndex = Math.floor(relativeX / dayWidth);

        if (dayIndex >= 0 && dayIndex < daysInRange.length) {
            const newDate = format(daysInRange[dayIndex], 'yyyy-MM-dd');

            // Update the dragged shift with the new date
            setDraggedShift((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    date: newDate,
                };
            });
        }
    };

    const handleDragEnd = () => {
        if (isDragging && draggedShift) {
            // Update the shift in the state with the new date
            setStaffShifts((prev) =>
                prev.map((shift) =>
                    shift.id === draggedShift.id ? { ...draggedShift } : shift
                )
            );
        }

        setIsDragging(false);
        setDraggedShift(null);
    };

    // Add event listeners for drag and drop
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
        }

        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
        };
    }, [isDragging, draggedShift]);

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Shift Management & Scheduling
                        </h1>
                        <p className="text-muted-foreground">
                            Manage shift and scheduling.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tabs
                            value={activeView}
                            onValueChange={(value) =>
                                setActiveView(value as 'shifts' | 'schedule')
                            }
                        >
                            <TabsList>
                                <TabsTrigger
                                    value="shifts"
                                    className="flex items-center gap-1"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Shift Templates
                                    </span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="schedule"
                                    className="flex items-center gap-1"
                                >
                                    <CalendarIcon2 className="h-4 w-4" />
                                    <span className="hidden sm:inline">
                                        Schedule
                                    </span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {activeView === 'shifts' ? (
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Create Shift
                                </span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={navigatePrevious}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="min-w-[180px] justify-start text-left font-normal hidden md:flex"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(startDate, 'MMM d')} -{' '}
                                            {format(endDate, 'MMM d')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={(date) =>
                                                date && setDate(date)
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    variant="outline"
                                    onClick={navigateNext}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {activeView === 'shifts' ? (
                    <ShiftCard
                        shifts={shifts}
                        openEditDialog={openEditDialog}
                        deleteShift={deleteShiftMutation.mutate}
                        roles={mockRoles}
                        formatTime={formatTime}
                        isLoading={shiftsLoading}
                    />
                ) : (
                    <SchedulingCard
                        setViewMode={setViewMode}
                        setTimeRange={setTimeRange}
                        setSelectedRole={setSelectedRole}
                        setSelectedStaff={setSelectedStaff}
                        selectedRole={selectedRole}
                        selectedStaff={selectedStaff}
                        viewMode={viewMode}
                        daysInRange={daysInRange}
                        groupedShifts={groupedShifts}
                        calculateShiftPosition={calculateShiftPosition}
                        handleDragStart={handleDragStart}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        isDragging={isDragging}
                        draggedShift={draggedShift}
                        mockStaff={mockStaff}
                        roles={mockRoles}
                        ganttRef={ganttRef}
                        shifts={shifts}
                    />
                )}
            </div>

            {/* Create/Edit Shift Dialog */}
            <ShiftModal
                isShiftDialogOpen={isShiftDialogOpen}
                setIsShiftDialogOpen={setIsShiftDialogOpen}
                isEditMode={isEditMode}
                currentShift={currentShift}
                handleInputChange={handleInputChange}
                handleRequirementChange={handleRequirementChange}
                addRequirement={addRequirement}
                removeRequirement={removeRequirement}
                saveShift={saveShift}
                mockBranches={mockBranches}
                roles={mockRoles}
            />

            {/* Edit Staff Shift Dialog */}
            <EditStaffShiftModal
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                selectedStaffShift={selectedStaffShift}
                setSelectedStaffShift={setSelectedStaffShift}
                shifts={shifts}
                handleUpdateStaffShift={handleUpdateStaffShift}
                mockStaff={mockStaff}
            />

            {/* Delete Confirmation Dialog */}
            <DeleteStaffShiftModal
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                selectedStaffShift={selectedStaffShift}
                handleDeleteStaffShift={handleDeleteStaffShift}
            />
        </>
    );
}

function ShiftModal({
    isShiftDialogOpen,
    setIsShiftDialogOpen,
    isEditMode,
    currentShift,
    handleInputChange,
    handleRequirementChange,
    addRequirement,
    removeRequirement,
    saveShift,
    roles,
}: any) {
    const { user } = useAuth();

    return (
        <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditMode ? 'Edit Shift' : 'Create New Shift'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditMode
                            ? 'Update the details of this work shift.'
                            : 'Configure a new work shift and its role requirements.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startTime">Start Time</Label>
                            <Input
                                id="startTime"
                                type="time"
                                value={currentShift.startTime.substring(0, 5)}
                                onChange={(e) =>
                                    handleInputChange(
                                        'startTime',
                                        e.target.value + ':00'
                                    )
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">End Time</Label>
                            <Input
                                id="endTime"
                                type="time"
                                value={currentShift.endTime.substring(0, 5)}
                                onChange={(e) =>
                                    handleInputChange(
                                        'endTime',
                                        e.target.value + ':00'
                                    )
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select
                            value={currentShift.branchId.toString()}
                            onValueChange={(value) =>
                                handleInputChange(
                                    'branchId',
                                    Number.parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger id="branch">
                                <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem
                                    key={user?.branch?.id || 0}
                                    value={(user?.branch?.id || '').toString()}
                                >
                                    {user?.branch?.name || 'Default Branch'}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Role Requirements</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addRequirement}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Role
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {currentShift.requirements.map((req, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2"
                                >
                                    <Select
                                        value={req.role}
                                        onValueChange={(value) =>
                                            handleRequirementChange(
                                                index,
                                                'role',
                                                value
                                            )
                                        }
                                    >
                                        <SelectTrigger className="flex-1">
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.name}
                                                    value={role.name}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    role.hexColor,
                                                            }}
                                                        />
                                                        {role.name}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Input
                                        type="number"
                                        min="1"
                                        className="w-20"
                                        value={req.quantity}
                                        onChange={(e) =>
                                            handleRequirementChange(
                                                index,
                                                'quantity',
                                                Number.parseInt(e.target.value)
                                            )
                                        }
                                    />

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeRequirement(index)}
                                        disabled={
                                            currentShift.requirements.length <=
                                            1
                                        }
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsShiftDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={saveShift}>
                        {isEditMode ? 'Update Shift' : 'Create Shift'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditStaffShiftModal({
    isEditDialogOpen,
    setIsEditDialogOpen,
    selectedStaffShift,
    setSelectedStaffShift,
    shifts,
    handleUpdateStaffShift,
    mockStaff,
}: any) {
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Edit Shift Assignment</DialogTitle>
                    <DialogDescription>
                        Update the details of this shift assignment.
                    </DialogDescription>
                </DialogHeader>

                {selectedStaffShift && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {selectedStaffShift.date
                                                ? format(
                                                      parseISO(
                                                          selectedStaffShift.date
                                                      ),
                                                      'PPP'
                                                  )
                                                : 'Select date'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                selectedStaffShift.date
                                                    ? parseISO(
                                                          selectedStaffShift.date
                                                      )
                                                    : undefined
                                            }
                                            onSelect={(date) =>
                                                setSelectedStaffShift(
                                                    (prev) => {
                                                        if (!prev) return null;
                                                        return {
                                                            ...prev,
                                                            date: date
                                                                ? format(
                                                                      date,
                                                                      'yyyy-MM-dd'
                                                                  )
                                                                : prev.date,
                                                        };
                                                    }
                                                )
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Shift
                                </label>
                                <Select
                                    value={selectedStaffShift.shift.id.toString()}
                                    onValueChange={(value) => {
                                        const newShift = shifts.find(
                                            (s) => s.id?.toString() === value
                                        );
                                        if (newShift) {
                                            setSelectedStaffShift((prev) => {
                                                if (!prev) return null;
                                                return {
                                                    ...prev,
                                                    shift: {
                                                        id: newShift.id as number,
                                                        startTime:
                                                            newShift.startTime,
                                                        endTime:
                                                            newShift.endTime,
                                                        branchName:
                                                            newShift.branchName ||
                                                            '',
                                                        requirements:
                                                            newShift.requirements.map(
                                                                (r) => ({
                                                                    role: r.role,
                                                                    quantity:
                                                                        r.quantity,
                                                                })
                                                            ),
                                                    },
                                                };
                                            });
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select shift" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shifts.map((shift) => (
                                            <SelectItem
                                                key={shift.id}
                                                value={
                                                    shift.id?.toString() || ''
                                                }
                                            >
                                                {shift.startTime.substring(
                                                    0,
                                                    5
                                                )}{' '}
                                                -{' '}
                                                {shift.endTime.substring(0, 5)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Staff</label>
                            <Select
                                value={selectedStaffShift.staff.id.toString()}
                                onValueChange={(value) => {
                                    const newStaff = mockStaff.find(
                                        (s) => s.id.toString() === value
                                    );
                                    if (newStaff) {
                                        setSelectedStaffShift((prev) => {
                                            if (!prev) return null;
                                            return {
                                                ...prev,
                                                staff: newStaff,
                                            };
                                        });
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockStaff.map((staff) => (
                                        <SelectItem
                                            key={staff.id}
                                            value={staff.id.toString()}
                                        >
                                            {staff.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Note</label>
                            <Textarea
                                placeholder="Add a note for this shift"
                                value={selectedStaffShift.note}
                                onChange={(e) =>
                                    setSelectedStaffShift((prev) => {
                                        if (!prev) return null;
                                        return {
                                            ...prev,
                                            note: e.target.value,
                                        };
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Status
                            </label>
                            <Select
                                value={selectedStaffShift.shiftStatus}
                                onValueChange={(value) =>
                                    setSelectedStaffShift((prev) => {
                                        if (!prev) return null;
                                        return {
                                            ...prev,
                                            shiftStatus: value,
                                        };
                                    })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DRAFT">Draft</SelectItem>
                                    <SelectItem value="PUBLISHED">
                                        Published
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateStaffShift}>
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteStaffShiftModal({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    selectedStaffShift,
    handleDeleteStaffShift,
}: any) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Confirm Deletion</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this shift assignment?
                    </DialogDescription>
                </DialogHeader>

                {selectedStaffShift && (
                    <div className="py-4">
                        <div className="space-y-2">
                            <p>
                                <span className="font-medium">Staff:</span>{' '}
                                {selectedStaffShift.staff.fullName}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{' '}
                                {format(
                                    parseISO(selectedStaffShift.date),
                                    'MMMM d, yyyy'
                                )}
                            </p>
                            <p>
                                <span className="font-medium">Time:</span>{' '}
                                {selectedStaffShift.shift.startTime.substring(
                                    0,
                                    5
                                )}{' '}
                                -{' '}
                                {selectedStaffShift.shift.endTime.substring(
                                    0,
                                    5
                                )}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteStaffShift}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function ShiftCard({
    shifts,
    openEditDialog,
    deleteShift,
    roles,
    isLoading,
}: any) {
    const columns: ColumnDef<Shift>[] = [
        {
            accessorKey: 'startTime',
            header: 'Start Time',
        },
        {
            accessorKey: 'endTime',
            header: 'End Time',
        },
        {
            accessorKey: 'branchName',
            header: 'Branch',
        },
        {
            accessorKey: 'requirements',
            header: 'Requirements',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    {(
                        (row.getValue('requirements') as Requirement[]) || []
                    ).map((req, index) => {
                        const roleColor =
                            roles.find((r) => r.name === req.role)?.hexColor ||
                            '#333';
                        return (
                            <Badge
                                key={index}
                                variant="outline"
                                style={{
                                    backgroundColor: `${roleColor}20`,
                                    borderColor: roleColor,
                                    color: roleColor,
                                }}
                            >
                                {req.role}: {req.quantity}
                            </Badge>
                        );
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => openEditDialog(row.original)}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                                deleteShift(row.original.id);
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={shifts}
            pageIndex={0}
            pageSize={shifts.length}
            total={shifts.length}
            tableId="shift-table"
            loading={isLoading}
            enableSearch={false}
            enableSorting={false}
        />
    );
}

function SchedulingCard({
    setViewMode,
    setTimeRange,
    setSelectedRole,
    setSelectedStaff,
    selectedRole,
    selectedStaff,
    viewMode,
    daysInRange,
    groupedShifts,
    calculateShiftPosition,
    handleDragStart,
    handleEditClick,
    handleDeleteClick,
    isDragging,
    draggedShift,
    mockStaff,
    roles,
    ganttRef,
}: any) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <CardTitle>Schedule Overview</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <Tabs
                            defaultValue="staff"
                            onValueChange={(value) => setViewMode(value as any)}
                        >
                            <TabsList>
                                <TabsTrigger value="staff">
                                    By Staff
                                </TabsTrigger>
                                <TabsTrigger value="role">By Role</TabsTrigger>
                                <TabsTrigger value="time">By Time</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Tabs
                            defaultValue="week"
                            onValueChange={(value) =>
                                setTimeRange(value as any)
                            }
                        >
                            <TabsList>
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Filters:</span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm">Role:</span>
                        <Select
                            value={selectedRole}
                            onValueChange={setSelectedRole}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                {roles.map((role) => (
                                    <SelectItem
                                        key={role.name}
                                        value={role.name}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        role.hexColor,
                                                }}
                                            />
                                            {role.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-sm">Staff:</span>
                        <Select
                            value={selectedStaff.toString()}
                            onValueChange={(value) =>
                                setSelectedStaff(
                                    value === 'all'
                                        ? 'all'
                                        : Number.parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Select staff" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Staff</SelectItem>
                                {mockStaff.map((staff) => (
                                    <SelectItem
                                        key={staff.id}
                                        value={staff.id.toString()}
                                    >
                                        {staff.fullName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Gantt Chart */}
                <div className="border rounded-md overflow-auto">
                    {/* Header - Days */}
                    <div className="flex border-b bg-muted/50">
                        <div className="min-w-[180px] p-2 font-medium border-r">
                            {viewMode === 'staff'
                                ? 'Staff'
                                : viewMode === 'role'
                                  ? 'Role'
                                  : 'Shift Time'}
                        </div>
                        <div className="flex flex-1">
                            {daysInRange.map((day, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        'flex-1 min-w-[100px] p-2 text-center font-medium',
                                        index < daysInRange.length - 1 &&
                                            'border-r',
                                        day.getDay() === 0 || day.getDay() === 6
                                            ? 'bg-muted'
                                            : ''
                                    )}
                                >
                                    {format(day, 'EEE')}
                                    <br />
                                    {format(day, 'MMM d')}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Gantt Body */}
                    <div ref={ganttRef}>
                        {Object.entries(groupedShifts()).map(
                            ([key, shifts], groupIndex) => {
                                // Determine group label based on view mode
                                let groupLabel = '';
                                let groupColor = '';

                                if (viewMode === 'staff') {
                                    const staff = mockStaff.find(
                                        (s) => s.id.toString() === key
                                    );
                                    groupLabel = staff?.fullName || '';
                                    groupColor =
                                        staff?.userRoles[0].role.hexColor || '';
                                } else if (viewMode === 'role') {
                                    groupLabel = key;
                                    const role = roles.find(
                                        (r) => r.name === key
                                    );
                                    groupColor = role?.hexColor || '';
                                } else {
                                    // Time view
                                    const [start, end] = key.split('-');
                                    groupLabel = `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
                                }

                                return (
                                    <div
                                        key={key}
                                        className="flex border-b last:border-b-0"
                                    >
                                        <div className="min-w-[180px] p-2 border-r flex items-center gap-2">
                                            {groupColor && (
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            groupColor,
                                                    }}
                                                />
                                            )}
                                            <span className="font-medium truncate">
                                                {groupLabel}
                                            </span>
                                        </div>

                                        <div
                                            className="flex-1 relative"
                                            style={{
                                                height: '60px',
                                            }}
                                        >
                                            {/* Time grid lines */}
                                            <div className="absolute inset-0 flex">
                                                {daysInRange.map((_, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn(
                                                            'flex-1 min-w-[100px] h-full',
                                                            index <
                                                                daysInRange.length -
                                                                    1 &&
                                                                'border-r'
                                                        )}
                                                    />
                                                ))}
                                            </div>

                                            {/* Shift bars */}
                                            {shifts?.map((shift) => {
                                                const dayWidth = 100; // Minimum width per day
                                                const { left, width } =
                                                    calculateShiftPosition(
                                                        shift,
                                                        dayWidth
                                                    );

                                                // Skip if not visible
                                                if (width === 0) return null;

                                                const roleColor =
                                                    shift.staff.userRoles[0]
                                                        .role.hexColor;
                                                const isBeingDragged =
                                                    isDragging &&
                                                    draggedShift?.id ===
                                                        shift.id;

                                                return (
                                                    <TooltipProvider
                                                        key={shift.id}
                                                    >
                                                        <Tooltip>
                                                            <TooltipTrigger
                                                                asChild
                                                            >
                                                                <div
                                                                    className={cn(
                                                                        'absolute h-10 rounded-md border flex items-center justify-between px-2 text-xs font-medium cursor-move hover:opacity-80 transition-opacity group',
                                                                        isBeingDragged &&
                                                                            'opacity-50 border-dashed'
                                                                    )}
                                                                    style={{
                                                                        left: `${left}px`,
                                                                        width: `${Math.max(width, 80)}px`,
                                                                        top: '10px',
                                                                        backgroundColor: `${roleColor}20`,
                                                                        borderColor:
                                                                            roleColor,
                                                                        color: roleColor,
                                                                    }}
                                                                    onMouseDown={(
                                                                        e
                                                                    ) =>
                                                                        handleDragStart(
                                                                            shift,
                                                                            e
                                                                        )
                                                                    }
                                                                >
                                                                    <span className="truncate">
                                                                        {viewMode ===
                                                                        'staff'
                                                                            ? `${shift.shift.startTime.substring(0, 5)}-${shift.shift.endTime.substring(0, 5)}`
                                                                            : viewMode ===
                                                                                'role'
                                                                              ? shift
                                                                                    .staff
                                                                                    .displayName
                                                                              : shift
                                                                                    .staff
                                                                                    .displayName}
                                                                    </span>
                                                                    <div className="hidden group-hover:flex items-center gap-1">
                                                                        <button
                                                                            className="p-0.5 hover:bg-white/50 rounded"
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                handleEditClick(
                                                                                    shift,
                                                                                    e
                                                                                )
                                                                            }
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            className="p-0.5 hover:bg-white/50 rounded"
                                                                            onClick={(
                                                                                e
                                                                            ) =>
                                                                                handleDeleteClick(
                                                                                    shift,
                                                                                    e
                                                                                )
                                                                            }
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="space-y-1">
                                                                    <p className="font-medium">
                                                                        {
                                                                            shift
                                                                                .staff
                                                                                .fullName
                                                                        }
                                                                    </p>
                                                                    <p className="text-xs">
                                                                        {format(
                                                                            parseISO(
                                                                                shift.date
                                                                            ),
                                                                            'MMM d, yyyy'
                                                                        )}{' '}
                                                                        •{' '}
                                                                        {shift.shift.startTime.substring(
                                                                            0,
                                                                            5
                                                                        )}
                                                                        -
                                                                        {shift.shift.endTime.substring(
                                                                            0,
                                                                            5
                                                                        )}
                                                                    </p>
                                                                    <Badge
                                                                        variant="outline"
                                                                        style={{
                                                                            backgroundColor: `${roleColor}20`,
                                                                            borderColor:
                                                                                roleColor,
                                                                            color: roleColor,
                                                                        }}
                                                                    >
                                                                        {
                                                                            shift
                                                                                .staff
                                                                                .userRoles[0]
                                                                                .role
                                                                                .name
                                                                        }
                                                                    </Badge>
                                                                    {shift.note && (
                                                                        <p className="text-xs">
                                                                            {
                                                                                shift.note
                                                                            }
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                    <p>
                        Tip: Drag shifts to move them to different days. Click
                        on a shift to edit or delete it.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
