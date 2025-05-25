'use client';

import { useState } from 'react';
import {
    format,
    parseISO,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    addDays,
    isSameDay,
} from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    CalendarIcon,
    ChevronLeft,
    ChevronRight,
    Clock,
    Plus,
    CalendarPlus2Icon as CalendarIcon2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock staff shifts
const mockStaffShifts = [
    {
        id: 1,
        date: '2025-05-22',
        note: 'Regular shift',
        shiftStatus: 'PUBLISHED',
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
        date: '2025-05-23',
        note: '',
        shiftStatus: 'PUBLISHED',
        shift: {
            id: 204,
            startTime: '12:00:00',
            endTime: '20:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 2 }],
        },
    },
    {
        id: 3,
        date: '2025-05-25',
        note: '',
        shiftStatus: 'PUBLISHED',
        shift: {
            id: 202,
            startTime: '09:00:00',
            endTime: '13:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 1 }],
        },
    },
    {
        id: 4,
        date: '2025-05-27',
        note: '',
        shiftStatus: 'PUBLISHED',
        shift: {
            id: 203,
            startTime: '07:00:00',
            endTime: '15:00:00',
            branchName: 'Downtown Branch',
            requirements: [{ role: 'WAITER', quantity: 3 }],
        },
    },
];

// Mock time-off requests
const mockTimeOffRequests = [
    {
        id: 1,
        startTime: '2025-05-29T09:00:00Z',
        endTime: '2025-05-29T17:00:00Z',
        reason: 'Doctor appointment',
        requestStatus: 'PENDING',
        createdAt: '2025-05-21T14:30:00Z',
    },
];

// Mock shift exchange requests
const mockShiftRequests = [
    {
        id: 1,
        targetShiftId: 2,
        type: 'EXCHANGE',
        requestStatus: 'PENDING',
        reason: 'Family event',
        createdAt: '2025-05-21T10:15:00Z',
        targetShift: {
            id: 2,
            date: '2025-05-23',
            shift: {
                startTime: '12:00:00',
                endTime: '20:00:00',
            },
        },
    },
];

