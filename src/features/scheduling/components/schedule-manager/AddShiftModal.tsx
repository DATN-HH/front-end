import { useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import {
    Clock,
    Users,
    MapPin,
    AlertTriangle,
    CheckCircle,
    UserPlus,
    Calendar,
} from 'lucide-react';
import { useContext, useMemo } from 'react';

import { useCreateStaffShift } from '@/api/v1/staff-shifts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { isStatusCountedInRequirements } from '@/config/status-colors';
import { ScheduleContext } from '@/features/scheduling/contexts/context-schedule';
import { useCustomToast } from '@/lib/show-toast';

const AddShiftModal = () => {
    const { success: successToast, error: errorToast } = useCustomToast();
    const queryClient = useQueryClient();
    const {
        isAddShiftModalOpen,
        setIsAddShiftModalOpen,
        selectedDate,
        selectedStaffName,
        scheduledShifts,
        isLoadingScheduledShifts,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
        roles,
        isLoadingRoles,
    } = useContext(ScheduleContext);

    const createStaffShiftMutation = useCreateStaffShift();

    // Get staff role
    const staffRole = useMemo(() => {
        if (
            !staffShiftsGrouped ||
            !selectedStaffName ||
            isLoadingStaffShiftsGrouped
        )
            return null;

        for (const roleName of Object.keys(staffShiftsGrouped.data)) {
            const roleData = (staffShiftsGrouped.data as any)[roleName];
            if (roleData[selectedStaffName]) {
                return roleName;
            }
        }
        return null;
    }, [staffShiftsGrouped, selectedStaffName, isLoadingStaffShiftsGrouped]);

    // Get staff ID from staffShiftsGrouped using new structure
    const staffId = useMemo(() => {
        if (
            !staffShiftsGrouped ||
            !selectedStaffName ||
            isLoadingStaffShiftsGrouped
        )
            return null;

        for (const roleName of Object.keys(staffShiftsGrouped.data)) {
            const roleData = staffShiftsGrouped.data[roleName];
            if (roleData[selectedStaffName]) {
                // Get staffId directly from StaffShiftData
                return roleData[selectedStaffName].staffId;
            }
        }
        return null;
    }, [staffShiftsGrouped, selectedStaffName, isLoadingStaffShiftsGrouped]);

    // Get open shifts for selected date that match staff role
    const availableOpenShifts = useMemo(() => {
        if (!scheduledShifts || !staffRole || isLoadingScheduledShifts)
            return [];

        const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');

        return scheduledShifts.filter((shift: any) => {
            // Must be on selected date and be an open shift
            const isOnDate = shift.date === dateStr;
            const isOpenShift = !shift.staffId || shift.staffId === null;

            // Check if shift has requirement for staff role (try both field names)
            const hasRoleRequirement = shift.requirements?.some(
                (req: any) =>
                    req.roleName === staffRole || req.role === staffRole
            );

            return isOnDate && isOpenShift && hasRoleRequirement;
        });
    }, [scheduledShifts, selectedDate, staffRole, isLoadingScheduledShifts]);

    // Get existing shifts for staff on selected date using new structure
    const existingStaffShifts = useMemo(() => {
        if (
            !staffShiftsGrouped ||
            !selectedStaffName ||
            isLoadingStaffShiftsGrouped
        )
            return [];

        const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
        const shifts: any[] = [];

        Object.keys(staffShiftsGrouped.data).forEach((roleName) => {
            const roleData = staffShiftsGrouped.data[roleName];
            if (
                roleData[selectedStaffName] &&
                roleData[selectedStaffName].shifts[dateStr]
            ) {
                shifts.push(...roleData[selectedStaffName].shifts[dateStr]);
            }
        });

        return shifts;
    }, [
        staffShiftsGrouped,
        selectedStaffName,
        selectedDate,
        isLoadingStaffShiftsGrouped,
    ]);

    // Check time conflict
    const checkTimeConflict = (newShift: any) => {
        if (!newShift.startTime || !newShift.endTime) return false;

        const newStart = dayjs(`2000-01-01 ${newShift.startTime}`);
        const newEnd = dayjs(`2000-01-01 ${newShift.endTime}`);

        return existingStaffShifts.some((existingShift: any) => {
            if (!existingShift.startTime || !existingShift.endTime)
                return false;

            const existingStart = dayjs(
                `2000-01-01 ${existingShift.startTime}`
            );
            const existingEnd = dayjs(`2000-01-01 ${existingShift.endTime}`);

            // Check if times overlap
            return (
                newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)
            );
        });
    };

    // Get registered count and remaining spots for a shift
    const getShiftInfo = (shift: any) => {
        if (!staffShiftsGrouped || !shift.requirements)
            return { registered: 0, total: 0, remaining: 0 };

        const dateStr = dayjs(selectedDate).format('YYYY-MM-DD');
        const roleRequirement = shift.requirements.find(
            (req: any) => req.roleName === staffRole || req.role === staffRole
        );

        if (!roleRequirement) return { registered: 0, total: 0, remaining: 0 };

        let registered = 0;
        const roleData = staffRole ? staffShiftsGrouped.data[staffRole] : null;

        if (roleData) {
            Object.keys(roleData).forEach((staffName) => {
                const staffShifts = roleData[staffName].shifts[dateStr] || [];
                const hasShift = staffShifts.some(
                    (s: any) =>
                        s.startTime === shift.startTime &&
                        s.endTime === shift.endTime &&
                        isStatusCountedInRequirements(s.shiftStatus)
                );
                if (hasShift) registered++;
            });
        }

        const total = roleRequirement.quantity;
        const remaining = Math.max(0, total - registered);

        return { registered, total, remaining };
    };

    const handleClose = () => {
        setIsAddShiftModalOpen(false);
    };

    const handleRegisterShift = async (shift: any) => {
        if (!staffId) {
            errorToast(
                'Staff ID not found. Please ensure the employee has existing shifts to determine their ID.',
                'Staff ID not found. Please ensure the employee has existing shifts to determine their ID.'
            );
            return;
        }

        if (!shift?.id) {
            errorToast('Invalid shift selected', 'Invalid shift selected');
            return;
        }

        try {
            const result = await createStaffShiftMutation.mutateAsync({
                staffId,
                scheduledShiftId: shift.id,
                shiftStatus: 'DRAFT',
                // note: `Registered via AddShiftModal for ${selectedStaffName}`
            });

            // Invalidate and refetch queries to update the UI
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ['staff-shifts-grouped'],
                }),
                queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
                queryClient.invalidateQueries({
                    queryKey: ['scheduled-shifts'],
                }),
            ]);

            successToast(
                `Successfully registered ${selectedStaffName} for ${shift.shiftName}`,
                `Successfully registered ${selectedStaffName} for ${shift.shiftName}`
            );
            // handleClose()
        } catch (error: any) {
            console.error('Error registering for shift:', error);
            errorToast(
                'Failed to register for shift',
                error?.response?.data?.message ||
                    error?.message ||
                    'Failed to register for shift'
            );
        }
    };

    const isLoading =
        isLoadingScheduledShifts ||
        isLoadingStaffShiftsGrouped ||
        isLoadingRoles;

    if (isLoading) {
        return (
            <Dialog open={isAddShiftModalOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-6">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">
                                    Register for Shift
                                </h1>
                                <p className="text-base text-muted-foreground mt-1">
                                    Loading available shifts...
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-12">
                        <div className="flex items-center justify-center">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                <span className="text-muted-foreground">
                                    Loading shift information...
                                </span>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isAddShiftModalOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <UserPlus className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Register for Shift
                            </h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Register {selectedStaffName} for available
                                shifts on{' '}
                                {dayjs(selectedDate).format('DD/MM/YYYY')}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="py-6 space-y-6">
                    {/* Staff Info */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <UserPlus className="h-4 w-4" />
                                </div>
                                Staff Information
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Employee: {selectedStaffName} • Role:{' '}
                                {staffRole} • Date:{' '}
                                {dayjs(selectedDate).format('dddd, DD/MM/YYYY')}
                            </CardDescription>
                        </CardHeader>
                    </Card>

                    {availableOpenShifts.length === 0 ? (
                        <Card className="border-2 border-dashed border-muted">
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center text-muted-foreground">
                                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                        <Calendar className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">
                                        No available shifts
                                    </h3>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        No open shifts available for role{' '}
                                        {staffRole} on{' '}
                                        {dayjs(selectedDate).format(
                                            'DD/MM/YYYY'
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Total open shifts for this date:{' '}
                                        {scheduledShifts?.filter(
                                            (s: any) =>
                                                s.date ===
                                                    dayjs(selectedDate).format(
                                                        'YYYY-MM-DD'
                                                    ) &&
                                                (!s.staffId ||
                                                    s.staffId === null)
                                        ).length || 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            <Card className="border-2 border-secondary/50 bg-secondary/10">
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                            <Clock className="h-4 w-4" />
                                        </div>
                                        Available Shifts
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground">
                                        {availableOpenShifts.length} open shift
                                        {availableOpenShifts.length !== 1
                                            ? 's'
                                            : ''}{' '}
                                        available for your role
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            <div className="grid gap-4">
                                {availableOpenShifts.map(
                                    (shift: any, index: number) => {
                                        const hasConflict =
                                            checkTimeConflict(shift);
                                        const shiftInfo = getShiftInfo(shift);
                                        const canRegister =
                                            shiftInfo.remaining > 0 &&
                                            !hasConflict;
                                        const isRegistering =
                                            createStaffShiftMutation.isPending;

                                        return (
                                            <Card
                                                key={shift.id || index}
                                                className={`border-2 transition-colors ${
                                                    hasConflict
                                                        ? 'border-destructive/50 bg-destructive/10'
                                                        : canRegister
                                                          ? 'border-accent/50 bg-accent/10 hover:border-accent'
                                                          : 'border-muted bg-muted/30'
                                                }`}
                                            >
                                                <CardHeader className="pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                                            <div
                                                                className={`flex items-center justify-center w-8 h-8 rounded-lg ${
                                                                    hasConflict
                                                                        ? 'bg-destructive text-destructive-foreground'
                                                                        : canRegister
                                                                          ? 'bg-accent text-accent-foreground'
                                                                          : 'bg-muted-foreground text-background'
                                                                }`}
                                                            >
                                                                {hasConflict ? (
                                                                    <AlertTriangle className="h-4 w-4" />
                                                                ) : canRegister ? (
                                                                    <CheckCircle className="h-4 w-4" />
                                                                ) : (
                                                                    <Clock className="h-4 w-4" />
                                                                )}
                                                            </div>
                                                            {shift.shiftName}
                                                        </CardTitle>
                                                        <div className="flex gap-2">
                                                            {hasConflict && (
                                                                <Badge
                                                                    variant="destructive"
                                                                    className="gap-1"
                                                                >
                                                                    <AlertTriangle className="w-3 h-3" />
                                                                    Time
                                                                    Conflict
                                                                </Badge>
                                                            )}
                                                            {canRegister && (
                                                                <Badge className="gap-1 bg-accent text-accent-foreground">
                                                                    <CheckCircle className="w-3 h-3" />
                                                                    Available
                                                                </Badge>
                                                            )}
                                                            {!canRegister &&
                                                                !hasConflict && (
                                                                    <Badge variant="secondary">
                                                                        Full
                                                                    </Badge>
                                                                )}
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4 rounded-lg">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                                            <span>
                                                                {shift.startTime &&
                                                                shift.endTime
                                                                    ? `${shift.startTime} - ${shift.endTime}`
                                                                    : 'Time not set'}
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            <span>
                                                                {
                                                                    shift.branchName
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                                        <Users className="w-4 h-4 text-muted-foreground" />
                                                        <span>
                                                            Positions remaining:{' '}
                                                            {
                                                                shiftInfo.remaining
                                                            }
                                                            /{shiftInfo.total}(
                                                            {
                                                                shiftInfo.registered
                                                            }{' '}
                                                            registered)
                                                        </span>
                                                    </div>

                                                    {hasConflict && (
                                                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                                                            <div className="flex items-center gap-2 text-sm text-destructive">
                                                                <AlertTriangle className="w-4 h-4" />
                                                                Time conflict
                                                                with another
                                                                shift on the
                                                                same day
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            onClick={() =>
                                                                handleRegisterShift(
                                                                    shift
                                                                )
                                                            }
                                                            disabled={
                                                                !canRegister ||
                                                                isRegistering
                                                            }
                                                            size="sm"
                                                            className="font-medium"
                                                        >
                                                            {isRegistering
                                                                ? 'Registering...'
                                                                : hasConflict
                                                                  ? 'Cannot Register'
                                                                  : canRegister
                                                                    ? 'Register for Shift'
                                                                    : 'Position Full'}
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}

                    {existingStaffShifts.length > 0 && (
                        <Card className="border-2 border-muted bg-muted/30">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted-foreground text-background">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    Already Registered Shifts
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Current shifts for{' '}
                                    {dayjs(selectedDate).format('DD/MM/YYYY')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3 bg-card rounded-lg">
                                {existingStaffShifts.map(
                                    (shift: any, index: number) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 rounded bg-primary text-primary-foreground">
                                                <Clock className="w-3 h-3" />
                                            </div>
                                            <span className="text-sm font-medium text-foreground">
                                                {shift.shiftName}:{' '}
                                                {shift.startTime} -{' '}
                                                {shift.endTime}
                                            </span>
                                        </div>
                                    )
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="px-8 h-11"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddShiftModal;
