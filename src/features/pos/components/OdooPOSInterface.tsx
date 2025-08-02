'use client';

import { Settings, MoreHorizontal, Search } from 'lucide-react';
import { useState } from 'react';

import { type BranchResponseDto } from '@/api/v1/branches';
import { type FloorResponse } from '@/api/v1/floors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
    const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);
    const [editingOrderId, setEditingOrderId] = useState<number | null>(null);

    // Handle table selection - switches to register view
    const handleTableSelect = (tableId: number) => {
        setSelectedTableId(tableId);
        setActiveTab(POSTab.REGISTER);
    };

    // Handle new order (direct sale)
    const handleNewOrder = () => {
        setSelectedTableId(null);
        setActiveTab(POSTab.REGISTER);
    };

    // Handle floor change
    const handleFloorChange = (floor: FloorResponse) => {
        setSelectedFloor(floor);
    };

    // Handle edit order - navigate to register with order data
    const handleEditOrder = (orderId: number) => {
        setEditingOrderId(orderId);
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

                    {/* Center: Table Indicator (when table selected) */}
                    {selectedTableId && activeTab === POSTab.REGISTER && (
                        <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold text-lg">
                            Table {selectedTableId}
                        </div>
                    )}

                    {/* Center: Search (when in register mode) */}
                    {activeTab === POSTab.REGISTER && !selectedTableId && (
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg px-3 py-2">
                            <Search className="w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                className="border-0 bg-transparent focus:ring-0 focus:outline-none"
                            />
                        </div>
                    )}

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
                        onNewOrder={handleNewOrder}
                        selectedBranch={selectedBranch}
                        onBranchSelect={onBranchSelect}
                    />
                )}

                {activeTab === POSTab.REGISTER && (
                    <POSRegisterView
                        selectedTableId={selectedTableId}
                        editingOrderId={editingOrderId}
                        onOrderCreated={(orderId) => {
                            setCurrentOrderId(orderId);
                            setEditingOrderId(null); // Clear editing state
                            setActiveTab(POSTab.ORDERS);
                        }}
                        onBackToTables={() => {
                            setEditingOrderId(null); // Clear editing state
                            setActiveTab(POSTab.TABLES);
                        }}
                    />
                )}

                {activeTab === POSTab.ORDERS && (
                    <POSOrdersView
                        currentOrderId={currentOrderId}
                        onOrderSelect={(orderId) => setCurrentOrderId(orderId)}
                        onBackToRegister={() => setActiveTab(POSTab.REGISTER)}
                        onEditOrder={handleEditOrder}
                    />
                )}
            </div>
        </div>
    );
}
