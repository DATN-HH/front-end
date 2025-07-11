'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useWeeklySchedule } from '@/api/v1/employee-portal';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';
import { EmergencyLeaveModal } from './EmergencyLeaveModal';

export function WeeklyScheduleCalendar() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [isEmergencyLeaveModalOpen, setIsEmergencyLeaveModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState<any>(null);

    // Calculate week boundaries
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    // Format dates for API
    const weekStartStr = format(weekStart, 'yyyy-MM-dd');
    const weekEndStr = format(weekEnd, 'yyyy-MM-dd');

    // API call
    const { data: weeklySchedule = [], isLoading, refetch } = useWeeklySchedule(weekStartStr, weekEndStr);

    // Navigation functions
    const goToPreviousWeek = () => setCurrentWeek(prev => subWeeks(prev, 1));
    const goToNextWeek = () => setCurrentWeek(prev => addWeeks(prev, 1));
    const goToCurrentWeek = () => setCurrentWeek(new Date());

    // Helper function to get shifts for a specific day
    const getShiftsForDay = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return weeklySchedule.filter(shift => shift.date === dateStr);
    };

    // Helper function to check if date is today
    const isToday = (date: Date) => isSameDay(date, new Date());

    // Handle shift click
    const handleShiftClick = (shift: any, date: Date) => {
        setSelectedShift({
            id: shift.id,
            shiftName: shift.shiftName,
            startTime: shift.startTime,
            endTime: shift.endTime,
            date: format(date, 'yyyy-MM-dd'),
            branchName: shift.branchName,
            note: shift.note
        });
        setIsEmergencyLeaveModalOpen(true);
    };

    // Handle successful emergency leave request
    const handleEmergencyLeaveSuccess = () => {
        refetch(); // Refresh the weekly schedule
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                <Calendar className="h-4 w-4" />
                            </div>
                            Weekly Schedule
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToPreviousWeek}
                                disabled={isLoading}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToCurrentWeek}
                                disabled={isLoading}
                            >
                                Today
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={goToNextWeek}
                                disabled={isLoading}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="animate-pulse">
                            <div className="grid grid-cols-7 gap-2 mb-4">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="h-8 bg-muted rounded"></div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 7 }).map((_, i) => (
                                    <div key={i} className="h-32 bg-muted rounded"></div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="overflow-x-auto">
                                <div style={{ minWidth: '700px' }}>
                                    <div className="space-y-4">
                                        {/* Week Header */}
                                        <div className="grid grid-cols-7 gap-2">
                                            {weekDays.map((day) => (
                                                <div
                                                    key={day.toISOString()}
                                                    className={`text-center p-2 rounded-lg text-sm font-medium ${isToday(day)
                                                        ? 'bg-primary text-primary-foreground'
                                                        : 'text-muted-foreground'
                                                        }`}
                                                >
                                                    <div className="text-xs">{format(day, 'EEE')}</div>
                                                    <div className="text-lg font-bold">{format(day, 'dd')}</div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Week Calendar Grid */}
                                        <div className="grid grid-cols-7 gap-2">
                                            {weekDays.map((day) => {
                                                const dayShifts = getShiftsForDay(day);
                                                return (
                                                    <div
                                                        key={day.toISOString()}
                                                        className={`min-h-32 p-2 border rounded-lg ${isToday(day)
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-muted'
                                                            }`}
                                                    >
                                                        <div className="space-y-1">
                                                            {dayShifts.length === 0 ? (
                                                                <div className="text-xs text-muted-foreground text-center py-4">
                                                                    No shifts
                                                                </div>
                                                            ) : (
                                                                dayShifts.map((shift) => (
                                                                    <div
                                                                        key={shift.id}
                                                                        onClick={() => handleShiftClick(shift, day)}
                                                                        className="p-2 bg-primary/10 border border-primary/20 rounded text-xs space-y-1 cursor-pointer hover:bg-primary/20 transition-colors"
                                                                    >
                                                                        <div className="font-medium text-primary truncate">
                                                                            {shift.shiftName}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                                            <Clock className="h-3 w-3" />
                                                                            <span className="truncate">
                                                                                {shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)}
                                                                            </span>
                                                                        </div>
                                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                                            <MapPin className="h-3 w-3" />
                                                                            <span className="truncate">{shift.branchName}</span>
                                                                        </div>
                                                                        {shift.note && (
                                                                            <div className="text-xs text-muted-foreground italic truncate">
                                                                                {shift.note}
                                                                            </div>
                                                                        )}
                                                                        <Badge variant="outline" className="text-xs px-1 py-0">
                                                                            Published
                                                                        </Badge>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm text-muted-foreground">
                                    Total shifts this week: <span className="font-medium text-foreground">{weeklySchedule.length}</span>
                                </div>
                                {weeklySchedule.length > 0 && (
                                    <div className="text-sm text-muted-foreground">
                                        Total hours: <span className="font-medium text-foreground">
                                            {weeklySchedule.reduce((total, shift) => {
                                                const start = new Date(`2000-01-01T${shift.startTime}`);
                                                const end = new Date(`2000-01-01T${shift.endTime}`);
                                                const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
                                                return total + hours;
                                            }, 0).toFixed(1)}h
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Emergency Leave Modal */}
            <EmergencyLeaveModal
                open={isEmergencyLeaveModalOpen}
                onOpenChange={setIsEmergencyLeaveModalOpen}
                shift={selectedShift}
                onSuccess={handleEmergencyLeaveSuccess}
            />
        </>
    );
} 