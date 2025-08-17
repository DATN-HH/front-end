'use client';

import { Search, RefreshCw, QrCode } from 'lucide-react';
import { useState } from 'react';

import { usePOSOrders, POSOrderStatus } from '@/api/v1/pos-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

import PaymentModal from './PaymentModal';
import { QRCodeModal } from './QRCodeModal';

interface POSOrdersViewProps {
    currentOrderId: number | null;
    onOrderSelect: (orderId: number) => void;
    onEditOrder?: (orderId: number) => void;
}

export function POSOrdersView({
    currentOrderId,
    onOrderSelect,
    onEditOrder,
}: POSOrdersViewProps) {
    const [selectedOrderType, setSelectedOrderType] = useState<
        'dine-in' | 'takeout' | 'delivery'
    >('dine-in');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<
        POSOrderStatus | 'active' | null
    >(POSOrderStatus.DRAFT);
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [selectedOrderForQR, setSelectedOrderForQR] = useState<number | null>(
        null
    );

    // Fetch orders based on filters with orderType support
    const {
        data: orders = [],
        isLoading,
        refetch,
    } = usePOSOrders(
        statusFilter === 'active'
            ? undefined
            : (statusFilter as POSOrderStatus),
        selectedOrderType.toUpperCase().replace('-', '_') as
            | 'DINE_IN'
            | 'TAKEOUT'
            | 'DELIVERY'
    );

    // Helper function to format Vietnamese currency
    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Helper function to get order display name (ID + Table Names)
    const getOrderDisplayName = (order: any) => {
        // Handle multiple tables from new API structure
        if (order.tables && order.tables.length > 0) {
            const tableNames = order.tables
                .map((t: any) => t.tableName)
                .join(', ');
            return `#${order.id} - ${tableNames}`;
        }

        // Fallback to single table name for backward compatibility
        if (order.tableName) {
            return `#${order.id} - ${order.tableName}`;
        }

        return `#${order.id} - Direct Sale`;
    };

    // Filter orders based on search and type
    const filteredOrders = orders.filter((order) => {
        const orderDisplayName = getOrderDisplayName(order);
        const matchesSearch =
            !searchQuery ||
            order.orderNumber
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            orderDisplayName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            order.customerName
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());

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
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'SEND_TO_KITCHEN':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'COOKING':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'READY_TO_SERVE':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getItemStatusLabel = (status: string) => {
        switch (status) {
            case 'RECEIVED':
                return 'Received';
            case 'SEND_TO_KITCHEN':
                return 'Sent to Kitchen';
            case 'COOKING':
                return 'Cooking';
            case 'READY_TO_SERVE':
                return 'Ready to Serve';
            case 'COMPLETED':
                return 'Completed';
            default:
                return status;
        }
    };

    // Helper function to get order status (check both status and orderStatus fields)
    const getOrderStatus = (order: any): string => {
        return order.orderStatus ?? order.status;
    };

    // Helper function to check if order can be loaded
    const canLoadOrder = (order: any): boolean => {
        const status = getOrderStatus(order);
        return status === 'DRAFT' || status === 'PREPARING';
    };

    // Helper function to check if order can process payment
    const canProcessPayment = (order: any): boolean => {
        const status = getOrderStatus(order);
        return status === 'PREPARING';
    };

    const handleQRPrint = (orderId: number) => {
        setSelectedOrderForQR(orderId);
        setQrModalOpen(true);
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

                    {/* Enhanced Search and Filter */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    placeholder="Search by order number, table, or customer..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-10 w-10 p-0"
                                onClick={() => refetch()}
                                disabled={isLoading}
                                title="Reload orders"
                            >
                                <RefreshCw
                                    className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                                />
                            </Button>
                        </div>

                        {/* Status Filter Pills */}
                        <div className="flex flex-wrap gap-2">
                            {(
                                [
                                    POSOrderStatus.DRAFT,
                                    POSOrderStatus.PREPARING,
                                    POSOrderStatus.COMPLETED,
                                    POSOrderStatus.CANCELLED,
                                    'active',
                                ] as const
                            ).map((status) => (
                                <Button
                                    key={status}
                                    variant={
                                        statusFilter === status
                                            ? 'default'
                                            : 'outline'
                                    }
                                    size="sm"
                                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                                        statusFilter === status
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                    }`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {status === 'active'
                                        ? 'All Orders'
                                        : status.charAt(0) +
                                          status.slice(1).toLowerCase()}
                                </Button>
                            ))}
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
                        <div className="space-y-3 p-4">
                            {filteredOrders.map((order) => (
                                <Card
                                    key={order.id}
                                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                                        selectedOrder?.id === order.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg'
                                            : 'hover:bg-gray-50'
                                    }`}
                                    onClick={() => onOrderSelect(order.id)}
                                >
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className="font-bold text-lg text-blue-600">
                                                        {getOrderDisplayName(
                                                            order
                                                        )}
                                                    </span>
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                                        {order.orderNumber}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <span className="flex items-center">
                                                        <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                                                        {order.orderType
                                                            ?.replace('_', ' ')
                                                            .toLowerCase() ||
                                                            'dine in'}
                                                    </span>
                                                    <span>
                                                        {new Date(
                                                            order.createdAt
                                                        ).toLocaleTimeString(
                                                            [],
                                                            {
                                                                hour: '2-digit',
                                                                minute: '2-digit',
                                                            }
                                                        )}
                                                    </span>
                                                    <span>
                                                        {order.items?.length ||
                                                            0}{' '}
                                                        items
                                                    </span>
                                                </div>
                                                {order.customerName && (
                                                    <div className="text-sm text-gray-600 mt-1">
                                                        Customer:{' '}
                                                        {order.customerName}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-right ml-4">
                                                <div className="font-bold text-xl text-green-600 mb-2">
                                                    {formatVND(order.total)}
                                                </div>
                                                <Badge
                                                    className={`${getStatusColor(order.status)} text-xs`}
                                                >
                                                    {getStatusLabel(
                                                        (order?.orderStatus as POSOrderStatus) ||
                                                            POSOrderStatus.DRAFT
                                                    )}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
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
                            <h3 className="text-xl font-bold text-blue-600 mb-3">
                                {getOrderDisplayName(selectedOrder)}
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Order Number:
                                    </span>
                                    <span className="font-medium bg-gray-100 px-2 py-1 rounded text-xs">
                                        {selectedOrder.orderNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Order Type:
                                    </span>
                                    <span className="font-medium capitalize">
                                        {selectedOrder.orderType
                                            ?.replace('_', ' ')
                                            .toLowerCase() || 'Dine In'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">
                                        Created:
                                    </span>
                                    <span className="font-medium">
                                        {new Date(
                                            selectedOrder.createdAt
                                        ).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </span>
                                </div>
                                {selectedOrder.customerName && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">
                                            Customer:
                                        </span>
                                        <span className="font-medium">
                                            {selectedOrder.customerName}
                                        </span>
                                    </div>
                                )}
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
                                                        {item.productName
                                                            ? item.productName
                                                            : item.comboName}
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
                                                {formatVND(item.totalPrice)}
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
                                            {formatVND(selectedOrder.subtotal)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Tax</span>
                                        <span>
                                            {formatVND(selectedOrder.tax)}
                                        </span>
                                    </div>
                                    <div className="border-t pt-2">
                                        <div className="flex justify-between font-bold">
                                            <span>Total</span>
                                            <span>
                                                {formatVND(selectedOrder.total)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Order Actions */}
                        <div className="p-4 border-t border-gray-200 space-y-2">
                            <div className="flex items-center gap-2">
                                {/* Load Order button - only show for DRAFT and PREPARING orders */}
                                {onEditOrder && canLoadOrder(selectedOrder) && (
                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={() =>
                                            onEditOrder(selectedOrder.id)
                                        }
                                    >
                                        Load Order
                                    </Button>
                                )}
                                {/* Print Self-Order QR button */}
                                {selectedOrder.orderStatus === 'PREPARING' && (
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQRPrint(selectedOrder.id);
                                        }}
                                    >
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Print Self-Order QR
                                    </Button>
                                )}
                            </div>

                            {/* Payment button - only show for PREPARING orders */}
                            {canProcessPayment(selectedOrder) && (
                                <Button
                                    className="w-full bg-green-600 hover:bg-green-700"
                                    onClick={() => setPaymentModalOpen(true)}
                                    disabled={
                                        !selectedOrder.items.every(
                                            (item) =>
                                                item.itemStatus === 'COMPLETED'
                                        )
                                    }
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

            {/* QR Code Modal */}
            {selectedOrderForQR && (
                <QRCodeModal
                    isOpen={qrModalOpen}
                    onClose={() => {
                        setQrModalOpen(false);
                        setSelectedOrderForQR(null);
                    }}
                    orderId={selectedOrderForQR}
                />
            )}
        </div>
    );
}
