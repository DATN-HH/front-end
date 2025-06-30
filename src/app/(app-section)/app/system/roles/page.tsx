'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Shield } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { useCustomToast } from '@/lib/show-toast';
import { Role } from '@/lib/rbac';
import { DataTable } from '@/components/common/Table/DataTable';
import { SearchCondition } from '@/lib/response-object';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/api/v1/roles';
import { RoleResponseDto } from '@/api/v1/auth';
import { RoleCreateDto, RoleUpdateDto } from '@/api/v1/roles';
import { useAdvanceSearch } from '@/api/v1/advance-search';
import { BaseListRequest, RoleName, Status } from '@/api/v1';
import { RoleTableColumns } from '@/features/system/roles/components/RoleTableColumns';
import { CreateRoleModal } from '@/features/system/roles/components/CreateRoleModal';
import { EditRoleModal } from '@/features/system/roles/components/EditRoleModal';
import { DeleteRoleModal } from '@/features/system/roles/components/DeleteRoleModal';
import { ProtectedRoute } from '@/components/protected-component';

export function JobRoles() {
    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [roles, setRoles] = useState<RoleResponseDto[]>([]);
    const [total, setTotal] = useState(0);

    // Modal states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleResponseDto | null>(null);
    const [newRole, setNewRole] = useState<RoleCreateDto>({
        name: Role.CUSTOMER as RoleName,
        hexColor: '#FF9500',
        description: '',
        status: 'ACTIVE' as Status,
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
    const { data: filterDefinitions = [] } = useAdvanceSearch('roles');
    const {
        data: roleList,
        isLoading,
        error,
    } = useRoles(queryParams);

    // Mutations
    const createRoleMutation = useCreateRole();
    const updateRoleMutation = useUpdateRole();
    const deleteRoleMutation = useDeleteRole();

    // Effects
    useEffect(() => {
        if (roleList) {
            setRoles(roleList.data);
            setPageIndex(roleList.page);
            setTotal(roleList.total);
        }
    }, [roleList]);

    useEffect(() => {
        if (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch roles';
            toastError('Error', errorMessage);
            console.error('Fetch roles error:', error);
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

    const resetNewRoleForm = () => {
        setNewRole({
            name: Role.CUSTOMER as RoleName,
            hexColor: '#FF9500',
            description: '',
            status: 'ACTIVE' as Status,
        });
    };

    const handleCreateRole = () => {
        createRoleMutation.mutate(newRole, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['roles'] });
                success('Success', 'Role created successfully');
                setIsCreateDialogOpen(false);
                resetNewRoleForm();
            },
            onError: (error: any) => {
                toastError(
                    'Error',
                    error?.response?.data?.message || 'Failed to create role'
                );
                console.error('Create role error:', error);
            },
        });
    };

    const handleEditRole = () => {
        if (currentRole) {
            const updateData: RoleUpdateDto = {
                name: currentRole.name,
                description: currentRole.description,
                hexColor: currentRole.hexColor,
                status: currentRole.status,
                rolePermissions: (currentRole.rolePermissions || []).map(p => ({
                    id: p.id,
                    roleId: p.roleId,
                    permissionId: p.permissionId,
                    isLimitedByOwner: p.isLimitedByOwner,
                    limitedIp: p.limitedIp
                })),
                roleScreens: (currentRole.roleScreens || []).map(s => ({
                    id: s.id,
                    roleId: s.roleId,
                    screenId: s.screenId
                }))
            };

            updateRoleMutation.mutate(
                { id: currentRole.id, data: updateData },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['roles'] });
                        success('Success', 'Role updated successfully');
                        setIsEditDialogOpen(false);
                    },
                    onError: (error: any) => {
                        toastError(
                            'Error',
                            error?.response?.data?.message || 'Failed to update role'
                        );
                        console.error('Update role error:', error);
                    },
                }
            );
        }
    };

    const handleDeleteRole = () => {
        if (currentRole) {
            deleteRoleMutation.mutate(currentRole.id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['roles'] });
                    success('Success', 'Role deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: (error: any) => {
                    toastError(
                        'Error',
                        error?.response?.data?.message || 'Failed to delete role'
                    );
                    console.error('Delete role error:', error);
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PageTitle
                icon={Shield}
                title="Roles"
                left={
                    <Button
                        onClick={() => {
                            setIsCreateDialogOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Role
                    </Button>
                }
            />

            <DataTable
                columns={RoleTableColumns({
                    onEdit: (role) => {
                        setCurrentRole(role);
                        setIsEditDialogOpen(true);
                    },
                    onDelete: (role) => {
                        setCurrentRole(role);
                        setIsDeleteDialogOpen(true);
                    },
                })}
                data={roles}
                tableId="roles-table"
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

            <CreateRoleModal
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                newRole={newRole}
                setNewRole={setNewRole}
                onSubmit={handleCreateRole}
                isLoading={createRoleMutation.isPending}
            />

            <EditRoleModal
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                role={currentRole}
                setRole={setCurrentRole}
                onSubmit={handleEditRole}
                isLoading={updateRoleMutation.isPending}
            />

            <DeleteRoleModal
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                role={currentRole}
                onConfirm={handleDeleteRole}
                isLoading={deleteRoleMutation.isPending}
            />
        </div>
    );
}

export default function JobRolesPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.SYSTEM_ADMIN]}>
            <JobRoles />
        </ProtectedRoute>
    );
}