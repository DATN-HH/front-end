'use client';

import {
    Clock,
    MapPin,
    Phone,
    User,
    Timer,
    Utensils,
    Package,
    ShoppingBag,
} from 'lucide-react';
import { useState } from 'react';

import { PreOrderResponse } from '@/api/v1/pre-order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

import { PreOrderPaymentQRCode } from './PreOrderPaymentQRCode';

interface PreOrderConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preOrderData: PreOrderResponse | null;
    onPaymentSuccess?: () => void;
}

export function PreOrderConfirmDialog({
    open,
    onOpenChange,
    preOrderData,
    onPaymentSuccess,
}: PreOrderConfirmDialogProps) {
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    if (!preOrderData) return null;

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
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
        return [
            ...preOrderData.foodCombos.map((item) => ({
                ...item,
                type: 'combo',
            })),
            ...preOrderData.products.map((item) => ({
                ...item,
                type: 'product',
            })),
            ...preOrderData.productVariants.map((item) => ({
                ...item,
                type: 'variant',
            })),
        ];
    };

    const totalItems = getAllItems().reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const totalAmount = getAllItems().reduce(
        (sum, item) => sum + item.total,
        0
    );

    const handlePaymentSuccess = () => {
        setShowSuccessMessage(true);
        onPaymentSuccess?.();
    };

    if (showSuccessMessage) {
        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-green-600" />
                            Order Successful!
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Utensils className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Pre-order confirmed!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your order has been recorded and payment
                                completed successfully.
                            </p>
                            <p className="text-sm text-gray-500">
                                We will prepare your food and contact you when
                                ready.
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-green-800">
                                    Order ID
                                </span>
                                <span className="font-bold text-green-600">
                                    #{preOrderData.id}
                                </span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="w-full"
                            >
                                Close
                            </Button>
                        </div>
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
                        Confirm Pre-order Information
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Pre-order Status */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">
                                Pre-order ID
                            </p>
                            <p className="text-lg font-semibold">
                                #{preOrderData.id}
                            </p>
                        </div>
                        <Badge
                            className={getStatusColor(
                                preOrderData.bookingStatus
                            )}
                        >
                            {getStatusText(preOrderData.bookingStatus)}
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
                                        {preOrderData.customerName}
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
                                        {preOrderData.customerPhone}
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
                                        {preOrderData.type === 'dine-in'
                                            ? 'Dine In'
                                            : 'Takeaway'}
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
                                        {formatDateTime(preOrderData.time)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Timer className="w-4 h-4 text-gray-500" />
                                <div>
                                    <p className="text-sm text-gray-600">
                                        Payment Expires
                                    </p>
                                    <p className="font-medium text-red-600">
                                        {formatDateTime(
                                            preOrderData.expireTime
                                        )}
                                    </p>
                                </div>
                            </div>
                            {preOrderData.bookingTableId && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Booked Table
                                        </p>
                                        <p className="font-medium">
                                            #{preOrderData.bookingTableId}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        {preOrderData.notes && (
                            <div>
                                <p className="text-sm text-gray-600">Notes</p>
                                <p className="font-medium">
                                    {preOrderData.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Order Items */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">
                            Selected Items
                        </h3>
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
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium">
                                            {item.quantity}x{' '}
                                            {formatCurrency(item.price)}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {formatCurrency(item.total)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Total Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">
                                Total Items ({totalItems})
                            </span>
                            <span>{formatCurrency(totalAmount)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Deposit Required</span>
                            <span className="text-green-600">
                                {formatCurrency(preOrderData.totalDeposit)}
                            </span>
                        </div>
                    </div>

                    <Separator />

                    {/* Payment QR Code */}
                    {preOrderData.totalDeposit > 0 && (
                        <div className="space-y-3">
                            <PreOrderPaymentQRCode
                                preOrderId={preOrderData.id}
                                amount={preOrderData.totalDeposit}
                                onPaymentSuccess={handlePaymentSuccess}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
