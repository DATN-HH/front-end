'use client';

import React from 'react';

import { KdsItem } from '@/api/v1/kds';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { KANBAN_COLUMNS, KdsItemStatus } from '@/types/kds';

import { KDSItemCard } from './KDSItemCard';

interface KDSKanbanViewProps {
    items: KdsItem[];
    isLoading: boolean;
    refreshKey: number;
}

export function KDSKanbanView({
    items,
    isLoading,
    refreshKey,
}: KDSKanbanViewProps) {
    const getItemsByStatus = (status: KdsItemStatus): KdsItem[] => {
        return items.filter((item) => item.itemStatus === status);
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                {KANBAN_COLUMNS.map((column) => (
                    <Card
                        key={column.id}
                        className={`${column.color} h-full flex flex-col`}
                    >
                        <CardHeader className="pb-3 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">
                                    {column.title}
                                </h3>
                                <Badge variant="secondary">-</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="h-24 bg-gray-200 rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {KANBAN_COLUMNS.map((column) => {
                const columnItems = getItemsByStatus(column.status);

                return (
                    <Card
                        key={column.id}
                        className={`${column.color} h-full flex flex-col`}
                    >
                        <CardHeader className="pb-3 flex-shrink-0">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-lg">
                                    {column.title}
                                </h3>
                                <Badge variant="secondary">
                                    {columnItems.length}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 overflow-hidden">
                            <ScrollArea className="h-full">
                                <div className="space-y-3 pr-4">
                                    {columnItems.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No items</p>
                                        </div>
                                    ) : (
                                        columnItems.map((item) => (
                                            <KDSItemCard
                                                key={`${item.id}-${refreshKey}`}
                                                item={item}
                                                showActions={true}
                                                compact={true}
                                            />
                                        ))
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
