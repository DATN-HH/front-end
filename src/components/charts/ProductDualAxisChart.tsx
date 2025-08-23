'use client';

import { format } from 'date-fns';
import { Package } from 'lucide-react';

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

export function ProductDualAxisChart({
    data,
    title,
    formatCurrency,
}: ProductDualAxisChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No product data available</p>
                </div>
            </div>
        );
    }

    const maxQuantity = Math.max(...data.map((d) => d.totalQuantity || 0));
    const maxRevenue = Math.max(...data.map((d) => d.totalRevenue || 0));
    const minQuantity = Math.min(...data.map((d) => d.totalQuantity || 0));
    const minRevenue = Math.min(...data.map((d) => d.totalRevenue || 0));

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">
                        {title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
                            <span>Quantity</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                            <span>Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-amber-500 rounded"></div>
                            <span>Unique Products</span>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative h-80 w-full bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border">
                <div className="flex items-end justify-between h-full gap-2 relative">
                    {data.map((item, index) => {
                        const quantityHeight =
                            maxQuantity > 0
                                ? ((item.totalQuantity - minQuantity) /
                                      (maxQuantity - minQuantity)) *
                                  100
                                : 0;
                        const revenueHeight =
                            maxRevenue > 0
                                ? ((item.totalRevenue - minRevenue) /
                                      (maxRevenue - minRevenue)) *
                                  100
                                : 0;

                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 flex-1 group relative"
                            >
                                {/* Bar chart for quantity */}
                                <div
                                    className="relative w-full flex justify-center"
                                    style={{ height: '280px' }}
                                >
                                    <div className="relative w-3/4 flex flex-col justify-end">
                                        <div
                                            className="bg-gradient-to-t from-indigo-500 to-indigo-400 w-full rounded-t transition-all duration-300 hover:from-indigo-600 hover:to-indigo-500 relative group/quantity"
                                            style={{
                                                height: `${Math.max(quantityHeight, 2)}%`,
                                                minHeight:
                                                    item.totalQuantity > 0
                                                        ? '4px'
                                                        : '0px',
                                            }}
                                        >
                                            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-indigo-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/quantity:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                Quantity: {item.totalQuantity}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Line chart overlay for revenue */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <svg
                                            className="w-full h-full"
                                            viewBox="0 0 100 100"
                                            preserveAspectRatio="none"
                                        >
                                            {/* Revenue line point */}
                                            <circle
                                                cx="50"
                                                cy={
                                                    100 -
                                                    Math.max(revenueHeight, 2)
                                                }
                                                r="4"
                                                fill="white"
                                                stroke="#10b981"
                                                strokeWidth="3"
                                                vectorEffect="non-scaling-stroke"
                                                className="drop-shadow-sm"
                                            />

                                            {/* Connect to next point if exists */}
                                            {index < data.length - 1 && (
                                                <line
                                                    x1="50"
                                                    y1={
                                                        100 -
                                                        Math.max(
                                                            revenueHeight,
                                                            2
                                                        )
                                                    }
                                                    x2="150"
                                                    y2={
                                                        100 -
                                                        Math.max(
                                                            maxRevenue > 0
                                                                ? ((data[
                                                                      index + 1
                                                                  ]
                                                                      .totalRevenue -
                                                                      minRevenue) /
                                                                      (maxRevenue -
                                                                          minRevenue)) *
                                                                      100
                                                                : 0,
                                                            2
                                                        )
                                                    }
                                                    stroke="#10b981"
                                                    strokeWidth="2"
                                                    vectorEffect="non-scaling-stroke"
                                                />
                                            )}
                                        </svg>
                                    </div>

                                    {/* Unique products indicator */}
                                    <div
                                        className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-bold"
                                        title={`${item.uniqueProducts} unique products`}
                                    >
                                        {item.uniqueProducts}
                                    </div>

                                    {/* Hover tooltip */}
                                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 shadow-lg">
                                        <div className="font-medium">
                                            {format(
                                                new Date(item.period),
                                                'MMM dd'
                                            )}
                                        </div>
                                        <div className="text-indigo-300">
                                            Quantity: {item.totalQuantity}
                                        </div>
                                        <div className="text-emerald-300">
                                            Revenue:{' '}
                                            {formatCurrency(item.totalRevenue)}
                                        </div>
                                        <div className="text-amber-300">
                                            Products: {item.uniqueProducts}
                                        </div>
                                    </div>
                                </div>

                                <span className="text-xs text-muted-foreground font-medium">
                                    {format(new Date(item.period), 'MMM dd')}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Left Y-axis labels (Quantity) */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-indigo-600 -ml-12">
                    <span>{maxQuantity}</span>
                    <span>{Math.round(maxQuantity / 2)}</span>
                    <span>0</span>
                </div>

                {/* Right Y-axis labels (Revenue) */}
                <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-emerald-600 -mr-16">
                    <span>{formatCurrency(maxRevenue)}</span>
                    <span>{formatCurrency(maxRevenue / 2)}</span>
                    <span>0</span>
                </div>
            </div>

            {/* Summary metrics */}
            <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                    <div className="text-lg font-bold text-indigo-700">
                        {data.reduce(
                            (sum, item) => sum + item.totalQuantity,
                            0
                        )}
                    </div>
                    <div className="text-xs text-indigo-600">
                        Total Items Sold
                    </div>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="text-lg font-bold text-emerald-700">
                        {formatCurrency(
                            data.reduce(
                                (sum, item) => sum + item.totalRevenue,
                                0
                            )
                        )}
                    </div>
                    <div className="text-xs text-emerald-600">
                        Total Revenue
                    </div>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="text-lg font-bold text-amber-700">
                        {Math.max(...data.map((item) => item.uniqueProducts))}
                    </div>
                    <div className="text-xs text-amber-600">Peak Products</div>
                </div>
            </div>
        </div>
    );
}
