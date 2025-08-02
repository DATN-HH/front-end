'use client';

import { Settings, X, RotateCcw, Clock, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Mock data - in real implementation, this would come from API
interface KitchenOrderItem {
    id: number;
    name: string;
    quantity: number;
    modifiers?: string[];
    prepared: boolean;
}

interface KitchenOrder {
    id: number;
    orderNumber: string;
    tableNumber?: string;
    employee: string;
    stage: 'to-cook' | 'ready' | 'completed';
    items: KitchenOrderItem[];
    stageStartTime: Date;
    totalItems: number;
    estimatedTime?: number;
}

type OrderStage = 'all' | 'to-cook' | 'ready' | 'completed';

export function KitchenDisplay() {
    const [selectedStage, setSelectedStage] = useState<OrderStage>('all');
    const [orders, setOrders] = useState<KitchenOrder[]>([]);

    // Mock orders data
    useEffect(() => {
        const mockOrders: KitchenOrder[] = [
            {
                id: 1,
                orderNumber: 'ORD-001',
                tableNumber: '5',
                employee: 'John Doe',
                stage: 'to-cook',
                stageStartTime: new Date(Date.now() - 5 * 60000), // 5 minutes ago
                totalItems: 3,
                estimatedTime: 15,
                items: [
                    {
                        id: 1,
                        name: 'Bacon Burger',
                        quantity: 1,
                        modifiers: ['Extra Cheese', 'No Onions'],
                        prepared: false,
                    },
                    {
                        id: 2,
                        name: 'French Fries',
                        quantity: 2,
                        prepared: false,
                    },
                    { id: 3, name: 'Coca-Cola', quantity: 1, prepared: true },
                ],
            },
            {
                id: 2,
                orderNumber: 'ORD-002',
                tableNumber: '3',
                employee: 'Jane Smith',
                stage: 'ready',
                stageStartTime: new Date(Date.now() - 2 * 60000), // 2 minutes ago
                totalItems: 2,
                items: [
                    {
                        id: 4,
                        name: 'Pizza Margherita',
                        quantity: 1,
                        prepared: true,
                    },
                    { id: 5, name: 'Green Tea', quantity: 1, prepared: true },
                ],
            },
            {
                id: 3,
                orderNumber: 'ORD-003',
                employee: 'Mike Johnson',
                stage: 'completed',
                stageStartTime: new Date(Date.now() - 10 * 60000), // 10 minutes ago
                totalItems: 1,
                items: [
                    { id: 6, name: 'Espresso', quantity: 2, prepared: true },
                ],
            },
        ];
        setOrders(mockOrders);
    }, []);

    const getOrdersByStage = (stage: OrderStage) => {
        if (stage === 'all') return orders;
        return orders.filter((order) => order.stage === stage);
    };

    const getStageCount = (stage: OrderStage) => {
        return getOrdersByStage(stage).length;
    };

    const getElapsedTime = (startTime: Date) => {
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 60000);
        return `${elapsed}'`;
    };

    const getStageColor = (stage: string) => {
        switch (stage) {
            case 'to-cook':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'ready':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'completed':
                return 'bg-gray-100 text-gray-800 border-gray-200';
            default:
                return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const handleOrderStageChange = (
        orderId: number,
        newStage: 'to-cook' | 'ready' | 'completed'
    ) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId
                    ? { ...order, stage: newStage, stageStartTime: new Date() }
                    : order
            )
        );
    };

    const handleItemToggle = (orderId: number, itemId: number) => {
        setOrders((prev) =>
            prev.map((order) =>
                order.id === orderId
                    ? {
                          ...order,
                          items: order.items.map((item) =>
                              item.id === itemId
                                  ? { ...item, prepared: !item.prepared }
                                  : item
                          ),
                      }
                    : order
            )
        );
    };

    const stages = [
        { id: 'all' as OrderStage, label: 'All', count: getStageCount('all') },
        {
            id: 'to-cook' as OrderStage,
            label: 'To cook',
            count: getStageCount('to-cook'),
        },
        {
            id: 'ready' as OrderStage,
            label: 'Ready',
            count: getStageCount('ready'),
        },
        {
            id: 'completed' as OrderStage,
            label: 'Completed',
            count: getStageCount('completed'),
        },
    ];

    const filteredOrders = getOrdersByStage(selectedStage);

    return (
        <div className="h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    {/* Settings Button */}
                    <Button variant="ghost" size="sm" className="p-2">
                        <Settings className="w-5 h-5" />
                    </Button>

                    {/* Stage Tabs */}
                    <div className="flex space-x-2">
                        {stages.map((stage) => (
                            <Button
                                key={stage.id}
                                variant={
                                    selectedStage === stage.id
                                        ? 'default'
                                        : 'outline'
                                }
                                className={`px-4 py-2 ${
                                    selectedStage === stage.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white text-gray-700 border-gray-300'
                                }`}
                                onClick={() => setSelectedStage(stage.id)}
                            >
                                {stage.label}{' '}
                                {stage.count > 0 && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded-full">
                                        {stage.count}
                                    </span>
                                )}
                            </Button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Recall
                        </Button>
                        <Button variant="outline" size="sm">
                            <X className="w-4 h-4 mr-2" />
                            Close
                        </Button>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="flex-1 p-6 overflow-auto">
                {filteredOrders.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <div className="text-6xl mb-4">🍽️</div>
                            <h3 className="text-xl font-medium mb-2">
                                No Orders
                            </h3>
                            <p>
                                No orders in{' '}
                                {selectedStage === 'all'
                                    ? 'any stage'
                                    : selectedStage}{' '}
                                stage
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredOrders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Order Header */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <div className="font-bold text-lg">
                                            {order.orderNumber}
                                        </div>
                                        {order.tableNumber && (
                                            <div className="text-sm text-gray-600">
                                                Table {order.tableNumber}
                                            </div>
                                        )}
                                    </div>
                                    <Badge
                                        className={getStageColor(order.stage)}
                                    >
                                        {order.stage.replace('-', ' ')}
                                    </Badge>
                                </div>

                                {/* Order Info */}
                                <div className="text-sm text-gray-600 mb-3">
                                    <div>Employee: {order.employee}</div>
                                    <div className="flex items-center mt-1">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {getElapsedTime(order.stageStartTime)}
                                        {order.estimatedTime && (
                                            <span className="ml-2 text-orange-600">
                                                (Est: {order.estimatedTime}')
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-2 mb-4">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center justify-between p-2 rounded border cursor-pointer transition-colors ${
                                                item.prepared
                                                    ? 'bg-green-50 border-green-200 text-green-800'
                                                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                            }`}
                                            onClick={() =>
                                                handleItemToggle(
                                                    order.id,
                                                    item.id
                                                )
                                            }
                                        >
                                            <div className="flex-1">
                                                <div className="flex items-center">
                                                    <span className="font-medium">
                                                        {item.quantity}x{' '}
                                                        {item.name}
                                                    </span>
                                                    {item.prepared && (
                                                        <CheckCircle className="w-4 h-4 ml-2 text-green-600" />
                                                    )}
                                                </div>
                                                {item.modifiers &&
                                                    item.modifiers.length >
                                                        0 && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {item.modifiers.join(
                                                                ', '
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Actions */}
                                <div className="flex space-x-2">
                                    {order.stage === 'to-cook' && (
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() =>
                                                handleOrderStageChange(
                                                    order.id,
                                                    'ready'
                                                )
                                            }
                                        >
                                            Mark Ready
                                        </Button>
                                    )}
                                    {order.stage === 'ready' && (
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                            onClick={() =>
                                                handleOrderStageChange(
                                                    order.id,
                                                    'completed'
                                                )
                                            }
                                        >
                                            Complete
                                        </Button>
                                    )}
                                    {order.stage === 'completed' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1"
                                            onClick={() =>
                                                handleOrderStageChange(
                                                    order.id,
                                                    'to-cook'
                                                )
                                            }
                                        >
                                            Reopen
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
