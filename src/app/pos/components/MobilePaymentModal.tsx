'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PayOSConfig, usePayOS } from '@payos/payos-checkout';
import { useCreatePaymentLinkForOrder } from '@/api/v1/payment';
import { Loader2, X, CheckCircle, CreditCard, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// PayOS Type definitions based on documentation
interface PayOSEvent {
    loading: boolean;
    code: string; // '00': SUCCESS, '01': FAILED, '02': INVALID_PARAM
    id: string; // paymentLinkId
    cancel: string;
    orderCode: number;
    status: string; // 'CANCELLED' or 'PAID'
}

interface MobilePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderTotal: number;
    onPaymentSuccess: () => void;
}

export function MobilePaymentModal({ isOpen, onClose, orderTotal, onPaymentSuccess }: MobilePaymentModalProps) {
    const { toast } = useToast();
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [customerWindow, setCustomerWindow] = useState<Window | null>(null);

    const createPaymentMutation = useCreatePaymentLinkForOrder();

    const [payOSConfig, setPayOSConfig] = useState<PayOSConfig>({
        RETURN_URL: "https://example.com/payment/success", // Return to POS after payment
        ELEMENT_ID: 'embedded-payment-container',
        CHECKOUT_URL: "",
        embedded: true,
        onSuccess: (event: any) => {
            console.log('Payment success:', event);
            // Event structure: { loading: boolean, code: string, id: string, cancel: string, orderCode: number, status: string }

            if (event.code === '00' && event.status === 'PAID') {
                setPaymentSuccess(true);
                setIsPaymentOpen(false);

                // Close customer window if it exists
                if (customerWindow && !customerWindow.closed) {
                    customerWindow.close();
                }

                toast({
                    title: 'Payment Successful!',
                    description: `Order ${event.orderCode} has been paid successfully.`,
                    variant: 'default'
                });

                // Notify parent component
                setTimeout(() => {
                    onPaymentSuccess();
                }, 2000);
            }
        },
        onCancel: (event: any) => {
            console.log('Payment cancelled:', event);
            // Event structure: { loading: boolean, code: string, id: string, cancel: string, orderCode: number, status: string }

            setIsPaymentOpen(false);

            // Close customer window if it exists
            if (customerWindow && !customerWindow.closed) {
                customerWindow.close();
            }

            toast({
                title: 'Payment Cancelled',
                description: `Order ${event.orderCode} payment was cancelled.`,
                variant: 'destructive'
            });
        },
        onExit: (event: any) => {
            console.log('Payment exit:', event);
            // Called when user clicks "X" to close the payment iframe

            setIsPaymentOpen(false);

            // Close customer window if it exists
            if (customerWindow && !customerWindow.closed) {
                customerWindow.close();
            }

            toast({
                title: 'Payment Closed',
                description: 'Payment window was closed.',
                variant: 'destructive'
            });
        }
    });

    const { open, exit } = usePayOS(payOSConfig);

    // Auto-create payment link when modal opens
    const handleCreatePaymentLink = async () => {
        setIsCreatingLink(true);
        try {
            // Call API to create payment link with hardcoded orderId = 1
            const result = await createPaymentMutation.mutateAsync(1);
            console.log('Payment API result:', result);
            console.log('Checkout URL:', result.checkoutUrl);

            if (result.checkoutUrl) {
                setPayOSConfig(oldConfig => ({
                    ...oldConfig,
                    CHECKOUT_URL: result.checkoutUrl,
                }));
            } else {
                throw new Error('No checkout URL received from API');
            }

            setIsPaymentOpen(true);

            // Automatically open customer window
            const newWindow = window.open(
                `/pos/customer-payment?url=${encodeURIComponent(result.checkoutUrl)}`,
                'customer-payment',
                'width=1200,height=800,scrollbars=yes,resizable=yes'
            );
            setCustomerWindow(newWindow);

            toast({
                title: 'Payment Link Created',
                description: 'Payment link has been created and customer window opened.',
            });

        } catch (error) {
            console.error('Error creating payment link:', error);
            toast({
                title: 'Error',
                description: 'Failed to create payment link. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setIsCreatingLink(false);
        }
    };

    const handleCancelPayment = () => {
        exit();
        setIsPaymentOpen(false);
        setPaymentSuccess(false);

        // Close customer window if it exists
        if (customerWindow && !customerWindow.closed) {
            customerWindow.close();
        }

        toast({
            title: 'Payment Cancelled',
            description: 'Payment process has been cancelled.',
            variant: 'destructive'
        });
    };

    const handleClose = () => {
        if (isPaymentOpen) {
            handleCancelPayment();
        }
        onClose();
    };

    // Auto-create payment link when modal opens
    useEffect(() => {
        if (isOpen && !isPaymentOpen && !isCreatingLink) {
            handleCreatePaymentLink();
        }
    }, [isOpen]);

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL && payOSConfig.CHECKOUT_URL !== "") {
            open();
        }
    }, [payOSConfig.CHECKOUT_URL]);

    // Clean up when component unmounts
    useEffect(() => {
        return () => {
            if (customerWindow && !customerWindow.closed) {
                customerWindow.close();
            }
        };
    }, [customerWindow]);

    if (paymentSuccess) {
        return (
            <Dialog open={isOpen} onOpenChange={handleClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center">
                            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                            Payment Successful
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Payment Completed!</h3>
                        <p className="text-gray-600 mb-4">
                            The payment of ${orderTotal.toFixed(2)} has been processed successfully.
                        </p>
                        <Button onClick={handleClose} className="w-full">
                            Close
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
                <DialogHeader className="px-6 py-4 border-b">
                    <DialogTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                        Mobile Payment
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                    {/* Order Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <div className="flex justify-between font-semibold">
                            <span>Total Amount:</span>
                            <span className="text-purple-600">${orderTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    {isCreatingLink ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                                <span className="text-lg">Creating Payment Link...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col">
                            {/* Status indicator */}
                            <div className="text-center mb-4">
                                <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mr-2 animate-pulse"></div>
                                    <span className="font-medium">Customer window opened • Payment ready</span>
                                </div>
                            </div>

                            {/* QR Code Display */}
                            <div className="flex-1 min-h-0">
                                <div
                                    id="embedded-payment-container"
                                    className="w-full h-full border rounded-lg overflow-hidden bg-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-4 pt-4 border-t">
                        <Button
                            onClick={handleClose}
                            variant="destructive"
                            className="w-full"
                            disabled={isCreatingLink}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Payment
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
} 