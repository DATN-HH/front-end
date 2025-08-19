'use client';

import {
    Calendar,
    Clock,
    Users,
    Phone,
    Mail,
    MapPin,
    FileText,
    UtensilsCrossed,
} from 'lucide-react';
import { useState } from 'react';

import {
    BookingDetail,
    useCancelBooking,
    useConvertBookingToPos,
    canCancelBooking,
} from '@/api/v1/booking-pos';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface BookingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: BookingDetail | null;
    onConvertSuccess?: (posOrderId: number) => void;
    onCancelSuccess?: () => void;
}

export function BookingDetailModal({
    isOpen,
    onClose,
    booking,
    onConvertSuccess,
    onCancelSuccess,
}: BookingDetailModalProps) {
    const { success, error } = useCustomToast();
    const [isConverting, setIsConverting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const cancelBookingMutation = useCancelBooking();
    const convertBookingMutation = useConvertBookingToPos();

    if (!booking) return null;

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'BOOKED':
                return 'bg-blue-100 text-blue-800';
            case 'DEPOSIT_PAID':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const handleCancel = async () => {
        try {
            setIsCancelling(true);
            await cancelBookingMutation.mutateAsync(booking.id);
            success('Success', 'Booking cancelled successfully');
            onCancelSuccess?.();
            onClose();
        } catch (err: any) {
            error('Error', err.message || 'Failed to cancel booking');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleConvertToPos = async () => {
        try {
            setIsConverting(true);
            const result = await convertBookingMutation.mutateAsync(booking.id);
            success(
                'Success',
                `Booking converted to POS order #${result.posOrderId} successfully`
            );
            onConvertSuccess?.(result.posOrderId);
            onClose();
        } catch (err: any) {
            error(
                'Error',
                err.message || 'Failed to convert booking to POS order'
            );
        } finally {
            setIsConverting(false);
        }
    };

    const canCancel = canCancelBooking(booking.expireTime);
    const isActiveBooking = ['PENDING', 'BOOKED', 'DEPOSIT_PAID'].includes(
        booking.bookingStatus
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Booking Details #{booking.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status and Basic Info */}
                    <div className="flex items-center justify-between">
                        <Badge
                            className={getStatusColor(booking.bookingStatus)}
                        >
                            {booking.bookingStatus}
                        </Badge>
                        <div className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatDateTime(booking.timeStart)}
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="font-medium">
                                    {booking.customerName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-500" />
                                <span>{booking.customerPhone}</span>
                            </div>
                            {booking.customerEmail && (
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-gray-500" />
                                    <span>{booking.customerEmail}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span>{booking.guestCount} guests</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Time Information */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg">
                            Time Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500">
                                    Start Time
                                </div>
                                <div className="font-medium">
                                    {formatDateTime(booking.timeStart)}
                                </div>
                            </div>
                            {booking.timeEnd && (
                                <div>
                                    <div className="text-sm text-gray-500">
                                        End Time
                                    </div>
                                    <div className="font-medium">
                                        {formatDateTime(booking.timeEnd)}
                                    </div>
                                </div>
                            )}
                            <div>
                                <div className="text-sm text-gray-500">
                                    Expire Time
                                </div>
                                <div className="font-medium">
                                    {formatDateTime(booking.expireTime)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Tables */}
                    <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Tables
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {booking.tables.map((table) => (
                                <Badge key={table.tableId} variant="outline">
                                    {table.tableName} (Cap: {table.capacity})
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    {booking.note && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Notes
                                </h3>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm">{booking.note}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Pre-order Items */}
                    {booking.preOrderItems.length > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <UtensilsCrossed className="w-4 h-4" />
                                    Pre-order Items
                                </h3>
                                <div className="space-y-2">
                                    {booking.preOrderItems.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {item.productName}
                                                    </div>
                                                    {item.note && (
                                                        <div className="text-sm text-gray-500">
                                                            Note: {item.note}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary">
                                                        {item.type}
                                                    </Badge>
                                                    <span className="font-medium">
                                                        x{item.quantity}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Deposit Information */}
                    {booking.totalDeposit > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="font-semibold text-lg">
                                    Deposit Information
                                </h3>
                                <div className="p-3 bg-green-50 rounded-lg">
                                    <div className="text-lg font-bold text-green-800">
                                        {formatVietnameseCurrency(
                                            booking.totalDeposit
                                        )}
                                    </div>
                                    <div className="text-sm text-green-600">
                                        Total deposit paid
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>

                    {isActiveBooking && (
                        <>
                            <Button
                                variant="destructive"
                                onClick={handleCancel}
                                disabled={!canCancel || isCancelling}
                                title={
                                    !canCancel
                                        ? 'Can only cancel bookings that are more than 20 minutes late'
                                        : 'Cancel booking'
                                }
                            >
                                {isCancelling
                                    ? 'Cancelling...'
                                    : 'Cancel Booking'}
                            </Button>

                            <Button
                                onClick={handleConvertToPos}
                                disabled={isConverting}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {isConverting
                                    ? 'Converting...'
                                    : 'Confirm Guest Arrival'}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
