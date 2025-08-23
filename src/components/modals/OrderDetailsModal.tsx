'use client';

import {
    CreditCard,
    Package,
    Clock,
    CheckCircle,
    X,
    QrCode,
    Loader2,
    AlertCircle,
    Copy,
    ExternalLink,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useState, useEffect, useCallback } from 'react';

import {
    createPaymentLink,
    checkOrderStatus,
    type DeliveryOrder,
    type PaymentLinkData,
} from '@/api/v1/delivery/delivery-order';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface OrderDetailsModalProps {
    isOpen: boolean;
    order: DeliveryOrder;
    onClose: () => void;
}

type OrderStatusType =
    | 'DRAFT'
    | 'PREPARING'
    | 'READY'
    | 'COMPLETED'
    | 'CANCELLED';

const getStatusInfo = (status: OrderStatusType) => {
    switch (status) {
        case 'DRAFT':
            return {
                label: 'Pending Payment',
                color: 'bg-yellow-500',
                icon: Clock,
            };
        case 'PREPARING':
            return {
                label: 'Preparing',
                color: 'bg-blue-500',
                icon: Package,
            };
        case 'READY':
            return {
                label: 'Ready for Delivery',
                color: 'bg-green-500',
                icon: CheckCircle,
            };
        case 'COMPLETED':
            return {
                label: 'Delivered Successfully',
                color: 'bg-green-600',
                icon: CheckCircle,
            };
        case 'CANCELLED':
            return {
                label: 'Cancelled',
                color: 'bg-red-500',
                icon: X,
            };
        default:
            return {
                label: 'Unknown',
                color: 'bg-gray-500',
                icon: AlertCircle,
            };
    }
};

