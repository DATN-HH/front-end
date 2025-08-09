'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Clock, User, Phone, Package, CreditCard } from 'lucide-react';
import Link from 'next/link';

import { PreOrderListItem } from '@/api/v1/pre-order-management';
import { Badge } from '@/components/ui/badge';

interface PreOrderTableColumnsProps {
    onViewDetails?: (preOrder: PreOrderListItem) => void; // Keep for compatibility but won't use
}

export function PreOrderTableColumns({
    onViewDetails,
}: PreOrderTableColumnsProps): ColumnDef<PreOrderListItem>[] {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

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

    return [
        {
            accessorKey: 'id',
            header: 'Order ID',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <Link
                            href={`/app/reservation/pre-order/${preOrder.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                            #{preOrder.id}
                        </Link>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Package className="w-3 h-3" />
                            {preOrder.totalItems} items
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'customerName',
            header: 'Customer',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="font-medium">
                                {preOrder.customerName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="w-3 h-3" />
                            {preOrder.customerPhone}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="w-fit">
                            {preOrder.type === 'dine-in'
                                ? 'Dine In'
                                : 'Takeaway'}
                        </Badge>
                        {preOrder.tableName && preOrder.bookingTableId && (
                            <Link
                                href={`/app/reservation/table-reservation/${preOrder.bookingTableId}`}
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                                Table: #{preOrder.bookingTableId}
                            </Link>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'time',
            header: 'Pickup Time',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <div className="flex items-center gap-1 text-sm">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span>{formatDateTime(preOrder.time)}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'totalAmount',
            header: 'Amount',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <div className="flex flex-col gap-1">
                        <span className="font-medium">
                            {formatCurrency(preOrder.totalAmount)}
                        </span>
                        <div className="flex items-center gap-1 text-sm text-green-600">
                            <CreditCard className="w-3 h-3" />
                            Deposit: {formatCurrency(preOrder.totalDeposit)}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'bookingStatus',
            header: 'Status',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <Badge className={getStatusColor(preOrder.bookingStatus)}>
                        {getStatusText(preOrder.bookingStatus)}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({ row }) => {
                const preOrder = row.original;
                return (
                    <span className="text-sm text-gray-500">
                        {formatDateTime(preOrder.createdAt)}
                    </span>
                );
            },
        },
    ];
}
