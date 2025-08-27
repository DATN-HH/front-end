'use client';

import { format, parse } from 'date-fns';
import {
    Clock,
    Users,
    MapPin,
    Calendar,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Loader2,
} from 'lucide-react';
import { useMemo } from 'react';

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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface TableAvailabilityModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableId: number | null;
    tableName: string;
    selectedDate: string; // YYYY-MM-DD format
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
            };
        case TableStatus.OCCUPIED:
            return {
                icon: XCircle,
                color: 'text-red-600',
                bgColor: 'bg-red-50',
                borderColor: 'border-red-200',
                label: 'Occupied',
            };
        case TableStatus.NEEDS_CLEANING:
            return {
                icon: AlertTriangle,
                color: 'text-orange-600',
                bgColor: 'bg-orange-50',
                borderColor: 'border-orange-200',
                label: 'Cleaning',
            };
        default:
            return {
                icon: Clock,
                color: 'text-gray-600',
                bgColor: 'bg-gray-50',
                borderColor: 'border-gray-200',
                label: 'Unknown',
            };
    }
};

const formatHour = (hour: number) => {
    if (hour === 0) return '12:00 AM';
    if (hour === 12) return '12:00 PM';
    if (hour < 12) return `${hour}:00 AM`;
    return `${hour - 12}:00 PM`;
};

// Group consecutive hours with same status
const groupConsecutiveHours = (hourlyStatuses: HourlyTableStatus[]) => {
    if (!hourlyStatuses.length) return [];

    const groups: Array<{
        status: TableStatus;
        startHour: number;
        endHour: number;
        customerInfo?: {
            bookingId: number;
            customerName: string;
            customerPhone: string;
        };
    }> = [];

    let currentGroup = {
        status: hourlyStatuses[0].status,
        startHour: hourlyStatuses[0].hour,
        endHour: hourlyStatuses[0].hour,
        customerInfo: hourlyStatuses[0].bookingId
            ? {
                  bookingId: hourlyStatuses[0].bookingId!,
                  customerName: hourlyStatuses[0].customerName!,
                  customerPhone: hourlyStatuses[0].customerPhone!,
              }
            : undefined,
    };

    for (let i = 1; i < hourlyStatuses.length; i++) {
        const current = hourlyStatuses[i];
        const isSameBooking =
            currentGroup.customerInfo?.bookingId === current.bookingId;

        if (
            current.status === currentGroup.status &&
            current.hour === currentGroup.endHour + 1 &&
            isSameBooking
        ) {
            // Extend current group
            currentGroup.endHour = current.hour;
        } else {
            // Start new group
            groups.push(currentGroup);
            currentGroup = {
                status: current.status,
                startHour: current.hour,
                endHour: current.hour,
                customerInfo: current.bookingId
                    ? {
                          bookingId: current.bookingId,
                          customerName: current.customerName!,
                          customerPhone: current.customerPhone!,
                      }
                    : undefined,
            };
        }
    }

    groups.push(currentGroup);
    return groups;
};

export function TableAvailabilityModal({
    isOpen,
    onClose,
    tableId,
    tableName,
    selectedDate,
}: TableAvailabilityModalProps) {
    const {
        data: tableStatus,
        isLoading,
        error,
    } = useSingleTableDailyStatus(
        tableId || 0,
        selectedDate,
        isOpen && !!tableId
    );

    const availabilityGroups = useMemo(() => {
        if (!tableStatus?.success) return [];
        return groupConsecutiveHours(tableStatus.payload.hourlyStatuses);
    }, [tableStatus]);

    const availableHoursCount = useMemo(() => {
        if (!tableStatus?.success) return 0;
        return tableStatus.payload.hourlyStatuses.filter(
            (h) => h.status === TableStatus.AVAILABLE
        ).length;
    }, [tableStatus]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        Table Availability - {tableName}
                    </DialogTitle>
                    <DialogDescription>
                        Daily availability for{' '}
                        {format(
                            parse(selectedDate, 'yyyy-MM-dd', new Date()),
                            'EEEE, MMMM d, yyyy'
                        )}
                    </DialogDescription>
                </DialogHeader>

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
                            <div className="grid grid-cols-2 gap-4 text-sm">
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
                                    <Calendar className="h-4 w-4 text-gray-500" />
                                    <span className="text-gray-600">Type:</span>
                                    <span className="font-medium">
                                        {tableStatus.payload.tableType}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-gray-600">
                                        Available:
                                    </span>
                                    <span className="font-medium text-green-600">
                                        {availableHoursCount}/24 hours
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Availability Timeline */}
                        <div>
                            <h3 className="font-semibold mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Daily Timeline
                            </h3>

                            <ScrollArea className="h-64">
                                <div className="space-y-2">
                                    {availabilityGroups.map((group, index) => {
                                        const statusInfo = getStatusInfo(
                                            group.status
                                        );
                                        const StatusIcon = statusInfo.icon;
                                        const timeRange =
                                            group.startHour === group.endHour
                                                ? formatHour(group.startHour)
                                                : `${formatHour(group.startHour)} - ${formatHour(group.endHour + 1)}`;

                                        return (
                                            <div
                                                key={index}
                                                className={`p-3 rounded-lg border ${statusInfo.bgColor} ${statusInfo.borderColor}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <StatusIcon
                                                            className={`h-5 w-5 ${statusInfo.color}`}
                                                        />
                                                        <div>
                                                            <div className="font-medium text-gray-900">
                                                                {timeRange}
                                                            </div>
                                                            <Badge
                                                                variant={
                                                                    group.status ===
                                                                    TableStatus.AVAILABLE
                                                                        ? 'default'
                                                                        : 'secondary'
                                                                }
                                                                className={`mt-1 ${statusInfo.color} text-xs`}
                                                            >
                                                                {
                                                                    statusInfo.label
                                                                }
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    {group.customerInfo && (
                                                        <div className="text-right text-sm">
                                                            {/* <div className="font-medium text-gray-900">
                                                                {group.customerInfo.customerName}
                                                            </div>
                                                            <div className="text-gray-600">
                                                                {group.customerInfo.customerPhone}
                                                            </div> */}
                                                            <div className="text-xs text-gray-500 mt-1">
                                                                Booking #
                                                                {
                                                                    group
                                                                        .customerInfo
                                                                        .bookingId
                                                                }
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        <Separator />

                        {/* Quick Summary */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="text-lg font-bold text-green-600">
                                    {
                                        tableStatus.payload.hourlyStatuses.filter(
                                            (h) =>
                                                h.status ===
                                                TableStatus.AVAILABLE
                                        ).length
                                    }
                                </div>
                                <div className="text-xs text-green-700">
                                    Available Hours
                                </div>
                            </div>
                            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                                <div className="text-lg font-bold text-red-600">
                                    {
                                        tableStatus.payload.hourlyStatuses.filter(
                                            (h) =>
                                                h.status ===
                                                TableStatus.OCCUPIED
                                        ).length
                                    }
                                </div>
                                <div className="text-xs text-red-700">
                                    Occupied Hours
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="flex justify-end">
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
