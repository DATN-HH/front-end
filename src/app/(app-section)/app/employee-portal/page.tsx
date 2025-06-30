'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
    Clock,
    User,
    FileText,
    CalendarDays,
    AlertTriangle,
    CheckCircle,
    Plus,
    Activity,
    XCircle
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
import { PendingShiftsModal } from '@/features/employee-portal/components/PendingShiftsModal';
import { EmployeeLeaveManagement } from '@/features/employee-portal/components/EmployeeLeaveManagement';
import { NotificationsPanel } from '@/features/employee-portal/components/NotificationsPanel';
import { WeeklyScheduleCalendar } from '@/features/employee-portal/components/WeeklyScheduleCalendar';
import { format,parseISO, differenceInHours } from 'date-fns';
import { ProtectedRoute } from '@/components/protected-component';
import { employeeRole } from '@/lib/rbac';

export function EmployeePortal() {
    const { user } = useAuth();
    const [isPendingShiftsModalOpen, setIsPendingShiftsModalOpen] = useState(false);
    const [isLeaveRequestModalOpen, setIsLeaveRequestModalOpen] = useState(false);

    // API calls
    const { data: workingHours30, isLoading: isHours30Loading } = useWorkingHours(30);
    const { data: workingHours7, isLoading: isHours7Loading } = useWorkingHours(7);
    const { data: leaveBalance, isLoading: isLeaveBalanceLoading } = useMyLeaveBalance();
    const { data: leaveRequests = [], isLoading: isLeaveRequestsLoading } = useMyLeaveRequests();
    const { data: pendingShifts = [], isLoading: isPendingShiftsLoading } = useMyPendingShifts();

    // Calculate stats
    const urgentPendingShifts = pendingShifts.filter(shift => {
        const deadlineDate = parseISO(shift.deadline);
        const now = new Date();
        const hoursLeft = differenceInHours(deadlineDate, now);
        return hoursLeft < 24 && hoursLeft > 0;
    });

    const leaveBalancePercentage = leaveBalance ? (leaveBalance.usedDays / leaveBalance.totalAllocatedDays) * 100 : 0;

    const getStatusIcon = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return <CheckCircle className="h-4 w-4 text-green-600" />;
            case LeaveStatus.PENDING: return <Clock className="h-4 w-4 text-yellow-600" />;
            case LeaveStatus.REJECTED: return <XCircle className="h-4 w-4 text-red-600" />;
            default: return null;
        }
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

                {/* Leave Balance */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100 text-purple-600">
                                <CalendarDays className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{leaveBalance?.remainingDays || 0}</p>
                                <p className="text-sm text-muted-foreground">Leave Days Left</p>
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
                    <Card>
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
                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>Used: {leaveBalance.usedDays} days</span>
                                            <span>Remaining: {leaveBalance.remainingDays} days</span>
                                        </div>
                                        <Progress value={leaveBalancePercentage} className="h-3" />
                                    </div>

                                    {/* Balance Breakdown */}
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

                                    <Button
                                        onClick={() => setIsLeaveRequestModalOpen(true)}
                                        className="w-full"
                                        disabled={leaveBalance.remainingDays === 0}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Request Leave
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <CalendarDays className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>No leave balance data available</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Leave Requests */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Recent Leave Requests
                                    </CardTitle>
                                    <CardDescription>Your latest leave applications</CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setIsLeaveRequestModalOpen(true)}>
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLeaveRequestsLoading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-16 bg-muted rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : leaveRequests.length === 0 ? (
                                <div className="text-center py-8">
                                    <FileText className="h-12 w-12 text-muted-foreground/50 mx-auto mb-2" />
                                    <p className="text-muted-foreground">No leave requests yet</p>
                                    <Button
                                        className="mt-4"
                                        onClick={() => setIsLeaveRequestModalOpen(true)}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Submit Your First Request
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {leaveRequests.slice(0, 4).map((request) => (
                                        <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(request.status)}
                                                <div>
                                                    <p className="font-medium">{getLeaveTypeLabel(request.leaveType)}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd')}
                                                        {request.reason && ` • ${request.reason}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={getStatusColor(request.status)}>
                                                    {getLeaveStatusLabel(request.status)}
                                                </Badge>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {request.totalDays} day{request.totalDays !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column - Notifications */}
                <div className="space-y-6">
                    <NotificationsPanel />
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