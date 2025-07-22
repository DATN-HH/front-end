'use client';

import { format, parseISO, addDays, startOfWeek, endOfWeek } from 'date-fns';
import {
    Calendar,
    Clock,
    Users,
    AlertTriangle,
    CheckCircle,
    Plus,
    Loader2,
    CalendarDays,
    UserCheck,
    ShieldCheck,
    Info,
} from 'lucide-react';
import { useState } from 'react';

import { useBranchScheduleConfig } from '@/api/v1/branch-schedule-config';
import {
    useAvailableShifts,
    useRegisterForShift,
    ShiftRegistrationRequest,
} from '@/api/v1/employee-portal';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProtectedRoute } from '@/components/protected-component';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/auth-context';
import { employeeRole } from '@/lib/rbac';
import { useCustomToast } from '@/lib/show-toast';

export function ShiftRegistration() {
    const { user } = useAuth();
    const { success, error } = useCustomToast();
    const branchId = user?.branch?.id;

    const {
        data: availableShifts = [],
        isLoading: isShiftsLoading,
        refetch,
    } = useAvailableShifts();
    const { data: config, isLoading: isConfigLoading } =
        useBranchScheduleConfig(branchId!);
    const registerMutation = useRegisterForShift();

    const [selectedShift, setSelectedShift] = useState<any>(null);
    const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
    const [registrationNote, setRegistrationNote] = useState('');

    // Get next week dates
    const today = new Date();
    const nextWeek = addDays(today, 7);
    const nextWeekStart = startOfWeek(nextWeek, { weekStartsOn: 1 });
    const nextWeekEnd = endOfWeek(nextWeek, { weekStartsOn: 1 });

    // Group shifts by date
    const shiftsByDate = availableShifts.reduce(
        (acc, shift) => {
            const date = shift.date;
            if (!acc[date]) {
                acc[date] = [];
            }
            acc[date].push(shift);
            return acc;
        },
        {} as Record<string, typeof availableShifts>
    );

    // Get days of the week
    const weekDays = [];
    let currentDate = nextWeekStart;
    while (currentDate <= nextWeekEnd) {
        weekDays.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, 1);
    }

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    const getDayName = (dateStr: string) => {
        return format(parseISO(dateStr), 'EEEE');
    };

    const getFormattedDate = (dateStr: string) => {
        return format(parseISO(dateStr), 'MMM dd');
    };

    const handleRegisterClick = (shift: any) => {
        setSelectedShift(shift);
        setRegistrationNote('');
        setIsRegisterDialogOpen(true);
    };

    const handleRegisterSubmit = async () => {
        if (!selectedShift) return;

        const registrationData: ShiftRegistrationRequest = {
            scheduledShiftId: selectedShift.scheduledShiftId,
            note: registrationNote.trim() || undefined,
        };

        try {
            await registerMutation.mutateAsync(registrationData);
            success(
                'Registration Successful',
                'You have successfully registered for this shift. Your registration is pending manager approval.'
            );
            setIsRegisterDialogOpen(false);
            setSelectedShift(null);
            setRegistrationNote('');
            refetch();
        } catch (err: any) {
            error(
                'Registration Failed',
                err.response?.data?.message || 'Failed to register for shift'
            );
        }
    };

    const canRegisterToday = () => {
        if (!config) return false;

        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to Monday = 1 format

        return (
            adjustedDayOfWeek >= config.registrationStartDayOfWeek &&
            adjustedDayOfWeek <= config.registrationEndDayOfWeek
        );
    };

    const getRegistrationStatus = () => {
        if (!config)
            return { canRegister: false, message: 'Loading configuration...' };

        if (!config.allowSelfShiftRegistration) {
            return {
                canRegister: false,
                message: 'Self shift registration is disabled for your branch.',
            };
        }

        if (!canRegisterToday()) {
            const startDay = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ][
                config.registrationStartDayOfWeek === 7
                    ? 0
                    : config.registrationStartDayOfWeek
            ];
            const endDay = [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
            ][
                config.registrationEndDayOfWeek === 7
                    ? 0
                    : config.registrationEndDayOfWeek
            ];
            return {
                canRegister: false,
                message: `Registration is only allowed from ${startDay} to ${endDay}.`,
            };
        }

        return {
            canRegister: true,
            message: 'You can register for shifts this week!',
        };
    };

    const registrationStatus = getRegistrationStatus();

    if (isConfigLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
                <span className="text-muted-foreground">
                    Loading configuration...
                </span>
            </div>
        );
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageTitle icon={CalendarDays} title="Shift Registration" />

            {/* Registration Status */}
            <Alert
                className={
                    registrationStatus.canRegister
                        ? 'border-green-200 bg-green-50'
                        : 'border-yellow-200 bg-yellow-50'
                }
            >
                <div className="flex items-start gap-2">
                    {registrationStatus.canRegister ? (
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    )}
                    <AlertDescription
                        className={`${registrationStatus.canRegister ? 'text-green-800' : 'text-yellow-800'} text-sm`}
                    >
                        {registrationStatus.message}
                    </AlertDescription>
                </div>
            </Alert>

            {/* Configuration Info */}
            {config && (
                <Card>
                    <CardHeader className="p-4 lg:p-6">
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <Info className="h-4 w-4 lg:h-5 lg:w-5 text-blue-500" />
                            Registration Rules
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 p-4 lg:p-6 pt-0">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-base lg:text-lg font-semibold text-blue-700">
                                {config.registrationDaysInAdvance} days
                            </div>
                            <div className="text-xs lg:text-sm text-blue-600">
                                In advance
                            </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-base lg:text-lg font-semibold text-green-700">
                                {config.maxShiftsPerWeek}
                            </div>
                            <div className="text-xs lg:text-sm text-green-600">
                                Max shifts per week
                            </div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                            <div className="text-base lg:text-lg font-semibold text-purple-700">
                                {config.maxShiftsPerDay}
                            </div>
                            <div className="text-xs lg:text-sm text-purple-600">
                                Max shifts per day
                            </div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-base lg:text-lg font-semibold text-orange-700">
                                {config.minRestHoursBetweenShifts}h
                            </div>
                            <div className="text-xs lg:text-sm text-orange-600">
                                Min rest time
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Available Shifts */}
            <div className="grid gap-4 lg:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h2 className="text-xl lg:text-2xl font-bold">
                        Available Shifts - Next Week
                    </h2>
                    <div className="text-sm text-muted-foreground">
                        {format(nextWeekStart, 'MMM dd')} -{' '}
                        {format(nextWeekEnd, 'MMM dd, yyyy')}
                    </div>
                </div>

                {isShiftsLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin mr-3 text-primary" />
                        <span className="text-muted-foreground">
                            Loading available shifts...
                        </span>
                    </div>
                ) : (
                    <div className="space-y-4 lg:space-y-6">
                        {weekDays.map((date) => {
                            const shiftsForDay = shiftsByDate[date] || [];
                            return (
                                <Card key={date}>
                                    <CardHeader className="pb-4 p-4 lg:p-6">
                                        <CardTitle className="flex items-center gap-3">
                                            <Calendar className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                                            <div>
                                                <div className="text-base lg:text-lg font-semibold">
                                                    {getDayName(date)}
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    {getFormattedDate(date)}
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 lg:p-6 pt-0">
                                        {shiftsForDay.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                No shifts available for this day
                                            </div>
                                        ) : (
                                            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                                                {shiftsForDay.map((shift) => {
                                                    return (
                                                        <Card
                                                            key={
                                                                shift.scheduledShiftId
                                                            }
                                                            className="border-l-4 border-l-primary"
                                                        >
                                                            <CardContent className="p-4">
                                                                <div className="space-y-3">
                                                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                                        <h4 className="font-semibold text-foreground">
                                                                            {
                                                                                shift.shiftName
                                                                            }
                                                                        </h4>
                                                                        <Badge
                                                                            variant={
                                                                                shift.canRegister
                                                                                    ? 'default'
                                                                                    : 'secondary'
                                                                            }
                                                                            className="self-start sm:self-center"
                                                                        >
                                                                            {shift.canRegister
                                                                                ? 'Available'
                                                                                : 'Unavailable'}
                                                                        </Badge>
                                                                    </div>

                                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                                        {formatTime(
                                                                            shift.startTime
                                                                        )}{' '}
                                                                        -{' '}
                                                                        {formatTime(
                                                                            shift.endTime
                                                                        )}
                                                                    </div>

                                                                    <div className="flex items-center justify-between p-2 bg-muted/30 rounded">
                                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                                            <Users className="h-4 w-4 text-blue-600 flex-shrink-0" />
                                                                            <span className="hidden sm:inline">
                                                                                Staff
                                                                                Count
                                                                            </span>
                                                                            <span className="sm:hidden">
                                                                                Count
                                                                            </span>
                                                                        </div>
                                                                        <div className="text-sm font-semibold">
                                                                            <span className="text-green-600">
                                                                                {
                                                                                    shift.registeredCount
                                                                                }
                                                                            </span>
                                                                            <span className="text-muted-foreground">
                                                                                /
                                                                            </span>
                                                                            <span className="text-blue-600">
                                                                                {
                                                                                    shift.maxStaff
                                                                                }
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {shift.requirements &&
                                                                        shift
                                                                            .requirements
                                                                            .length >
                                                                            0 && (
                                                                            <div className="space-y-1">
                                                                                <div className="text-xs font-medium text-muted-foreground">
                                                                                    Required
                                                                                    Roles:
                                                                                </div>
                                                                                <div className="flex flex-wrap gap-1">
                                                                                    {shift.requirements.map(
                                                                                        (
                                                                                            req,
                                                                                            idx
                                                                                        ) => (
                                                                                            <Badge
                                                                                                key={
                                                                                                    idx
                                                                                                }
                                                                                                variant="outline"
                                                                                                className="text-xs"
                                                                                            >
                                                                                                {
                                                                                                    req.roleName
                                                                                                }{' '}
                                                                                                (
                                                                                                {
                                                                                                    req.count
                                                                                                }
                                                                                                )
                                                                                            </Badge>
                                                                                        )
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                    {!shift.canRegister &&
                                                                        shift.conflictReason && (
                                                                            <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
                                                                                {
                                                                                    shift.conflictReason
                                                                                }
                                                                            </div>
                                                                        )}

                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleRegisterClick(
                                                                                shift
                                                                            )
                                                                        }
                                                                        disabled={
                                                                            !shift.canRegister ||
                                                                            !registrationStatus.canRegister
                                                                        }
                                                                        className="w-full"
                                                                    >
                                                                        <Plus className="h-4 w-4 mr-2" />
                                                                        Register
                                                                    </Button>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Registration Dialog */}
            <Dialog
                open={isRegisterDialogOpen}
                onOpenChange={setIsRegisterDialogOpen}
            >
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto m-4">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <UserCheck className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
                            Register for Shift
                        </DialogTitle>
                        <DialogDescription className="text-sm">
                            Confirm your registration for this shift. Your
                            registration will be pending manager approval.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedShift && (
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                                <div className="font-medium break-words">
                                    {selectedShift.shiftName}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Calendar className="h-4 w-4 flex-shrink-0" />
                                    <span className="break-words">
                                        {format(
                                            parseISO(selectedShift.date),
                                            'EEEE, MMM dd, yyyy'
                                        )}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Clock className="h-4 w-4 flex-shrink-0" />
                                    {formatTime(selectedShift.startTime)} -{' '}
                                    {formatTime(selectedShift.endTime)}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="note"
                                    className="text-sm font-medium"
                                >
                                    Optional Note
                                </Label>
                                <Textarea
                                    id="note"
                                    value={registrationNote}
                                    onChange={(e) =>
                                        setRegistrationNote(e.target.value)
                                    }
                                    placeholder="Add any additional information or availability notes..."
                                    rows={3}
                                    className="text-sm"
                                />
                            </div>

                            <Alert>
                                <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                                <AlertDescription className="text-sm">
                                    Your registration will create a DRAFT
                                    assignment that requires manager approval
                                    before being confirmed.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsRegisterDialogOpen(false)}
                            disabled={registerMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRegisterSubmit}
                            disabled={registerMutation.isPending}
                            className="w-full sm:w-auto"
                        >
                            {registerMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    <span className="hidden sm:inline">
                                        Registering...
                                    </span>
                                    <span className="sm:hidden">
                                        Register...
                                    </span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    <span className="hidden sm:inline">
                                        Confirm Registration
                                    </span>
                                    <span className="sm:hidden">Confirm</span>
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function ShiftRegistrationPage() {
    return (
        <ProtectedRoute requiredRoles={employeeRole}>
            <ShiftRegistration />
        </ProtectedRoute>
    );
}
