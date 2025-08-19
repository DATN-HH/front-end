'use client';

import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useState } from 'react';

import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import {
    useCustomerOrders,
    formatOrderStatus,
    formatOrderType,
    getOrderStatusColor,
} from '@/api/v1/preorder-pos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/contexts/auth-context';

export default function MyOrdersPage() {
    const { user } = useAuth();
    const [page, setPage] = useState(0);
    const pageSize = 10;

    const {
        data: ordersData,
        isLoading,
        error: fetchError,
    } = useCustomerOrders(user?.phoneNumber || null, page, pageSize);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (!user?.phoneNumber) {
        return (
            <div className="container mx-auto py-10 px-4">
                <Card>
                    <CardContent className="p-12 text-center">
                        <h3 className="text-xl font-medium mb-2 text-gray-900">
                            Phone Number Required
                        </h3>
                        <p className="text-gray-500">
                            Please add your phone number to your profile to view
                            your orders.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">My Orders</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(0, old - 1))}
                        disabled={page === 0}
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => old + 1)}
                        disabled={
                            ordersData &&
                            page >=
                                Math.ceil(ordersData.totalElements / pageSize) -
                                    1
                        }
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                {fetchError ? (
                    <div className="text-center py-8">
                        <p className="text-red-600 mb-4">
                            Failed to load orders
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                            {fetchError.message}
                        </p>
                    </div>
                ) : ordersData && ordersData.orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2 text-gray-900">
                            No Orders Found
                        </h3>
                        <p className="text-gray-500">
                            You haven't placed any orders yet.
                        </p>
                    </div>
                ) : (
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Order</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ordersData?.orders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            <div className="font-medium">
                                                #{order.orderNumber}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                ID: {order.id}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm">
                                                    {formatOrderType(
                                                        order.orderType
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm">
                                                    {formatDateTime(
                                                        order.createdAt
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={getOrderStatusColor(
                                                    order.orderStatus
                                                )}
                                            >
                                                {formatOrderStatus(
                                                    order.orderStatus
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm">
                                                <div className="font-medium">
                                                    {formatVietnameseCurrency(
                                                        order.totalAmount
                                                    )}
                                                </div>
                                                {order.deposit > 0 && (
                                                    <div className="text-green-600 text-xs">
                                                        Deposit:{' '}
                                                        {formatVietnameseCurrency(
                                                            order.deposit
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-gray-500 max-w-[200px] truncate">
                                                {order.notes || '-'}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-4">
                {ordersData?.orders.map((order) => (
                    <Card key={order.id}>
                        <CardHeader className="pb-2">
                            <div className="flex items-center justify-between">
                                <div className="font-medium">
                                    #{order.orderNumber}
                                </div>
                                <Badge
                                    className={getOrderStatusColor(
                                        order.orderStatus
                                    )}
                                >
                                    {formatOrderStatus(order.orderStatus)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-gray-400" />
                                    <span>
                                        {formatOrderType(order.orderType)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span>
                                        {formatDateTime(order.createdAt)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="text-sm text-gray-500">
                                    {order.notes || 'No notes'}
                                </div>
                                <div className="text-right">
                                    <div className="font-medium">
                                        {formatVietnameseCurrency(
                                            order.totalAmount
                                        )}
                                    </div>
                                    {order.deposit > 0 && (
                                        <div className="text-green-600 text-xs">
                                            Deposit:{' '}
                                            {formatVietnameseCurrency(
                                                order.deposit
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
