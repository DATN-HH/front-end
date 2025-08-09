'use client';

import dayjs from 'dayjs';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Phone,
    User,
    MapPin,
    DollarSign,
    Receipt,
    Timer,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

import { useBookingTableDetail, BookingStatus } from '@/api/v1/table-booking';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProtectedRoute } from '@/components/protected-component';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

function BookingDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = Number(params?.id);

    const {
        data: booking,
        isLoading,
        error,
    } = useBookingTableDetail(bookingId);

    const getStatusColor = (status: BookingStatus) => {
        switch (status) {
            case 'BOOKED':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'DEPOSIT_PAID':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'COMPLETED':
                return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 lg:gap-6">
                <PageTitle
                    icon={Calendar}
                    title="Booking Details"
                    left={
                        <Link href="/app/reservation/table-reservation">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                    }
                />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-48" />
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="flex flex-col gap-4 lg:gap-6">
                <PageTitle
                    icon={Calendar}
                    title="Booking Details"
                    left={
                        <Link href="/app/reservation/table-reservation">
                            <Button variant="outline">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to List
                            </Button>
                        </Link>
                    }
                />
                <Card>
                    <CardContent className="text-center py-12">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Booking Not Found
                        </h3>
                        <p className="text-gray-500">
                            The booking you're looking for doesn't exist or you
                            don't have permission to view it.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={Calendar}
                title={`Booking #${booking.id}`}
                left={
                    <Link href="/app/reservation/table-reservation">
                        <Button variant="outline">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to List
                        </Button>
                    </Link>
                }
            />

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
                                <p className="text-sm text-muted-foreground">
                                    Start Time
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {dayjs(booking.timeStart).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    End Time
                                </p>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {dayjs(booking.timeEnd).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Guest Count
                                </p>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                    <span className="font-medium">
                                        {booking.guestCount}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Deposit
                                </p>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-4 w-4 text-green-600" />
                                    <span className="font-medium text-green-600">
                                        {new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND',
                                        }).format(booking.totalDeposit)}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {booking.expireTime && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">
                                        Payment Expires
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Timer className="h-4 w-4 text-orange-600" />
                                        <span className="font-medium text-orange-600">
                                            {dayjs(booking.expireTime).format(
                                                'DD/MM/YYYY HH:mm'
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </>
                        )}
                        {booking.note && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-muted-foreground">
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
                            <p className="text-sm text-muted-foreground">
                                Name
                            </p>
                            <p className="font-medium">
                                {booking.customerName}
                            </p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Phone
                            </p>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                    {booking.customerPhone}
                                </span>
                            </div>
                        </div>
                        <Separator />
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Created At
                                </p>
                                <p className="font-medium">
                                    {dayjs(booking.createdAt).format(
                                        'DD/MM/YYYY HH:mm'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Updated At
                                </p>
                                <p className="font-medium">
                                    {dayjs(booking.updatedAt).format(
                                        'DD/MM/YYYY HH:mm'
                                    )}
                                </p>
                            </div>
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
                                    className="flex items-center justify-between p-3 bg-accent/10 rounded-lg"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {table.tableName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {table.floorName} -{' '}
                                            {table.tableType}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-green-600">
                                            {new Intl.NumberFormat('vi-VN', {
                                                style: 'currency',
                                                currency: 'VND',
                                            }).format(table.deposit)}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
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
                                        href={`/app/reservation/pre-order/${preOrderId}`}
                                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Receipt className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium text-blue-600">
                                                Pre-Order #{preOrderId}
                                            </span>
                                        </div>
                                        <ArrowLeft className="h-4 w-4 text-blue-600 rotate-180" />
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

export default function ProtectedBookingDetailPage() {
    return (
        <ProtectedRoute>
            <BookingDetailPage />
        </ProtectedRoute>
    );
}
