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
} from 'lucide-react';

import { usePreOrderDetail } from '@/api/v1/pre-order-management';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface PreOrderDetailDialogProps {
    preOrderId: number | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PreOrderDetailDialog({
    preOrderId,
    open,
    onOpenChange,
}: PreOrderDetailDialogProps) {
    const {
        data: preOrder,
        isLoading,
        error,
    } = usePreOrderDetail(preOrderId || 0);

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
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <Skeleton className="h-6 w-64" />
                    </DialogHeader>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (error || !preOrder) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Error</DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">
                            Failed to load pre-order details
                        </p>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5" />
                        Pre-order Details #{preOrder.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Pre-order ID
                            </p>
                            <p className="text-lg font-semibold">
                                #{preOrder.id}
                            </p>
                        </div>
                        <Badge
                            className={getStatusColor(preOrder.bookingStatus)}
                        >
                            {getStatusText(preOrder.bookingStatus)}
                        </Badge>
                    </div>

                    <Separator />

                    {/* Customer Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
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
                    </div>

                    <Separator />

                    {/* Order Details */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Order Details</h3>
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
                                        {formatDateTime(preOrder.expireTime)}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {preOrder.notes && (
                            <div>
                                <p className="text-sm text-gray-600">Notes</p>
                                <p className="font-medium bg-gray-50 p-2 rounded">
                                    {preOrder.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">Order Items</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {getAllItems().map((item, index) => (
                                <div
                                    key={`${item.type}-${item.id}-${index}`}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
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
                                                    : item.type === 'variant'
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
                                            Total: {formatCurrency(item.total)}
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
                    </div>

                    <Separator />

                    {/* Payment Summary */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">
                            Payment Summary
                        </h3>
                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    Total Items ({totalItems})
                                </span>
                                <span>
                                    {formatCurrency(preOrder.totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    <span className="font-semibold text-green-800">
                                        Deposit Required
                                    </span>
                                </div>
                                <span className="text-xl font-bold text-green-600">
                                    {formatCurrency(preOrder.totalDeposit)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
