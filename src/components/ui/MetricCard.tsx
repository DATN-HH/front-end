'use client';

import { ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface MetricCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<{ className?: string }>;
    isLoading?: boolean;
    subtitle?: string;
    trend?: 'up' | 'down' | 'neutral';
    formatPercentage?: (value: number) => string;
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
        <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-500 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">
                    {title}
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-full">
                    <Icon className="h-4 w-4 text-orange-600" />
                </div>
            </CardHeader>
            <CardContent>
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
            </CardContent>
        </Card>
    );
}
