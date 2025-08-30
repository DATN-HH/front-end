'use client';

// Thay thế date-fns bằng hàm format đơn giản
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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
    return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
};
import { ShoppingCart } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface StackedOrderChartProps {
    data: Array<{
        period: string;
        totalOrders: number;
        dineInOrders: number;
        takeoutOrders: number;
        deliveryOrders: number;
        day?: string;
    }>;
    title?: string;
}

export function StackedOrderChart({ data, title }: StackedOrderChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No order data available</p>
                </div>
            </div>
        );
    }

    // Format dữ liệu cho Recharts
    const chartData = data.map((item) => ({
        ...item,
        formattedPeriod: formatDate(item.period),
    }));

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload?.length) {
            const total = payload.reduce(
                (sum: number, item: any) => sum + item.value,
                0
            );

            return (
                <div className="bg-gray-900 text-white p-3 rounded-lg shadow-lg border">
                    <p className="font-semibold mb-2">{label}</p>
                    <p className="text-sm mb-1">
                        <span className="font-medium">
                            Total: {total} orders
                        </span>
                    </p>
                    {payload.map((entry: any, index: number) => (
                        <p
                            key={index}
                            className="text-sm"
                            style={{ color: entry.color }}
                        >
                            <span className="font-medium">
                                {entry.name}: {entry.value}
                            </span>
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                        {title}
                    </h4>
                </div>
            )}

            <div className="h-80 w-full bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{
                            top: 20,
                            right: 30,
                            left: 20,
                            bottom: 5,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                            dataKey="formattedPeriod"
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <YAxis
                            tick={{ fontSize: 12, fill: '#666' }}
                            axisLine={{ stroke: '#e0e0e0' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="rect"
                        />

                        <Bar
                            dataKey="dineInOrders"
                            stackId="orders"
                            fill="#f97316"
                            name="Dine-in"
                            radius={[0, 0, 4, 4]}
                        />
                        <Bar
                            dataKey="takeoutOrders"
                            stackId="orders"
                            fill="#3b82f6"
                            name="Takeout"
                        />
                        <Bar
                            dataKey="deliveryOrders"
                            stackId="orders"
                            fill="#10b981"
                            name="Delivery"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mt-4">
                {data.length > 0 && (
                    <>
                        <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                            <div className="text-lg font-bold text-orange-700">
                                {data.reduce(
                                    (sum, item) => sum + item.dineInOrders,
                                    0
                                )}
                            </div>
                            <div className="text-xs text-orange-600">
                                Total Dine-in
                            </div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="text-lg font-bold text-blue-700">
                                {data.reduce(
                                    (sum, item) => sum + item.takeoutOrders,
                                    0
                                )}
                            </div>
                            <div className="text-xs text-blue-600">
                                Total Takeout
                            </div>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="text-lg font-bold text-green-700">
                                {data.reduce(
                                    (sum, item) => sum + item.deliveryOrders,
                                    0
                                )}
                            </div>
                            <div className="text-xs text-green-600">
                                Total Delivery
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
