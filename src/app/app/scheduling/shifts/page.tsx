'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Plus, Trash, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Sample data for job roles
const jobRoles = [
  { id: 1, name: 'Head Chef', color: '#FF5733' },
  { id: 2, name: 'Sous Chef', color: '#33FF57' },
  { id: 3, name: 'Waiter', color: '#3357FF' },
  { id: 4, name: 'Bartender', color: '#F033FF' },
  { id: 5, name: 'Host/Hostess', color: '#FF33A8' },
];

// Sample data for shifts
const initialShifts = [
  {
    id: 1,
    date: new Date(2025, 4, 5), // May 5, 2025
    startTime: '09:00',
    endTime: '17:00',
    status: 'draft', // draft or published
    roleRequirements: [
      { roleId: 1, count: 1 },
      { roleId: 2, count: 2 },
      { roleId: 3, count: 4 },
    ],
    notes: 'Regular Monday shift',
  },
  {
    id: 2,
    date: new Date(2025, 4, 6), // May 6, 2025
    startTime: '09:00',
    endTime: '17:00',
    status: 'draft',
    roleRequirements: [
      { roleId: 1, count: 1 },
      { roleId: 2, count: 2 },
      { roleId: 3, count: 4 },
    ],
    notes: 'Regular Tuesday shift',
  },
  {
    id: 3,
    date: new Date(2025, 4, 7), // May 7, 2025
    startTime: '09:00',
    endTime: '17:00',
    status: 'published',
    roleRequirements: [
      { roleId: 1, count: 1 },
      { roleId: 2, count: 2 },
      { roleId: 3, count: 4 },
    ],
    notes: 'Regular Wednesday shift',
  },
];

