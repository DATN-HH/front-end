'use client';
import { useEffect, useMemo, useState } from 'react';
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { CalendarIcon, Plus, X, Users, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomToast } from '@/lib/show-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { getShifts, Shift } from '@/features/scheduling/api/api-shift';
import { getRoles } from '@/features/system/api/api-role';
import { getListUsers } from '@/features/system/api/api-user';
import {
    delStaffShift,
    getStaffShift,
    postStaffShiftBulk,
    publicStaffShifts,
} from '@/features/scheduling/api/api-staff-shift';

export default function AssignStaffPage() {
    const { user } = useAuth();
    const { error: toastError, success } = useCustomToast();
    const queryClient = useQueryClient();

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [employees, setEmployees] = useState([]);
    const [date, setDate] = useState<Date>(new Date());
    const [selectedShift, setSelectedShift] = useState({});
    const [draftStaffShifts, setDraftStaffShifts] = useState([]);
    const [filterRole, setFilterRole] = useState<string>('all');

    const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false);

    const [publishDateRange, setPublishDateRange] = useState<{
        startDate: Date;
        endDate: Date;
    }>({
        startDate: startOfWeek(new Date(), { weekStartsOn: 1 }),
        endDate: endOfWeek(new Date(), { weekStartsOn: 1 }),
    });
    const [deleteStaffShift, setDeleteStaffShift] = useState();
    const [bulkAssignData, setBulkAssignData] = useState({
        startDate: new Date(),
        endDate: new Date(),
        shiftId: shifts.length > 0 ? shifts[0].id : null,
        staffIds: [],
        note: '',
    });

    // ========================================
    // QUERY PARAMETERS (MEMOIZED)
    // ========================================
    const queryParams = useMemo(
        () => ({
            branchId: user?.branch.id,
            isEmployee: true,
            size: 1000,
        }),
        [user]
    );

    const queryStaffShift = useMemo(
        () => ({
            branchId: user?.branch.id,
            size: 1000,
            startDate: format(date, 'yyyy-MM-dd'),
            endDate: format(date, 'yyyy-MM-dd'),
            shiftId: selectedShift?.id,
        }),
        [user, date, selectedShift]
    );

    const queryPublic = useMemo(
        () => ({
            branchId: user?.branch.id,
            startDate: publishDateRange.startDate,
            endDate: publishDateRange.endDate,
        }),
        [user, publishDateRange]
    );

    // ========================================
    // API QUERIES
    // ========================================
    const { data: fetchedShifts = [] as Shift[], isLoading: shiftsLoading } =
        useQuery({
            queryKey: ['shifts', shifts],
            queryFn: () => getShifts(user?.branch.id),
        });

    const { data: roleList } = useQuery({
        queryKey: ['roles'],
        queryFn: () => getRoles(),
    });

    const { data: staffShifts } = useQuery({
        queryKey: ['staff-shifts', queryStaffShift],
        queryFn: () => getStaffShift(queryStaffShift),
    });

    const { data: employeeList, isLoading } = useQuery({
        queryKey: ['employees', queryParams],
        queryFn: () => getListUsers(queryParams),
    });

    // ========================================
    // MUTATIONS
    // ========================================
    const createDraftStaffShift = useMutation({
        mutationFn: (staffShifts: any[]) => postStaffShiftBulk(staffShifts),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
            success('Success', 'Staff shifts create successfully');
            setDraftStaffShifts([]);
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message ||
                    'Failed to create staff shifts'
            );
            console.error('Create error:', error);
        },
    });

    const publicStaffShift = useMutation({
        mutationFn: (query: any) => publicStaffShifts(query),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
            success('Success', 'Staff shifts publish successfully');
            setDraftStaffShifts([]);
            setIsPublishDialogOpen(false);
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message ||
                    'Failed to public staff shifts'
            );
            console.error('Public error:', error);
        },
    });

    const deleStaffShift = useMutation({
        mutationFn: (id: any) => delStaffShift(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['staff-shifts'] });
            success('Success', 'Staff shifts delete successfully');
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message ||
                    'Failed to delete staff shifts'
            );
            setIsDeleteDialogOpen(false);
            console.error('Delete error:', error);
        },
    });

    // ========================================
    // EFFECTS
    // ========================================
    useEffect(() => {
        if (roleList && 'data' in roleList) {
            setRoles(roleList?.data);
        }
    }, [roleList]);

    useEffect(() => {
        if (fetchedShifts.length > 0) {
            setShifts(fetchedShifts);
            setSelectedShift(fetchedShifts[0]);
        }
    }, [fetchedShifts]);

    useEffect(() => {
        if (employeeList && 'data' in employeeList) {
            setEmployees(employeeList.data);
        }
    }, [employeeList]);

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    const formatDate = (date: Date) => {
        if (!date) return '';
        return format(date, 'MMMM d, yyyy');
    };

    const formatTime = (timeString: string) => {
        return timeString?.substring(0, 5);
    };

    const filteredStaff = employees.filter((staff) => {
        if (filterRole === 'all') return true;
        return staff?.userRoles?.some(
            (userRole: any) => userRole.role.name === filterRole
        );
    });

    const isStaffAlreadyScheduled = (staffId: any) => {
        return staffShifts?.some(
            (staffShift) => staffShift.staff.id == staffId
        );
    };

    const getAssignedStaff = () => {
        return draftStaffShifts.filter(
            (staffShift) =>
                staffShift.date === format(date, 'yyyy-MM-dd') &&
                staffShift.shiftId === selectedShift.id
        );
    };

    const isStaffAssigned = (staffId: number) => {
        return getAssignedStaff().some(
            (staffShift) => staffShift.staffId === staffId
        );
    };

    const calculateStaffNeeded = () => {
        const assigned = getAssignedStaff();
        const requirements = selectedShift?.requirements;

        return requirements?.map((req: any) => {
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

    // ========================================
    // EVENT HANDLERS
    // ========================================
    const assignStaff = (staffId: number) => {
        if (isStaffAlreadyScheduled(staffId)) {
            return;
        }

        if (isStaffAssigned(staffId)) {
            console.log('Assigning staff:', staffId);
            // Remove assignment if already assigned
            setDraftStaffShifts((prev) =>
                prev.filter(
                    (staffShift) =>
                        !(
                            staffShift.date === format(date, 'yyyy-MM-dd') &&
                            staffShift.shiftId === selectedShift.id &&
                            staffShift.staffId === staffId
                        )
                )
            );
        } else {
            // Add new assignment
            const newStaffShift = {
                date: format(date, 'yyyy-MM-dd'),
                note: '',
                shiftStatus: 'DRAFT',
                staffId,
                shiftId: selectedShift?.id,
            };
            setDraftStaffShifts((prev) => [...prev, newStaffShift]);
        }
    };

    const handleBulkAssign = () => {
        const { startDate, endDate, shiftId, staffIds, note } = bulkAssignData;

        if (staffIds.length === 0) {
            return;
        }

        // Generate dates between start and end
        const dateRange = eachDayOfInterval({ start: startDate, end: endDate });

        // Create new staff shifts
        const newStaffShifts = [];

        for (const staffId of staffIds) {
            for (const day of dateRange) {
                const formattedDate = format(day, 'yyyy-MM-dd');

                newStaffShifts.push({
                    date: formattedDate,
                    note,
                    shiftStatus: 'DRAFT',
                    staffId,
                    shiftId,
                });
            }
        }

        createDraftStaffShift.mutate(newStaffShifts);

        setBulkAssignDialogOpen(false);
        setBulkAssignData({
            startDate: new Date(),
            endDate: new Date(),
            shiftId: shifts[0].id,
            staffIds: [],
            note: '',
        });
    };

    return (
        <>
            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">
                            Assign Staff
                        </h1>
                        <p className="text-muted-foreground">
                            Assign staff to shifts and manage the scheduling for
                            your restaurant.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setBulkAssignDialogOpen(true)}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Bulk Assign
                        </Button>
                        <Button
                            onClick={() =>
                                createDraftStaffShift.mutate(draftStaffShifts)
                            }
                            disabled={
                                draftStaffShifts &&
                                draftStaffShifts?.length == 0
                            }
                        >
                            <Check className="h-4 w-4 mr-2" />
                            Save Draft
                        </Button>
                        <Button onClick={() => setIsPublishDialogOpen(true)}>
                            Publish Schedule
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-12">
                    {/* Left column - Date and Shift Selection */}
                    <ShiftSelection
                        user={user}
                        formatDate={formatDate}
                        date={date}
                        setDate={setDate}
                        selectedShift={selectedShift}
                        shifts={shifts}
                        setSelectedShift={setSelectedShift}
                        formatTime={formatTime}
                        calculateStaffNeeded={calculateStaffNeeded}
                        roles={roles}
                    />

                    {/* Right column - Staff Assignment */}
                    <StaffList
                        setFilterRole={setFilterRole}
                        roles={roles}
                        filteredStaff={filteredStaff}
                        isStaffAssigned={isStaffAssigned}
                        isStaffAlreadyScheduled={isStaffAlreadyScheduled}
                        assignStaff={assignStaff}
                    />
                </div>

                {/* Assigned Staff List */}
                <AssignList
                    formatDate={formatDate}
                    formatTime={formatTime}
                    selectedShift={selectedShift}
                    staffShifts={staffShifts}
                    date={date}
                    setDeleteStaffShift={setDeleteStaffShift}
                    setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                />
            </div>
            {/* Publish Dialog */}
            <PublishModal
                isPublishDialogOpen={isPublishDialogOpen}
                setIsPublishDialogOpen={setIsPublishDialogOpen}
                publishDateRange={publishDateRange}
                setPublishDateRange={setPublishDateRange}
                publicStaffShift={publicStaffShift}
                queryPublic={queryPublic}
                formatDate={formatDate}
            />

            {/* Delete Staff Shift Dialog */}
            <DeteleModal
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                deleteStaffShift={deleteStaffShift}
                deleStaffShift={deleStaffShift}
            />

            {/* Bulk Assign Dialog */}
            <BulkAssign
                bulkAssignDialogOpen={bulkAssignDialogOpen}
                setBulkAssignDialogOpen={setBulkAssignDialogOpen}
                formatDate={formatDate}
                bulkAssignData={bulkAssignData}
                setBulkAssignData={setBulkAssignData}
                shifts={shifts}
                employees={employees}
                handleBulkAssign={handleBulkAssign}
                formatTime={formatTime}
            />
        </>
    );
}

function DeteleModal({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteStaffShift,
    deleStaffShift,
}: any) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Staff Shift</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this staff shift? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {deleteStaffShift && (
                    <div className="py-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="font-medium font-semibold">
                                    {deleteStaffShift?.staff?.fullName} -{' '}
                                    {
                                        deleteStaffShift?.staff?.userRoles[0]
                                            .role.name
                                    }
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {deleteStaffShift?.date}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {deleteStaffShift?.shift?.startTime} -{' '}
                                    {deleteStaffShift?.shift?.endTime}
                                </p>
                            </div>
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
                        onClick={() =>
                            deleStaffShift.mutate(deleteStaffShift?.id)
                        }
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function PublishModal({
    isPublishDialogOpen,
    setIsPublishDialogOpen,
    publishDateRange,
    setPublishDateRange,
    publicStaffShift,
    queryPublic,
    formatDate,
}: any) {
    return (
        <Dialog
            open={isPublishDialogOpen}
            onOpenChange={setIsPublishDialogOpen}
        >
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Publish Schedule</DialogTitle>
                    <DialogDescription>
                        Publishing will make the schedule visible to all staff
                        members. Select the date range to publish.
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
                                        {formatDate(publishDateRange.startDate)}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={publishDateRange.startDate}
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
                                        {formatDate(publishDateRange.endDate)}
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
                    <Button
                        onClick={() => publicStaffShift.mutate(queryPublic)}
                    >
                        Publish
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AssignList({
    formatDate,
    formatTime,
    selectedShift,
    staffShifts,
    date,
    setDeleteStaffShift,
    setIsDeleteDialogOpen,
}: any) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Current Assignments</CardTitle>
                <CardDescription>
                    Staff assigned to {formatDate(date)},{' '}
                    {formatTime(selectedShift?.startTime)} -{' '}
                    {formatTime(selectedShift?.endTime)}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {staffShifts?.length > 0 ? (
                    <div className="space-y-3">
                        {staffShifts?.map((staffShift: any) => {
                            const roleColor =
                                staffShift.staff?.userRoles[0].role.hexColor;

                            return (
                                <div
                                    key={staffShift.id}
                                    className="flex items-center justify-between border rounded-md p-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: roleColor,
                                            }}
                                        />
                                        <div>
                                            <div className="font-medium">
                                                {staffShift.staff?.fullName}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {
                                                    staffShift.staff
                                                        ?.userRoles[0].role.name
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
                                            onClick={() => {
                                                setDeleteStaffShift(staffShift);
                                                setIsDeleteDialogOpen(true);
                                            }}
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
    );
}

function StaffList({
    setFilterRole,
    roles,
    filteredStaff,
    isStaffAssigned,
    isStaffAlreadyScheduled,
    assignStaff,
}: any) {
    return (
        <Card className="md:col-span-8">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle>Available Staff</CardTitle>
                    <Tabs
                        defaultValue="all"
                        onValueChange={(value) => setFilterRole(value)}
                    >
                        <TabsList>
                            <TabsTrigger value="all">All</TabsTrigger>
                            {roles?.map((role: any) => (
                                <TabsTrigger key={role.name} value={role.name}>
                                    {role.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </Tabs>
                </div>
                <CardDescription>
                    Click on a staff member to assign them to the selected shift
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredStaff.map((staff: any) => {
                        const isAssigned = isStaffAssigned(staff.id);
                        const isAlreadyScheduled = isStaffAlreadyScheduled(
                            staff.id
                        );
                        const roleColor = staff.userRoles[0].role.hexColor;
                        const isDisabled = isAlreadyScheduled && !isAssigned;

                        return (
                            <div
                                key={staff.id}
                                className={cn(
                                    'border rounded-md p-3 transition-colors',
                                    isDisabled
                                        ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
                                        : isAssigned
                                          ? 'bg-primary/10 border-primary/30 cursor-pointer'
                                          : 'hover:bg-gray-50 cursor-pointer'
                                )}
                                onClick={() =>
                                    !isDisabled && assignStaff(staff.id)
                                }
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{
                                                backgroundColor: roleColor,
                                            }}
                                        />
                                        <span
                                            className={cn(
                                                'font-medium',
                                                isDisabled && 'text-gray-500'
                                            )}
                                        >
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
                                    {isAlreadyScheduled && !isAssigned && (
                                        <Badge
                                            variant="outline"
                                            className="bg-gray-100 text-gray-500 border-gray-300"
                                        >
                                            Already Scheduled
                                        </Badge>
                                    )}
                                </div>
                                <div
                                    className={cn(
                                        'text-sm text-muted-foreground mt-1',
                                        isDisabled && 'text-gray-400'
                                    )}
                                >
                                    {staff.userRoles[0].role.name}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

function ShiftSelection({
    user,
    formatDate,
    date,
    setDate,
    selectedShift,
    shifts,
    setSelectedShift,
    formatTime,
    calculateStaffNeeded,
    roles,
}: any) {
    return (
        <Card className="md:col-span-4">
            <CardHeader>
                <CardTitle>Select Date & Shift</CardTitle>
                <CardDescription>
                    Choose a date and shift to assign staff
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Branch</label>
                    <Select value={user?.branch.id}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select branch" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem
                                key={user?.branch.id}
                                value={user?.branch.id}
                            >
                                {user?.branch.name}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Date</label>
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
                                onSelect={(date) => date && setDate(date)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium">Shift</label>
                    <Select
                        value={selectedShift?.id}
                        onValueChange={(value) => {
                            const shift = shifts.find((s) => s?.id == value);
                            if (shift) setSelectedShift(shift);
                        }}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                            {shifts.map((shift: any) => (
                                <SelectItem key={shift.id} value={shift?.id}>
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
                        {calculateStaffNeeded()?.map((req: any, index: any) => {
                            const role = roles?.find(
                                (r: any) => r.name === req.role
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
                                                req.remaining > 0
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
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function BulkAssign({
    bulkAssignDialogOpen,
    setBulkAssignDialogOpen,
    formatDate,
    bulkAssignData,
    setBulkAssignData,
    shifts,
    employees,
    handleBulkAssign,
    formatTime,
}: any) {
    return (
        <Dialog
            open={bulkAssignDialogOpen}
            onOpenChange={setBulkAssignDialogOpen}
        >
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Assign Staff</DialogTitle>
                    <DialogDescription>
                        Assign multiple staff members to shifts across a date
                        range
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
                                            bulkAssignData?.startDate ||
                                                new Date()
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={bulkAssignData?.startDate}
                                        onSelect={(date) =>
                                            date &&
                                            setBulkAssignData((prev: any) => ({
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
                                            bulkAssignData?.endDate ||
                                                new Date()
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={bulkAssignData?.endDate}
                                        onSelect={(date) =>
                                            date &&
                                            setBulkAssignData((prev: any) => ({
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
                            value={bulkAssignData?.shiftId}
                            onValueChange={(value) =>
                                setBulkAssignData((prev: any) => ({
                                    ...prev,
                                    shiftId: Number(value),
                                }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                            <SelectContent>
                                {shifts.map((shift: any) => (
                                    <SelectItem
                                        key={shift.id}
                                        value={shift?.id}
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
                                {employees?.map((staff: any) => {
                                    const isSelected =
                                        bulkAssignData?.staffIds?.includes(
                                            staff?.id
                                        );
                                    return (
                                        <div
                                            key={staff?.id}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                                            onClick={() => {
                                                setBulkAssignData(
                                                    (prev: any) => ({
                                                        ...prev,
                                                        staffIds: isSelected
                                                            ? prev?.staffIds.filter(
                                                                  (id: any) =>
                                                                      id !==
                                                                      staff.id
                                                              )
                                                            : [
                                                                  ...prev?.staffIds,
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
                                                            staff.userRoles[0]
                                                                .role.hexColor,
                                                    }}
                                                />
                                                <span>{staff.fullName}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    (
                                                    {
                                                        staff.userRoles[0].role
                                                            .name
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
                                setBulkAssignData((prev: any) => ({
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
                    <Button onClick={() => handleBulkAssign()}>
                        Assign Staff
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
