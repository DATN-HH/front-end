'use client';

import { addDays, startOfDay, endOfDay, format, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

import { useMyBookings, MyBookingResponse } from '@/api/v1/table-booking';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

            <div className="mb-6">
                <DatePickerWithRange date={date} setDate={setDate} />
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking Time</TableHead>
                            <TableHead>Tables</TableHead>
                            <TableHead>Guest Count</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total Deposit</TableHead>
                            <TableHead>Note</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : bookings?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center">
                                    No bookings found
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings?.data?.map(
                                (booking: MyBookingResponse) => (
                                    <TableRow key={booking.id}>
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
                                                            key={table.tableId}
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

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((old) => Math.max(0, old - 1))}
                    disabled={page === 0}
                >
                    <ChevronLeft className="h-4 w-4" />
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
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
