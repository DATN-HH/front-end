'use client';

import {
    Calendar,
    Clock,
    Users,
    CreditCard,
    Timer,
    Utensils,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

import {
    CreateBookingResponse,
    useCheckBookingPaymentStatus,
} from '@/api/v1/table-booking';
import { formatCurrency } from '@/api/v1/table-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

import { PaymentQRCode } from './PaymentQRCode';

interface BookingConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingData: CreateBookingResponse | null;
    branchId?: number;
    onConfirm?: () => void;
    onCancel?: () => void;
    onPaymentSuccess?: () => void;
}

export function BookingConfirmDialog({
    open,
    onOpenChange,
    bookingData,
    branchId,
    onConfirm,
    onCancel,
    onPaymentSuccess,
}: BookingConfirmDialogProps) {
    const router = useRouter();
    const { success, error } = useCustomToast();
    const [showMenuSuggestion, setShowMenuSuggestion] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Use the new payment status check API
    const { data: paymentStatusData, refetch: refetchPaymentStatus } =
        useCheckBookingPaymentStatus(
            bookingData?.bookingId || 0,
            open && !!bookingData?.bookingId // enabled when dialog is open and bookingId exists
        );

    // Auto-check payment status
    useEffect(() => {
        if (open && bookingData?.bookingId) {
            const checkPaymentStatus = async () => {
                try {
                    const result = await refetchPaymentStatus();

                    if (result.data?.success && result.data.payload) {
                        const paymentStatus = result.data.payload;

                        // Check if status is DEPOSIT_PAID (only successful payment status)
                        if (paymentStatus.bookingStatus === 'DEPOSIT_PAID') {
                            // Clear interval
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }

                            // Call original confirm handler
                            onConfirm?.();

                            // Show menu suggestion popup
                            setShowMenuSuggestion(true);
                        } else if (paymentStatus.expired) {
                            // Clear interval if expired
                            if (intervalRef.current) {
                                clearInterval(intervalRef.current);
                                intervalRef.current = null;
                            }
                            error(
                                'Booking Expired',
                                paymentStatus.statusMessage ||
                                    'This booking has expired. Please make a new reservation.'
                            );
                        }
                        // For all other statuses (BOOKED, etc.), continue checking silently
                    }
                } catch (err: any) {
                    console.error(
                        'Error checking booking payment status:',
                        err
                    );
                    // Handle specific error codes from API - silently for most errors
                    if (err.response?.status === 410) {
                        // Clear interval if expired
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        error(
                            'Booking Expired',
                            'This booking has expired and payment is no longer possible. Please make a new reservation.'
                        );
                    }
                    // Other errors are handled silently - continue checking
                }
            };

            if (bookingData.totalDeposit === 0) {
                // For zero deposit bookings, check immediately
                checkPaymentStatus();
            } else {
                // For bookings with deposit, start interval checking
                intervalRef.current = setInterval(checkPaymentStatus, 5000);
            }

            // Cleanup on unmount or dialog close
            return () => {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            };
        }
    }, [
        open,
        bookingData?.bookingId,
        bookingData?.totalDeposit,
        refetchPaymentStatus,
        onConfirm,
        error,
    ]);

    // Don't return null here - let the dialog show even without data

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatExpireTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return 'bg-blue-100 text-blue-800';
            case 'DEPOSIT_PAID':
                return 'bg-green-100 text-green-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'BOOKED':
                return 'Booked';
            case 'DEPOSIT_PAID':
                return 'Deposit Paid';
            case 'COMPLETED':
                return 'Completed';
            case 'CANCELLED':
                return 'Cancelled';
            default:
                return status;
        }
    };

    const handleConfirm = async () => {
        if (!bookingData) return;

        setIsCheckingStatus(true);

        try {
            // Fetch fresh payment status data to check status
            const result = await refetchPaymentStatus();

            if (result.data?.success && result.data.payload) {
                const paymentStatus = result.data.payload;

                // Check if status is DEPOSIT_PAID
                if (paymentStatus.bookingStatus === 'DEPOSIT_PAID') {
                    // Call original confirm handler
                    onConfirm?.();

                    // Show menu suggestion popup
                    setShowMenuSuggestion(true);
                } else if (paymentStatus.expired) {
                    error(
                        'Booking Expired',
                        'This booking has expired. Please make a new reservation.'
                    );
                } else if (paymentStatus.paymentRequired) {
                    error(
                        'Payment Required',
                        `${paymentStatus.statusMessage}. Please complete payment first.`
                    );
                } else {
                    error(
                        'Cannot Confirm',
                        paymentStatus.statusMessage ||
                            'Booking cannot be confirmed at this time.'
                    );
                }
            } else {
                error(
                    'Error',
                    'Failed to check booking status. Please try again.'
                );
            }
        } catch (err: any) {
            console.error('Error checking booking payment status:', err);
            // Handle specific error codes from API
            if (err.response?.status === 410) {
                error(
                    'Booking Expired',
                    'This booking has expired and payment is no longer possible. Please make a new reservation.'
                );
            } else if (err.response?.status === 404) {
                error(
                    'Booking Not Found',
                    'Booking not found. Please check your booking ID.'
                );
            } else {
                error(
                    'Error',
                    'Failed to check booking status. Please try again.'
                );
            }
        } finally {
            setIsCheckingStatus(false);
        }
    };

    const handleMenuBookingRedirect = () => {
        if (!bookingData) return;

        // Calculate duration in hours
        const startTime = new Date(bookingData.startTime);
        const endTime = new Date(bookingData.endTime);
        const durationHours = Math.round(
            (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)
        );

        // Use branchId from props, fallback to 1 if not provided
        const selectedBranchId = branchId || 1;

        const queryParams = new URLSearchParams({
            bookingtableId: bookingData.bookingId.toString(),
            branchId: selectedBranchId.toString(),
            time: bookingData.startTime,
            customerPhone: bookingData.customerPhone,
            customerName: bookingData.customerName,
        });

        router.push(`/menu-booking?${queryParams.toString()}`);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-gray-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-900">
                                    Booking Status
                                </p>
                                <p className="text-sm text-gray-600 font-normal">
                                    Track your reservation & payment
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {!bookingData ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">
                                        Loading booking details...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Booking Info Card */}
                                {/* <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                    <div className="text-center space-y-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-gray-50 rounded-full">
                                                <Calendar className="w-6 h-6 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 uppercase tracking-wide">Booking ID</p>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    #{bookingData.bookingId}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-center">
                                            <Badge
                                                className={`px-4 py-2 text-sm font-medium ${getStatusColor(
                                                    bookingData.bookingStatus
                                                )}`}
                                            >
                                                {getStatusText(
                                                    bookingData.bookingStatus
                                                )}
                                            </Badge>
                                        </div>
                                    </div>
                                </div> */}

                                {/* Payment Info Card */}
                                {bookingData.totalDeposit > 0 ? (
                                    <div className="bg-white border border-green-200 rounded-xl p-6 shadow-sm">
                                        <div className="text-center space-y-4">
                                            <div className="flex flex-col items-center gap-2">
                                                <div>
                                                    <p className="text-sm text-gray-500 uppercase tracking-wide">
                                                        Total Deposit
                                                    </p>
                                                    <p className="text-2xl font-bold text-green-600">
                                                        {formatCurrency(
                                                            bookingData.totalDeposit
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                            {paymentStatusData?.success &&
                                                paymentStatusData.payload && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Timer className="w-4 h-4 text-amber-600" />
                                                            <p className="text-sm text-amber-800 font-medium">
                                                                {paymentStatusData
                                                                    .payload
                                                                    .minutesUntilExpiry >
                                                                0
                                                                    ? `Payment expires in ${paymentStatusData.payload.minutesUntilExpiry} minutes`
                                                                    : paymentStatusData
                                                                            .payload
                                                                            .expired
                                                                      ? 'Payment has expired'
                                                                      : 'No time limit'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                                        <div className="text-center space-y-3">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="p-3 bg-gray-100 rounded-full">
                                                    <CheckCircle className="w-6 h-6 text-gray-600" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        No Deposit Required
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Your booking is being
                                                        processed automatically
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Payment QR Code */}
                                {bookingData.totalDeposit > 0 && (
                                    <div className="space-y-3">
                                        <PaymentQRCode
                                            bookingId={bookingData.bookingId}
                                            amount={bookingData.totalDeposit}
                                            onPaymentSuccess={
                                                onPaymentSuccess || onConfirm
                                            }
                                        />
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-6">
                                    <Button
                                        variant="destructive"
                                        onClick={onCancel}
                                        className="w-full"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Menu Suggestion Dialog */}
            <Dialog
                open={showMenuSuggestion}
                onOpenChange={setShowMenuSuggestion}
            >
                <DialogContent className="max-w-lg bg-gradient-to-br from-white to-gray-50/50">
                    <DialogHeader className="pb-6">
                        <DialogTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xl font-semibold text-gray-900">
                                    Booking Confirmed!
                                </p>
                                <p className="text-sm text-gray-600 font-normal">
                                    Your table is reserved
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="text-center space-y-4">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                    <Utensils className="w-10 h-10 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Pre-order Your Food?
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Would you like to order food for your
                                        reservation?
                                    </p>
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm text-green-800 italic">
                                            "Skip the wait and have your meal
                                            ready when you arrive"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowMenuSuggestion(false)}
                                className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                            >
                                <span className="font-medium">No, Thanks</span>
                            </Button>
                            <Button
                                onClick={handleMenuBookingRedirect}
                                className="flex-1 h-12"
                            >
                                <span className="font-medium">
                                    Yes, Order Now
                                </span>
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
