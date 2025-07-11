'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Building2 } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { useCustomToast } from '@/lib/show-toast';
import { DataTable } from '@/components/common/Table/DataTable';
import { SearchCondition } from '@/lib/response-object';
import { useBranches, useCreateBranch, useUpdateBranch, useDeleteBranch } from '@/api/v1/branches';
import { BranchCreateDto, BranchResponseDto } from '@/api/v1/branches';
import { useAdvanceSearch } from '@/api/v1/advance-search';
import { BaseListRequest } from '@/api/v1';
import { BranchTableColumns } from '@/features/system/branches/components/BranchTableColumns';
import { CreateBranchModal } from '@/features/system/branches/components/CreateBranchModal';
import { EditBranchModal } from '@/features/system/branches/components/EditBranchModal';
import { DeleteBranchModal } from '@/features/system/branches/components/DeleteBranchModal';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';

export function Branches() {
    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string | undefined>(undefined);
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [branches, setBranches] = useState<BranchResponseDto[]>([]);
    const [total, setTotal] = useState(0);

    // Modal states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<BranchResponseDto | null>(null);
    const [newBranch, setNewBranch] = useState<BranchCreateDto>({
        name: '',
        address: '',
        phone: '',
        status: 'ACTIVE',
    });

    // Hooks
    const { error: toastError, success } = useCustomToast();
    const queryClient = useQueryClient();

    // Query params
    const queryParams: BaseListRequest = useMemo(
        () => ({
            page: pageIndex,
            size: pageSize,
            keyword,
            sortBy: sorting || undefined,
            searchCondition:
                columnFilters && columnFilters.length > 0
                    ? JSON.stringify(columnFilters)
                    : undefined,
        }),
        [pageIndex, pageSize, sorting, keyword, columnFilters]
    );

    // Data fetching
    const { data: filterDefinitions = [] } = useAdvanceSearch('branches');
    const {
        data: branchList,
        isLoading,
        error,
    } = useBranches(queryParams);

    // Mutations
    const createBranchMutation = useCreateBranch();
    const updateBranchMutation = useUpdateBranch();
    const deleteBranchMutation = useDeleteBranch();

    // Effects
    useEffect(() => {
        if (branchList) {
            setBranches(branchList);
            setPageIndex(0);
            setTotal(branchList.length);
        }
    }, [branchList]);

    useEffect(() => {
        if (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch branches';
            toastError('Error', errorMessage);
            console.error('Fetch branches error:', error);
        }
    }, [error, toastError]);

    // Handlers
    const onPaginationChange = (pageIndex: number, pageSize: number) => {
        setPageIndex(pageIndex);
        setPageSize(pageSize);
    };

    const onSortingChange = (newSorting: string | undefined) => {
        setSorting(newSorting);
    };

    const resetNewBranchForm = () => {
        setNewBranch({
            name: '',
            address: '',
            phone: '',
            status: 'ACTIVE',
        });
    };

    const handleCreateBranch = () => {
        createBranchMutation.mutate(newBranch, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['branches'] });
                success('Success', 'Branch created successfully');
                setIsCreateDialogOpen(false);
                resetNewBranchForm();
            },
            onError: (error: any) => {
                toastError(
                    'Error',
                    error?.response?.data?.message || 'Failed to create branch'
                );
                console.error('Create branch error:', error);
            },
        });
    };

    const handleEditBranch = () => {
        if (currentBranch) {
            updateBranchMutation.mutate(
                {
                    id: currentBranch.id,
                    data: {
                        name: currentBranch.name,
                        address: currentBranch.address,
                        phone: currentBranch.phone,
                        status: currentBranch.status,
                    },
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['branches'] });
                        success('Success', 'Branch updated successfully');
                        setIsEditDialogOpen(false);
                    },
                    onError: (error: any) => {
                        toastError(
                            'Error',
                            error?.response?.data?.message || 'Failed to update branch'
                        );
                        console.error('Update branch error:', error);
                    },
                }
            );
        }
    };

    const handleDeleteBranch = () => {
        if (currentBranch) {
            deleteBranchMutation.mutate(currentBranch.id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['branches'] });
                    success('Success', 'Branch deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: (error: any) => {
                    toastError(
                        'Error',
                        error?.response?.data?.message || 'Failed to delete branch'
                    );
                    console.error('Delete branch error:', error);
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={Building2}
                title="Branches"
                left={
                    <Button
                        onClick={() => {
                            setIsCreateDialogOpen(true);
                        }}
                        className="w-full sm:w-auto justify-center"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Branch</span>
                        <span className="sm:hidden">Add</span>
                    </Button>
                }
            />

            <DataTable
                columns={BranchTableColumns({
                    onEdit: (branch) => {
                        setCurrentBranch(branch);
                        setIsEditDialogOpen(true);
                    },
                    onDelete: (branch) => {
                        setCurrentBranch(branch);
                        setIsDeleteDialogOpen(true);
                    },
                })}
                data={branches}
                tableId="branches-table"
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

            <CreateBranchModal
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                newBranch={newBranch}
                setNewBranch={setNewBranch}
                onSubmit={handleCreateBranch}
                isLoading={createBranchMutation.isPending}
            />

            <EditBranchModal
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                branch={currentBranch}
                setBranch={setCurrentBranch}
                onSubmit={handleEditBranch}
                isLoading={updateBranchMutation.isPending}
            />

            <DeleteBranchModal
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                branch={currentBranch}
                onConfirm={handleDeleteBranch}
                isLoading={deleteBranchMutation.isPending}
            />
        </div>
    );
}

export default function BranchesPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.SYSTEM_ADMIN]}>
            <Branches />
        </ProtectedRoute>
    );
}