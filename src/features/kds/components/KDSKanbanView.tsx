'use client';

import React from 'react';

import { KdsItem } from '@/api/v1/kds';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    const getItemsByStatus = (status: KdsItemStatus) => {
        const filteredItems = items.filter((item) => item.itemStatus === status);

        // Sort by priority for SEND_TO_KITCHEN status (To Do column)
        if (status === KdsItemStatus.SEND_TO_KITCHEN) {
            return filteredItems.sort((a, b) => {
                // Handle null/undefined priority values
                const priorityA = a.priority || 0;
                const priorityB = b.priority || 0;
                return priorityA - priorityB; // Sort ascending (small to large)
            });
        }

        return filteredItems;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
                {KANBAN_COLUMNS.map((column) => (
                    <div key={column.id} className="h-full flex flex-col">
                        <Card
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
                            <CardContent className="flex-1 overflow-hidden p-3">
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
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
            {KANBAN_COLUMNS.map((column) => {
                const columnItems = getItemsByStatus(column.status);

                return (
                    <div key={column.id} className="h-[100%] flex flex-col">
                        <Card
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
                            <CardContent className="flex-1 p-0 overflow-hidden">
                                <div
                                    className="h-full overflow-y-auto px-3"
                                    style={{ maxHeight: 'calc(100vh - 250px)' }}
                                >
                                    <div className="space-y-3 py-3">
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
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );
            })}
        </div>
    );
}
