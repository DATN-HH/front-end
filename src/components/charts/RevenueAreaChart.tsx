'use client';

import { TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

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
            <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No revenue data available</p>
                </div>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.map(d => d.revenue || 0));
    const maxDeposits = Math.max(...data.map(d => d.deposits || 0));
    const minRevenue = Math.min(...data.map(d => d.revenue || 0));
    const minDeposits = Math.min(...data.map(d => d.deposits || 0));

    // Create SVG path for revenue area
    const revenuePoints = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = maxRevenue > 0 ? 100 - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 80 : 50;
        return `${x},${y}`;
    }).join(' ');

    // Create SVG path for deposits line
    const depositsPoints = data.map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = maxDeposits > 0 ? 100 - ((item.deposits - minDeposits) / (maxDeposits - minDeposits)) * 80 : 50;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className="space-y-4">
            {title && (
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-700">{title}</h4>
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-green-500 rounded"></div>
                            <span>Revenue</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <span>Deposits</span>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="relative h-64 w-full bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 border">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Grid lines */}
                    <defs>
                        <pattern id="revenue-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="0.5"/>
                        </pattern>
                        <linearGradient id="revenue-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05"/>
                        </linearGradient>
                    </defs>
                    <rect width="100" height="100" fill="url(#revenue-grid)" />
                    
                    {/* Revenue area */}
                    <path
                        d={`M 0,100 ${revenuePoints} L 100,100 Z`}
                        fill="url(#revenue-gradient)"
                        className="transition-all duration-300"
                    />
                    
                    {/* Revenue line */}
                    <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3"
                        points={revenuePoints}
                        vectorEffect="non-scaling-stroke"
                        className="drop-shadow-sm"
                    />
                    
                    {/* Deposits line */}
                    <polyline
                        fill="none"
                        stroke="#3b82f6"
                        strokeWidth="2"
                        strokeDasharray="5,5"
                        points={depositsPoints}
                        vectorEffect="non-scaling-stroke"
                        className="drop-shadow-sm"
                    />
                    
                    {/* Data points for revenue */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = maxRevenue > 0 ? 100 - ((item.revenue - minRevenue) / (maxRevenue - minRevenue)) * 80 : 50;
                        return (
                            <g key={`revenue-${index}`}>
                                <circle
                                    cx={x}
                                    cy={y}
                                    r="3"
                                    fill="white"
                                    stroke="#10b981"
                                    strokeWidth="2"
                                    vectorEffect="non-scaling-stroke"
                                    className="hover:r-4 transition-all cursor-pointer drop-shadow-sm"
                                />
                                <text
                                    x={x}
                                    y={y - 8}
                                    textAnchor="middle"
                                    className="text-xs fill-gray-700 opacity-0 hover:opacity-100 transition-opacity"
                                    vectorEffect="non-scaling-stroke"
                                >
                                    {formatCurrency(item.revenue)}
                                </text>
                            </g>
                        );
                    })}
                    
                    {/* Data points for deposits */}
                    {data.map((item, index) => {
                        const x = (index / (data.length - 1)) * 100;
                        const y = maxDeposits > 0 ? 100 - ((item.deposits - minDeposits) / (maxDeposits - minDeposits)) * 80 : 50;
                        return (
                            <circle
                                key={`deposits-${index}`}
                                cx={x}
                                cy={y}
                                r="2"
                                fill="white"
                                stroke="#3b82f6"
                                strokeWidth="2"
                                vectorEffect="non-scaling-stroke"
                                className="hover:r-3 transition-all cursor-pointer drop-shadow-sm"
                            />
                        );
                    })}
                </svg>
                
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 -ml-16">
                    <span>{formatCurrency(maxRevenue)}</span>
                    <span>{formatCurrency(maxRevenue / 2)}</span>
                    <span>0</span>
                </div>
                
                {/* Right Y-axis labels for deposits */}
                <div className="absolute right-0 top-0 h-full flex flex-col justify-between text-xs text-blue-600 -mr-16">
                    <span>{formatCurrency(maxDeposits)}</span>
                    <span>{formatCurrency(maxDeposits / 2)}</span>
                    <span>0</span>
                </div>
            </div>
            
            {/* X-axis labels */}
            <div className="flex justify-between text-xs text-muted-foreground px-4">
                {data.map((item, index) => {
                    if (data.length <= 7 || index === 0 || index === data.length - 1 || index % Math.ceil(data.length / 5) === 0) {
                        return (
                            <span key={index} className="font-medium">
                                {format(new Date(item.period), 'MMM dd')}
                            </span>
                        );
                    }
                    return null;
                }).filter(Boolean)}
            </div>
        </div>
    );
}
