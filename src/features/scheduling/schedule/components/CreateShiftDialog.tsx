/*
EXAMPLE USAGE:
"use client"
import { CreateShiftDialog } from "@/features/scheduling/schedule/components/CreateShiftDialog"
import type React from "react"
import { useState } from "react";

export default function Home() {

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-slate-800">Shift Management</h1>
        <p className="text-slate-600">Click the button below to create a new shift</p>
        <CreateShiftDialog isOpen={isOpen} onOpenChange={setIsOpen}/>
      </div>
    </div>
  )
}
*/

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRoles } from '@/services/api/v1/roles';
import { useCreateShift, ShiftRequestDto } from '@/services/api/v1/shifts';
import { RoleName } from '@/services/api/v1';
import { useCustomToast } from '@/lib/show-toast';

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
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day.id]: day.checked }), {} as Record<string, boolean>)
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
    setSelectedDays(daysOfWeek.reduce((acc, day) => ({ ...acc, [day.id]: day.checked }), {} as Record<string, boolean>));
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
      {/* <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Create Shift</Button>
      </DialogTrigger> */}
      <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-lg font-semibold text-slate-700">Create Shift</DialogTitle>
        </DialogHeader>

        <div className="max-h-[calc(90vh-120px)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Shift Name */}
            <div className="space-y-2">
              <Label htmlFor="shiftName" className="text-sm font-medium text-slate-600">
                Shift name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="shiftName"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="Enter shift name"
                className="bg-slate-50 border-slate-200"
                required
              />
            </div>

            {/* Time Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">
                  Start time <span className="text-red-500">*</span>
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
                    className="bg-slate-50 border-slate-200 w-20"
                  />
                  <span className="self-center">:</span>
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
                    className="bg-slate-50 border-slate-200 w-20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-600">End time</Label>
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
                    className="bg-slate-50 border-slate-200 w-20"
                  />
                  <span className="self-center">:</span>
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
                    className="bg-slate-50 border-slate-200 w-20"
                  />
                </div>
              </div>
            </div>

            {timeError && (
              <p className="text-sm text-red-500 mt-1">{timeError}</p>
            )}

            {/* Positions */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-slate-600">Positions</Label>
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

              <div className="space-y-3">
                {positions.map((position, index) => (
                  <div key={index} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Select
                        value={position.name}
                        onValueChange={(value) => handlePositionChange(index, "name", value)}
                        disabled={isLoadingRoles}
                      >
                        <SelectTrigger className="bg-slate-50 border-slate-200">
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
                                      className="w-2 h-2 rounded-full"
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
                      <Input
                        id={`quantity-${index}`}
                        type="number"
                        min="1"
                        value={position.quantity}
                        onChange={(e) => handlePositionChange(index, "quantity", Number.parseInt(e.target.value) || 1)}
                        className="bg-slate-50 border-slate-200 text-center"
                      />
                    </div>
                    {positions.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePosition(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Repeat */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium text-slate-600">Weekly repeat</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-slate-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select which days this shift repeats weekly</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={selectedDays[day.id]}
                      onCheckedChange={(checked) => handleDayChange(day.id, checked as boolean)}
                      className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <Label htmlFor={day.id} className="text-sm font-medium text-slate-600 cursor-pointer">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Submit Button - Outside scroll area */}
        <div className="px-6 py-4 border-t bg-white">
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
              disabled={isSubmitting}
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2">Creating</span>
                  <span className="animate-spin">⏳</span>
                </>
              ) : (
                'Create'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
