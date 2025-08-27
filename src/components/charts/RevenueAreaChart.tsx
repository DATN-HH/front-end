'use client';

import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

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

    const maxValue = Math.max(
        ...data.map((d) => Math.max(d.revenue || 0, d.deposits || 0))
    );

    const revenuePoints = data.map((item, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: maxValue > 0 ? 90 - (item.revenue / maxValue) * 70 : 50,
    }));

    const depositsPoints = data.map((item, index) => ({
        x: (index / (data.length - 1)) * 100,
        y: maxValue > 0 ? 90 - (item.deposits / maxValue) * 70 : 50,
    }));

    const createPath = (points: Array<{ x: number; y: number }>) => {
        if (points.length === 0) return '';
        return points
            .map((point, i) =>
                i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`
            )
            .join(' ');
    };

    const revenuePath = createPath(revenuePoints);
    const depositsPath = createPath(depositsPoints);

    return (
        <div className="space-y-4 bg-white rounded-lg border p-6">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900">
                        {''}
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

            <div className="relative h-80 bg-gray-50 rounded-lg">
                <svg
                    className="w-full h-full p-4"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                >
                    {/* Grid lines */}
                    {[20, 40, 60, 80].map((y) => (
                        <line
                            key={y}
                            x1="0"
                            y1={y}
                            x2="100"
                            y2={y}
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                        />
                    ))}

                    {/* Revenue area */}
                    <path
                        d={`${revenuePath} L 100 100 L 0 100 Z`}
                        fill="rgba(59, 130, 246, 0.1)"
                    />

                    {/* Revenue line */}
                    <path
                        d={revenuePath}
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                    />

                    {/* Deposits area */}
                    <path
                        d={`${depositsPath} L 100 100 L 0 100 Z`}
                        fill="rgba(34, 197, 94, 0.1)"
                    />

                    {/* Deposits line */}
                    <path
                        d={depositsPath}
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                    />

                    {/* Data points */}
                    {revenuePoints.map((point, index) => (
                        <circle
                            key={`revenue-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#3b82f6"
                            className="hover:r-4 transition-all cursor-pointer"
                        />
                    ))}

                    {depositsPoints.map((point, index) => (
                        <circle
                            key={`deposits-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="3"
                            fill="#22c55e"
                            className="hover:r-4 transition-all cursor-pointer"
                        />
                    ))}
                </svg>

                {/* Y-axis labels */}
                <div className="absolute left-2 top-4 bottom-4 flex flex-col justify-between text-xs text-gray-600">
                    <span>{formatCurrency(maxValue)}</span>
                    <span>{formatCurrency(maxValue * 0.75)}</span>
                    <span>{formatCurrency(maxValue * 0.5)}</span>
                    <span>{formatCurrency(maxValue * 0.25)}</span>
                    <span>0</span>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-gray-600">
                {data
                    .map((item, index) => {
                        const shouldShow =
                            data.length <= 7 ||
                            index === 0 ||
                            index === data.length - 1 ||
                            index % Math.ceil(data.length / 5) === 0;

                        return shouldShow ? (
                            <div key={index} className="text-center">
                                <div className="font-medium">
                                    {format(new Date(item.period), 'MMM dd')}
                                </div>
                            </div>
                        ) : null;
                    })
                    .filter(Boolean)}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                            data.reduce((sum, item) => sum + item.revenue, 0)
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Total Revenue</div>
                </div>
                <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                            data.reduce((sum, item) => sum + item.deposits, 0)
                        )}
                    </div>
                    <div className="text-sm text-gray-500">Total Deposits</div>
                </div>
            </div>
        </div>
    );
}
