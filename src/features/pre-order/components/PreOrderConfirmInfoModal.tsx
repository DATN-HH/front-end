'use client';

import { Clock, CreditCard, CheckCircle } from 'lucide-react';

import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { PreOrderResponse } from '@/api/v1/pre-order';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useCustomToast } from '@/lib/show-toast';

import { PreOrderPaymentQRCode } from './PreOrderPaymentQRCode';

interface PreOrderConfirmInfoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preOrderData: PreOrderResponse | null;
    onConfirm?: () => void;
    onCancel?: () => void;
    onPaymentSuccess?: () => void;
}

export function PreOrderConfirmInfoModal({
    open,
    onOpenChange,
    preOrderData,
    onConfirm,
    onCancel,
    onPaymentSuccess,
}: PreOrderConfirmInfoModalProps) {
    const { success } = useCustomToast();

    const handlePaymentSuccess = () => {
        success(
            'Payment Success',
            'Payment completed successfully! Your order is confirmed.'
        );
        onPaymentSuccess?.();
    };

    // Calculate totals
    const totalItems = preOrderData
        ? (preOrderData.foodCombos?.reduce(
              (sum, item) => sum + item.quantity,
              0
          ) || 0) +
          (preOrderData.products?.reduce(
              (sum, item) => sum + item.quantity,
              0
          ) || 0) +
          (preOrderData.productVariants?.reduce(
              (sum, item) => sum + item.quantity,
              0
          ) || 0)
        : 0;

    const totalAmount = preOrderData
        ? (preOrderData.foodCombos?.reduce(
              (sum, item) => sum + item.total,
              0
          ) || 0) +
          (preOrderData.products?.reduce((sum, item) => sum + item.total, 0) ||
              0) +
          (preOrderData.productVariants?.reduce(
              (sum, item) => sum + item.total,
              0
          ) || 0)
        : 0;

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
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'PREPARING':
                return 'bg-blue-100 text-blue-800';
            case 'READY':
                return 'bg-purple-100 text-purple-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return 'Order Placed';
            case 'DEPOSIT_PAID':
                return 'Payment Confirmed';
            case 'CONFIRMED':
                return 'Confirmed';
            case 'PREPARING':
                return 'Preparing';
            case 'READY':
                return 'Ready for Pickup';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return status;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
                <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                Order Status
                            </p>
                            <p className="text-sm text-gray-600 font-normal">
                                Track your pre-order & payment
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {!preOrderData ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">
                                    Loading order details...
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Order Info Card */}
                            {/* <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="text-center space-y-4">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-gray-50 rounded-full">
                                            <ShoppingBag className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">
                                                Order ID
                                            </p>
                                            <p className="text-2xl font-bold text-gray-900">
                                                #{preOrderData.id}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center">
                                        <Badge
                                            className={`px-4 py-2 text-sm font-medium ${getStatusColor(
                                                preOrderData.bookingStatus
                                            )}`}
                                        >
                                            {getStatusText(preOrderData.bookingStatus)}
                                        </Badge>
                                    </div>
                                </div>
                            </div> */}

                            {/* Customer Info Card */}
                            {/* <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-600" />
                                    Customer Information
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <User className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Name
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {preOrderData.customerName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-100 rounded-lg">
                                            <Phone className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Phone
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {preOrderData.customerPhone}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            {/* Order Details */}
                            {/* <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Pickup Time
                                            </p>
                                            <p className="font-semibold text-gray-900">
                                                {formatDateTime(preOrderData.time)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <ShoppingBag className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">
                                                Order Type
                                            </p>
                                            <p className="font-semibold text-gray-900 capitalize">
                                                {preOrderData.type.replace('-', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div> */}

                            {/* Order Items Card */}
                            {/* <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Utensils className="w-4 h-4 text-purple-600" />
                                    Order Items
                                </h3>
                                <div className="space-y-3">
                                    {preOrderData.foodCombos?.map((item) => (
                                        <div
                                            key={`combo-${item.id}`}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-100 rounded-lg">
                                                    <Utensils className="w-4 h-4 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.itemName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} • Combo
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-xs text-gray-500 italic">
                                                            Note: {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-purple-600">
                                                    {formatVietnameseCurrency(item.total)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatVietnameseCurrency(item.price)}/each
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {preOrderData.products?.map((item) => (
                                        <div
                                            key={`product-${item.id}`}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Utensils className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.itemName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} • Product
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-xs text-gray-500 italic">
                                                            Note: {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-blue-600">
                                                    {formatVietnameseCurrency(item.total)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatVietnameseCurrency(item.price)}/each
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {preOrderData.productVariants?.map((item) => (
                                        <div
                                            key={`variant-${item.id}`}
                                            className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-green-100 rounded-lg">
                                                    <Utensils className="w-4 h-4 text-green-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">
                                                        {item.itemName}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Quantity: {item.quantity} • Variant
                                                    </p>
                                                    {item.note && (
                                                        <p className="text-xs text-gray-500 italic">
                                                            Note: {item.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-green-600">
                                                    {formatVietnameseCurrency(item.total)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatVietnameseCurrency(item.price)}/each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div> */}

                            {/* Special Notes */}
                            {preOrderData.notes && (
                                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <h3 className="font-semibold text-gray-900 mb-3">
                                        Special Notes
                                    </h3>
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                        <p className="text-sm text-amber-800 italic">
                                            "{preOrderData.notes}"
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Payment Info Card */}
                            <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        Payment Summary
                                    </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-gray-600">
                                            Total Items
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {totalItems} items
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                        <p className="text-gray-600">
                                            Order Total
                                        </p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatVietnameseCurrency(
                                                totalAmount
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <p className="text-blue-700 font-medium mb-2">
                                            Deposit Required
                                        </p>
                                        <p className="text-2xl font-bold text-blue-800">
                                            {formatVietnameseCurrency(
                                                preOrderData.totalDeposit
                                            )}
                                        </p>
                                        {preOrderData.totalDeposit === 0 && (
                                            <p className="text-sm text-green-600 mt-2">
                                                ✅ No deposit required - Order
                                                confirmed!
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {preOrderData.expireTime &&
                                    preOrderData.totalDeposit > 0 && (
                                        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-amber-600" />
                                                <p className="text-sm text-amber-800 font-medium">
                                                    Payment expires:{' '}
                                                    {formatDateTime(
                                                        preOrderData.expireTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                            </div>

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
                            <div className="flex gap-4 pt-6">
                                <Button
                                    variant="destructive"
                                    onClick={onCancel}
                                    className="w-full"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
