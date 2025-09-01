'use client';

import { format, parse, addDays, subDays, isAfter, isToday } from 'date-fns';
import {
    Clock,
    Users,
    MapPin,
    CheckCircle,
    XCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState, useMemo } from 'react';

import {
    useSingleTableDailyStatus,
    TableStatus,
    HourlyTableStatus,
} from '@/api/v1/table-status';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface TableAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: number | null;
    tableName: string;
    selectedDate: string; // YYYY-MM-DD format
    onDateTimeSelect?: (date: string, hour: number, tableId: number) => void; // New callback
}

const getStatusInfo = (status: TableStatus) => {
    switch (status) {
        case TableStatus.AVAILABLE:
            return {
                icon: CheckCircle,
                color: 'text-green-600',
                bgColor: 'bg-green-50',
                borderColor: 'border-green-200',
                label: 'Available',
                slotStyle:
                    'bg-green-100 hover:bg-green-200 cursor-pointer border-green-300',
            };
        case TableStatus.OCCUPIED:
            return {
                icon: XCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: 'Occupied',
                slotStyle:
                    'bg-red-100 cursor-not-allowed border-red-300 opacity-50',
            };

        default:
            return {
                icon: Clock,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                label: 'Unknown',
                slotStyle:
                    'bg-gray-100 cursor-not-allowed border-gray-300 opacity-50',
            };
    }
};

const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
};

// Generate time slots from 6:00 to 23:00
const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
        slots.push(hour);
    }
    return slots;
};

