'use client';

import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Mini Sparkline Component
interface SparklineProps {
    data: number[];
    trend: 'up' | 'down' | 'neutral';
    className?: string;
}

function Sparkline({ data, trend, className }: SparklineProps) {
    if (data.length < 2) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    // Add padding to make differences more visible
    const padding = 2;
    const width = 80;
    const height = 24;
    const chartHeight = height - (padding * 2);

    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = range === 0 ? height / 2 : padding + chartHeight - ((value - min) / range) * chartHeight;
        return `${x},${y}`;
    });

    const pathData = `M ${points.join(' L ')}`;

    // Create area fill path
    const firstPoint = points[0].split(',');
    const lastPoint = points[points.length - 1].split(',');
    const areaPath = `${pathData} L ${lastPoint[0]},${height - padding} L ${firstPoint[0]},${height - padding} Z`;

    const getColors = () => {
        if (trend === 'up') return {
            stroke: '#059669', // emerald-600
            fill: '#d1fae5', // emerald-100
            gradient: ['#10b981', '#34d399'] // emerald-500 to emerald-400
        };
        if (trend === 'down') return {
            stroke: '#dc2626', // red-600  
            fill: '#fecaca', // red-200
            gradient: ['#ef4444', '#f87171'] // red-500 to red-400
        };
        return {
            stroke: '#4b5563', // gray-600
            fill: '#e5e7eb', // gray-200  
            gradient: ['#6b7280', '#9ca3af'] // gray-500 to gray-400
        };
    };

    const colors = getColors();

    return (
        <div className="relative">
            <svg
                width={width}
                height={height}
                className={`${className} transition-all duration-300 hover:scale-110`}
                viewBox={`0 0 ${width} ${height}`}
            >
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gradient-${trend}`} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.1" />
                    </linearGradient>
                </defs>

                {/* Area fill */}
                <path
                    d={areaPath}
                    fill={`url(#gradient-${trend})`}
                    opacity="0.6"
                />

                {/* Main line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="1"
                />

                {/* Data points */}
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * width;
                    const y = range === 0 ? height / 2 : padding + chartHeight - ((value - min) / range) * chartHeight;

                    // Highlight first and last points
                    const isEndPoint = index === 0 || index === data.length - 1;

                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r={isEndPoint ? "2.5" : "1.5"}
                            fill="white"
                            stroke={colors.stroke}
                            strokeWidth={isEndPoint ? "2" : "1.5"}
                            opacity="1"
                            className="transition-all duration-200"
                        />
                    );
                })}
            </svg>

            {/* Background subtle glow effect */}
            <div className={`absolute inset-0 rounded-md opacity-20 ${trend === 'up' ? 'bg-green-100' :
                trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`} />
        </div>
    );
}

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    isLoading?: boolean;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    formatPercentage?: (value: number) => string;
    sparklineData?: number[];
}

export function MetricCard({
    title,
    value,
    change,
    icon: Icon,
    isLoading,
    subtitle,
    trend,
    formatPercentage = (value: number) =>
        `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`,
    sparklineData,
}: MetricCardProps) {

    if (isLoading) {
        return (
            <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                    <div className="animate-pulse h-4 w-4 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse h-8 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="animate-pulse h-3 bg-gray-200 rounded w-40"></div>
                </CardContent>
            </Card>
        );
    }

    const getTrendColor = () => {
        if (trend === 'up') return 'text-green-600';
        if (trend === 'down') return 'text-red-600';
        return 'text-gray-600';
    };

    const getTrendIcon = () => {
        if (trend === 'up') return <ArrowUpRight className="h-3 w-3" />;
        if (trend === 'down') return <ArrowDownRight className="h-3 w-3" />;
        return <TrendingUp className="h-3 w-3" />;
    };

    return (
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                    {title}
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                    <Icon className="h-4 w-4 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-end justify-between">
                    <div className="flex-1">
                        <div className="text-2xl font-bold text-gray-900 mb-1 transition-all duration-300">
                            {typeof value === 'number' ? value.toLocaleString() : value}
                        </div>
                        {subtitle && (
                            <p className="text-xs text-gray-600 mb-2 font-medium">
                                {subtitle}
                            </p>
                        )}
                        {change !== undefined && (
                            <div
                                className={`text-xs flex items-center ${getTrendColor()} bg-gray-50 px-2 py-1 rounded-full`}
                            >
                                {getTrendIcon()}
                                <span className="ml-1 font-medium">
                                    {formatPercentage(change)} from previous period
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mini Sparkline Chart */}
                    {sparklineData && sparklineData.length > 1 && trend && (
                        <div className="flex flex-col items-end justify-end ml-2">
                            <Sparkline
                                data={sparklineData}
                                trend={trend}
                                className="mb-1"
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
