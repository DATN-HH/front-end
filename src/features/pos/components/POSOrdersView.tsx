'use client';

import { useState } from 'react';
import { ArrowLeft, Search, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePOSOrders, POSOrderStatus } from '@/api/v1/pos-orders';
import PaymentModal from './PaymentModal';

interface POSOrdersViewProps {
    currentOrderId: number | null;
    onOrderSelect: (orderId: number) => void;
    onBackToRegister: () => void;
    onEditOrder?: (orderId: number) => void;
}

export function POSOrdersView({
    currentOrderId,
    onOrderSelect,
    onBackToRegister,
    onEditOrder,
}: POSOrdersViewProps) {
    const [selectedOrderType, setSelectedOrderType] = useState<
        'dine-in' | 'takeout' | 'delivery'
    >('dine-in');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        POSOrderStatus | 'active' | null
    >('active');
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);

    // Fetch orders based on filters
    const { data: orders = [], isLoading } = usePOSOrders(
        statusFilter === 'active' ? undefined : (statusFilter as POSOrderStatus)
    );

    // Filter orders based on search and type
    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            !searchQuery ||
            order.orderNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.tableName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.customerName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

        // For now, assume all orders are dine-in type
        // This would be enhanced with actual order type field
        return matchesSearch;
    });

    // Get selected order details
    const selectedOrder = currentOrderId
        ? orders.find((order) => order.id === currentOrderId)
        : filteredOrders[0];

    const getStatusColor = (status: POSOrderStatus) => {
        switch (status) {
            case POSOrderStatus.DRAFT:
                return 'bg-gray-100 text-gray-800';
            case POSOrderStatus.ORDERED:
                return 'bg-blue-100 text-blue-800';
            case POSOrderStatus.PREPARING:
                return 'bg-yellow-100 text-yellow-800';
            case POSOrderStatus.READY:
                return 'bg-green-100 text-green-800';
            case POSOrderStatus.COMPLETED:
                return 'bg-gray-100 text-gray-600';
            case POSOrderStatus.CANCELLED:
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: POSOrderStatus) => {
        switch (status) {
            case POSOrderStatus.DRAFT:
                return 'Draft';
            case POSOrderStatus.ORDERED:
                return 'Ongoing';
            case POSOrderStatus.PREPARING:
                return 'Preparing';
            case POSOrderStatus.READY:
                return 'Ready';
            case POSOrderStatus.COMPLETED:
                return 'Completed';
            case POSOrderStatus.CANCELLED:
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getItemStatusColor = (status: string) => {
        switch (status) {
            case 'RECEIVED':
                return 'bg-gray-100 text-gray-800';
            case 'PREPARING':
                return 'bg-yellow-100 text-yellow-800';
            case 'READY':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getItemStatusLabel = (status: string) => {
        switch (status) {
            case 'RECEIVED':
                return 'Received';
            case 'PREPARING':
                return 'Preparing';
            case 'READY':
                return 'Ready';
            case 'COMPLETED':
                return 'Completed';
            default:
                return status;
        }
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Panel - Orders List */}
            <div className="w-2/3 bg-white border-r border-gray-200 flex flex-col">
                {/* Orders Header */}
                <div className="p-4 border-b border-gray-200 space-y-4">
                    {/* Order Type Tabs */}
                    <div className="flex space-x-1">
                        {(['dine-in', 'takeout', 'delivery'] as const).map(
                            (type) => (
                                <Button
                                    key={type}
                                    variant={
                                        selectedOrderType === type
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`px-4 py-2 font-medium capitalize ${
                                        selectedOrderType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    onClick={() => setSelectedOrderType(type)}
                                >
                                    {type.replace('-', ' ')}
                                </Button>
                            )
                        )}
                    </div>

                    {/* Search and Filter */}
                    <div className="flex items-center space-x-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search Orders..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Badge variant="secondary" className="px-3 py-1">
                            Active
                        </Badge>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {filteredOrders.length > 0 ? '1' : '0'}-
                            {filteredOrders.length} / {filteredOrders.length}
                        </span>
                        <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" disabled>
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <div className="animate-pulse space-y-3">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-16 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-center text-gray-500">
                                <div className="text-lg font-medium mb-2">
                                    No orders found
                                </div>
                                <div className="text-sm">
                                    No active orders at the moment
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        selectedOrder?.id === order.id
                                            ? 'bg-blue-50 border-l-4 border-blue-500'
                                            : ''
                                    }`}
                                    onClick={() => onOrderSelect(order.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="text-sm text-gray-500">
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleDateString()}{' '}
                                                    {new Date(
                                                        order.createdAt
                                                    ).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="font-medium">
                                                    {order.tableName
                                                        ? `T ${order.tableName}`
                                                        : 'Direct Sale'}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {order.orderNumber}
                                                </span>
                                            </div>
                                            <div className="text-sm text-gray-600">
                                                {selectedOrderType.replace(
                                                    '-',
                                                    ' '
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-medium text-lg mb-1">
                                                ${order.total.toFixed(2)}
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    order.status
                                                )}
                                            >
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Order Details */}
            <div className="w-1/3 bg-white flex flex-col">
                {selectedOrder ? (
                    <>
                        {/* Order Details Header */}
                        <div className="p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold mb-2">
                                Order Details
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div>Order: {selectedOrder.orderNumber}</div>
                                <div>
                                    Table:{' '}
                                    {selectedOrder.tableName || 'Direct Sale'}
                                </div>
                                <div>
                                    Time:{' '}
                                    {new Date(
                                        selectedOrder.createdAt
                                    ).toLocaleTimeString()}
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-3">
                                {selectedOrder.items.map((item) => (
                                    <Card key={item.id} className="p-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                                                        {item.quantity}
                                                    </span>
                                                    <span className="font-medium text-sm">
                                                        {item.productName}
                                                    </span>
                                                    {/* Item Status Badge */}
                                                    <Badge
                                                        className={`ml-2 text-xs ${getItemStatusColor(item.itemStatus || 'RECEIVED')}`}
                                                    >
                                                        {getItemStatusLabel(
                                                            item.itemStatus ||
                                                                'RECEIVED'
                                                        )}
                                                    </Badge>
                                                </div>
                                                {item.attributeCombination && (
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {
                                                            item.attributeCombination
                                                        }
                                                    </p>
                                                )}
                                                {item.notes && (
                                                    <p className="text-xs text-gray-500 mb-1">
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-sm font-medium">
                                                ${item.totalPrice.toFixed(2)}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>

                            {/* Order Totals */}
                            <Card className="mt-4 p-4 bg-gray-50">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Subtotal</span>
                                        <span>
                                            ${selectedOrder.subtotal.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>
                                            ${selectedOrder.tax.toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>
                                                $
                                                {selectedOrder.total.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Order Actions */}
                        <div className="p-4 border-t border-gray-200 space-y-2">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={onBackToRegister}
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Go Back
                            </Button>
                            {onEditOrder && (
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={() =>
                                        onEditOrder(selectedOrder.id)
                                    }
                                >
                                    Load Order
                                </Button>
                            )}
                            {/* Payment button - only show when all items are completed */}
                            {selectedOrder.items.every(
                                (item) => item.itemStatus === 'COMPLETED'
                            ) && (
                                <Button 
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => setPaymentModalOpen(true)}
                                >
                                    Process Payment
                                </Button>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <div className="text-lg font-medium mb-2">
                                Select an order
                            </div>
                            <div className="text-sm">
                                Choose an order from the list to view details
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Modal */}
            {selectedOrder && (
                <PaymentModal
                    open={paymentModalOpen}
                    onOpenChange={setPaymentModalOpen}
                    order={selectedOrder}
                    onPaymentSuccess={() => {
                        // Refresh orders list and close modal
                        setPaymentModalOpen(false);
                        // Optionally refetch orders data here
                    }}
                />
            )}
        </div>
    );
}
