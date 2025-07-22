'use client';

import {
    Calendar,
    Clock,
    Users,
    CreditCard,
    Timer,
    Utensils,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

    // Use the new payment status check API
    const { data: paymentStatusData, refetch: refetchPaymentStatus } =
        useCheckBookingPaymentStatus(
            bookingData?.bookingId || 0,
            open && !!bookingData?.bookingId // enabled when dialog is open and bookingId exists
        );

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
            duration: durationHours.toString(),
        });

        router.push(`/menu-booking?${queryParams.toString()}`);
    };

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Confirm Booking Information
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {!bookingData ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                                    <p className="text-sm text-gray-500">
                                        Loading booking details...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Booking Status */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600">
                                            Booking ID
                                        </p>
                                        <p className="text-lg font-semibold">
                                            #{bookingData.bookingId}
                                        </p>
                                    </div>
                                    <Badge
                                        className={getStatusColor(
                                            bookingData.bookingStatus
                                        )}
                                    >
                                        {getStatusText(
                                            bookingData.bookingStatus
                                        )}
                                    </Badge>
                                </div>

                                <Separator />

                                {/* Customer Information */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">
                                        Customer Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Customer Name
                                            </p>
                                            <p className="font-medium">
                                                {bookingData.customerName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Phone Number
                                            </p>
                                            <p className="font-medium">
                                                {bookingData.customerPhone}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* Booking Details */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">
                                        Booking Details
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Start Time
                                                </p>
                                                <p className="font-medium">
                                                    {formatDateTime(
                                                        bookingData.startTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    End Time
                                                </p>
                                                <p className="font-medium">
                                                    {formatDateTime(
                                                        bookingData.endTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Guests
                                                </p>
                                                <p className="font-medium">
                                                    {bookingData.guests} people
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Timer className="w-4 h-4 text-gray-500" />
                                            <div>
                                                <p className="text-sm text-gray-600">
                                                    Payment Expires
                                                </p>
                                                <p className="font-medium text-red-600">
                                                    {formatExpireTime(
                                                        bookingData.expireTime
                                                    )}
                                                </p>
                                                {paymentStatusData?.success &&
                                                    paymentStatusData.payload && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {paymentStatusData
                                                                .payload
                                                                .minutesUntilExpiry >
                                                            0
                                                                ? `${paymentStatusData.payload.minutesUntilExpiry} minutes left`
                                                                : paymentStatusData
                                                                        .payload
                                                                        .expired
                                                                  ? 'Expired'
                                                                  : 'No time limit'}
                                                        </p>
                                                    )}
                                            </div>
                                        </div>
                                    </div>
                                    {bookingData.notes && (
                                        <div>
                                            <p className="text-sm text-gray-600">
                                                Notes
                                            </p>
                                            <p className="font-medium">
                                                {bookingData.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* Tables Information */}
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-lg">
                                        Booked Tables
                                    </h3>
                                    <div className="space-y-2">
                                        {bookingData.bookedTables.map(
                                            (table, index) => (
                                                <div
                                                    key={table.tableId}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <span className="text-sm font-semibold text-blue-600">
                                                                {index + 1}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">
                                                                {
                                                                    table.tableName
                                                                }
                                                            </p>
                                                            <p className="text-sm text-gray-600">
                                                                {
                                                                    table.tableType
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-semibold text-green-600">
                                                            {formatCurrency(
                                                                table.deposit
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            Deposit
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                {/* Total Deposit */}
                                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                        <span className="font-semibold text-green-800">
                                            Total Deposit
                                        </span>
                                    </div>
                                    <span className="text-xl font-bold text-green-600">
                                        {formatCurrency(
                                            bookingData.totalDeposit
                                        )}
                                    </span>
                                </div>

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
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        onClick={onCancel}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                    {onConfirm && (
                                        <Button
                                            onClick={handleConfirm}
                                            className="flex-1"
                                            disabled={isCheckingStatus}
                                        >
                                            {isCheckingStatus
                                                ? 'Checking...'
                                                : 'Confirm'}
                                        </Button>
                                    )}
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Utensils className="w-5 h-5 text-green-600" />
                            Booking Confirmed!
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Utensils className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">
                                Your table is booked!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Would you like to pre-order food for your
                                reservation?
                            </p>
                            <p className="text-sm text-gray-500">
                                Skip the wait and have your meal ready when you
                                arrive.
                            </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => setShowMenuSuggestion(false)}
                                className="flex-1"
                            >
                                No, Thanks
                            </Button>
                            <Button
                                onClick={handleMenuBookingRedirect}
                                className="flex-1"
                            >
                                Yes, Order Now
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
