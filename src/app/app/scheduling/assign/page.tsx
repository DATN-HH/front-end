'use client';

import { useState } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, Plus, X, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

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
    {
        id: 106,
        fullName: 'David Brown',
        userRoles: [{ role: { name: 'KITCHEN', hexColor: '#FF5722' } }],
        displayName: 'David B.',
    },
    {
        id: 107,
        fullName: 'Lisa Taylor',
        userRoles: [{ role: { name: 'CASHIER', hexColor: '#2196F3' } }],
        displayName: 'Lisa T.',
    },
    {
        id: 108,
        fullName: 'James Miller',
        userRoles: [{ role: { name: 'MANAGER', hexColor: '#9C27B0' } }],
        displayName: 'James M.',
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
        requirements: [
            { id: 1, role: 'WAITER', quantity: 2 },
            { id: 2, role: 'CASHIER', quantity: 1 },
        ],
    },
    {
        id: 202,
        startTime: '12:00:00',
        endTime: '16:00:00',
        branchName: 'Downtown Branch',
        requirements: [
            { id: 3, role: 'WAITER', quantity: 3 },
            { id: 4, role: 'KITCHEN', quantity: 2 },
        ],
    },
    {
        id: 203,
        startTime: '16:00:00',
        endTime: '20:00:00',
        branchName: 'Downtown Branch',
        requirements: [
            { id: 5, role: 'WAITER', quantity: 2 },
            { id: 6, role: 'CASHIER', quantity: 1 },
            { id: 7, role: 'KITCHEN', quantity: 1 },
        ],
    },
];

// Mock staff shifts
const initialStaffShifts = [
    {
        id: 1,
        date: '2025-05-22',
        note: 'Regular shift',
        shiftStatus: 'DRAFT',
        staffId: 101,
        shiftId: 201,
        staff: mockStaff.find((s) => s.id === 101),
        shift: mockShifts.find((s) => s.id === 201),
    },
    {
        id: 2,
        date: '2025-05-22',
        note: '',
        shiftStatus: 'DRAFT',
        staffId: 103,
        shiftId: 201,
        staff: mockStaff.find((s) => s.id === 103),
        shift: mockShifts.find((s) => s.id === 201),
    },
];

// Mock branches
const mockBranches = [
    { id: 1, name: 'Downtown Branch' },
    { id: 2, name: 'Uptown Branch' },
    { id: 3, name: 'Westside Branch' },
];

