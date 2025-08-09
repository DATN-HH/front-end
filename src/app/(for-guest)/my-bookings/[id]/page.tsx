'use client';

import { format, parseISO } from 'date-fns';
import {
    ChevronLeft,
    MapPin,
    User,
    Receipt,
    Users,
    Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';

import { useBookingTableDetail } from '@/api/v1/table-booking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function BookingDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const {
        data: booking,
        isLoading,
        error,
    } = useBookingTableDetail(Number(id));

    const getStatusColor = (
        status: 'BOOKED' | 'DEPOSIT_PAID' | 'COMPLETED' | 'CANCELLED'
    ) => {
        switch (status) {
            case 'BOOKED':
                return 'bg-yellow-500';
            case 'DEPOSIT_PAID':
                return 'bg-green-500';
            case 'COMPLETED':
                return 'bg-blue-500';
            case 'CANCELLED':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="container mx-auto py-10 px-4">
                <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                    <Receipt className="h-16 w-16 text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Booking Not Found
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The booking you're looking for doesn't exist or you
                        don't have permission to view it.
                    </p>
                    <Button
                        onClick={() => router.push('/my-bookings')}
                        variant="outline"
                    >
                        <ChevronLeft className="h-4 w-4 mr-2" />
                        Back to My Bookings
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">Booking Details</h1>
                        <p className="text-gray-600">Booking #{booking.id}</p>
                    </div>
                    <Badge
                        className={`${getStatusColor(booking.bookingStatus)} text-white`}
                    >
                        {booking.bookingStatus.replace('_', ' ')}
                    </Badge>
                </div>

                <Button variant="outline" onClick={() => router.back()}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Booking Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Start Time
                                </p>
                                <p className="font-medium">
                                    {format(
                                        parseISO(booking.timeStart),
                                        'dd/MM/yyyy HH:mm'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    End Time
                                </p>
                                <p className="font-medium">
                                    {format(
                                        parseISO(booking.timeEnd),
                                        'dd/MM/yyyy HH:mm'
                                    )}
                                </p>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">
                                    Guest Count
                                </p>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-gray-400" />
                                    <span className="font-medium">
                                        {booking.guestCount}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">
                                    Total Deposit
                                </p>
                                <p className="font-medium text-green-600">
                                    {booking.totalDeposit.toLocaleString(
                                        'vi-VN',
                                        {
                                            style: 'currency',
                                            currency: 'VND',
                                        }
                                    )}
                                </p>
                            </div>
                        </div>
                        {booking.expireTime && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Payment Expires
                                    </p>
                                    <p className="font-medium text-orange-600">
                                        {format(
                                            parseISO(booking.expireTime),
                                            'dd/MM/yyyy HH:mm'
                                        )}
                                    </p>
                                </div>
                            </>
                        )}
                        {booking.note && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-gray-500">
                                        Note
                                    </p>
                                    <p className="font-medium">
                                        {booking.note}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Customer Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Customer Information
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-gray-500">Name</p>
                            <p className="font-medium">
                                {booking.customerName}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">
                                {booking.customerPhone}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Created At</p>
                            <p className="font-medium">
                                {format(
                                    parseISO(booking.createdAt),
                                    'dd/MM/yyyy HH:mm'
                                )}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tables Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Reserved Tables
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {booking.bookedTables.map((table, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {table.tableName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {table.floorName} -{' '}
                                            {table.tableType}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">
                                            {table.deposit.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Deposit
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pre-Orders Information */}
                {booking.preOrderIds && booking.preOrderIds.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Receipt className="h-5 w-5" />
                                Associated Pre-Orders
                            </CardTitle>
                            <CardDescription>
                                Pre-orders linked to this booking
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {booking.preOrderIds.map((preOrderId) => (
                                    <Link
                                        key={preOrderId}
                                        href={`/my-pre-orders/${preOrderId}`}
                                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-blue-600">
                                                Pre-Order #{preOrderId}
                                            </span>
                                        </div>
                                        <ChevronLeft className="h-4 w-4 text-blue-600 rotate-180" />
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
