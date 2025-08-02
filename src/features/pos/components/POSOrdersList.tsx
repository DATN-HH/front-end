'use client';

import { Clock, Users, DollarSign } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function POSOrdersList() {
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    // Mock orders data - will be replaced with real API
    const mockOrders = [
        {
            id: 1,
            tableNumber: '5',
            customerName: 'John Doe',
            items: 3,
            total: 125000,
            status: 'preparing',
            time: '10:30 AM',
            duration: '15 min',
        },
        {
            id: 2,
            tableNumber: '12',
            customerName: 'Jane Smith',
            items: 2,
            total: 85000,
            status: 'ready',
            time: '10:45 AM',
            duration: '5 min',
        },
        {
            id: 3,
            tableNumber: null, // Direct sale
            customerName: 'Walk-in Customer',
            items: 1,
            total: 45000,
            status: 'completed',
            time: '11:00 AM',
            duration: '2 min',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'preparing':
                return 'bg-yellow-100 text-yellow-800';
            case 'ready':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'preparing':
                return 'Preparing';
            case 'ready':
                return 'Ready';
            case 'completed':
                return 'Completed';
            default:
                return 'Unknown';
        }
    };

    return (
        <div className="flex h-full">
            {/* Orders List */}
            <div className="w-1/2 bg-white border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Orders</h2>
                </div>

                <Tabs defaultValue="active" className="h-full">
                    <TabsList className="grid w-full grid-cols-3 m-4">
                        <TabsTrigger value="active">Active</TabsTrigger>
                        <TabsTrigger value="completed">Completed</TabsTrigger>
                        <TabsTrigger value="all">All</TabsTrigger>
                    </TabsList>

                    <TabsContent value="active" className="px-4 pb-4 space-y-3">
                        {mockOrders
                            .filter((order) => order.status !== 'completed')
                            .map((order) => (
                                <Card
                                    key={order.id}
                                    className={`cursor-pointer transition-all ${
                                        selectedOrder?.id === order.id
                                            ? 'ring-2 ring-blue-500 bg-blue-50'
                                            : 'hover:shadow-md'
                                    }`}
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {order.tableNumber
                                                        ? `Table ${order.tableNumber}`
                                                        : 'Direct Sale'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {order.customerName}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    order.status
                                                )}
                                            >
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center">
                                                    <Users className="w-4 h-4 mr-1" />
                                                    {order.items} items
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {order.duration}
                                                </div>
                                            </div>
                                            <div className="flex items-center font-semibold text-gray-800">
                                                <DollarSign className="w-4 h-4 mr-1" />
                                                {order.total.toLocaleString()} ₫
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </TabsContent>

                    <TabsContent
                        value="completed"
                        className="px-4 pb-4 space-y-3"
                    >
                        {mockOrders
                            .filter((order) => order.status === 'completed')
                            .map((order) => (
                                <Card
                                    key={order.id}
                                    className="cursor-pointer hover:shadow-md"
                                    onClick={() => setSelectedOrder(order)}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h3 className="font-semibold">
                                                    {order.tableNumber
                                                        ? `Table ${order.tableNumber}`
                                                        : 'Direct Sale'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {order.customerName}
                                                </p>
                                            </div>
                                            <Badge
                                                className={getStatusColor(
                                                    order.status
                                                )}
                                            >
                                                {getStatusLabel(order.status)}
                                            </Badge>
                                        </div>

                                        <div className="flex justify-between items-center text-sm text-gray-600">
                                            <span>{order.time}</span>
                                            <span className="font-semibold">
                                                {order.total.toLocaleString()} ₫
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                    </TabsContent>

                    <TabsContent value="all" className="px-4 pb-4 space-y-3">
                        {mockOrders.map((order) => (
                            <Card
                                key={order.id}
                                className="cursor-pointer hover:shadow-md"
                                onClick={() => setSelectedOrder(order)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold">
                                                {order.tableNumber
                                                    ? `Table ${order.tableNumber}`
                                                    : 'Direct Sale'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {order.customerName}
                                            </p>
                                        </div>
                                        <Badge
                                            className={getStatusColor(
                                                order.status
                                            )}
                                        >
                                            {getStatusLabel(order.status)}
                                        </Badge>
                                    </div>

                                    <div className="flex justify-between items-center text-sm text-gray-600">
                                        <span>{order.time}</span>
                                        <span className="font-semibold">
                                            {order.total.toLocaleString()} ₫
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>

            {/* Order Details */}
            <div className="w-1/2 bg-gray-50">
                {selectedOrder ? (
                    <div className="p-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {selectedOrder.tableNumber
                                        ? `Table ${selectedOrder.tableNumber}`
                                        : 'Direct Sale'}{' '}
                                    - Order #{selectedOrder.id}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Customer Information
                                        </h4>
                                        <p className="text-gray-600">
                                            {selectedOrder.customerName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Order placed at {selectedOrder.time}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Order Items
                                        </h4>
                                        <p className="text-gray-600">
                                            {selectedOrder.items} items -
                                            Details will be loaded here
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Total
                                        </h4>
                                        <p className="text-xl font-bold">
                                            {selectedOrder.total.toLocaleString()}{' '}
                                            ₫
                                        </p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            Edit Order
                                        </Button>
                                        <Button className="flex-1">
                                            Print Receipt
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center text-gray-500">
                            <h3 className="text-lg font-medium mb-2">
                                Select an Order
                            </h3>
                            <p>Choose an order from the list to view details</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
