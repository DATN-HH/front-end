'use client';

import { PayOSConfig, usePayOS } from '@payos/payos-checkout';
import { QrCode, Loader2, CheckCircle } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { useCreatePaymentLinkForPreOrder } from '@/api/v1/payment';
import { Button } from '@/components/ui/button';
import { useCustomToast } from '@/lib/show-toast';

interface PreOrderPaymentQRCodeProps {
    preOrderId: number;
    amount: number;
    onPaymentSuccess?: () => void;
}

export function PreOrderPaymentQRCode({
    preOrderId,
    amount,
    onPaymentSuccess,
}: PreOrderPaymentQRCodeProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isShowQRCode, setIsShowQRCode] = useState(false);
    const [message, setMessage] = useState('');
    const [isCreatingLink, setIsCreatingLink] = useState(false);
    const { success, error } = useCustomToast();

    const createPaymentMutation = useCreatePaymentLinkForPreOrder();

    const [payOSConfig, setPayOSConfig] = useState<PayOSConfig>({
        RETURN_URL: 'http://example.com/payment/success',
        ELEMENT_ID: 'embedded-payment-container-preorder',
        CHECKOUT_URL: '',
        embedded: true,
        onSuccess: (event: any) => {
            setIsOpen(false);
            setMessage('Payment successful!');
            success('Success', 'Payment completed successfully');
            onPaymentSuccess?.();
        },
    });

    const { open, exit } = usePayOS(payOSConfig);

    const handleGetPaymentLink = async () => {
        setIsCreatingLink(true);
        exit();

        try {
            const result = await createPaymentMutation.mutateAsync(preOrderId);

            setPayOSConfig((oldConfig) => ({
                ...oldConfig,
                CHECKOUT_URL: result.checkoutUrl,
            }));

            setIsOpen(true);
            setIsShowQRCode(true);
            success('Success', 'Payment link created successfully');
        } catch (err: any) {
            console.error('Payment link creation failed:', err);
            error('Error', 'Failed to create payment link');
        } finally {
            setIsCreatingLink(false);
        }
    };

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL != null) {
            exit();
            open();
        }
    }, [payOSConfig]);

    if (message) {
        return (
            <div className="text-center p-6">
                <div className="flex items-center justify-center mb-4">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-lg font-medium text-green-600">{message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Payment</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Deposit amount:{' '}
                    <span className="font-semibold text-green-600">
                        {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'VND',
                        }).format(amount)}
                    </span>
                </p>
            </div>

            {!isOpen ? (
                <div className="text-center">
                    {isCreatingLink ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" />
                            <span className="text-sm">
                                Creating payment link...
                            </span>
                        </div>
                    ) : (
                        <Button
                            onClick={handleGetPaymentLink}
                            className="w-full"
                            disabled={createPaymentMutation.isPending}
                        >
                            <QrCode className="w-4 h-4 mr-2" />
                            Generate QR Code Payment
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setIsOpen(false);
                            setIsShowQRCode(false);
                            exit();
                        }}
                        className="w-full"
                    >
                        Close Payment
                    </Button>

                    <div className="text-center text-sm text-gray-600">
                        After successful payment, please wait 5-10 seconds for
                        the system to automatically update.
                    </div>
                </div>
            )}

            <div
                id="embedded-payment-container-preorder"
                className="min-h-[350px] border rounded-lg bg-gray-50"
                style={{
                    height: isOpen ? '350px' : 'auto',
                    minHeight: isOpen ? '350px' : '100px',
                    display: isShowQRCode ? 'block' : 'none',
                }}
            ></div>
        </div>
    );
}
