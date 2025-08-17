import { useQuery } from '@tanstack/react-query';
import {
    Banknote,
    Calculator,
    DollarSign,
    Printer,
    QrCode,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import React, { useState, useRef, useEffect } from 'react';

import {
    useCreateVietQRPaymentLink,
    useCreatePOSOrderPayment,
    POSOrder,
    POSPaymentMethod,
    POSOrderStatus,
} from '@/api/v1/pos-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';
import { apiClient } from '@/services/api-client';

// Order status API interface
interface OrderStatusResponse {
    success: boolean;
    message: string;
    data: {
        orderStatus: POSOrderStatus;
    };
}

// API function to check order status
const getOrderStatus = async (
    orderId: number
): Promise<OrderStatusResponse> => {
    const response = await apiClient.get<OrderStatusResponse>(
        `/api/pos/orders/${orderId}/status`
    );
    return response.data;
};

interface PaymentModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    order: POSOrder;
    onPaymentSuccess?: () => void;
}

type PaymentMethod = 'CASH' | 'VIETQR';

const PaymentModal: React.FC<PaymentModalProps> = ({
    open,
    onOpenChange,
    order,
    onPaymentSuccess,
}) => {
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('CASH');
    const [cashReceived, setCashReceived] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [vietQRData, setVietQRData] = useState<any>(null);
    const [isPolling, setIsPolling] = useState(false);
    const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const createVietQRPayment = useCreateVietQRPaymentLink();
    const createPayment = useCreatePOSOrderPayment();

    const { success, error: showError } = useCustomToast();

    // Poll order status every 5 seconds when VietQR payment is active
    const { data: statusData } = useQuery({
        queryKey: ['pos-order-status', order.id],
        queryFn: () => getOrderStatus(order.id),
        enabled: isPolling && open,
        refetchInterval: 5000,
    });

    // Reset state when dialog opens/closes or order changes
    useEffect(() => {
        if (open && order) {
            setIsPolling(false);
            setHasProcessedPayment(false);
            setSelectedMethod('CASH');
            setCashReceived('');
            setVietQRData(null);
            setIsProcessing(false);

            // Auto-generate QR code when modal opens
            handleVietQRPaymentGeneration();
        }
    }, [open, order.id]);

    // Check if payment is completed
    useEffect(() => {
        if (
            statusData?.data?.orderStatus === POSOrderStatus.COMPLETED &&
            !hasProcessedPayment &&
            isPolling
        ) {
            setIsPolling(false);
            setHasProcessedPayment(true);
            success('Payment Completed', 'Order has been successfully paid!');
            onPaymentSuccess?.();
            onOpenChange(false);
        }
    }, [
        statusData?.data?.orderStatus,
        hasProcessedPayment,
        isPolling,
        onPaymentSuccess,
        onOpenChange,
        success,
    ]);

    const orderTotal = order.total || 0;
    const cashReceivedAmount = parseFloat(cashReceived) || 0;
    const changeAmount = cashReceivedAmount - orderTotal;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const handleCashPayment = async () => {
        if (cashReceivedAmount < orderTotal) {
            showError('Error', 'Insufficient amount received for payment!');
            return;
        }

        setIsProcessing(true);
        try {
            await createPayment.mutateAsync({
                orderId: order.id,
                amount: orderTotal,
                method: POSPaymentMethod.CASH,
                reference: JSON.stringify({
                    receivedAmount: cashReceivedAmount,
                    changeAmount: changeAmount > 0 ? changeAmount : 0,
                    paymentType: 'CASH',
                }),
            });

            const changeText =
                changeAmount > 0
                    ? ` Change: ${formatCurrency(changeAmount)}`
                    : '';
            success(
                'Payment Successful',
                `Cash payment processed successfully!${changeText}`
            );
            onPaymentSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error processing cash payment:', error);
            showError('Error', 'Error occurred while processing payment!');
        } finally {
            setIsProcessing(false);
        }
    };

    // Auto-generate QR code without user interaction
    const handleVietQRPaymentGeneration = async () => {
        try {
            const paymentData = await createVietQRPayment.mutateAsync(order.id);
            setVietQRData(paymentData);
            // Don't start polling automatically, only when user selects VietQR
        } catch (error) {
            console.error('Error creating VietQR payment:', error);
            // Don't show error toast for auto-generation
        }
    };

    const handleVietQRPayment = async () => {
        if (!vietQRData) {
            setIsProcessing(true);
            try {
                const paymentData = await createVietQRPayment.mutateAsync(
                    order.id
                );
                setVietQRData(paymentData);
                setIsPolling(true); // Start polling for payment status

                success(
                    'QR Code Generated',
                    'VietQR payment QR code is displayed below. Payment status will be checked automatically.'
                );
            } catch (error) {
                console.error('Error creating VietQR payment:', error);
                showError(
                    'Error',
                    'Error occurred while creating VietQR payment link!'
                );
            } finally {
                setIsProcessing(false);
            }
        } else {
            // QR code already exists, just start polling
            setIsPolling(true);
            success(
                'VietQR Payment Selected',
                'Payment status will be checked automatically.'
            );
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Order Receipt</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .receipt { max-width: 400px; margin: 0 auto; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                                .qr-section { text-align: center; margin: 20px 0; }
                                .qr-section p { margin: 10px 0 0 0; font-size: 14px; font-weight: bold; }
                                .total { font-weight: bold; font-size: 18px; border-top: 1px solid #ccc; padding-top: 10px; }
                                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
                                svg { display: block; margin: 0 auto; }
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

    const resetModal = () => {
        setSelectedMethod('CASH');
        setCashReceived('');
        setVietQRData(null);
        setIsProcessing(false);
        setIsPolling(false);
        setHasProcessedPayment(false);
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            resetModal();
        }
        onOpenChange(open);
    };

    // Quick cash amount buttons
    const quickAmounts = [
        orderTotal, // Exact amount
        Math.ceil(orderTotal / 50000) * 50000, // Next 50k
        Math.ceil(orderTotal / 100000) * 100000, // Next 100k
        Math.ceil(orderTotal / 500000) * 500000, // Next 500k
    ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

    const isPaymentCompleted =
        statusData?.data?.orderStatus === POSOrderStatus.COMPLETED;

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPaymentCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Order Payment Completed
                            </>
                        ) : (
                            <>
                                <DollarSign className="h-5 w-5" />
                                Process Payment for Order #{order.orderNumber}
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>Order ID: #{order.id}</DialogDescription>
                    {isPolling && (
                        <div className="flex items-center gap-2 mt-2">
                            <Clock className="w-4 h-4 text-orange-500 animate-spin" />
                            <span className="text-sm text-muted-foreground">
                                Checking payment status...
                            </span>
                        </div>
                    )}
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Order Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Table:</span>
                                    <span className="font-medium">
                                        {order.tables && order.tables.length > 0
                                            ? order.tables
                                                  .map((t: any) => t.tableName)
                                                  .join(', ')
                                            : order.tableName ||
                                              `Table ${order.tableId}` ||
                                              'Direct Sale'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Items:</span>
                                    <span className="font-medium">
                                        {order.items?.length || 0} items
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span className="font-medium">
                                        {order.customerName || 'Walk-in'}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between">
                                    <span>Subtotal:</span>
                                    <span>
                                        {formatCurrency(order.subtotal)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Tax:</span>
                                    <span>{formatCurrency(order.tax)}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total:</span>
                                    <span className="text-green-600">
                                        {formatCurrency(orderTotal)}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    Order Items
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {item.productName ||
                                                    item.comboName}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                x{item.quantity}
                                            </span>
                                            {item.attributeCombination && (
                                                <div className="text-xs text-gray-500">
                                                    {item.attributeCombination}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm">
                                            {formatCurrency(item.totalPrice)}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {!isPaymentCompleted && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium text-orange-800">
                                        Payment Required
                                    </span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    Please complete the payment to finalize this
                                    order.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payment Options */}
                    <div className="space-y-4">
                        {!isPaymentCompleted && (
                            <div className="space-y-4">
                                <Label className="text-base font-semibold">
                                    Select Payment Method
                                </Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <Card
                                        className={`cursor-pointer transition-all ${
                                            selectedMethod === 'CASH'
                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                            setSelectedMethod('CASH')
                                        }
                                    >
                                        <CardContent className="p-4 text-center">
                                            <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                            <div className="font-medium">
                                                Cash
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Pay with cash
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={`cursor-pointer transition-all ${
                                            selectedMethod === 'VIETQR'
                                                ? 'ring-2 ring-blue-500 bg-blue-50'
                                                : 'hover:bg-gray-50'
                                        }`}
                                        onClick={() =>
                                            setSelectedMethod('VIETQR')
                                        }
                                    >
                                        <CardContent className="p-4 text-center">
                                            <QrCode className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                            <div className="font-medium">
                                                VietQR
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                Pay with QR Code
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Cash Payment Form */}
                        {selectedMethod === 'CASH' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Calculator className="h-5 w-5" />
                                        Cash Payment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Quick Amount Buttons */}
                                    <div>
                                        <Label className="text-sm font-medium mb-2 block">
                                            Quick amounts:
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {quickAmounts.map((amount) => (
                                                <Button
                                                    key={amount}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        setCashReceived(
                                                            amount.toString()
                                                        )
                                                    }
                                                    className="text-sm"
                                                >
                                                    {formatCurrency(amount)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Manual Input */}
                                    <div>
                                        <Label htmlFor="cashReceived">
                                            Amount received from customer:
                                        </Label>
                                        <Input
                                            id="cashReceived"
                                            type="number"
                                            value={cashReceived}
                                            onChange={(e) =>
                                                setCashReceived(e.target.value)
                                            }
                                            placeholder="Enter amount..."
                                            className="text-lg"
                                        />
                                    </div>

                                    {/* Change Calculation */}
                                    {cashReceived && (
                                        <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                                            <div className="flex justify-between">
                                                <span>Amount received:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        cashReceivedAmount
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Total amount:</span>
                                                <span className="font-medium">
                                                    {formatCurrency(orderTotal)}
                                                </span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between text-lg font-bold">
                                                <span>Change:</span>
                                                <span
                                                    className={
                                                        changeAmount < 0
                                                            ? 'text-red-600'
                                                            : 'text-green-600'
                                                    }
                                                >
                                                    {formatCurrency(
                                                        changeAmount > 0
                                                            ? changeAmount
                                                            : 0
                                                    )}
                                                </span>
                                            </div>
                                            {changeAmount < 0 && (
                                                <Badge
                                                    variant="destructive"
                                                    className="w-full justify-center"
                                                >
                                                    Insufficient{' '}
                                                    {formatCurrency(
                                                        Math.abs(changeAmount)
                                                    )}
                                                </Badge>
                                            )}
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleCashPayment}
                                        disabled={
                                            isProcessing ||
                                            cashReceivedAmount < orderTotal
                                        }
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isProcessing
                                            ? 'Processing...'
                                            : 'Process Cash Payment'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* VietQR Payment */}
                        {selectedMethod === 'VIETQR' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <QrCode className="h-5 w-5" />
                                        VietQR Payment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="text-center space-y-2">
                                        <div className="text-sm text-gray-600">
                                            Scan QR code for payment
                                        </div>
                                        <div className="text-lg font-semibold">
                                            Amount: {formatCurrency(orderTotal)}
                                        </div>
                                    </div>

                                    {vietQRData ? (
                                        <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                                            <div className="text-center">
                                                <Badge
                                                    variant="default"
                                                    className="bg-blue-600"
                                                >
                                                    QR Code Ready
                                                </Badge>
                                            </div>

                                            {/* QR Code Display */}
                                            <div className="flex justify-center">
                                                <QRCode
                                                    value={vietQRData.qrCode}
                                                    size={200}
                                                />
                                            </div>

                                            <div className="text-sm space-y-1">
                                                <div>
                                                    <strong>Order Code:</strong>{' '}
                                                    {vietQRData.orderCode}
                                                </div>
                                                <div>
                                                    <strong>Amount:</strong>{' '}
                                                    {formatCurrency(
                                                        vietQRData.amount
                                                    )}
                                                </div>
                                                <div>
                                                    <strong>Account:</strong>{' '}
                                                    {vietQRData.accountName}
                                                </div>
                                            </div>

                                            <p className="text-sm text-gray-600 text-center">
                                                Customer can scan QR code to pay
                                                via banking app
                                            </p>

                                            {isPolling && (
                                                <div className="p-2 bg-yellow-100 rounded text-sm text-center">
                                                    <span className="font-medium">
                                                        Waiting for payment
                                                        confirmation...
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 bg-gray-50 rounded-lg text-center">
                                            <div className="text-sm text-gray-600">
                                                Generating QR code...
                                            </div>
                                        </div>
                                    )}

                                    <Button
                                        onClick={handleVietQRPayment}
                                        disabled={
                                            isProcessing ||
                                            !vietQRData ||
                                            isPolling
                                        }
                                        className="w-full"
                                        size="lg"
                                    >
                                        {isPolling
                                            ? 'Monitoring Payment...'
                                            : !vietQRData
                                              ? 'Generating QR Code...'
                                              : 'Start Payment Monitoring'}
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Print and Close Actions */}
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
                                onClick={() => handleOpenChange(false)}
                                className="flex-1"
                                variant={
                                    isPaymentCompleted ? 'default' : 'outline'
                                }
                            >
                                {isPaymentCompleted ? 'Close' : 'Cancel'}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hidden Print Content */}
                <div ref={printRef} className="hidden">
                    <div className="receipt">
                        <div className="header">
                            <h2>ORDER RECEIPT</h2>
                            <p>Order #{order.orderNumber}</p>
                            <p>Order ID: #{order.id}</p>
                        </div>

                        <div className="info-row">
                            <span>Table:</span>
                            <span>
                                {order.tables && order.tables.length > 0
                                    ? order.tables
                                          .map((t: any) => t.tableName)
                                          .join(', ')
                                    : order.tableName ||
                                      `Table ${order.tableId}` ||
                                      'Direct Sale'}
                            </span>
                        </div>
                        <div className="info-row">
                            <span>Customer:</span>
                            <span>{order.customerName || 'Walk-in'}</span>
                        </div>
                        <div className="info-row">
                            <span>Date & Time:</span>
                            <span>
                                {new Date(order.createdAt).toLocaleString(
                                    'en-US'
                                )}
                            </span>
                        </div>

                        <br />
                        <strong>Order Items:</strong>
                        {order.items.map((item) => (
                            <div key={item.id} className="info-row">
                                <span>
                                    {item.productName} x{item.quantity}
                                    {item.attributeCombination && (
                                        <div
                                            style={{
                                                fontSize: '12px',
                                                color: '#666',
                                            }}
                                        >
                                            {item.attributeCombination}
                                        </div>
                                    )}
                                </span>
                                <span>{formatCurrency(item.totalPrice)}</span>
                            </div>
                        ))}

                        <div className="info-row">
                            <span>Subtotal:</span>
                            <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        <div className="info-row">
                            <span>Tax:</span>
                            <span>{formatCurrency(order.tax)}</span>
                        </div>

                        <div className="info-row total">
                            <span>Total:</span>
                            <span>{formatCurrency(orderTotal)}</span>
                        </div>

                        {vietQRData?.qrCode && (
                            <div className="qr-section">
                                <QRCode value={vietQRData.qrCode} size={150} />
                                <p>Scan QR Code to Pay</p>
                                <div
                                    style={{
                                        fontSize: '12px',
                                        marginTop: '10px',
                                    }}
                                >
                                    <div>
                                        Order Code: {vietQRData.orderCode}
                                    </div>
                                    <div>Account: {vietQRData.accountName}</div>
                                </div>
                            </div>
                        )}

                        <div className="footer">
                            <p>Thank you for your order!</p>
                            <p>
                                Generated: {new Date().toLocaleString('en-US')}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
