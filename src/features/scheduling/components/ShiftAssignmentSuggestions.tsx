'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  format,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
  eachDayOfInterval,
  isSameDay,
} from 'date-fns';
import { enUS } from 'date-fns/locale';
import {
  Calendar,
  Clock,
  AlertTriangle,
  Loader2,
  UserPlus,
  BarChart3,
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

import {
  useCompleteScheduleSuggestions,
  CompleteScheduleRequest,
  CompleteScheduleResponse,
  SuggestedAssignment,
  RoleAssignment,
  StaffAssignment,
  useBulkCreateStaffShifts,
  BulkStaffShiftAssignment,
} from '@/api/v1/shift-assignments';
import { useCreateStaffShift } from '@/api/v1/staff-shifts';
import { Avatar, AvatarFallback, AvatarInitials } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

interface ShiftAssignmentSuggestionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShiftAssignmentSuggestions({
  open,
  onOpenChange,
}: ShiftAssignmentSuggestionsProps) {
  const { success, error } = useCustomToast();
  const { user } = useAuth();
  const branchId = user?.branch?.id;
  const queryClient = useQueryClient();

  const suggestionMutation = useCompleteScheduleSuggestions();
  const createStaffShiftMutation = useCreateStaffShift();
  const bulkCreateStaffShiftMutation = useBulkCreateStaffShifts();

  const [selectedWeek, setSelectedWeek] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState<CompleteScheduleResponse | null>(
    null
  );
  const [excludeStaffIds, setExcludeStaffIds] = useState<number[]>([]);

  // Calculate week start (Monday) and end (Sunday)
  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const handleWeekChange = (direction: 'prev' | 'next') => {
    setSelectedWeek((prev) =>
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    );
  };

  const handleGenerateSchedule = async () => {
    if (!branchId) return;

    const request: CompleteScheduleRequest = {
      branchId,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      excludeStaffIds: excludeStaffIds.length > 0 ? excludeStaffIds : undefined,
    };

    try {
      const result = await suggestionMutation.mutateAsync(request);
      setSchedule(result);
      success(
        'Schedule Analyzed',
        `Successfully analyzed schedule for week ${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')}`
      );
    } catch (err: any) {
      error(
        'Analysis Failed',
        err.response?.data?.message || 'Failed to analyze schedule'
      );
    }
  };

  const handleCreateStaffShift = async (
    staff: StaffAssignment,
    scheduledShiftId: number,
    shiftName: string
  ) => {
    try {
      await createStaffShiftMutation.mutateAsync({
        staffId: staff.staffId,
        scheduledShiftId,
        shiftStatus: 'DRAFT',
      });

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['staff-shifts-grouped'],
        }),
        queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
        queryClient.invalidateQueries({
          queryKey: ['scheduled-shifts'],
        }),
      ]);

      // Refresh schedule
      handleGenerateSchedule();

      success(
        'Shift Assigned',
        `Successfully assigned ${staff.staffName} to ${shiftName}`
      );
    } catch (err: any) {
      error(
        'Assignment Failed',
        err.response?.data?.message || 'Failed to assign staff to shift'
      );
    }
  };

  const handleBulkAssignRole = async (
    roleAssignment: RoleAssignment,
    scheduledShiftId: number,
    shiftName: string
  ) => {
    const suggestedStaff = roleAssignment.assignedStaff.filter(
      (staff) => !staff.isExisting
    );

    if (suggestedStaff.length === 0) {
      error('No Suggestions', 'No suggested staff to assign for this role');
      return;
    }

    const assignments: BulkStaffShiftAssignment[] = suggestedStaff.map(
      (staff, index) => ({
        staffId: staff.staffId,
        scheduledShiftId,
        shiftStatus: 'DRAFT',
        note: 'Auto-assigned from suggestions',
        referenceId: `${roleAssignment.roleName}-${scheduledShiftId}-${index}`,
      })
    );

    try {
      const result = await bulkCreateStaffShiftMutation.mutateAsync({
        assignments,
        continueOnError: true,
        defaultStatus: 'DRAFT',
      });

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['staff-shifts-grouped'],
        }),
        queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
        queryClient.invalidateQueries({
          queryKey: ['scheduled-shifts'],
        }),
      ]);

      // Refresh schedule
      handleGenerateSchedule();

      // Show detailed success message
      const { summary } = result;
      if (summary.successful > 0) {
        success(
          'Bulk Assignment Completed',
          `${summary.successful}/${summary.totalRequested} staff assigned to ${roleAssignment.roleName} - ${shiftName}`
        );
      }

      if (summary.failed > 0 || summary.skipped > 0) {
        const failedCount = summary.failed + summary.skipped;
        error(
          'Some Assignments Failed',
          `${failedCount} assignments could not be completed. Check individual results for details.`
        );
      }
    } catch (err: any) {
      error(
        'Bulk Assignment Failed',
        err.response?.data?.message || 'Failed to assign suggested staff'
      );
    }
  };

  const handleBulkAssignAllSuggestions = async () => {
    if (!schedule) return;

    // Collect all suggested staff from all role assignments
    const allAssignments: BulkStaffShiftAssignment[] = [];
    let assignmentIndex = 0;

    schedule.suggestedAssignments.forEach((shift) => {
      shift.roleAssignments.forEach((roleAssignment) => {
        const suggestedStaff = roleAssignment.assignedStaff.filter(
          (staff) => !staff.isExisting
        );
        suggestedStaff.forEach((staff) => {
          allAssignments.push({
            staffId: staff.staffId,
            scheduledShiftId: shift.scheduledShiftId,
            shiftStatus: 'DRAFT',
            note: 'Auto-assigned from bulk suggestions',
            referenceId: `bulk-${assignmentIndex++}`,
          });
        });
      });
    });

    if (allAssignments.length === 0) {
      error(
        'No Suggestions',
        'No suggested staff assignments found for this week'
      );
      return;
    }

    try {
      const result = await bulkCreateStaffShiftMutation.mutateAsync({
        assignments: allAssignments,
        continueOnError: true,
        defaultStatus: 'DRAFT',
      });

      // Invalidate and refetch queries
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['staff-shifts-grouped'],
        }),
        queryClient.invalidateQueries({ queryKey: ['staff-shifts'] }),
        queryClient.invalidateQueries({
          queryKey: ['scheduled-shifts'],
        }),
      ]);

      // Refresh schedule
      handleGenerateSchedule();

      // Show detailed success message
      const { summary } = result;
      success(
        'Weekly Bulk Assignment Completed',
        `${summary.successful}/${summary.totalRequested} suggested assignments completed (${summary.successRate.toFixed(1)}% success rate)`
      );

      if (summary.failed > 0 || summary.skipped > 0) {
        const failedCount = summary.failed + summary.skipped;
        error(
          'Some Assignments Failed',
          `${failedCount} assignments could not be completed. This is normal for duplicates or conflicts.`
        );
      }
    } catch (err: any) {
      error(
        'Bulk Assignment Failed',
        err.response?.data?.message || 'Failed to assign all suggested staff'
      );
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSchedule(null);
    setExcludeStaffIds([]);
    setSelectedWeek(new Date());
  };

  const getShiftsForDay = (date: Date): SuggestedAssignment[] => {
    if (!schedule) return [];
    return schedule.suggestedAssignments.filter((assignment) =>
      isSameDay(new Date(assignment.date), date)
    );
  };

  const renderRoleAssignment = (
    roleAssignment: RoleAssignment,
    scheduledShiftId: number,
    shiftName: string
  ) => {
    const existingStaff = roleAssignment.assignedStaff.filter(
      (staff) => staff.isExisting
    );
    const suggestedStaff = roleAssignment.assignedStaff.filter(
      (staff) => !staff.isExisting
    );

    return (
      <div
        key={roleAssignment.roleName}
        className="border rounded-md p-2 space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <Badge
              variant={roleAssignment.isFullyFilled ? 'default' : 'destructive'}
              className="text-xs"
            >
              {roleAssignment.roleName}
            </Badge>
            <div className="text-xs text-muted-foreground ml-1 flex items-center gap-1">
              <span className="text-green-600 font-medium">
                {roleAssignment.existingQuantity}
              </span>
              {roleAssignment.suggestedQuantity > 0 && (
                <>
                  <span>+</span>
                  <span className="text-blue-600 font-medium">
                    {roleAssignment.suggestedQuantity}
                  </span>
                </>
              )}
              <span>/{roleAssignment.requiredQuantity}</span>
            </div>
          </div>
          {!roleAssignment.isFullyFilled && (
            <Badge
              variant="outline"
              className="text-orange-600 border-orange-600 text-xs flex-shrink-0"
            >
              Need{' '}
              {roleAssignment.requiredQuantity -
                roleAssignment.assignedQuantity}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          {/* Existing Staff */}
          {existingStaff.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-green-700 mb-1">
                ✅ Already Assigned
              </div>
              {existingStaff.map((staff) => (
                <div
                  key={staff.staffId}
                  className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-green-100 text-green-700 text-xs">
                        <AvatarInitials name={staff.staffName} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-green-800">
                        {staff.staffName}
                      </div>
                      <div className="text-xs text-green-600">
                        {staff.weeklyWorkload} shifts
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 border-green-300 text-xs"
                  >
                    Assigned
                  </Badge>
                </div>
              ))}
            </div>
          )}

          {/* Suggested Staff */}
          {suggestedStaff.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-blue-700 mb-1">
                ➕ Suggested to Add
              </div>
              {suggestedStaff.map((staff) => (
                <div
                  key={staff.staffId}
                  className="flex items-center justify-between p-2 bg-blue-50 border border-blue-200 rounded text-xs"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                        <AvatarInitials name={staff.staffName} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-blue-800">
                        {staff.staffName}
                      </div>
                      <div className="text-xs text-blue-600">
                        {staff.weeklyWorkload} shifts
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() =>
                      handleCreateStaffShift(staff, scheduledShiftId, shiftName)
                    }
                    disabled={createStaffShiftMutation.isPending}
                    className="h-6 w-6 p-0 flex-shrink-0 ml-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {createStaffShiftMutation.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserPlus className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {suggestedStaff.some((staff) => staff.warnings.length > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <div className="flex items-start gap-1">
              <AlertTriangle className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-medium text-yellow-800">
                  Suggestion Warnings:
                </div>
                <div className="text-yellow-700 mt-1">
                  {suggestedStaff
                    .filter((staff) => staff.warnings.length > 0)
                    .map((staff) => staff.warnings)
                    .flat()
                    .join(', ')}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDaySchedule = (date: Date) => {
    const shifts = getShiftsForDay(date);
    if (shifts.length === 0) {
      return (
        <div className="text-center py-6 text-muted-foreground">
          <Clock className="h-6 w-6 mx-auto mb-2 opacity-50" />
          <div className="text-xs">No shifts</div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {shifts.map((shift) => (
          <Card
            key={shift.scheduledShiftId}
            className="border-l-2 border-l-primary"
          >
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{shift.shiftName}</span>
              </CardTitle>
              <CardDescription className="text-xs">
                {shift.startTime} - {shift.endTime}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 px-3 pb-3">
              {shift.roleAssignments.map((roleAssignment) =>
                renderRoleAssignment(
                  roleAssignment,
                  shift.scheduledShiftId,
                  shift.shiftName
                )
              )}
              {shift.missingRoles.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded p-2">
                  <div className="flex items-start gap-1">
                    <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs">
                      <div className="font-medium text-red-800">Missing:</div>
                      <div className="text-red-700">
                        {shift.missingRoles.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  if (!branchId) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <CalendarDays className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Weekly Schedule Suggestions
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                View existing assignments and get suggestions for missing staff
                positions
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Week Selection */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                  <Calendar className="h-4 w-4" />
                </div>
                Select Week
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('prev')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center min-w-[250px]">
                  <div className="text-base font-semibold">
                    {format(weekStart, 'MMM dd', {
                      locale: enUS,
                    })}{' '}
                    -{' '}
                    {format(weekEnd, 'MMM dd, yyyy', {
                      locale: enUS,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Week{' '}
                    {format(weekStart, 'w', {
                      locale: enUS,
                    })}{' '}
                    of {format(weekStart, 'yyyy')}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange('next')}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                onClick={handleGenerateSchedule}
                disabled={suggestionMutation.isPending}
                className="w-full h-10 font-medium"
              >
                {suggestionMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <CalendarDays className="mr-2 h-4 w-4" />
                    Generate Schedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          {schedule && (
            <Card className="border-2 border-accent/20 bg-accent/5">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    Schedule Summary
                  </CardTitle>
                  <Button
                    onClick={handleBulkAssignAllSuggestions}
                    disabled={bulkCreateStaffShiftMutation.isPending}
                    className="bg-primary text-white"
                    size="sm"
                  >
                    {bulkCreateStaffShiftMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Assign All Suggestions
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-primary">
                      {schedule.summary.totalShifts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Shifts
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-green-600">
                      {schedule.summary.fullyStaffedShifts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Fully Staffed
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-yellow-600">
                      {schedule.summary.partiallyStaffedShifts}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Partially Staffed
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xl font-bold text-blue-600">
                      {schedule.summary.scheduleCompleteness.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completion
                    </div>
                  </div>
                </div>

                {schedule.warnings.length > 0 && (
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-yellow-800 mb-1 text-sm">
                          Warnings:
                        </div>
                        <div className="text-yellow-700 text-xs space-y-1">
                          {schedule.warnings.map((warning, idx) => (
                            <div key={idx}>• {warning}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Weekly Schedule Grid */}
          {schedule && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-accent text-accent-foreground">
                  <Calendar className="h-3 w-3" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Weekly Schedule
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="space-y-2 min-w-0">
                    <div className="text-center p-2 bg-muted rounded">
                      <div className="font-semibold text-sm text-foreground">
                        {format(day, 'EEE', {
                          locale: enUS,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(day, 'MMM dd')}
                      </div>
                    </div>
                    <div>{renderDaySchedule(day)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!schedule && !suggestionMutation.isPending && (
            <Card className="border-2 border-dashed border-muted">
              <CardContent className="pt-12 pb-12">
                <div className="text-center text-muted-foreground">
                  <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                    <CalendarDays className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    No schedule analysis yet
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Select a week and click "Generate Schedule" to view
                    assignments and suggestions
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="border-t pt-6 bg-muted/30">
          <Button variant="outline" onClick={handleClose} className="px-8 h-11">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
