'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    TableStatus,
    HourlyStatus,
    TableStatusResponse,
    getStatusColor
} from '@/api/v1/table-status';

interface HourSelectorProps {
    tableStatus: TableStatusResponse | null;
    selectedHour?: number; // 0-23
    onHourSelect: (hour: number) => void;
    disabled?: boolean;
    loading?: boolean;
}

export function HourSelector({
    tableStatus,
    selectedHour,
    onHourSelect,
    disabled = false,
    loading = false
}: HourSelectorProps) {
    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23

    const getHourStatus = (hour: number): HourlyStatus | null => {
        if (!tableStatus) return null;
        return tableStatus.hourlyStatuses.find(status => status.hour === hour) || null;
    };

    const isHourAvailable = (hour: number): boolean => {
        const hourStatus = getHourStatus(hour);
        return hourStatus ? hourStatus.status === TableStatus.AVAILABLE : false;
    };

    const isCurrentHour = (hour: number): boolean => {
        const hourStatus = getHourStatus(hour);
        return hourStatus ? hourStatus.isCurrentHour : false;
    };

    const formatHour = (hour: number): string => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    if (loading) {
        return (
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Select Time</div>
                <div className="grid grid-cols-6 gap-2">
                    {hours.map((hour) => (
                        <div
                            key={hour}
                            className="h-10 bg-gray-200 rounded-md animate-pulse"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (!tableStatus) {
        return (
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">Select Time</div>
                <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                    Select a table and date first
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">
                Select Time for {tableStatus.tableName}
            </div>

            <div className="grid grid-cols-6 gap-2">
                {hours.map((hour) => {
                    const hourStatus = getHourStatus(hour);
                    const isAvailable = isHourAvailable(hour);
                    const isCurrent = isCurrentHour(hour);
                    const isSelected = selectedHour === hour;
                    const isDisabled = disabled || !isAvailable;

                    return (
                        <div key={hour} className="relative">
                            <Button
                                variant={isSelected ? "default" : "outline"}
                                size="sm"
                                className={`
                  w-full h-10 text-xs relative
                  ${isSelected ? 'ring-2 ring-blue-500' : ''}
                  ${isCurrent ? 'ring-2 ring-orange-400' : ''}
                  ${isAvailable ? 'hover:bg-green-50' : ''}
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                                disabled={isDisabled}
                                onClick={() => !isDisabled && onHourSelect(hour)}
                                title={hourStatus?.statusMessage || ''}
                            >
                                {/* Current hour indicator */}
                                {isCurrent && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
                                )}

                                <div className="flex flex-col items-center">
                                    <span className="font-medium">{formatHour(hour)}</span>

                                    {/* Status indicator */}
                                    <div
                                        className="w-2 h-2 rounded-full mt-1"
                                        style={{
                                            backgroundColor: hourStatus ? getStatusColor(hourStatus.status) : '#9ca3af'
                                        }}
                                    />
                                </div>
                            </Button>

                            {/* Estimated available time */}
                            {hourStatus?.estimatedAvailableTime && (
                                <div className="absolute -bottom-5 left-0 right-0 text-xs text-gray-500 text-center">
                                    {new Date(hourStatus.estimatedAvailableTime).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-2 border-t">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span>Occupied</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>Cleaning</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Current</span>
                </div>
            </div>

            {/* Selected time display */}
            {selectedHour !== undefined && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm font-medium text-blue-900">
                        Selected Time: {formatHour(selectedHour)}
                    </div>
                    {getHourStatus(selectedHour) && (
                        <div className="text-xs text-blue-700 mt-1">
                            {getHourStatus(selectedHour)?.statusMessage}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 