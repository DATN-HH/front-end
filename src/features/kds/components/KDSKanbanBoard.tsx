'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Clock,
    User,
    RotateCcw,
    X,
    ChefHat,
    Timer,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';
import {
    useKDSOrdersByBranch,
    useUpdateKDSOrderItemStatus,
    useUpdateKDSOrderStatus,
    KDSOrder,
    KDSOrderItem,
    KDSOrderStatus,
    KDSItemStatus
} from '@/api/v1/kds-orders';



interface KDSKanbanBoardProps {
    branchId: number;
    onBack: () => void;
}

export function KDSKanbanBoard({ branchId, onBack }: KDSKanbanBoardProps) {
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    // Use real API calls
    const { data: orders, isLoading, error } = useKDSOrdersByBranch(branchId);
    const updateItemStatusMutation = useUpdateKDSOrderItemStatus();
    const updateOrderStatusMutation = useUpdateKDSOrderStatus();



    const getElapsedTime = (orderTime: string): string => {
        const now = new Date();
        const orderDate = new Date(orderTime);
        const diffMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
        return `${diffMinutes}'`;
    };

    const getStatusColor = (minutes: number): string => {
        if (minutes <= 15) return 'bg-green-500';
        if (minutes <= 25) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const handleOrderDrop = async (orderId: number, newStatus: KDSOrderStatus) => {
        try {
            await updateOrderStatusMutation.mutateAsync({
                orderId,
                status: newStatus,
            });
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const statusCounts = {
        all: orders?.length || 0,
        toCook: orders?.filter(o => o.status === KDSOrderStatus.RECEIVED).length || 0,
        ready: orders?.filter(o => o.status === KDSOrderStatus.READY).length || 0,
        completed: orders?.filter(o => o.status === KDSOrderStatus.COMPLETED).length || 0,
    };

    const filteredOrders = selectedStatus === 'all'
        ? orders || []
        : orders?.filter(order => {
            switch (selectedStatus) {
                case 'toCook': return order.status === KDSOrderStatus.RECEIVED;
                case 'ready': return order.status === KDSOrderStatus.READY;
                case 'completed': return order.status === KDSOrderStatus.COMPLETED;
                default: return true;
            }
        }) || [];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading kitchen orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Failed to load kitchen orders</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" onClick={onBack} className="p-2">
                                <X className="h-5 w-5" />
                            </Button>
                            <div className="flex items-center gap-2">
                                <ChefHat className="h-6 w-6 text-blue-600" />
                                <h1 className="text-xl font-semibold">Kitchen Display System</h1>
                            </div>
                        </div>
                        
                        {/* Status Tabs */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={selectedStatus === 'all' ? 'default' : 'ghost'}
                                onClick={() => setSelectedStatus('all')}
                                className="text-sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={selectedStatus === 'toCook' ? 'default' : 'ghost'}
                                onClick={() => setSelectedStatus('toCook')}
                                className="text-sm"
                            >
                                To cook <Badge variant="secondary" className="ml-1">{statusCounts.toCook}</Badge>
                            </Button>
                            <Button
                                variant={selectedStatus === 'ready' ? 'default' : 'ghost'}
                                onClick={() => setSelectedStatus('ready')}
                                className="text-sm"
                            >
                                Ready <Badge variant="secondary" className="ml-1 bg-blue-100 text-blue-800">{statusCounts.ready}</Badge>
                            </Button>
                            <Button
                                variant={selectedStatus === 'completed' ? 'default' : 'ghost'}
                                onClick={() => setSelectedStatus('completed')}
                                className="text-sm"
                            >
                                Completed <Badge variant="secondary" className="ml-1 bg-green-100 text-green-800">{statusCounts.completed}</Badge>
                            </Button>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Recall
                            </Button>
                            <Button variant="ghost" size="sm">
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* To Cook Column */}
                    <KanbanColumn
                        title="To Cook"
                        status={KDSOrderStatus.RECEIVED}
                        orders={filteredOrders.filter(o => o.status === KDSOrderStatus.RECEIVED)}
                        onOrderDrop={handleOrderDrop}
                        getElapsedTime={getElapsedTime}
                        getStatusColor={getStatusColor}
                    />

                    {/* Preparing Column */}
                    <KanbanColumn
                        title="Preparing"
                        status={KDSOrderStatus.PREPARING}
                        orders={filteredOrders.filter(o => o.status === KDSOrderStatus.PREPARING)}
                        onOrderDrop={handleOrderDrop}
                        getElapsedTime={getElapsedTime}
                        getStatusColor={getStatusColor}
                    />

                    {/* Ready Column */}
                    <KanbanColumn
                        title="Ready"
                        status={KDSOrderStatus.READY}
                        orders={filteredOrders.filter(o => o.status === KDSOrderStatus.READY)}
                        onOrderDrop={handleOrderDrop}
                        getElapsedTime={getElapsedTime}
                        getStatusColor={getStatusColor}
                    />

                    {/* Completed Column */}
                    <KanbanColumn
                        title="Completed"
                        status={KDSOrderStatus.COMPLETED}
                        orders={filteredOrders.filter(o => o.status === KDSOrderStatus.COMPLETED)}
                        onOrderDrop={handleOrderDrop}
                        getElapsedTime={getElapsedTime}
                        getStatusColor={getStatusColor}
                    />
                </div>
            </div>
        </div>
    );
}

// Kanban Column Component
interface KanbanColumnProps {
    title: string;
    status: KDSOrderStatus;
    orders: KDSOrder[];
    onOrderDrop: (orderId: number, newStatus: KDSOrderStatus) => void;
    getElapsedTime: (orderTime: string) => string;
    getStatusColor: (minutes: number) => string;
}

function KanbanColumn({ title, status, orders, onOrderDrop, getElapsedTime, getStatusColor }: KanbanColumnProps) {
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const orderId = parseInt(e.dataTransfer.getData('orderId'));
        if (orderId) {
            onOrderDrop(orderId, status);
        }
    };

    const getColumnColor = () => {
        switch (status) {
            case KDSOrderStatus.RECEIVED: return 'border-orange-200 bg-orange-50';
            case KDSOrderStatus.PREPARING: return 'border-blue-200 bg-blue-50';
            case KDSOrderStatus.READY: return 'border-green-200 bg-green-50';
            case KDSOrderStatus.COMPLETED: return 'border-gray-200 bg-gray-50';
            default: return 'border-gray-200 bg-gray-50';
        }
    };

    return (
        <div
            className={`min-h-[600px] rounded-lg border-2 border-dashed p-4 ${getColumnColor()}`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
        >
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
                <Badge variant="secondary" className="mt-1">
                    {orders.length}
                </Badge>
            </div>

            <div className="space-y-4">
                {orders.map((order) => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        getElapsedTime={getElapsedTime}
                        getStatusColor={getStatusColor}
                    />
                ))}
            </div>
        </div>
    );
}

// Order Card Component
interface OrderCardProps {
    order: KDSOrder;
    getElapsedTime: (orderTime: string) => string;
    getStatusColor: (minutes: number) => string;
}

function OrderCard({ order, getElapsedTime, getStatusColor }: OrderCardProps) {
    const handleDragStart = (e: React.DragEvent) => {
        e.dataTransfer.setData('orderId', order.id.toString());
    };

    return (
        <Card
            className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-move"
            draggable
            onDragStart={handleDragStart}
        >
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                            {order.tableName || `T${order.tableId}`} #{order.orderNumber}
                        </span>
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{order.staffName || 'Staff'}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {order.items.length}
                    </Badge>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <Badge
                        className={`text-white text-xs px-2 py-1 ${getStatusColor(parseInt(getElapsedTime(order.orderTime)))}`}
                    >
                        <Clock className="h-3 w-3 mr-1" />
                        {getElapsedTime(order.orderTime)}
                    </Badge>
                    <span className="text-xs text-gray-500 capitalize">{order.status.toLowerCase()}</span>
                </div>
            </CardHeader>

            <CardContent>
                <div className="space-y-2">
                    {order.items.map((item) => (
                        <div key={item.id} className="text-sm">
                            <div className="flex items-start gap-2">
                                <span className="font-medium text-gray-700">{item.quantity}x</span>
                                <div className="flex-1">
                                    <div className="text-gray-900">{item.productName}</div>
                                    {item.notes && (
                                        <div className="text-xs text-orange-600 mt-1">
                                            - Notes: {item.notes}
                                        </div>
                                    )}
                                    {item.modifiers && item.modifiers.length > 0 && (
                                        <div className="text-xs text-blue-600 mt-1">
                                            - Modifiers: {item.modifiers.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
