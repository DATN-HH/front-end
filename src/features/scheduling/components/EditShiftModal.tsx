'use client';

import type React from 'react';
import { useState, useEffect } from 'react';

import { LocalTime, RoleName } from '@/api/v1';
import { useRoles } from '@/api/v1/roles';
import { ShiftResponseDto, ShiftRequestDto } from '@/api/v1/shifts';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

interface EditShiftModalProps {
    isOpen: boolean;
    onOpenChange?: (open: boolean) => Promise<void> | void;
    shift: ShiftResponseDto | null;
    onSubmit?: (updatedShift: ShiftResponseDto) => Promise<void> | void;
    isLoading?: boolean;
}

interface Position {
    name: string;
    quantity: number;
}

export function EditShiftModal({
    isOpen,
    onOpenChange,
    shift,
    onSubmit,
    isLoading = false,
}: EditShiftModalProps) {
    const customToast = useCustomToast();
    const { data: rolesData, isLoading: isLoadingRoles } = useRoles({
        status: 'ACTIVE',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shiftName, setShiftName] = useState('');
    const [startHour, setStartHour] = useState('08');
    const [startMinute, setStartMinute] = useState('00');
    const [endHour, setEndHour] = useState('17');
    const [endMinute, setEndMinute] = useState('30');
    const [positions, setPositions] = useState<Position[]>([
        { name: '', quantity: 1 },
    ]);
    const [selectedDays, setSelectedDays] = useState(
        daysOfWeek.reduce(
            (acc, day) => ({ ...acc, [day.id]: day.checked }),
            {} as Record<string, boolean>
        )
    );
    const [timeError, setTimeError] = useState<string | null>(null);

    // Reset and populate state when dialog opens with shift data
    useEffect(() => {
        if (isOpen && shift) {
            setShiftName(shift.name);

            // Parse time - handle both string and object formats
            const parseTime = (time: any) => {
                if (typeof time === 'string') {
                    const [hour, minute] = time.split(':');
                    return { hour: hour || '00', minute: minute || '00' };
                } else if (time && typeof time === 'object') {
                    return {
                        hour: time.hour?.toString().padStart(2, '0') || '00',
                        minute:
                            time.minute?.toString().padStart(2, '0') || '00',
                    };
                }
                return { hour: '00', minute: '00' };
            };

            const startTime = parseTime(shift.startTime);
            const endTime = parseTime(shift.endTime);

            setStartHour(startTime.hour);
            setStartMinute(startTime.minute);
            setEndHour(endTime.hour);
            setEndMinute(endTime.minute);

            // Set positions
            if (shift.requirements) {
                setPositions(
                    shift.requirements.map((req) => ({
                        name: req.role,
                        quantity: req.quantity,
                    }))
                );
            }

            // Set selected days
            const dayMapping: Record<string, string> = {
                MON: 'MONDAY',
                TUE: 'TUESDAY',
                WED: 'WEDNESDAY',
                THU: 'THURSDAY',
                FRI: 'FRIDAY',
                SAT: 'SATURDAY',
                SUN: 'SUNDAY',
            };

            const newSelectedDays = daysOfWeek.reduce(
                (acc, day) => ({ ...acc, [day.id]: false }),
                {} as Record<string, boolean>
            );
            shift.weekDays.forEach((day) => {
                const fullDayName = dayMapping[day] || day;
                if (newSelectedDays.hasOwnProperty(fullDayName)) {
                    newSelectedDays[fullDayName] = true;
                }
            });
            setSelectedDays(newSelectedDays);

            setTimeError(null);
        } else if (!isOpen) {
            resetState();
        }
    }, [isOpen, shift]);

    const resetState = () => {
        setShiftName('');
        setStartHour('08');
        setStartMinute('00');
        setEndHour('17');
        setEndMinute('30');
        setPositions([{ name: '', quantity: 1 }]);
        setSelectedDays(
            daysOfWeek.reduce(
                (acc, day) => ({ ...acc, [day.id]: day.checked }),
                {} as Record<string, boolean>
            )
        );
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
        setSelectedDays((prev) => ({ ...prev, [dayId]: checked }));
    };

    const handleSelectAllDays = () => {
        const allSelected = daysOfWeek.every((day) => selectedDays[day.id]);
        const newState = daysOfWeek.reduce(
            (acc, day) => ({ ...acc, [day.id]: !allSelected }),
            {} as Record<string, boolean>
        );
        setSelectedDays(newState);
    };

    const isAllDaysSelected = daysOfWeek.every((day) => selectedDays[day.id]);

    const handlePositionChange = (
        index: number,
        field: keyof Position,
        value: string | number
    ) => {
        setPositions((prev) =>
            prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
        );
    };

    const addPosition = () => {
        if (positions.some((p) => !p.name)) {
            customToast.error(
                'Validation Error',
                'Please fill in all positions before adding a new one'
            );
            return;
        }
        setPositions((prev) => [...prev, { name: '', quantity: 1 }]);
    };

    const removePosition = (index: number) => {
        setPositions((prev) => prev.filter((_, i) => i !== index));
    };

    const validateTime = (hour: string, minute: string): boolean => {
        const h = parseInt(hour);
        const m = parseInt(minute);
        return !isNaN(h) && h >= 0 && h <= 23 && !isNaN(m) && m >= 0 && m <= 59;
    };

    const validateTimeRange = (
        startH: string,
        startM: string,
        endH: string,
        endM: string
    ): boolean => {
        if (!validateTime(startH, startM) || !validateTime(endH, endM)) {
            setTimeError('Please enter valid time values');
            return false;
        }

        const start = parseInt(startH) * 60 + parseInt(startM);
        const end = parseInt(endH) * 60 + parseInt(endM);

        if (start >= end) {
            setTimeError('End time must be after start time');
            return false;
        }

        setTimeError(null);
        return true;
    };

    const formatTime = (hour: string, minute: string): string => {
        return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!shift) return;

        // Validate time
        if (!validateTimeRange(startHour, startMinute, endHour, endMinute)) {
            customToast.error(
                'Validation Error',
                timeError || 'Invalid time range'
            );
            return;
        }

        // Validate days
        const selectedDaysList = Object.entries(selectedDays)
            .filter(([_, checked]) => checked)
            .map(
                ([day]) =>
                    day
                        .toUpperCase()
                        .slice(0, 3) as ShiftRequestDto['weekDays'][number]
            );

        if (selectedDaysList.length === 0) {
            customToast.error(
                'Validation Error',
                'Please select at least one day'
            );
            return;
        }

        // Validate positions
        if (positions.length === 0) {
            customToast.error(
                'Validation Error',
                'Please add at least one position'
            );
            return;
        }

        if (positions.some((p) => !p.name)) {
            customToast.error(
                'Validation Error',
                'Please fill in all positions'
            );
            return;
        }

        // Validate name
        if (!shiftName.trim()) {
            customToast.error('Validation Error', 'Please enter a shift name');
            return;
        }

        setIsSubmitting(true);
        try {
            const updatedShift: ShiftResponseDto = {
                ...shift,
                name: shiftName,
                startTime: formatTime(
                    startHour,
                    startMinute
                ) as unknown as LocalTime,
                endTime: formatTime(endHour, endMinute) as unknown as LocalTime,
                weekDays: selectedDaysList,
                requirements: positions.map((p) => ({
                    role: p.name as RoleName,
                    quantity: p.quantity,
                })),
            };

            if (onSubmit) {
                await Promise.resolve(onSubmit(updatedShift));
            }

            customToast.success('Success', 'Shift updated successfully');
            resetState();
            if (onOpenChange) {
                await Promise.resolve(onOpenChange(false));
            }
        } catch (error) {
            customToast.error(
                'Error',
                `Failed to update shift: ${(error as Error).message}`
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">
                                Edit Shift
                            </h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Modify shift details and requirements
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-8 py-6">
                    {/* Basic Info */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <svg
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                Basic Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 bg-card rounded-lg">
                            <div className="space-y-3">
                                <Label
                                    htmlFor="shiftName"
                                    className="text-sm font-medium text-foreground"
                                >
                                    Shift Name *
                                </Label>
                                <Input
                                    id="shiftName"
                                    type="text"
                                    value={shiftName}
                                    onChange={(e) =>
                                        setShiftName(e.target.value)
                                    }
                                    placeholder="Enter shift name"
                                    className="h-11"
                                    required
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Time Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                                Start time{' '}
                                <span className="text-destructive">*</span>
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
                                        if (
                                            value === '' ||
                                            (parseInt(value) >= 0 &&
                                                parseInt(value) <= 23)
                                        ) {
                                            setStartHour(value);
                                            validateTimeRange(
                                                value,
                                                startMinute,
                                                endHour,
                                                endMinute
                                            );
                                        }
                                    }}
                                    placeholder="HH"
                                    className="bg-muted/30 border-border w-20"
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
                                        if (
                                            value === '' ||
                                            (parseInt(value) >= 0 &&
                                                parseInt(value) <= 59)
                                        ) {
                                            setStartMinute(value);
                                            validateTimeRange(
                                                startHour,
                                                value,
                                                endHour,
                                                endMinute
                                            );
                                        }
                                    }}
                                    placeholder="MM"
                                    className="bg-muted/30 border-border w-20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-foreground">
                                End time
                            </Label>
                            <div className="flex gap-2">
                                <Input
                                    id="endHour"
                                    type="number"
                                    min="0"
                                    max="23"
                                    value={endHour}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (
                                            value === '' ||
                                            (parseInt(value) >= 0 &&
                                                parseInt(value) <= 23)
                                        ) {
                                            setEndHour(value);
                                            validateTimeRange(
                                                startHour,
                                                startMinute,
                                                value,
                                                endMinute
                                            );
                                        }
                                    }}
                                    placeholder="HH"
                                    className="bg-muted/30 border-border w-20"
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
                                        if (
                                            value === '' ||
                                            (parseInt(value) >= 0 &&
                                                parseInt(value) <= 59)
                                        ) {
                                            setEndMinute(value);
                                            validateTimeRange(
                                                startHour,
                                                startMinute,
                                                endHour,
                                                value
                                            );
                                        }
                                    }}
                                    placeholder="MM"
                                    className="bg-muted/30 border-border w-20"
                                />
                            </div>
                        </div>
                    </div>

                    {timeError && (
                        <p className="text-sm text-destructive mt-1">
                            {timeError}
                        </p>
                    )}

                    {/* Positions */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground">
                                Positions
                            </Label>
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
                                <div
                                    key={index}
                                    className="flex gap-3 items-end"
                                >
                                    <div className="flex-1">
                                        <Select
                                            value={position.name}
                                            onValueChange={(value) =>
                                                handlePositionChange(
                                                    index,
                                                    'name',
                                                    value
                                                )
                                            }
                                            disabled={isLoadingRoles}
                                        >
                                            <SelectTrigger className="bg-muted/30 border-border">
                                                <SelectValue
                                                    placeholder={
                                                        isLoadingRoles
                                                            ? 'Loading roles...'
                                                            : 'Select position'
                                                    }
                                                />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {isLoadingRoles ? (
                                                    <SelectItem
                                                        value="loading"
                                                        disabled
                                                    >
                                                        Loading roles...
                                                    </SelectItem>
                                                ) : (
                                                    rolesData?.data?.map(
                                                        (role) => (
                                                            <SelectItem
                                                                key={role.id}
                                                                value={
                                                                    role.name
                                                                }
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-3 h-3 rounded-full"
                                                                        style={{
                                                                            backgroundColor:
                                                                                role.hexColor,
                                                                        }}
                                                                    />
                                                                    {role.name}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-20">
                                        <Input
                                            type="number"
                                            min="1"
                                            value={position.quantity}
                                            onChange={(e) =>
                                                handlePositionChange(
                                                    index,
                                                    'quantity',
                                                    parseInt(e.target.value) ||
                                                        1
                                                )
                                            }
                                            className="bg-muted/30 border-border"
                                        />
                                    </div>
                                    {positions.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                removePosition(index)
                                            }
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Days of Week */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-foreground">
                                Working days
                            </Label>
                            <Button
                                type="button"
                                onClick={handleSelectAllDays}
                                variant="outline"
                                size="sm"
                                className={`text-xs px-3 py-1 h-7 ${
                                    isAllDaysSelected
                                        ? 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                                        : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                                }`}
                            >
                                {isAllDaysSelected
                                    ? 'Deselect All'
                                    : 'Full Week'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {daysOfWeek.map((day) => (
                                <div
                                    key={day.id}
                                    className="flex items-center space-x-2"
                                >
                                    <Checkbox
                                        id={day.id}
                                        checked={selectedDays[day.id]}
                                        onCheckedChange={(checked) =>
                                            handleDayChange(day.id, !!checked)
                                        }
                                        className="border-border"
                                    />
                                    <Label
                                        htmlFor={day.id}
                                        className="text-sm font-normal text-foreground cursor-pointer"
                                    >
                                        {day.label}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isSubmitting || isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting || isLoading}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isSubmitting || isLoading
                                ? 'Updating...'
                                : 'Update Shift'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
