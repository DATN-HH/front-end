'use client';

import { useEffect } from 'react';
import { Clock } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface DateTimeSelectorProps {
    selectedDate: string;
    selectedHour: number | null;
    duration?: number;
    onDateChange: (date: string) => void;
    onHourChange: (hour: any) => void;
    onDurationChange?: (duration: number) => void;
    disabled?: boolean;
}

export function DateTimeSelector({
    selectedDate,
    selectedHour,
    duration = 2,
    onDateChange,
    onHourChange,
    onDurationChange,
    disabled = false,
}: DateTimeSelectorProps) {
    // Check if selected date is today
    const isToday = selectedDate === new Date().toISOString().split('T')[0];
    const currentHour = new Date().getHours();

    // Generate available hours (6:00 to 23:00)
    const availableHours = Array.from({ length: 18 }, (_, i) => i + 6); // 6 to 23

    // Filter out past hours if selecting today
    const selectableHours = isToday
        ? availableHours.filter((hour) => hour > currentHour)
        : availableHours;

    useEffect(() => {
        if (selectedHour !== null && !selectableHours.includes(selectedHour)) {
            onHourChange(null);
        }
    }, [selectedHour, selectableHours, onHourChange]);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-4 h-4" />
                    Date & Time
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <Label htmlFor="date" className="text-sm">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={selectedDate || ''}
                            onChange={(e) => onDateChange(e.target.value)}
                            disabled={disabled}
                            required
                            min={new Date().toISOString().split('T')[0]}
                            className="h-8"
                        />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="hour" className="text-sm">
                            Hour
                        </Label>
                        <Select
                            value={
                                selectedHour !== null
                                    ? selectedHour.toString()
                                    : ''
                            }
                            onValueChange={(value) =>
                                onHourChange(parseInt(value))
                            }
                            disabled={disabled}
                        >
                            <SelectTrigger className="h-8">
                                <SelectValue placeholder="Select hour" />
                            </SelectTrigger>
                            <SelectContent>
                                {selectableHours.map((hour) => (
                                    <SelectItem
                                        key={hour}
                                        value={hour.toString()}
                                    >
                                        {hour.toString().padStart(2, '0')}:00
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Duration Selection - Only show if onDurationChange is provided */}
                {onDurationChange && (
                    <div className="space-y-2">
                        <Label className="text-sm">Duration</Label>
                        <RadioGroup
                            value={duration.toString()}
                            onValueChange={(value) =>
                                onDurationChange(parseInt(value))
                            }
                            disabled={disabled}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="1" id="duration-1" />
                                <Label
                                    htmlFor="duration-1"
                                    className="text-sm cursor-pointer"
                                >
                                    1 hour
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="2" id="duration-2" />
                                <Label
                                    htmlFor="duration-2"
                                    className="text-sm cursor-pointer"
                                >
                                    2 hours
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="3" id="duration-3" />
                                <Label
                                    htmlFor="duration-3"
                                    className="text-sm cursor-pointer"
                                >
                                    3 hours
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
