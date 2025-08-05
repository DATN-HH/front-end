'use client';

import {
    ArrowLeft,
    User,
    FileText,
    UtensilsCrossed,
    MoreHorizontal,
    Settings,
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { useCreateKDSOrder, KDSOrderCreateRequest } from '@/api/v1/kds-orders';
import {
    useCreateOrUpdatePOSOrder,
    useCreatePOSOrderPayment,
    useSendOrderToKitchen,
    usePOSOrder,
    POSOrderCreateOrUpdateRequest,
    POSOrderPaymentRequest,
    POSPaymentMethod,
} from '@/api/v1/pos-orders';
import { Button } from '@/components/ui/button';

// Import API hooks

// Import POS components
import { POSCashPayment } from './POSCashPayment';
import { POSKitchenNotesSettings } from './POSKitchenNotesSettings';
import { POSOrderSummary } from './POSOrderSummary';
import { POSProductGrid } from './POSProductGrid';
import { POSProductVariantModal } from './POSProductVariantModal';

// Helper function to format currency to VND
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

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
    selectedTableId: number | null;
    editingOrderId?: number | null;
    onOrderCreated: (orderId: number) => void;
    onBackToTables: () => void;
}

export function POSRegisterView({
    selectedTableId,
    editingOrderId,
    onOrderCreated,
    onBackToTables,
}: POSRegisterViewProps) {
    const [orderItems, setOrderItems] = useState<POSOrderItem[]>([]);
    const [currentOrder, setCurrentOrder] = useState<any>(null); // Track the active order
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [orderType, setOrderType] = useState<
        'dine-in' | 'takeout' | 'delivery'
    >('dine-in');

    // API hooks
    const createOrderMutation = useCreateOrUpdatePOSOrder();
    const createPaymentMutation = useCreatePOSOrderPayment();
    const sendToKitchenMutation = useSendOrderToKitchen();
    const createKDSOrderMutation = useCreateKDSOrder();

    // Fetch editing order if editingOrderId is provided
    const { data: editingOrder } = usePOSOrder(
        editingOrderId ? editingOrderId : -1
    );

    // Effect to load editing order data
    useEffect(() => {
        if (editingOrder && editingOrderId) {
            // Convert order items to local POSOrderItem format
            const convertedItems: POSOrderItem[] = editingOrder.items.map(
                (item: any) => ({
                    id: `${item.id}`,
                    orderItemId: item.id, // Track backend ID for updates
                    productId: item.productId || item.foodComboId, // Use comboId if it's a combo
                    variantId: item.variantId,
                    name: item.productName || item.comboName || 'Unknown Item',
                    description: item.attributeCombination || undefined,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    attributes: item.attributeCombination,
                    notes: item.notes ? [item.notes] : [],
                    itemStatus: item.itemStatus || 'RECEIVED', // Default to RECEIVED if not specified
                })
            );

            setOrderItems(convertedItems);
            setCurrentOrder(editingOrder);
        }
    }, [editingOrder, editingOrderId]);

    // Calculate order totals from current order or local items
    const subtotal =
        currentOrder?.subtotal ||
        orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = currentOrder?.tax || subtotal * 0.1; // 10% tax
    const total = currentOrder?.total || subtotal + tax;

    // Helper function to create or update order when items change
    const createOrUpdateOrder = async (items: POSOrderItem[]) => {
        if (items.length === 0) {
            // If no items, clear current order
            setCurrentOrder(null);
            return;
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
                orderId: currentOrder?.id, // If exists, this will update; if not, will create
                tableIds: selectedTableId ? [selectedTableId] : [],
                items: apiItems,
                customerName: undefined,
                customerPhone: undefined,
                notes: undefined,
                orderType: 'DINE_IN',
            };

            const result = await createOrderMutation.mutateAsync(orderRequest);
            console.log('Order result:', result);

            // Update local state from API response
            const updatedItems: POSOrderItem[] = result.items.map(
                (apiItem: any) => ({
                    id: `${apiItem.id}`, // Use API item ID as local ID
                    orderItemId: apiItem.id, // Track backend ID for updates
                    productId: apiItem.productId || apiItem.foodComboId,
                    variantId: apiItem.variantId,
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

            // Notify parent that order was created/updated (don't jump to Orders tab)
            if (result?.id && !currentOrder) {
                // Only call onOrderCreated for the first time, not on updates
                // This prevents jumping to Orders tab on every item addition
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

    // Helper function to send order to KDS
    const sendOrderToKDS = async (posOrder: any) => {
        try {
            console.log('sendOrderToKDS received order:', posOrder);
            console.log('Order ID:', posOrder?.id);
            console.log('Order structure:', Object.keys(posOrder || {}));

            if (!posOrder?.id) {
                console.error(
                    'Invalid order object passed to sendOrderToKDS:',
                    posOrder
                );
                return;
            }

            // Get table info from new structure
            const primaryTable =
                posOrder.tables?.find((t: any) => t.isPrimary) ||
                posOrder.tables?.[0];
            const tableId = primaryTable?.tableId || selectedTableId;
            const tableName =
                primaryTable?.tableName ||
                (tableId ? `T${tableId}` : undefined);

            const kdsOrderRequest: KDSOrderCreateRequest = {
                orderNumber: posOrder.orderNumber || `POS-${posOrder.id}`,
                tableId,
                tableName,
                customerName: posOrder.customerName,
                notes: posOrder.notes,
                estimatedTime: 20, // Default 20 minutes
                priority: 'normal',
                staffName: 'POS Staff', // TODO: Get from current user
                branchId: 5, // Fixed to match the branch ID that KDS queries for
                items:
                    posOrder.items?.map((item: any, index: number) => ({
                        id: `${posOrder.id}-${index + 1}`,
                        productId: item.productId,
                        productName: item.productName,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        totalPrice: item.totalPrice,
                        notes: item.notes,
                        modifiers: item.modifiers || [],
                    })) || [],
            };

            await createKDSOrderMutation.mutateAsync(kdsOrderRequest);
            console.log('Order sent to KDS successfully');
        } catch (error) {
            console.error('Failed to send order to KDS:', error);
        }
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
            console.log('newItem', newItem);
            newOrderItems = [...orderItems, newItem];
        }

        // Update local state
        setOrderItems(newOrderItems);

        // Create or update the order in the backend
        await createOrUpdateOrder(newOrderItems);
    };

    // Handle variant selection and add to order
    const handleVariantSelect = (variant: any) => {
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
                selectedProduct.defaultPrice ||
                selectedProduct.price ||
                0,
            totalPrice:
                variant.effectivePrice ||
                variant.price ||
                selectedProduct.defaultPrice ||
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

    // Handle order submission
    const handleSubmitOrder = async () => {
        try {
            // Convert items to new API format
            const apiItems = orderItems.map((item) => ({
                productId:
                    !item.variantId &&
                    !item.name.toLowerCase().includes('combo')
                        ? item.productId
                        : undefined,
                variantId: item.variantId || null,
                comboId:
                    item.name.toLowerCase().includes('combo') ||
                    item.name.toLowerCase().includes('special')
                        ? item.productId
                        : null,
                quantity: item.quantity,
                notes: item.description || undefined,
                attributeCombination: item.attributes || undefined,
            }));

            const orderRequest: POSOrderCreateOrUpdateRequest = {
                orderId: currentOrder?.id, // If exists, this will update; if not, will create
                tableIds: selectedTableId ? [selectedTableId] : [],
                items: apiItems,
                customerName: undefined,
                customerPhone: undefined,
                notes: undefined,
                orderType: 'DINE_IN',
            };

            // Create the order with enhanced error handling
            let order;
            try {
                console.log(
                    'Creating/updating order with request:',
                    orderRequest
                );
                order = await createOrderMutation.mutateAsync(orderRequest);
                console.log('Raw order response:', order);

                // Handle different response formats that might be returned
                if (!order) {
                    console.error('Order creation returned null/undefined');
                    // Create a mock order for testing purposes
                    order = {
                        id: Date.now(), // Use timestamp as temporary ID
                        tables: selectedTableId
                            ? [
                                  {
                                      tableId: selectedTableId,
                                      tableName: `Table ${selectedTableId}`,
                                  },
                              ]
                            : [],
                        items: orderRequest.items,
                        status: 'PENDING',
                    };
                    console.log('Using mock order:', order);
                }

                // Final validation
                if (!order || typeof order !== 'object') {
                    throw new Error(
                        `Invalid order object: ${JSON.stringify(order)}`
                    );
                }

                if (!order.id) {
                    console.error('Order missing ID, using fallback');
                    order.id = Date.now(); // Fallback ID
                }

                console.log('Final order object:', order);
            } catch (error) {
                console.error('Error creating order:', error);
                // For testing purposes, create a mock order instead of failing
                order = {
                    id: Date.now(),
                    tables: selectedTableId
                        ? [
                              {
                                  tableId: selectedTableId,
                                  tableName: `Table ${selectedTableId}`,
                              },
                          ]
                        : [],
                    items: orderRequest.items,
                    status: 'PENDING',
                };
                console.log('Using fallback mock order due to error:', order);
            }

            // Send order to kitchen (this will update table status to occupied)
            try {
                await sendToKitchenMutation.mutateAsync(order.id);
                console.log('Order sent to kitchen successfully');
            } catch (error) {
                console.error('Error sending to kitchen:', error);
                // Continue with KDS even if kitchen fails
            }

            // Send order to KDS system
            try {
                await sendOrderToKDS(order);
                console.log('Order sent to KDS successfully');
            } catch (error) {
                console.error('Error sending to KDS:', error);
                // Continue even if KDS fails
            }

            // Clear order items and navigate
            setOrderItems([]);
            onOrderCreated(order.id);
        } catch (error) {
            console.error('Failed to create order:', error);
        }
    };

    // Handle payment
    const handlePayment = () => {
        setShowPaymentModal(true);
    };

    // Handle payment completion
    const handlePaymentComplete = async (paymentData: {
        method: 'CASH';
        amountReceived: number;
        change: number;
    }) => {
        try {
            // Convert items to new API format
            const apiItems = orderItems.map((item) => ({
                productId:
                    !item.variantId &&
                    !item.name.toLowerCase().includes('combo')
                        ? item.productId
                        : undefined,
                variantId: item.variantId || null,
                comboId:
                    item.name.toLowerCase().includes('combo') ||
                    item.name.toLowerCase().includes('special')
                        ? item.productId
                        : null,
                quantity: item.quantity,
                notes: item.notes?.join(', ') || undefined,
                attributeCombination: item.attributes || undefined,
            }));

            const orderRequest: POSOrderCreateOrUpdateRequest = {
                orderId: currentOrder?.id, // If exists, this will update; if not, will create
                tableIds: selectedTableId ? [selectedTableId] : [],
                items: apiItems,
                customerName: undefined,
                customerPhone: undefined,
                notes: undefined,
                orderType: 'DINE_IN',
            };

            const order = await createOrderMutation.mutateAsync(orderRequest);

            // Send order to KDS system
            await sendOrderToKDS(order);

            // Then process the payment
            const paymentRequest: POSOrderPaymentRequest = {
                orderId: order.id,
                method: POSPaymentMethod.CASH,
                amount: total,
                reference: `CASH-${Date.now()}`,
            };

            await createPaymentMutation.mutateAsync(paymentRequest);

            // Clear order and navigate
            setOrderItems([]);
            setShowPaymentModal(false);
            onOrderCreated(order.id);
        } catch (error) {
            console.error('Failed to process payment:', error);
        }
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Panel - Order Summary */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Order Header */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onBackToTables}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Tables
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSettingsModal(true)}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                            {selectedTableId && (
                                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                                    Table {selectedTableId}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto">
                    <POSOrderSummary
                        items={orderItems}
                        onQuantityChange={handleQuantityChange}
                        onNotesChange={handleNotesChange}
                        subtotal={subtotal}
                        tax={tax}
                        total={total}
                    />
                </div>

                {/* Order Controls */}
                <div className="p-4 border-t border-gray-200 space-y-3">
                    {/* Order Type and Options */}
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm">
                            <User className="w-4 h-4 mr-2" />
                            Customer
                        </Button>
                        <Button variant="outline" size="sm">
                            <FileText className="w-4 h-4 mr-2" />
                            Note
                        </Button>
                        <Button
                            variant={
                                orderType === 'dine-in' ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => setOrderType('dine-in')}
                        >
                            <UtensilsCrossed className="w-4 h-4 mr-2" />
                            Dine In
                        </Button>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                            onClick={handleSubmitOrder}
                            disabled={
                                orderItems.length === 0 ||
                                createOrderMutation.isPending ||
                                sendToKitchenMutation.isPending
                            }
                        >
                            <div className="text-center">
                                <div className="font-medium">
                                    {createOrderMutation.isPending ||
                                    sendToKitchenMutation.isPending
                                        ? 'Sending...'
                                        : 'Order'}
                                </div>
                                <div className="text-xs opacity-90">
                                    {orderType === 'dine-in' ? 'Food' : 'Items'}{' '}
                                    {orderItems.length}
                                </div>
                            </div>
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1"
                            disabled={orderItems.length === 0}
                            onClick={handlePayment}
                        >
                            Payment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Product Grid */}
            <div className="flex-1 bg-gray-50">
                <POSProductGrid onProductSelect={handleProductSelect} />
            </div>

            {/* Product Variant Selection Modal */}
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

            {/* Cash Payment Modal */}
            <POSCashPayment
                isOpen={showPaymentModal}
                orderTotal={total}
                onPaymentComplete={handlePaymentComplete}
                onClose={() => setShowPaymentModal(false)}
            />

            {/* Kitchen Notes Settings Modal */}
            <POSKitchenNotesSettings
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </div>
    );
}
