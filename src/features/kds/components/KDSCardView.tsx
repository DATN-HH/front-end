'use client';

import React from 'react';

import { useKdsItems } from '@/api/v1/kds';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KdsItemStatus } from '@/types/kds';

import { KDSItemCard } from './KDSItemCard';

interface KDSCardViewProps {
    status: KdsItemStatus;
    title: string;
    refreshKey: number;
}

export function KDSCardView({ status, title, refreshKey }: KDSCardViewProps) {
    const { data, isLoading, error } = useKdsItems({
        statuses: status,
        sortByPriority: true,
        includeCompleted: false,
    });

    if (error) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center text-red-600">
                        <p>Unable to load data</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div
                                key={i}
                                className="h-48 bg-gray-200 rounded-lg animate-pulse"
                            />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }

    const items = data?.items || [];

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
                <CardTitle className="flex items-center justify-between">
                    <span>{title}</span>
                    <span className="text-sm font-normal text-gray-500">
                        {items.length} items
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    {items.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>No items in this status</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pr-4">
                            {items.map((item) => (
                                <KDSItemCard
                                    key={`${item.id}-${refreshKey}`}
                                    item={item}
                                    showActions={true}
                                    compact={true}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
