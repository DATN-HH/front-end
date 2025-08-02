'use client';

import { CreditCard, Banknote, User, Receipt, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { usePOSOrder } from '@/contexts/pos-order-context';

interface POSPaymentInterfaceProps {
    onBack: () => void;
    onPaymentComplete: () => void;
}

type PaymentMethod = 'cash' | 'card' | 'vietqr';

export function POSPaymentInterface({
    onBack,
    onPaymentComplete,
}: POSPaymentInterfaceProps) {
    const { state } = usePOSOrder();
    const [selectedPaymentMethod, setSelectedPaymentMethod] =
        useState<PaymentMethod>('cash');
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [customerName, setCustomerName] = useState<string>('');
    const [generateInvoice, setGenerateInvoice] = useState<boolean>(false);

    const paymentMethods = [
        {
            id: 'cash' as PaymentMethod,
            name: 'Cash',
            icon: Banknote,
            description: 'Cash payment',
        },
        {
            id: 'card' as PaymentMethod,
            name: 'Card',
            icon: CreditCard,
            description: 'Credit/Debit card',
        },
        {
            id: 'vietqr' as PaymentMethod,
            name: 'VietQR',
            icon: CreditCard,
            description: 'QR Code payment',
        },
    ];

    const handleAmountButtonClick = (amount: number) => {
        const currentAmount = parseFloat(amountReceived) || 0;
        setAmountReceived((currentAmount + amount).toString());
    };

    const handleNumberClick = (num: string) => {
        if (num === '.') {
            if (!amountReceived.includes('.')) {
                setAmountReceived(`${amountReceived}.`);
            }
        } else if (num === '⌫') {
            setAmountReceived(amountReceived.slice(0, -1));
        } else if (num === '+/-') {
            // Toggle sign (not typically used for payments)
            return;
        } else {
            setAmountReceived(amountReceived + num);
        }
    };

    const calculateChange = () => {
        const received = parseFloat(amountReceived) || 0;
        return Math.max(0, received - state.total);
    };

    const isValidPayment = () => {
        if (selectedPaymentMethod === 'cash') {
            const received = parseFloat(amountReceived) || 0;
            return received >= state.total;
        }
        return true; // Card and VietQR don't need amount validation
    };

    const handleValidatePayment = () => {
        if (isValidPayment()) {
            // In a real implementation, this would process the payment
            onPaymentComplete();
        }
    };

    return (
        <div className="flex h-full bg-gray-100">
            {/* Left Panel - Payment Methods and Controls */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Payment Methods */}
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4">
                        Payment Method
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {paymentMethods.map((method) => {
                            const IconComponent = method.icon;
                            return (
                                <div
                                    key={method.id}
                                    className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                        selectedPaymentMethod === method.id
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() =>
                                        setSelectedPaymentMethod(method.id)
                                    }
                                >
                                    <IconComponent className="w-6 h-6 mr-3 text-gray-600" />
                                    <div>
                                        <div className="font-medium">
                                            {method.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {method.description}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Customer and Invoice Controls */}
                <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                className="flex-1 h-10"
                                onClick={() =>
                                    setCustomerName(
                                        customerName ? '' : 'Customer'
                                    )
                                }
                            >
                                <User className="w-4 h-4 mr-2" />
                                Customer
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button
                                variant={
                                    generateInvoice ? 'default' : 'outline'
                                }
                                className="flex-1 h-10"
                                onClick={() =>
                                    setGenerateInvoice(!generateInvoice)
                                }
                            >
                                <Receipt className="w-4 h-4 mr-2" />
                                Invoice
                            </Button>
                        </div>
                    </div>

                    {customerName && (
                        <div className="mb-4">
                            <Label
                                htmlFor="customerName"
                                className="text-sm font-medium"
                            >
                                Customer Name
                            </Label>
                            <Input
                                id="customerName"
                                value={customerName}
                                onChange={(e) =>
                                    setCustomerName(e.target.value)
                                }
                                placeholder="Enter customer name"
                                className="mt-1"
                            />
                        </div>
                    )}
                </div>

                {/* Numeric Keypad */}
                <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            1,
                            2,
                            3,
                            '+10',
                            4,
                            5,
                            6,
                            '+20',
                            7,
                            8,
                            9,
                            '+50',
                            '+/-',
                            0,
                            '.',
                            '⌫',
                        ].map((key) => (
                            <Button
                                key={key}
                                variant="outline"
                                className="h-10 text-sm"
                                onClick={() => {
                                    if (typeof key === 'number') {
                                        handleNumberClick(key.toString());
                                    } else if (key.startsWith('+')) {
                                        const amount = parseInt(
                                            key.substring(1)
                                        );
                                        if (!isNaN(amount)) {
                                            handleAmountButtonClick(
                                                amount * 1000
                                            ); // Convert to VND
                                        }
                                    } else {
                                        handleNumberClick(key);
                                    }
                                }}
                            >
                                {key}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="p-6 border-t border-gray-200 mt-auto">
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            variant="outline"
                            onClick={onBack}
                            className="h-12"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <Button
                            onClick={handleValidatePayment}
                            disabled={!isValidPayment()}
                            className="h-12 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Validate
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Order Summary and Payment Details */}
            <div className="flex-1 bg-gray-50 p-6">
                <div className="max-w-md mx-auto">
                    {/* Order Summary */}
                    <div className="bg-white rounded-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Order Summary
                        </h3>
                        <div className="space-y-3">
                            {state.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between text-sm"
                                >
                                    <div>
                                        <div className="font-medium">
                                            {item.productName}
                                        </div>
                                        <div className="text-gray-500">
                                            Qty: {item.quantity}
                                        </div>
                                        {item.modifiers &&
                                            item.modifiers.length > 0 && (
                                                <div className="text-xs text-gray-400">
                                                    {item.modifiers
                                                        .map((mod) => mod.name)
                                                        .join(', ')}
                                                </div>
                                            )}
                                    </div>
                                    <div className="font-medium">
                                        {item.totalPrice.toLocaleString()} ₫
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>Subtotal:</span>
                                <span>{state.subtotal.toLocaleString()} ₫</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span>Tax (10%):</span>
                                <span>{state.tax.toLocaleString()} ₫</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t pt-2">
                                <span>Total:</span>
                                <span>{state.total.toLocaleString()} ₫</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-white rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                            Payment Details
                        </h3>

                        {selectedPaymentMethod === 'cash' && (
                            <div className="space-y-4">
                                <div>
                                    <Label
                                        htmlFor="amountReceived"
                                        className="text-sm font-medium"
                                    >
                                        Amount Received
                                    </Label>
                                    <Input
                                        id="amountReceived"
                                        value={amountReceived}
                                        onChange={(e) =>
                                            setAmountReceived(e.target.value)
                                        }
                                        placeholder="0"
                                        className="mt-1 text-right text-lg"
                                    />
                                </div>

                                {amountReceived && (
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between text-lg font-semibold">
                                            <span>Change:</span>
                                            <span className="text-green-600">
                                                {calculateChange().toLocaleString()}{' '}
                                                ₫
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {selectedPaymentMethod === 'card' && (
                            <div className="text-center py-8">
                                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600">
                                    Insert or swipe card
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Amount: {state.total.toLocaleString()} ₫
                                </p>
                            </div>
                        )}

                        {selectedPaymentMethod === 'vietqr' && (
                            <div className="text-center py-8">
                                <div className="w-32 h-32 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-500 text-sm">
                                        QR Code
                                    </span>
                                </div>
                                <p className="text-gray-600">
                                    Scan QR code to pay
                                </p>
                                <p className="text-sm text-gray-500 mt-2">
                                    Amount: {state.total.toLocaleString()} ₫
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
