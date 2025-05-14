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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format, addDays } from 'date-fns';
import { CalendarIcon, Clock, Calendar, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Sample data for the current employee
const currentEmployee = {
  id: 1,
  name: 'John Smith',
  email: 'john.smith@example.com',
  roleId: 3,
  roleName: 'Waiter',
  roleColor: '#3357FF',
};

// Sample data for shifts
const initialShifts = [
  {
    id: 1,
    date: new Date(2025, 4, 5), // May 5, 2025 (Monday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
  },
  {
    id: 4,
    date: new Date(2025, 4, 5), // May 5, 2025 (Monday)
    startTime: '17:00',
    endTime: '01:00', // Next day
    status: 'published',
  },
  {
    id: 2,
    date: new Date(2025, 4, 6), // May 6, 2025 (Tuesday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
  },
  {
    id: 7,
    date: new Date(2025, 4, 8), // May 8, 2025 (Thursday)
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
  },
  {
    id: 9,
    date: new Date(2025, 4, 10), // May 10, 2025 (Saturday)
    startTime: '12:00',
    endTime: '20:00',
    status: 'published',
  },
];

// Sample data for time-off requests
const initialRequests = [
  {
    id: 1,
    type: 'time-off',
    startDate: new Date(2025, 4, 15),
    endDate: new Date(2025, 4, 16),
    status: 'pending',
    reason: 'Family vacation',
    requestDate: new Date(2025, 4, 1),
    rejectionReason: undefined, // Add rejectionReason property
  },
  {
    id: 2,
    type: 'shift-change',
    shiftDate: new Date(2025, 4, 10),
    shiftId: 9,
    status: 'approved',
    reason: "Doctor's appointment",
    requestDate: new Date(2025, 3, 25),
    targetEmployeeId: 5,
    targetEmployeeName: 'David Wilson',
    rejectionReason: undefined, // Add rejectionReason property
  },
];

// Sample data for unavailable time periods
const initialUnavailablePeriods = [
  {
    id: 1,
    startDate: new Date(2025, 4, 20),
    endDate: new Date(2025, 4, 20),
    allDay: true,
    reason: 'Personal appointment',
  },
  {
    id: 2,
    startDate: new Date(2025, 4, 25),
    endDate: new Date(2025, 4, 25),
    startTime: '09:00',
    endTime: '13:00',
    allDay: false,
    reason: "Doctor's appointment",
  },
];

export default function EmployeePortalPage() {
  const [shifts, setShifts] = useState(initialShifts);
  const [requests, setRequests] = useState(initialRequests);
  const [unavailablePeriods, setUnavailablePeriods] = useState(
    initialUnavailablePeriods
  );
  const [currentWeekStart, setCurrentWeekStart] = useState(
    new Date(2025, 4, 5)
  ); // May 5, 2025 (Monday)

  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = useState(false);
  const [isShiftChangeDialogOpen, setIsShiftChangeDialogOpen] = useState(false);
  const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] =
    useState(false);

  const [timeOffRequest, setTimeOffRequest] = useState({
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
  });

  const [shiftChangeRequest, setShiftChangeRequest] = useState({
    shiftId: '',
    reason: '',
  });

  const [unavailabilityPeriod, setUnavailabilityPeriod] = useState({
    startDate: new Date(),
    endDate: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    allDay: true,
    reason: '',
  });

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

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    return shifts.filter(
      (shift) =>
        shift.date.getDate() === date.getDate() &&
        shift.date.getMonth() === date.getMonth() &&
        shift.date.getFullYear() === date.getFullYear()
    );
  };

  // Handle submitting a time-off request
  const handleSubmitTimeOffRequest = () => {
    const newRequest = {
      id: Math.max(0, ...requests.map((r) => r.id)) + 1,
      type: 'time-off' as const,
      startDate: timeOffRequest.startDate,
      endDate: timeOffRequest.endDate,
      status: 'pending' as const,
      reason: timeOffRequest.reason,
      requestDate: new Date(),
      rejectionReason: undefined,
    };

    setRequests([...requests, newRequest]);
    setTimeOffRequest({
      startDate: new Date(),
      endDate: new Date(),
      reason: '',
    });
    setIsTimeOffDialogOpen(false);
  };

  // Handle submitting a shift change request
  const handleSubmitShiftChangeRequest = () => {
    const shiftId = Number.parseInt(shiftChangeRequest.shiftId);
    const shift = shifts.find((s) => s.id === shiftId);

    if (!shift) return;

    const newRequest = {
      id: Math.max(0, ...requests.map((r) => r.id)) + 1,
      type: 'shift-change' as const,
      shiftDate: shift.date,
      shiftId,
      status: 'pending' as const,
      reason: shiftChangeRequest.reason,
      requestDate: new Date(),
      targetEmployeeId: 0, // Default or placeholder value
      targetEmployeeName: '', // Default or placeholder value
      rejectionReason: undefined,
    };

    setRequests([...requests, newRequest]);
    setShiftChangeRequest({
      shiftId: '',
      reason: '',
    });
    setIsShiftChangeDialogOpen(false);
  };

  // Handle adding an unavailability period
  const handleAddUnavailabilityPeriod = () => {
    const newPeriod = {
      id: Math.max(0, ...unavailablePeriods.map((p) => p.id)) + 1,
      ...unavailabilityPeriod,
    };

    setUnavailablePeriods([...unavailablePeriods, newPeriod]);
    setUnavailabilityPeriod({
      startDate: new Date(),
      endDate: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      allDay: true,
      reason: '',
    });
    setIsUnavailabilityDialogOpen(false);
  };

  // Render time slot
  const renderTimeSlot = (time: string) => {
    const hour = Number.parseInt(time.split(':')[0]);
    const minute = time.split(':')[1];
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minute} ${period}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Employee Portal</h1>
        <p className="text-muted-foreground">Welcome, {currentEmployee.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: currentEmployee.roleColor }}
                />
                <span className="font-medium">{currentEmployee.roleName}</span>
              </div>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Email:</span>{' '}
                  {currentEmployee.email}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Dialog
                open={isTimeOffDialogOpen}
                onOpenChange={setIsTimeOffDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full bg-orange-500 hover:bg-orange-600">
                    Request Time Off
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Time Off</DialogTitle>
                    <DialogDescription>
                      Submit a request for time off
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Date Range</Label>
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <Label className="mb-1 text-xs">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'justify-start text-left font-normal',
                                  !timeOffRequest.startDate &&
                                    'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {timeOffRequest.startDate
                                  ? format(timeOffRequest.startDate, 'PPP')
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={timeOffRequest.startDate}
                                onSelect={(date) =>
                                  date &&
                                  setTimeOffRequest({
                                    ...timeOffRequest,
                                    startDate: date,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex flex-col">
                          <Label className="mb-1 text-xs">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'justify-start text-left font-normal',
                                  !timeOffRequest.endDate &&
                                    'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {timeOffRequest.endDate
                                  ? format(timeOffRequest.endDate, 'PPP')
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={timeOffRequest.endDate}
                                onSelect={(date) =>
                                  date &&
                                  setTimeOffRequest({
                                    ...timeOffRequest,
                                    endDate: date,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="reason">Reason</Label>
                      <Textarea
                        id="reason"
                        placeholder="Provide a reason for your time off request"
                        value={timeOffRequest.reason}
                        onChange={(e) =>
                          setTimeOffRequest({
                            ...timeOffRequest,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsTimeOffDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleSubmitTimeOffRequest}
                      disabled={!timeOffRequest.reason.trim()}
                    >
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isShiftChangeDialogOpen}
                onOpenChange={setIsShiftChangeDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Request Shift Change
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request Shift Change</DialogTitle>
                    <DialogDescription>
                      Submit a request to change one of your shifts
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="shift">Select Shift</Label>
                      <Select
                        value={shiftChangeRequest.shiftId}
                        onValueChange={(value) =>
                          setShiftChangeRequest({
                            ...shiftChangeRequest,
                            shiftId: value,
                          })
                        }
                      >
                        <SelectTrigger id="shift">
                          <SelectValue placeholder="Select a shift" />
                        </SelectTrigger>
                        <SelectContent>
                          {shifts.map((shift) => (
                            <SelectItem
                              key={shift.id}
                              value={shift.id.toString()}
                            >
                              {format(shift.date, 'MMM d')} (
                              {renderTimeSlot(shift.startTime)} -{' '}
                              {renderTimeSlot(shift.endTime)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="change-reason">Reason</Label>
                      <Textarea
                        id="change-reason"
                        placeholder="Provide a reason for your shift change request"
                        value={shiftChangeRequest.reason}
                        onChange={(e) =>
                          setShiftChangeRequest({
                            ...shiftChangeRequest,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsShiftChangeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleSubmitShiftChangeRequest}
                      disabled={
                        !shiftChangeRequest.shiftId ||
                        !shiftChangeRequest.reason.trim()
                      }
                    >
                      Submit Request
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog
                open={isUnavailabilityDialogOpen}
                onOpenChange={setIsUnavailabilityDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="w-full" variant="outline">
                    Mark Unavailable Time
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Mark Unavailable Time</DialogTitle>
                    <DialogDescription>
                      Indicate times when you are not available to work
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>Date Range</Label>
                      <div className="grid gap-2">
                        <div className="flex flex-col">
                          <Label className="mb-1 text-xs">Start Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'justify-start text-left font-normal',
                                  !unavailabilityPeriod.startDate &&
                                    'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {unavailabilityPeriod.startDate
                                  ? format(
                                      unavailabilityPeriod.startDate,
                                      'PPP'
                                    )
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={unavailabilityPeriod.startDate}
                                onSelect={(date) =>
                                  date &&
                                  setUnavailabilityPeriod({
                                    ...unavailabilityPeriod,
                                    startDate: date,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="flex flex-col">
                          <Label className="mb-1 text-xs">End Date</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  'justify-start text-left font-normal',
                                  !unavailabilityPeriod.endDate &&
                                    'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {unavailabilityPeriod.endDate
                                  ? format(unavailabilityPeriod.endDate, 'PPP')
                                  : 'Select date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={unavailabilityPeriod.endDate}
                                onSelect={(date) =>
                                  date &&
                                  setUnavailabilityPeriod({
                                    ...unavailabilityPeriod,
                                    endDate: date,
                                  })
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="all-day"
                        checked={unavailabilityPeriod.allDay}
                        onChange={(e) =>
                          setUnavailabilityPeriod({
                            ...unavailabilityPeriod,
                            allDay: e.target.checked,
                          })
                        }
                        className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                      />
                      <Label htmlFor="all-day">All Day</Label>
                    </div>

                    {!unavailabilityPeriod.allDay && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="start-time">Start Time</Label>
                          <Input
                            id="start-time"
                            type="time"
                            value={unavailabilityPeriod.startTime}
                            onChange={(e) =>
                              setUnavailabilityPeriod({
                                ...unavailabilityPeriod,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="end-time">End Time</Label>
                          <Input
                            id="end-time"
                            type="time"
                            value={unavailabilityPeriod.endTime}
                            onChange={(e) =>
                              setUnavailabilityPeriod({
                                ...unavailabilityPeriod,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid gap-2">
                      <Label htmlFor="unavail-reason">Reason (Optional)</Label>
                      <Textarea
                        id="unavail-reason"
                        placeholder="Provide a reason for your unavailability"
                        value={unavailabilityPeriod.reason}
                        onChange={(e) =>
                          setUnavailabilityPeriod({
                            ...unavailabilityPeriod,
                            reason: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsUnavailabilityDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={handleAddUnavailabilityPeriod}
                    >
                      Mark Unavailable
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Schedule</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <CalendarIcon className="h-4 w-4 -ml-1 mr-1" />
                <span>Prev</span>
              </Button>
              <span className="text-sm font-medium">{formatWeekRange()}</span>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <span>Next</span>
                <CalendarIcon className="h-4 w-4 ml-1 -mr-1" />
              </Button>
            </div>
          </div>
          <CardDescription>Your upcoming work shifts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-7">
            {weekDates.map((date, index) => (
              <div
                key={index}
                className={cn(
                  'border rounded-md p-3',
                  index === 0 || index === 6 ? 'bg-gray-50' : ''
                )}
              >
                <div className="font-medium text-sm">
                  {format(date, 'EEEE')}
                </div>
                <div className="text-xs text-muted-foreground mb-2">
                  {format(date, 'MMMM d')}
                </div>

                {getShiftsForDate(date).length > 0 ? (
                  <div className="space-y-2">
                    {getShiftsForDate(date).map((shift) => (
                      <div
                        key={shift.id}
                        className="text-xs p-2 rounded-md bg-orange-100 border border-orange-200"
                      >
                        <div className="font-medium text-orange-800">
                          {renderTimeSlot(shift.startTime)} -{' '}
                          {renderTimeSlot(shift.endTime)}
                        </div>
                        <div className="mt-1 flex items-center gap-1">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              backgroundColor: currentEmployee.roleColor,
                            }}
                          />
                          <span className="text-orange-700">
                            {currentEmployee.roleName}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-center py-4 text-muted-foreground">
                    No shifts scheduled
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="requests">
        <TabsList>
          <TabsTrigger value="requests">Your Requests</TabsTrigger>
          <TabsTrigger value="unavailable">Unavailable Times</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <Card>
            <CardHeader>
              <CardTitle>Your Requests</CardTitle>
              <CardDescription>
                Time-off and shift change requests you've submitted
              </CardDescription>
            </CardHeader>
            <CardContent>
              {requests.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No requests submitted
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-orange-500">
                              {request.type === 'time-off'
                                ? 'Time Off'
                                : 'Shift Change'}
                            </Badge>
                            <Badge
                              className={
                                request.status === 'approved'
                                  ? 'bg-green-500'
                                  : request.status === 'rejected'
                                    ? 'bg-red-500'
                                    : 'bg-yellow-500'
                              }
                            >
                              {request.status.charAt(0).toUpperCase() +
                                request.status.slice(1)}
                            </Badge>
                          </div>

                          {request.type === 'time-off' ? (
                            <div className="flex items-center gap-1 mt-2 text-sm">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  request.startDate ?? new Date(),
                                  'MMM d, yyyy'
                                )}
                                {request.startDate &&
                                  request.endDate &&
                                  request.startDate.getTime() !==
                                    request.endDate.getTime() &&
                                  ` - ${format(request.endDate, 'MMM d, yyyy')}`}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 mt-2 text-sm">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                Shift on{' '}
                                {request.shiftDate
                                  ? format(request.shiftDate, 'MMM d, yyyy')
                                  : 'N/A'}
                              </span>
                            </div>
                          )}

                          <p className="text-sm mt-2">{request.reason}</p>

                          {request.status === 'approved' &&
                            request.type === 'shift-change' && (
                              <p className="text-sm mt-2 text-green-600">
                                Replacement: {request.targetEmployeeName}
                              </p>
                            )}

                          {request.status === 'rejected' &&
                            request.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-50 text-sm rounded-md">
                                <span className="font-medium">
                                  Rejection reason:
                                </span>{' '}
                                {request.rejectionReason}
                              </div>
                            )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Submitted on{' '}
                          {format(request.requestDate, 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unavailable">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Your Unavailable Times</CardTitle>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={() => setIsUnavailabilityDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </Button>
              </div>
              <CardDescription>
                Times when you are not available to work
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unavailablePeriods.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  No unavailable times set
                </div>
              ) : (
                <div className="space-y-4">
                  {unavailablePeriods.map((period) => (
                    <div key={period.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">
                            {format(period.startDate, 'MMMM d, yyyy')}
                            {period.startDate.getTime() !==
                              period.endDate.getTime() &&
                              ` - ${format(period.endDate, 'MMMM d, yyyy')}`}
                          </h3>

                          <p className="text-sm text-muted-foreground">
                            {period.allDay
                              ? 'All day'
                              : `${renderTimeSlot(period.startTime || '')} - ${renderTimeSlot(period.endTime || '')}`}
                          </p>

                          {period.reason && (
                            <p className="text-sm mt-2">{period.reason}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
