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
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border">
                <div className="text-center">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No product data available</p>
                </div>
            </div>
        );
    }

    const maxQuantity = Math.max(...data.map((d) => d.totalQuantity || 0));
    const maxRevenue = Math.max(...data.map((d) => d.totalRevenue || 0));

    return (
        <div className="space-y-4 bg-white rounded-lg border p-6">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {''}
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

            <div className="relative bg-gray-50 rounded-lg p-6">
                {/* Chart container */}
                <div className="flex items-end justify-between h-64 gap-2">
                    {data.map((item, index) => {
                        const quantityHeight =
                            maxQuantity > 0
                                ? (item.totalQuantity / maxQuantity) * 100
                                : 0;

                        return (
                            <div
                                key={index}
                                className="flex flex-col items-center gap-2 flex-1 group"
                            >
                                {/* Chart area */}
                                <div
                                    className="relative w-full flex justify-center"
                                    style={{ height: '200px' }}
                                >
                                    {/* Quantity bar */}
                                    <div className="relative w-8 flex flex-col justify-end">
                                        <div
                                            className="bg-purple-500 w-full rounded-t hover:bg-purple-600 transition-colors cursor-pointer"
                                            style={{
                                                height: `${Math.max(quantityHeight, 2)}%`,
                                                minHeight:
                                                    item.totalQuantity > 0
                                                        ? '4px'
                                                        : '0px',
                                            }}
                                            title={`Quantity: ${item.totalQuantity}`}
                                        />
                                    </div>

                                    {/* Unique products indicator */}
                                    <div
                                        className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold hover:bg-orange-600 transition-colors cursor-pointer"
                                        title={`Products: ${item.uniqueProducts}`}
                                    >
                                        {item.uniqueProducts}
                                    </div>

                                    {/* Tooltip on hover */}
                                    <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                        <div className="font-medium">
                                            {format(
                                                new Date(item.period),
                                                'MMM dd'
                                            )}
                                        </div>
                                        <div>Qty: {item.totalQuantity}</div>
                                        <div>
                                            Rev:{' '}
                                            {formatCurrency(item.totalRevenue)}
                                        </div>
                                        <div>
                                            Products: {item.uniqueProducts}
                                        </div>
                                    </div>
                                </div>

                                {/* Date label */}
                                <div className="text-xs text-center text-gray-600">
                                    <div className="font-medium">
                                        {format(
                                            new Date(item.period),
                                            'MMM dd'
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Revenue line overlay */}
                <div className="absolute inset-6 top-6 pointer-events-none">
                    <svg
                        className="w-full h-52"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {/* Revenue line */}
                        <polyline
                            points={data
                                .map((item, index) => {
                                    // Align with column centers
                                    const x =
                                        ((index + 0.5) / data.length) * 100;
                                    const y =
                                        maxRevenue > 0
                                            ? 90 -
                                              (item.totalRevenue / maxRevenue) *
                                                  80
                                            : 50;
                                    return `${x},${y}`;
                                })
                                .join(' ')}
                            fill="none"
                            stroke="#22c55e"
                            strokeWidth="2"
                        />

                        {/* Revenue points */}
                        {data.map((item, index) => {
                            // Align with column centers
                            const x = ((index + 0.5) / data.length) * 100;
                            const y =
                                maxRevenue > 0
                                    ? 90 - (item.totalRevenue / maxRevenue) * 80
                                    : 50;

                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="#22c55e"
                                />
                            );
                        })}
                    </svg>
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-600">
                    <span className="bg-purple-100 px-1 rounded">
                        {maxQuantity}
                    </span>
                    <span className="bg-purple-100 px-1 rounded">
                        {Math.round(maxQuantity * 0.5)}
                    </span>
                    <span className="bg-purple-100 px-1 rounded">0</span>
                </div>

                <div className="absolute right-2 top-6 bottom-6 flex flex-col justify-between text-xs text-gray-600 text-right">
                    <span className="bg-green-100 px-1 rounded">
                        {formatCurrency(maxRevenue)}
                    </span>
                    <span className="bg-green-100 px-1 rounded">
                        {formatCurrency(maxRevenue * 0.5)}
                    </span>
                    <span className="bg-green-100 px-1 rounded">0</span>
                </div>
            </div>

            {/* Summary stats */}
            {/* <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <ShoppingCart className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-xl font-bold text-purple-600">
                        {data.reduce((sum, item) => sum + item.totalQuantity, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">Total Items</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-xl font-bold text-green-600">
                        {formatCurrency(data.reduce((sum, item) => sum + item.totalRevenue, 0))}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                </div>

                <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Package className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-xl font-bold text-orange-600">
                        {Math.max(...data.map(item => item.uniqueProducts))}
                    </div>
                    <div className="text-sm text-gray-500">Peak Products</div>
                </div>
            </div> */}
        </div>
    );
}
