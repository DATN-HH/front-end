import { format, parseISO, eachDayOfInterval, startOfWeek, endOfWeek, addDays } from 'date-fns';
import { CalendarIcon, Clock, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { StaffShiftResponseDto } from '@/services/api/v1/staff-shifts';

interface WeekCalendarProps {
    shifts: StaffShiftResponseDto[];
    isLoading?: boolean;
    onShiftClick?: (shift: StaffShiftResponseDto) => void;
    onPreviousWeek?: () => void;
    onNextWeek?: () => void;
    startDate: Date;
    endDate: Date;
}

export function WeekCalendar({
    shifts,
    isLoading = false,
    onShiftClick,
    onPreviousWeek,
    onNextWeek,
    startDate,
    endDate,
}: WeekCalendarProps) {
    // Format time for display
    const formatTime = (time: string | { hour: number; minute: number; second: number; nano: number }) => {
        if (typeof time === 'string') {
            return time.substring(0, 5);
        }
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    };

    // Ensure we have valid dates
    const validStartDate = startDate instanceof Date ? startDate : new Date(startDate);
    const validEndDate = endDate instanceof Date ? endDate : new Date(endDate);

    // Get all days in the week
    const days = eachDayOfInterval({
        start: validStartDate,
        end: validEndDate,
    });

    // Group shifts by date
    const shiftsByDate = shifts.reduce((acc, shift) => {
        const date = shift.date;
        if (!acc[date]) {
            acc[date] = [];
        }
        acc[date].push(shift);
        return acc;
    }, {} as Record<string, StaffShiftResponseDto[]>);

    // Professional loading skeleton
    if (isLoading) {
        return (
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-5 w-5" />
                            <Skeleton className="h-6 w-48" />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Skeleton className="h-9 w-9" />
                            <Skeleton className="h-9 w-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-7 gap-4">
                        {Array.from({ length: 7 }).map((_, index) => (
                            <div key={index} className="space-y-3">
                                <div className="text-center">
                                    <Skeleton className="h-4 w-8 mx-auto mb-1" />
                                    <Skeleton className="h-6 w-6 mx-auto" />
                                </div>
                                <Separator />
                                <div className="space-y-2">
                                    <Skeleton className="h-16 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-lg font-semibold tracking-tight">
                            {format(validStartDate, 'MMM d')} - {format(validEndDate, 'MMM d, yyyy')}
                        </h2>
                    </div>
                    <div className="flex items-center space-x-1">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onPreviousWeek}
                            className="h-9 w-9"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            <span className="sr-only">Previous week</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={onNextWeek}
                            className="h-9 w-9"
                        >
                            <ChevronRight className="h-4 w-4" />
                            <span className="sr-only">Next week</span>
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-7 gap-4">
                    {days.map((day) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayShifts = shiftsByDate[dateStr] || [];
                        const isToday = format(new Date(), 'yyyy-MM-dd') === dateStr;
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                            <div key={dateStr} className="space-y-3">
                                {/* Day Header */}
                                <div className="text-center space-y-1">
                                    <div className={`text-sm font-medium ${
                                        isWeekend ? 'text-gold-600' : 'text-foreground'
                                    }`}>
                                        {format(day, 'EEE')}
                                    </div>
                                    <div className={`inline-flex items-center justify-center w-8 h-8 text-sm font-semibold rounded-full transition-colors ${
                                        isToday 
                                            ? 'bg-primary text-primary-foreground shadow-sm' 
                                            : isWeekend
                                            ? 'text-gold-700 hover:bg-gold-50'
                                            : 'text-foreground hover:bg-accent'
                                    }`}>
                                        {format(day, 'd')}
                                    </div>
                                </div>

                                <Separator />

                                {/* Shifts */}
                                <div className="space-y-2 min-h-[120px]">
                                    {dayShifts.length > 0 ? (
                                        dayShifts.map((shift) => (
                                            <Card
                                                key={shift.id}
                                                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                                    shift.shiftStatus === 'PUBLISHED'
                                                        ? 'border-border hover:border-primary/50 hover:bg-accent/50'
                                                        : 'border-dashed border-muted-foreground/50 hover:border-gold-300 hover:bg-gold-50/50'
                                                }`}
                                                onClick={() => onShiftClick?.(shift)}
                                            >
                                                <CardContent className="p-3 space-y-2">
                                                    {/* Time */}
                                                    <div className="flex items-center space-x-1 text-sm">
                                                        <Clock className="h-3 w-3 text-primary" />
                                                        <span className="font-medium">
                                                            {formatTime(shift.shift.startTime)}
                                                        </span>
                                                        <span className="text-muted-foreground">-</span>
                                                        <span className="font-medium">
                                                            {formatTime(shift.shift.endTime)}
                                                        </span>
                                                    </div>

                                                    {/* Role */}
                                                    <Badge 
                                                        variant="secondary"
                                                        className="text-xs font-normal bg-accent/70 hover:bg-accent"
                                                    >
                                                        {shift.staff.userRoles[0].role.name}
                                                    </Badge>

                                                    {/* Status */}
                                                    <Badge 
                                                        variant={shift.shiftStatus === 'PUBLISHED' ? 'default' : 'outline'}
                                                        className={`text-xs ${
                                                            shift.shiftStatus === 'PUBLISHED' 
                                                                ? 'bg-primary/90 hover:bg-primary' 
                                                                : 'border-gold-300 text-gold-700 hover:bg-gold-50'
                                                        }`}
                                                    >
                                                        {shift.shiftStatus}
                                                    </Badge>

                                                    {/* Note */}
                                                    {shift.note && (
                                                        <div className="pt-1 border-t border-border/50">
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {shift.note}
                                                            </p>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-24 text-center space-y-1 rounded-lg border border-dashed border-gold-200 bg-gold-50/30">
                                            <Clock className="h-4 w-4 text-gold-500" />
                                            <p className="text-xs text-gold-600 font-medium">
                                                No shifts
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}