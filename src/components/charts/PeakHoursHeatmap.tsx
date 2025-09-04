'use client';

import { Clock } from 'lucide-react';
import { useState, useRef } from 'react';

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
    const [hoveredHour, setHoveredHour] = useState<number | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0, show: false });
    const containerRef = useRef<HTMLDivElement>(null);

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

    // Create 6-23 hour timeline (18 hours)
    const businessHours = Array.from({ length: 18 }, (_, i) => {
        const hour = i + 6; // Start from 6h
        const hourData = data.find((d) => d.hour === hour);
        return {
            hour,
            hourLabel: `${hour.toString().padStart(2, '0')}:00`,
            orderCount: hourData?.orderCount || 0,
            percentage: hourData?.percentage || 0,
            isPeakHour: hour === peakHour,
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

    const handleMouseEnter = (hour: number, event: React.MouseEvent) => {
        setHoveredHour(hour);

        const rect = event.currentTarget.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
            setTooltipPosition({
                x: rect.left - containerRect.left + rect.width / 2,
                y: rect.top - containerRect.top - 10,
                show: true
            });
        }
    };

    const handleMouseLeave = () => {
        setHoveredHour(null);
        setTooltipPosition(prev => ({ ...prev, show: false }));
    };

    const getHourData = (hour: number) => businessHours.find(h => h.hour === hour);

    return (
        <div className="space-y-6" ref={containerRef}>
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

            {/* Business Hours Heatmap (6h-23h) */}
            <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                    Business Hours Activity (6h - 23h)
                </div>

                {/* Heatmap Grid - 18 columns for 6h-23h */}
                <div className="relative">
                    <div className="grid grid-cols-9 gap-2">
                        {businessHours.map((hour, index) => (
                            <div
                                key={hour.hour}
                                className={`
                                    relative aspect-square rounded-lg transition-all duration-200 cursor-pointer
                                    ${getIntensityColor(hour.orderCount)}
                                    ${hour.isPeakHour ? 'ring-2 ring-orange-500 ring-offset-1' : ''}
                                    hover:scale-105 hover:shadow-md hover:z-10
                                `}
                                onMouseEnter={(e) => handleMouseEnter(hour.hour, e)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span
                                        className={`text-xs font-medium ${hour.orderCount > maxOrders * 0.6
                                            ? 'text-white'
                                            : 'text-gray-700'
                                            }`}
                                    >
                                        {hour.hour}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Custom Tooltip */}
                    {tooltipPosition.show && hoveredHour !== null && (
                        <div
                            className="absolute pointer-events-none z-50 transform -translate-x-1/2 -translate-y-full"
                            style={{
                                left: tooltipPosition.x,
                                top: tooltipPosition.y,
                            }}
                        >
                            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 min-w-[160px]">
                                <div className="text-center space-y-1">
                                    <div className="text-sm font-bold text-orange-300">
                                        {getHourData(hoveredHour)?.hourLabel}
                                    </div>
                                    <div className="text-lg font-bold text-white">
                                        {getHourData(hoveredHour)?.orderCount || 0}
                                        <span className="text-xs text-gray-300 ml-1">orders</span>
                                    </div>
                                    <div className="text-sm text-blue-300">
                                        {getHourData(hoveredHour)?.percentage.toFixed(1) || 0}% of total orders
                                    </div>
                                    {hoveredHour === peakHour && (
                                        <div className="text-xs text-orange-300 font-medium border-t border-gray-600 pt-1 mt-2">
                                            🔥 Peak Hour
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
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
        </div>
    );
}
