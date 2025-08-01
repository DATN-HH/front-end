'use client';

import { ShoppingBag, Plus, Settings } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

import { BaseListRequest } from '@/api/v1';
import { useAdvanceSearch } from '@/api/v1/advance-search';
import { usePreOrderList } from '@/api/v1/pre-order-management';
import { DataTable } from '@/components/common/Table/DataTable';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/auth-context';
import {
    PreOrderTableColumns,
    CreatePreOrderDialog,
    DepositConfigCard,
} from '@/features/reservation/pre-order/components';
import { SearchCondition } from '@/lib/response-object';
import { useCustomToast } from '@/lib/show-toast';

function PreOrderPage() {
    const { user } = useAuth();
    const { error: toastError, success } = useCustomToast();

    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string>('createdAt:desc');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [preOrders, setPreOrders] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    // Dialog states
    const [showCreateDialog, setShowCreateDialog] = useState(false);

    // Query params - chỉ filter theo branchId của user
    const queryParams: BaseListRequest = useMemo(
        () => ({
            branchId: user?.branch.id,
            page: pageIndex,
            size: pageSize,
            keyword,
            sortBy: sorting || undefined,
            searchCondition:
                columnFilters && columnFilters.length > 0
                    ? JSON.stringify(columnFilters)
                    : undefined,
        }),
        [pageIndex, pageSize, sorting, keyword, columnFilters, user]
    );

    // Data fetching
    const { data: filterDefinitions = [] } = useAdvanceSearch('pre_order');
    const {
        data: preOrderList,
        isLoading,
        error,
        refetch,
    } = usePreOrderList(queryParams);

    // Effects
    useEffect(() => {
        if (preOrderList) {
            setPreOrders(preOrderList.data);
            setPageIndex(preOrderList.page);
            setTotal(preOrderList.total);
        }
    }, [preOrderList]);

    useEffect(() => {
        if (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to fetch pre-orders';
            toastError('Error', errorMessage);
            console.error('Fetch pre-orders error:', error);
        }
    }, [error, toastError]);

    // Handlers
    const onPaginationChange = (pageIndex: number, pageSize: number) => {
        setPageIndex(pageIndex);
        setPageSize(pageSize);
    };

    const onSortingChange = (newSorting: string) => {
        setSorting(newSorting);
    };

    const handleCreateSuccess = () => {
        refetch();
        success('Success', 'Pre-order created successfully');
    };

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={ShoppingBag}
                title="Pre-order"
                left={
                    <Button
                        onClick={() => setShowCreateDialog(true)}
                        className="w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">
                            Create Pre-order
                        </span>
                    </Button>
                }
            />

            <Tabs defaultValue="orders" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="orders">Pre-orders</TabsTrigger>
                    <TabsTrigger value="config">
                        <Settings className="w-4 h-4 mr-2" />
                        Deposit Configuration
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-6">
                    <DataTable
                        columns={PreOrderTableColumns({})}
                        data={preOrders}
                        tableId="pre-orders-table"
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        total={total}
                        currentSorting={sorting}
                        onPaginationChange={onPaginationChange}
                        onSortingChange={onSortingChange}
                        onFilterChange={(filters) => {
                            setColumnFilters(filters);
                        }}
                        onSearchChange={(searchTerm) => {
                            setKeyword(searchTerm);
                        }}
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
                </TabsContent>

                <TabsContent value="config" className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Deposit Configuration</CardTitle>
                            <CardDescription>
                                Configure how much deposit customers need to pay
                                for pre-orders
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <DepositConfigCard />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Create Pre-order Dialog */}
            <CreatePreOrderDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
}

export default PreOrderPage;
