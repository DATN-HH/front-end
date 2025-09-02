'use client';

import {
    Calendar,
    Clock,
    Users,
    MapPin,
    Phone,
    User,
    CreditCard,
    Utensils,
    CheckCircle,
    Mail,
} from 'lucide-react';

import { formatCurrency } from '@/api/v1/table-types';
import { TableResponse } from '@/api/v1/tables';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { getIconByName } from '@/lib/icon-utils';

interface PreBookingConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    bookingData: {
        startTime: string;
        duration: number;
        guests: number;
        notes: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
    };
    selectedTables: TableResponse[];
    branchName?: string;
    floorName?: string;
    isSubmitting?: boolean;
}

export function PreBookingConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    bookingData,
    selectedTables,
    branchName,
    floorName,
    isSubmitting = false,
}: PreBookingConfirmModalProps) {
    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalDeposit = selectedTables.reduce(
        (sum, table) => sum + table.tableType.depositForBooking,
        0
    );

    const totalCapacity = selectedTables.reduce(
        (sum, table) => sum + table.capacity,
        0
    );

    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-4 h-4" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
                <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                Confirm Your Booking
                            </p>
                            <p className="text-sm text-gray-600 font-normal">
                                Please review your booking details
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Name
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {bookingData.customerName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Phone className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Phone
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {bookingData.customerPhone}
                                    </p>
                                </div>
                            </div>
                            {bookingData.customerEmail && (
                                <div className="flex items-center gap-3 sm:col-span-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Mail className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Email
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {bookingData.customerEmail}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Booking Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Booking Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Location
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {branchName}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {floorName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Calendar className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Date & Time
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDateTime(bookingData.startTime)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Duration
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {bookingData.duration} hour
                                        {bookingData.duration > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Guests
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {bookingData.guests} guest
                                        {bookingData.guests > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tables Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-purple-600" />
                            Selected Tables ({selectedTables.length})
                        </h3>
                        <div className="space-y-3">
                            {selectedTables.map((table) => (
                                <div
                                    key={table.id}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            {renderIcon(table.tableType.icon)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {table.tableName}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {table.capacity} seats •{' '}
                                                {table.tableType.tableType}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-purple-600">
                                            {formatCurrency(
                                                table.tableType
                                                    .depositForBooking
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            deposit
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Card */}
                    {bookingData.notes && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Special Notes
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800 italic">
                                    "{bookingData.notes}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                Booking Summary
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Total Capacity</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {totalCapacity} seats
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Total Deposit</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatCurrency(totalDeposit)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            <span className="font-medium">Back to Edit</span>
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 h-12"
                            disabled={isSubmitting}
                        >
                            <span className="font-medium">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                                        Creating...
                                    </>
                                ) : (
                                    'Confirm & Book'
                                )}
                            </span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
