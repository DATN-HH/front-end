'use client';

import {
    Clock,
    MapPin,
    User,
    Phone,
    Package,
    Timer,
    CreditCard,
    Calendar,
    ShoppingBag,
    ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { usePreOrderDetail } from '@/api/v1/pre-order-management';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function PreOrderDetailPage() {
    const params = useParams();
    const preOrderId = Number(params.id);

    const { data: preOrder, isLoading, error } = usePreOrderDetail(preOrderId);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return 'bg-blue-100 text-blue-800';
            case 'DEPOSIT_PAID':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return 'Booked';
            case 'DEPOSIT_PAID':
                return 'Deposit Paid';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const getAllItems = () => {
        if (!preOrder) return [];
        return [
            ...preOrder.foodCombos.map((item) => ({ ...item, type: 'combo' })),
            ...preOrder.products.map((item) => ({ ...item, type: 'product' })),
            ...preOrder.productVariants.map((item) => ({
                ...item,
                type: 'variant',
            })),
        ];
    };

    const totalItems = getAllItems().reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 lg:gap-6">
                <PageTitle
                    icon={ShoppingBag}
                    title="Pre-order Details"
                    left={
                        <Link href="/app/reservation/pre-order">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                    }
                />
                <div className="space-y-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-32 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !preOrder) {
        return (
            <div className="flex flex-col gap-4 lg:gap-6">
                <PageTitle
                    icon={ShoppingBag}
                    title="Pre-order Details"
                    left={
                        <Link href="/app/reservation/pre-order">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                    }
                />
                <Card>
                    <CardContent className="text-center py-12">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Pre-order Not Found
                        </h3>
                        <p className="text-gray-500">
                            The pre-order you're looking for doesn't exist or
                            you don't have permission to view it.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={ShoppingBag}
                title={`Pre-order #${preOrder.id}`}
                left={
                    <Link href="/app/reservation/pre-order">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Status and Basic Info */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5" />
                                    Order Information
                                </CardTitle>
                                <Badge
                                    className={getStatusColor(
                                        preOrder.bookingStatus
                                    )}
                                >
                                    {getStatusText(preOrder.bookingStatus)}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Order Type
                                        </p>
                                        <p className="font-medium">
                                            {preOrder.type === 'dine-in'
                                                ? 'Dine In'
                                                : 'Takeaway'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Branch
                                        </p>
                                        <p className="font-medium">
                                            {preOrder.branchName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Pickup Time
                                        </p>
                                        <p className="font-medium">
                                            {formatDateTime(preOrder.time)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Created At
                                        </p>
                                        <p className="font-medium">
                                            {formatDateTime(preOrder.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                {preOrder.tableName && (
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Table
                                            </p>
                                            <p className="font-medium">
                                                {preOrder.tableName}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Timer className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Payment Expires
                                        </p>
                                        <p className="font-medium text-red-600">
                                            {formatDateTime(
                                                preOrder.expireTime
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {preOrder.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            Notes
                                        </p>
                                        <p className="font-medium bg-gray-50 p-3 rounded">
                                            {preOrder.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Customer Name
                                        </p>
                                        <p className="font-medium">
                                            {preOrder.customerName}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Phone Number
                                        </p>
                                        <p className="font-medium">
                                            {preOrder.customerPhone}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                            <CardDescription>
                                {totalItems} items in this order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {getAllItems().map((item, index) => (
                                    <div
                                        key={`${item.type}-${item.id}-${index}`}
                                        className="flex items-center justify-between p-4 border rounded-lg"
                                    >
                                        <div className="flex-1">
                                            <p className="font-medium">
                                                {item.itemName}
                                            </p>
                                            {item.note && (
                                                <p className="text-sm text-gray-500">
                                                    {item.note}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    {item.type === 'combo'
                                                        ? 'Food Combo'
                                                        : item.type ===
                                                            'variant'
                                                          ? 'Product Variant'
                                                          : 'Product'}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">
                                                {item.quantity}x{' '}
                                                {formatCurrency(item.price)}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Total:{' '}
                                                {formatCurrency(item.total)}
                                            </p>
                                            {item.promotionPrice && (
                                                <p className="text-sm text-green-600">
                                                    Promo:{' '}
                                                    {formatCurrency(
                                                        item.totalPromotion || 0
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="w-5 h-5" />
                                Payment Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">
                                        Total Items ({totalItems})
                                    </span>
                                    <span>
                                        {formatCurrency(preOrder.totalAmount)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                    <span className="font-semibold text-green-800">
                                        Deposit Required
                                    </span>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(preOrder.totalDeposit)}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button className="w-full" disabled>
                                Generate Payment Link
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                Update Status
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                disabled
                            >
                                Print Receipt
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
