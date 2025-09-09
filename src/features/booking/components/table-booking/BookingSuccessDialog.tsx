'use client';

import {
    Printer,
    CreditCard,
    Banknote,
    CheckCircle,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { useState, useRef, useEffect } from 'react';

import {
    EnhancedCreateBookingResponse,
    useBookingStatus,
    useCashPayment,
    CashPaymentRequest,
} from '@/api/v1/table-booking';
import { formatCurrency } from '@/api/v1/table-types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface BookingSuccessDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    bookingData: EnhancedCreateBookingResponse | null;
    onPaymentSuccess?: () => void;
    onClose?: () => void;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export function BookingSuccessDialog({
    open,
    onOpenChange,
    bookingData,
    onPaymentSuccess,
    onClose,
}: BookingSuccessDialogProps) {
    const [showCashPayment, setShowCashPayment] = useState(false);
    const [givenAmount, setGivenAmount] = useState<number>(0);
    const [isPolling, setIsPolling] = useState(true);
    const [hasProcessedPayment, setHasProcessedPayment] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const { success, error: showError } = useCustomToast();

    // Poll booking status every 5 seconds
    const { data: statusData } = useBookingStatus(
        bookingData?.bookingId || 0,
        !!(bookingData?.bookingId && isPolling),
        5000
    );

    const cashPaymentMutation = useCashPayment();

    // Reset state when dialog opens/closes or booking changes
    useEffect(() => {
        if (open && bookingData) {
            setIsPolling(true);
            setHasProcessedPayment(false);
            setShowCashPayment(false);
            setGivenAmount(0);
        }
    }, [open, bookingData?.bookingId]);

    // Check if payment is completed
    useEffect(() => {
        if (
            statusData?.payload?.bookingStatus === 'DEPOSIT_PAID' &&
            !hasProcessedPayment
        ) {
            setIsPolling(false);
            setHasProcessedPayment(true);
            success('Payment Completed', 'Deposit has been paid successfully!');
            onPaymentSuccess?.();
        }
    }, [statusData?.payload?.bookingStatus, hasProcessedPayment]);

    const handleCashPayment = async () => {
        if (!bookingData || !givenAmount) {
            showError('Error', 'Please enter the amount given by customer');
            return;
        }

        const givenAmountNumber = givenAmount;
        const requiredAmount = bookingData.totalDeposit;

        console.log('givenAmountNumber', givenAmountNumber);
        console.log('requiredAmount', requiredAmount);

        if (givenAmountNumber < requiredAmount) {
            showError('Error', 'Given amount is less than required deposit');
            return;
        }

        const request: CashPaymentRequest = {
            bookingTableId: bookingData.bookingId,
            requiredAmount,
            givenAmount: givenAmountNumber,
        };

        try {
            const response = await cashPaymentMutation.mutateAsync(request);

            if (response.success) {
                const changeAmount = givenAmountNumber - requiredAmount;
                success(
                    'Payment Processed',
                    `Cash payment processed successfully! ${changeAmount > 0 ? `Change: ${formatCurrency(changeAmount)}` : ''}`
                );
                setIsPolling(false);
                setShowCashPayment(false);
                onPaymentSuccess?.();
            } else {
                showError('Error', 'Failed to process cash payment');
            }
        } catch (error) {
            console.error('Cash payment error:', error);
            showError('Error', 'Failed to process cash payment');
        }
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printWindow = window.open('', '_blank');
            if (printWindow) {
                printWindow.document.write(`
                    <html>
                        <head>
                            <title>Booking Receipt</title>
                            <style>
                                body { font-family: Arial, sans-serif; margin: 20px; }
                                .receipt { max-width: 400px; margin: 0 auto; }
                                .header { text-align: center; margin-bottom: 20px; }
                                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                                .qr-section { text-align: center; margin: 20px 0; }
                                .total { font-weight: bold; font-size: 18px; border-top: 1px solid #ccc; padding-top: 10px; }
                                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
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

    const handleQuickAmount = (amount: number) => {
        setGivenAmount(amount);
    };

    if (!bookingData) return null;

    const isPaymentCompleted =
        statusData?.payload?.bookingStatus === 'DEPOSIT_PAID';
    const changeAmount = givenAmount
        ? givenAmount - bookingData.totalDeposit
        : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPaymentCompleted ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                Booking Confirmed - Payment Completed
                            </>
                        ) : (
                            <>
                                <Clock className="w-5 h-5 text-orange-500" />
                                Booking Created - Awaiting Payment
                            </>
                        )}
                    </DialogTitle>
                    <DialogDescription>
                        Booking ID: #{bookingData.bookingId}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm text-muted-foreground">
                            Status:
                        </span>
                        <Badge
                            variant={
                                isPaymentCompleted ? 'default' : 'secondary'
                            }
                        >
                            {statusData?.payload?.bookingStatus ||
                                bookingData.bookingStatus}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column - Booking Details */}
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">
                                Booking Information
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Customer:</span>
                                    <span className="font-medium">
                                        {bookingData.customerName}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Phone:</span>
                                    <span>{bookingData.customerPhone}</span>
                                </div>
                                {bookingData.customerEmail && (
                                    <div className="flex justify-between">
                                        <span>Email:</span>
                                        <span>{bookingData.customerEmail}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Date & Time:</span>
                                    <span>
                                        {new Date(
                                            bookingData.startTime
                                        ).toLocaleString('vi-VN')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Duration:</span>
                                    <span>
                                        {Math.round(
                                            (new Date(
                                                bookingData.endTime
                                            ).getTime() -
                                                new Date(
                                                    bookingData.startTime
                                                ).getTime()) /
                                                (1000 * 60 * 60)
                                        )}{' '}
                                        hours
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Guests:</span>
                                    <span>{bookingData.guests}</span>
                                </div>
                                {bookingData.notes && (
                                    <div className="flex justify-between">
                                        <span>Notes:</span>
                                        <span className="text-right">
                                            {bookingData.notes}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-semibold mb-3">
                                Reserved Tables
                            </h3>
                            <div className="space-y-2">
                                {bookingData.bookedTables.map((table) => (
                                    <div
                                        key={table.tableId}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <span className="font-medium">
                                                {table.tableName}
                                            </span>
                                            <span className="text-sm text-gray-500 ml-2">
                                                ({table.tableType})
                                            </span>
                                        </div>
                                        <span className="text-sm">
                                            {formatCurrency(table.deposit)}
                                        </span>
                                    </div>
                                ))}
                                <Separator />
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total Deposit:</span>
                                    <span>
                                        {formatCurrency(
                                            bookingData.totalDeposit
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {!isPaymentCompleted && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    <span className="font-medium text-orange-800">
                                        Payment Required
                                    </span>
                                </div>
                                <p className="text-sm text-orange-700">
                                    Please complete the payment to confirm your
                                    booking. Booking will expire at:{' '}
                                    {new Date(
                                        bookingData.expireTime
                                    ).toLocaleString('vi-VN')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Payment Options */}
                    <div className="space-y-4">
                        {!isPaymentCompleted && bookingData.qrCode && (
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <CreditCard className="w-4 h-4" />
                                    QR Payment
                                </h3>
                                <div className="text-center">
                                    <div className="flex justify-center">
                                        <QRCode
                                            value={bookingData.qrCode}
                                            size={200}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600 mt-2">
                                        Scan QR code to pay via banking
                                    </p>
                                    {/* {bookingData.paymentUrl && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="mt-2"
                                            onClick={() =>
                                                window.open(
                                                    bookingData.paymentUrl,
                                                    '_blank'
                                                )
                                            }
                                        >
                                            Open Payment Link
                                        </Button>
                                    )} */}
                                </div>
                            </div>
                        )}

                        {!isPaymentCompleted && (
                            <div className="p-4 bg-green-50 rounded-lg">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Banknote className="w-4 h-4" />
                                    Cash Payment
                                </h3>

                                {!showCashPayment ? (
                                    <Button
                                        onClick={() => setShowCashPayment(true)}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        Process Cash Payment
                                    </Button>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="givenAmount">
                                                Amount Given (VND)
                                            </Label>
                                            <Input
                                                id="givenAmount"
                                                type="text"
                                                value={givenAmount}
                                                onChange={(e) => {
                                                    const value =
                                                        e.target.value.replace(
                                                            /[^0-9]/g,
                                                            ''
                                                        );
                                                    setGivenAmount(
                                                        parseInt(value) || 0
                                                    );
                                                }}
                                                placeholder="Enter amount..."
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2">
                                            {QUICK_AMOUNTS.map((amount) => (
                                                <Button
                                                    key={amount}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        handleQuickAmount(
                                                            amount
                                                        )
                                                    }
                                                    className="text-xs"
                                                >
                                                    {formatCurrency(amount)}
                                                </Button>
                                            ))}
                                        </div>

                                        {changeAmount > 0 && (
                                            <div className="p-2 bg-yellow-100 rounded text-sm">
                                                <span className="font-medium">
                                                    Change:{' '}
                                                    {formatCurrency(
                                                        changeAmount
                                                    )}
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <Button
                                                onClick={handleCashPayment}
                                                disabled={
                                                    !givenAmount ||
                                                    cashPaymentMutation.isPending
                                                }
                                                className="flex-1"
                                            >
                                                {cashPaymentMutation.isPending
                                                    ? 'Processing...'
                                                    : 'Confirm Payment'}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setShowCashPayment(false)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

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
                                onClick={() => {
                                    onClose?.();
                                    onOpenChange(false);
                                }}
                                className="flex-1"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Hidden Print Content */}
                <div ref={printRef} className="hidden">
                    <div className="receipt">
                        <div className="header">
                            <h2>BOOKING RECEIPT</h2>
                            <p>Booking ID: #{bookingData.bookingId}</p>
                        </div>

                        <div className="info-row">
                            <span>Customer:</span>
                            <span>{bookingData.customerName}</span>
                        </div>
                        <div className="info-row">
                            <span>Phone:</span>
                            <span>{bookingData.customerPhone}</span>
                        </div>
                        <div className="info-row">
                            <span>Date & Time:</span>
                            <span>
                                {new Date(bookingData.startTime).toLocaleString(
                                    'vi-VN'
                                )}
                            </span>
                        </div>
                        <div className="info-row">
                            <span>Guests:</span>
                            <span>{bookingData.guests}</span>
                        </div>

                        <br />
                        <strong>Reserved Tables:</strong>
                        {bookingData.bookedTables.map((table) => (
                            <div key={table.tableId} className="info-row">
                                <span>
                                    {table.tableName} ({table.tableType})
                                </span>
                                <span>{formatCurrency(table.deposit)}</span>
                            </div>
                        ))}

                        <div className="info-row total">
                            <span>Total Deposit:</span>
                            <span>
                                {formatCurrency(bookingData.totalDeposit)}
                            </span>
                        </div>

                        {bookingData.qrCode && (
                            <div className="qr-section">
                                <QRCode value={bookingData.qrCode} size={150} />
                                <p>Scan to pay</p>
                            </div>
                        )}

                        <div className="footer">
                            <p>Thank you for your booking!</p>
                            <p>
                                Generated: {new Date().toLocaleString('vi-VN')}
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
