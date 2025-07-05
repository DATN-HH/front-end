'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { usePosStore } from '@/stores/pos-store';
import { useCreatePayment, useCreateOrder } from '@/api/v1/pos';
import { useCurrentPosSession } from '@/api/v1/pos';
import { CreditCard, DollarSign, Smartphone, Gift, Receipt, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT' | 'GIFT_CARD';

export function PaymentModal() {
    const { toast } = useToast();
    const { 
        showPaymentModal, 
        closePaymentModal, 
        currentOrder,
        orderType,
        selectedCustomer,
        customerNotes,
        specialInstructions,
        getSubtotal,
        getTax,
        getTotal,
        clearOrder
    } = usePosStore();

    const { data: session } = useCurrentPosSession();
    const createOrderMutation = useCreateOrder();
    const createPaymentMutation = useCreatePayment();

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('CASH');
    const [cashReceived, setCashReceived] = useState('');
    const [tipAmount, setTipAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = getSubtotal();
    const tax = getTax();
    const total = getTotal();
    const tipValue = parseFloat(tipAmount) || 0;
    const cashValue = parseFloat(cashReceived) || 0;
    const change = cashValue - (total + tipValue);

    const paymentMethods = [
        { id: 'CASH' as PaymentMethod, name: 'Cash', icon: DollarSign, color: 'bg-green-600' },
        { id: 'CARD' as PaymentMethod, name: 'Card', icon: CreditCard, color: 'bg-blue-600' },
        { id: 'MOBILE_PAYMENT' as PaymentMethod, name: 'Mobile Pay', icon: Smartphone, color: 'bg-purple-600' },
        { id: 'GIFT_CARD' as PaymentMethod, name: 'Gift Card', icon: Gift, color: 'bg-pink-600' },
    ];

    const quickCashAmounts = [
        total,
        Math.ceil(total),
        Math.ceil(total / 5) * 5,
        Math.ceil(total / 10) * 10,
        Math.ceil(total / 20) * 20
    ].filter((amount, index, arr) => arr.indexOf(amount) === index).sort((a, b) => a - b);

    const handleProcessPayment = async () => {
        if (!session?.id) {
            toast({
                title: 'Error',
                description: 'No active session found',
                variant: 'destructive'
            });
            return;
        }

        if (selectedPaymentMethod === 'CASH' && cashValue < total) {
            toast({
                title: 'Insufficient Cash',
                description: 'Cash received is less than the total amount',
                variant: 'destructive'
            });
            return;
        }

        setIsProcessing(true);

        try {
            // First create the order
            const orderData = {
                sessionId: session.id,
                customerId: selectedCustomer?.id,
                orderType,
                customerNotes,
                specialInstructions,
                items: currentOrder.map(item => ({
                    itemType: item.itemType,
                    productId: item.productId,
                    comboId: item.comboId,
                    comboVariantId: item.comboVariantId,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                    notes: item.notes,
                    specialInstructions: item.specialInstructions,
                    comboSelections: item.comboSelections?.map(selection => ({
                        comboItemId: selection.comboItemId,
                        selectedProductId: selection.selectedProductId,
                        quantity: selection.quantity,
                        unitPrice: selection.unitPrice,
                        isIncluded: selection.isIncluded,
                        notes: selection.notes,
                        specialInstructions: selection.specialInstructions
                    }))
                }))
            };

            const createdOrder = await createOrderMutation.mutateAsync(orderData);

            // Then create the payment
            const paymentData = {
                orderId: createdOrder.id!,
                paymentMethod: selectedPaymentMethod,
                amount: total,
                tipAmount: tipValue
            };

            await createPaymentMutation.mutateAsync(paymentData);

            // Show success message
            toast({
                title: 'Payment Successful',
                description: `Order ${createdOrder.orderNumber} completed successfully`,
                variant: 'default'
            });

            // Show change for cash payments
            if (selectedPaymentMethod === 'CASH' && change > 0) {
                toast({
                    title: 'Change Due',
                    description: `Give customer $${change.toFixed(2)} in change`,
                    variant: 'default'
                });
            }

            // Clear order and close modal
            clearOrder();
            closePaymentModal();

            // Ask if they want to print receipt
            setTimeout(() => {
                toast({
                    title: 'Print Receipt?',
                    description: 'Would you like to print a receipt for this order?',
                    action: (
                        <Button size="sm" onClick={() => handlePrintReceipt(createdOrder.orderNumber!)}>
                            <Receipt className="h-4 w-4 mr-2" />
                            Print
                        </Button>
                    ),
                });
            }, 1000);

        } catch (error) {
            console.error('Payment processing error:', error);
            toast({
                title: 'Payment Failed',
                description: 'There was an error processing the payment. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePrintReceipt = (orderNumber: string) => {
        // Generate receipt content
        const receiptContent = generateReceiptContent(orderNumber);
        
        // Open in new window for printing
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(receiptContent);
            printWindow.document.close();
            printWindow.print();
        }
    };

    const generateReceiptContent = (orderNumber: string) => {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Receipt - ${orderNumber}</title>
                <style>
                    body { font-family: monospace; font-size: 14px; margin: 20px; }
                    .header { text-align: center; margin-bottom: 20px; }
                    .order-details { margin-bottom: 20px; }
                    .items { margin-bottom: 20px; }
                    .total { border-top: 1px solid #000; padding-top: 10px; }
                    .footer { text-align: center; margin-top: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h2>Menu+ Receipt</h2>
                    <p>${session?.branch?.name || 'Restaurant'}</p>
                    <p>Order #: ${orderNumber}</p>
                    <p>Date: ${new Date().toLocaleString()}</p>
                </div>
                
                <div class="order-details">
                    <p>Order Type: ${orderType.replace('_', ' ')}</p>
                    ${selectedCustomer ? `<p>Customer: ${selectedCustomer.name}</p>` : ''}
                    ${customerNotes ? `<p>Notes: ${customerNotes}</p>` : ''}
                </div>
                
                <div class="items">
                    <h3>Items:</h3>
                    ${currentOrder.map(item => `
                        <p>${item.quantity}x ${item.productName || item.comboName} - $${(item.totalPrice || 0).toFixed(2)}</p>
                    `).join('')}
                </div>
                
                <div class="total">
                    <p>Subtotal: $${subtotal.toFixed(2)}</p>
                    <p>Tax: $${tax.toFixed(2)}</p>
                    ${tipValue > 0 ? `<p>Tip: $${tipValue.toFixed(2)}</p>` : ''}
                    <p><strong>Total: $${(total + tipValue).toFixed(2)}</strong></p>
                    ${selectedPaymentMethod === 'CASH' && change > 0 ? `<p>Change: $${change.toFixed(2)}</p>` : ''}
                </div>
                
                <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Powered by Menu+ POS</p>
                </div>
            </body>
            </html>
        `;
    };

    return (
        <Dialog open={showPaymentModal} onOpenChange={closePaymentModal}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-orange-600" />
                        Process Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between text-sm mb-2">
                            <span>Subtotal:</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Tax (10%):</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Total:</span>
                            <span className="text-orange-600">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {paymentMethods.map((method) => {
                                const Icon = method.icon;
                                return (
                                    <Button
                                        key={method.id}
                                        variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                                        onClick={() => setSelectedPaymentMethod(method.id)}
                                        className={`p-3 h-auto ${
                                            selectedPaymentMethod === method.id ? method.color : ''
                                        }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <Icon className="h-5 w-5 mb-1" />
                                            <span className="text-xs">{method.name}</span>
                                        </div>
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Cash Payment Details */}
                    {selectedPaymentMethod === 'CASH' && (
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cash Received
                                </label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={cashReceived}
                                    onChange={(e) => setCashReceived(e.target.value)}
                                    className="text-lg"
                                />
                            </div>
                            
                            {/* Quick Cash Buttons */}
                            <div className="grid grid-cols-3 gap-2">
                                {quickCashAmounts.slice(0, 6).map((amount) => (
                                    <Button
                                        key={amount}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCashReceived(amount.toFixed(2))}
                                    >
                                        ${amount.toFixed(2)}
                                    </Button>
                                ))}
                            </div>

                            {/* Change Calculation */}
                            {cashValue > 0 && (
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <div className="flex justify-between text-sm">
                                        <span>Cash Received:</span>
                                        <span>${cashValue.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Total Due:</span>
                                        <span>${(total + tipValue).toFixed(2)}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between font-semibold">
                                        <span>Change:</span>
                                        <span className={change >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            ${change.toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tip Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tip Amount (Optional)
                        </label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={closePaymentModal}
                            className="flex-1"
                            disabled={isProcessing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleProcessPayment}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            disabled={isProcessing || (selectedPaymentMethod === 'CASH' && cashValue < total)}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Complete Payment
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}