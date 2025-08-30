import { Package, ShoppingCart, TrendingUp } from 'lucide-react';
import React from 'react';
import {
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ProductDualAxisChartProps {
    data: Array<{
        period: string;
        totalQuantity: number;
        totalRevenue: number;
        uniqueProducts: number;
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

export function ProductDualAxisChart({
    data,
    title,
    formatCurrency,
}: ProductDualAxisChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border">
                <div className="text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No product data available</p>
                </div>
            </div>
        );
    }

    // Transform data for Recharts
    const chartData = data.map((item) => ({
        ...item,
        date: formatDate(item.period),
        totalQuantity: item.totalQuantity || 0,
        totalRevenue: item.totalRevenue || 0,
        uniqueProducts: item.uniqueProducts || 0,
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            const data = payload[0]?.payload;
            return (
                <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded shadow-lg">
                    <div className="font-medium mb-1">{label}</div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span>
                                Qty: {data?.totalQuantity?.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                                Rev: {formatCurrency(data?.totalRevenue || 0)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                            <span>Products: {data?.uniqueProducts}</span>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Y-axis tick formatter for quantity
    const formatQuantityTick = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    // Custom Y-axis tick formatter for revenue
    const formatRevenueTick = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toString();
    };

    // Custom dot for unique products
    const CustomizedDot = (props: any) => {
        const { cx, cy, payload } = props;
        return (
            <g>
                <circle
                    cx={cx}
                    cy={cy}
                    r="8"
                    fill="#f97316"
                    stroke="#fff"
                    strokeWidth="2"
                />
                <text
                    x={cx}
                    y={cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                >
                    {payload.uniqueProducts}
                </text>
            </g>
        );
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
                            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                            <span>Quantity</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>Products</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 80,
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

                        {/* Left Y-axis for Quantity */}
                        <YAxis
                            yAxisId="quantity"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#8b5cf6' }}
                            tickFormatter={formatQuantityTick}
                            width={60}
                        />

                        {/* Right Y-axis for Revenue */}
                        <YAxis
                            yAxisId="revenue"
                            orientation="right"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#22c55e' }}
                            tickFormatter={formatRevenueTick}
                            width={60}
                        />

                        <Tooltip
                            content={CustomTooltip}
                            cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                        />

                        {/* Quantity bars */}
                        <Bar
                            yAxisId="quantity"
                            dataKey="totalQuantity"
                            fill="#8b5cf6"
                            name="Quantity"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                        />

                        {/* Revenue line */}
                        <Line
                            yAxisId="revenue"
                            type="monotone"
                            dataKey="totalRevenue"
                            stroke="#22c55e"
                            strokeWidth={3}
                            name="Revenue"
                            dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                            activeDot={{
                                r: 6,
                                stroke: '#22c55e',
                                strokeWidth: 2,
                            }}
                        />

                        {/* Products line with custom dots */}
                        <Line
                            yAxisId="quantity"
                            type="monotone"
                            dataKey="uniqueProducts"
                            stroke="#f97316"
                            strokeWidth={2}
                            name="Products"
                            dot={<CustomizedDot />}
                            activeDot={{
                                r: 10,
                                stroke: '#f97316',
                                strokeWidth: 2,
                            }}
                        />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-purple-600">
                        {chartData
                            .reduce((sum, item) => sum + item.totalQuantity, 0)
                            .toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Items</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                        {formatCurrency(
                            chartData.reduce(
                                (sum, item) => sum + item.totalRevenue,
                                0
                            )
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                        {Math.max(
                            ...chartData.map((item) => item.uniqueProducts)
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Peak Products</div>
                </div>
            </div>
        </div>
    );
}
