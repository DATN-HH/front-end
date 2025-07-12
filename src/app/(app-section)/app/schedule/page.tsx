'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import {
    Calendar, Clock, Users, AlertTriangle,
    BarChart3, UserX, FileText, Calculator
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    useDailyOverview,
    useWeeklyOverview,
    useMonthlyOverview,
    formatDate,
    getStartOfWeek,
    getCurrentMonth,
    type ScheduleOverviewDto
} from '@/api/v1/schedule-overview';
import { format } from 'date-fns';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

type ViewType = 'daily' | 'weekly' | 'monthly';

export function ScheduleOverview() {
    const [activeTab, setActiveTab] = useState<ViewType>('daily');
    const [selectedDate, setSelectedDate] = useState<string>(formatDate(new Date()));
    const [selectedWeek, setSelectedWeek] = useState<string>(getStartOfWeek(new Date()));
    const [selectedMonth, setSelectedMonth] = useState<number>(getCurrentMonth().month);
    const [selectedYear, setSelectedYear] = useState<number>(getCurrentMonth().year);

    // TODO: Get actual branch ID from user context
    const branchId = 1;

    // API calls based on active tab
    const { data: dailyData, isLoading: isDailyLoading } = useDailyOverview(
        branchId,
        activeTab === 'daily' ? selectedDate : ''
    );

    const { data: weeklyData, isLoading: isWeeklyLoading } = useWeeklyOverview(
        branchId,
        activeTab === 'weekly' ? selectedWeek : ''
    );

    const { data: monthlyData, isLoading: isMonthlyLoading } = useMonthlyOverview(
        branchId,
        activeTab === 'monthly' ? selectedYear : 0,
        activeTab === 'monthly' ? selectedMonth : 0
    );

    // Get current data based on active tab
    const getCurrentData = (): ScheduleOverviewDto | undefined => {
        switch (activeTab) {
            case 'daily': return dailyData;
            case 'weekly': return weeklyData;
            case 'monthly': return monthlyData;
            default: return undefined;
        }
    };

    const getCurrentLoading = (): boolean => {
        switch (activeTab) {
            case 'daily': return isDailyLoading;
            case 'weekly': return isWeeklyLoading;
            case 'monthly': return isMonthlyLoading;
            default: return false;
        }
    };

    const data = getCurrentData();
    const isLoading = getCurrentLoading();

    const renderDateFilters = () => {
        return (
            <div className="space-y-4">
                {activeTab === 'daily' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Label htmlFor="date" className="text-sm font-medium">Date:</Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full sm:w-auto"
                        />
                    </div>
                )}

                {activeTab === 'weekly' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Label htmlFor="week" className="text-sm font-medium">Week Start:</Label>
                        <Input
                            id="week"
                            type="date"
                            value={selectedWeek}
                            onChange={(e) => setSelectedWeek(e.target.value)}
                            className="w-full sm:w-auto"
                        />
                    </div>
                )}

                {activeTab === 'monthly' && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Label className="text-sm font-medium">Month:</Label>
                        <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
                            <SelectTrigger className="w-full sm:w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                                    <SelectItem key={month} value={month.toString()}>
                                        Month {month}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label className="text-sm font-medium">Year:</Label>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
                            <SelectTrigger className="w-full sm:w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>
        );
    };

    const renderStatsCards = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i}>
                            <CardContent className="p-4 lg:p-6">
                                <div className="space-y-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (!data) return null;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl lg:text-2xl font-bold">{data.staffShiftStats.totalStaffShifts || 0}</p>
                                <p className="text-xs text-muted-foreground">Total Shifts</p>
                            </div>
                            <Calendar className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl lg:text-2xl font-bold">
                                    {data.staffWorkingStats.workingStaff.reduce((total, staff) => total + (staff.totalWorkingHours || 0), 0).toFixed(1)}
                                </p>
                                <p className="text-xs text-muted-foreground">Working Hours</p>
                            </div>
                            <Clock className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl lg:text-2xl font-bold">{data.staffWorkingStats.totalActiveStaff || 0}</p>
                                <p className="text-xs text-muted-foreground">Active Staff</p>
                            </div>
                            <Users className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 lg:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xl lg:text-2xl font-bold">{data.shiftLeaveStats.pendingRequests || 0}</p>
                                <p className="text-xs text-muted-foreground">Pending Shift Leaves</p>
                            </div>
                            <AlertTriangle className="h-6 w-6 lg:h-8 lg:w-8 text-muted-foreground" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderDetailedStats = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                    {[1, 2].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-32" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        {[1, 2, 3, 4].map(j => (
                                            <div key={j} className="p-3 rounded-lg">
                                                <Skeleton className="h-8 w-8 mx-auto mb-2" />
                                                <Skeleton className="h-3 w-16 mx-auto" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-2 border-t space-y-2">
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                        <div className="flex justify-between">
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-4 w-12" />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (!data) return null;

        return (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
                {/* Staff Shift Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <Clock className="h-5 w-5" />
                            Shift Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-blue-600">{data.staffShiftStats.publishedShifts || 0}</div>
                                    <div className="text-xs text-blue-600 font-medium">Published</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-yellow-600">{data.staffShiftStats.pendingShifts || 0}</div>
                                    <div className="text-xs text-yellow-600 font-medium">Pending</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-gray-600">{data.staffShiftStats.draftShifts || 0}</div>
                                    <div className="text-xs text-gray-600 font-medium">Draft</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-red-600">{data.staffShiftStats.conflictedShifts || 0}</div>
                                    <div className="text-xs text-red-600 font-medium">Conflicted</div>
                                </div>
                            </div>
                            <div className="pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Published Rate</span>
                                    <span className="font-medium">
                                        {Math.round(((data.staffShiftStats.publishedShifts || 0) / (data.staffShiftStats.totalStaffShifts || 1)) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Leave Statistics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <FileText className="h-5 w-5" />
                            Shift Leave Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                <div className="bg-green-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-green-600">{data.shiftLeaveStats.approvedRequests || 0}</div>
                                    <div className="text-xs text-green-600 font-medium">Approved</div>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-yellow-600">{data.shiftLeaveStats.pendingRequests || 0}</div>
                                    <div className="text-xs text-yellow-600 font-medium">Pending</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-red-600">{data.shiftLeaveStats.rejectedRequests || 0}</div>
                                    <div className="text-xs text-red-600 font-medium">Rejected</div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-gray-600">{data.shiftLeaveStats.cancelledRequests || 0}</div>
                                    <div className="text-xs text-gray-600 font-medium">Cancelled</div>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Affected Shifts</span>
                                    <span className="font-medium">{data.shiftLeaveStats.totalAffectedShifts || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Average per Request</span>
                                    <span className="font-medium">{(data.shiftLeaveStats.averageAffectedShifts || 0).toFixed(1)}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Shift Leave Balance */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <Calculator className="h-5 w-5" />
                            Shift Leave Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-3 lg:gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-blue-600">{data.shiftLeaveStats.totalEmployeesWithBalance || 0}</div>
                                    <div className="text-xs text-blue-600 font-medium">Employees with Balance</div>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg text-center">
                                    <div className="text-xl lg:text-2xl font-bold text-purple-600">{(data.shiftLeaveStats.averageShiftBalance || 0).toFixed(1)}</div>
                                    <div className="text-xs text-purple-600 font-medium">Average Balance</div>
                                </div>
                            </div>
                            <div className="space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Shifts Used</span>
                                    <span className="font-medium">{data.shiftLeaveStats.totalShiftsUsed || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Total Available</span>
                                    <span className="font-medium">{data.shiftLeaveStats.totalShiftsAvailable || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Usage Rate</span>
                                    <span className="font-medium">
                                        {Math.round(((data.shiftLeaveStats.totalShiftsUsed || 0) / (data.shiftLeaveStats.totalShiftsAvailable || 1)) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    };

    const renderUnderStaffedShifts = () => {
        if (isLoading) {
            return (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-5 w-40" />
                        </div>
                        <Skeleton className="h-4 w-32" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="border rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <Skeleton className="h-5 w-24 mb-2" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                        <Skeleton className="h-6 w-20" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[1, 2, 3].map(j => (
                                            <div key={j}>
                                                <Skeleton className="h-4 w-16 mb-1" />
                                                <Skeleton className="h-4 w-8" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            );
        }

        if (!data || data.underStaffedShifts.totalUnderStaffedShifts === 0) return null;

        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Under-staffed Shifts
                    </CardTitle>
                    <CardDescription>
                        {data.underStaffedShifts.totalUnderStaffedShifts} shifts need additional staff
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {data.underStaffedShifts.shifts.map((shift) => (
                            <div key={shift.scheduledShiftId} className="border rounded-lg p-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-3">
                                    <div className="flex-1">
                                        <p className="font-medium">{shift.shiftName}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {format(new Date(shift.date), 'dd/MM/yyyy')} • {shift.startTime} - {shift.endTime}
                                        </p>
                                    </div>
                                    <Badge variant="destructive" className="self-start">
                                        Short {shift.shortfall || 0} staff
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-2 text-sm">
                                    <div className="flex justify-between sm:block">
                                        <span className="text-muted-foreground">Current:</span>
                                        <span className="ml-1 font-medium">{shift.currentStaffCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between sm:block">
                                        <span className="text-muted-foreground">Required:</span>
                                        <span className="ml-1 font-medium">{shift.requiredStaffCount || 0}</span>
                                    </div>
                                    <div className="flex justify-between sm:block">
                                        <span className="text-muted-foreground">Short:</span>
                                        <span className="ml-1 font-medium text-red-600">{shift.shortfall || 0}</span>
                                    </div>
                                </div>
                                {shift.roleShortfalls.length > 0 && (
                                    <div className="mt-3 pt-3 border-t">
                                        <p className="text-xs text-muted-foreground mb-2">Role shortfalls:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {shift.roleShortfalls.map((role) => (
                                                <Badge key={role.roleId} variant="outline" className="text-xs">
                                                    {role.roleName}: -{role.shortfall || 0}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    };

    const renderStaffWorkingStats = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                    {[1, 2].map(i => (
                        <Card key={i}>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-40" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3 max-h-64 overflow-y-auto">
                                    {[1, 2, 3].map(j => (
                                        <div key={j} className="flex justify-between items-center p-2 border rounded">
                                            <div>
                                                <Skeleton className="h-4 w-24 mb-1" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <div className="text-right">
                                                <Skeleton className="h-4 w-12 mb-1" />
                                                <Skeleton className="h-3 w-8" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (!data) return null;

        return (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
                {/* Working Staff */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                            <Users className="h-5 w-5 text-green-500" />
                            Staff with Shifts ({data.staffWorkingStats.staffWithShifts})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 max-h-64 overflow-y-auto">
                            {data.staffWorkingStats.workingStaff.slice(0, 10).map((staff) => (
                                <div key={staff.staffId} className="flex justify-between items-center p-3 border rounded">
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{staff.staffName}</p>
                                        <p className="text-sm text-muted-foreground truncate">{staff.roleName}</p>
                                    </div>
                                    <div className="text-right ml-3 flex-shrink-0">
                                        <p className="text-sm font-medium">{staff.totalShifts || 0} shifts</p>
                                        <p className="text-xs text-muted-foreground">{(staff.totalWorkingHours || 0)}h</p>
                                    </div>
                                </div>
                            ))}
                            {data.staffWorkingStats.workingStaff.length > 10 && (
                                <p className="text-sm text-muted-foreground text-center">
                                    and {data.staffWorkingStats.workingStaff.length - 10} more staff...
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Non-Working Staff */}
                {data.staffWorkingStats.staffWithoutShifts > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
                                <UserX className="h-5 w-5 text-orange-500" />
                                Staff without Shifts ({data.staffWorkingStats.staffWithoutShifts})
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {data.staffWorkingStats.nonWorkingStaff.slice(0, 10).map((staff) => (
                                    <div key={staff.staffId} className="flex justify-between items-center p-3 border rounded">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{staff.staffName}</p>
                                            <p className="text-sm text-muted-foreground truncate">{staff.roleName}</p>
                                        </div>
                                        <Badge variant="outline" className="ml-3 flex-shrink-0">No shifts</Badge>
                                    </div>
                                ))}
                                {data.staffWorkingStats.nonWorkingStaff.length > 10 && (
                                    <p className="text-sm text-muted-foreground text-center">
                                        and {data.staffWorkingStats.nonWorkingStaff.length - 10} more staff...
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4 lg:space-y-6">
            <PageTitle
                icon={BarChart3}
                title="Schedule Overview"
                left={
                    <div className="text-muted-foreground text-sm lg:text-base">
                        {data && `${data.branchName} • ${data.startDate} - ${data.endDate}`}
                    </div>
                }
            />

            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ViewType)} className="space-y-4 lg:space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="daily">Daily</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>

                {/* Date Filters */}
                {renderDateFilters()}

                {/* Main Stats Cards */}
                {renderStatsCards()}

                {/* Detailed Statistics */}
                {renderDetailedStats()}

                {/* Under-staffed Shifts Alert */}
                {renderUnderStaffedShifts()}

                {/* Staff Working Statistics */}
                {renderStaffWorkingStats()}
            </Tabs>
        </div>
    );
}

export default function ScheduleOverviewPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER]}>
            <ScheduleOverview />
        </ProtectedRoute>
    );
}