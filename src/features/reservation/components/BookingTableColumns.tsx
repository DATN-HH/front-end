'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Phone, User, MapPin, DollarSign } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { BookingTableResponseDto, BookingStatus } from '@/api/v1/table-booking';
import dayjs from 'dayjs';

interface BookingTableColumnsProps { }

export const BookingTableColumns = ({ }: BookingTableColumnsProps): ColumnDef<BookingTableResponseDto>[] => [
    {
        accessorKey: 'id',
        header: 'Booking ID',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 min-w-[80px]">
                <span className="font-medium text-foreground">#{row.original.id}</span>
            </div>
        ),
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 min-w-[160px]">
                <div className="p-1.5 rounded-full bg-primary/10">
                    <User className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-foreground">{row.original.customerName}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {row.original.customerPhone}
                    </span>
                </div>
            </div>
        ),
    },
    {
        id: 'timeRange',
        header: 'Reservation Time',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 min-w-[180px]">
                <div className="p-1.5 rounded-full bg-secondary/50">
                    <Calendar className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                        {dayjs(row.original.timeStart).format('DD/MM/YYYY')}
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {dayjs(row.original.timeStart).format('HH:mm')} - {dayjs(row.original.timeEnd).format('HH:mm')}
                    </span>
                </div>
            </div>
        ),
    },
    {
        accessorKey: 'guestCount',
        header: 'Guests',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 min-w-[80px]">
                <div className="p-1.5 rounded-full bg-blue-100">
                    <Users className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="font-medium text-foreground">{row.original.guestCount}</span>
            </div>
        ),
    },
    {
        id: 'bookedTables',
        header: 'Tables',
        cell: ({ row }) => (
            <div className="flex flex-wrap gap-1 min-w-[200px]">
                {row.original.bookedTables.map((table, index) => (
                    <Badge
                        key={index}
                        variant="outline"
                        className="text-xs px-2 py-0.5 bg-accent/10 text-accent-foreground border-accent/20"
                    >
                        <MapPin className="h-3 w-3 mr-1" />
                        {table.tableName} ({table.tableType})
                    </Badge>
                ))}
            </div>
        ),
    },
    {
        accessorKey: 'bookingStatus',
        header: 'Booking Status',
        cell: ({ row }) => {
            const status = row.getValue('bookingStatus') as BookingStatus;
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

            return (
                <Badge className={`${getStatusColor(status)} font-medium`}>
                    {status.replace('_', ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'totalDeposit',
        header: 'Total Deposit',
        cell: ({ row }) => (
            <div className="flex items-center gap-2 min-w-[120px]">
                <div className="p-1.5 rounded-full bg-green-100">
                    <DollarSign className="h-3.5 w-3.5 text-green-600" />
                </div>
                <span className="font-medium text-foreground">
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                    }).format(row.original.totalDeposit)}
                </span>
            </div>
        ),
    },
    {
        accessorKey: 'expireTime',
        header: 'Payment Expires',
        cell: ({ row }) => {
            const expireTime = dayjs(row.original.expireTime);
            const isExpired = expireTime.isBefore(dayjs());

            return (
                <div className="flex flex-col text-sm min-w-[120px]">
                    <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-foreground'}`}>
                        {expireTime.format('DD/MM/YYYY')}
                    </span>
                    <span className={`text-xs ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {expireTime.format('HH:mm')}
                        {isExpired && ' (Expired)'}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'note',
        header: 'Note',
        cell: ({ row }) => (
            <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                {row.original.note || '-'}
            </div>
        ),
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            return (
                <Badge
                    variant={status === 'ACTIVE' ? 'default' : 'secondary'}
                    className={
                        status === 'ACTIVE'
                            ? 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/30'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
                    }
                >
                    {status}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
            <div className="flex flex-col text-sm min-w-[100px]">
                <span className="font-medium text-foreground">
                    {dayjs(row.original.createdAt).format('DD/MM/YYYY')}
                </span>
                <span className="text-xs text-muted-foreground">
                    {dayjs(row.original.createdAt).format('HH:mm')}
                </span>
            </div>
        ),
    },
]; 