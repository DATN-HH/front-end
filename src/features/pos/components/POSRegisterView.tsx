'use client';

import {
    User,
    FileText,
    UtensilsCrossed,
    Plus,
    Table,
    ChefHat,
} from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';

import { useSendOrderToKitchen } from '@/api/v1/kds';
import { ProductDetailResponse } from '@/api/v1/menu/products';
import {
    useCreateOrUpdatePOSOrder,
    usePOSOrder,
    POSOrderCreateOrUpdateRequest,
    POSOrderCreateOrUpdateResponse,
} from '@/api/v1/pos-orders';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useAllTables, Table as TableType } from '@/hooks/use-all-tables';
import { formatVND } from '@/lib/format-currency';

// Import POS components
import { POSOrderNotes } from './POSOrderNotes';
import { POSOrderSummary } from './POSOrderSummary';
import { POSProductGrid } from './POSProductGrid';
import { POSProductVariantModal } from './POSProductVariantModal';
import { POSTableSelector } from './POSTableSelector';

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
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [orderNotes, setOrderNotes] = useState('');

    const [showTableSelector, setShowTableSelector] = useState(false);

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

    // Handle table selection
    const handleTableSelection = (tables: TableType[]) => {
        setShowTableSelector(false);

        // If we have an existing order, update it with new tables
        if (currentOrder) {
            createOrUpdateOrder(orderItems, tables);
        } else {
            // If no existing order, just update selected tables
            setSelectedTables(tables);
        }
    };

    // Use tables from all floors
    const tables = allTables;

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
            const hasChanged = prevInfo.phone !== phone || prevInfo.name !== name;

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
                            productId: item.isCombo ? undefined : item.productId,
                            variantId: item.variantId || undefined,
                            comboId: item.comboId || undefined,
                            quantity: item.quantity,
                            notes: item.notes?.join(', ') || '',
                            attributeCombination: item.attributes,
                        }));

                        const orderRequest: POSOrderCreateOrUpdateRequest = {
                            orderId: currentOrder?.id,
                            tableIds: selectedTables?.map((table) => table.id) || [],
                            items: apiItems,
                            customerName: name,
                            customerPhone: phone,
                            notes: orderNotes,
                            orderType,
                        };

                        const result = await createOrderMutation.mutateAsync(orderRequest);

                        // Update local state from API response
                        setCurrentOrder(result);
                    } catch (error) {
                        console.error('Error updating customer info:', error);
                    }
                }, 500); // Reduced to 500ms for better responsiveness
            }
        },
        [currentOrder?.id, orderItems, selectedTables, orderNotes, orderType, createOrderMutation]
    );

    // Effect for customer info updates
    useEffect(() => {
        if (currentOrder?.id) { // Only update if we have an existing order
            debouncedUpdateCustomerInfo(customerPhone, customerName);
        }

        // Cleanup function
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [customerPhone, customerName, currentOrder?.id, debouncedUpdateCustomerInfo]);

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
                customerName: customerName,  // Always send customerName, even if empty
                customerPhone: customerPhone,  // Always send customerPhone, even if empty
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

    // Update header section JSX
    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Panel - Order Summary */}
            <div className="w-[480px] bg-white border-r border-gray-200 flex flex-col">
                {/* Order Header */}
                <div className="p-4 border-b border-gray-200">
                    {/* Order ID Display */}
                    {(currentOrder?.id || selectedTables.length > 0) && (
                        <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg">
                            {currentOrder?.id && (
                                <div className="text-sm font-medium text-blue-800">
                                    Order #{currentOrder.id}
                                </div>
                            )}
                            {selectedTables.length > 0 && (
                                <div className="text-sm text-blue-600 mt-1">
                                    Tables:{' '}
                                    {selectedTables
                                        .map((table) => table.name)
                                        .join(', ')}
                                </div>
                            )}
                            {selectedTables.length === 0 &&
                                orderType === 'DINE_IN' && (
                                    <div className="text-sm text-orange-600 mt-1">
                                        No tables selected - Click "Tables" to
                                        select
                                    </div>
                                )}
                        </div>
                    )}

                    {/* Order Controls */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Order Type Toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <Button
                                variant={
                                    orderType === 'DINE_IN'
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                className="h-7 px-3 text-xs"
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
                                className="h-7 px-3 text-xs"
                                onClick={() => setOrderType('TAKEOUT')}
                                disabled={createOrderMutation.isPending}
                            >
                                <User className="w-3 h-3 mr-1" />
                                Take Away
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setShowTableSelector(true)}
                            disabled={createOrderMutation.isPending}
                        >
                            <Table className="w-3 h-3 mr-1" />
                            Tables ({selectedTables.length})
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => setShowNotesModal(true)}
                            disabled={createOrderMutation.isPending}
                        >
                            <FileText className="w-3 h-3 mr-1" />
                            Note
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={handleNewOrder}
                            disabled={createOrderMutation.isPending}
                        >
                            <Plus className="w-3 h-3 mr-1" />
                            New
                        </Button>
                    </div>

                    {/* Customer Information */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="customerPhone">Phone</Label>
                            <Input
                                id="customerPhone"
                                value={customerPhone}
                                onChange={(e) =>
                                    setCustomerPhone(e.target.value)
                                }
                                placeholder="Phone number"
                                disabled={createOrderMutation.isPending}
                            />
                        </div>
                        <div>
                            <Label htmlFor="customerName">Name</Label>
                            <Input
                                id="customerName"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                placeholder="Customer name"
                                disabled={createOrderMutation.isPending}
                            />
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto max-h-[calc(100vh-400px)]">
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
                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                    <div className="space-y-3">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-medium">
                                    {formatVND(subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (10%)</span>
                                <span className="font-medium">
                                    {formatVND(tax)}
                                </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatVND(total)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Send to Kitchen button - always show */}
                        <Button
                            className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300"
                            onClick={handleSendToKitchen}
                            disabled={
                                !canSendToKitchen() ||
                                sendToKitchenMutation.isPending
                            }
                        >
                            <ChefHat className="w-4 h-4 mr-2" />
                            {sendToKitchenMutation.isPending
                                ? 'Sending...'
                                : 'Send to Kitchen'}
                        </Button>
                    </div>
                </div>
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

            <POSOrderNotes
                isOpen={showNotesModal}
                onClose={() => setShowNotesModal(false)}
                notes={orderNotes}
                onSave={(notes) => {
                    setOrderNotes(notes);
                    setShowNotesModal(false);
                    createOrUpdateOrder(orderItems);
                }}
                disabled={createOrderMutation.isPending}
            />

            <POSTableSelector
                isOpen={showTableSelector}
                onClose={() => setShowTableSelector(false)}
                tables={tables}
                selectedTables={selectedTables}
                onTablesChange={handleTableSelection}
                disabled={createOrderMutation.isPending}
            />
        </div>
    );
}
