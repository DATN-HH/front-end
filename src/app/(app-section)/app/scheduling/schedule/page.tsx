'use client';

import type React from 'react';
import { useState, useRef, useEffect, useMemo, useCallback, Suspense, lazy } from 'react';
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addWeeks,
    subWeeks,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
} from 'date-fns';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Plus,
    LayoutGrid,
    CalendarPlus2Icon as CalendarIcon2,
    Loader2,
} from 'lucide-react';
import {
    Shift,
    putShift,
    getShifts,
    postShift,
    deleteShift,
} from '@/features/scheduling/api/api-shift';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';
import { useStaffShifts } from '@/services/api/v1/staff-shifts';
import { useUsers } from '@/services/api/v1/users';
import { useRoles } from '@/services/api/v1/roles';
import { MAX_SIZE_PER_PAGE } from '@/lib/constants';
import { StaffShiftResponseDto } from '@/services/api/v1/staff-shifts';
import { Skeleton } from '@/components/ui/skeleton';

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

// Remove the custom StaffShift type since we'll use StaffShiftResponseDto
type GroupedShiftsType = Record<string, StaffShiftResponseDto[]>;

// Lazy load components
const ShiftCard = lazy(() => import('@/features/scheduling/schedule/components/ShiftCard').then(mod => ({ default: mod.ShiftCard })));
const SchedulingCard = lazy(() => import('@/features/scheduling/schedule/components/SchedulingCard').then(mod => ({ default: mod.SchedulingCard })));
const ShiftModal = lazy(() => import('@/features/scheduling/schedule/components/ShiftModal').then(mod => ({ default: mod.ShiftModal })));
const EditStaffShiftModal = lazy(() => import('@/features/scheduling/schedule/components/EditStaffShiftModal').then(mod => ({ default: mod.EditStaffShiftModal })));
const DeleteStaffShiftModal = lazy(() => import('@/features/scheduling/schedule/components/DeleteStaffShiftModal').then(mod => ({ default: mod.DeleteStaffShiftModal })));

// Loading components
const ShiftCardSkeleton = () => (
    <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
    </div>
);

