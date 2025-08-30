import { TrendingUp } from 'lucide-react';
import React from 'react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface RevenueAreaChartProps {
    data: Array<{
        period: string;
        revenue: number;
        deposits: number;
        day?: string;
    }>;
    title?: string;
    formatCurrency: (amount: number) => string;
}

// Helper function to format date
const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
    ];
    return `${months[date.getMonth()]} ${date.getDate().toString().padStart(2, '0')}`;
};

export function RevenueAreaChart({
    data,
    title,
    formatCurrency,
}: RevenueAreaChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-80 bg-gray-50 rounded-lg border">
                <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No revenue data available</p>
                </div>
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = data.map((item) => ({
        ...item,
        date: formatDate(item.period),
        revenue: item.revenue || 0,
        deposits: item.deposits || 0,
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            return (
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                    <p className="font-medium text-gray-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                        >
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="capitalize">{entry.dataKey}:</span>
                            <span className="font-medium">
                                {formatCurrency(entry.value)}
                            </span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom Y-axis tick formatter
    const formatYAxisTick = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    return (
        <div className="space-y-4 bg-white rounded-lg border p-6">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {title}
                    </h4>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span>Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Deposits</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 20,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#6b7280' }}
                            tickFormatter={formatYAxisTick}
                            width={80}
                        />
                        <Tooltip
                            content={CustomTooltip}
                            cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
                        />

                        {/* Revenue Area */}
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fill="rgba(59, 130, 246, 0.1)"
                            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                            activeDot={{
                                r: 6,
                                stroke: '#3b82f6',
                                strokeWidth: 2,
                            }}
                        />

                        {/* Deposits Area */}
                        <Area
                            type="monotone"
                            dataKey="deposits"
                            stroke="#22c55e"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="rgba(34, 197, 94, 0.1)"
                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                            activeDot={{
                                r: 6,
                                stroke: '#22c55e',
                                strokeWidth: 2,
                            }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                            chartData.reduce(
                                (sum, item) => sum + item.revenue,
                                0
                            )
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                            chartData.reduce(
                                (sum, item) => sum + item.deposits,
                                0
                            )
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Total Deposits</div>
                </div>
            </div>
        </div>
    );
}
