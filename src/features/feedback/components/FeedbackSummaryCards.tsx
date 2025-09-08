'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    MessageSquare,
    Star,
    TrendingUp,
    Users,
    Package,
    Building,
} from 'lucide-react';
import { FeedbackSummaryDto } from '@/api/v1/feedback';

interface FeedbackSummaryCardsProps {
    summary: FeedbackSummaryDto;
    loading?: boolean;
}

export function FeedbackSummaryCards({
    summary,
    loading,
}: FeedbackSummaryCardsProps) {
    const cards = [
        {
            title: 'Total Feedback',
            value: summary.totalFeedback,
            icon: MessageSquare,
            description: 'All feedback received',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Average Rating',
            value: summary.averageRating.toFixed(1),
            icon: Star,
            description: 'Overall satisfaction',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            suffix: '⭐',
        },
        {
            title: 'Restaurant Feedback',
            value: summary.totalRestaurantFeedback,
            icon: Building,
            description: 'General experience',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Product Feedback',
            value: summary.totalProductFeedback,
            icon: Package,
            description: 'Specific products',
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        {
            title: 'Pending Response',
            value: summary.pendingFeedback,
            icon: TrendingUp,
            description: 'Awaiting response',
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
        {
            title: 'Responded',
            value: summary.respondedFeedback,
            icon: Users,
            description: 'Already responded',
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                            </CardTitle>
                            <div className="h-4 w-4 bg-gray-200 rounded"></div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Card
                        key={index}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {card.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <Icon className={`h-4 w-4 ${card.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {typeof card.value === 'number'
                                    ? card.value.toLocaleString()
                                    : card.value}
                                {card.suffix && (
                                    <span className="ml-1">{card.suffix}</span>
                                )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
