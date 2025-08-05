'use client';

import {
    Plus,
    Search,
    Building2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

import { type BranchResponseDto } from '@/api/v1/branches';
import { type FloorResponse } from '@/api/v1/floors';
import { useTablesByFloor, type TableResponse } from '@/api/v1/tables';
import { Button } from '@/components/ui/button';

// Import existing floor management components
import { FloorCanvas } from '@/features/booking/components/floor-management/[floorId]/FloorCanvas';

import { BranchSelector } from './BranchSelector';
import { QuickTableNavigation } from './QuickTableNavigation';

interface POSTablesViewProps {
    floors: FloorResponse[];
    selectedFloor: FloorResponse | null;
    isLoading: boolean;
    onFloorChange: (floor: FloorResponse) => void;
    onTableSelect: (tableId: number) => void;
    onNewOrder: () => void;
    selectedBranch?: BranchResponseDto | null;
    onBranchSelect?: (branch: BranchResponseDto) => void;
}

export function POSTablesView({
    floors,
    selectedFloor,
    onFloorChange,
    onTableSelect,
    onNewOrder,
    selectedBranch,
    onBranchSelect,
}: POSTablesViewProps) {
    const [showQuickNav, setShowQuickNav] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Show branch selector if no branch is selected
    if (!selectedBranch && onBranchSelect) {
        return (
            <BranchSelector
                onBranchSelect={onBranchSelect}
                selectedBranch={selectedBranch}
            />
        );
    }

    return (
        <div className="flex h-full">
            {/* Left Sidebar - Collapsible */}
            <div
                className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-700 border-r border-gray-600 transition-all duration-300 ease-in-out flex flex-col relative`}
            >
                {/* Collapse Toggle Button */}
                <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -right-3 top-4 z-10 bg-gray-700 border border-gray-600 text-gray-300 hover:bg-gray-600 hover:text-white rounded-full w-6 h-6 p-0"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="w-3 h-3" />
                    ) : (
                        <ChevronLeft className="w-3 h-3" />
                    )}
                </Button>

                <div className={`p-4 ${sidebarCollapsed ? 'px-2' : ''}`}>
                    {/* Branch Selector - Only show if no branch selected (fallback case) */}
                    {!selectedBranch && onBranchSelect && !sidebarCollapsed && (
                        <div className="mb-4">
                            <BranchSelector
                                onBranchSelect={onBranchSelect}
                                selectedBranch={selectedBranch}
                            />
                        </div>
                    )}

                    {/* Branch Display - Show selected branch info without selector */}
                    {selectedBranch && !sidebarCollapsed && (
                        <div className="mb-4">
                            <div className="flex items-center space-x-2 p-2 bg-purple-100 rounded-lg">
                                <Building2 className="w-4 h-4 text-purple-600" />
                                <div className="text-sm">
                                    <div className="font-medium text-purple-900">
                                        {selectedBranch.name}
                                    </div>
                                    {selectedBranch.address && (
                                        <div className="text-purple-700 text-xs">
                                            {selectedBranch.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Compact Branch Indicator for Collapsed Sidebar */}
                    {selectedBranch && sidebarCollapsed && (
                        <div className="mb-4 flex justify-center">
                            <div
                                className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold"
                                title={selectedBranch.name}
                            >
                                {selectedBranch.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* New Order Button */}
                    <Button
                        className={`w-full mb-4 ${sidebarCollapsed ? 'h-10 px-2' : 'h-12'} bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg flex items-center justify-center gap-2`}
                        onClick={onNewOrder}
                        title={sidebarCollapsed ? 'New Order' : ''}
                    >
                        <Plus className="w-4 h-4" />
                        {!sidebarCollapsed && 'New Order'}
                    </Button>

                    {/* Quick Table Navigation */}
                    <Button
                        variant="outline"
                        className={`w-full mb-4 h-10 bg-gray-600 border-gray-500 text-gray-200 hover:bg-gray-500 hover:text-white ${sidebarCollapsed ? 'px-2' : ''}`}
                        onClick={() => setShowQuickNav(!showQuickNav)}
                        title={sidebarCollapsed ? 'Quick Table Search' : ''}
                    >
                        <Search className="w-4 h-4 mr-2" />
                        {!sidebarCollapsed && 'Quick Table Search'}
                    </Button>

                    {showQuickNav && !sidebarCollapsed && (
                        <div className="mb-4">
                            <QuickTableNavigation
                                onTableNavigate={onTableSelect}
                                onClose={() => setShowQuickNav(false)}
                                selectedFloorId={selectedFloor?.id}
                            />
                        </div>
                    )}

                    {/* Floor Selector */}
                    <div className="mb-4">
                        {!sidebarCollapsed && (
                            <h3 className="text-sm font-medium text-gray-300 mb-2">
                                Floors
                            </h3>
                        )}
                        <div className="space-y-1">
                            {floors.map((floor) => (
                                <Button
                                    key={floor.id}
                                    variant="ghost"
                                    className={`w-full ${sidebarCollapsed ? 'justify-center px-2' : 'justify-start px-3'} py-2 text-sm font-medium ${
                                        selectedFloor?.id === floor.id
                                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                                            : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                                    }`}
                                    onClick={() => onFloorChange(floor)}
                                    title={sidebarCollapsed ? floor.name : ''}
                                >
                                    <Building2 className="w-4 h-4 mr-2" />
                                    {!sidebarCollapsed && floor.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Quick Navigation for Collapsed Sidebar */}
            {showQuickNav && sidebarCollapsed && (
                <div className="fixed top-20 left-20 z-50">
                    <QuickTableNavigation
                        onTableNavigate={onTableSelect}
                        onClose={() => setShowQuickNav(false)}
                        selectedFloorId={selectedFloor?.id}
                    />
                </div>
            )}

            {/* Main Floor Plan Area */}
            <div className="flex-1 relative bg-gray-100">
                {selectedFloor ? (
                    <FloorPlanWithBackground
                        floor={selectedFloor}
                        onTableSelect={onTableSelect}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-600">
                            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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

// Enhanced floor plan component with background image support
function FloorPlanWithBackground({
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

    if (!floorData?.tables || floorData.tables.length === 0) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-600">
                    <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium mb-2">
                        No Tables Found
                    </h3>
                    <p>This floor doesn't have any tables configured</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden">
            {/* Use existing FloorCanvas with background image support */}
            <div className="h-full">
                <FloorCanvas
                    floor={{
                        id: floor.id,
                        name: floor.name,
                        imageUrl: floor.imageUrl || '',
                        order: floor.order,
                        status: floor.status,
                        createdAt: floor.createdAt,
                        updatedAt: floor.updatedAt,
                    }}
                    tables={floorData.tables}
                    selectedTable={null}
                    onTableSelect={handleTableSelect}
                    onTableDrop={() => {}} // No-op for POS view
                    onTableResize={() => {}} // No-op for POS view
                    isDragging={false}
                    onDragStart={() => {}} // No-op for POS view
                    onDragEnd={() => {}} // No-op for POS view
                    modeView="booking" // Use booking mode to disable editing but allow clicking
                />
            </div>
        </div>
    );
}
