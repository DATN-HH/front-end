'use client';

import { Clock, ChefHat, CheckCircle, Trophy } from 'lucide-react';
import React from 'react';

import { KdsStatistics } from '@/api/v1/kds';
import { Card, CardContent } from '@/components/ui/card';

interface KDSStatisticsProps {
    statistics?: KdsStatistics;
    isLoading: boolean;
}

export function KDSStatistics({ statistics, isLoading }: KDSStatisticsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!statistics) {
        return null;
    }

    const stats = [
        {
            title: 'To Do',
            value: statistics.sendToKitchenCount,
            icon: Clock,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Cooking',
            value: statistics.cookingCount,
            icon: ChefHat,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-100',
        },
        {
            title: 'Ready',
            value: statistics.readyToServeCount,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Completed Today',
            value: statistics.completedTodayCount,
            icon: Trophy,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <Card key={index}>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <div
                                    className={`p-2 rounded-lg ${stat.bgColor} mr-4`}
                                >
                                    <Icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">
                                        {stat.title}
                                    </p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stat.value}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
