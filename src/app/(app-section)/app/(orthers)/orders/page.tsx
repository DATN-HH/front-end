'use client';

import { useState, useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import Link from 'next/link';

import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition, OperandType } from '@/components/common/Table/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedRoute } from '@/components/protected-component';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Role } from '@/lib/rbac';
import { SearchCondition } from '@/api/v1';
import {
    useSalesReportOrders,
    SalesReportOrder,
    SalesReportOrdersRequest,
} from '@/api/v1/sales-reports';
import { ClipboardList } from 'lucide-react';

// Helper functions for formatting
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(amount);
};

const getOrderStatusColor = (status: string) => {
    switch (status) {
        case 'COMPLETED':
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'PREPARING':
            return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        case 'READY':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'ORDERED':
            return 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200';
        case 'CANCELLED':
            return 'bg-red-100 text-red-800 hover:bg-red-200';
        case 'DRAFT':
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
};

const getOrderTypeColor = (type: string) => {
    switch (type) {
        case 'DINE_IN':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case 'TAKEOUT':
            return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
        case 'DELIVERY':
            return 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
};

const getPaymentTypeColor = (type: string) => {
    switch (type) {
        case 'CASH':
            return 'bg-green-100 text-green-800 hover:bg-green-200';
        case 'BANKING':
            return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        case 'CARD':
            return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        case 'MOMO':
            return 'bg-pink-100 text-pink-800 hover:bg-pink-200';
        case 'ZALOPAY':
            return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
        case 'VNPAY':
            return 'bg-red-100 text-red-800 hover:bg-red-200';
        default:
            return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
};

function OrderManagementPage() {
    // State for pagination, sorting, and filtering
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState('posCreatedAt:DESC');
    const [filters, setFilters] = useState<SearchCondition[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Build API request parameters
    const apiParams: SalesReportOrdersRequest = useMemo(() => {
        const params: SalesReportOrdersRequest = {
            page: pageIndex,
            size: pageSize,
        };

        // Handle sorting
        if (sorting) {
            const [sortBy, sortDirection] = sorting.split(':');
            params.sortBy = sortBy;
            params.sortDirection = sortDirection as 'ASC' | 'DESC';
        }

        // Handle filters - convert SearchCondition[] to API params
        filters.forEach((filter) => {
            if (filter.data || filter.datas) {
                const value = filter.datas ? filter.datas.join(',') : filter.data;
                (params as any)[filter.fieldName] = value;
            }
        });

        // Handle search term (search in customer name or phone)
        if (searchTerm) {
            params.customerName = searchTerm;
        }

        return params;
    }, [pageIndex, pageSize, sorting, filters, searchTerm]);

    // Fetch data
    const { data, isLoading, error } = useSalesReportOrders(apiParams);

    // Define columns for the DataTable
    const columns: ColumnDef<SalesReportOrder>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <div className="font-medium">#{row.getValue('id')}</div>
            ),
        },
        {
            accessorKey: 'orderStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('orderStatus') as string;
                return (
                    <Badge className={getOrderStatusColor(status)}>
                        {status.replace('_', ' ')}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'orderType',
            header: 'Type',
            cell: ({ row }) => {
                const type = row.getValue('orderType') as string;
                return (
                    <Badge className={getOrderTypeColor(type)}>
                        {type.replace('_', ' ')}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'paymentType',
            header: 'Payment',
            cell: ({ row }) => {
                const type = row.getValue('paymentType') as string;
                return (
                    <Badge className={getPaymentTypeColor(type)}>
                        {type}
                    </Badge>
                );
            },
        },
        {
            accessorKey: 'total',
            header: 'Total',
            cell: ({ row }) => (
                <div className="font-medium">
                    {formatCurrency(row.getValue('total'))}
                </div>
            ),
        },
        {
            accessorKey: 'deposit',
            header: 'Deposit',
            cell: ({ row }) => (
                <div className="text-muted-foreground">
                    {formatCurrency(row.getValue('deposit'))}
                </div>
            ),
        },
        {
            accessorKey: 'customerName',
            header: 'Customer',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.getValue('customerName')}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.original.customerPhone}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'posCreatedAt',
            header: 'Created At',
            cell: ({ row }) => {
                const date = new Date(row.getValue('posCreatedAt'));
                return (
                    <div className="text-sm">
                        <div>{format(date, 'dd/MM/yyyy')}</div>
                        <div className="text-muted-foreground">
                            {format(date, 'HH:mm:ss')}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: 'notes',
            header: 'Notes',
            cell: ({ row }) => {
                const notes = row.getValue('notes') as string;
                return (
                    <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {notes || '-'}
                    </div>
                );
            },
        },
    ];

    // Define filter definitions for the DataTable
    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'orderStatus',
            label: 'Order Status',
            type: OperandType.ENUM,
            options: [
                { label: 'Draft', value: 'DRAFT' },
                { label: 'Ordered', value: 'ORDERED' },
                { label: 'Preparing', value: 'PREPARING' },
                { label: 'Ready', value: 'READY' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'Cancelled', value: 'CANCELLED' },
            ],
        },
        {
            field: 'orderType',
            label: 'Order Type',
            type: OperandType.ENUM,
            options: [
                { label: 'Dine In', value: 'DINE_IN' },
                { label: 'Takeout', value: 'TAKEOUT' },
                { label: 'Delivery', value: 'DELIVERY' },
            ],
        },
        {
            field: 'paymentType',
            label: 'Payment Type',
            type: OperandType.ENUM,
            options: [
                { label: 'Cash', value: 'CASH' },
                { label: 'Banking', value: 'BANKING' },
                { label: 'Card', value: 'CARD' },
                { label: 'MoMo', value: 'MOMO' },
                { label: 'ZaloPay', value: 'ZALOPAY' },
                { label: 'VNPay', value: 'VNPAY' },
            ],
        },
        {
            field: 'startDate',
            label: 'Start Date',
            type: OperandType.DATE,
        },
        {
            field: 'endDate',
            label: 'End Date',
            type: OperandType.DATE,
        },
    ];

    // Handle pagination change
    const handlePaginationChange = (newPageIndex: number, newPageSize: number) => {
        setPageIndex(newPageIndex);
        setPageSize(newPageSize);
    };

    // Handle sorting change
    const handleSortingChange = (newSorting: string) => {
        setSorting(newSorting);
        setPageIndex(0); // Reset to first page when sorting changes
    };

    // Handle filter change
    const handleFilterChange = (newFilters: SearchCondition[]) => {
        setFilters(newFilters);
        setPageIndex(0); // Reset to first page when filters change
    };

    // Handle search change
    const handleSearchChange = (newSearchTerm: string) => {
        setSearchTerm(newSearchTerm);
        setPageIndex(0); // Reset to first page when search changes
    };

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-red-600">
                            Error loading orders: {(error as Error).message}
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-6">

            <PageTitle
                icon={ClipboardList}
                title="Order Management"
                left={
                <Link href="/app/pos/tables">
                    <Button>Go to POS</Button>
                </Link>
                }
            />
                    <DataTable
                        columns={columns}
                        data={data?.content || []}
                        tableId="orders-table"
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        total={data?.totalElements || 0}
                        currentSorting={sorting}
                        onPaginationChange={handlePaginationChange}
                        onSortingChange={handleSortingChange}
                        onFilterChange={handleFilterChange}
                        onSearchChange={handleSearchChange}
                        filterDefinitions={filterDefinitions}
                        enableSearch={true}
                        enableColumnVisibility={true}
                        enableSorting={true}
                        enablePinning={true}
                        enableColumnOrdering={true}
                        enableFiltering={true}
                        enablePagination={true}
                        enableExport={true}
                        loading={isLoading}
                    />
                    </div>
    );
}

export default function OrderManagementPageWrapper() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.CASHIER, Role.WAITER]}>
            <OrderManagementPage />
        </ProtectedRoute>
    );
}
