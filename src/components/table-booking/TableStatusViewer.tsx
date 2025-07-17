'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import {
    TableStatus,
    HourlyStatus,
    TableStatusResponse,
    getStatusColor
} from '@/api/v1/table-status';

interface TableStatusViewerProps {
    tableStatus: TableStatusResponse | null;
    selectedTime?: string; // Format: "14:00"
    onTimeSelect?: (hour: number) => void;
    loading?: boolean;
    error?: string;
}

export function TableStatusViewer({
    tableStatus,
    selectedTime,
    onTimeSelect,
    loading = false,
    error
}: TableStatusViewerProps) {
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Table Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-500">Loading table status...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Table Status
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <div className="text-red-500 mb-2">Error</div>
                            <p className="text-gray-500">{error}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!tableStatus) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Table Status
                    </CardTitle>
                    <CardDescription>
                        Select a table to view its hourly status
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500">No table selected</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const getHourDisplay = (hour: number): string => {
        return `${hour.toString().padStart(2, '0')}:00`;
    };

    const isTimeSelected = (hour: number): boolean => {
        if (!selectedTime) return false;
        const hourStr = getHourDisplay(hour);
        return selectedTime === hourStr;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {tableStatus.tableName} - Status Overview
                </CardTitle>
                <CardDescription>
                    Capacity: {tableStatus.capacity} people | Floor: {tableStatus.floorName}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {tableStatus.hourlyStatuses.map((hourStatus: HourlyStatus) => {
                        const isSelected = isTimeSelected(hourStatus.hour);
                        const statusColor = getStatusColor(hourStatus.status);
                        const isClickable = !!onTimeSelect;

                        return (
                            <div
                                key={hourStatus.hour}
                                className={`
                  relative p-2 rounded-lg border-2 text-center text-xs transition-all duration-200
                  ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}
                  ${hourStatus.isCurrentHour ? 'ring-2 ring-orange-300 border-orange-400' : ''}
                  ${isClickable ? 'cursor-pointer hover:shadow-md' : ''}
                  ${hourStatus.status === TableStatus.AVAILABLE ? 'hover:bg-green-50' : ''}
                `}
                                style={{
                                    backgroundColor: hourStatus.status === TableStatus.AVAILABLE
                                        ? isSelected ? '#dbeafe' : '#f0fdf4'
                                        : isSelected ? '#dbeafe' : '#fef2f2'
                                }}
                                onClick={() => {
                                    if (isClickable && hourStatus.status === TableStatus.AVAILABLE) {
                                        onTimeSelect(hourStatus.hour);
                                    }
                                }}
                                title={`${getHourDisplay(hourStatus.hour)} - ${hourStatus.statusMessage}${hourStatus.estimatedAvailableTime
                                        ? ` (Available at ${new Date(hourStatus.estimatedAvailableTime).toLocaleTimeString()})`
                                        : ''
                                    }`}
                            >
                                {/* Current hour indicator */}
                                {hourStatus.isCurrentHour && (
                                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border border-white"></div>
                                )}

                                {/* Time */}
                                <div className="font-semibold text-gray-900 mb-1">
                                    {getHourDisplay(hourStatus.hour)}
                                </div>

                                {/* Status badge */}
                                <Badge
                                    variant={hourStatus.status === TableStatus.AVAILABLE ? "default" : "destructive"}
                                    className="text-xs px-1 py-0"
                                    style={{
                                        backgroundColor: statusColor,
                                        color: 'white'
                                    }}
                                >
                                    {hourStatus.status === TableStatus.AVAILABLE ? 'Free' :
                                        hourStatus.status === TableStatus.OCCUPIED ? 'Busy' : 'Clean'}
                                </Badge>

                                {/* Estimated available time */}
                                {hourStatus.estimatedAvailableTime && (
                                    <div className="text-xs text-gray-500 mt-1">
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
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded"></div>
                            <span>Occupied</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                            <span>Needs Cleaning</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Current Hour</span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 