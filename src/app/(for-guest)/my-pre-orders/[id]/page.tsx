'use client';

import { usePreOrderDetail } from '@/api/v1/pre-order-management';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import {
    ChevronLeft,
    Clock,
    MapPin,
    Phone,
    User,
    Receipt,
    FileText,
    Wallet,
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type PreOrderDetailPageProps = {
    params: Promise<{ id: string }>;
};

export default async function PreOrderDetailPage({
    params,
}: PreOrderDetailPageProps) {
    const router = useRouter();
    const resolvedParams = await params;
    const { data: order, isLoading } = usePreOrderDetail(
        Number(resolvedParams.id)
    );

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

    if (!order) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="text-center text-gray-500">
                    <h2 className="text-2xl font-semibold mb-2">
                        Pre-order not found
                    </h2>
                    <p>
                        The pre-order you're looking for doesn't exist or has
                        been removed.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="mt-4"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <h1 className="text-2xl font-bold">
                            Pre-Order #{order.id}
                        </h1>
                        <Badge
                            className={`${getStatusColor(order.bookingStatus)} text-white`}
                        >
                            {order.bookingStatus.replace('_', ' ')}
                        </Badge>
                    </div>
                    <p className="text-gray-500 mt-1">
                        Created on{' '}
                        {format(
                            parseISO(order.createdAt),
                            'dd MMM yyyy, HH:mm'
                        )}
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back to List
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Order Summary
                            </CardTitle>
                            <CardDescription>
                                Details about your pre-order items and pricing
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Desktop View */}
                                <div className="hidden sm:block">
                                    {order.foodCombos.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Food Combos
                                            </h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50%]">
                                                            Item
                                                        </TableHead>
                                                        <TableHead>
                                                            Quantity
                                                        </TableHead>
                                                        <TableHead>
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Total
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {order.foodCombos.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        item.itemName
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.price.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {item.total.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {order.products.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Products
                                            </h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50%]">
                                                            Item
                                                        </TableHead>
                                                        <TableHead>
                                                            Quantity
                                                        </TableHead>
                                                        <TableHead>
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Total
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {order.products.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        item.itemName
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.price.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {item.total.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}

                                    {order.productVariants.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Product Variants
                                            </h3>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-[50%]">
                                                            Item
                                                        </TableHead>
                                                        <TableHead>
                                                            Quantity
                                                        </TableHead>
                                                        <TableHead>
                                                            Price
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Total
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {order.productVariants.map(
                                                        (item) => (
                                                            <TableRow
                                                                key={item.id}
                                                            >
                                                                <TableCell className="font-medium">
                                                                    {
                                                                        item.itemName
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {item.price.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    {item.total.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile View */}
                                <div className="sm:hidden space-y-6">
                                    {order.foodCombos.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Food Combos
                                            </h3>
                                            <div className="space-y-4">
                                                {order.foodCombos.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="border rounded-lg p-4"
                                                        >
                                                            <div className="font-medium mb-2">
                                                                {item.itemName}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="text-gray-500">
                                                                    Quantity
                                                                </div>
                                                                <div>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    Price
                                                                </div>
                                                                <div>
                                                                    {item.price.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    Total
                                                                </div>
                                                                <div className="font-medium">
                                                                    {item.total.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {order.products.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Products
                                            </h3>
                                            <div className="space-y-4">
                                                {order.products.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="border rounded-lg p-4"
                                                    >
                                                        <div className="font-medium mb-2">
                                                            {item.itemName}
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                                            <div className="text-gray-500">
                                                                Quantity
                                                            </div>
                                                            <div>
                                                                {item.quantity}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                Price
                                                            </div>
                                                            <div>
                                                                {item.price.toLocaleString(
                                                                    'vi-VN',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'VND',
                                                                    }
                                                                )}
                                                            </div>
                                                            <div className="text-gray-500">
                                                                Total
                                                            </div>
                                                            <div className="font-medium">
                                                                {item.total.toLocaleString(
                                                                    'vi-VN',
                                                                    {
                                                                        style: 'currency',
                                                                        currency:
                                                                            'VND',
                                                                    }
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {order.productVariants.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-3 text-primary">
                                                Product Variants
                                            </h3>
                                            <div className="space-y-4">
                                                {order.productVariants.map(
                                                    (item) => (
                                                        <div
                                                            key={item.id}
                                                            className="border rounded-lg p-4"
                                                        >
                                                            <div className="font-medium mb-2">
                                                                {item.itemName}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div className="text-gray-500">
                                                                    Quantity
                                                                </div>
                                                                <div>
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    Price
                                                                </div>
                                                                <div>
                                                                    {item.price.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </div>
                                                                <div className="text-gray-500">
                                                                    Total
                                                                </div>
                                                                <div className="font-medium">
                                                                    {item.total.toLocaleString(
                                                                        'vi-VN',
                                                                        {
                                                                            style: 'currency',
                                                                            currency:
                                                                                'VND',
                                                                        }
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-gray-500">
                                            Required Deposit
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {order.totalDeposit.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-gray-500">
                                            Total Amount
                                        </div>
                                        <div className="text-lg font-semibold">
                                            {order.totalAmount.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Order Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">
                                    Order Time
                                </div>
                                <div className="font-medium">
                                    {format(
                                        parseISO(order.time),
                                        'dd MMM yyyy, HH:mm'
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">
                                    Order Type
                                </div>
                                <div className="font-medium capitalize">
                                    {order.type.replace('-', ' ')}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">
                                    Total Items
                                </div>
                                <div className="font-medium">
                                    {order.totalItems} items
                                </div>
                            </div>
                            {order.notes && (
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Notes
                                    </div>
                                    <div className="font-medium">
                                        {order.notes}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Customer Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">
                                    Name
                                </div>
                                <div className="font-medium">
                                    {order.customerName}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">
                                    Phone
                                </div>
                                <div className="font-medium">
                                    {order.customerPhone}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Location
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">
                                    Branch
                                </div>
                                <div className="font-medium">
                                    {order.branchName}
                                </div>
                            </div>
                            {order.tableName && (
                                <div>
                                    <div className="text-sm text-gray-500">
                                        Table
                                    </div>
                                    <div className="font-medium">
                                        {order.tableName}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