export default function AssignStaffPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [selectedShift, setSelectedShift] = useState<any>(mockShifts[0]);
    const [selectedBranch, setSelectedBranch] = useState<number>(1);
    const [staffShifts, setStaffShifts] = useState(initialStaffShifts);
    const [filterRole, setFilterRole] = useState<string>('all');
    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [publishDateRange, setPublishDateRange] = useState<{
        startDate: Date;
        endDate: Date;
    }>({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });
    const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);
    const [bulkAssignData, setBulkAssignData] = useState({
        startDate: new Date(),
        endDate: new Date(),
        shiftId: mockShifts[0].id,
        staffIds: [] as number[],
        note: '',
    });

    // Format date for display
    const formatDate = (date: Date) => {
        return format(date, 'MMMM d, yyyy');
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    // Filter staff by role
    const filteredStaff = mockStaff.filter((staff) => {
        if (filterRole === 'all') return true;
        return staff.userRoles.some(
            (userRole) => userRole.role.name === filterRole
        );
    });

    // Get assigned staff for the current shift and date
    const getAssignedStaff = () => {
        return staffShifts.filter(
            (staffShift) =>
                staffShift.date === format(date, 'yyyy-MM-dd') &&
                staffShift.shiftId === selectedShift.id
        );
    };

    // Check if a staff member is already assigned to the current shift
    const isStaffAssigned = (staffId: number) => {
        return getAssignedStaff().some(
            (staffShift) => staffShift.staffId === staffId
        );
    };

    // Calculate how many staff are needed for each role
    const calculateStaffNeeded = () => {
        const assigned = getAssignedStaff();
        const requirements = selectedShift.requirements;

        return requirements.map((req: any) => {
            const assignedCount = assigned.filter(
                (a) => a.staff?.userRoles[0].role.name === req.role
            ).length;
            return {
                role: req.role,
                required: req.quantity,
                assigned: assignedCount,
                remaining: Math.max(0, req.quantity - assignedCount),
            };
        });
    };

    // Assign a staff member to the current shift
    const assignStaff = (staffId: number) => {
        if (isStaffAssigned(staffId)) {
            // Remove assignment if already assigned
            setStaffShifts((prev) =>
                prev.filter(
                    (staffShift) =>
                        !(
                            staffShift.date === format(date, 'yyyy-MM-dd') &&
                            staffShift.shiftId === selectedShift.id &&
                            staffShift.staffId === staffId
                        )
                )
            );
            //   toast({
            //     title: "Staff removed",
            //     description: "Staff has been removed from this shift.",
            //   })
        } else {
            // Add new assignment
            const staff = mockStaff.find((s) => s.id === staffId);
            const newStaffShift = {
                id: Math.max(0, ...staffShifts.map((s) => s.id)) + 1,
                date: format(date, 'yyyy-MM-dd'),
                note: '',
                shiftStatus: 'DRAFT',
                staffId,
                shiftId: selectedShift.id,
                staff,
                shift: selectedShift,
            };
            setStaffShifts((prev) => [...prev, newStaffShift]);
            //   toast({
            //     title: "Staff assigned",
            //     description: "Staff has been assigned to this shift.",
            //   })
        }
    };

    // Handle bulk assign
    const handleBulkAssign = () => {
        const { startDate, endDate, shiftId, staffIds, note } = bulkAssignData;

        if (staffIds.length === 0) {
            //   toast({
            //     title: "No staff selected",
            //     description: "Please select at least one staff member.",
            //     variant: "destructive",
            //   })
            return;
        }

        // Generate dates between start and end
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

        // Create new staff shifts
        const newStaffShifts = [];
        let nextId = Math.max(0, ...staffShifts.map((s) => s.id)) + 1;

        for (const staffId of staffIds) {
            const staff = mockStaff.find((s) => s.id === staffId);
            const shift = mockShifts.find((s) => s.id === shiftId);

            for (const day of dateRange) {
                const formattedDate = format(day, 'yyyy-MM-dd');

                // Check if this assignment already exists
                const exists = staffShifts.some(
                    (s) =>
                        s.date === formattedDate &&
                        s.staffId === staffId &&
                        s.shiftId === shiftId
                );

                if (!exists) {
                    newStaffShifts.push({
                        id: nextId++,
                        date: formattedDate,
                        note,
                        shiftStatus: 'DRAFT',
                        staffId,
                        shiftId,
                        staff,
                        shift,
                    });
                }
            }
        }

        setStaffShifts((prev) => [...prev, ...newStaffShifts]);

        // toast({
        //   title: "Bulk assignment complete",
        //   description: `${newStaffShifts.length} new assignments created.`,
        // })

        setBulkAssignDialogOpen(false);
        setBulkAssignData({
            startDate: new Date(),
            endDate: new Date(),
            shiftId: mockShifts[0].id,
            staffIds: [],
            note: '',
        });
    };

    // Handle publish
    const handlePublish = () => {
        // Filter shifts within the date range
        const startDateStr = format(publishDateRange.startDate, 'yyyy-MM-dd');
        const endDateStr = format(publishDateRange.endDate, 'yyyy-MM-dd');

        // Update status of shifts within the date range
        setStaffShifts((prev) =>
            prev.map((staffShift) => {
                if (
                    staffShift.date >= startDateStr &&
                    staffShift.date <= endDateStr
                ) {
                    return { ...staffShift, shiftStatus: 'PUBLISHED' };
                }
                return staffShift;
            })
        );

        setIsPublishDialogOpen(false);

        // toast({
        //   title: "Schedule published",
        //   description: `Schedule from ${formatDate(publishDateRange.startDate)} to ${formatDate(publishDateRange.endDate)} has been published.`,
        // })
    };

    return (
        <div className="container py-6">
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Assign Staff</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBulkAssignDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Bulk Assign
                        </Button>
                        <Button onClick={() => setIsPublishDialogOpen(true)}>
                            Publish Schedule
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left column - Date and Shift Selection */}
                    <Card className="md:col-span-4">
                        <CardHeader>
                            <CardTitle>Select Date & Shift</CardTitle>
                            <CardDescription>
                                Choose a date and shift to assign staff
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Branch
                                </label>
                                <Select
                                    value={selectedBranch.toString()}
                                    onValueChange={(value) =>
                                        setSelectedBranch(Number(value))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select branch" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {mockBranches.map((branch) => (
                                            <SelectItem
                                                key={branch.id}
                                                value={branch.id.toString()}
                                            >
                                                {branch.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

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
                                            {formatDate(date)}
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
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Shift
                                </label>
                                <Select
                                    value={selectedShift.id.toString()}
                                    onValueChange={(value) => {
                                        const shift = mockShifts.find(
                                            (s) => s.id.toString() === value
                                        );
                                        if (shift) setSelectedShift(shift);
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
                                                {formatTime(shift.startTime)} -{' '}
                                                {formatTime(shift.endTime)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-medium mb-2">
                                    Staff Requirements
                                </h3>
                                <div className="space-y-2">
                                    {calculateStaffNeeded().map(
                                        (req, index) => {
                                            const role = mockRoles.find(
                                                (r) => r.name === req.role
                                            );
                                            return (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        {role && (
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{
                                                                    backgroundColor:
                                                                        role.hexColor,
                                                                }}
                                                            />
                                                        )}
                                                        <span>{req.role}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span
                                                            className={
                                                                req.remaining >
                                                                0
                                                                    ? 'text-orange-500 font-medium'
                                                                    : 'text-green-500 font-medium'
                                                            }
                                                        >
                                                            {req.assigned}
                                                        </span>
                                                        /{req.required} assigned
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right column - Staff Assignment */}
                    <Card className="md:col-span-8">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle>Available Staff</CardTitle>
                                <Tabs
                                    defaultValue="all"
                                    onValueChange={(value) =>
                                        setFilterRole(value)
                                    }
                                >
                                    <TabsList>
                                        <TabsTrigger value="all">
                                            All
                                        </TabsTrigger>
                                        {mockRoles.map((role) => (
                                            <TabsTrigger
                                                key={role.name}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </TabsTrigger>
                                        ))}
                                    </TabsList>
                                </Tabs>
                            </div>
                            <CardDescription>
                                Click on a staff member to assign them to the
                                selected shift
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {filteredStaff.map((staff) => {
                                    const isAssigned = isStaffAssigned(
                                        staff.id
                                    );
                                    const roleColor =
                                        staff.userRoles[0].role.hexColor;

                                    return (
                                        <div
                                            key={staff.id}
                                            className={cn(
                                                'border rounded-md p-3 cursor-pointer transition-colors',
                                                isAssigned
                                                    ? 'bg-primary/10 border-primary/30'
                                                    : 'hover:bg-gray-50'
                                            )}
                                            onClick={() =>
                                                assignStaff(staff.id)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                roleColor,
                                                        }}
                                                    />
                                                    <span className="font-medium">
                                                        {staff.fullName}
                                                    </span>
                                                </div>
                                                {isAssigned && (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-primary/10 text-primary border-primary/30"
                                                    >
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Assigned
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-sm text-muted-foreground mt-1">
                                                {staff.userRoles[0].role.name}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Assigned Staff List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Current Assignments</CardTitle>
                        <CardDescription>
                            Staff assigned to {formatDate(date)},{' '}
                            {formatTime(selectedShift.startTime)} -{' '}
                            {formatTime(selectedShift.endTime)}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {getAssignedStaff().length > 0 ? (
                            <div className="space-y-3">
                                {getAssignedStaff().map((staffShift) => {
                                    const roleColor =
                                        staffShift.staff?.userRoles[0].role
                                            .hexColor;

                                    return (
                                        <div
                                            key={staffShift.id}
                                            className="flex items-center justify-between border rounded-md p-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            roleColor,
                                                    }}
                                                />
                                                <div>
                                                    <div className="font-medium">
                                                        {
                                                            staffShift.staff
                                                                ?.fullName
                                                        }
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {
                                                            staffShift.staff
                                                                ?.userRoles[0]
                                                                .role.name
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant={
                                                        staffShift.shiftStatus ===
                                                        'PUBLISHED'
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {staffShift.shiftStatus}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        assignStaff(
                                                            staffShift.staffId
                                                        )
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p>No staff assigned to this shift yet</p>
                                <p className="text-sm">
                                    Click on staff members above to assign them
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Publish Dialog */}
            <Dialog
                open={isPublishDialogOpen}
                onOpenChange={setIsPublishDialogOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Publish Schedule</DialogTitle>
                        <DialogDescription>
                            Publishing will make the schedule visible to all
                            staff members. Select the date range to publish.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Start Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(
                                                publishDateRange.startDate
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={
                                                publishDateRange.startDate
                                            }
                                            onSelect={(date) =>
                                                date &&
                                                setPublishDateRange((prev) => ({
                                                    ...prev,
                                                    startDate: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    End Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(
                                                publishDateRange.endDate
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={publishDateRange.endDate}
                                            onSelect={(date) =>
                                                date &&
                                                setPublishDateRange((prev) => ({
                                                    ...prev,
                                                    endDate: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsPublishDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handlePublish}>Publish</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Assign Dialog */}
            <Dialog
                open={bulkAssignDialogOpen}
                onOpenChange={setBulkAssignDialogOpen}
            >
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Bulk Assign Staff</DialogTitle>
                        <DialogDescription>
                            Assign multiple staff members to shifts across a
                            date range
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Start Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(
                                                bulkAssignData.startDate
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={bulkAssignData.startDate}
                                            onSelect={(date) =>
                                                date &&
                                                setBulkAssignData((prev) => ({
                                                    ...prev,
                                                    startDate: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    End Date
                                </label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {formatDate(bulkAssignData.endDate)}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={bulkAssignData.endDate}
                                            onSelect={(date) =>
                                                date &&
                                                setBulkAssignData((prev) => ({
                                                    ...prev,
                                                    endDate: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Shift</label>
                            <Select
                                value={bulkAssignData.shiftId.toString()}
                                onValueChange={(value) =>
                                    setBulkAssignData((prev) => ({
                                        ...prev,
                                        shiftId: Number(value),
                                    }))
                                }
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
                                            {formatTime(shift.startTime)} -{' '}
                                            {formatTime(shift.endTime)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Staff Members
                            </label>
                            <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
                                <div className="space-y-2">
                                    {mockStaff.map((staff) => {
                                        const isSelected =
                                            bulkAssignData.staffIds.includes(
                                                staff.id
                                            );
                                        return (
                                            <div
                                                key={staff.id}
                                                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                                onClick={() => {
                                                    setBulkAssignData(
                                                        (prev) => ({
                                                            ...prev,
                                                            staffIds: isSelected
                                                                ? prev.staffIds.filter(
                                                                      (id) =>
                                                                          id !==
                                                                          staff.id
                                                                  )
                                                                : [
                                                                      ...prev.staffIds,
                                                                      staff.id,
                                                                  ],
                                                        })
                                                    );
                                                }}
                                            >
                                                <div
                                                    className={cn(
                                                        'w-4 h-4 rounded border flex items-center justify-center',
                                                        isSelected
                                                            ? 'bg-primary border-primary'
                                                            : 'border-gray-300'
                                                    )}
                                                >
                                                    {isSelected && (
                                                        <Check className="h-3 w-3 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                staff
                                                                    .userRoles[0]
                                                                    .role
                                                                    .hexColor,
                                                        }}
                                                    />
                                                    <span>
                                                        {staff.fullName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        (
                                                        {
                                                            staff.userRoles[0]
                                                                .role.name
                                                        }
                                                        )
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Note (Optional)
                            </label>
                            <Textarea
                                placeholder="Add a note for these assignments"
                                value={bulkAssignData.note}
                                onChange={(e) =>
                                    setBulkAssignData((prev) => ({
                                        ...prev,
                                        note: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setBulkAssignDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleBulkAssign}>Assign Staff</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
