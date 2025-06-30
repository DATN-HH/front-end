"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRoles } from '@/api/v1/roles';
import { useCreateShift, ShiftRequestDto } from '@/api/v1/shifts';
import { RoleName } from '@/api/v1';
import { useCustomToast } from '@/lib/show-toast';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { DialogFooter } from "@/components/ui/dialog"

const daysOfWeek = [
  { id: 'MONDAY', label: 'Monday', checked: false },
  { id: 'TUESDAY', label: 'Tuesday', checked: false },
  { id: 'WEDNESDAY', label: 'Wednesday', checked: false },
  { id: 'THURSDAY', label: 'Thursday', checked: false },
  { id: 'FRIDAY', label: 'Friday', checked: false },
  { id: 'SATURDAY', label: 'Saturday', checked: false },
  { id: 'SUNDAY', label: 'Sunday', checked: false },
];

interface CreateShiftDialogProps {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => Promise<void> | void;
  onSubmit?: () => Promise<void> | void;
}

interface Position {
  name: string;
  quantity: number;
}

export function CreateShiftDialog({ isOpen, onOpenChange, onSubmit }: CreateShiftDialogProps) {
  const { user } = useAuth();
  const createShift = useCreateShift();
  const customToast = useCustomToast();
  const { data: rolesData, isLoading: isLoadingRoles } = useRoles({ status: 'ACTIVE' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shiftName, setShiftName] = useState("");
  const [startHour, setStartHour] = useState("08");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("17");
  const [endMinute, setEndMinute] = useState("30");
  const [positions, setPositions] = useState<Position[]>([{ name: "", quantity: 1 }]);
  const [selectedDays, setSelectedDays] = useState(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day.id]: false }), {} as Record<string, boolean>)
  );
  const [timeError, setTimeError] = useState<string | null>(null);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) resetState();
  }, [isOpen]);

  const resetState = () => {
    setShiftName("");
    setStartHour("08");
    setStartMinute("00");
    setEndHour("17");
    setEndMinute("30");
    setPositions([{ name: "", quantity: 1 }]);
    setSelectedDays(daysOfWeek.reduce((acc, day) => ({ ...acc, [day.id]: false }), {} as Record<string, boolean>));
    setTimeError(null);
    setIsSubmitting(false);
  };

  const handleClose = async () => {
    try {
      if (onOpenChange) {
        await Promise.resolve(onOpenChange(false));
      }
      resetState();
    } catch (error) {
      console.error('Error in onOpenChange:', error);
    }
  };

  const handleDayChange = (dayId: string, checked: boolean) => {
    setSelectedDays(prev => ({ ...prev, [dayId]: checked }));
  };

  const handleSelectAllDays = () => {
    const allSelected = daysOfWeek.every(day => selectedDays[day.id]);
    const newState = daysOfWeek.reduce((acc, day) => ({ ...acc, [day.id]: !allSelected }), {} as Record<string, boolean>);
    setSelectedDays(newState);
  };

  const isAllDaysSelected = daysOfWeek.every(day => selectedDays[day.id]);
  const isSomeDaysSelected = daysOfWeek.some(day => selectedDays[day.id]);

  const handlePositionChange = (index: number, field: keyof Position, value: string | number) => {
    setPositions(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPosition = () => {
    if (positions.some(p => !p.name)) {
      customToast.error("Validation Error", "Please fill in all positions before adding a new one");
      return;
    }
    setPositions(prev => [...prev, { name: "", quantity: 1 }]);
  };

  const removePosition = (index: number) => {
    setPositions(prev => prev.filter((_, i) => i !== index));
  };

  const validateTime = (hour: string, minute: string): boolean => {
    const h = parseInt(hour);
    const m = parseInt(minute);
    return !isNaN(h) && h >= 0 && h <= 23 && !isNaN(m) && m >= 0 && m <= 59;
  };

  const validateTimeRange = (startH: string, startM: string, endH: string, endM: string): boolean => {
    if (!validateTime(startH, startM) || !validateTime(endH, endM)) {
      setTimeError("Please enter valid time values");
      return false;
    }

    const start = parseInt(startH) * 60 + parseInt(startM);
    const end = parseInt(endH) * 60 + parseInt(endM);

    if (start >= end) {
      setTimeError("End time must be after start time");
      return false;
    }

    setTimeError(null);
    return true;
  };

  const formatTime = (hour: string, minute: string): string => {
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  };

  const handleSubmit = async () => {
    // Validate time
    if (!validateTimeRange(startHour, startMinute, endHour, endMinute)) {
      customToast.error("Validation Error", timeError || 'Invalid time range');
      return;
    }

    // Validate days
    const selectedDaysList = Object.entries(selectedDays)
      .filter(([_, checked]) => checked)
      .map(([day]) => day.toUpperCase().slice(0, 3) as ShiftRequestDto['weekDays'][number]);

    if (selectedDaysList.length === 0) {
      customToast.error("Validation Error", "Please select at least one day");
      return;
    }

    // Validate positions
    if (positions.length === 0) {
      customToast.error("Validation Error", "Please add at least one position");
      return;
    }

    if (positions.some(p => !p.name)) {
      customToast.error("Validation Error", "Please fill in all positions");
      return;
    }

    // Validate name
    if (!shiftName.trim()) {
      customToast.error("Validation Error", "Please enter a shift name");
      return;
    }

    if (!user?.branch?.id) {
      customToast.error("Error", "Branch ID is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const shiftData: ShiftRequestDto = {
        name: shiftName,
        startTime: formatTime(startHour, startMinute),
        endTime: formatTime(endHour, endMinute),
        weekDays: selectedDaysList,
        branchId: user.branch.id,
        requirements: positions.map(p => ({
          role: p.name as RoleName,
          quantity: p.quantity
        }))
      };

      await createShift.mutateAsync(shiftData);
      customToast.success("Success", "Shift created successfully");

      // Call onSubmit prop if provided
      if (onSubmit) {
        await Promise.resolve(onSubmit());
      }

      // Reset state and close dialog
      resetState();
      if (onOpenChange) {
        await Promise.resolve(onOpenChange(false));
      }
    } catch (error) {
      customToast.error("Error", "Failed to create shift: " + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleColor = (roleName: string) => {
    return rolesData?.data?.find(role => role.name === roleName)?.hexColor || '#000000';
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={async (open) => {
        if (!open) {
          await handleClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-6">
          <DialogTitle className="flex items-center gap-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create Shift</h1>
              <p className="text-base text-muted-foreground mt-1">
                Set up a new shift with time and position requirements
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 py-6">
          {/* Basic Info */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader className="pb-0">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 rounded-lg">
              <div className="space-y-3">
                <Label htmlFor="shiftName" className="text-sm font-medium text-foreground">
                  Shift Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="shiftName"
                  value={shiftName}
                  onChange={(e) => setShiftName(e.target.value)}
                  placeholder="Enter shift name"
                  className="h-11 bg-white "
                  required
/>
              </div>
            </CardContent>
          </Card>

          {/* Time Settings */}
          <Card className="border-2 border-secondary/50 bg-secondary/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                Time Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 bg-card rounded-lg">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">
                    Start Time <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="startHour"
                      type="number"
                      min="0"
                      max="23"
                      value={startHour}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                          setStartHour(value);
                          validateTimeRange(value, startMinute, endHour, endMinute);
                        }
                      }}
                      placeholder="HH"
                      className="w-20 h-11"
                    />
                    <span className="self-center text-muted-foreground">:</span>
                    <Input
                      id="startMinute"
                      type="number"
                      min="0"
                      max="59"
                      value={startMinute}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                          setStartMinute(value);
                          validateTimeRange(startHour, value, endHour, endMinute);
                        }
                      }}
                      placeholder="MM"
                      className="w-20 h-11"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-foreground">End Time</Label>
                  <div className="flex gap-2">
                    <Input
                      id="endHour"
                      type="number"
                      min="0"
                      max="23"
                      value={endHour}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 23)) {
                          setEndHour(value);
                          validateTimeRange(startHour, startMinute, value, endMinute);
                        }
                      }}
                      placeholder="HH"
                      className="w-20 h-11"
                    />
                    <span className="self-center text-muted-foreground">:</span>
                    <Input
                      id="endMinute"
                      type="number"
                      min="0"
                      max="59"
                      value={endMinute}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 59)) {
                          setEndMinute(value);
                          validateTimeRange(startHour, startMinute, endHour, value);
                        }
                      }}
                      placeholder="MM"
                      className="w-20 h-11"
                    />
                  </div>
                </div>
              </div>

              {timeError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-sm text-destructive">{timeError}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Positions */}
          <Card className="border-2 border-accent/50 bg-accent/10">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                Position Requirements
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Define the roles and quantities needed for this shift
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-card rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Positions</Label>
                <Button
                  type="button"
                  onClick={addPosition}
                  variant="outline"
                  size="sm"
                  className="text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Add Position
                </Button>
              </div>

              <div className="space-y-4">
                {positions.map((position, index) => (
                  <div key={index} className="flex gap-3 items-end p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <Label className="text-xs text-muted-foreground mb-1 block">Role</Label>
                      <Select
                        value={position.name}
                        onValueChange={(value) => handlePositionChange(index, "name", value)}
                        disabled={isLoadingRoles}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder={isLoadingRoles ? "Loading roles..." : "Select position"} />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingRoles ? (
                            <SelectItem value="loading" disabled>
                              Loading roles...
                            </SelectItem>
                          ) : (
                            rolesData?.data
                              .filter(role => role.status === 'ACTIVE')
                              .map((role) => (
                                <SelectItem
                                  key={role.name}
                                  value={role.name}
                                  disabled={positions.some(p => p.name === role.name && p !== position)}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: getRoleColor(role.name) }}
                                    />
                                    {role.name}
                                  </div>
                                </SelectItem>
                              ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Label className="text-xs text-muted-foreground mb-1 block">Quantity</Label>
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={position.quantity}
                        onChange={(e) => handlePositionChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        className="h-11 text-center"
                      />
                    </div>
                    {positions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePosition(index)}
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-11"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Working Days */}
          <Card className="border-2 border-muted bg-muted/30">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted-foreground text-background">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                Working Days
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Select which days this shift will be active
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 bg-card rounded-lg">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-foreground">Select Days</Label>
                <Button
                  type="button"
                  onClick={handleSelectAllDays}
                  variant="outline"
                  size="sm"
                  className={`text-xs px-3 py-1 h-8 ${isAllDaysSelected
                    ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                    : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                    }`}
                >
                  {isAllDaysSelected ? 'Deselect All' : 'Full Week'}
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2 p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      id={day.id}
                      checked={selectedDays[day.id]}
                      onCheckedChange={(checked) => handleDayChange(day.id, !!checked)}
                    />
                    <Label
                      htmlFor={day.id}
                      className="text-sm font-normal text-foreground cursor-pointer flex-1"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </form>

        <DialogFooter className="border-t pt-6 bg-muted/30">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-8 h-11"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 h-11 font-medium"
            >
              {isSubmitting ? "Creating..." : "Create Shift"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
