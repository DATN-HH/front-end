import { format, parseISO } from 'date-fns';
import { Edit, Filter, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { StaffShiftResponseDto } from '@/services/api/v1/staff-shifts';
import { UserDtoResponse } from '@/services/api/v1/auth';
import { RoleResponseDto } from '@/services/api/v1/auth';
import { useRef, useEffect } from 'react';

interface SchedulingCardProps {
    setViewMode: (mode: 'staff' | 'role' | 'time') => void;
    setTimeRange: (range: 'week' | 'month') => void;
    setSelectedRole: (role: string) => void;
    setSelectedStaff: (staff: number | 'all') => void;
    selectedRole: string;
    selectedStaff: number | 'all';
    viewMode: 'staff' | 'role' | 'time';
    daysInRange: Date[];
    groupedShifts: () => Record<string, StaffShiftResponseDto[]>;
    calculateShiftPosition: (shift: StaffShiftResponseDto, dayWidth: number) => { left: number; width: number };
    handleEditClick: (shift: StaffShiftResponseDto, e: React.MouseEvent) => void;
    handleDeleteClick: (shift: StaffShiftResponseDto, e: React.MouseEvent) => void;
    staff: UserDtoResponse[];
    roles: RoleResponseDto[];
    ganttRef: React.RefObject<HTMLDivElement>;
}

export function SchedulingCard({
    setViewMode,
    setTimeRange,
    setSelectedRole,
    setSelectedStaff,
    selectedRole,
    selectedStaff,
    viewMode,
    daysInRange,
    groupedShifts,
    calculateShiftPosition,
    handleEditClick,
    handleDeleteClick,
    staff,
    roles,
    ganttRef,
}: SchedulingCardProps) {
    const headerScrollRef = useRef<HTMLDivElement>(null);
    const bodyScrollRef = useRef<HTMLDivElement>(null);
    const leftColumnRef = useRef<HTMLDivElement>(null);

    // Sync horizontal scroll between header and body
    useEffect(() => {
        const headerEl = headerScrollRef.current;
        const bodyEl = bodyScrollRef.current;

        if (!headerEl || !bodyEl) return;

        const syncHorizontalScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
            const handler = () => {
                target.scrollLeft = source.scrollLeft;
            };
            return handler;
        };

        const headerToBody = syncHorizontalScroll(headerEl, bodyEl);
        const bodyToHeader = syncHorizontalScroll(bodyEl, headerEl);

        headerEl.addEventListener('scroll', headerToBody);
        bodyEl.addEventListener('scroll', bodyToHeader);

        return () => {
            headerEl.removeEventListener('scroll', headerToBody);
            bodyEl.removeEventListener('scroll', bodyToHeader);
        };
    }, []);

    // Sync vertical scroll between left column and body
    useEffect(() => {
        const leftEl = leftColumnRef.current;
        const bodyEl = bodyScrollRef.current;

        if (!leftEl || !bodyEl) return;

        const syncVerticalScroll = (source: HTMLDivElement, target: HTMLDivElement) => {
            const handler = () => {
                target.scrollTop = source.scrollTop;
            };
            return handler;
        };

        const leftToBody = syncVerticalScroll(leftEl, bodyEl);
        const bodyToLeft = syncVerticalScroll(bodyEl, leftEl);

        leftEl.addEventListener('scroll', leftToBody);
        bodyEl.addEventListener('scroll', bodyToLeft);

        return () => {
            leftEl.removeEventListener('scroll', leftToBody);
            bodyEl.removeEventListener('scroll', bodyToLeft);
        };
    }, []);

    // Calculate the maximum number of shifts per day for each group
    const calculateMaxShiftsPerDay = (shifts: StaffShiftResponseDto[]) => {
        const shiftsPerDay = new Map<string, number>();
        shifts.forEach(shift => {
            const date = shift.date;
            shiftsPerDay.set(date, (shiftsPerDay.get(date) || 0) + 1);
        });
        return Math.max(...Array.from(shiftsPerDay.values()), 1);
    };

    // Calculate shift position with proper day alignment
    const getShiftPosition = (shift: StaffShiftResponseDto, shifts: StaffShiftResponseDto[]) => {
        const dayWidth = 120; // Fixed width per day column
        const dayIndex = daysInRange.findIndex(day => 
            format(day, 'yyyy-MM-dd') === shift.date
        );
        
        if (dayIndex === -1) {
            return { left: 0, width: 0, top: 0 };
        }

        // Calculate horizontal position
        const left = dayIndex * dayWidth;
        const width = dayWidth - 8; // 4px padding on each side

        // Calculate vertical position for overlapping shifts
        const shiftsOnSameDay = shifts.filter(s => s.date === shift.date);
        const shiftIndex = shiftsOnSameDay.findIndex(s => s.id === shift.id);
        const top = 8 + (shiftIndex * 44); // 8px padding + 44px per shift

        return { left, width, top };
    };

    const shiftsData = groupedShifts();

    return (
        <Card className="w-full">
            <CardHeader className="pb-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <CardTitle className="text-xl">Schedule Overview</CardTitle>
                    <div className="flex flex-wrap items-center gap-3">
                        <Tabs
                            value={viewMode}
                            onValueChange={(value) => setViewMode(value as 'staff' | 'role' | 'time')}
                        >
                            <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="staff">By Staff</TabsTrigger>
                                <TabsTrigger value="role">By Role</TabsTrigger>
                                <TabsTrigger value="time">By Time</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <Tabs
                            defaultValue="week"
                            onValueChange={(value) => setTimeRange(value as 'week' | 'month')}
                        >
                            <TabsList className="grid grid-cols-2">
                                <TabsTrigger value="week">Week</TabsTrigger>
                                <TabsTrigger value="month">Month</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter className="h-4 w-4" />
                        <span>Filters:</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm">Role:</span>
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    {roles.map((role) => (
                                        <SelectItem key={role.name} value={role.name}>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: role.hexColor }}
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
                                    setSelectedStaff(value === 'all' ? 'all' : Number.parseInt(value))
                                }
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Staff</SelectItem>
                                    {staff.map((s) => (
                                        <SelectItem key={s.id} value={s.id.toString()}>
                                            {s.fullName}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Gantt Chart */}
                <div className="border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div className="flex border-b bg-muted/50">
                        {/* Left header cell */}
                        <div className="w-48 p-3 border-r bg-muted/50 flex items-center font-semibold flex-shrink-0">
                            {viewMode === 'staff' ? 'Staff Member' : 
                             viewMode === 'role' ? 'Role' : 'Time Slot'}
                        </div>
                        
                        {/* Right header - scrollable days */}
                        <div 
                            className="flex-1 overflow-x-auto overflow-y-hidden"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            ref={headerScrollRef}
                        >
                            <div className="flex" style={{ minWidth: `${daysInRange.length * 120}px` }}>
                                {daysInRange.map((day, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            'w-[120px] flex-shrink-0 p-3 text-center border-r last:border-r-0',
                                            'flex flex-col justify-center',
                                            (day.getDay() === 0 || day.getDay() === 6) && 'bg-muted'
                                        )}
                                    >
                                        <div className="font-medium text-sm">
                                            {format(day, 'EEE')}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {format(day, 'MMM d')}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex max-h-[500px]">
                        {/* Left column - scrollable rows */}
                        <div 
                            className="w-48 bg-muted/30 border-r flex-shrink-0 overflow-y-auto overflow-x-hidden"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                            ref={leftColumnRef}
                        >
                            <div>
                                {Object.entries(shiftsData).map(([key, shifts]) => {
                                    let groupLabel = '';
                                    let groupColor = '';

                                    if (viewMode === 'staff') {
                                        const staffMember = staff.find(s => s.id.toString() === key);
                                        groupLabel = staffMember?.fullName || 'Unknown';
                                        groupColor = staffMember?.userRoles[0]?.role.hexColor || '#gray';
                                    } else if (viewMode === 'role') {
                                        groupLabel = key;
                                        const role = roles.find(r => r.name === key);
                                        groupColor = role?.hexColor || '#gray';
                                    } else {
                                        // Time view
                                        const [start, end] = key.split('-');
                                        groupLabel = `${start}-${end}`;
                                    }

                                    const maxShiftsPerDay = calculateMaxShiftsPerDay(shifts);
                                    const rowHeight = Math.max(60, 16 + (maxShiftsPerDay * 44));

                                    return (
                                        <div
                                            key={key}
                                            className="border-b last:border-b-0 p-3 flex items-center gap-2"
                                            style={{ minHeight: `${rowHeight}px` }}
                                        >
                                            {groupColor && (
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: groupColor }}
                                                />
                                            )}
                                            <span className="font-medium text-sm truncate">
                                                {groupLabel}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right body - scrollable content */}
                        <div 
                            className="flex-1 overflow-auto"
                            ref={bodyScrollRef}
                        >
                            <div style={{ minWidth: `${daysInRange.length * 120}px` }}>
                                {Object.entries(shiftsData).map(([key, shifts]) => {
                                    const maxShiftsPerDay = calculateMaxShiftsPerDay(shifts);
                                    const rowHeight = Math.max(60, 16 + (maxShiftsPerDay * 44));

                                    return (
                                        <div
                                            key={key}
                                            className="border-b last:border-b-0 relative"
                                            style={{ height: `${rowHeight}px` }}
                                        >
                                            {/* Day columns background */}
                                            <div className="absolute inset-0 flex">
                                                {daysInRange.map((day, index) => (
                                                    <div
                                                        key={index}
                                                        className={cn(
                                                            'w-[120px] h-full border-r last:border-r-0',
                                                            (day.getDay() === 0 || day.getDay() === 6) && 'bg-muted/20'
                                                        )}
                                                    />
                                                ))}
                                            </div>

                                            {/* Shift bars */}
                                            {shifts?.map((shift: StaffShiftResponseDto) => {
                                                const { left, width, top } = getShiftPosition(shift, shifts);
                                                
                                                if (width === 0) return null;

                                                const roleColor = shift.staff.userRoles[0]?.role.hexColor || '#gray';

                                                return (
                                                    <TooltipProvider key={shift.id}>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div
                                                                    className="absolute h-10 rounded-md border flex items-center justify-between px-2 text-xs font-medium hover:opacity-80 transition-all cursor-pointer group shadow-sm"
                                                                    style={{
                                                                        left: `${left + 4}px`,
                                                                        width: `${width}px`,
                                                                        top: `${top}px`,
                                                                        backgroundColor: `${roleColor}15`,
                                                                        borderColor: roleColor,
                                                                        color: roleColor,
                                                                    }}
                                                                >
                                                                    <span className="truncate flex-1">
                                                                        {viewMode === 'staff'
                                                                            ? `${shift.shift.startTime}-${shift.shift.endTime}`
                                                                            : viewMode === 'role'
                                                                            ? shift.staff.fullName
                                                                            : shift.staff.fullName}
                                                                    </span>
                                                                    <div className="hidden group-hover:flex items-center gap-1 ml-2">
                                                                        <button
                                                                            className="p-1 hover:bg-white/50 rounded transition-colors"
                                                                            onClick={(e) => handleEditClick(shift, e)}
                                                                        >
                                                                            <Edit className="h-3 w-3" />
                                                                        </button>
                                                                        <button
                                                                            className="p-1 hover:bg-white/50 rounded transition-colors"
                                                                            onClick={(e) => handleDeleteClick(shift, e)}
                                                                        >
                                                                            <Trash2 className="h-3 w-3" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <div className="space-y-2">
                                                                    <p className="font-medium">
                                                                        {shift.staff.fullName}
                                                                    </p>
                                                                    <p className="text-xs">
                                                                        {format(parseISO(shift.date), 'MMM d, yyyy')} • {' '}
                                                                        {shift.shift.startTime.toString()}-{shift.shift.endTime.toString()}
                                                                    </p>
                                                                    <Badge
                                                                        variant="outline"
                                                                        style={{
                                                                            backgroundColor: `${roleColor}20`,
                                                                            borderColor: roleColor,
                                                                            color: roleColor,
                                                                        }}
                                                                    >
                                                                        {shift.staff.userRoles[0]?.role.name}
                                                                    </Badge>
                                                                    {shift.note && (
                                                                        <p className="text-xs text-muted-foreground">
                                                                            {shift.note}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-sm text-muted-foreground">
                    <p>Hover over shifts to see details. Click edit/delete buttons to modify shifts.</p>
                </div>
            </CardContent>
        </Card>
    );
}