export default function EmployeePortalPage() {
    const [date, setDate] = useState<Date>(new Date());
    const [shifts, setShifts] = useState(mockStaffShifts);
    const [timeOffRequests, setTimeOffRequests] = useState(mockTimeOffRequests);
    const [shiftRequests, setShiftRequests] = useState(mockShiftRequests);
    const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
    const [isShiftRequestDialogOpen, setIsShiftRequestDialogOpen] =
        useState(false);
    const [selectedShift, setSelectedShift] = useState<any>(null);

    // New time-off request form state
    const [newTimeOff, setNewTimeOff] = useState({
        startDate: new Date(),
        startTime: '09:00',
        endDate: new Date(),
        endTime: '17:00',
        reason: '',
    });

    // New shift request form state
    const [newShiftRequest, setNewShiftRequest] = useState({
        type: 'EXCHANGE',
        reason: '',
    });

    // Calculate date range for the week view
    const startDate = startOfWeek(date, { weekStartsOn: 1 }); // Start from Monday
    const endDate = endOfWeek(date, { weekStartsOn: 1 }); // End on Sunday
    const daysInWeek = eachDayOfInterval({ start: startDate, end: endDate });

    // Navigate to previous/next week
    const navigatePrevious = () => {
        setDate(addDays(date, -7));
    };

    const navigateNext = () => {
        setDate(addDays(date, 7));
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(parseISO(dateString), 'MMM d, yyyy');
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    // Check if a shift is on a specific day
    const getShiftsForDay = (day: Date) => {
        return shifts.filter((shift) => {
            const shiftDate = parseISO(shift.date);
            return isSameDay(shiftDate, day);
        });
    };

    // Handle time-off request submission
    const handleTimeOffSubmit = () => {
        // Create ISO date strings
        const startDateTime = `${format(newTimeOff.startDate, 'yyyy-MM-dd')}T${newTimeOff.startTime}:00Z`;
        const endDateTime = `${format(newTimeOff.endDate, 'yyyy-MM-dd')}T${newTimeOff.endTime}:00Z`;

        // Create new request
        const newRequest = {
            id: Math.max(0, ...timeOffRequests.map((r) => r.id)) + 1,
            startTime: startDateTime,
            endTime: endDateTime,
            reason: newTimeOff.reason,
            requestStatus: 'PENDING',
            createdAt: new Date().toISOString(),
        };

        // Add to state
        setTimeOffRequests((prev) => [...prev, newRequest]);

        // Reset form and close dialog
        setNewTimeOff({
            startDate: new Date(),
            startTime: '09:00',
            endDate: new Date(),
            endTime: '17:00',
            reason: '',
        });
        setIsTimeOffDialogOpen(false);

        // toast({
        //   title: "Time-off request submitted",
        //   description: "Your request has been submitted and is pending approval.",
        // })
    };

    // Handle shift request submission
    const handleShiftRequestSubmit = () => {
        if (!selectedShift) return;

        // Create new request
        const newRequest = {
            id: Math.max(0, ...shiftRequests.map((r) => r.id)) + 1,
            targetShiftId: selectedShift.id,
            type: newShiftRequest.type,
            requestStatus: 'PENDING',
            reason: newShiftRequest.reason,
            createdAt: new Date().toISOString(),
            targetShift: {
                id: selectedShift.id,
                date: selectedShift.date,
                shift: {
                    startTime: selectedShift.shift.startTime,
                    endTime: selectedShift.shift.endTime,
                },
            },
        };

        // Add to state
        setShiftRequests((prev) => [...prev, newRequest]);

        // Reset form and close dialog
        setNewShiftRequest({
            type: 'EXCHANGE',
            reason: '',
        });
        setSelectedShift(null);
        setIsShiftRequestDialogOpen(false);

        // toast({
        //   title: "Shift request submitted",
        //   description: "Your request has been submitted and is pending approval.",
        // })
    };

    // Open shift request dialog
    const openShiftRequestDialog = (shift: any) => {
        setSelectedShift(shift);
        setIsShiftRequestDialogOpen(true);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-300"
                    >
                        Pending
                    </Badge>
                );
            case 'APPROVED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-300"
                    >
                        Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-300"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Employee Portal
                        </h1>
                        <p className="text-muted-foreground">
                            View your schedule, request time off, and manage
                            shift requests.
                        </p>
                    </div>

                    <Button
                        onClick={() => setIsTimeOffDialogOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Request Time Off
                    </Button>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>My Schedule</CardTitle>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={navigatePrevious}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="min-w-[240px] justify-start text-left font-normal"
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {format(startDate, 'MMMM d, yyyy')}{' '}
                                            - {format(endDate, 'MMMM d, yyyy')}
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
                                    size="icon"
                                    onClick={navigateNext}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-2">
                            {daysInWeek.map((day, index) => (
                                <div key={index} className="flex flex-col">
                                    <div
                                        className={cn(
                                            'text-center p-2 font-medium',
                                            isSameDay(day, new Date()) &&
                                                'bg-primary/10 rounded-t-md'
                                        )}
                                    >
                                        <div>{format(day, 'EEE')}</div>
                                        <div>{format(day, 'd')}</div>
                                    </div>

                                    <div
                                        className={cn(
                                            'flex-1 min-h-[150px] border rounded-b-md p-2',
                                            isSameDay(day, new Date()) &&
                                                'border-primary/30'
                                        )}
                                    >
                                        {getShiftsForDay(day).map((shift) => (
                                            <div
                                                key={shift.id}
                                                className="mb-2 p-2 rounded-md bg-primary/10 border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
                                                onClick={() =>
                                                    openShiftRequestDialog(
                                                        shift
                                                    )
                                                }
                                            >
                                                <div className="font-medium text-sm">
                                                    {formatTime(
                                                        shift.shift.startTime
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(
                                                        shift.shift.endTime
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {shift.shift.branchName}
                                                </div>
                                                {shift.note && (
                                                    <div className="text-xs mt-1 italic">
                                                        {shift.note}
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {getShiftsForDay(day).length === 0 && (
                                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                                No shifts
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>My Time-off Requests</CardTitle>
                            <CardDescription>
                                View and manage your time-off requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {timeOffRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {timeOffRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border rounded-md p-4"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {format(
                                                            parseISO(
                                                                request.startTime
                                                            ),
                                                            'MMM d, yyyy'
                                                        )}
                                                    </span>
                                                </div>
                                                {getStatusBadge(
                                                    request.requestStatus
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {format(
                                                        parseISO(
                                                            request.startTime
                                                        ),
                                                        'h:mm a'
                                                    )}{' '}
                                                    -{' '}
                                                    {format(
                                                        parseISO(
                                                            request.endTime
                                                        ),
                                                        'h:mm a'
                                                    )}
                                                </span>
                                            </div>

                                            <p className="text-sm">
                                                <span className="font-medium">
                                                    Reason:{' '}
                                                </span>
                                                {request.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No time-off requests</p>
                                    <Button
                                        variant="outline"
                                        className="mt-2"
                                        onClick={() =>
                                            setIsTimeOffDialogOpen(true)
                                        }
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Request Time Off
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>My Shift Requests</CardTitle>
                            <CardDescription>
                                View and manage your shift exchange or drop
                                requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {shiftRequests.length > 0 ? (
                                <div className="space-y-4">
                                    {shiftRequests.map((request) => (
                                        <div
                                            key={request.id}
                                            className="border rounded-md p-4"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    <CalendarIcon2 className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">
                                                        {formatDate(
                                                            request.targetShift
                                                                .date
                                                        )}
                                                    </span>
                                                </div>
                                                {getStatusBadge(
                                                    request.requestStatus
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {formatTime(
                                                        request.targetShift
                                                            .shift.startTime
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(
                                                        request.targetShift
                                                            .shift.endTime
                                                    )}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-sm mb-2">
                                                <Badge variant="outline">
                                                    {request.type === 'EXCHANGE'
                                                        ? 'Shift Exchange'
                                                        : 'Leave Request'}
                                                </Badge>
                                            </div>

                                            <p className="text-sm">
                                                <span className="font-medium">
                                                    Reason:{' '}
                                                </span>
                                                {request.reason}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No shift requests</p>
                                    <p className="text-xs mt-1">
                                        Click on a shift in the calendar to
                                        request a change
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Time-off Request Dialog */}
            <Dialog
                open={isTimeOffDialogOpen}
                onOpenChange={setIsTimeOffDialogOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Request Time Off</DialogTitle>
                        <DialogDescription>
                            Submit a request for time off. Your manager will
                            review your request.
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
                                            {format(
                                                newTimeOff.startDate,
                                                'PPP'
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newTimeOff.startDate}
                                            onSelect={(date) =>
                                                date &&
                                                setNewTimeOff((prev) => ({
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
                                    Start Time
                                </label>
                                <Select
                                    value={newTimeOff.startTime}
                                    onValueChange={(value) =>
                                        setNewTimeOff((prev) => ({
                                            ...prev,
                                            startTime: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="09:00">
                                            9:00 AM
                                        </SelectItem>
                                        <SelectItem value="10:00">
                                            10:00 AM
                                        </SelectItem>
                                        <SelectItem value="11:00">
                                            11:00 AM
                                        </SelectItem>
                                        <SelectItem value="12:00">
                                            12:00 PM
                                        </SelectItem>
                                        <SelectItem value="13:00">
                                            1:00 PM
                                        </SelectItem>
                                        <SelectItem value="14:00">
                                            2:00 PM
                                        </SelectItem>
                                        <SelectItem value="15:00">
                                            3:00 PM
                                        </SelectItem>
                                        <SelectItem value="16:00">
                                            4:00 PM
                                        </SelectItem>
                                        <SelectItem value="17:00">
                                            5:00 PM
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
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
                                            {format(newTimeOff.endDate, 'PPP')}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newTimeOff.endDate}
                                            onSelect={(date) =>
                                                date &&
                                                setNewTimeOff((prev) => ({
                                                    ...prev,
                                                    endDate: date,
                                                }))
                                            }
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    End Time
                                </label>
                                <Select
                                    value={newTimeOff.endTime}
                                    onValueChange={(value) =>
                                        setNewTimeOff((prev) => ({
                                            ...prev,
                                            endTime: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="09:00">
                                            9:00 AM
                                        </SelectItem>
                                        <SelectItem value="10:00">
                                            10:00 AM
                                        </SelectItem>
                                        <SelectItem value="11:00">
                                            11:00 AM
                                        </SelectItem>
                                        <SelectItem value="12:00">
                                            12:00 PM
                                        </SelectItem>
                                        <SelectItem value="13:00">
                                            1:00 PM
                                        </SelectItem>
                                        <SelectItem value="14:00">
                                            2:00 PM
                                        </SelectItem>
                                        <SelectItem value="15:00">
                                            3:00 PM
                                        </SelectItem>
                                        <SelectItem value="16:00">
                                            4:00 PM
                                        </SelectItem>
                                        <SelectItem value="17:00">
                                            5:00 PM
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                Reason
                            </label>
                            <Textarea
                                placeholder="Please provide a reason for your time-off request"
                                value={newTimeOff.reason}
                                onChange={(e) =>
                                    setNewTimeOff((prev) => ({
                                        ...prev,
                                        reason: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsTimeOffDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleTimeOffSubmit}>
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Shift Request Dialog */}
            <Dialog
                open={isShiftRequestDialogOpen}
                onOpenChange={setIsShiftRequestDialogOpen}
            >
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Request Shift Change</DialogTitle>
                        <DialogDescription>
                            Submit a request to exchange or drop this shift.
                            Your manager will review your request.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShift && (
                        <div className="grid gap-4 py-4">
                            <div className="border rounded-md p-4 bg-muted/50">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon2 className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {formatDate(selectedShift.date)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>
                                        {formatTime(
                                            selectedShift.shift.startTime
                                        )}{' '}
                                        -{' '}
                                        {formatTime(
                                            selectedShift.shift.endTime
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Request Type
                                </label>
                                <Select
                                    value={newShiftRequest.type}
                                    onValueChange={(value) =>
                                        setNewShiftRequest((prev) => ({
                                            ...prev,
                                            type: value,
                                        }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select request type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EXCHANGE">
                                            Shift Exchange
                                        </SelectItem>
                                        <SelectItem value="LEAVE">
                                            Leave Request
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Reason
                                </label>
                                <Textarea
                                    placeholder="Please provide a reason for your request"
                                    value={newShiftRequest.reason}
                                    onChange={(e) =>
                                        setNewShiftRequest((prev) => ({
                                            ...prev,
                                            reason: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsShiftRequestDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button onClick={handleShiftRequestSubmit}>
                            Submit Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
