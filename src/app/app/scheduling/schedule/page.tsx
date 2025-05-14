'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Sample data for job roles
const jobRoles = [
  { id: 1, name: 'Head Chef', color: '#FF5733' },
  { id: 2, name: 'Sous Chef', color: '#33FF57' },
  { id: 3, name: 'Waiter', color: '#3357FF' },
  { id: 4, name: 'Bartender', color: '#F033FF' },
  { id: 5, name: 'Host/Hostess', color: '#FF33A8' },
];

// Sample data for employees
const employees = [
  { id: 1, name: 'John Smith', roleId: 3, avatar: '/avatars/john.png' },
  { id: 2, name: 'Sarah Johnson', roleId: 5, avatar: '/avatars/sarah.png' },
  { id: 3, name: 'Michael Brown', roleId: 1, avatar: '/avatars/michael.png' },
  { id: 4, name: 'Emily Davis', roleId: 2, avatar: '/avatars/emily.png' },
  { id: 5, name: 'David Wilson', roleId: 4, avatar: '/avatars/david.png' },
  { id: 6, name: 'Jessica Taylor', roleId: 3, avatar: '/avatars/jessica.png' },
  { id: 7, name: 'Daniel Martinez', roleId: 2, avatar: '/avatars/daniel.png' },
  { id: 8, name: 'Olivia Anderson', roleId: 3, avatar: '/avatars/olivia.png' },
];

// Sample data for shifts with assignments
const initialShifts = [
  {
    id: 1,
    date: new Date(2025, 4, 5), // May 5, 2025 (Monday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
    roleRequirements: [
      { roleId: 1, count: 1, assignments: [{ employeeId: 3 }] },
      {
        roleId: 2,
        count: 2,
        assignments: [{ employeeId: 4 }, { employeeId: 7 }],
      },
      {
        roleId: 3,
        count: 4,
        assignments: [{ employeeId: 1 }, { employeeId: 6 }, { employeeId: 8 }],
      },
    ],
  },
  {
    id: 2,
    date: new Date(2025, 4, 6), // May 6, 2025 (Tuesday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
    roleRequirements: [
      { roleId: 1, count: 1, assignments: [{ employeeId: 3 }] },
      {
        roleId: 2,
        count: 2,
        assignments: [{ employeeId: 4 }, { employeeId: 7 }],
      },
      {
        roleId: 3,
        count: 4,
        assignments: [{ employeeId: 1 }, { employeeId: 6 }, { employeeId: 8 }],
      },
      { roleId: 5, count: 1, assignments: [{ employeeId: 2 }] },
    ],
  },
  {
    id: 3,
    date: new Date(2025, 4, 7), // May 7, 2025 (Wednesday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
    roleRequirements: [
      { roleId: 1, count: 1, assignments: [{ employeeId: 3 }] },
      {
        roleId: 2,
        count: 2,
        assignments: [{ employeeId: 4 }, { employeeId: 7 }],
      },
      {
        roleId: 3,
        count: 4,
        assignments: [{ employeeId: 1 }, { employeeId: 6 }, { employeeId: 8 }],
      },
      { roleId: 4, count: 1, assignments: [{ employeeId: 5 }] },
      { roleId: 5, count: 1, assignments: [{ employeeId: 2 }] },
    ],
  },
  {
    id: 4,
    date: new Date(2025, 4, 5), // May 5, 2025 (Monday)
    startTime: '17:00',
    endTime: '01:00', // Next day
    status: 'published',
    roleRequirements: [
      { roleId: 1, count: 1, assignments: [{ employeeId: 3 }] },
      {
        roleId: 3,
        count: 2,
        assignments: [{ employeeId: 1 }, { employeeId: 8 }],
      },
      { roleId: 4, count: 1, assignments: [{ employeeId: 5 }] },
    ],
  },
  {
    id: 5,
    date: new Date(2025, 4, 6), // May 6, 2025 (Tuesday)
    startTime: '17:00',
    endTime: '01:00', // Next day
    status: 'published',
    roleRequirements: [
      { roleId: 2, count: 1, assignments: [{ employeeId: 7 }] },
      {
        roleId: 3,
        count: 2,
        assignments: [{ employeeId: 6 }, { employeeId: 8 }],
      },
      { roleId: 4, count: 1, assignments: [{ employeeId: 5 }] },
    ],
  },
  {
    id: 6,
    date: new Date(2025, 4, 8), // May 8, 2025 (Thursday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'draft',
    roleRequirements: [
      { roleId: 1, count: 1, assignments: [{ employeeId: 3 }] },
      { roleId: 2, count: 2, assignments: [{ employeeId: 4 }] }, // Missing one assignment - conflict
      {
        roleId: 3,
        count: 4,
        assignments: [{ employeeId: 1 }, { employeeId: 6 }, { employeeId: 8 }],
      },
      { roleId: 5, count: 1, assignments: [{ employeeId: 2 }] },
    ],
  },
];

