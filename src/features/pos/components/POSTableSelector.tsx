'use client';

import { useMemo } from 'react';

import {
    usePOSTableStatus,
    usePOSTableOccupancy,
    POSTableStatus,
    shouldDisableTable,
    getTableStatusText,
    isTableAvailable,
} from '@/api/v1/pos-table-status';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Table {
    id: number;
    name: string;
    status: string;
    floorName?: string;
    floorId?: number;
}

interface POSTableSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    tables: Table[];
    selectedTables: Table[];
    onTablesChange: (tables: Table[]) => void;
    disabled?: boolean;
}

export function POSTableSelector({
    isOpen,
    onClose,
    tables,
    selectedTables,
    onTablesChange,
    disabled = false,
}: POSTableSelectorProps) {
    // Get unique floor IDs from tables
    const floorIds = useMemo(() => {
        const uniqueFloorIds = [
            ...new Set(tables.map((table) => table.floorId).filter(Boolean)),
        ];
        return uniqueFloorIds as number[];
    }, [tables]);

    // Fetch table status for each floor using fixed number of hooks
    const floor1Status = usePOSTableStatus(
        floorIds[0] || 0,
        isOpen && floorIds.length > 0
    );
    const floor2Status = usePOSTableStatus(
        floorIds[1] || 0,
        isOpen && floorIds.length > 1
    );
    const floor3Status = usePOSTableStatus(
        floorIds[2] || 0,
        isOpen && floorIds.length > 2
    );
    const floor4Status = usePOSTableStatus(
        floorIds[3] || 0,
        isOpen && floorIds.length > 3
    );
    const floor5Status = usePOSTableStatus(
        floorIds[4] || 0,
        isOpen && floorIds.length > 4
    );

    // Fetch occupancy data for each floor
    const floor1Occupancy = usePOSTableOccupancy(
        floorIds[0] || 0,
        isOpen && floorIds.length > 0
    );
    const floor2Occupancy = usePOSTableOccupancy(
        floorIds[1] || 0,
        isOpen && floorIds.length > 1
    );
    const floor3Occupancy = usePOSTableOccupancy(
        floorIds[2] || 0,
        isOpen && floorIds.length > 2
    );
    const floor4Occupancy = usePOSTableOccupancy(
        floorIds[3] || 0,
        isOpen && floorIds.length > 3
    );
    const floor5Occupancy = usePOSTableOccupancy(
        floorIds[4] || 0,
        isOpen && floorIds.length > 4
    );

    // Combine all table status and occupancy data
    const allTableStatuses = useMemo(() => {
        const statusMap = new Map();
        const statusQueries = [
            floor1Status,
            floor2Status,
            floor3Status,
            floor4Status,
            floor5Status,
        ];

        statusQueries.forEach((query) => {
            if (query.data?.payload?.tables) {
                query.data.payload.tables.forEach((table) => {
                    statusMap.set(table.tableId, table);
                });
            }
        });
        return statusMap;
    }, [floor1Status, floor2Status, floor3Status, floor4Status, floor5Status]);

    const allTableOccupancy = useMemo(() => {
        const occupancyMap = new Map();
        const occupancyQueries = [
            floor1Occupancy,
            floor2Occupancy,
            floor3Occupancy,
            floor4Occupancy,
            floor5Occupancy,
        ];

        occupancyQueries.forEach((query) => {
            if (query.data?.payload?.tables) {
                query.data.payload.tables.forEach((table) => {
                    occupancyMap.set(table.tableId, table);
                });
            }
        });
        return occupancyMap;
    }, [
        floor1Occupancy,
        floor2Occupancy,
        floor3Occupancy,
        floor4Occupancy,
        floor5Occupancy,
    ]);

    // Check if any API calls are loading
    const isLoading = [
        floor1Status,
        floor2Status,
        floor3Status,
        floor4Status,
        floor5Status,
        floor1Occupancy,
        floor2Occupancy,
        floor3Occupancy,
        floor4Occupancy,
        floor5Occupancy,
    ].some((query) => query.isLoading);

    const handleTableClick = (table: Table) => {
        if (disabled) return;

        const tableStatus = allTableStatuses.get(table.id);
        const isSelected = selectedTables.some((t) => t.id === table.id);
        const isOccupied =
            tableStatus && shouldDisableTable(tableStatus.currentStatus);

        // Only allow selection of:
        // 1. Available tables
        // 2. Tables that are already selected (to allow deselection)
        if (isOccupied && !isSelected) {
            return; // Don't allow selection of occupied tables that aren't already selected
        }

        if (isSelected) {
            onTablesChange(selectedTables.filter((t) => t.id !== table.id));
        } else {
            onTablesChange([...selectedTables, table]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Select Tables</DialogTitle>
                    {!isLoading && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Total: {tables.length}</span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                Available:{' '}
                                {
                                    tables.filter((table) => {
                                        const tableStatus =
                                            allTableStatuses.get(table.id);
                                        const status =
                                            tableStatus?.currentStatus ||
                                            POSTableStatus.AVAILABLE;
                                        return isTableAvailable(status);
                                    }).length
                                }
                            </span>
                            <span className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                Occupied:{' '}
                                {
                                    tables.filter((table) => {
                                        const tableStatus =
                                            allTableStatuses.get(table.id);
                                        const status =
                                            tableStatus?.currentStatus ||
                                            POSTableStatus.AVAILABLE;
                                        return !isTableAvailable(status);
                                    }).length
                                }
                            </span>
                        </div>
                    )}
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                <p className="text-sm text-muted-foreground">
                                    Loading table status...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {tables.map((table) => {
                                const isSelected = selectedTables.some(
                                    (t) => t.id === table.id
                                );

                                // Get real-time table status and occupancy
                                const tableStatus = allTableStatuses.get(
                                    table.id
                                );
                                const occupancyInfo = allTableOccupancy.get(
                                    table.id
                                );
                                const realTimeStatus =
                                    tableStatus?.currentStatus ||
                                    POSTableStatus.AVAILABLE;
                                const isOccupied =
                                    shouldDisableTable(realTimeStatus);

                                // Can select if: available OR already selected (to allow deselection)
                                const canSelect = !isOccupied || isSelected;

                                // Get detailed status text
                                let statusText = table.status;
                                if (
                                    isOccupied &&
                                    occupancyInfo?.occupancyDetails
                                ) {
                                    const details =
                                        occupancyInfo.occupancyDetails;
                                    if (
                                        details.occupationType === 'POS_ORDER'
                                    ) {
                                        statusText = `OD #${details.orderId}`;
                                    } else if (
                                        details.occupationType ===
                                            'BOOKING_TABLE' ||
                                        details.occupationType ===
                                            'UPCOMING_BOOKING'
                                    ) {
                                        const startTime = details.startTime
                                            ? new Date(
                                                  details.startTime
                                              ).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : '';
                                        const endTime = details.endTime
                                            ? new Date(
                                                  details.endTime
                                              ).toLocaleTimeString([], {
                                                  hour: '2-digit',
                                                  minute: '2-digit',
                                              })
                                            : '';
                                        const timeRange =
                                            startTime && endTime
                                                ? ` (${startTime}-${endTime})`
                                                : '';
                                        statusText = `BT #${details.bookingId}${timeRange}`;
                                    } else {
                                        statusText =
                                            getTableStatusText(realTimeStatus);
                                    }
                                } else if (isOccupied) {
                                    statusText =
                                        getTableStatusText(realTimeStatus);
                                }

                                return (
                                    <Button
                                        key={table.id}
                                        variant="outline"
                                        className={cn(
                                            'h-28 flex flex-col items-center justify-center gap-1 p-3 text-black',
                                            !canSelect &&
                                                'opacity-50 grayscale cursor-not-allowed',
                                            disabled && 'cursor-not-allowed',
                                            isOccupied &&
                                                !isSelected &&
                                                'border-red-300 bg-red-50',
                                            isSelected &&
                                                'border-green-500 bg-green-100 shadow-md ring-2 ring-green-200'
                                        )}
                                        onClick={() => handleTableClick(table)}
                                        disabled={disabled || !canSelect}
                                    >
                                        <span className="text-lg font-semibold text-black">
                                            {table.name}
                                        </span>
                                        {table.floorName && (
                                            <span className="text-xs text-black opacity-70">
                                                {table.floorName}
                                            </span>
                                        )}
                                        <span
                                            className={cn(
                                                'text-xs text-center leading-tight text-black',
                                                isOccupied
                                                    ? 'font-medium'
                                                    : 'opacity-70'
                                            )}
                                        >
                                            {statusText}
                                        </span>
                                        {!canSelect && (
                                            <span className="text-xs text-red-600 font-medium">
                                                Unavailable
                                            </span>
                                        )}
                                    </Button>
                                );
                            })}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
