'use client';

import { useMyPreOrderList } from '@/api/v1/pre-order-management';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function MyPreOrdersPage() {
    const router = useRouter();
    const [page, setPage] = useState(0);

    const { data: response, isLoading } = useMyPreOrderList({
        page,
        size: 10,
    });

    const preOrders = response?.data;

    const getStatusColor = (
        status: 'BOOKED' | 'DEPOSIT_PAID' | 'CANCELLED' | 'COMPLETED'
    ) => {
        switch (status) {
            case 'BOOKED':
                return 'bg-yellow-500';
            case 'DEPOSIT_PAID':
                return 'bg-green-500';
            case 'COMPLETED':
                return 'bg-blue-500';
            case 'CANCELLED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

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
                <h1 className="text-2xl font-bold">My Pre-Orders</h1>
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
                            response &&
                            response.page >=
                                Math.ceil(response.total / response.size) - 1
                        }
                    >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                </div>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Time</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Branch</TableHead>
                                <TableHead>Table</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total Amount</TableHead>
                                <TableHead>Deposit</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!preOrders?.length ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={9}
                                        className="text-center"
                                    >
                                        No pre-orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                preOrders.map((order) => (
                                    <TableRow key={order.id}>
                                        <TableCell>
                                            {format(
                                                parseISO(order.time),
                                                'dd/MM/yyyy HH:mm'
                                            )}
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {order.type.replace('-', ' ')}
                                        </TableCell>
                                        <TableCell>
                                            {order.branchName}
                                        </TableCell>
                                        <TableCell>
                                            {order.tableName || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {order.totalItems} items
                                        </TableCell>
                                        <TableCell>
                                            {order.totalAmount.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {order.totalDeposit.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`${getStatusColor(order.bookingStatus)} text-white`}
                                            >
                                                {order.bookingStatus.replace(
                                                    '_',
                                                    ' '
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    router.push(
                                                        `/my-pre-orders/${order.id}`
                                                    )
                                                }
                                            >
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {!preOrders?.length ? (
                    <div className="text-center text-gray-500 py-8">
                        No pre-orders found
                    </div>
                ) : (
                    preOrders.map((order) => (
                        <Card key={order.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        Order #{order.id}
                                    </CardTitle>
                                    <Badge
                                        className={`${getStatusColor(order.bookingStatus)} text-white`}
                                    >
                                        {order.bookingStatus.replace('_', ' ')}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {format(
                                        parseISO(order.time),
                                        'dd/MM/yyyy HH:mm'
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-gray-500">Type</span>
                                    <span className="capitalize">
                                        {order.type.replace('-', ' ')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-gray-500">
                                        Branch
                                    </span>
                                    <span>{order.branchName}</span>
                                </div>
                                {order.tableName && (
                                    <div className="grid grid-cols-2 gap-1">
                                        <span className="text-gray-500">
                                            Table
                                        </span>
                                        <span>{order.tableName}</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-gray-500">Items</span>
                                    <span>{order.totalItems} items</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-gray-500">
                                        Total Amount
                                    </span>
                                    <span>
                                        {order.totalAmount.toLocaleString(
                                            'vi-VN',
                                            {
                                                style: 'currency',
                                                currency: 'VND',
                                            }
                                        )}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-1">
                                    <span className="text-gray-500">
                                        Deposit
                                    </span>
                                    <span>
                                        {order.totalDeposit.toLocaleString(
                                            'vi-VN',
                                            {
                                                style: 'currency',
                                                currency: 'VND',
                                            }
                                        )}
                                    </span>
                                </div>
                                <Button
                                    className="w-full mt-2"
                                    onClick={() =>
                                        router.push(
                                            `/my-pre-orders/${order.id}`
                                        )
                                    }
                                >
                                    View Details
                                </Button>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
