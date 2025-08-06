'use client';

import { DollarSign, Check } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface POSCashPaymentProps {
    isOpen: boolean;
    orderTotal: number;
    onPaymentComplete: (paymentData: {
        method: 'CASH';
        amountReceived: number;
        change: number;
    }) => void;
    onClose: () => void;
}

export function POSCashPayment({
    isOpen,
    orderTotal,
    onPaymentComplete,
    onClose,
}: POSCashPaymentProps) {
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Calculate change
    const receivedAmount = parseFloat(amountReceived) || 0;
    const change = receivedAmount - orderTotal;
    const isValidPayment = receivedAmount >= orderTotal;

    // Quick amount buttons
    const quickAmounts = [
        orderTotal, // Exact amount
        Math.ceil(orderTotal / 10) * 10, // Round up to nearest 10
        Math.ceil(orderTotal / 20) * 20, // Round up to nearest 20
        Math.ceil(orderTotal / 50) * 50, // Round up to nearest 50
        Math.ceil(orderTotal / 100) * 100, // Round up to nearest 100
    ].filter((amount, index, arr) => arr.indexOf(amount) === index); // Remove duplicates

    const handleQuickAmount = (amount: number) => {
        setAmountReceived(amount.toString());
    };

    const handleProcessPayment = async () => {
        if (!isValidPayment) return;

        setIsProcessing(true);

        try {
            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 1000));

            onPaymentComplete({
                method: 'CASH',
                amountReceived: receivedAmount,
                change,
            });
        } catch (error) {
            console.error('Payment processing failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setAmountReceived('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5" />
                        Cash Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Order Total */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                        <div className="text-center">
                            <div className="text-sm text-blue-700 mb-1">
                                Order Total
                            </div>
                            <div className="text-2xl font-bold text-blue-900">
                                {new Intl.NumberFormat('vi-VN', {
                                    style: 'currency',
                                    currency: 'VND',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                }).format(orderTotal)}
                            </div>
                        </div>
                    </Card>

                    {/* Amount Received Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Amount Received
                        </label>
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={amountReceived}
                            onChange={(e) => setAmountReceived(e.target.value)}
                            placeholder="0.00"
                            className="text-lg text-center"
                            autoFocus
                        />
                    </div>

                    {/* Quick Amount Buttons */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Quick Amounts
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {quickAmounts.map((amount) => (
                                <Button
                                    key={amount}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleQuickAmount(amount)}
                                    className="text-sm"
                                >
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(amount)}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Change Calculation */}
                    {receivedAmount && (
                        <Card
                            className={`p-4 ${
                                isValidPayment
                                    ? change > 0
                                        ? 'bg-green-50 border-green-200'
                                        : 'bg-gray-50 border-gray-200'
                                    : 'bg-red-50 border-red-200'
                            }`}
                        >
                            <div className="text-center">
                                <div
                                    className={`text-sm mb-1 ${
                                        isValidPayment
                                            ? 'text-green-700'
                                            : 'text-red-700'
                                    }`}
                                >
                                    {isValidPayment
                                        ? change > 0
                                            ? 'Change Due'
                                            : 'Exact Amount'
                                        : 'Insufficient Amount'}
                                </div>
                                <div
                                    className={`text-xl font-bold ${
                                        isValidPayment
                                            ? change > 0
                                                ? 'text-green-900'
                                                : 'text-gray-900'
                                            : 'text-red-900'
                                    }`}
                                >
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                    }).format(Math.abs(change))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={handleClose}
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={handleProcessPayment}
                            disabled={!isValidPayment || isProcessing}
                        >
                            {isProcessing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" />
                                    Complete Payment
                                </div>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
