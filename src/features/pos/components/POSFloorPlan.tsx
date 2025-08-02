'use client';

import {
    Plus,
    Grid3X3,
    ShoppingCart,
    Building2,
    Settings,
    MoreHorizontal,
} from 'lucide-react';
import { useState } from 'react';

import { type FloorResponse } from '@/api/v1/floors';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Import existing floor management components
import { useTablesByFloor, type TableResponse } from '@/api/v1/tables';
import { FloorCanvas } from '@/features/booking/components/floor-management/[floorId]/FloorCanvas';

interface POSFloorPlanProps {
    floors: FloorResponse[];
    selectedFloor: FloorResponse | null;
    isLoading: boolean;
    onFloorChange: (floor: FloorResponse) => void;
    onTableSelect: (tableId: number) => void;
}

export function POSFloorPlan({
    floors,
    selectedFloor,
    isLoading,
    onFloorChange,
    onTableSelect,
}: POSFloorPlanProps) {
    const [showTableJump, setShowTableJump] = useState(false);

    if (isLoading) {
        return (
            <div className="flex h-full">
                {/* Control Panel Skeleton */}
                <div className="w-80 bg-white border-r border-gray-200 p-4">
                    <Skeleton className="h-12 w-full mb-4" />
                    <div className="flex space-x-2 mb-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 flex-1" />
                    </div>
                    <Skeleton className="h-8 w-8" />
                </div>

                {/* Floor Plan Skeleton */}
                <div className="flex-1 p-4">
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <Skeleton key={i} className="h-20 w-20" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full bg-gray-100">
            {/* Left Control Panel - Odoo Style */}
            <div className="w-48 bg-gray-700 border-r border-gray-600 p-4 flex flex-col">
                {/* New Order Button - Odoo Style */}
                <Button
                    className="w-full mb-4 h-12 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2"
                    onClick={() => onTableSelect(0)} // 0 for direct sale
                >
                    <Plus className="w-4 h-4" />
                    New Order
                </Button>

                {/* Table Layout Tools - Odoo Style */}
                <div className="mb-4 p-2 bg-gray-600 rounded">
                    <div className="grid grid-cols-3 gap-1 mb-2">
                        {/* Table shape tools */}
                        <div className="bg-gray-500 p-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400">
                            <div className="w-4 h-4 bg-green-300 rounded-full border border-green-400"></div>
                        </div>
                        <div className="bg-gray-500 p-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400">
                            <div className="w-4 h-4 bg-green-300 rounded border border-green-400"></div>
                        </div>
                        <div className="bg-gray-500 p-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400">
                            <div className="w-6 h-3 bg-green-300 rounded border border-green-400"></div>
                        </div>
                    </div>

                    {/* Additional tools */}
                    <div className="grid grid-cols-2 gap-1">
                        <div className="bg-gray-500 p-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400">
                            <div className="w-3 h-3 bg-white rounded"></div>
                        </div>
                        <div className="bg-gray-500 p-2 rounded flex items-center justify-center cursor-pointer hover:bg-gray-400">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                    </div>
                </div>

                {/* Floor Selector - Odoo Style */}
                <div className="mb-4">
                    <div className="space-y-1">
                        {floors.map((floor) => (
                            <Button
                                key={floor.id}
                                variant="ghost"
                                className={`w-full justify-start px-3 py-2 text-sm font-medium ${
                                    selectedFloor?.id === floor.id
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                }`}
                                onClick={() => onFloorChange(floor)}
                            >
                                {floor.name}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Floor Plan Area - Odoo Style Restaurant Layout */}
            <div className="flex-1 bg-gray-300 p-0 relative">
                {selectedFloor ? (
                    <POSFloorCanvas
                        floor={selectedFloor}
                        onTableSelect={onTableSelect}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-600">
                            <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-medium mb-2">
                                Select a Floor
                            </h3>
                            <p>
                                Choose a floor from the left panel to view
                                tables
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// POS Floor Canvas component that uses the visual table layout
function POSFloorCanvas({
    floor,
    onTableSelect,
}: {
    floor: FloorResponse;
    onTableSelect: (tableId: number) => void;
}) {
    // Fetch tables for the selected floor
    const { data: floorData, isLoading } = useTablesByFloor(floor.id);

    // Handle table selection for POS
    const handleTableSelect = (table: TableResponse | null) => {
        if (table) {
            onTableSelect(table.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading tables...</p>
                </div>
            </div>
        );
    }

    if (!floorData || !floorData.tables || floorData.tables.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                    <Grid3X3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">
                        No Tables Found
                    </h3>
                    <p>This floor doesn't have any tables configured</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-amber-100 overflow-hidden relative">
            {/* Odoo-style restaurant floor plan */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200">
                <OdooStyleFloorPlan
                    tables={floorData.tables}
                    onTableSelect={handleTableSelect}
                />
            </div>
        </div>
    );
}

// Odoo-style floor plan component that matches the exact Odoo POS interface
function OdooStyleFloorPlan({
    tables,
    onTableSelect,
}: {
    tables: TableResponse[];
    onTableSelect: (table: TableResponse | null) => void;
}) {
    // Create a grid layout similar to Odoo's restaurant floor plan
    const renderTable = (table: TableResponse, index: number) => {
        const isOccupied = table.status === 'OCCUPIED';

        // Different table layouts based on table type or index for variety
        const getTableLayout = (idx: number) => {
            const layouts = [
                // Round table with 4 chairs
                {
                    tableClass:
                        'w-16 h-16 bg-green-200 border-2 border-green-400 rounded-full flex items-center justify-center',
                    chairs: [
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -top-7 left-1/2 transform -translate-x-1/2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -right-7 top-1/2 transform -translate-y-1/2',
                        },
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -bottom-7 left-1/2 transform -translate-x-1/2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -left-7 top-1/2 transform -translate-y-1/2',
                        },
                    ],
                },
                // Square table with 4 chairs
                {
                    tableClass:
                        'w-16 h-16 bg-green-200 border-2 border-green-400 rounded-lg flex items-center justify-center',
                    chairs: [
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -top-7 left-1/2 transform -translate-x-1/2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -right-7 top-1/2 transform -translate-y-1/2',
                        },
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -bottom-7 left-1/2 transform -translate-x-1/2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -left-7 top-1/2 transform -translate-y-1/2',
                        },
                    ],
                },
                // Rectangular table with 6 chairs
                {
                    tableClass:
                        'w-20 h-16 bg-green-200 border-2 border-green-400 rounded-lg flex items-center justify-center',
                    chairs: [
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -top-7 left-2',
                        },
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -top-7 right-2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -right-7 top-1/2 transform -translate-y-1/2',
                        },
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -bottom-7 right-2',
                        },
                        {
                            class: 'w-4 h-6 bg-blue-400 rounded-sm absolute -bottom-7 left-2',
                        },
                        {
                            class: 'w-6 h-4 bg-blue-400 rounded-sm absolute -left-7 top-1/2 transform -translate-y-1/2',
                        },
                    ],
                },
            ];
            return layouts[idx % layouts.length];
        };

        const layout = getTableLayout(index);

        return (
            <div
                key={table.id}
                className="relative cursor-pointer transition-all duration-200 hover:scale-105"
                onClick={() => onTableSelect(table)}
            >
                {/* Table */}
                <div
                    className={`${layout.tableClass} ${isOccupied ? 'bg-red-200 border-red-400' : ''} shadow-lg`}
                >
                    <span className="text-lg font-bold text-gray-800">
                        {table.tableName}
                    </span>
                </div>

                {/* Chairs */}
                {layout.chairs.map((chair, chairIndex) => (
                    <div key={chairIndex} className={chair.class}></div>
                ))}

                {/* Status indicator */}
                {isOccupied && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                )}
            </div>
        );
    };

    return (
        <div className="h-full w-full p-8 overflow-auto">
            {/* Restaurant floor layout - similar to Odoo's grid */}
            <div className="grid grid-cols-4 gap-12 max-w-4xl mx-auto">
                {tables.map((table, index) => renderTable(table, index))}
            </div>

            {/* Add some decorative elements like in Odoo */}
            <div className="absolute top-4 left-4 w-20 h-32 bg-gray-600 rounded-lg opacity-50"></div>
            <div className="absolute bottom-4 right-4 w-16 h-16 bg-gray-600 rounded-full opacity-50"></div>
        </div>
    );
}
