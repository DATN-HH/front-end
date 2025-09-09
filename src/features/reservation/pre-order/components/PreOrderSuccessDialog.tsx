'use client';

import {
    Printer,
    CreditCard,
    Banknote,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useState, useRef, useEffect } from 'react';

import {
    usePreOrderStatus,
    usePreOrderCashPayment,
    PreOrderCashPaymentRequest,
} from '@/api/v1/pre-order';
import { AdminCreatePreOrderResponse } from '@/api/v1/pre-order-management';
import { formatCurrency } from '@/api/v1/table-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface PreOrderSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    preOrderData: AdminCreatePreOrderResponse | null;
    onPaymentSuccess?: () => void;
    onClose?: () => void;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export function PreOrderSuccessDialog({
    open,
    onOpenChange,
    preOrderData,
    onPaymentSuccess,
    onClose,
}: PreOrderSuccessDialogProps) {
    const [showCashPayment, setShowCashPayment] = useState(false);
    const [givenAmount, setGivenAmount] = useState<number>(0);
    const [isPolling, setIsPolling] = useState(true);
    const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { success, error: showError } = useCustomToast();

    // Reset state when dialog opens/closes or booking changes
    useEffect(() => {
        if (open && preOrderData) {
            setIsPolling(true);
            setHasProcessedPayment(false);
            setShowCashPayment(false);
            setGivenAmount(0);
        }
    }, [open, preOrderData?.preOrderId]);

    // Poll pre-order status every 5 seconds
    const { data: statusData } = usePreOrderStatus(
        preOrderData?.preOrderId || 0,
        !!(preOrderData?.preOrderId && isPolling),
        5000
    );

    const cashPaymentMutation = usePreOrderCashPayment();

    // Check if payment is completed
    useEffect(() => {
        if (
            statusData?.payload?.bookingStatus === 'DEPOSIT_PAID' &&
            !hasProcessedPayment
        ) {
            setIsPolling(false);
            setHasProcessedPayment(true);
            success('Payment Completed', 'Deposit has been paid successfully!');
            onPaymentSuccess?.();
        }
    }, [statusData?.payload?.bookingStatus, hasProcessedPayment]);

    const handleCashPayment = async () => {
        if (!preOrderData || !givenAmount) {
            showError('Error', 'Please enter the amount given by customer');
            return;
        }

        const givenAmountNumber = givenAmount;
        const requiredAmount = preOrderData.totalDeposit;

        console.log('givenAmountNumber', givenAmountNumber);
        console.log('requiredAmount', requiredAmount);

        if (givenAmountNumber < requiredAmount) {
            showError('Error', 'Given amount is less than required deposit');
            return;
        }

        const request: PreOrderCashPaymentRequest = {
            preOrderId: preOrderData.preOrderId,
            requiredAmount,
            givenAmount: givenAmountNumber,
        };

        try {
            const response = await cashPaymentMutation.mutateAsync(request);

            if (response.success) {
                const changeAmount = givenAmountNumber - requiredAmount;
                success(
                    'Payment Processed',
                    `Cash payment processed successfully! ${
                        changeAmount > 0
                            ? `Change: ${formatCurrency(changeAmount)}`
                            : ''
                    }`
                );
                setIsPolling(false);
                setShowCashPayment(false);
                onPaymentSuccess?.();
            } else {
                showError('Error', 'Failed to process cash payment');
            }
        } catch (error) {
            console.error('Cash payment error:', error);
            showError('Error', 'Failed to process cash payment');
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Pre-Order Receipt</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .receipt { max-width: 400px; margin: 0 auto; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                                .qr-section { text-align: center; margin: 20px 0; }
                                .total { font-weight: bold; font-size: 18px; border-top: 1px solid #ccc; padding-top: 10px; }
                                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                            </style>
                        </head>
                        <body>
                            ${printRef.current.innerHTML}
                        </body>
                    </html>
                `);
                printWindow.document.close();
                printWindow.print();
            }
        }
    };

    const handleQuickAmount = (amount: number) => {
        setGivenAmount(amount);
    };

    if (!preOrderData) return null;

    const isPaymentCompleted =
        statusData?.payload?.bookingStatus === 'DEPOSIT_PAID';
    const changeAmount = givenAmount
        ? givenAmount - preOrderData.totalDeposit
        : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPaymentCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Pre-Order Confirmed - Payment Completed
                            </>
                        ) : (
                            <>
                                <Clock className="w-5 h-5 text-orange-500" />
                                Pre-Order Created - Awaiting Payment
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Pre-Order ID: #{preOrderData.preOrderId}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">
                            Status:
                        </span>
                        <Badge
                            variant={
                                isPaymentCompleted ? 'default' : 'secondary'
                            }
                        >
                            {statusData?.payload?.bookingStatus ||
                                preOrderData.bookingStatus}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">
                                Order Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span className="font-medium">
                                        {preOrderData.customerName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span>{preOrderData.customerPhone}</span>
                                </div>
                                {preOrderData.customerEmail && (
                                    <div className="flex justify-between">
                                        <span>Email:</span>
                                        <span>
                                            {preOrderData.customerEmail}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Date & Time:</span>
                                    <span>
                                        {new Date(
                                            preOrderData.time
                                        ).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type:</span>
                                    <span className="capitalize">
                                        {preOrderData.type}
                                    </span>
                                </div>
                                {preOrderData.notes && (
                                    <div className="flex justify-between">
                                        <span>Notes:</span>
                                        <span className="text-right">
                                            {preOrderData.notes}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">
                                Ordered Items
                            </h3>
                            <div className="space-y-2">
                                {preOrderData.orderItemsSummary.map((item) => (
                                    <div
                                        key={`${item.itemType}-${item.itemId}`}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {item.itemName}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                x{item.quantity}
                                            </span>
                                        </div>
                                        <span className="text-sm">
                                            {formatCurrency(item.totalPrice)}
                                        </span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between text-base">
                                    <span>Total Amount:</span>
                                    <span>
                                        {formatCurrency(
                                            preOrderData.totalAmount
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Required Deposit:</span>
                                    <span>
                                        {formatCurrency(
                                            preOrderData.totalDeposit
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isPaymentCompleted && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium text-orange-800">
                                        Payment Required
                                    </span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    Please complete the payment to confirm your
                                    pre-order. Order will expire at:{' '}
                                    {new Date(
                                        preOrderData.expireTime
                                    ).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payment Options */}
                    <div className="space-y-4">
                        {!isPaymentCompleted && preOrderData.qrCode && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    QR Payment
                                </h3>
                                <div className="text-center">
                                    <div className="flex justify-center">
                                        <QRCode
                                            value={preOrderData.qrCode}
                                            size={200}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Scan QR code to pay via banking
                                    </p>
                                    {/* {preOrderData.paymentUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                                window.open(
                                                    preOrderData.paymentUrl,
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Open Payment Link
                                        </Button>
                                    )} */}
                                </div>
                            </div>
                        )}

                        {!isPaymentCompleted && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Banknote className="w-4 h-4" />
                                    Cash Payment
                                </h3>

                                {!showCashPayment ? (
                                    <Button
                                        onClick={() => setShowCashPayment(true)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Process Cash Payment
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="givenAmount">
                                                Amount Given (VND)
                                            </Label>
                                            <Input
                                                id="givenAmount"
                                                type="text"
                                                value={givenAmount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ''
                                                        );
                                                    setGivenAmount(
                                                        parseInt(value) || 0
                                                    );
                                                }}
                                                placeholder="Enter amount..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {QUICK_AMOUNTS.map((amount) => (
                                                <Button
                                                    key={amount}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleQuickAmount(
                                                            amount
                                                        )
                                                    }
                                                    className="text-xs"
                                                >
                                                    {formatCurrency(amount)}
                                                </Button>
                                            ))}
                                        </div>

                                        {changeAmount > 0 && (
                                            <div className="p-2 bg-yellow-100 rounded text-sm">
                                                <span className="font-medium">
                                                    Change:{' '}
                                                    {formatCurrency(
                                                        changeAmount
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleCashPayment}
                                                disabled={
                                                    !givenAmount ||
                                                    cashPaymentMutation.isPending
                                                }
                                                className="flex-1"
                                            >
                                                {cashPaymentMutation.isPending
                                                    ? 'Processing...'
                                                    : 'Confirm Payment'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowCashPayment(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handlePrint}
                                className="flex-1 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" />
                                Print Receipt
                            </Button>
                            <Button
                                onClick={() => {
                                    onClose?.();
                                    onOpenChange(false);
                                }}
                                className="flex-1"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hidden Print Content */}
                <div ref={printRef} className="hidden">
                    <div className="receipt">
                        <div className="header">
                            <h2>PRE-ORDER RECEIPT</h2>
                            <p>Order ID: #{preOrderData.preOrderId}</p>
                        </div>

                        <div className="info-row">
                            <span>Customer:</span>
                            <span>{preOrderData.customerName}</span>
                        </div>
                        <div className="info-row">
                            <span>Phone:</span>
                            <span>{preOrderData.customerPhone}</span>
                        </div>
                        <div className="info-row">
                            <span>Date & Time:</span>
                            <span>
                                {new Date(preOrderData.time).toLocaleString(
                                    'vi-VN'
                                )}
                            </span>
                        </div>
                        <div className="info-row">
                            <span>Type:</span>
                            <span className="capitalize">
                                {preOrderData.type}
                            </span>
                        </div>

                        <br />
                        <strong>Ordered Items:</strong>
                        {preOrderData.orderItemsSummary.map((item) => (
                            <div
                                key={`${item.itemType}-${item.itemId}`}
                                className="info-row"
                            >
                                <span>
                                    {item.itemName} x{item.quantity}
                                </span>
                                <span>{formatCurrency(item.totalPrice)}</span>
                            </div>
                        ))}

                        <div className="info-row">
                            <span>Total Amount:</span>
                            <span>
                                {formatCurrency(preOrderData.totalAmount)}
                            </span>
                        </div>

                        <div className="info-row total">
                            <span>Required Deposit:</span>
                            <span>
                                {formatCurrency(preOrderData.totalDeposit)}
                            </span>
                        </div>

                        {preOrderData.qrCode && (
                            <div className="qr-section">
                                <QRCode
                                    value={preOrderData.qrCode}
                                    size={150}
                                />
                                <p>Scan to pay</p>
                            </div>
                        )}

                        <div className="footer">
                            <p>Thank you for your order!</p>
                            <p>
                                Generated: {new Date().toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
