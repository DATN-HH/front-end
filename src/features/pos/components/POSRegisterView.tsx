'use client';

import { useState } from 'react';
import { ArrowLeft, User, FileText, UtensilsCrossed, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Import API hooks
import { useCreatePOSOrder, useCreatePOSOrderPayment, POSOrderCreateRequest, POSOrderPaymentRequest, POSPaymentMethod } from '@/api/v1/pos-orders';

// Import POS components
import { POSProductGrid } from './POSProductGrid';
import { POSOrderSummary } from './POSOrderSummary';
import { POSProductVariantModal } from './POSProductVariantModal';
import { POSCashPayment } from './POSCashPayment';

// Types for order management
export interface POSOrderItem {
    id: string;
    productId: number;
    variantId?: number;
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    attributes?: string;
}

interface POSRegisterViewProps {
    selectedTableId: number | null;
    onOrderCreated: (orderId: number) => void;
    onBackToTables: () => void;
}

export function POSRegisterView({
    selectedTableId,
    onOrderCreated,
    onBackToTables
}: POSRegisterViewProps) {
    const [orderItems, setOrderItems] = useState<POSOrderItem[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [orderType, setOrderType] = useState<'dine-in' | 'takeout' | 'delivery'>('dine-in');

    // API hooks
    const createOrderMutation = useCreatePOSOrder();
    const createPaymentMutation = useCreatePOSOrderPayment();

    // Calculate order totals
    const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    // Handle product selection - show variants if available
    const handleProductSelect = (product: any) => {
        setSelectedProduct(product);
        setShowVariantModal(true);
    };

    // Handle variant selection and add to order
    const handleVariantSelect = (variant: any) => {
        const newItem: POSOrderItem = {
            id: `${variant.id}-${Date.now()}`,
            productId: selectedProduct.id,
            variantId: variant.id,
            name: variant.displayName || selectedProduct.name,
            description: variant.attributeCombination,
            quantity: 1,
            unitPrice: variant.effectivePrice,
            totalPrice: variant.effectivePrice,
            attributes: variant.attributeCombination
        };

        setOrderItems(prev => [...prev, newItem]);
        setShowVariantModal(false);
        setSelectedProduct(null);
    };

    // Handle quantity changes
    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            setOrderItems(prev => prev.filter(item => item.id !== itemId));
        } else {
            setOrderItems(prev => 
                prev.map(item => 
                    item.id === itemId 
                        ? { ...item, quantity: newQuantity, totalPrice: item.unitPrice * newQuantity }
                        : item
                )
            );
        }
    };

    // Handle order submission
    const handleSubmitOrder = async () => {
        try {
            const orderRequest: POSOrderCreateRequest = {
                tableId: selectedTableId || undefined,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    notes: item.description,
                    modifiers: []
                })),
                customerName: undefined,
                customerPhone: undefined,
                notes: undefined
            };

            const order = await createOrderMutation.mutateAsync(orderRequest);
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
            // First create the order
            const orderRequest: POSOrderCreateRequest = {
                tableId: selectedTableId || undefined,
                items: orderItems.map(item => ({
                    productId: item.productId,
                    productName: item.name,
                    variantId: item.variantId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    totalPrice: item.totalPrice,
                    notes: item.description,
                    modifiers: []
                })),
                customerName: undefined,
                customerPhone: undefined,
                notes: undefined
            };

            const order = await createOrderMutation.mutateAsync(orderRequest);

            // Then process the payment
            const paymentRequest: POSOrderPaymentRequest = {
                orderId: order.id,
                method: POSPaymentMethod.CASH,
                amount: total,
                reference: `CASH-${Date.now()}`
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
                        {selectedTableId && (
                            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium">
                                Table {selectedTableId}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Items */}
                <div className="flex-1 overflow-y-auto">
                    <POSOrderSummary
                        items={orderItems}
                        onQuantityChange={handleQuantityChange}
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
                            variant={orderType === 'dine-in' ? 'default' : 'outline'} 
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={handleSubmitOrder}
                            disabled={orderItems.length === 0}
                        >
                            <div className="text-center">
                                <div className="font-medium">Order</div>
                                <div className="text-xs opacity-90">
                                    {orderType === 'dine-in' ? 'Food' : 'Items'} {orderItems.length}
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
        </div>
    );
}
