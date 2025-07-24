'use client';

import { useQueryClient } from '@tanstack/react-query';
import { ColumnDef } from '@tanstack/react-table';
import {
    MoreHorizontal,
    Eye,
    X,
    Play,
    Trash2,
    RefreshCw,
    Timer,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
    WaitlistResponseDto,
    WaitlistListRequest,
    WaitlistStatus,
    useWaitlistList,
    useCancelWaitlist,
    useProcessWaitlist,
    useCleanupWaitlist,
    getStatusColor,
    getStatusIcon,
    getStatusDisplayName,
    formatWaitTime,
} from '@/api/v1/waitlist';
import { DataTable } from '@/components/common/Table/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCustomToast } from '@/lib/show-toast';

interface WaitlistTableProps {
    onViewDetails?: (waitlist: WaitlistResponseDto) => void;
    compact?: boolean;
    branchId?: number;
}

export function WaitlistTable({
    onViewDetails,
    compact = false,
    branchId,
}: WaitlistTableProps) {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(compact ? 10 : 20);
    const [keyword, setKeyword] = useState('');
    const [statusFilter, setStatusFilter] = useState<WaitlistStatus | 'ALL'>(
        'ALL'
    );
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { success, error } = useCustomToast();
    const queryClient = useQueryClient();
    const cancelMutation = useCancelWaitlist();
    const processMutation = useProcessWaitlist();
    const cleanupMutation = useCleanupWaitlist();

    // Build query params
    const queryParams: WaitlistListRequest = useMemo(() => {
        const params: WaitlistListRequest = {
            page: pageIndex,
            size: pageSize,
        };

        if (keyword.trim()) {
            params.keyword = keyword.trim();
        }

        if (statusFilter !== 'ALL') {
            params.waitlistStatus = statusFilter;
        }

        if (branchId) {
            params.branchId = branchId;
        }

        return params;
    }, [pageIndex, pageSize, keyword, statusFilter, branchId]);

    const { data: response, isLoading, refetch } = useWaitlistList(queryParams);

    const waitlistData = response?.payload?.data || [];
    const total = response?.payload?.total || 0;

    // Debug logs
    console.log('WaitlistTable render:', {
        queryParams,
        isLoading,
        responseSuccess: response?.success,
        dataCount: waitlistData.length,
        total,
    });

    const formatDateTime = (datetime: string) => {
        return new Date(datetime).toLocaleString('vi-VN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCancel = async (id: number) => {
        try {
            const response = await cancelMutation.mutateAsync(id);
            if (response.success) {
                success('Success', 'Waitlist entry cancelled successfully');
                // Invalidate and refetch
                queryClient.invalidateQueries({ queryKey: ['waitlist'] });
                refetch();
            }
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'An error occurred');
        }
    };

    const handleProcess = async () => {
        try {
            const response = await processMutation.mutateAsync();
            if (response.success) {
                success(
                    'Success',
                    response.message || 'Waitlist processed successfully'
                );
                // Invalidate and refetch
                queryClient.invalidateQueries({ queryKey: ['waitlist'] });
                refetch();
            }
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'An error occurred');
        }
    };

    const handleCleanup = async () => {
        try {
            const response = await cleanupMutation.mutateAsync();
            if (response.success) {
                success(
                    'Success',
                    response.message || 'Expired waitlist entries cleaned up'
                );
                // Invalidate and refetch
                queryClient.invalidateQueries({ queryKey: ['waitlist'] });
                refetch();
            }
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'An error occurred');
        }
    };

    const handleRefresh = async () => {
        try {
            setIsRefreshing(true);
            console.log('Refreshing waitlist data...');

            // Invalidate all waitlist queries
            await queryClient.invalidateQueries({ queryKey: ['waitlist'] });

            // Force refetch
            await refetch();

            success('Success', 'Waitlist data refreshed');
            console.log('Waitlist data refreshed successfully');
        } catch (err: any) {
            console.error('Refresh error:', err);
            error('Error', 'Failed to refresh data');
        } finally {
            setIsRefreshing(false);
        }
    };

    const columns: ColumnDef<WaitlistResponseDto>[] = [
        {
            accessorKey: 'id',
            header: 'ID',
            cell: ({ row }) => (
                <span className="font-mono text-sm">#{row.original.id}</span>
            ),
        },
        {
            accessorKey: 'customerName',
            header: 'Customer',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <p className="font-medium">{row.original.customerName}</p>
                    {!compact && (
                        <p className="text-xs text-muted-foreground">
                            {row.original.customerPhone}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'preferredStartTime',
            header: 'Time',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <p className="text-sm">
                        {formatDateTime(row.original.preferredStartTime)}
                    </p>
                    {!compact && (
                        <p className="text-xs text-muted-foreground">
                            {row.original.duration}h - {row.original.guestCount}{' '}
                            {row.original.guestCount === 1 ? 'guest' : 'guests'}
                        </p>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'waitlistStatus',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    className={`${getStatusColor(row.original.waitlistStatus)} text-xs`}
                >
                    {getStatusIcon(row.original.waitlistStatus)}{' '}
                    {getStatusDisplayName(row.original.waitlistStatus)}
                </Badge>
            ),
        },
        ...(!compact
            ? [
                  {
                      accessorKey: 'estimatedWaitTime',
                      header: 'Wait Time',
                      cell: ({ row }: { row: any }) => (
                          <div className="space-y-1">
                              {row.original.waitlistStatus === 'ACTIVE' && (
                                  <>
                                      <p className="text-sm text-orange-600">
                                          {formatWaitTime(
                                              row.original.estimatedWaitTime
                                          )}
                                      </p>
                                      <p className="text-xs text-red-600">
                                          Remaining:{' '}
                                          {row.original.timeRemaining}
                                      </p>
                                  </>
                              )}
                              {row.original.waitlistStatus !== 'ACTIVE' && (
                                  <span className="text-xs text-muted-foreground">
                                      -
                                  </span>
                              )}
                          </div>
                      ),
                  },
              ]
            : []),
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => onViewDetails?.(row.original)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                        </DropdownMenuItem>
                        {(row.original.waitlistStatus === 'ACTIVE' ||
                            row.original.waitlistStatus === 'NOTIFIED') && (
                            <DropdownMenuItem
                                onClick={() => handleCancel(row.original.id)}
                                className="text-red-600"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel Waitlist
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const activeCount = waitlistData.filter(
        (w) => w.waitlistStatus === 'ACTIVE'
    ).length;
    const notifiedCount = waitlistData.filter(
        (w) => w.waitlistStatus === 'NOTIFIED'
    ).length;

    return (
        <div className="space-y-4">
            {/* Header Actions */}
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={handleProcess}
                        disabled={processMutation.isPending}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Play className="w-4 h-4 mr-2" />
                        {processMutation.isPending
                            ? 'Processing...'
                            : 'Process Waitlist'}
                    </Button>

                    <Button
                        onClick={handleCleanup}
                        disabled={cleanupMutation.isPending}
                        variant="outline"
                        size="sm"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {cleanupMutation.isPending
                            ? 'Cleaning up...'
                            : 'Cleanup Expired'}
                    </Button>

                    <Button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        variant="outline"
                        size="sm"
                    >
                        <RefreshCw
                            className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`}
                        />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                    <Select
                        value={statusFilter}
                        onValueChange={(value: any) => setStatusFilter(value)}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Filter Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="ACTIVE">🟡 Active</SelectItem>
                            <SelectItem value="NOTIFIED">
                                🔵 Notified
                            </SelectItem>
                            <SelectItem value="CONVERTED">
                                🟢 Converted
                            </SelectItem>
                            <SelectItem value="EXPIRED">🔴 Expired</SelectItem>
                            <SelectItem value="CANCELLED">
                                ⚫ Cancelled
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Quick Stats */}
            {!compact && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-yellow-700">
                            {activeCount}
                        </p>
                        <p className="text-sm text-yellow-600">Active</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-blue-700">
                            {notifiedCount}
                        </p>
                        <p className="text-sm text-blue-600">Notified</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-green-700">
                            {
                                waitlistData.filter(
                                    (w) => w.waitlistStatus === 'CONVERTED'
                                ).length
                            }
                        </p>
                        <p className="text-sm text-green-600">Converted</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg text-center">
                        <p className="text-2xl font-bold text-gray-700">
                            {total}
                        </p>
                        <p className="text-sm text-gray-600">Total</p>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <DataTable
                columns={columns}
                data={waitlistData}
                tableId="waitlist-table"
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={total}
                onPaginationChange={(newPageIndex, newPageSize) => {
                    setPageIndex(newPageIndex);
                    setPageSize(newPageSize);
                }}
                onSearchChange={setKeyword}
                onSortingChange={() => {}}
                onFilterChange={() => {}}
                loading={isLoading}
                enableSearch={true}
                enablePagination={true}
                enableColumnVisibility={!compact}
                enableSorting={false}
                enableFiltering={false}
                enablePinning={false}
                enableColumnOrdering={false}
                enableExport={false}
            />

            {/* Status Summary */}
            {compact && activeCount + notifiedCount > 0 && (
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Timer className="w-4 h-4 text-orange-500" />
                        <span>
                            {activeCount + notifiedCount} active waitlist{' '}
                            {activeCount + notifiedCount === 1
                                ? 'entry'
                                : 'entries'}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
