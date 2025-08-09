'use client';

import { Settings, MoreHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';

import { type BranchResponseDto } from '@/api/v1/branches';
import { type FloorResponse } from '@/api/v1/floors';
import { Button } from '@/components/ui/button';

// Import POS components
import { POSOrdersView } from './POSOrdersView';
import { POSRegisterView } from './POSRegisterView';
import { POSTablesView } from './POSTablesView';

// Types based on Odoo research
export enum POSTab {
    TABLES = 'tables',
    REGISTER = 'register',
    ORDERS = 'orders',
}

interface OdooPOSInterfaceProps {
    floors: FloorResponse[];
    isLoading: boolean;
    selectedBranch?: BranchResponseDto | null;
    onBranchSelect?: (branch: BranchResponseDto) => void;
}

export function OdooPOSInterface({
    floors,
    isLoading,
    selectedBranch,
    onBranchSelect,
}: OdooPOSInterfaceProps) {
    const [activeTab, setActiveTab] = useState<POSTab>(POSTab.TABLES);
    const [selectedFloor, setSelectedFloor] = useState<FloorResponse | null>(
        floors.length > 0 ? floors[0] : null
    );
    const [selectedTables, setSelectedTables] = useState<
        Array<{ id: number; name: string; status: string }>
    >([]);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);
    const [isClearOrder, setIsClearOrder] = useState(true);

    // Handle table selection - switches to register view
    const handleTableSelect = (tableId: number, tableName?: string) => {
        // Create table object with proper name
        const table = {
            id: tableId,
            name: tableName || `Table ${tableId}`,
            status: 'OCCUPIED',
        };
        setSelectedTables([table]);
        setActiveTab(POSTab.REGISTER);
    };

    // Handle new order (direct sale)
    const handleNewOrder = () => {
        setSelectedTables([]);
        setActiveTab(POSTab.REGISTER);
    };

    // Handle floor change
    const handleFloorChange = (floor: FloorResponse) => {
        setSelectedFloor(floor);
    };

    // Handle edit order - navigate to register with order data
    const handleEditOrder = (orderId: number) => {
        setEditingOrderId(orderId);
        setIsClearOrder(false);
        setActiveTab(POSTab.REGISTER);
    };

    // Tab configuration based on Odoo research
    const tabs = [
        {
            id: POSTab.TABLES,
            label: 'Tables',
            active: activeTab === POSTab.TABLES,
        },
        {
            id: POSTab.REGISTER,
            label: 'Register',
            active: activeTab === POSTab.REGISTER,
        },
        {
            id: POSTab.ORDERS,
            label: 'Orders',
            active: activeTab === POSTab.ORDERS,
        },
    ];

    useEffect(() => {
        setSelectedTables([]);
        if (isClearOrder) {
            setCurrentOrderId(null);
            setEditingOrderId(null);
        }
        setIsClearOrder(true);
    }, [activeTab]);
    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            {/* Header - Odoo Style */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Navigation Tabs */}
                    <div className="flex items-center space-x-1">
                        {tabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={tab.active ? 'default' : 'ghost'}
                                className={`px-6 py-2 font-medium transition-colors ${
                                    tab.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {/* Right: Controls */}
                    <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                            <Settings className="w-5 h-5" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
                {activeTab === POSTab.TABLES && (
                    <POSTablesView
                        floors={floors}
                        selectedFloor={selectedFloor}
                        isLoading={isLoading}
                        onFloorChange={handleFloorChange}
                        onTableSelect={handleTableSelect}
                        onEditOrder={handleEditOrder}
                        onNewOrder={handleNewOrder}
                        selectedBranch={selectedBranch}
                        onBranchSelect={onBranchSelect}
                    />
                )}

                {activeTab === POSTab.REGISTER && (
                    <POSRegisterView
                        selectedTables={selectedTables}
                        setSelectedTables={setSelectedTables}
                        editingOrderId={editingOrderId}
                        onOrderCreated={() => {
                            setCurrentOrderId(null);
                            setEditingOrderId(null);
                        }}
                    />
                )}

                {activeTab === POSTab.ORDERS && (
                    <POSOrdersView
                        currentOrderId={currentOrderId}
                        onOrderSelect={(orderId) => setCurrentOrderId(orderId)}
                        onEditOrder={handleEditOrder}
                    />
                )}
            </div>
        </div>
    );
}