export function TableAvailabilityModal({
    isOpen,
    onClose,
    tableId,
    tableName,
    selectedDate,
    onDateTimeSelect,
}: TableAvailabilityModalProps) {
    const [currentDate, setCurrentDate] = useState(selectedDate);

    const {
        data: tableStatus,
        isLoading,
        error,
    } = useSingleTableDailyStatus(
        tableId || 0,
        currentDate,
        isOpen && !!tableId
    );

    const timeSlots = useMemo(() => generateTimeSlots(), []);

    // Create a map for quick status lookup
    const statusMap = useMemo(() => {
        if (!tableStatus?.success) return new Map();
        const map = new Map<number, HourlyTableStatus>();
        tableStatus.payload.hourlyStatuses.forEach((status) => {
            map.set(status.hour, status);
        });
        return map;
    }, [tableStatus]);

    const availableHoursCount = useMemo(() => {
        if (!tableStatus?.success) return 0;
        const isCurrentDay = isToday(
            parse(currentDate, 'yyyy-MM-dd', new Date())
        );
        const currentHour = new Date().getHours();

        return timeSlots.filter((hour) => {
            const status = statusMap.get(hour);
            const isPastHour = isCurrentDay && hour <= currentHour;
            return status?.status === TableStatus.AVAILABLE && !isPastHour;
        }).length;
    }, [timeSlots, statusMap, tableStatus, currentDate]);

    const canGoToPreviousDay = () => {
        const prevDate = subDays(
            parse(currentDate, 'yyyy-MM-dd', new Date()),
            1
        );
        return isToday(prevDate) || isAfter(prevDate, new Date());
    };

    const goToPreviousDay = () => {
        if (canGoToPreviousDay()) {
            const prevDate = format(
                subDays(parse(currentDate, 'yyyy-MM-dd', new Date()), 1),
                'yyyy-MM-dd'
            );
            setCurrentDate(prevDate);
        }
    };

    const goToNextDay = () => {
        const nextDate = format(
            addDays(parse(currentDate, 'yyyy-MM-dd', new Date()), 1),
            'yyyy-MM-dd'
        );
        setCurrentDate(nextDate);
    };

    const handleTimeSlotClick = (hour: number) => {
        const status = statusMap.get(hour);
        const isCurrentDay = isToday(
            parse(currentDate, 'yyyy-MM-dd', new Date())
        );
        const currentHour = new Date().getHours();
        const isPastHour = isCurrentDay && hour <= currentHour;

        if (
            status?.status === TableStatus.AVAILABLE &&
            !isPastHour &&
            onDateTimeSelect &&
            tableId
        ) {
            onDateTimeSelect(currentDate, hour, tableId);
            onClose(); // Close modal after selection
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Table Availability - {tableName}
                    </DialogTitle>
                    <DialogDescription>
                        Select your preferred date and time slot
                    </DialogDescription>
                </DialogHeader>

                {/* Date Navigation */}
                <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousDay}
                        disabled={!canGoToPreviousDay()}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="text-center">
                        <div className="text-lg font-semibold">
                            {format(
                                parse(currentDate, 'yyyy-MM-dd', new Date()),
                                'EEEE, MMMM d'
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            {format(
                                parse(currentDate, 'yyyy-MM-dd', new Date()),
                                'yyyy'
                            )}
                            {isToday(
                                parse(currentDate, 'yyyy-MM-dd', new Date())
                            ) && (
                                <Badge
                                    variant="secondary"
                                    className="ml-2 text-xs"
                                >
                                    Today
                                </Badge>
                            )}
                        </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={goToNextDay}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
                            <p className="text-sm text-gray-600">
                                Loading table availability...
                            </p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="py-8 text-center">
                        <XCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                        <p className="text-red-600">
                            Failed to load table availability
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                            Please try again later
                        </p>
                    </div>
                )}

                {tableStatus?.success && (
                    <div className="space-y-6">
                        {/* Table Info */}
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">
                                        Floor:
                                    </span>
                                    <span className="font-medium">
                                        {tableStatus.payload.floorName}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">
                                        Capacity:
                                    </span>
                                    <span className="font-medium">
                                        {tableStatus.payload.capacity} people
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-gray-600">
                                        Available:
                                    </span>
                                    <span className="font-medium text-green-600">
                                        {availableHoursCount}/{timeSlots.length}{' '}
                                        slots
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Time Slots Grid */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Available Time Slots
                            </h3>

                            <div className="grid grid-cols-6 gap-2">
                                {timeSlots.map((hour) => {
                                    const status =
                                        statusMap.get(hour)?.status ||
                                        TableStatus.AVAILABLE;
                                    const statusInfo = getStatusInfo(status);
                                    const isCurrentDay = isToday(
                                        parse(
                                            currentDate,
                                            'yyyy-MM-dd',
                                            new Date()
                                        )
                                    );
                                    const currentHour = new Date().getHours();
                                    const isPastHour =
                                        isCurrentDay && hour <= currentHour;
                                    const isAvailable =
                                        status === TableStatus.AVAILABLE &&
                                        !isPastHour;

                                    return (
                                        <button
                                            key={hour}
                                            onClick={() =>
                                                handleTimeSlotClick(hour)
                                            }
                                            disabled={!isAvailable}
                                            className={`
                                                p-3 rounded-lg border-2 text-sm font-medium transition-all
                                                ${
                                                    isPastHour
                                                        ? 'bg-gray-100 cursor-not-allowed border-gray-300 opacity-50'
                                                        : statusInfo.slotStyle
                                                }
                                                ${isAvailable ? 'hover:shadow-sm active:scale-95' : ''}
                                            `}
                                            title={
                                                isPastHour
                                                    ? `${formatHour(hour)} - Past time`
                                                    : isAvailable
                                                      ? `Select ${formatHour(hour)}`
                                                      : `${formatHour(hour)} - ${statusInfo.label}`
                                            }
                                        >
                                            <div className="text-center">
                                                <div className="font-semibold">
                                                    {formatHour(hour)}
                                                </div>
                                                <div className="text-xs mt-1">
                                                    {isPastHour
                                                        ? 'Past'
                                                        : isAvailable
                                                          ? 'Available'
                                                          : statusInfo.label}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded"></div>
                                <span>Available</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded opacity-50"></div>
                                <span>Occupied</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded opacity-50"></div>
                                <span>Past time</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex justify-end gap-2">
                            <Button onClick={onClose} variant="outline">
                                Close
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
