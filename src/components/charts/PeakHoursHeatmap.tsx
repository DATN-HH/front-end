'use client';

import { Clock } from 'lucide-react';

interface PeakHoursHeatmapProps {
    data: Array<{
        hour: number;
        hourLabel: string;
        orderCount: number;
        percentage: number;
        isPeakHour?: boolean;
    }>;
    peakHour?: number;
    title?: string;
}

export function PeakHoursHeatmap({
    data,
    peakHour,
    title,
}: PeakHoursHeatmapProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No peak hours data available</p>
                </div>
            </div>
        );
    }

    const maxOrders = Math.max(...data.map((d) => d.orderCount || 0));
    const minOrders = Math.min(...data.map((d) => d.orderCount || 0));

    // Create 24-hour timeline
    const hours24 = Array.from({ length: 24 }, (_, i) => {
        const hourData = data.find((d) => d.hour === i);
        return {
            hour: i,
            hourLabel: `${i.toString().padStart(2, '0')}:00`,
            orderCount: hourData?.orderCount || 0,
            percentage: hourData?.percentage || 0,
            isPeakHour: i === peakHour,
        };
    });

    const getIntensityColor = (orderCount: number) => {
        if (orderCount === 0) return 'bg-gray-100';
        const intensity = (orderCount - minOrders) / (maxOrders - minOrders);
        if (intensity < 0.2) return 'bg-blue-200';
        if (intensity < 0.4) return 'bg-blue-300';
        if (intensity < 0.6) return 'bg-blue-400';
        if (intensity < 0.8) return 'bg-blue-500';
        return 'bg-blue-600';
    };

    return (
        <div className="space-y-6">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                        {title}
                    </h4>
                    <div className="text-xs text-gray-500">
                        Peak:{' '}
                        {peakHour !== undefined ? `${peakHour}:00` : 'N/A'}
                    </div>
                </div>
            )}

            {/* Peak Hour Highlight */}
            {peakHour !== undefined && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="h-5 w-5 text-orange-600" />
                        <span className="text-lg font-bold text-orange-800">
                            {peakHour}:00
                        </span>
                    </div>
                    <div className="text-sm text-orange-700">
                        Peak Hour -{' '}
                        {data.find((d) => d.hour === peakHour)?.orderCount || 0}{' '}
                        orders
                    </div>
                    <div className="text-xs text-orange-600">
                        {data
                            .find((d) => d.hour === peakHour)
                            ?.percentage?.toFixed(1) || 0}
                        % of daily orders
                    </div>
                </div>
            )}

            {/* 24-Hour Heatmap */}
            <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                    24-Hour Activity Heatmap
                </div>
                <div className="grid grid-cols-12 gap-1">
                    {hours24.map((hour) => (
                        <div
                            key={hour.hour}
                            className={`
                                relative aspect-square rounded transition-all duration-200 cursor-pointer
                                ${getIntensityColor(hour.orderCount)}
                                ${hour.isPeakHour ? 'ring-2 ring-orange-500 ring-offset-1' : ''}
                                hover:scale-110 hover:z-10
                            `}
                            title={`${hour.hourLabel}: ${hour.orderCount} orders (${hour.percentage.toFixed(1)}%)`}
                        >
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span
                                    className={`text-xs font-medium ${
                                        hour.orderCount > maxOrders * 0.6
                                            ? 'text-white'
                                            : 'text-gray-700'
                                    }`}
                                >
                                    {hour.hour}
                                </span>
                            </div>

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                <div className="font-medium">
                                    {hour.hourLabel}
                                </div>
                                <div>{hour.orderCount} orders</div>
                                <div>{hour.percentage.toFixed(1)}%</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hour labels */}
                <div className="grid grid-cols-12 gap-1 text-xs text-gray-500 text-center">
                    {[0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22].map((hour) => (
                        <div key={hour}>{hour}h</div>
                    ))}
                </div>
            </div>

            {/* Intensity Legend */}
            <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-gray-600">Low</span>
                <div className="flex gap-1">
                    <div className="w-4 h-4 bg-gray-100 rounded"></div>
                    <div className="w-4 h-4 bg-blue-200 rounded"></div>
                    <div className="w-4 h-4 bg-blue-300 rounded"></div>
                    <div className="w-4 h-4 bg-blue-400 rounded"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div className="w-4 h-4 bg-blue-600 rounded"></div>
                </div>
                <span className="text-gray-600">High</span>
            </div>

            {/* Bar Chart for detailed view */}
            <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                    Hourly Orders Distribution
                </div>
                <div className="h-32 flex items-end gap-1">
                    {data.map((hour) => (
                        <div
                            key={hour.hour}
                            className="flex-1 flex flex-col items-center group"
                        >
                            <div
                                className={`
                                    w-full transition-all duration-200 rounded-t
                                    ${hour.isPeakHour ? 'bg-orange-500' : 'bg-blue-500'}
                                    hover:opacity-80
                                `}
                                style={{
                                    height: `${maxOrders > 0 ? (hour.orderCount / maxOrders) * 100 : 0}%`,
                                    minHeight:
                                        hour.orderCount > 0 ? '4px' : '0px',
                                }}
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                    {hour.hourLabel}: {hour.orderCount} orders
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