export default function WorkShiftsPage() {
  const [shifts, setShifts] = useState(initialShifts);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<any>(null);
  const [newShift, setNewShift] = useState({
    date: new Date(),
    startTime: '09:00',
    endTime: '17:00',
    roleRequirements: [] as { roleId: number; count: number }[],
    notes: '',
  });
  const [copyToDate, setCopyToDate] = useState<Date | undefined>(new Date());
  const [selectedShifts, setSelectedShifts] = useState<number[]>([]);

  // Add a role requirement
  const addRoleRequirement = (roleId: number, shift: any, setShift: any) => {
    if (!shift.roleRequirements.some((r: any) => r.roleId === roleId)) {
      setShift({
        ...shift,
        roleRequirements: [...shift.roleRequirements, { roleId, count: 1 }],
      });
    }
  };

  // Remove a role requirement
  const removeRoleRequirement = (roleId: number, shift: any, setShift: any) => {
    setShift({
      ...shift,
      roleRequirements: shift.roleRequirements.filter(
        (r: any) => r.roleId !== roleId
      ),
    });
  };

  // Update count for a role requirement
  const updateRoleCount = (
    roleId: number,
    count: number,
    shift: any,
    setShift: any
  ) => {
    setShift({
      ...shift,
      roleRequirements: shift.roleRequirements.map((r: any) =>
        r.roleId === roleId ? { ...r, count } : r
      ),
    });
  };

  // Get role name by ID
  const getRoleName = (roleId: number) => {
    return jobRoles.find((r) => r.id === roleId)?.name || '';
  };

  // Get role color by ID
  const getRoleColor = (roleId: number) => {
    return jobRoles.find((r) => r.id === roleId)?.color || '#000000';
  };

  // Create a new shift
  const handleCreateShift = () => {
    const id = Math.max(0, ...shifts.map((s) => s.id)) + 1;
    setShifts([...shifts, { id, ...newShift, status: 'draft' }]);
    setNewShift({
      date: new Date(),
      startTime: '09:00',
      endTime: '17:00',
      roleRequirements: [],
      notes: '',
    });
    setIsCreateDialogOpen(false);
  };

  // Edit an existing shift
  const handleEditShift = () => {
    setShifts(
      shifts.map((shift) =>
        shift.id === currentShift.id ? currentShift : shift
      )
    );
    setIsEditDialogOpen(false);
  };

  // Delete a shift
  const handleDeleteShift = () => {
    setShifts(shifts.filter((shift) => shift.id !== currentShift.id));
    setIsDeleteDialogOpen(false);
  };

  // Copy a shift to another date
  const handleCopyShift = () => {
    if (!copyToDate) return;

    const id = Math.max(0, ...shifts.map((s) => s.id)) + 1;
    const newShiftCopy = {
      ...currentShift,
      id,
      date: copyToDate,
      status: 'draft',
    };
    setShifts([...shifts, newShiftCopy]);
    setIsCopyDialogOpen(false);
  };

  // Publish selected shifts
  const handlePublishShifts = () => {
    setShifts(
      shifts.map((shift) => {
        if (selectedShifts.includes(shift.id)) {
          return { ...shift, status: 'published' };
        }
        return shift;
      })
    );
    setSelectedShifts([]);
    setIsPublishDialogOpen(false);
  };

  // Toggle shift selection
  const toggleShiftSelection = (shiftId: number) => {
    if (selectedShifts.includes(shiftId)) {
      setSelectedShifts(selectedShifts.filter((id) => id !== shiftId));
    } else {
      setSelectedShifts([...selectedShifts, shiftId]);
    }
  };

  // Copy week to next week
  const handleCopyWeekToNext = () => {
    const nextWeekShifts = shifts
      .filter((shift) => {
        const shiftDate = new Date(shift.date);
        const currentWeekStart = new Date(2025, 4, 5); // May 5, 2025 (Monday)
        const currentWeekEnd = new Date(2025, 4, 11); // May 11, 2025 (Sunday)
        return shiftDate >= currentWeekStart && shiftDate <= currentWeekEnd;
      })
      .map((shift) => {
        const shiftDate = new Date(shift.date);
        const nextWeekDate = new Date(shiftDate);
        nextWeekDate.setDate(nextWeekDate.getDate() + 7);

        const id =
          Math.max(0, ...shifts.map((s) => s.id)) + 1 + Math.random() * 1000;

        return {
          ...shift,
          id,
          date: nextWeekDate,
          status: 'draft',
        };
      });

    setShifts([...shifts, ...nextWeekShifts]);
  };

  // Filter shifts by week
  const thisWeekShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);
    const currentWeekStart = new Date(2025, 4, 5); // May 5, 2025 (Monday)
    const currentWeekEnd = new Date(2025, 4, 11); // May 11, 2025 (Sunday)
    return shiftDate >= currentWeekStart && shiftDate <= currentWeekEnd;
  });

  const nextWeekShifts = shifts.filter((shift) => {
    const shiftDate = new Date(shift.date);
    const nextWeekStart = new Date(2025, 4, 12); // May 12, 2025 (Monday)
    const nextWeekEnd = new Date(2025, 4, 18); // May 18, 2025 (Sunday)
    return shiftDate >= nextWeekStart && shiftDate <= nextWeekEnd;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Work Shifts</h1>
        <p className="text-muted-foreground">
          Create and manage work shifts for your restaurant
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {selectedShifts.length > 0 && (
            <Button
              variant="outline"
              className="text-orange-500 border-orange-500"
              onClick={() => setIsPublishDialogOpen(true)}
            >
              <Check className="mr-2 h-4 w-4" />
              Publish Selected ({selectedShifts.length})
            </Button>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyWeekToNext}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Week to Next
          </Button>

          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Work Shift</DialogTitle>
                <DialogDescription>
                  Define a new work shift with required roles and staff count
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'justify-start text-left font-normal',
                          !newShift.date && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newShift.date
                          ? format(newShift.date, 'PPP')
                          : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newShift.date}
                        onSelect={(date) =>
                          setNewShift({ ...newShift, date: date || new Date() })
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-time">Start Time</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="start-time"
                        type="time"
                        value={newShift.startTime}
                        onChange={(e) =>
                          setNewShift({
                            ...newShift,
                            startTime: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-time">End Time</Label>
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="end-time"
                        type="time"
                        value={newShift.endTime}
                        onChange={(e) =>
                          setNewShift({ ...newShift, endTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Staff Requirements</Label>
                  <div className="border rounded-md p-4">
                    <div className="space-y-3">
                      {newShift.roleRequirements.map((req) => (
                        <div
                          key={req.roleId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{
                                backgroundColor: getRoleColor(req.roleId),
                              }}
                            />
                            <span>{getRoleName(req.roleId)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              className="w-16"
                              value={req.count}
                              onChange={(e) =>
                                updateRoleCount(
                                  req.roleId,
                                  Number.parseInt(e.target.value) || 1,
                                  newShift,
                                  setNewShift
                                )
                              }
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                removeRoleRequirement(
                                  req.roleId,
                                  newShift,
                                  setNewShift
                                )
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {newShift.roleRequirements.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-2">
                          No roles added yet
                        </p>
                      )}

                      <div className="pt-2">
                        <Select
                          onValueChange={(value) =>
                            addRoleRequirement(
                              Number.parseInt(value),
                              newShift,
                              setNewShift
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Add role requirement" />
                          </SelectTrigger>
                          <SelectContent>
                            {jobRoles
                              .filter(
                                (role) =>
                                  !newShift.roleRequirements.some(
                                    (r) => r.roleId === role.id
                                  )
                              )
                              .map((role) => (
                                <SelectItem
                                  key={role.id}
                                  value={role.id.toString()}
                                >
                                  {role.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any additional information about this shift"
                    value={newShift.notes}
                    onChange={(e) =>
                      setNewShift({ ...newShift, notes: e.target.value })
                    }
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleCreateShift}
                  disabled={
                    !newShift.date || newShift.roleRequirements.length === 0
                  }
                >
                  Create Shift
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="this-week">
        <TabsList>
          <TabsTrigger value="this-week">This Week (May 5 - 11)</TabsTrigger>
          <TabsTrigger value="next-week">Next Week (May 12 - 18)</TabsTrigger>
        </TabsList>

        <TabsContent value="this-week">
          <div className="grid gap-4">
            {thisWeekShifts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    No shifts created yet for this week
                  </p>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Shift
                  </Button>
                </CardContent>
              </Card>
            ) : (
              thisWeekShifts.map((shift) => (
                <Card
                  key={shift.id}
                  className={cn(
                    'border',
                    selectedShifts.includes(shift.id) && 'border-orange-500',
                    shift.status === 'published' && 'bg-gray-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={selectedShifts.includes(shift.id)}
                          onChange={() => toggleShiftSelection(shift.id)}
                          disabled={shift.status === 'published'}
                        />
                        <div>
                          <h3 className="font-medium">
                            {format(new Date(shift.date), 'EEEE, MMMM d')}
                            {shift.status === 'published' && (
                              <Badge className="ml-2 bg-green-500">
                                Published
                              </Badge>
                            )}
                            {shift.status === 'draft' && (
                              <Badge className="ml-2 bg-gray-500">Draft</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {shift.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentShift(shift);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentShift(shift);
                            setIsCopyDialogOpen(true);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {shift.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                              setCurrentShift(shift);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {shift.roleRequirements.map((req) => (
                        <div
                          key={req.roleId}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getRoleColor(req.roleId),
                            }}
                          />
                          <span className="text-sm">
                            {getRoleName(req.roleId)}: {req.count}
                          </span>
                        </div>
                      ))}
                      {shift.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p className="font-medium">Notes:</p>
                          <p>{shift.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="next-week">
          <div className="grid gap-4">
            {nextWeekShifts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 text-center">
                  <p className="text-muted-foreground mb-4">
                    No shifts created yet for next week
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleCopyWeekToNext}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy This Week to Next
                    </Button>
                    <Button
                      className="bg-orange-500 hover:bg-orange-600"
                      onClick={() => setIsCreateDialogOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create Shift
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              nextWeekShifts.map((shift) => (
                <Card
                  key={shift.id}
                  className={cn(
                    'border',
                    selectedShifts.includes(shift.id) && 'border-orange-500',
                    shift.status === 'published' && 'bg-gray-50'
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                          checked={selectedShifts.includes(shift.id)}
                          onChange={() => toggleShiftSelection(shift.id)}
                          disabled={shift.status === 'published'}
                        />
                        <div>
                          <h3 className="font-medium">
                            {format(new Date(shift.date), 'EEEE, MMMM d')}
                            {shift.status === 'published' && (
                              <Badge className="ml-2 bg-green-500">
                                Published
                              </Badge>
                            )}
                            {shift.status === 'draft' && (
                              <Badge className="ml-2 bg-gray-500">Draft</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {shift.startTime} - {shift.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {shift.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCurrentShift(shift);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCurrentShift(shift);
                            setIsCopyDialogOpen(true);
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        {shift.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                              setCurrentShift(shift);
                              setIsDeleteDialogOpen(true);
                            }}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mt-4">
                      {shift.roleRequirements.map((req) => (
                        <div
                          key={req.roleId}
                          className="flex items-center gap-2"
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getRoleColor(req.roleId),
                            }}
                          />
                          <span className="text-sm">
                            {getRoleName(req.roleId)}: {req.count}
                          </span>
                        </div>
                      ))}
                      {shift.notes && (
                        <div className="mt-2 text-sm text-muted-foreground">
                          <p className="font-medium">Notes:</p>
                          <p>{shift.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Shift Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Work Shift</DialogTitle>
            <DialogDescription>
              Update the details of this work shift
            </DialogDescription>
          </DialogHeader>
          {currentShift && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(currentShift.date), 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(currentShift.date)}
                      onSelect={(date) =>
                        setCurrentShift({
                          ...currentShift,
                          date: date || new Date(),
                        })
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-start-time">Start Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-start-time"
                      type="time"
                      value={currentShift.startTime}
                      onChange={(e) =>
                        setCurrentShift({
                          ...currentShift,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-end-time">End Time</Label>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="edit-end-time"
                      type="time"
                      value={currentShift.endTime}
                      onChange={(e) =>
                        setCurrentShift({
                          ...currentShift,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Staff Requirements</Label>
                <div className="border rounded-md p-4">
                  <div className="space-y-3">
                    {currentShift.roleRequirements.map((req: any) => (
                      <div
                        key={req.roleId}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: getRoleColor(req.roleId),
                            }}
                          />
                          <span>{getRoleName(req.roleId)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            className="w-16"
                            value={req.count}
                            onChange={(e) =>
                              updateRoleCount(
                                req.roleId,
                                Number.parseInt(e.target.value) || 1,
                                currentShift,
                                setCurrentShift
                              )
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              removeRoleRequirement(
                                req.roleId,
                                currentShift,
                                setCurrentShift
                              )
                            }
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}

                    {currentShift.roleRequirements.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-2">
                        No roles added yet
                      </p>
                    )}

                    <div className="pt-2">
                      <Select
                        onValueChange={(value) =>
                          addRoleRequirement(
                            Number.parseInt(value),
                            currentShift,
                            setCurrentShift
                          )
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add role requirement" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobRoles
                            .filter(
                              (role) =>
                                !currentShift.roleRequirements.some(
                                  (r: any) => r.roleId === role.id
                                )
                            )
                            .map((role) => (
                              <SelectItem
                                key={role.id}
                                value={role.id.toString()}
                              >
                                {role.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-notes">Notes (Optional)</Label>
                <Textarea
                  id="edit-notes"
                  placeholder="Add any additional information about this shift"
                  value={currentShift.notes}
                  onChange={(e) =>
                    setCurrentShift({ ...currentShift, notes: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleEditShift}
              disabled={
                !currentShift?.date ||
                currentShift?.roleRequirements.length === 0
              }
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Shift Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Work Shift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this work shift? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {currentShift && (
            <div className="py-4">
              <p className="font-medium">
                {format(new Date(currentShift.date), 'EEEE, MMMM d')}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentShift.startTime} - {currentShift.endTime}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShift}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Shift Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy Work Shift</DialogTitle>
            <DialogDescription>
              Copy this shift to another date with the same time and staff
              requirements
            </DialogDescription>
          </DialogHeader>
          {currentShift && (
            <div className="py-4">
              <p className="font-medium">
                Original shift:{' '}
                {format(new Date(currentShift.date), 'EEEE, MMMM d')}
              </p>
              <p className="text-sm text-muted-foreground">
                {currentShift.startTime} - {currentShift.endTime}
              </p>

              <div className="mt-4">
                <Label>Copy to date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal mt-2',
                        !copyToDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {copyToDate ? format(copyToDate, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={copyToDate}
                      onSelect={setCopyToDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCopyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handleCopyShift}
              disabled={!copyToDate}
            >
              Copy Shift
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Publish Shifts Dialog */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publish Shifts</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish the selected shifts? This will
              make them visible to employees.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">
              You are about to publish {selectedShifts.length} shifts
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Published shifts will be visible to employees and notifications
              will be sent.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPublishDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-orange-500 hover:bg-orange-600"
              onClick={handlePublishShifts}
            >
              Publish Shifts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