// Sample conflicts
const initialConflicts = [
  {
    id: 1,
    employeeId: 1,
    shiftId1: 1,
    shiftId2: 4,
    date: new Date(2025, 4, 5), // May 5, 2025
    description: 'John Smith is assigned to two overlapping shifts on Monday',
  },
  {
    id: 2,
    employeeId: null,
    shiftId1: 6,
    shiftId2: null,
    date: new Date(2025, 4, 8), // May 8, 2025
    description: 'Missing one Sous Chef assignment for Thursday morning shift',
  },
];

export default function SchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(2025, 4, 5)
  ); // May 5, 2025 (Monday)
  const [viewMode, setViewMode] = useState('employee'); // employee or role
  const [shifts, setShifts] = useState(initialShifts);
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [isConflictDialogOpen, setIsConflictDialogOpen] = useState(false);
  const [currentConflict, setCurrentConflict] = useState<any>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<any>(null);

  // Calculate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    addDays(currentWeekStart, i)
  );

  // Format date for display
  const formatWeekRange = () => {
    const start = format(currentWeekStart, 'MMMM d');
    const end = format(addDays(currentWeekStart, 6), 'MMMM d, yyyy');
    return `${start} - ${end}`;
  };

  // Navigate to previous week
  const goToPreviousWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, -7));
  };

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addDays(currentWeekStart, 7));
  };

  // Get employee by ID
  const getEmployee = (id: number) => {
    return employees.find((emp) => emp.id === id);
  };

  // Get role by ID
  const getRole = (id: number) => {
    return jobRoles.find((role) => role.id === id);
  };

  // Get role color
  const getRoleColor = (roleId: number) => {
    return jobRoles.find((role) => role.id === roleId)?.color || '#000000';
  };

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    return shifts.filter(
      (shift) =>
        shift.date.getDate() === date.getDate() &&
        shift.date.getMonth() === date.getMonth() &&
        shift.date.getFullYear() === date.getFullYear()
    );
  };

  // Get conflicts for a specific date
  const getConflictsForDate = (date: Date) => {
    return conflicts.filter(
      (conflict) =>
        conflict.date.getDate() === date.getDate() &&
        conflict.date.getMonth() === date.getMonth() &&
        conflict.date.getFullYear() === date.getFullYear()
    );
  };

  // Handle resolving a conflict
  const handleResolveConflict = () => {
    // In a real app, this would update the shifts to resolve the conflict
    setConflicts(
      conflicts.filter((conflict) => conflict.id !== currentConflict.id)
    );
    setIsConflictDialogOpen(false);
  };

  // Handle assigning an employee
  const handleAssignEmployee = (employeeId: number) => {
    if (!currentAssignment) return;

    const { shiftId, roleId, index } = currentAssignment;

    // Update the shift with the new assignment
    setShifts(
      shifts.map((shift) => {
        if (shift.id === shiftId) {
          const updatedRoleRequirements = shift.roleRequirements.map((req) => {
            if (req.roleId === roleId) {
              const updatedAssignments = [...req.assignments];
              if (index < updatedAssignments.length) {
                updatedAssignments[index] = { employeeId };
              } else {
                updatedAssignments.push({ employeeId });
              }
              return { ...req, assignments: updatedAssignments };
            }
            return req;
          });
          return { ...shift, roleRequirements: updatedRoleRequirements };
        }
        return shift;
      })
    );

    // Check if this resolves a conflict
    if (currentAssignment.conflictId) {
      setConflicts(
        conflicts.filter(
          (conflict) => conflict.id !== currentAssignment.conflictId
        )
      );
    }

    setIsAssignDialogOpen(false);
  };

  // Render time slot for Gantt chart
  const renderTimeSlot = (time: string) => {
    const hour = Number.parseInt(time.split(':')[0]);
    const minute = time.split(':')[1];
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  // Calculate position and width for shift block in Gantt chart
  const calculateShiftStyle = (startTime: string, endTime: string) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const startPosition = ((startHour * 60 + startMinute) / (24 * 60)) * 100;
    const endPosition = ((endHour * 60 + endMinute) / (24 * 60)) * 100;
    const width = endPosition - startPosition;

    return {
      left: `${startPosition}%`,
      width: `${width}%`,
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
        <p className="text-muted-foreground">
          View and manage employee work schedules
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{formatWeekRange()}</h2>
          <Button variant="outline" size="icon" onClick={goToNextWeek}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">View by Employee</SelectItem>
              <SelectItem value="role">View by Role</SelectItem>
            </SelectContent>
          </Select>

          {conflicts.length > 0 && (
            <Button
              variant="outline"
              className="text-red-500 border-red-500"
              onClick={() => {
                setCurrentConflict(conflicts[0]);
                setIsConflictDialogOpen(true);
              }}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {conflicts.length} Conflicts
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="gantt">
        <TabsList>
          <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="gantt">
          <Card>
            <CardHeader className="pb-0">
              <CardTitle>Schedule Gantt Chart</CardTitle>
              <CardDescription>
                Visual representation of the work schedule
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[1000px]">
                  {/* Time header */}
                  <div className="flex border-b">
                    <div className="w-48 flex-shrink-0 p-2 font-medium">
                      {viewMode === 'employee' ? 'Employee' : 'Role'}
                    </div>
                    <div className="flex-1 flex">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className="flex-1 text-center text-xs p-1 border-l"
                        >
                          {i % 3 === 0 && `${i}:00`}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gantt rows */}
                  {viewMode === 'employee'
                    ? // Employee view
                      employees.map((employee) => (
                        <div
                          key={employee.id}
                          className="flex border-b hover:bg-gray-50"
                        >
                          <div className="w-48 flex-shrink-0 p-2 flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getRoleColor(employee.roleId),
                              }}
                            />
                            <span>{employee.name}</span>
                          </div>
                          <div className="flex-1 relative h-12">
                            {shifts.map((shift) => {
                              // Find assignments for this employee
                              const assignments =
                                shift.roleRequirements.flatMap((req) =>
                                  req.assignments
                                    .filter((a) => a.employeeId === employee.id)
                                    .map((a) => ({
                                      roleId: req.roleId,
                                      shiftId: shift.id,
                                    }))
                                );

                              if (assignments.length === 0) return null;

                              // Check if this is a conflicting shift
                              const isConflict = conflicts.some(
                                (conflict) =>
                                  conflict.employeeId === employee.id &&
                                  (conflict.shiftId1 === shift.id ||
                                    conflict.shiftId2 === shift.id)
                              );

                              return assignments.map((assignment, idx) => (
                                <div
                                  key={`${shift.id}-${idx}`}
                                  className={cn(
                                    'absolute h-8 top-2 rounded-md text-xs flex items-center justify-center text-white overflow-hidden',
                                    isConflict
                                      ? 'bg-red-500'
                                      : 'cursor-pointer',
                                    shift.status === 'draft' && 'opacity-70'
                                  )}
                                  style={{
                                    ...calculateShiftStyle(
                                      shift.startTime,
                                      shift.endTime
                                    ),
                                    backgroundColor: isConflict
                                      ? undefined
                                      : getRoleColor(assignment.roleId),
                                  }}
                                  onClick={() => {
                                    if (isConflict) {
                                      const conflict = conflicts.find(
                                        (c) =>
                                          c.employeeId === employee.id &&
                                          (c.shiftId1 === shift.id ||
                                            c.shiftId2 === shift.id)
                                      );
                                      if (conflict) {
                                        setCurrentConflict(conflict);
                                        setIsConflictDialogOpen(true);
                                      }
                                    }
                                  }}
                                >
                                  <span className="px-2 truncate">
                                    {renderTimeSlot(shift.startTime)} -{' '}
                                    {renderTimeSlot(shift.endTime)}
                                  </span>
                                </div>
                              ));
                            })}
                          </div>
                        </div>
                      ))
                    : // Role view
                      jobRoles.map((role) => (
                        <div
                          key={role.id}
                          className="flex border-b hover:bg-gray-50"
                        >
                          <div className="w-48 flex-shrink-0 p-2 flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: role.color }}
                            />
                            <span>{role.name}</span>
                          </div>
                          <div className="flex-1 relative h-12">
                            {shifts.map((shift) => {
                              const roleReq = shift.roleRequirements.find(
                                (req) => req.roleId === role.id
                              );
                              if (!roleReq) return null;

                              // Check if this role has missing assignments
                              const isMissingAssignments =
                                roleReq.assignments.length < roleReq.count;

                              return (
                                <div
                                  key={shift.id}
                                  className={cn(
                                    'absolute h-8 top-2 rounded-md text-xs flex items-center justify-center text-white overflow-hidden',
                                    isMissingAssignments ? 'bg-red-500' : '',
                                    shift.status === 'draft' && 'opacity-70'
                                  )}
                                  style={{
                                    ...calculateShiftStyle(
                                      shift.startTime,
                                      shift.endTime
                                    ),
                                    backgroundColor: isMissingAssignments
                                      ? undefined
                                      : role.color,
                                  }}
                                  onClick={() => {
                                    if (
                                      isMissingAssignments &&
                                      shift.status === 'draft'
                                    ) {
                                      // Find the conflict if it exists
                                      const conflict = conflicts.find(
                                        (c) =>
                                          c.shiftId1 === shift.id &&
                                          c.employeeId === null
                                      );

                                      setCurrentAssignment({
                                        shiftId: shift.id,
                                        roleId: role.id,
                                        index: roleReq.assignments.length,
                                        conflictId: conflict?.id,
                                      });
                                      setIsAssignDialogOpen(true);
                                    }
                                  }}
                                >
                                  <span className="px-2 truncate">
                                    {roleReq.assignments.length}/{roleReq.count}{' '}
                                    {renderTimeSlot(shift.startTime)} -{' '}
                                    {renderTimeSlot(shift.endTime)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list">
          <div className="grid gap-6 md:grid-cols-7">
            {weekDates.map((date, index) => (
              <Card
                key={index}
                className={cn(
                  index === 0 || index === 6 ? 'bg-gray-50' : '',
                  getConflictsForDate(date).length > 0 ? 'border-red-200' : ''
                )}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    {format(date, 'EEEE')}
                    {getConflictsForDate(date).length > 0 && (
                      <Badge className="ml-2 bg-red-500">
                        {getConflictsForDate(date).length} Conflicts
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{format(date, 'MMMM d')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {getShiftsForDate(date).map((shift) => (
                    <div
                      key={shift.id}
                      className="border rounded-md p-2 text-sm"
                    >
                      <div className="font-medium flex justify-between">
                        <span>
                          {shift.startTime} - {shift.endTime}
                        </span>
                        <Badge
                          className={
                            shift.status === 'published'
                              ? 'bg-green-500'
                              : 'bg-gray-500'
                          }
                        >
                          {shift.status}
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-1">
                        {shift.roleRequirements.map((req) => {
                          const role = getRole(req.roleId);
                          return (
                            <div key={req.roleId} className="flex flex-col">
                              <div className="flex items-center gap-1">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: role?.color }}
                                />
                                <span className="text-xs font-medium">
                                  {role?.name} ({req.assignments.length}/
                                  {req.count})
                                </span>
                              </div>
                              <div className="ml-3 text-xs text-gray-500">
                                {req.assignments.map((a, idx) => (
                                  <div key={idx}>
                                    {getEmployee(a.employeeId)?.name}
                                  </div>
                                ))}
                                {req.assignments.length < req.count && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 text-xs text-orange-500 p-0"
                                    onClick={() => {
                                      setCurrentAssignment({
                                        shiftId: shift.id,
                                        roleId: req.roleId,
                                        index: req.assignments.length,
                                      });
                                      setIsAssignDialogOpen(true);
                                    }}
                                  >
                                    + Assign employee
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {getShiftsForDate(date).length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-4">
                      No shifts scheduled
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Conflict Resolution Dialog */}
      <Dialog
        open={isConflictDialogOpen}
        onOpenChange={setIsConflictDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Schedule Conflict
            </DialogTitle>
            <DialogDescription>
              This conflict needs to be resolved before publishing the schedule
            </DialogDescription>
          </DialogHeader>
          {currentConflict && (
            <div className="py-4">
              <p className="font-medium">{currentConflict.description}</p>

              {currentConflict.employeeId && (
                <div className="mt-4 space-y-4">
                  <div className="font-medium">Options to resolve:</div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // In a real app, this would open a dialog to reassign the employee
                        handleResolveConflict();
                      }}
                    >
                      Reassign employee to a different shift
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // In a real app, this would open a dialog to adjust shift times
                        handleResolveConflict();
                      }}
                    >
                      Adjust shift times to avoid overlap
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-orange-500"
                      onClick={handleResolveConflict}
                    >
                      Ignore conflict (not recommended)
                    </Button>
                  </div>
                </div>
              )}

              {!currentConflict.employeeId && (
                <div className="mt-4 space-y-4">
                  <div className="font-medium">Options to resolve:</div>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        // In a real app, this would open a dialog to assign an employee
                        const shift = shifts.find(
                          (s) => s.id === currentConflict.shiftId1
                        );
                        if (shift) {
                          const missingRole = shift.roleRequirements.find(
                            (r) => r.assignments.length < r.count
                          );
                          if (missingRole) {
                            setCurrentAssignment({
                              shiftId: shift.id,
                              roleId: missingRole.roleId,
                              index: missingRole.assignments.length,
                              conflictId: currentConflict.id,
                            });
                            setIsConflictDialogOpen(false);
                            setIsAssignDialogOpen(true);
                          }
                        }
                      }}
                    >
                      Assign an employee to the missing slot
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleResolveConflict}
                    >
                      Reduce required staff count
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConflictDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Employee Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Employee</DialogTitle>
            <DialogDescription>
              Select an employee to assign to this shift
            </DialogDescription>
          </DialogHeader>
          {currentAssignment && (
            <div className="py-4">
              <div className="space-y-4">
                {employees
                  .filter((emp) => {
                    // Filter employees by role
                    const shift = shifts.find(
                      (s) => s.id === currentAssignment.shiftId
                    );
                    const roleReq = shift?.roleRequirements.find(
                      (r) => r.roleId === currentAssignment.roleId
                    );
                    return (
                      emp.roleId === currentAssignment.roleId &&
                      !roleReq?.assignments.some((a) => a.employeeId === emp.id)
                    );
                  })
                  .map((emp) => (
                    <Button
                      key={emp.id}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleAssignEmployee(emp.id)}
                    >
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: getRoleColor(emp.roleId) }}
                      />
                      {emp.name}
                    </Button>
                  ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