const SchedulingCardSkeleton = () => (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-[600px] w-full" />
    </div>
);

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
    const [startDate, setStartDate] = useState<Date>(startOfWeek(new Date()));
    const [endDate, setEndDate] = useState<Date>(endOfWeek(new Date()));
    const [viewMode, setViewMode] = useState<'staff' | 'role' | 'time'>('staff');
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const [selectedRole, setSelectedRole] = useState('all');
    const [selectedStaff, setSelectedStaff] = useState<number | 'all'>('all');
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedStaffShift, setSelectedStaffShift] =
        useState<StaffShiftResponseDto | null>(null);
    const ganttRef = useRef<HTMLDivElement>(null);
    const [shifts, setShifts] = useState<Shift[]>([]);
    const { data: fetchedShifts = [] as Shift[], isLoading: shiftsLoading } =
        useQuery({
            queryKey: ['shifts', shifts],
            queryFn: () => getShifts(user?.branch.id),
        });

    // Get date range based on timeRange
    const daysInRange = useMemo(() =>
        eachDayOfInterval({ start: startDate, end: endDate }),
        [startDate, endDate]
    );

    // Fetch data
    const queryParams = useMemo(() => ({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        branchId: user?.branch.id,
        staffId: selectedStaff !== 'all' ? selectedStaff : undefined,
        size: MAX_SIZE_PER_PAGE,
    }), [startDate, endDate, user?.branch.id, selectedStaff]);

    const { data: staffShiftsData, isLoading: isStaffShiftsLoading } = useStaffShifts(queryParams);
    const { data: staff } = useUsers({
        branchId: user?.branch.id,
        isEmployee: true
    });
    const { data: rolesData } = useRoles({});

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

    // Memoize handlers
    const handleDateChange = useCallback((newDate: Date) => {
        setDate(newDate);
        const newStartDate = timeRange === 'week' ? startOfWeek(newDate) : startOfMonth(newDate);
        const newEndDate = timeRange === 'week' ? endOfWeek(newDate) : endOfMonth(newDate);

        setStartDate(newStartDate);
        setEndDate(newEndDate);

        queryClient.invalidateQueries({
            queryKey: ['staffShifts', queryParams]
        });
    }, [timeRange, queryClient, queryParams]);

    const handleTimeRangeChange = useCallback((newRange: 'week' | 'month') => {
        setTimeRange(newRange);
        const newStartDate = newRange === 'week' ? startOfWeek(date) : startOfMonth(date);
        const newEndDate = newRange === 'week' ? endOfWeek(date) : endOfMonth(date);

        setStartDate(newStartDate);
        setEndDate(newEndDate);

        queryClient.invalidateQueries({
            queryKey: ['staffShifts', queryParams]
        });
    }, [date, queryClient, queryParams]);

    // Memoize grouped shifts calculation
    const groupedShiftsByView = useMemo(() => {
        if (!staffShiftsData?.data) return {
            staff: {} as GroupedShiftsType,
            role: {} as GroupedShiftsType,
            time: {} as GroupedShiftsType
        };

        const grouped = {
            staff: {} as GroupedShiftsType,
            role: {} as GroupedShiftsType,
            time: {} as GroupedShiftsType
        };

        staffShiftsData.data.forEach((shift) => {
            const startTimeStr = typeof shift.shift.startTime === 'string'
                ? shift.shift.startTime
                : `${shift.shift.startTime.hour.toString().padStart(2, '0')}:${shift.shift.startTime.minute.toString().padStart(2, '0')}:${shift.shift.startTime.second.toString().padStart(2, '0')}`;

            const endTimeStr = typeof shift.shift.endTime === 'string'
                ? shift.shift.endTime
                : `${shift.shift.endTime.hour.toString().padStart(2, '0')}:${shift.shift.endTime.minute.toString().padStart(2, '0')}:${shift.shift.endTime.second.toString().padStart(2, '0')}`;

            // Group by staff
            const staffKey = shift.staff.id.toString();
            if (!grouped.staff[staffKey]) {
                grouped.staff[staffKey] = [];
            }
            if (selectedRole === 'all' || shift.staff.userRoles[0].role.name === selectedRole) {
                grouped.staff[staffKey].push(shift);
            }

            // Group by role
            const roleKey = shift.staff.userRoles[0].role.name;
            if (!grouped.role[roleKey]) {
                grouped.role[roleKey] = [];
            }
            if (selectedRole === 'all' || roleKey === selectedRole) {
                grouped.role[roleKey].push(shift);
            }

            // Group by time
            const timeKey = `${startTimeStr}-${endTimeStr}`;
            if (!grouped.time[timeKey]) {
                grouped.time[timeKey] = [];
            }
            if (selectedRole === 'all' || shift.staff.userRoles[0].role.name === selectedRole) {
                grouped.time[timeKey].push(shift);
            }
        });

        return grouped;
    }, [staffShiftsData?.data, selectedRole]);

    // Memoize getGroupedShifts function
    const getGroupedShifts = useCallback((): GroupedShiftsType => {
        return groupedShiftsByView[viewMode] || {};
    }, [groupedShiftsByView, viewMode]);

    // Memoize calculateShiftPosition function
    const calculateShiftPosition = useCallback((shift: any, dayWidth: number) => {
        const shiftDate = new Date(shift.date);
        const dayIndex = daysInRange.findIndex(
            (day) => day.toDateString() === shiftDate.toDateString()
        );

        if (dayIndex === -1) return { left: 0, width: 0 };

        const left = dayIndex * dayWidth;
        const width = dayWidth;

        return { left, width };
    }, [daysInRange]);

    // Memoize handlers
    const handleEditClick = useCallback((shift: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStaffShift(shift);
        setIsEditDialogOpen(true);
    }, []);

    const handleDeleteClick = useCallback((shift: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedStaffShift(shift);
        setIsDeleteDialogOpen(true);
    }, []);

    // Fetch data with loading state
    const isLoading = isStaffShiftsLoading || staff?.isLoading || rolesData?.isLoading;

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
                            <Button onClick={() => {
                                setIsEditMode(false);
                                setCurrentShift({
                                    startTime: '09:00:00',
                                    endTime: '17:00:00',
                                    branchId: 1,
                                    requirements: [{ role: 'WAITER', quantity: 1 }],
                                });
                                setIsShiftDialogOpen(true);
                            }}>
                                <Plus className="mr-2 h-4 w-4" />
                                <span className="hidden sm:inline">
                                    Create Shift
                                </span>
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newDate = timeRange === 'week' ? subWeeks(date, 1) : subMonths(date, 1);
                                        handleDateChange(newDate);
                                    }}
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
                                            onSelect={(date) => date && handleDateChange(date)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const newDate = timeRange === 'week' ? addWeeks(date, 1) : addMonths(date, 1);
                                        handleDateChange(newDate);
                                    }}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center h-[600px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <Suspense fallback={
                        activeView === 'shifts' ? <ShiftCardSkeleton /> : <SchedulingCardSkeleton />
                    }>
                {activeView === 'shifts' ? (
                    <ShiftCard
                        shifts={shifts}
                        openEditDialog={() => {
                            setIsEditMode(true);
                            setIsShiftDialogOpen(true);
                        }}
                        setCurrentShift={setCurrentShift}
                        deleteShift={deleteShiftMutation.mutate}
                        roles={mockRoles}
                        isLoading={shiftsLoading}
                    />
                ) : (
                    <SchedulingCard
                        setViewMode={setViewMode}
                                setTimeRange={handleTimeRangeChange}
                        setSelectedRole={setSelectedRole}
                        setSelectedStaff={setSelectedStaff}
                        selectedRole={selectedRole}
                        selectedStaff={selectedStaff}
                        viewMode={viewMode}
                        daysInRange={daysInRange}
                                groupedShifts={getGroupedShifts}
                        calculateShiftPosition={calculateShiftPosition}
                        handleEditClick={handleEditClick}
                        handleDeleteClick={handleDeleteClick}
                        staff={staff?.data || []}
                        roles={rolesData?.data || []}
                        ganttRef={ganttRef}
                    />
                        )}
                    </Suspense>
                )}
            </div>

            <Suspense fallback={null}>
                {/* Modals */}
            <ShiftModal
                isShiftDialogOpen={isShiftDialogOpen}
                setIsShiftDialogOpen={setIsShiftDialogOpen}
                isEditMode={isEditMode}
                currentShift={currentShift}
                    handleInputChange={(field: keyof typeof currentShift, value: any) =>
                        setCurrentShift((prev) => ({ ...prev, [field]: value }))}
                    handleRequirementChange={(index: number, field: 'role' | 'quantity', value: string | number) => {
                    const updatedRequirements = [...currentShift.requirements];
                    updatedRequirements[index] = { ...updatedRequirements[index], [field]: value };
                    setCurrentShift((prev) => ({ ...prev, requirements: updatedRequirements }));
                }}
                addRequirement={() => {
                    setCurrentShift((prev) => ({
                        ...prev,
                        requirements: [...prev.requirements, { role: 'WAITER', quantity: 1 }],
                    }));
                }}
                    removeRequirement={(index: number) => {
                    const updatedRequirements = [...currentShift.requirements];
                    updatedRequirements.splice(index, 1);
                    setCurrentShift((prev) => ({ ...prev, requirements: updatedRequirements }));
                }}
                saveShift={() => {
                    if (isEditMode) {
                        updateShiftMutation.mutate(currentShift);
                    } else {
                        createShiftMutation.mutate(currentShift);
                    }
                    setIsShiftDialogOpen(false);
                }}
                mockBranches={mockBranches}
                roles={mockRoles}
            />

            <EditStaffShiftModal
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                selectedStaffShift={selectedStaffShift}
                    setSelectedStaffShift={(shift: StaffShiftResponseDto) => {
                    setSelectedStaffShift(shift);
                    setIsEditDialogOpen(true);
                }}
                shifts={shifts}
                handleUpdateStaffShift={() => {
                    setIsEditDialogOpen(false);
                }}
                mockStaff={staff?.data || []}
            />

            <DeleteStaffShiftModal
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                selectedStaffShift={selectedStaffShift}
                handleDeleteStaffShift={() => {
                    setIsDeleteDialogOpen(false);
                }}
            />
            </Suspense>
        </>
    );
}
