'use client';

import { format } from 'date-fns';
import { ShoppingCart } from 'lucide-react';

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

    const maxTotal = Math.max(...data.map((d) => d.totalOrders || 0));

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                        {title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-orange-500 rounded"></div>
                            <span>Dine-in</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Takeout</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Delivery</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative h-64 w-full bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border">
                <div className="flex items-end justify-between h-full gap-2">
                    {data.map((item, index) => {
                        const dineInHeight =
                            maxTotal > 0
                                ? (item.dineInOrders / maxTotal) * 100
                                : 0;
                        const takeoutHeight =
                            maxTotal > 0
                                ? (item.takeoutOrders / maxTotal) * 100
                                : 0;
                        const deliveryHeight =
                            maxTotal > 0
                                ? (item.deliveryOrders / maxTotal) * 100
                                : 0;

                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 flex-1 group"
                            >
                                <div
                                    className="relative w-full flex flex-col"
                                    style={{ height: '200px' }}
                                >
                                    {/* Delivery (top) */}
                                    {deliveryHeight > 0 && (
                                        <div
                                            className="bg-green-500 w-full transition-all duration-300 hover:bg-green-600 relative group/delivery"
                                            style={{
                                                height: `${deliveryHeight}%`,
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-green-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/delivery:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Delivery: {item.deliveryOrders}
                                            </div>
                                        </div>
                                    )}

                                    {/* Takeout (middle) */}
                                    {takeoutHeight > 0 && (
                                        <div
                                            className="bg-blue-500 w-full transition-all duration-300 hover:bg-blue-600 relative group/takeout"
                                            style={{
                                                height: `${takeoutHeight}%`,
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-blue-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/takeout:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Takeout: {item.takeoutOrders}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dine-in (bottom) */}
                                    {dineInHeight > 0 && (
                                        <div
                                            className="bg-orange-500 w-full rounded-b transition-all duration-300 hover:bg-orange-600 relative group/dinein"
                                            style={{
                                                height: `${dineInHeight}%`,
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-orange-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/dinein:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Dine-in: {item.dineInOrders}
                                            </div>
                                        </div>
                                    )}

                                    {/* Total tooltip */}
                                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                        Total: {item.totalOrders} orders
                                    </div>
                                </div>

                                <span className="text-xs text-muted-foreground font-medium">
                                    {format(new Date(item.period), 'MMM dd')}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-8">
                    <span>{maxTotal}</span>
                    <span>{Math.round(maxTotal / 2)}</span>
                    <span>0</span>
                </div>
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
