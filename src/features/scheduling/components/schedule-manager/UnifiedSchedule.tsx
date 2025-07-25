'use client';

import dayjs from 'dayjs';
import { Plus, ChevronDown } from 'lucide-react';
import { useContext } from 'react';

import { ShiftStatus } from '@/api/v1/publish-shifts';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    getStatusConfig,
    isStatusCountedInRequirements,
} from '@/config/status-colors';
import { ScheduleContext } from '@/features/scheduling/contexts/context-schedule';

import AddShiftModal from './AddShiftModal';

interface UnifiedScheduleProps {
    viewMode: 'weekly' | 'monthly';
}

const UnifiedSchedule = ({ viewMode }: UnifiedScheduleProps) => {
    const {
        startDate,
        endDate,
        staffShiftsGrouped,
        isLoadingStaffShiftsGrouped,
        roles,
        isLoadingRoles,
        scheduledShifts,
        isLoadingScheduledShifts,
        setIsCreateOpenShiftDialogOpen,
        setSelectedDate,
        setIsShiftInfoModalOpen,
        setShiftInfoModalType,
        setSelectedStaffName,
    } = useContext(ScheduleContext);

    // Generate dates based on view mode and context date range
    const generateScheduleData = () => {
        const start = dayjs(startDate);
        const end = dayjs(endDate);
        const data: Record<string, { label: string; hasShifts: boolean }> = {};

        if (viewMode === 'weekly') {
            // For weekly view, use the week range from context
            let current = start;
            while (current.isBefore(end) || current.isSame(end)) {
                const dateStr = current.format('YYYY-MM-DD');
                data[dateStr] = {
                    label: current.format('ddd D/M'),
                    hasShifts: true,
                };
                current = current.add(1, 'day');
            }
        } else {
            // For monthly view, show all days in the month
            const monthStart = start.startOf('month');
            const monthEnd = start.endOf('month');
            let current = monthStart;

            while (current.isBefore(monthEnd) || current.isSame(monthEnd)) {
                const dateStr = current.format('YYYY-MM-DD');
                data[dateStr] = {
                    label: current.format('D/M'),
                    hasShifts: true,
                };
                current = current.add(1, 'day');
            }
        }

        return data;
    };

    const scheduleData = generateScheduleData();

    // Get open shifts data from scheduledShifts
    const getOpenShiftsData = () => {
        if (!scheduledShifts || isLoadingScheduledShifts) {
            return {};
        }

        const openShiftsData: Record<string, any[]> = {};

        // Filter open shifts (shifts without assigned staff)
        const openShiftsList = scheduledShifts.filter(
            (shift: any) => !shift.staffId || shift.staffId === null
        );

        openShiftsList.forEach((shift: any) => {
            const dateStr = dayjs(shift.date).format('YYYY-MM-DD');
            if (!openShiftsData[dateStr]) {
                openShiftsData[dateStr] = [];
            }
            openShiftsData[dateStr].push({
                id: shift.id,
                name: shift.shiftName || 'Open Shift',
                time:
                    shift.startTime && shift.endTime
                        ? `${shift.startTime}-${shift.endTime}`
                        : '',
                status: 'DRAFT',
                startTime: shift.startTime,
                endTime: shift.endTime,
                requirements: shift.requirements || [],
            });
        });

        return openShiftsData;
    };

    // Use actual data from context instead of dummy data using new structure
    const getEmployeeScheduleData = () => {
        if (
            !staffShiftsGrouped ||
            !roles ||
            isLoadingStaffShiftsGrouped ||
            isLoadingRoles
        ) {
            return {};
        }

        const employeeData: Record<string, any> = {};

        // Group employees by role
        Object.keys(staffShiftsGrouped.data).forEach((roleName) => {
            const roleData = staffShiftsGrouped.data[roleName];
            const role = roles.find((r) => r.name === roleName);

            employeeData[roleName] = {
                role: roleName,
                roleLabel: role?.name || roleName,
                roleColor: getRoleColor(roleName),
                employees: Object.keys(roleData).map((staffName: string) => ({
                    name: staffName,
                    shifts: roleData[staffName].shifts || {},
                })),
            };
        });

        return employeeData;
    };

    const getRoleColor = (roleName: string) => {
        if (!roles) return 'bg-gray-100 text-gray-800';

        const role = roles.find((r) => r.name === roleName);
        if (!role?.hexColor) return 'bg-gray-100 text-gray-800';

        // Use hex color from role data
        return 'text-white';
    };

    const getRoleStyle = (roleName: string) => {
        if (!roles) return { backgroundColor: '#6B7280' };

        const role = roles.find((r) => r.name === roleName);
        if (!role?.hexColor) return { backgroundColor: '#6B7280' };

        return { backgroundColor: role.hexColor };
    };

    // Status configs are now imported from the centralized config file

    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Get registered staff count for open shifts (similar to ShiftInfoModal)
    const getRegisteredStaffCount = (shift: any, date: string) => {
        if (!staffShiftsGrouped)
            return { total: 0, byRole: [], isComplete: false };

        const dateStr = dayjs(date).format('YYYY-MM-DD');
        let totalRegistered = 0;
        const roleBreakdown: any[] = [];

        // Count staff registered for this shift across all roles
        // Only count shifts with DRAFT/PENDING/PUBLISHED status for requirements
        Object.keys(staffShiftsGrouped.data).forEach((roleName) => {
            const roleData = staffShiftsGrouped.data[roleName];
            let roleCount = 0;

            Object.keys(roleData).forEach((staffName) => {
                const staffShifts = roleData[staffName].shifts[dateStr] || [];
                const hasShift = staffShifts.some(
                    (s: any) =>
                        s.startTime === shift.startTime &&
                        s.endTime === shift.endTime &&
                        isStatusCountedInRequirements(s.shiftStatus)
                );
                if (hasShift) {
                    roleCount++;
                    totalRegistered++;
                }
            });

            if (roleCount > 0) {
                roleBreakdown.push({ role: roleName, count: roleCount });
            }
        });

        // Check if shift requirements are met
        let isComplete = true;
        if (shift.requirements && shift.requirements.length > 0) {
            isComplete = shift.requirements.every((req: any) => {
                const registered =
                    roleBreakdown.find((r) => r.role === req.role)?.count || 0;
                return registered >= req.quantity;
            });
        }

        return { total: totalRegistered, byRole: roleBreakdown, isComplete };
    };

    const handleCreateOpenShift = (date: string) => {
        setSelectedDate(new Date(date));
        setIsCreateOpenShiftDialogOpen(true);
    };

    const handleOpenShiftClick = (date: string) => {
        setSelectedDate(new Date(date));
        setShiftInfoModalType('open-shift');
        setIsShiftInfoModalOpen(true);
    };

    const handleEmployeeShiftClick = (employeeName: string, date: string) => {
        setSelectedDate(new Date(date));
        setSelectedStaffName(employeeName);
        setShiftInfoModalType('employee-shift');
        setIsShiftInfoModalOpen(true);
    };

    const renderShiftCell = (
        employeeName: string,
        date: string,
        shifts: any[]
    ) => {
        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleEmployeeShiftClick(employeeName, date)}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            );
        }

        // Count shifts by status
        const statusCounts = Object.values(ShiftStatus).reduce(
            (acc, status) => {
                acc[status] = shifts.filter(
                    (shift) => shift.shiftStatus === status
                ).length;
                return acc;
            },
            {} as Record<string, number>
        );

        // Filter out statuses with zero counts
        const activeStatuses = Object.entries(statusCounts).filter(
            ([_, count]) => count > 0
        );

        // Generate tooltip content for all statuses
        const tooltipContent = activeStatuses.map(([status, count]) => {
            const config = getStatusConfig(status as ShiftStatus);
            return { status: status as ShiftStatus, count, config };
        });

        // Single status - show normally
        if (activeStatuses.length === 1) {
            const [status, count] = activeStatuses[0];
            const config = getStatusConfig(status as ShiftStatus);

            return (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div
                                className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1"
                                onClick={() =>
                                    handleEmployeeShiftClick(employeeName, date)
                                }
                            >
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium"
                                    style={{
                                        backgroundColor: config.color,
                                        color: config.textColor,
                                    }}
                                >
                                    {count}
                                </div>
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: config.color }}
                                />
                                <span>
                                    {count} {config.label} shift
                                    {count > 1 ? 's' : ''}
                                </span>
                            </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            );
        }

        // Multiple statuses - show dropdown
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <div className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 rounded-full px-2 py-1">
                                        <span className="text-sm font-medium text-gray-700">
                                            {shifts.length}
                                        </span>
                                        <ChevronDown className="w-3 h-3 text-gray-600" />
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="center"
                                    className="w-48"
                                >
                                    {tooltipContent.map(
                                        ({ status, count, config }) => (
                                            <DropdownMenuItem
                                                key={status}
                                                onClick={() =>
                                                    handleEmployeeShiftClick(
                                                        employeeName,
                                                        date
                                                    )
                                                }
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <div
                                                        className="w-4 h-4 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                config.color,
                                                        }}
                                                    />
                                                    <span className="flex-1">
                                                        {config.label}
                                                    </span>
                                                    <span className="font-medium">
                                                        {count}
                                                    </span>
                                                </div>
                                            </DropdownMenuItem>
                                        )
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                        <div className="space-y-1">
                            <div className="font-medium text-sm">
                                All shifts on this day:
                            </div>
                            {tooltipContent.map(({ status, count, config }) => (
                                <div
                                    key={status}
                                    className="flex items-center gap-2"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor: config.color,
                                        }}
                                    />
                                    <span className="text-sm">
                                        {count} {config.label} shift
                                        {count > 1 ? 's' : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    };

    const renderOpenShiftCell = (date: string) => {
        const openShiftsData = getOpenShiftsData();
        const shifts = openShiftsData[date] || [];

        if (shifts.length === 0) {
            return (
                <div
                    className="p-2 h-12 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleCreateOpenShift(date)}
                >
                    <Plus className="w-5 h-5 text-gray-400" />
                </div>
            );
        }

        // Check if any open shift is incomplete
        const incompleteShifts = shifts.filter((shift) => {
            const registeredInfo = getRegisteredStaffCount(shift, date);
            return !registeredInfo.isComplete;
        });

        const hasIncompleteShifts = incompleteShifts.length > 0;

        // Generate tooltip content
        const tooltipContent = incompleteShifts.map((shift) => {
            const registeredInfo = getRegisteredStaffCount(shift, date);
            const missingRequirements =
                shift.requirements?.filter((req: any) => {
                    const registered =
                        registeredInfo.byRole.find((r) => r.role === req.role)
                            ?.count || 0;
                    return registered < req.quantity;
                }) || [];

            return {
                name: shift.name,
                time: shift.time,
                missing: missingRequirements.map((req: any) => {
                    const registered =
                        registeredInfo.byRole.find((r) => r.role === req.role)
                            ?.count || 0;
                    return `${req.role}: ${registered}/${req.quantity}`;
                }),
            };
        });

        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <div
                            className={`p-2 h-12 flex items-center justify-center cursor-pointer transition-colors gap-1 ${
                                hasIncompleteShifts
                                    ? 'bg-red-300 hover:bg-red-200'
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleOpenShiftClick(date)}
                        >
                            <div className="w-7 h-7 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                {shifts.length}
                            </div>
                        </div>
                    </TooltipTrigger>
                    {hasIncompleteShifts && (
                        <TooltipContent className="max-w-xs">
                            <div className="space-y-2">
                                <div className="font-medium text-sm">
                                    Understaffed shifts:
                                </div>
                                {tooltipContent.map((shift, index) => (
                                    <div key={index} className="text-xs">
                                        <div className="font-medium">
                                            {shift.name} ({shift.time})
                                        </div>
                                        {shift.missing.map(
                                            (missing: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="text-muted-foreground ml-2"
                                                >
                                                    {missing}
                                                </div>
                                            )
                                        )}
                                    </div>
                                ))}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    };

    // Transform data for rendering
    const employeeScheduleData = getEmployeeScheduleData();
    const employeesByRole = Object.values(employeeScheduleData);

    const dates = Object.keys(scheduleData).sort();

    // Column width based on view mode
    const columnWidth = viewMode === 'weekly' ? 'min-w-32' : 'min-w-0';
    const columnFlexClass = viewMode === 'weekly' ? 'flex-1' : 'flex-1';

    // Show loading state
    if (
        isLoadingStaffShiftsGrouped ||
        isLoadingRoles ||
        isLoadingScheduledShifts
    ) {
        return (
            <div className="w-full bg-white p-8 text-center">
                <div className="text-gray-500">Loading schedule...</div>
            </div>
        );
    }

    return (
        <>
            <div className="w-full bg-white">
                <div className="overflow-x-auto">
                    <div
                        style={{
                            minWidth: `${Math.max(800, 256 + dates.length * 100)}px`,
                        }}
                    >
                        {/* Header */}
                        <div className="flex border-b-2 border-gray-300">
                            <div className="w-64 flex-shrink-0 p-3 bg-gray-50 border-r border-gray-300"></div>

                            {dates.map((date) => {
                                const dayInfo = scheduleData[date];
                                return (
                                    <div
                                        key={date}
                                        className={`${columnFlexClass} ${columnWidth} border-r border-gray-300`}
                                        style={{ minWidth: '100px' }}
                                    >
                                        <div className="p-2 text-center bg-blue-50">
                                            <div className="font-medium text-xs text-gray-900">
                                                {dayInfo.label}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Open Shifts Row */}
                        <div className="flex border-b border-gray-300">
                            <div className="w-64 flex-shrink-0 p-3 bg-white border-r border-gray-300 flex items-center gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm font-medium">
                                            Open Shifts
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {dates.map((date) => (
                                <div
                                    key={date}
                                    className={`${columnFlexClass} ${columnWidth} border-r border-gray-200`}
                                    style={{ minWidth: '100px' }}
                                >
                                    {renderOpenShiftCell(date)}
                                </div>
                            ))}
                        </div>

                        {/* Employee rows grouped by role */}
                        <div className="divide-y divide-gray-300">
                            {employeesByRole.map(
                                ({ role, roleLabel, roleColor, employees }) => (
                                    <div key={role} className="bg-gray-25">
                                        {/* Role header */}
                                        <div className="flex bg-gray-100">
                                            <div className="w-64 flex-shrink-0 p-3 flex items-center gap-3 border-r border-gray-300">
                                                <Badge
                                                    className={`${getRoleColor(role)} font-medium`}
                                                    style={getRoleStyle(role)}
                                                >
                                                    {roleLabel}
                                                </Badge>
                                                <span className="text-sm text-gray-600">
                                                    ({employees.length} staff)
                                                </span>
                                            </div>
                                            {dates.map((date) => (
                                                <div
                                                    key={date}
                                                    className={`${columnFlexClass} ${columnWidth} border-r border-gray-200 bg-gray-50`}
                                                    style={{
                                                        minWidth: '100px',
                                                    }}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Employees in this role */}
                                        <div className="divide-y divide-gray-200">
                                            {employees.map(
                                                (
                                                    employee: any,
                                                    empIndex: number
                                                ) => (
                                                    <div
                                                        key={`${role}-${empIndex}`}
                                                        className="flex"
                                                    >
                                                        {/* Employee info */}
                                                        <div className="w-64 h-12 flex-shrink-0 p-3 bg-white border-r border-gray-300 flex items-center gap-3">
                                                            <Avatar className="w-8 h-8">
                                                                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                                                                    {getInitials(
                                                                        employee.name
                                                                    )}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                                    {
                                                                        employee.name
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                                                        </div>

                                                        {/* Daily shifts */}
                                                        {dates.map((date) => (
                                                            <div
                                                                key={date}
                                                                className={`${columnFlexClass} ${columnWidth} border-r border-gray-200`}
                                                                style={{
                                                                    minWidth:
                                                                        '100px',
                                                                }}
                                                            >
                                                                {renderShiftCell(
                                                                    employee.name,
                                                                    date,
                                                                    employee
                                                                        .shifts[
                                                                        date
                                                                    ] || []
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Add Shift Modal */}
                <AddShiftModal />
            </div>
        </>
    );
};

export default UnifiedSchedule;
