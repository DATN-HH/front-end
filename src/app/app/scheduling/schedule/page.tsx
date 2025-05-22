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
} from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Filter,
    Edit,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';

// Mock data for staff shifts
const mockStaffShifts = [
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
            id: 201,
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
            id: 201,
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
            id: 202,
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
            id: 203,
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
            id: 204,
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
            id: 204,
            startTime: '12:00:00',
            endTime: '20:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
];

// Mock data for staff
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

// Mock roles
const mockRoles = [
    { name: 'WAITER', hexColor: '#4CAF50' },
    { name: 'CASHIER', hexColor: '#2196F3' },
    { name: 'KITCHEN', hexColor: '#FF5722' },
    { name: 'MANAGER', hexColor: '#9C27B0' },
    { name: 'SUPPORT', hexColor: '#607D8B' },
];

// Mock shifts
const mockShifts = [
    {
        id: 201,
        startTime: '08:00:00',
        endTime: '12:00:00',
        branchName: 'Downtown Branch',
        requirements: [{ role: 'WAITER', quantity: 2 }],
    },
    {
        id: 202,
        startTime: '09:00:00',
        endTime: '13:00:00',
        branchName: 'Downtown Branch',
        requirements: [{ role: 'CASHIER', quantity: 1 }],
    },
    {
        id: 203,
        startTime: '07:00:00',
        endTime: '15:00:00',
        branchName: 'Downtown Branch',
        requirements: [{ role: 'KITCHEN', quantity: 3 }],
    },
    {
        id: 204,
        startTime: '12:00:00',
        endTime: '20:00:00',
        branchName: 'Downtown Branch',
        requirements: [{ role: 'WAITER', quantity: 2 }],
    },
];

