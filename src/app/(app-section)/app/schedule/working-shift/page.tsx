'use client';

import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { useCustomToast } from '@/lib/show-toast';
import { DataTable } from '@/components/common/Table/DataTable';
import { SearchCondition } from '@/lib/response-object';
import { useShifts, useUpdateShift, useDeleteShift, ShiftResponseDto } from '@/api/v1/shifts';
import { useAdvanceSearch } from '@/api/v1/advance-search';
import { ShiftTableColumns } from '@/features/scheduling/components/ShiftTableColumns';
import { CreateShiftDialog } from '@/features/scheduling/components/CreateShiftDialog';
import { EditShiftModal } from '@/features/scheduling/components/EditShiftModal';
import { DeleteShiftModal } from '@/features/scheduling/components/DeleteShiftModal';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

export function WorkingShift() {
    const { user } = useAuth();

    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [shifts, setShifts] = useState<ShiftResponseDto[]>([]);
    const [total, setTotal] = useState(0);

    // Modal states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentShift, setCurrentShift] = useState<ShiftResponseDto | null>(null);

    // Hooks
    const { error: toastError, success } = useCustomToast();
    const queryClient = useQueryClient();

    // Data fetching
    const { data: filterDefinitions = [] } = useAdvanceSearch('shifts');
    const {
        data: shiftList,
        isLoading,
        error,
    } = useShifts(user?.branch?.id ?? 0);

    // Mutations
    const updateShiftMutation = useUpdateShift();
    const deleteShiftMutation = useDeleteShift();

    // Effects
    useEffect(() => {
        if (shiftList && Array.isArray(shiftList)) {
            setShifts(shiftList);
            setTotal(shiftList.length);
        }
    }, [shiftList]);

    useEffect(() => {
        if (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch shifts';
            toastError('Error', errorMessage);
            console.error('Fetch shifts error:', error);
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

    const handleCreateShift = () => {
        queryClient.invalidateQueries({ queryKey: ['shifts'] });
        success('Success', 'Shift created successfully');
        setIsCreateDialogOpen(false);
    };

    const handleEditShift = (updatedShift: ShiftResponseDto) => {
        if (currentShift) {
            // Convert LocalTime to string format if needed
            const formatTime = (time: any): string => {
                if (typeof time === 'string') {
                    return time;
                }
                if (time && typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
                    return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}:00`;
                }
                return '00:00:00';
            };

            updateShiftMutation.mutate(
                {
                    id: currentShift.id,
                    data: {
                        name: updatedShift.name,
                        startTime: formatTime(updatedShift.startTime),
                        endTime: formatTime(updatedShift.endTime),
                        weekDays: updatedShift.weekDays,
                        branchId: updatedShift.branchId,
                        requirements: updatedShift.requirements,
                    },
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['shifts'] });
                        success('Success', 'Shift updated successfully');
                        setIsEditDialogOpen(false);
                        setCurrentShift(null);
                    },
                    onError: (error: any) => {
                        toastError(
                            'Error',
                            error?.response?.data?.message || 'Failed to update shift'
                        );
                        console.error('Update shift error:', error);
                    },
                }
            );
        }
    };

    const handleDeleteShift = () => {
        if (currentShift) {
            deleteShiftMutation.mutate(currentShift.id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['shifts'] });
                    success('Success', 'Shift deleted successfully');
                    setIsDeleteDialogOpen(false);
                    setCurrentShift(null);
                },
                onError: (error: any) => {
                    toastError(
                        'Error',
                        error?.response?.data?.message || 'Failed to delete shift'
                    );
                    console.error('Delete shift error:', error);
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={Clock}
                title="Working Shifts"
                left={
                    <Button
                        onClick={() => {
                            setIsCreateDialogOpen(true);
                        }}
                        className="w-full sm:w-auto"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Shift
                    </Button>
                }
            />

            <DataTable
                columns={ShiftTableColumns({
                    onEdit: (shift: ShiftResponseDto) => {
                        setCurrentShift(shift);
                        setIsEditDialogOpen(true);
                    },
                    onDelete: (shift: ShiftResponseDto) => {
                        setCurrentShift(shift);
                        setIsDeleteDialogOpen(true);
                    },
                })}
                data={shifts}
                tableId="working-shifts-table"
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

            <CreateShiftDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSubmit={handleCreateShift}
            />

            <EditShiftModal
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                shift={currentShift}
                onSubmit={handleEditShift}
                isLoading={updateShiftMutation.isPending}
            />

            <DeleteShiftModal
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                shift={currentShift}
                onConfirm={handleDeleteShift}
                isLoading={deleteShiftMutation.isPending}
            />
        </div>
    );
}

export default function WorkingShiftPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER]}>
            <WorkingShift />
        </ProtectedRoute>
    );
}