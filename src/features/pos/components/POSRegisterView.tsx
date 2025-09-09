'use client';

import {
    User,
    FileText,
    UtensilsCrossed,
    Plus,
    Table,
    ChefHat,
    ShoppingCart,
    Settings,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import { useSendOrderToKitchen } from '@/api/v1/kds';
import { ProductDetailResponse } from '@/api/v1/menu/products';
import {
    useCreateOrUpdatePOSOrder,
    usePOSOrder,
    POSOrderCreateOrUpdateRequest,
    POSOrderCreateOrUpdateResponse,
} from '@/api/v1/pos-orders';
import {
    usePOSTableStatus,
    usePOSTableOccupancy,
    POSTableStatus,
    shouldDisableTable,
    getTableStatusText,
    isTableAvailable,
} from '@/api/v1/pos-table-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useAllTables, Table as TableType } from '@/hooks/use-all-tables';
import { formatVND } from '@/lib/format-currency';

// Import POS components
import { POSOrderSummary } from './POSOrderSummary';
import { POSProductGrid } from './POSProductGrid';
import { POSProductVariantModal } from './POSProductVariantModal';

// Enum for left sidebar tabs
export enum POSLeftTab {
    ORDER = 'order',
    SETTINGS = 'settings',
}

// Types for order management
export interface POSOrderItem {
    id: string; // Local unique ID for frontend
    orderItemId?: number; // Backend item ID for updates
    productId: number;
    variantId?: number;
    isCombo?: boolean;
    comboId?: number;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    attributes?: string;
    notes?: string[];
    itemStatus?: string; // RECEIVED, PREPARING, READY, COMPLETED
}

interface POSRegisterViewProps {
    selectedTables: TableType[];
    setSelectedTables: (tables: TableType[]) => void;
    onOrderCreated?: (orderId: number) => void;
    editingOrderId?: number | null;
    setEditingOrderId: (orderId: number | null) => void;
}

type OrderType = 'DINE_IN' | 'TAKEOUT';

export function POSRegisterView({
    selectedTables = [],
    setSelectedTables,
    onOrderCreated,
    editingOrderId = null,
    setEditingOrderId,
}: POSRegisterViewProps) {
    const { user } = useAuth();

    // State
    const [orderItems, setOrderItems] = useState<POSOrderItem[]>([]);
    const [currentOrder, setCurrentOrder] =
        useState<POSOrderCreateOrUpdateResponse | null>(null);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductDetailResponse | null>(null);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    const [activeLeftTab, setActiveLeftTab] = useState<POSLeftTab>(
        POSLeftTab.ORDER
    );

    // Get branch ID from user
    const branchId = user?.branch?.id;

    // Fetch tables from all floors
    const { tables: allTables } = useAllTables(branchId ?? 0);

    // Add function to handle new order
    const handleNewOrder = async () => {
        if (orderItems.length > 0) {
            await createOrUpdateOrder(orderItems);
        }
        setOrderItems([]);
        setEditingOrderId(null);
        setCustomerName('');
        setCustomerPhone('');
        setOrderNotes('');
        setOrderType('DINE_IN');
        // Reset selected tables for new order
        setSelectedTables([]);
        setCurrentOrder(null);
        onOrderCreated?.(0); // Pass 0 to indicate a new order
    };

    // Use tables from all floors
    const tables = allTables;

    // Get unique floor IDs for table status fetching
    const floorIds = useMemo(() => {
        const uniqueFloorIds = [
            ...new Set(
                (tables || []).map((table) => table.floorId).filter(Boolean)
            ),
        ];
        return uniqueFloorIds as number[];
    }, [tables]);

    // Fetch table status for each floor (only when Settings tab is active)
    const showDetailedStatus = activeLeftTab === POSLeftTab.SETTINGS;
    const floor1Status = usePOSTableStatus(
        floorIds[0] || 0,
        showDetailedStatus && floorIds.length > 0
    );
    const floor2Status = usePOSTableStatus(
        floorIds[1] || 0,
        showDetailedStatus && floorIds.length > 1
    );
    const floor3Status = usePOSTableStatus(
        floorIds[2] || 0,
        showDetailedStatus && floorIds.length > 2
    );
    const floor4Status = usePOSTableStatus(
        floorIds[3] || 0,
        showDetailedStatus && floorIds.length > 3
    );
    const floor5Status = usePOSTableStatus(
        floorIds[4] || 0,
        showDetailedStatus && floorIds.length > 4
    );

    // Fetch occupancy data for each floor
    const floor1Occupancy = usePOSTableOccupancy(
        floorIds[0] || 0,
        showDetailedStatus && floorIds.length > 0
    );
    const floor2Occupancy = usePOSTableOccupancy(
        floorIds[1] || 0,
        showDetailedStatus && floorIds.length > 1
    );
    const floor3Occupancy = usePOSTableOccupancy(
        floorIds[2] || 0,
        showDetailedStatus && floorIds.length > 2
    );
    const floor4Occupancy = usePOSTableOccupancy(
        floorIds[3] || 0,
        showDetailedStatus && floorIds.length > 3
    );
    const floor5Occupancy = usePOSTableOccupancy(
        floorIds[4] || 0,
        showDetailedStatus && floorIds.length > 4
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

    // Check if any table status API calls are loading
    const isLoadingTableStatus = [
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
    ].some((query) => query.isLoading && showDetailedStatus);

    // API hooks
    const createOrderMutation = useCreateOrUpdatePOSOrder();
    const sendToKitchenMutation = useSendOrderToKitchen();

    // Fetch editing order if editingOrderId is provided
    const { data: editingOrder, refetch: refetchOrder } = usePOSOrder(
        editingOrderId ?? currentOrder?.id ?? -1
    );

    // Effect to load editing order data
    useEffect(() => {
        if (editingOrder) {
            // Convert order items to local POSOrderItem format
            const convertedItems: POSOrderItem[] = editingOrder.items.map(
                (item: any) => ({
                    id: `${item.id}`,
                    orderItemId: item.id,
                    productId: item.productId ?? item.foodComboId,
                    variantId: item.variantId,
                    isCombo: item.isCombo,
                    comboId: item.foodComboId,
                    name: item.productName ?? item.comboName ?? 'Unknown Item',
                    description: item.attributeCombination ?? undefined,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    attributes: item.attributeCombination,
                    notes: item.notes ? [item.notes] : [],
                    itemStatus: item.itemStatus ?? 'RECEIVED',
                })
            );

            setOrderItems(convertedItems);
            // Convert POSOrder to POSOrderCreateOrUpdateResponse format
            // Use the new tables array from API response, or fallback to old single table format
            const tables =
                editingOrder.tables && editingOrder.tables.length > 0
                    ? editingOrder.tables
                    : editingOrder.tableId && editingOrder.tableName
                      ? [
                            {
                                id: 1, // Mock ID for backward compatibility
                                tableId: editingOrder.tableId,
                                tableName: editingOrder.tableName,
                                isPrimary: true,
                                notes: null,
                            },
                        ]
                      : [];

            // Convert items to the expected format for order response
            const responseItems = editingOrder.items.map((item: any) => ({
                id: item.id,
                productId: item.productId,
                productName: item.productName ?? null,
                variantId: item.variantId ?? null,
                variantName: null, // Not available in POSOrderItem
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                notes: item.notes ?? null,
                attributeCombination: item.attributeCombination ?? null,
                itemStatus: item.itemStatus ?? 'RECEIVED',
                isCombo: item.isCombo ?? false,
                foodComboId: item.foodComboId ?? null,
                comboName: item.comboName ?? null,
                promotionPrice: null, // Not available in POSOrderItem
            }));

            const convertedOrder: POSOrderCreateOrUpdateResponse = {
                id: editingOrder.id,
                orderNumber: editingOrder.orderNumber,
                tables,
                status: editingOrder.status,
                orderStatus: editingOrder.status,
                orderType:
                    editingOrder.orderType ??
                    (editingOrder.tableId ? 'DINE_IN' : 'TAKEOUT'),
                items: responseItems,
                subtotal: editingOrder.subtotal,
                tax: editingOrder.tax,
                total: editingOrder.total,
                customerName: editingOrder.customerName ?? null,
                customerPhone: editingOrder.customerPhone ?? null,
                notes: editingOrder.notes ?? null,
                payments: editingOrder.payments,
                createdAt: editingOrder.createdAt,
                updatedAt: editingOrder.updatedAt,
                createdBy: editingOrder.createdBy,
            };
            setCurrentOrder(convertedOrder);
            setEditingOrderId(convertedOrder.id);
            setCustomerName(editingOrder.customerName ?? '');
            setCustomerPhone(editingOrder.customerPhone ?? '');
            setOrderNotes(editingOrder.notes ?? '');

            // Use the existing orderType from the order, or fallback to logic based on tables
            if (
                editingOrder.orderType &&
                ['DINE_IN', 'TAKEOUT', 'DELIVERY'].includes(
                    editingOrder.orderType
                )
            ) {
                setOrderType(editingOrder.orderType as OrderType);
            } else {
                // Fallback logic for orders without orderType field
                setOrderType(editingOrder.tableId ? 'DINE_IN' : 'TAKEOUT');
            }

            // Load tables from editing order - handle both new tables array and old single table format
            if (editingOrder.tables && editingOrder.tables.length > 0) {
                // Use new tables array format
                const orderTables: TableType[] = editingOrder.tables.map(
                    (table: any) => ({
                        id: table.tableId,
                        name: table.tableName,
                        status: 'OCCUPIED', // Assume occupied since it has an order
                    })
                );
                setSelectedTables(orderTables);
            } else if (editingOrder.tableId && editingOrder.tableName) {
                // Fallback to old single table format
                const orderTable: TableType = {
                    id: editingOrder.tableId,
                    name: editingOrder.tableName,
                    status: 'OCCUPIED', // Assume occupied since it has an order
                };
                setSelectedTables([orderTable]);
            } else {
                // No tables (e.g., takeout or delivery orders)
                setSelectedTables([]);
            }
        }
    }, [editingOrder, editingOrderId, setEditingOrderId, setSelectedTables]);

    // Debounce timer for customer info updates
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Keep track of previous customer info to avoid unnecessary API calls
    const prevCustomerInfoRef = useRef<{ phone: string; name: string }>({
        phone: '',
        name: '',
    });

    // Effect for order type changes (immediate)
    useEffect(() => {
        if (orderType === 'TAKEOUT') {
            setSelectedTables([]);
        }
        if (currentOrder?.id != null) {
            createOrUpdateOrder(
                orderItems,
                orderType == 'DINE_IN' ? selectedTables : []
            );
        }
    }, [orderType]);

    // Debounced function for customer info updates
    const debouncedUpdateCustomerInfo = useCallback(
        (phone: string, name: string) => {
            // Clear existing timer
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            // Check if customer info actually changed
            const prevInfo = prevCustomerInfoRef.current;
            const hasChanged =
                prevInfo.phone !== phone || prevInfo.name !== name;

            // Only update if we have an existing order and customer info has actually changed
            if (currentOrder?.id != null && hasChanged) {
                debounceTimerRef.current = setTimeout(async () => {
                    try {
                        // Update the previous values
                        prevCustomerInfoRef.current = {
                            phone,
                            name,
                        };

                        // Create a new request with current order items and updated customer info
                        const apiItems = orderItems.map((item) => ({
                            orderItemId: item.orderItemId || undefined,
                            productId: item.isCombo
                                ? undefined
                                : item.productId,
                            variantId: item.variantId || undefined,
                            comboId: item.comboId || undefined,
                            quantity: item.quantity,
                            notes: item.notes?.join(', ') || '',
                            attributeCombination: item.attributes,
                        }));

                        const orderRequest: POSOrderCreateOrUpdateRequest = {
                            orderId: currentOrder?.id,
                            tableIds:
                                selectedTables?.map((table) => table.id) || [],
                            items: apiItems,
                            customerName: name,
                            customerPhone: phone,
                            notes: orderNotes,
                            orderType,
                        };

                        const result =
                            await createOrderMutation.mutateAsync(orderRequest);

                        // Update local state from API response
                        setCurrentOrder(result);
                    } catch (error) {
                        console.error('Error updating customer info:', error);
                    }
                }, 500); // Reduced to 500ms for better responsiveness
            }
        },
        [
            currentOrder?.id,
            orderItems,
            selectedTables,
            orderNotes,
            orderType,
            createOrderMutation,
        ]
    );

    // Effect for customer info updates
    useEffect(() => {
        if (currentOrder?.id) {
            // Only update if we have an existing order
            debouncedUpdateCustomerInfo(customerPhone, customerName);
        }

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [
        customerPhone,
        customerName,
        currentOrder?.id,
        debouncedUpdateCustomerInfo,
    ]);

    // Effect to sync initial selected tables
    useEffect(() => {
        if (selectedTables.length > 0 && !editingOrderId) {
            setSelectedTables(selectedTables);
        }
    }, [editingOrderId]);

    // Calculate order totals from current order or local items
    const subtotal =
        currentOrder?.subtotal ||
        orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = currentOrder?.tax || subtotal * 0.1; // 10% tax
    const total = currentOrder?.total || subtotal + tax;

    // Helper function to check if order has items with RECEIVED status or new items
    const hasReceivedItems = () => {
        return orderItems.some((item) => item.itemStatus === 'RECEIVED');
    };

    // Helper function to check if Send To Kitchen button should be enabled
    const canSendToKitchen = () => {
        return currentOrder?.id && hasReceivedItems();
    };

    // Handle send to kitchen
    const handleSendToKitchen = async () => {
        if (!currentOrder?.id) return;

        try {
            await sendToKitchenMutation.mutateAsync(currentOrder.id);
            refetchOrder();

            // Success feedback could be added here
        } catch (error) {
            console.error('Failed to send order to kitchen:', error);
            // Error feedback could be added here
        }
    };

    // Helper function to create or update order when items change
    const createOrUpdateOrder = async (
        items: POSOrderItem[],
        customTables?: TableType[]
    ) => {
        const tablesToUse = customTables || selectedTables;

        // If customTables is provided, update selectedTables immediately to prevent race conditions
        if (customTables) {
            setSelectedTables(customTables);
        }

        try {
            // Convert items to new API format with orderItemId
            const apiItems = items.map((item) => ({
                orderItemId: item.orderItemId || undefined,
                productId: item.isCombo ? undefined : item.productId,
                variantId: item.variantId || undefined,
                comboId: item.comboId || undefined,
                quantity: item.quantity,
                notes: item.notes?.join(', '),
                attributeCombination: item.attributes,
            }));

            const orderRequest: POSOrderCreateOrUpdateRequest = {
                orderId: currentOrder?.id,
                tableIds: tablesToUse?.map((table) => table.id) || [],
                items: apiItems,
                customerName, // Always send customerName, even if empty
                customerPhone, // Always send customerPhone, even if empty
                notes: orderNotes || undefined,
                orderType,
            };

            const result = await createOrderMutation.mutateAsync(orderRequest);

            // Update local state from API response
            const updatedItems: POSOrderItem[] = result.items.map(
                (apiItem: any) => ({
                    id: `${apiItem.id}`,
                    orderItemId: apiItem.id,
                    productId: apiItem.productId || apiItem.foodComboId,
                    variantId: apiItem.variantId,
                    isCombo: apiItem.isCombo,
                    comboId: apiItem.foodComboId,
                    name:
                        apiItem.productName ||
                        apiItem.comboName ||
                        'Unknown Item',
                    description: apiItem.attributeCombination,
                    quantity: apiItem.quantity,
                    unitPrice: apiItem.unitPrice,
                    totalPrice: apiItem.totalPrice,
                    attributes: apiItem.attributeCombination,
                    notes: apiItem.notes ? [apiItem.notes] : [],
                    itemStatus: apiItem.itemStatus,
                })
            );

            // Update local order items with API response data
            setOrderItems(updatedItems);
            setCurrentOrder(result);
            setEditingOrderId(result.id);

            // Call onOrderCreated with the order ID if this is a new order
            if (!currentOrder?.id && result.id) {
                onOrderCreated?.(result.id);
            }

            // Update selected tables from API response
            if (result.tables && result.tables.length > 0) {
                const responseTables: TableType[] = result.tables.map(
                    (table: any) => ({
                        id: table.tableId,
                        name: table.tableName,
                        status: 'OCCUPIED', // Assume occupied since it has an order
                    })
                );
                setSelectedTables(responseTables);
            }
        } catch (error) {
            console.error('Error creating/updating order:', error);
        }
    };

    // Handle notes changes
    const handleNotesChange = async (itemId: string, notes: string[]) => {
        const newOrderItems = orderItems.map((item) =>
            item.id === itemId ? { ...item, notes } : item
        );

        // Update local state
        setOrderItems(newOrderItems);

        // Update the order in the backend
        await createOrUpdateOrder(newOrderItems);
    };

    // Handle product selection - add variant directly to order or increase quantity
    const handleProductSelect = async (product: any) => {
        // Check if this variant already exists in the order with RECEIVED status
        const existingItemIndex = orderItems.findIndex(
            (item) =>
                item.variantId === product.variantId &&
                item.productId === product.id &&
                item.itemStatus === 'RECEIVED'
        );

        let newOrderItems: POSOrderItem[];

        if (existingItemIndex >= 0) {
            // If RECEIVED item exists, increase quantity
            newOrderItems = orderItems.map((item, index) =>
                index === existingItemIndex
                    ? {
                          ...item,
                          quantity: item.quantity + 1,
                          totalPrice: (item.quantity + 1) * item.unitPrice,
                      }
                    : item
            );
        } else {
            // If item doesn't exist or not RECEIVED, add new item
            const newItem: POSOrderItem = {
                id: `${product.id}-${product.variantId || 'base'}-${Date.now()}`,
                orderItemId: undefined, // New item, no backend ID yet
                productId: product.isCombo ? null : product.id,
                variantId: product.variantId,
                isCombo: product.isCombo || false,
                comboId: product.isCombo ? product.id : null,
                name: product.displayName || product.productTemplateName,
                description:
                    product.description || product.attributeCombination,
                quantity: 1,
                unitPrice: product.price || product.effectivePrice || 0,
                totalPrice: product.price || product.effectivePrice || 0,
                attributes: product.attributeCombination,
                notes: [], // Start with empty notes - let user add their own
                itemStatus: 'RECEIVED', // New items start as RECEIVED
            };
            newOrderItems = [...orderItems, newItem];
        }

        // Update local state
        setOrderItems(newOrderItems);

        // Create or update the order in the backend
        await createOrUpdateOrder(newOrderItems);
    };

    // Handle variant selection and add to order
    const handleVariantSelect = (variant: any) => {
        if (!selectedProduct) return;

        const newItem: POSOrderItem = {
            id: `${variant.id}-${Date.now()}`,
            productId: selectedProduct.id,
            variantId: variant.id,
            name:
                variant.displayName ||
                `${selectedProduct.name} - ${variant.name}`,
            description: variant.attributeCombination || variant.name,
            quantity: 1,
            unitPrice:
                variant.effectivePrice ||
                variant.price ||
                selectedProduct.price ||
                0,
            totalPrice:
                variant.effectivePrice ||
                variant.price ||
                selectedProduct.price ||
                0,
            attributes: variant.attributeCombination,
        };

        setOrderItems((prev) => [...prev, newItem]);
        setShowVariantModal(false);
        setSelectedProduct(null);
    };

    // Handle quantity changes
    const handleQuantityChange = async (
        itemId: string,
        newQuantity: number
    ) => {
        let newOrderItems: POSOrderItem[];

        if (newQuantity <= 0) {
            // Remove item if quantity is 0 or less
            newOrderItems = orderItems.filter((item) => item.id !== itemId);
        } else {
            const targetItem = orderItems.find((item) => item.id === itemId);

            if (!targetItem) return;

            // Only allow direct quantity update for RECEIVED items
            if (targetItem.itemStatus === 'RECEIVED') {
                // Update existing item quantity
                newOrderItems = orderItems.map((item) =>
                    item.id === itemId
                        ? {
                              ...item,
                              quantity: newQuantity,
                              totalPrice: item.unitPrice * newQuantity,
                          }
                        : item
                );
            } else {
                // For non-RECEIVED items, create a new item instead of updating
                const newItem: POSOrderItem = {
                    id: `${targetItem.productId}-${targetItem.variantId || 'base'}-${Date.now()}`,
                    orderItemId: undefined, // New item, no backend ID yet
                    productId: targetItem.productId,
                    variantId: targetItem.variantId,
                    name: targetItem.name,
                    description: targetItem.description,
                    quantity: newQuantity,
                    unitPrice: targetItem.unitPrice,
                    totalPrice: targetItem.unitPrice * newQuantity,
                    attributes: targetItem.attributes,
                    notes: [], // Start with empty notes for new item
                    itemStatus: 'RECEIVED', // New items start as RECEIVED
                };

                newOrderItems = [...orderItems, newItem];
            }
        }

        // Update local state
        setOrderItems(newOrderItems);

        // Update the order in the backend
        await createOrUpdateOrder(newOrderItems);
    };

    // Tab configuration
    const leftTabs = [
        {
            id: POSLeftTab.ORDER,
            label: 'Order Items',
            icon: ShoppingCart,
            active: activeLeftTab === POSLeftTab.ORDER,
        },
        {
            id: POSLeftTab.SETTINGS,
            label: 'Settings',
            icon: Settings,
            active: activeLeftTab === POSLeftTab.SETTINGS,
        },
    ];

    // Update header section JSX
    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Panel - Tabbed Interface */}
            <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200">
                    <div className="flex">
                        {leftTabs.map((tab) => (
                            <Button
                                key={tab.id}
                                variant={tab.active ? 'default' : 'ghost'}
                                className={`flex-1 h-12 rounded-none border-0 ${
                                    tab.active
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                                onClick={() => setActiveLeftTab(tab.id)}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                {activeLeftTab === POSLeftTab.ORDER && (
                    <>
                        {/* Order Header */}
                        <div className="p-3 border-b border-gray-200">
                            {/* Order ID Display */}
                            {(currentOrder?.id ||
                                selectedTables.length > 0) && (
                                <div className="mb-3 px-2 py-1.5 bg-blue-50 rounded-md">
                                    {currentOrder?.id && (
                                        <div className="text-xs font-medium text-blue-800">
                                            Order #{currentOrder.id}
                                        </div>
                                    )}
                                    {selectedTables.length > 0 && (
                                        <div className="text-xs text-blue-600 mt-0.5">
                                            Tables:{' '}
                                            {selectedTables
                                                .map((table) => table.name)
                                                .join(', ')}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Customer Information */}
                            <div className="mb-3">
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div>
                                        <Label
                                            htmlFor="customerPhone"
                                            className="text-xs text-gray-600"
                                        >
                                            Phone
                                        </Label>
                                        <Input
                                            id="customerPhone"
                                            value={customerPhone}
                                            onChange={(e) =>
                                                setCustomerPhone(e.target.value)
                                            }
                                            placeholder="Phone number"
                                            disabled={
                                                createOrderMutation.isPending
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="customerName"
                                            className="text-xs text-gray-600"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="customerName"
                                            value={customerName}
                                            onChange={(e) =>
                                                setCustomerName(e.target.value)
                                            }
                                            placeholder="Customer name"
                                            disabled={
                                                createOrderMutation.isPending
                                            }
                                            className="h-7 text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Order Notes */}
                                <div className="mb-2">
                                    <Label
                                        htmlFor="orderNotes"
                                        className="text-xs text-gray-600"
                                    >
                                        Order Notes
                                    </Label>
                                    <Input
                                        id="orderNotes"
                                        value={orderNotes}
                                        onChange={(e) => {
                                            setOrderNotes(e.target.value);
                                            // Auto update order with new notes if order exists
                                            if (currentOrder?.id) {
                                                debouncedUpdateCustomerInfo(
                                                    customerPhone,
                                                    customerName
                                                );
                                            }
                                        }}
                                        placeholder="Add notes for this order..."
                                        disabled={createOrderMutation.isPending}
                                        className="h-7 text-xs"
                                    />
                                </div>

                                {/* New Order Button */}
                                <Button
                                    variant="outline"
                                    className="w-full h-7 text-xs"
                                    onClick={handleNewOrder}
                                    disabled={createOrderMutation.isPending}
                                >
                                    <Plus className="w-3 h-3 mr-1" />
                                    New Order
                                </Button>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex-1 overflow-y-auto max-h-[calc(100vh-500px)]">
                            <POSOrderSummary
                                items={orderItems}
                                onQuantityChange={handleQuantityChange}
                                onNotesChange={handleNotesChange}
                                subtotal={subtotal}
                                tax={tax}
                                total={total}
                                disabled={createOrderMutation.isPending}
                            />
                        </div>

                        {/* Order Total - Sticky Bottom */}
                        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3">
                            <div className="space-y-2">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">
                                            Subtotal
                                        </span>
                                        <span className="font-medium">
                                            {formatVND(subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                        <span className="text-gray-600">
                                            Tax (10%)
                                        </span>
                                        <span className="font-medium">
                                            {formatVND(tax)}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-1">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span>Total</span>
                                            <span>{formatVND(total)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Send to Kitchen button - always show */}
                                <Button
                                    className="w-full h-8 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-xs"
                                    onClick={handleSendToKitchen}
                                    disabled={
                                        !canSendToKitchen() ||
                                        sendToKitchenMutation.isPending
                                    }
                                >
                                    <ChefHat className="w-3 h-3 mr-1" />
                                    {sendToKitchenMutation.isPending
                                        ? 'Sending...'
                                        : 'Send to Kitchen'}
                                </Button>
                            </div>
                        </div>
                    </>
                )}

                {activeLeftTab === POSLeftTab.SETTINGS && (
                    <div className="flex-1 overflow-y-auto p-3">
                        {/* Current Order Info */}
                        {currentOrder?.id && (
                            <div className="mb-4 p-2 bg-blue-50 rounded-md">
                                <div className="text-xs font-medium text-blue-800 mb-1">
                                    Order #{currentOrder.id}
                                </div>
                                {selectedTables.length > 0 && (
                                    <div className="text-xs text-blue-600">
                                        Tables:{' '}
                                        {selectedTables
                                            .map((t) => t.name)
                                            .join(', ')}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Order Type Selection */}
                        <div className="mb-4">
                            <h3 className="text-xs font-medium text-gray-900 mb-2">
                                Order Type
                            </h3>
                            <div className="flex bg-gray-100 rounded-md p-1">
                                <Button
                                    variant={
                                        orderType === 'DINE_IN'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className="flex-1 h-7 px-2 text-xs"
                                    onClick={() => setOrderType('DINE_IN')}
                                    disabled={createOrderMutation.isPending}
                                >
                                    <UtensilsCrossed className="w-3 h-3 mr-1" />
                                    Dine In
                                </Button>
                                <Button
                                    variant={
                                        orderType === 'TAKEOUT'
                                            ? 'default'
                                            : 'ghost'
                                    }
                                    size="sm"
                                    className="flex-1 h-7 px-2 text-xs"
                                    onClick={() => setOrderType('TAKEOUT')}
                                    disabled={createOrderMutation.isPending}
                                >
                                    <User className="w-3 h-3 mr-1" />
                                    Take Away
                                </Button>
                            </div>
                        </div>

                        {/* Table Selection - Only show for DINE_IN */}
                        {orderType === 'DINE_IN' && (
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xs font-medium text-gray-900">
                                        Select Tables
                                    </h3>
                                    {!isLoadingTableStatus &&
                                        tables &&
                                        tables.length > 0 && (
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <span>
                                                    Total: {tables.length}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    {
                                                        tables.filter(
                                                            (table) => {
                                                                const tableStatus =
                                                                    allTableStatuses.get(
                                                                        table.id
                                                                    );
                                                                const status =
                                                                    tableStatus?.currentStatus ||
                                                                    POSTableStatus.AVAILABLE;
                                                                return isTableAvailable(
                                                                    status
                                                                );
                                                            }
                                                        ).length
                                                    }
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    {
                                                        tables.filter(
                                                            (table) => {
                                                                const tableStatus =
                                                                    allTableStatuses.get(
                                                                        table.id
                                                                    );
                                                                const status =
                                                                    tableStatus?.currentStatus ||
                                                                    POSTableStatus.AVAILABLE;
                                                                return !isTableAvailable(
                                                                    status
                                                                );
                                                            }
                                                        ).length
                                                    }
                                                </span>
                                            </div>
                                        )}
                                </div>

                                {/* {selectedTables.length > 0 && (
                                    <div className="mb-2 p-1.5 bg-green-50 rounded-md border border-green-200">
                                        <div className="text-xs text-green-800 font-medium">
                                            Selected: {selectedTables.map((table) => table.name).join(', ')}
                                        </div>
                                    </div>
                                )} */}

                                {isLoadingTableStatus ? (
                                    <div className="flex items-center justify-center h-24 bg-gray-50 rounded-md">
                                        <div className="text-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto mb-1"></div>
                                            <p className="text-xs text-gray-600">
                                                Loading table status...
                                            </p>
                                        </div>
                                    </div>
                                ) : tables && tables.length > 0 ? (
                                    <div className="max-h-[50vh] overflow-y-auto border border-gray-200 rounded-lg bg-white">
                                        {/* Group tables by floor */}
                                        {(() => {
                                            // Group tables by floorName
                                            const tablesByFloor = tables.reduce(
                                                (acc, table) => {
                                                    const floorName =
                                                        table.floorName ||
                                                        'Unknown Floor';
                                                    if (!acc[floorName]) {
                                                        acc[floorName] = [];
                                                    }
                                                    acc[floorName].push(table);
                                                    return acc;
                                                },
                                                {} as Record<
                                                    string,
                                                    typeof tables
                                                >
                                            );

                                            return Object.entries(tablesByFloor)
                                                .sort(([a], [b]) =>
                                                    a.localeCompare(b)
                                                )
                                                .map(
                                                    ([
                                                        floorName,
                                                        floorTables,
                                                    ]) => (
                                                        <div
                                                            key={floorName}
                                                            className="border-b border-gray-100 last:border-b-0"
                                                        >
                                                            {/* Floor Header */}
                                                            <div className="sticky top-0 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 border-b border-gray-200 z-10">
                                                                <div className="flex items-center justify-between">
                                                                    <h4 className="text-xs font-semibold text-gray-800 flex items-center">
                                                                        <div className="w-1.5 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-2"></div>
                                                                        {
                                                                            floorName
                                                                        }
                                                                    </h4>
                                                                    <div className="flex items-center gap-3 text-xs">
                                                                        <span className="flex items-center gap-1 px-2 py-1 bg-green-100 rounded-full">
                                                                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                                            <span className="text-green-700 font-medium">
                                                                                {
                                                                                    floorTables.filter(
                                                                                        (
                                                                                            table
                                                                                        ) => {
                                                                                            const tableStatus =
                                                                                                allTableStatuses.get(
                                                                                                    table.id
                                                                                                );
                                                                                            const status =
                                                                                                tableStatus?.currentStatus ||
                                                                                                POSTableStatus.AVAILABLE;
                                                                                            return isTableAvailable(
                                                                                                status
                                                                                            );
                                                                                        }
                                                                                    )
                                                                                        .length
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                        <span className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                                                                            <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                                                            <span className="text-red-700 font-medium">
                                                                                {
                                                                                    floorTables.filter(
                                                                                        (
                                                                                            table
                                                                                        ) => {
                                                                                            const tableStatus =
                                                                                                allTableStatuses.get(
                                                                                                    table.id
                                                                                                );
                                                                                            const status =
                                                                                                tableStatus?.currentStatus ||
                                                                                                POSTableStatus.AVAILABLE;
                                                                                            return !isTableAvailable(
                                                                                                status
                                                                                            );
                                                                                        }
                                                                                    )
                                                                                        .length
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                        <span className="text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium">
                                                                            {
                                                                                floorTables.length
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Floor Tables */}
                                                            <div className="p-3">
                                                                <div className="grid grid-cols-3 gap-2">
                                                                    {floorTables
                                                                        .sort(
                                                                            (
                                                                                a,
                                                                                b
                                                                            ) => {
                                                                                // Sort by table name/number
                                                                                const aNum =
                                                                                    parseInt(
                                                                                        a.name.replace(
                                                                                            /\D/g,
                                                                                            ''
                                                                                        )
                                                                                    ) ||
                                                                                    0;
                                                                                const bNum =
                                                                                    parseInt(
                                                                                        b.name.replace(
                                                                                            /\D/g,
                                                                                            ''
                                                                                        )
                                                                                    ) ||
                                                                                    0;
                                                                                return (
                                                                                    aNum -
                                                                                        bNum ||
                                                                                    a.name.localeCompare(
                                                                                        b.name
                                                                                    )
                                                                                );
                                                                            }
                                                                        )
                                                                        .map(
                                                                            (
                                                                                table
                                                                            ) => {
                                                                                const isSelected =
                                                                                    selectedTables.some(
                                                                                        (
                                                                                            selected
                                                                                        ) =>
                                                                                            selected.id ===
                                                                                            table.id
                                                                                    );

                                                                                // Get real-time table status and occupancy
                                                                                const tableStatus =
                                                                                    allTableStatuses.get(
                                                                                        table.id
                                                                                    );
                                                                                const occupancyInfo =
                                                                                    allTableOccupancy.get(
                                                                                        table.id
                                                                                    );
                                                                                const realTimeStatus =
                                                                                    tableStatus?.currentStatus ||
                                                                                    POSTableStatus.AVAILABLE;
                                                                                const isOccupied =
                                                                                    shouldDisableTable(
                                                                                        realTimeStatus
                                                                                    );

                                                                                // Can select if: available OR already selected (to allow deselection)
                                                                                const canSelect =
                                                                                    !isOccupied ||
                                                                                    isSelected;

                                                                                // Get detailed status text
                                                                                let statusText =
                                                                                    'Available';
                                                                                let statusColor =
                                                                                    'text-green-600';

                                                                                if (
                                                                                    isOccupied &&
                                                                                    occupancyInfo?.occupancyDetails
                                                                                ) {
                                                                                    const details =
                                                                                        occupancyInfo.occupancyDetails;
                                                                                    if (
                                                                                        details.occupationType ===
                                                                                        'POS_ORDER'
                                                                                    ) {
                                                                                        statusText = `Order #${details.orderId}`;
                                                                                        statusColor =
                                                                                            'text-orange-600';
                                                                                    } else if (
                                                                                        details.occupationType ===
                                                                                            'BOOKING_TABLE' ||
                                                                                        details.occupationType ===
                                                                                            'UPCOMING_BOOKING'
                                                                                    ) {
                                                                                        const startTime =
                                                                                            details.startTime
                                                                                                ? new Date(
                                                                                                      details.startTime
                                                                                                  ).toLocaleTimeString(
                                                                                                      [],
                                                                                                      {
                                                                                                          hour: '2-digit',
                                                                                                          minute: '2-digit',
                                                                                                      }
                                                                                                  )
                                                                                                : '';
                                                                                        statusText = `Booking ${startTime}`;
                                                                                        statusColor =
                                                                                            'text-blue-600';
                                                                                    } else {
                                                                                        statusText =
                                                                                            getTableStatusText(
                                                                                                realTimeStatus
                                                                                            );
                                                                                        statusColor =
                                                                                            'text-red-600';
                                                                                    }
                                                                                } else if (
                                                                                    isOccupied
                                                                                ) {
                                                                                    statusText =
                                                                                        getTableStatusText(
                                                                                            realTimeStatus
                                                                                        );
                                                                                    statusColor =
                                                                                        'text-red-600';
                                                                                }

                                                                                return (
                                                                                    <Button
                                                                                        key={
                                                                                            table.id
                                                                                        }
                                                                                        variant="outline"
                                                                                        size="sm"
                                                                                        className={`h-18 flex flex-col items-center justify-center gap-1 p-2 text-xs border-2 transition-all duration-200 relative overflow-hidden ${
                                                                                            !canSelect
                                                                                                ? 'opacity-50 grayscale cursor-not-allowed border-gray-300'
                                                                                                : isSelected
                                                                                                  ? 'border-green-500 bg-gradient-to-br from-green-50 to-green-100 shadow-lg ring-2 ring-green-200 transform scale-105'
                                                                                                  : isOccupied
                                                                                                    ? 'border-red-300 bg-gradient-to-br from-red-50 to-red-100 hover:bg-red-100'
                                                                                                    : 'border-gray-300 bg-gradient-to-br from-white to-gray-50 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50 hover:to-blue-100'
                                                                                        }`}
                                                                                        onClick={() => {
                                                                                            if (
                                                                                                !canSelect ||
                                                                                                createOrderMutation.isPending
                                                                                            )
                                                                                                return;

                                                                                            let newTables;
                                                                                            if (
                                                                                                isSelected
                                                                                            ) {
                                                                                                newTables =
                                                                                                    selectedTables.filter(
                                                                                                        (
                                                                                                            t
                                                                                                        ) =>
                                                                                                            t.id !==
                                                                                                            table.id
                                                                                                    );
                                                                                            } else {
                                                                                                const newTable =
                                                                                                    {
                                                                                                        id: table.id,
                                                                                                        name: table.name,
                                                                                                        status: table.status,
                                                                                                    };
                                                                                                newTables =
                                                                                                    [
                                                                                                        ...selectedTables,
                                                                                                        newTable,
                                                                                                    ];
                                                                                            }
                                                                                            setSelectedTables(
                                                                                                newTables
                                                                                            );

                                                                                            // Auto update order if exists
                                                                                            if (
                                                                                                currentOrder?.id
                                                                                            ) {
                                                                                                createOrUpdateOrder(
                                                                                                    orderItems,
                                                                                                    newTables
                                                                                                );
                                                                                            }
                                                                                        }}
                                                                                        disabled={
                                                                                            createOrderMutation.isPending ||
                                                                                            !canSelect
                                                                                        }
                                                                                    >
                                                                                        {/* Status indicator dot */}
                                                                                        <div className="absolute top-1.5 right-1.5">
                                                                                            <div
                                                                                                className={`w-2 h-2 rounded-full shadow-sm ${
                                                                                                    isSelected
                                                                                                        ? 'bg-green-500'
                                                                                                        : isOccupied
                                                                                                          ? 'bg-red-500'
                                                                                                          : 'bg-green-400'
                                                                                                }`}
                                                                                            ></div>
                                                                                        </div>

                                                                                        <span
                                                                                            className={`font-bold text-sm ${
                                                                                                isSelected
                                                                                                    ? 'text-green-800'
                                                                                                    : 'text-gray-800'
                                                                                            }`}
                                                                                        >
                                                                                            {
                                                                                                table.name
                                                                                            }
                                                                                        </span>

                                                                                        <span
                                                                                            className={`text-xs text-center leading-tight font-medium ${
                                                                                                isSelected
                                                                                                    ? 'text-green-700'
                                                                                                    : statusColor
                                                                                            }`}
                                                                                        >
                                                                                            {
                                                                                                statusText
                                                                                            }
                                                                                        </span>

                                                                                        {!canSelect && (
                                                                                            <span className="text-xs text-red-600 font-bold bg-red-200 px-1.5 py-0.5 rounded-full">
                                                                                                Unavailable
                                                                                            </span>
                                                                                        )}

                                                                                        {/* Selection checkmark */}
                                                                                        {isSelected && (
                                                                                            <div className="absolute top-1 left-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                                                                                                <div className="w-1.5 h-1 border-l-2 border-b-2 border-white transform rotate-[-45deg] -translate-y-0.5"></div>
                                                                                            </div>
                                                                                        )}
                                                                                    </Button>
                                                                                );
                                                                            }
                                                                        )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                );
                                        })()}
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-md text-center">
                                        No tables available
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Take Away Notice */}
                        {orderType === 'TAKEOUT' && (
                            <div className="mb-4 p-2 bg-green-50 rounded-md border border-green-200">
                                <div className="text-xs text-green-800 font-medium flex items-center">
                                    <User className="w-3 h-3 mr-1" />
                                    Take Away Order
                                </div>
                                <div className="text-xs text-green-600 mt-0.5">
                                    No table selection required for take away
                                    orders.
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Right Panel - Product Grid */}
            <div className="flex-1 bg-gray-50">
                <POSProductGrid
                    onProductSelect={handleProductSelect}
                    disabled={createOrderMutation.isPending}
                />
            </div>

            {/* Modals */}
            {showVariantModal && selectedProduct && (
                <POSProductVariantModal
                    product={selectedProduct}
                    onVariantSelect={handleVariantSelect}
                    onClose={() => {
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
}
