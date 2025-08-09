'use client';

import { addDays, startOfDay, endOfDay, format, parseISO } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { useMyBookings, MyBookingResponse } from '@/api/v1/table-booking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export default function MyBookingsPage() {
    const [page, setPage] = useState(0);
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: addDays(new Date(), 7),
    });

    const formatDateTime = (
        date: Date | undefined,
        isEndDate: boolean = false
    ) => {
        if (!date) return undefined;

        const targetDate = isEndDate ? endOfDay(date) : startOfDay(date);
        return targetDate.toISOString().slice(0, 19); // Remove milliseconds part
    };

    const { data: response, isLoading } = useMyBookings({
        page,
        size: 10,
        timeStart: date?.from ? formatDateTime(date.from) : undefined,
        timeEnd: date?.to ? formatDateTime(date.to, true) : undefined,
    });

    const bookings = response?.payload;

    const getStatusColor = (status: MyBookingResponse['bookingStatus']) => {
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

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h1 className="text-2xl font-bold">My Bookings</h1>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => Math.max(0, old - 1))}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((old) => old + 1)}
                        disabled={
                            bookings &&
                            bookings.page >=
                                Math.ceil(bookings.total / bookings.size) - 1
                        }
                    >
                        Next
                    </Button>
                </div>
            </div>

            <div className="mb-6">
                <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Booking ID</TableHead>
                                <TableHead>Booking Time</TableHead>
                                <TableHead>Tables</TableHead>
                                <TableHead>Pre-Orders</TableHead>
                                <TableHead>Guest Count</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Total Deposit</TableHead>
                                <TableHead>Note</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!bookings?.data?.length ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={8}
                                        className="text-center"
                                    >
                                        No bookings found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.data.map(
                                    (booking: MyBookingResponse) => (
                                        <TableRow key={booking.id}>
                                            <TableCell>
                                                <Link
                                                    href={`/my-bookings/${booking.id}`}
                                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                                >
                                                    #{booking.id}
                                                </Link>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span>
                                                        {format(
                                                            parseISO(
                                                                booking.timeStart
                                                            ),
                                                            'dd/MM/yyyy HH:mm'
                                                        )}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        to{' '}
                                                        {format(
                                                            parseISO(
                                                                booking.timeEnd
                                                            ),
                                                            'HH:mm'
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {booking.bookedTables.map(
                                                        (table) => (
                                                            <div
                                                                key={
                                                                    table.tableId
                                                                }
                                                                className="flex items-center gap-2"
                                                            >
                                                                <span className="font-medium">
                                                                    {
                                                                        table.tableName
                                                                    }
                                                                </span>
                                                                <span className="text-sm text-gray-500">
                                                                    (
                                                                    {
                                                                        table.floorName
                                                                    }{' '}
                                                                    -{' '}
                                                                    {
                                                                        table.tableType
                                                                    }
                                                                    )
                                                                </span>
                                                            </div>
                                                        )
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    {booking.preOrderIds &&
                                                    booking.preOrderIds.length >
                                                        0 ? (
                                                        booking.preOrderIds.map(
                                                            (preOrderId) => (
                                                                <Link
                                                                    key={
                                                                        preOrderId
                                                                    }
                                                                    href={`/my-pre-orders/${preOrderId}`}
                                                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                                                >
                                                                    #
                                                                    {preOrderId}
                                                                </Link>
                                                            )
                                                        )
                                                    ) : (
                                                        <span className="text-gray-500">
                                                            -
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {booking.guestCount}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={`${getStatusColor(booking.bookingStatus)} text-white`}
                                                >
                                                    {booking.bookingStatus.replace(
                                                        '_',
                                                        ' '
                                                    )}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {booking.totalDeposit.toLocaleString(
                                                    'vi-VN',
                                                    {
                                                        style: 'currency',
                                                        currency: 'VND',
                                                    }
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {booking.note || '-'}
                                            </TableCell>
                                        </TableRow>
                                    )
                                )
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {!bookings?.data?.length ? (
                    <div className="text-center text-gray-500 py-8">
                        No bookings found
                    </div>
                ) : (
                    bookings.data.map((booking: MyBookingResponse) => (
                        <Card key={booking.id} className="overflow-hidden">
                            <CardHeader className="pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-base">
                                        <Link
                                            href={`/my-bookings/${booking.id}`}
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Booking #{booking.id}
                                        </Link>
                                    </CardTitle>
                                    <Badge
                                        className={`${getStatusColor(booking.bookingStatus)} text-white`}
                                    >
                                        {booking.bookingStatus.replace(
                                            '_',
                                            ' '
                                        )}
                                    </Badge>
                                </div>
                                <CardDescription>
                                    {format(
                                        parseISO(booking.timeStart),
                                        'dd/MM/yyyy HH:mm'
                                    )}{' '}
                                    -{' '}
                                    {format(parseISO(booking.timeEnd), 'HH:mm')}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div>
                                    <div className="text-gray-500 mb-1">
                                        Tables
                                    </div>
                                    <div className="space-y-1">
                                        {booking.bookedTables.map((table) => (
                                            <div
                                                key={table.tableId}
                                                className="flex items-center gap-2"
                                            >
                                                <span className="font-medium">
                                                    {table.tableName}
                                                </span>
                                                <span className="text-gray-500">
                                                    ({table.floorName} -{' '}
                                                    {table.tableType})
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {booking.preOrderIds &&
                                    booking.preOrderIds.length > 0 && (
                                        <div>
                                            <div className="text-gray-500 mb-1">
                                                Pre-Orders
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {booking.preOrderIds.map(
                                                    (preOrderId) => (
                                                        <Link
                                                            key={preOrderId}
                                                            href={`/my-pre-orders/${preOrderId}`}
                                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                                        >
                                                            #{preOrderId}
                                                        </Link>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <div className="text-gray-500">
                                            Guest Count
                                        </div>
                                        <div className="font-medium">
                                            {booking.guestCount}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-gray-500">
                                            Deposit
                                        </div>
                                        <div className="font-medium">
                                            {booking.totalDeposit.toLocaleString(
                                                'vi-VN',
                                                {
                                                    style: 'currency',
                                                    currency: 'VND',
                                                }
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {booking.note && (
                                    <div>
                                        <div className="text-gray-500">
                                            Note
                                        </div>
                                        <div className="font-medium">
                                            {booking.note}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
