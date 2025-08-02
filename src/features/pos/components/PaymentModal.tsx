import { Banknote, Smartphone, Calculator, DollarSign } from 'lucide-react';
import React, { useState } from 'react';

import {
    useCreateVietQRPaymentLink,
    useCreatePOSOrderPayment,
    POSOrder,
    POSPaymentMethod,
} from '@/api/v1/pos-orders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

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

    const createVietQRPayment = useCreateVietQRPaymentLink();
    const createPayment = useCreatePOSOrderPayment();

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
            alert('Số tiền nhận không đủ để thanh toán!');
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

            alert(
                `Thanh toán thành công!\nTiền thối: ${formatCurrency(changeAmount > 0 ? changeAmount : 0)}`
            );
            onPaymentSuccess?.();
            onOpenChange(false);
        } catch (error) {
            console.error('Error processing cash payment:', error);
            alert('Có lỗi xảy ra khi xử lý thanh toán!');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleVietQRPayment = async () => {
        setIsProcessing(true);
        try {
            const paymentData = await createVietQRPayment.mutateAsync(order.id);
            setVietQRData(paymentData);

            // Open payment URL in a new tab
            if (paymentData.checkoutUrl) {
                window.open(paymentData.checkoutUrl, '_blank');
            }

            alert(
                'Link thanh toán VietQR đã được tạo! Vui lòng kiểm tra tab mới để hoàn tất thanh toán.'
            );
        } catch (error) {
            console.error('Error creating VietQR payment:', error);
            alert('Có lỗi xảy ra khi tạo link thanh toán VietQR!');
        } finally {
            setIsProcessing(false);
        }
    };

    const resetModal = () => {
        setSelectedMethod('CASH');
        setCashReceived('');
        setVietQRData(null);
        setIsProcessing(false);
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Thanh toán đơn hàng #{order.orderNumber}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">
                                Tóm tắt đơn hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span>Bàn:</span>
                                <span className="font-medium">
                                    {order.tableName ||
                                        `Table ${order.tableId}`}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Số món:</span>
                                <span className="font-medium">
                                    {order.items?.length || 0} món
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Tổng tiền:</span>
                                <span className="text-green-600">
                                    {formatCurrency(orderTotal)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Method Selection */}
                    <div className="space-y-4">
                        <Label className="text-base font-semibold">
                            Chọn phương thức thanh toán
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Card
                                className={`cursor-pointer transition-all ${
                                    selectedMethod === 'CASH'
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedMethod('CASH')}
                            >
                                <CardContent className="p-4 text-center">
                                    <Banknote className="h-8 w-8 mx-auto mb-2 text-green-600" />
                                    <div className="font-medium">Tiền mặt</div>
                                    <div className="text-sm text-gray-500">
                                        Thanh toán bằng tiền mặt
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className={`cursor-pointer transition-all ${
                                    selectedMethod === 'VIETQR'
                                        ? 'ring-2 ring-blue-500 bg-blue-50'
                                        : 'hover:bg-gray-50'
                                }`}
                                onClick={() => setSelectedMethod('VIETQR')}
                            >
                                <CardContent className="p-4 text-center">
                                    <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                                    <div className="font-medium">VietQR</div>
                                    <div className="text-sm text-gray-500">
                                        Thanh toán qua QR Code
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Cash Payment Form */}
                    {selectedMethod === 'CASH' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calculator className="h-5 w-5" />
                                    Thanh toán tiền mặt
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Quick Amount Buttons */}
                                <div>
                                    <Label className="text-sm font-medium mb-2 block">
                                        Chọn nhanh:
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
                                        Số tiền nhận từ khách:
                                    </Label>
                                    <Input
                                        id="cashReceived"
                                        type="number"
                                        value={cashReceived}
                                        onChange={(e) =>
                                            setCashReceived(e.target.value)
                                        }
                                        placeholder="Nhập số tiền..."
                                        className="text-lg"
                                    />
                                </div>

                                {/* Change Calculation */}
                                {cashReceived && (
                                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex justify-between">
                                            <span>Tiền nhận:</span>
                                            <span className="font-medium">
                                                {formatCurrency(
                                                    cashReceivedAmount
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Tổng tiền:</span>
                                            <span className="font-medium">
                                                {formatCurrency(orderTotal)}
                                            </span>
                                        </div>
                                        <Separator />
                                        <div className="flex justify-between text-lg font-bold">
                                            <span>Tiền thối:</span>
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
                                                Thiếu{' '}
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
                                        ? 'Đang xử lý...'
                                        : 'Thanh toán tiền mặt'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* VietQR Payment */}
                    {selectedMethod === 'VIETQR' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Smartphone className="h-5 w-5" />
                                    Thanh toán VietQR
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center space-y-2">
                                    <div className="text-sm text-gray-600">
                                        Tạo link thanh toán VietQR cho khách
                                        hàng
                                    </div>
                                    <div className="text-lg font-semibold">
                                        Số tiền: {formatCurrency(orderTotal)}
                                    </div>
                                </div>

                                {vietQRData && (
                                    <div className="p-4 bg-green-50 rounded-lg space-y-2">
                                        <div className="text-center">
                                            <Badge
                                                variant="default"
                                                className="bg-green-600"
                                            >
                                                Link thanh toán đã được tạo
                                            </Badge>
                                        </div>
                                        <div className="text-sm">
                                            <div>
                                                <strong>Mã đơn hàng:</strong>{' '}
                                                {vietQRData.orderCode}
                                            </div>
                                            <div>
                                                <strong>Số tiền:</strong>{' '}
                                                {formatCurrency(
                                                    vietQRData.amount
                                                )}
                                            </div>
                                        </div>
                                        {vietQRData.checkoutUrl && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    window.open(
                                                        vietQRData.checkoutUrl,
                                                        '_blank'
                                                    )
                                                }
                                                className="w-full"
                                            >
                                                Mở lại link thanh toán
                                            </Button>
                                        )}
                                    </div>
                                )}

                                <Button
                                    onClick={handleVietQRPayment}
                                    disabled={isProcessing}
                                    className="w-full"
                                    size="lg"
                                >
                                    {isProcessing
                                        ? 'Đang tạo link...'
                                        : 'Tạo link thanh toán VietQR'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