export default function SchedulePage() {
    const [date, setDate] = useState<Date>(new Date());
    const [viewMode, setViewMode] = useState<'staff' | 'role' | 'time'>(
        'staff'
    );
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStaff, setSelectedStaff] = useState<number | 'all'>('all');
    const [shifts, setShifts] = useState(mockStaffShifts);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<any>(null);
    const [draggedShift, setDraggedShift] = useState<any>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const ganttRef = useRef<HTMLDivElement>(null);

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
            setDate(addDays(date, -7));
        } else {
            setDate(addDays(date, -30));
        }
    };

    const navigateNext = () => {
        if (timeRange === 'week') {
            setDate(addDays(date, 7));
        } else {
            setDate(addDays(date, 30));
        }
    };

    // Filter shifts based on selected role and staff
    const filteredShifts = shifts.filter((shift) => {
        const roleMatch =
            selectedRole === 'all' ||
            shift.staff.userRoles[0].role.name === selectedRole;
        const staffMatch =
            selectedStaff === 'all' || shift.staff.id === selectedStaff;

        // Check if the shift date is within the current view range
        const shiftDate = parseISO(shift.date);
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
            const staffGroups: Record<number, any[]> = {};
            filteredShifts.forEach((shift) => {
                if (!staffGroups[shift.staff.id]) {
                    staffGroups[shift.staff.id] = [];
                }
                staffGroups[shift.staff.id].push(shift);
            });
            return staffGroups;
        } else if (viewMode === 'role') {
            // Group by role
            const roleGroups: Record<string, any[]> = {};
            filteredShifts.forEach((shift) => {
                const role = shift.staff.userRoles[0].role.name;
                if (!roleGroups[role]) {
                    roleGroups[role] = [];
                }
                roleGroups[role].push(shift);
            });
            return roleGroups;
        } else {
            // Group by time (shift)
            const timeGroups: Record<string, any[]> = {};
            filteredShifts.forEach((shift) => {
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
    const calculateShiftPosition = (shift: any, dayWidth: number) => {
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
    const handleEditClick = (shift: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedShift({ ...shift });
        setIsEditDialogOpen(true);
    };

    // Handle delete dialog open
    const handleDeleteClick = (shift: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedShift(shift);
        setIsDeleteDialogOpen(true);
    };

    // Handle shift update
    const handleUpdateShift = () => {
        if (!selectedShift) return;

        // Update shift in state
        setShifts((prev) =>
            prev.map((shift) =>
                shift.id === selectedShift.id ? { ...selectedShift } : shift
            )
        );

        setIsEditDialogOpen(false);
        // toast({
        //   title: "Shift updated",
        //   description: "The shift has been updated successfully.",
        // })
    };

    // Handle shift delete
    const handleDeleteShift = () => {
        if (!selectedShift) return;

        // Remove shift from state
        setShifts((prev) =>
            prev.filter((shift) => shift.id !== selectedShift.id)
        );

        setIsDeleteDialogOpen(false);
        // toast({
        //   title: "Shift deleted",
        //   description: "The shift has been deleted successfully.",
        // })
    };

    // Drag and drop functionality
    const handleDragStart = (shift: any, e: React.MouseEvent) => {
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
            setDraggedShift((prev: any) => ({
                ...prev,
                date: newDate,
            }));
        }
    };

    const handleDragEnd = () => {
        if (isDragging && draggedShift) {
            // Update the shift in the state with the new date
            setShifts((prev) =>
                prev.map((shift) =>
                    shift.id === draggedShift.id ? { ...draggedShift } : shift
                )
            );

            // toast({
            //   title: "Shift moved",
            //   description: `Shift has been moved to ${format(parseISO(draggedShift.date), "MMMM d, yyyy")}`,
            // })
        }

        setIsDragging(false);
        setDraggedShift(null);
    };

    // Add event listeners for drag and drop
    // useEffect(() => {
    //   if (isDragging) {
    //     window.addEventListener("mousemove", handleDragMove)
    //     window.addEventListener("mouseup", handleDragEnd)
    //   }

    //   return () => {
    //     window.removeEventListener("mousemove", handleDragMove)
    //     window.removeEventListener("mouseup", handleDragEnd)
    //   }
    // }, [isDragging, draggedShift])

    return (
        <div className="container py-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Schedule Overview</h1>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={navigatePrevious}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="min-w-[240px] justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {format(startDate, 'MMMM d, yyyy')} -{' '}
                                    {format(endDate, 'MMMM d, yyyy')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={(date) => date && setDate(date)}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                        <Button variant="outline" onClick={navigateNext}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>Gantt View</CardTitle>
                            <div className="flex items-center gap-2">
                                <Tabs
                                    defaultValue="staff"
                                    onValueChange={(value) =>
                                        setViewMode(value as any)
                                    }
                                >
                                    <TabsList>
                                        <TabsTrigger value="staff">
                                            By Staff
                                        </TabsTrigger>
                                        <TabsTrigger value="role">
                                            By Role
                                        </TabsTrigger>
                                        <TabsTrigger value="time">
                                            By Time
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>

                                <Tabs
                                    defaultValue="week"
                                    onValueChange={(value) =>
                                        setTimeRange(value as any)
                                    }
                                >
                                    <TabsList>
                                        <TabsTrigger value="week">
                                            Week
                                        </TabsTrigger>
                                        <TabsTrigger value="month">
                                            Month
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    Filters:
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-sm">Role:</span>
                                <Select
                                    value={selectedRole}
                                    onValueChange={setSelectedRole}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Roles
                                        </SelectItem>
                                        {mockRoles.map((role) => (
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
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select staff" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All Staff
                                        </SelectItem>
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
                                <div className="min-w-[200px] p-2 font-medium border-r">
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
                                                index <
                                                    daysInRange.length - 1 &&
                                                    'border-r',
                                                day.getDay() === 0 ||
                                                    day.getDay() === 6
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
                                                staff?.userRoles[0].role
                                                    .hexColor || '';
                                        } else if (viewMode === 'role') {
                                            groupLabel = key;
                                            const role = mockRoles.find(
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
                                                <div className="min-w-[200px] p-2 border-r flex items-center gap-2">
                                                    {groupColor && (
                                                        <div
                                                            className="w-3 h-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    groupColor,
                                                            }}
                                                        />
                                                    )}
                                                    <span className="font-medium">
                                                        {groupLabel}
                                                    </span>
                                                </div>

                                                <div
                                                    className="flex-1 relative"
                                                    style={{ height: '60px' }}
                                                >
                                                    {/* Time grid lines */}
                                                    <div className="absolute inset-0 flex">
                                                        {daysInRange.map(
                                                            (_, index) => (
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
                                                            )
                                                        )}
                                                    </div>

                                                    {/* Shift bars */}
                                                    {shifts.map((shift) => {
                                                        const dayWidth = 100; // Minimum width per day
                                                        const { left, width } =
                                                            calculateShiftPosition(
                                                                shift,
                                                                dayWidth
                                                            );

                                                        // Skip if not visible
                                                        if (width === 0)
                                                            return null;

                                                        const roleColor =
                                                            shift.staff
                                                                .userRoles[0]
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
                                                                            <span>
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
                                Tip: Drag shifts to move them to different days.
                                Click on a shift to edit or delete it.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Edit Shift Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Edit Shift</DialogTitle>
                        <DialogDescription>
                            Update the details of this shift assignment.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShift && (
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
                                                {selectedShift.date
                                                    ? format(
                                                          parseISO(
                                                              selectedShift.date
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
                                                    selectedShift.date
                                                        ? parseISO(
                                                              selectedShift.date
                                                          )
                                                        : undefined
                                                }
                                                onSelect={(date) =>
                                                    setSelectedShift(
                                                        (prev: any) => ({
                                                            ...prev,
                                                            date: date
                                                                ? format(
                                                                      date,
                                                                      'yyyy-MM-dd'
                                                                  )
                                                                : prev.date,
                                                        })
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
                                        value={selectedShift.shift.id.toString()}
                                        onValueChange={(value) => {
                                            const newShift = mockShifts.find(
                                                (s) => s.id.toString() === value
                                            );
                                            if (newShift) {
                                                setSelectedShift(
                                                    (prev: any) => ({
                                                        ...prev,
                                                        shift: newShift,
                                                    })
                                                );
                                            }
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select shift" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {mockShifts.map((shift) => (
                                                <SelectItem
                                                    key={shift.id}
                                                    value={shift.id.toString()}
                                                >
                                                    {shift.startTime.substring(
                                                        0,
                                                        5
                                                    )}{' '}
                                                    -{' '}
                                                    {shift.endTime.substring(
                                                        0,
                                                        5
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Staff
                                </label>
                                <Select
                                    value={selectedShift.staff.id.toString()}
                                    onValueChange={(value) => {
                                        const newStaff = mockStaff.find(
                                            (s) => s.id.toString() === value
                                        );
                                        if (newStaff) {
                                            setSelectedShift((prev: any) => ({
                                                ...prev,
                                                staff: newStaff,
                                            }));
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
                                <label className="text-sm font-medium">
                                    Note
                                </label>
                                <Textarea
                                    placeholder="Add a note for this shift"
                                    value={selectedShift.note}
                                    onChange={(e) =>
                                        setSelectedShift((prev: any) => ({
                                            ...prev,
                                            note: e.target.value,
                                        }))
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Status
                                </label>
                                <Select
                                    value={selectedShift.shiftStatus}
                                    onValueChange={(value) =>
                                        setSelectedShift((prev: any) => ({
                                            ...prev,
                                            shiftStatus: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DRAFT">
                                            Draft
                                        </SelectItem>
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
                        <Button onClick={handleUpdateShift}>
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this shift
                            assignment?
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShift && (
                        <div className="py-4">
                            <div className="space-y-2">
                                <p>
                                    <span className="font-medium">Staff:</span>{' '}
                                    {selectedShift.staff.fullName}
                                </p>
                                <p>
                                    <span className="font-medium">Date:</span>{' '}
                                    {format(
                                        parseISO(selectedShift.date),
                                        'MMMM d, yyyy'
                                    )}
                                </p>
                                <p>
                                    <span className="font-medium">Time:</span>{' '}
                                    {selectedShift.shift.startTime.substring(
                                        0,
                                        5
                                    )}{' '}
                                    -{' '}
                                    {selectedShift.shift.endTime.substring(
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
                            onClick={handleDeleteShift}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
