'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { PayOSConfig, usePayOS } from '@payos/payos-checkout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode, CheckCircle, X, Smartphone } from 'lucide-react';

// PayOS Type definitions based on documentation
interface PayOSEvent {
    loading: boolean;
    code: string; // '00': SUCCESS, '01': FAILED, '02': INVALID_PARAM
    id: string; // paymentLinkId
    cancel: string;
    orderCode: number;
    status: string; // 'CANCELLED' or 'PAID'
}

function CustomerPaymentContent() {
    const searchParams = useSearchParams();
    const checkoutUrl = searchParams.get('url');
    const [paymentStatus, setPaymentStatus] = useState<'loading' | 'ready' | 'success' | 'cancelled'>('loading');
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [qrCodeLoaded, setQrCodeLoaded] = useState(false);

    const [payOSConfig, setPayOSConfig] = useState<PayOSConfig>({
        RETURN_URL: "https://example.com/payment/success", // Must match the iframe display URL
        ELEMENT_ID: 'customer-payment-container',
        CHECKOUT_URL: "",
        embedded: true,
        onSuccess: (event: PayOSEvent) => {
            console.log('Customer payment success:', event);
            // Event structure: { loading: boolean, code: string, id: string, cancel: string, orderCode: number, status: string }

            if (event.code === '00' && event.status === 'PAID') {
                setPaymentStatus('success');
                setIsPaymentOpen(false);

                // Notify parent window if it exists
                if (window.opener) {
                    window.opener.postMessage({
                        type: 'PAYMENT_SUCCESS',
                        data: event
                    }, '*');
                }
            }
        },
        onCancel: (event: PayOSEvent) => {
            console.log('Customer payment cancelled:', event);
            // Event structure: { loading: boolean, code: string, id: string, cancel: string, orderCode: number, status: string }

            setPaymentStatus('cancelled');
            setIsPaymentOpen(false);

            // Notify parent window if it exists
            if (window.opener) {
                window.opener.postMessage({
                    type: 'PAYMENT_CANCELLED',
                    data: event
                }, '*');
            }
        },
        onExit: (event: PayOSEvent) => {
            console.log('Customer payment exit:', event);
            // Called when user clicks "X" to close the payment iframe

            setPaymentStatus('cancelled');
            setIsPaymentOpen(false);

            // Notify parent window if it exists
            if (window.opener) {
                window.opener.postMessage({
                    type: 'PAYMENT_EXIT',
                    data: event
                }, '*');
            }
        }
    });

    const { open, exit } = usePayOS(payOSConfig);

    useEffect(() => {
        if (checkoutUrl) {
            console.log('Checkout URL received:', checkoutUrl);
            setQrCodeLoaded(false); // Reset loading state
            setPayOSConfig(prevConfig => ({
                ...prevConfig,
                CHECKOUT_URL: checkoutUrl
            }));
            setPaymentStatus('ready');
            setIsPaymentOpen(true);
        }
    }, [checkoutUrl]);

    useEffect(() => {
        if (payOSConfig.CHECKOUT_URL && isPaymentOpen && paymentStatus === 'ready') {
            exit()
            open();

            // Set QR code as loaded after a short delay to allow PayOS to render
            const timer = setTimeout(() => {
                setQrCodeLoaded(true);
            }, 2000);

            // Also check for iframe loading
            const checkIframeLoaded = () => {
                const container = document.getElementById('customer-payment-container');
                if (container) {
                    const iframe = container.querySelector('iframe');
                    if (iframe) {
                        console.log('PayOS iframe detected');
                        setQrCodeLoaded(true);
                        clearTimeout(timer);
                    }
                }
            };

            // Check for iframe every 500ms
            const intervalId = setInterval(checkIframeLoaded, 500);

            // Cleanup
            return () => {
                clearTimeout(timer);
                clearInterval(intervalId);
            };
        }
    }, [payOSConfig]);

    if (paymentStatus === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">Loading payment...</p>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'success') {
        return (
            <div className="h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <CheckCircle className="h-32 w-32 text-green-600 mx-auto mb-8" />
                    <h1 className="text-4xl font-bold text-green-600 mb-4">Payment Successful!</h1>
                    <p className="text-green-800 text-xl mb-8">
                        Thank you for your purchase
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-md mx-auto">
                        <p className="text-gray-700">
                            Your order is being prepared. Please return to the staff for your receipt.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (paymentStatus === 'cancelled') {
        return (
            <div className="h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <X className="h-32 w-32 text-red-600 mx-auto mb-8" />
                    <h1 className="text-4xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
                    <p className="text-red-800 text-xl mb-8">
                        Payment was not completed
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-md mx-auto">
                        <p className="text-gray-700">
                            Please return to the staff to complete your order using another payment method.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex flex-col items-center justify-center p-4 overflow-hidden">
            <div className="w-full max-w-3xl flex-1 flex flex-col justify-center">
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="mx-auto mb-3">
                        <Smartphone className="h-12 w-12 text-purple-600 mx-auto" />
                    </div>
                    <h1 className="text-2xl font-bold text-purple-600 mb-2">Mobile Payment</h1>
                    <p className="text-gray-600">
                        Scan QR code with your mobile banking app
                    </p>
                </div>

                {/* QR Code Container */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div
                        id="customer-payment-container"
                        className="w-full h-[500px] bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center relative"
                    >
                        {!qrCodeLoaded && (
                            <div className="text-center absolute inset-0 flex items-center justify-center bg-gray-50 rounded-xl">
                                <div>
                                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                                    <p className="text-gray-600 text-lg">Loading payment QR code...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Simple status indicator */}
                <div className="text-center mt-4">
                    <div className={`inline-flex items-center px-4 py-2 rounded-full ${qrCodeLoaded
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${qrCodeLoaded
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                            }`}></div>
                        <span className="font-medium">
                            {qrCodeLoaded ? 'Payment Ready' : 'Loading QR Code...'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomerPaymentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">Loading payment...</p>
                </div>
            </div>
        }>
            <CustomerPaymentContent />
        </Suspense>
    );
} 