export function OrderDetailsModal({
    isOpen,
    order,
    onClose,
}: OrderDetailsModalProps) {
    const [paymentData, setPaymentData] = useState<PaymentLinkData | null>(
        null
    );
    const [isLoadingPayment, setIsLoadingPayment] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<OrderStatusType>(
        order.orderStatus as OrderStatusType
    );
    const [isPollingStatus, setIsPollingStatus] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    const { success, error } = useCustomToast();

    // Poll order status
    const pollOrderStatus = useCallback(async () => {
        if (
            currentStatus === 'PREPARING' ||
            currentStatus === 'COMPLETED' ||
            currentStatus === 'CANCELLED'
        ) {
            return;
        }

        try {
            const response = await checkOrderStatus(order.id);
            if (response.success) {
                const newStatus = response.data.orderStatus as OrderStatusType;

                if (newStatus !== currentStatus) {
                    setCurrentStatus(newStatus);

                    if (newStatus === 'PREPARING') {
                        success(
                            'Payment Successful!',
                            'Your order has been sent to kitchen'
                        );
                        setIsPollingStatus(false);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to check order status:', err);
        }
    }, [order.id, currentStatus, success]);

    // Start polling when payment link is generated
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPollingStatus && currentStatus === 'DRAFT') {
            interval = setInterval(() => {
                pollOrderStatus();
            }, 5000); // Poll every 5 seconds
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [isPollingStatus, currentStatus, pollOrderStatus]);

    const handleGeneratePaymentLink = async () => {
        setIsLoadingPayment(true);

        try {
            const response = await createPaymentLink(order.id);

            if (response.success) {
                setPaymentData(response.payload);
                setShowQRCode(true);
                setIsPollingStatus(true);
                success(
                    'Payment Link Created',
                    'Please scan QR code or use the payment link'
                );
            } else {
                error('Error', 'Cannot create payment link');
            }
        } catch (err) {
            console.error('Create payment link error:', err);
            error('Error', 'An error occurred while creating payment link');
        } finally {
            setIsLoadingPayment(false);
        }
    };

    const handleCopyLink = () => {
        if (paymentData?.checkoutUrl) {
            navigator.clipboard.writeText(paymentData.checkoutUrl);
            success('Copied', 'Payment link has been copied');
        }
    };

    const handleOpenPaymentLink = () => {
        if (paymentData?.checkoutUrl) {
            window.open(paymentData.checkoutUrl, '_blank');
        }
    };

    const statusInfo = getStatusInfo(currentStatus);
    const StatusIcon = statusInfo.icon;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Order Details #{order.orderNumber}
                    </DialogTitle>
                    <DialogDescription>
                        Order has been created successfully.{' '}
                        {currentStatus === 'DRAFT' &&
                            'Please complete payment to finalize your order.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Status */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <StatusIcon
                                    className={`h-6 w-6 text-white p-1 rounded-full ${statusInfo.color}`}
                                />
                                <div>
                                    <h3 className="font-semibold">
                                        Order Status
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        {statusInfo.label}
                                    </p>
                                </div>
                                {isPollingStatus &&
                                    currentStatus === 'DRAFT' && (
                                        <div className="ml-auto">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        </div>
                                    )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3">
                                Delivery Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-medium">
                                        Customer Name:
                                    </span>{' '}
                                    {order.customerName}
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Phone Number:
                                    </span>{' '}
                                    {order.customerPhone}
                                </div>
                                <div>
                                    <span className="font-medium">
                                        Address:
                                    </span>{' '}
                                    {order.address}
                                </div>
                                {order.notes && (
                                    <div>
                                        <span className="font-medium">
                                            Notes:
                                        </span>{' '}
                                        {order.notes}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Items */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3">
                                Ordered Items
                            </h3>
                            <div className="space-y-3">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {item.productName}
                                                </span>
                                                {item.isCombo && (
                                                    <Badge className="bg-orange-500 text-white text-xs">
                                                        Combo
                                                    </Badge>
                                                )}
                                            </div>
                                            {item.notes && (
                                                <p className="text-xs text-gray-600 italic">
                                                    Note: {item.notes}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm">
                                                {item.quantity}x{' '}
                                                {formatVietnameseCurrency(
                                                    item.unitPrice
                                                )}
                                            </div>
                                            <div className="font-semibold">
                                                {formatVietnameseCurrency(
                                                    item.totalPrice
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Order Summary */}
                    <Card>
                        <CardContent className="p-4">
                            <h3 className="font-semibold mb-3">
                                Payment Summary
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Subtotal</span>
                                    <span>
                                        {formatVietnameseCurrency(
                                            order.subtotal
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Tax</span>
                                    <span>
                                        {formatVietnameseCurrency(order.tax)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Shipping Fee</span>
                                    <span>
                                        {formatVietnameseCurrency(
                                            order.shippingFee
                                        )}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        {formatVietnameseCurrency(
                                            order.total + order.shippingFee
                                        )}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Section */}
                    {currentStatus === 'DRAFT' && (
                        <Card>
                            <CardContent className="p-4">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    Payment
                                </h3>

                                {!paymentData ? (
                                    <Button
                                        onClick={handleGeneratePaymentLink}
                                        disabled={isLoadingPayment}
                                        className="w-full bg-orange-500 hover:bg-orange-600"
                                    >
                                        {isLoadingPayment ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Generating QR...
                                            </>
                                        ) : (
                                            <>
                                                <QrCode className="mr-2 h-4 w-4" />
                                                Generate Payment QR Code
                                            </>
                                        )}
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        {showQRCode && (
                                            <div className="text-center">
                                                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                                    <QRCodeCanvas
                                                        value={
                                                            paymentData.qrCode
                                                        }
                                                        size={200}
                                                        level="M"
                                                        includeMargin={true}
                                                    />
                                                </div>
                                                <p className="text-sm text-gray-600 mt-2">
                                                    Scan QR code to make payment
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Button
                                                onClick={handleOpenPaymentLink}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                Open Payment Link
                                            </Button>

                                            <Button
                                                onClick={handleCopyLink}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                <Copy className="mr-2 h-4 w-4" />
                                                Copy Payment Link
                                            </Button>
                                        </div>

                                        <div className="text-xs text-gray-500 text-center">
                                            Amount:{' '}
                                            {formatVietnameseCurrency(
                                                paymentData.amount
                                            )}
                                            <br />
                                            Order Code: {paymentData.orderCode}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Success Message */}
                    {currentStatus === 'PREPARING' && (
                        <Card className="border-green-200 bg-green-50">
                            <CardContent className="p-4">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle className="h-5 w-5" />
                                    <div>
                                        <h3 className="font-semibold">
                                            Payment Successful!
                                        </h3>
                                        <p className="text-sm">
                                            Your order has been sent to kitchen
                                            and will be delivered as soon as
                                            possible.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        {currentStatus === 'DRAFT' && paymentData && (
                            <Button
                                onClick={() => setShowQRCode(!showQRCode)}
                                variant="outline"
                                className="flex-1"
                            >
                                {showQRCode ? 'Hide QR' : 'Show QR'}
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
