'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import {
    Clock,
    User,
    FileText,
    CalendarDays,
    AlertTriangle,
    CheckCircle,
    Plus,
    Activity,
    XCircle,
    ClipboardList,
    ExternalLink,
    Zap,
    Calendar
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import {
    useWorkingHours,
} from '@/api/v1/employee-portal';
import {
    useMyLeaveBalance,
    useMyLeaveRequests,
    LeaveStatus,
    getLeaveTypeLabel,
    getLeaveStatusLabel,
    getStatusColor
} from '@/api/v1/leave-management';
import { useMyPendingShifts } from '@/api/v1/publish-shifts';
import { useMyShiftLeaveRequests, useMyShiftLeaveBalance } from '@/api/v1/shift-leave-management';
import { PendingShiftsModal } from '@/features/employee-portal/components/PendingShiftsModal';
import { EmployeeLeaveManagement } from '@/features/employee-portal/components/EmployeeLeaveManagement';
import { NotificationsPanel } from '@/features/employee-portal/components/NotificationsPanel';
import { WeeklyScheduleCalendar } from '@/features/employee-portal/components/WeeklyScheduleCalendar';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ProtectedRoute } from '@/components/protected-component';
import { employeeRole } from '@/lib/rbac';

export function EmployeePortal() {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();
    const [isPendingShiftsModalOpen, setIsPendingShiftsModalOpen] = useState(false);
    const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);

    // API calls
    const { data: workingHours30, isLoading: isHours30Loading } = useWorkingHours(30);
    const { data: workingHours7, isLoading: isHours7Loading } = useWorkingHours(7);
    const { data: leaveBalance, isLoading: isLeaveBalanceLoading } = useMyLeaveBalance();
    const { data: leaveRequests = [], isLoading: isLeaveRequestsLoading } = useMyLeaveRequests();
    const { data: pendingShifts = [], isLoading: isPendingShiftsLoading } = useMyPendingShifts();

    // Shift leave API calls
    const { data: shiftLeaveRequests, isLoading: isShiftLeaveRequestsLoading } = useMyShiftLeaveRequests(currentYear);
    const { data: shiftLeaveBalance, isLoading: isShiftLeaveBalanceLoading } = useMyShiftLeaveBalance(currentYear);

    // Calculate stats
    const urgentPendingShifts = pendingShifts.filter(shift => {
        const deadlineDate = parseISO(shift.deadline);
        const now = new Date();
        const hoursLeft = differenceInHours(deadlineDate, now);
        return hoursLeft < 24 && hoursLeft > 0;
    });

    const leaveBalancePercentage = leaveBalance ? (leaveBalance.usedDays / leaveBalance.totalAllocatedDays) * 100 : 0;
    const shiftLeaveBalancePercentage = shiftLeaveBalance ? (shiftLeaveBalance.usedShifts / shiftLeaveBalance.totalShifts) * 100 : 0;

    const getStatusIcon = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return <CheckCircle className="h-4 w-4 text-green-600" />;
            case LeaveStatus.PENDING: return <Clock className="h-4 w-4 text-yellow-600" />;
            case LeaveStatus.REJECTED: return <XCircle className="h-4 w-4 text-red-600" />;
            default: return null;
        }
    };

    const getShiftLeaveStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'PENDING': return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'REJECTED': return <XCircle className="h-4 w-4 text-red-600" />;
            default: return null;
        }
    };

    const recentShiftLeaveRequests = shiftLeaveRequests?.slice(0, 3) || [];
    const pendingShiftLeaveRequests = shiftLeaveRequests?.filter(req => req.requestStatus === 'PENDING') || [];

    // Format time helper
    const formatTime = (time: any) => {
        if (typeof time === 'string') return time;
        if (time && typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
            return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
        }
        return time?.toString() || '';
    };

    return (
        <div className="space-y-6">
            <PageTitle
                icon={User}
                title="Employee Portal"
                left={
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsPendingShiftsModalOpen(true)}
                            className="gap-2"
                            disabled={pendingShifts.length === 0}
                        >
                            <Clock className="h-4 w-4" />
                            Pending Shifts {pendingShifts.length > 0 && `(${pendingShifts.length})`}
                        </Button>
                        <Link href="/app/employee-portal/shift-leave">
                            <Button variant="outline" className="gap-2">
                                <ClipboardList className="h-4 w-4" />
                                Shift Leave
                            </Button>
                        </Link>
                    </div>
                }
            />
            <p className="text-muted-foreground -mt-4">
                Welcome back, {user?.fullName}! Here's your work overview and quick actions.
            </p>

            {/* Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Urgent Pending Shifts Alert */}
                {urgentPendingShifts.length > 0 && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">
                                    {urgentPendingShifts.length} urgent shift response{urgentPendingShifts.length !== 1 ? 's' : ''} needed (deadline &lt; 24h)
                                </span>
                                <Button size="sm" onClick={() => setIsPendingShiftsModalOpen(true)}>
                                    Review Now
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Low Leave Balance Alert */}
                {leaveBalance && leaveBalance.remainingDays <= 2 && (
                    <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-orange-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">
                                    Low leave balance: {leaveBalance.remainingDays} day{leaveBalance.remainingDays !== 1 ? 's' : ''} remaining
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Low Shift Leave Balance Alert */}
                {shiftLeaveBalance && shiftLeaveBalance.availableShifts <= 5 && (
                    <Card className="border-l-4 border-l-red-500 bg-red-50">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-800">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">
                                    Low shift leave balance: {shiftLeaveBalance.availableShifts} shift{shiftLeaveBalance.availableShifts !== 1 ? 's' : ''} remaining
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Working Hours (7 days) */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isHours7Loading ? '...' : workingHours7?.totalHours || 0}h</p>
                                <p className="text-sm text-muted-foreground">Last 7 Days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Working Hours (30 days) */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-600">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{isHours30Loading ? '...' : workingHours30?.totalHours || 0}h</p>
                                <p className="text-sm text-muted-foreground">Last 30 Days</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Shifts */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600">
                                <Clock className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{pendingShifts.length}</p>
                                <p className="text-sm text-muted-foreground">Pending Shifts</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Leave Balance */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
                                <ClipboardList className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{shiftLeaveBalance?.availableShifts || 0}</p>
                                <p className="text-sm text-muted-foreground">Shift Leave Left</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Schedule Calendar */}
            <WeeklyScheduleCalendar />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Leave Management */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Leave Balance Overview */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CalendarDays className="h-5 w-5" />
                                Leave Balance {leaveBalance?.year || new Date().getFullYear()}
                            </CardTitle>
                            <CardDescription>
                                Your annual leave allocation and usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLeaveBalanceLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-8 bg-muted rounded"></div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-16 bg-muted rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : leaveBalance ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Used: {leaveBalance.usedDays} days</span>
                                            <span>Remaining: {leaveBalance.remainingDays} days</span>
                                        </div>
                                        <Progress value={leaveBalancePercentage} className="h-3" />
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-blue-600">{leaveBalance.annualLeaveDays}</p>
                                            <p className="text-xs text-muted-foreground">Annual</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-green-600">{leaveBalance.carriedOverDays}</p>
                                            <p className="text-xs text-muted-foreground">Carried Over</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-purple-600">{leaveBalance.bonusDays}</p>
                                            <p className="text-xs text-muted-foreground">Bonus</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-red-600">{leaveBalance.usedDays}</p>
                                            <p className="text-xs text-muted-foreground">Used</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">No leave balance data available</div>
                            )}
                        </CardContent>
                    </Card> */}

                    {/* Shift Leave Balance Overview */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Shift Leave Balance {currentYear}
                            </CardTitle>
                            <CardDescription>
                                Your shift leave allocation and usage
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isShiftLeaveBalanceLoading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="h-4 bg-muted rounded w-3/4"></div>
                                    <div className="h-8 bg-muted rounded"></div>
                                    <div className="grid grid-cols-4 gap-4">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-16 bg-muted rounded"></div>
                                        ))}
                                    </div>
                                </div>
                            ) : shiftLeaveBalance ? (
                                <div className="space-y-4">
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Used: {shiftLeaveBalance.usedShifts} shifts</span>
                                            <span>Remaining: {shiftLeaveBalance.availableShifts} shifts</span>
                                        </div>
                                        <Progress value={shiftLeaveBalancePercentage} className="h-3" />
                                    </div>

                                    {/* Balance Breakdown */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-blue-600">{shiftLeaveBalance.totalShifts}</p>
                                            <p className="text-xs text-muted-foreground">Total</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-green-600">{shiftLeaveBalance.bonusShifts}</p>
                                            <p className="text-xs text-muted-foreground">Bonus</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-red-600">{shiftLeaveBalance.usedShifts}</p>
                                            <p className="text-xs text-muted-foreground">Used</p>
                                        </div>
                                        <div className="text-center p-3 border rounded-lg">
                                            <p className="text-xl font-bold text-purple-600">{shiftLeaveBalance.availableShifts}</p>
                                            <p className="text-xs text-muted-foreground">Available</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">No shift leave balance data available</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Leave Requests */}
                    {/* <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Recent Leave Requests
                            </CardTitle>
                            <CardDescription>
                                Your recent leave requests and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLeaveRequestsLoading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted rounded"></div>
                                    ))}
                                </div>
                            ) : leaveRequests.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No leave requests yet. Click "Request Leave" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {leaveRequests.slice(0, 3).map((request: any) => (
                                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(request.status)}
                                                <div>
                                                    <p className="font-medium">{getLeaveTypeLabel(request.type)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge className={getStatusColor(request.status)}>
                                                    {getLeaveStatusLabel(request.status)}
                                                </Badge>
                                                <p className="text-sm text-muted-foreground mt-1">{request.totalDays} days</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card> */}

                    {/* Recent Shift Leave Requests */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardList className="h-5 w-5" />
                                Recent Shift Leave Requests
                            </CardTitle>
                            <CardDescription>
                                Your recent shift leave requests
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isShiftLeaveRequestsLoading ? (
                                <div className="animate-pulse space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 bg-muted rounded"></div>
                                    ))}
                                </div>
                            ) : recentShiftLeaveRequests.length === 0 ? (
                                <div className="text-center text-muted-foreground py-8">
                                    No shift leave requests yet. Click "Shift Leave" to get started.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {recentShiftLeaveRequests.map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                                                    {getShiftLeaveStatusIcon(request.requestStatus)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm">
                                                        {format(new Date(request.startDate), 'MMM d')} - {format(new Date(request.endDate), 'MMM d')}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {request.requestedShifts.map(shift => `${shift.name} (${formatTime(shift.startTime)}-${formatTime(shift.endTime)})`).join(', ')}
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge variant={request.requestStatus === 'APPROVED' ? 'default' :
                                                request.requestStatus === 'PENDING' ? 'secondary' : 'destructive'}>
                                                {request.requestStatus === 'PENDING' ? 'Pending' :
                                                    request.requestStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
                                            </Badge>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <Button variant="outline" size="sm" asChild>
                                            <a href="/app/employee-portal/shift-leave">View All Requests</a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Quick Actions */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* <Button className="w-full justify-start" variant="outline" asChild>
                                <a href="/app/employee-portal/leave-management">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Request Leave
                                </a>
                            </Button> */}
                            <Button className="w-full justify-start" variant="default" asChild>
                                <a href="/app/employee-portal/shift-leave">
                                    <ClipboardList className="h-4 w-4 mr-2" />
                                    Request Shift Leave
                                </a>
                            </Button>
                            <Button className="w-full justify-start" variant="default" asChild>
                                <a href="/app/employee-portal/shift-registration">
                                    <Clock className="h-4 w-4 mr-2" />
                                    Register for Shifts
                                </a>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" />
                                Alerts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Low leave balance alert */}
                            {leaveBalance && leaveBalance.remainingDays <= 5 && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <p className="text-sm text-yellow-800">
                                        Low leave balance: {leaveBalance.remainingDays} day{leaveBalance.remainingDays !== 1 ? 's' : ''} remaining
                                    </p>
                                </div>
                            )}

                            {/* Low shift leave balance alert */}
                            {shiftLeaveBalance && shiftLeaveBalance.availableShifts <= 5 && (
                                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    <p className="text-sm text-yellow-800">
                                        Low shift leave balance: {shiftLeaveBalance.availableShifts} shift{shiftLeaveBalance.availableShifts !== 1 ? 's' : ''} remaining
                                    </p>
                                </div>
                            )}

                            {/* Pending shift leave requests alert */}
                            {pendingShiftLeaveRequests.length > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm text-blue-800">
                                        You have {pendingShiftLeaveRequests.length} pending shift leave request{pendingShiftLeaveRequests.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* Pending shifts alert */}
                            {pendingShifts.length > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    <p className="text-sm text-blue-800">
                                        You have {pendingShifts.length} pending shift{pendingShifts.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            )}

                            {/* No alerts */}
                            {(!leaveBalance || leaveBalance.remainingDays > 5) &&
                                (!shiftLeaveBalance || shiftLeaveBalance.availableShifts > 5) &&
                                pendingShiftLeaveRequests.length === 0 &&
                                pendingShifts.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">
                                        No alerts at this time
                                    </div>
                                )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Modals */}
            <PendingShiftsModal
                open={isPendingShiftsModalOpen}
                onOpenChange={setIsPendingShiftsModalOpen}
            />
            <EmployeeLeaveManagement
                open={isLeaveRequestModalOpen}
                onOpenChange={setIsLeaveRequestModalOpen}
            />
        </div>
    );
}

export default function EmployeePortalPage() {
    return (
        <ProtectedRoute requiredRoles={employeeRole}>
            <EmployeePortal />
        </ProtectedRoute>
    );
}