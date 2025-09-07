'use client';

import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { type BranchResponseDto } from '@/api/v1/branches';
import { type FloorResponse } from '@/api/v1/floors';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';

// Import POS components
import { POSOrdersView } from './POSOrdersView';
import { POSRegisterView } from './POSRegisterView';
import { POSTablesView } from './POSTablesView';
import { PreOrderList } from './PreOrderList';

// Types based on Odoo research
export enum POSTab {
    TABLES = 'tables',
    REGISTER = 'register',
    ORDERS = 'orders',
    PREORDERS = 'preorders',
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
    const router = useRouter();
    const { user, getDefaultRedirectByRole } = useAuth();
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
            name: tableName ?? `Table ${tableId}`,
            status: 'OCCUPIED',
        };
        setSelectedTables([table]);
        setIsClearOrder(false); // Don't clear order when selecting a table
        setActiveTab(POSTab.REGISTER);
    };

    // Handle new order (direct sale)
    const handleNewOrder = () => {
        setSelectedTables([]);
        setIsClearOrder(false); // Don't clear order when creating new order
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

    // Handle preorder conversion - navigate to register with new order
    const handlePreOrderConvert = (posOrderId: number) => {
        setEditingOrderId(posOrderId);
        setIsClearOrder(false);
        setActiveTab(POSTab.REGISTER);
    };

    // Handle back to app navigation
    const handleBackToApp = () => {
        if (user && user.userRoles && user.userRoles.length > 0) {
            const defaultRoute = getDefaultRedirectByRole(
                user.userRoles[0].role
            );
            router.push(defaultRoute);
        } else {
            router.push('/');
        }
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
            label: 'Menu',
            active: activeTab === POSTab.REGISTER,
        },
        {
            id: POSTab.ORDERS,
            label: 'Orders',
            active: activeTab === POSTab.ORDERS,
        },
        {
            id: POSTab.PREORDERS,
            label: 'PreOrders',
            active: activeTab === POSTab.PREORDERS,
        },
    ];

    // Auto-select first floor when floors are loaded
    useEffect(() => {
        if (floors.length > 0 && !selectedFloor) {
            setSelectedFloor(floors[0]);
        }
    }, [floors, selectedFloor]);

    // Handle tab changes - clear state when appropriate
    useEffect(() => {
        // Clear order-related state when switching tabs (except when going to register with a table)
        if (isClearOrder) {
            setCurrentOrderId(null);
            setEditingOrderId(null);
            setIsClearOrder(false); // Reset the flag
        }
    }, [activeTab, isClearOrder]);

    // Clear selected tables only when explicitly switching away from register
    const handleTabChange = (newTab: POSTab) => {
        if (activeTab === POSTab.REGISTER && newTab !== POSTab.REGISTER) {
            // Switching away from register - clear selected tables
            setSelectedTables([]);
            setIsClearOrder(true);
        }
        setActiveTab(newTab);
    };
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
                                onClick={() => handleTabChange(tab.id)}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>

                    {/* Right: Back to App */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleBackToApp}
                            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            <span>Back to App</span>
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
                        setEditingOrderId={setEditingOrderId}
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

                {activeTab === POSTab.PREORDERS && (
                    <PreOrderList
                        branchId={selectedBranch?.id || null}
                        onConvertSuccess={handlePreOrderConvert}
                    />
                )}
            </div>
        </div>
    );
}
