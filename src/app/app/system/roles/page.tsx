'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Trash, Loader2 } from 'lucide-react';
import {
    getRoles,
    createRole,
    updateRole,
    deleteRole,
    RoleResponse,
    RoleRequest,
} from '@/features/system/api/api-role';
import { useCustomToast } from '@/lib/show-toast';
import { Role } from '@/lib/rbac';
import { DataTable } from '@/components/Table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { FilterDefinition } from '@/components/Table/types';
import {SearchCondition} from '@/lib/BaseListRequest';
import { advanceSearch } from '@/features/system/api/api-advance-search';
// const filterDefinitions: FilterDefinition[] = [
//     {
//         field: 'name',
//         label: 'Tên',
//         type: OperandType.STRING,
//     },
//     {
//         field: 'status',
//         label: 'Trạng thái',
//         type: OperandType.ENUM,
//         options: [
//             { value: 'active', label: 'Hoạt động' },
//             { value: 'inactive', label: 'Không hoạt động' },
//         ],
//     },
//     {
//         field: 'createdAt',
//         label: 'Ngày tạo',
//         type: OperandType.DATE,
//     },
//     {
//         field: 'age',
//         label: 'Tuổi',
//         type: OperandType.INTEGER,
//     },
//     {
//         field: 'salary',
//         label: 'Lương',
//         type: OperandType.DECIMAL,
//     },
//     {
//         field: 'isActive',
//         label: 'Đang hoạt động',
//         type: OperandType.BOOLEAN,
//     },
// ];

export default function JobRolesPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState();
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [roles, setRoles] = useState<RoleResponse[]>([]);
    const [total, setTotal] = useState(0);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentRole, setCurrentRole] = useState<RoleResponse | null>(null);
    const [newRole, setNewRole] = useState<RoleRequest>({
        name: Role.CUSTOMER,
        hexColor: '#FF9500',
        description: '',
        status: 'ACTIVE',
    });
    const { error: toastError, success } = useCustomToast();

    const queryClient = useQueryClient();

    const columns: ColumnDef<RoleResponse>[] = [
        {
            accessorKey: 'hexColor',
            header: 'Color',
            cell: ({ row }) => (
                <div
                    className="w-6 h-6 rounded-full"
                    style={{
                        backgroundColor: row.getValue('hexColor'),
                    }}
                />
            ),
        },
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'description',
            header: 'Description',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${
                        row.getValue('status') === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {row.getValue('status')}
                </span>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                setCurrentRole(row.original);
                                setIsEditDialogOpen(true);
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                                setCurrentRole(row.original);
                                setIsDeleteDialogOpen(true);
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    const queryParams = useMemo(() => ({
        page: pageIndex,
        size: pageSize,
        keyword,
        sortBy: sorting,
        searchCondition: columnFilters && columnFilters.length > 0 ? JSON.stringify(columnFilters) : undefined,
    }), [pageIndex, pageSize, sorting, keyword, columnFilters]);
    

    // Fetch advance search, roles using React Query
    const {
        data: filterDefinitions = [] as FilterDefinition[],
    } = useQuery({
        queryKey: ['advance-search-roles'],
        queryFn: () => advanceSearch('roles'),
    });

    const {
        data: roleList,
        isLoading,
        error
    } = useQuery({
        queryKey: ['roles', queryParams],
        queryFn: () => getRoles(queryParams),
    });

    useEffect(() => {
        if (roleList && 'data' in roleList) {
            setRoles(roleList.data);
            setPageIndex(roleList.page);
            setTotal(roleList.total);}
    }
    , [roleList]);

    useEffect(() => {
        if (error) {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to fetch roles'
            );
            console.error('Fetch roles error:', error);
        }
    }, [error]);

    const onPaginationChange = (pageIndex: number, pageSize: number) => {
        setPageIndex(pageIndex);
        setPageSize(pageSize);
    };
    
    // Create role mutation
    const createRoleMutation = useMutation({
        mutationFn: createRole,
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

    // Update role mutation
    const updateRoleMutation = useMutation({
        mutationFn: (role: RoleResponse) =>
            updateRole(role.id, role as RoleRequest),
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
    });

    // Delete role mutation
    const deleteRoleMutation = useMutation({
        mutationFn: deleteRole,
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

    // Reset new role form
    const resetNewRoleForm = () => {
        setNewRole({
            name: Role.CUSTOMER,
            hexColor: '#FF9500',
            description: '',
            status: 'ACTIVE',
        });
    };

    // Handle create role
    const handleCreateRole = () => {
        createRoleMutation.mutate(newRole);
    };

    // Handle edit role
    const handleEditRole = () => {
        if (currentRole) {
            updateRoleMutation.mutate(currentRole);
        }
    };

    // Handle delete role
    const handleDeleteRole = () => {
        if (currentRole) {
            deleteRoleMutation.mutate(currentRole.id);
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                {/* 
Modal for creating a new role
*/}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Job Roles
                    </h1>
                    <p className="text-muted-foreground">
                        Manage job roles for scheduling and employee assignments
                    </p>
                </div>
                <CreateModal
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    newRole={newRole}
                    setNewRole={setNewRole}
                    handleCreateRole={handleCreateRole}
                    createRoleMutation={createRoleMutation}
                />
            </div>

            <DataTable
                columns={columns}
                data={roles}
                pageIndex = {pageIndex}
                pageSize = {pageSize}
                total = {total}
                tableId="roles-table"
                loading={isLoading}
                // enableSorting = {false}
                filterDefinitions={filterDefinitions}
                onSearchChange={(search) => {
                    setKeyword(search);
                }}
                onPaginationChange={onPaginationChange}
                onSortingChange={(sorting) => {
                    setSorting(sorting);
                }}
                onFilterChange={(filters) => {
                    setColumnFilters(filters);
                }
                }
                currentSorting={sorting}
            />

            {/* Edit Role Dialog */}
            <EditModal
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                currentRole={currentRole}
                setCurrentRole={setCurrentRole}
                handleEditRole={handleEditRole}
                updateRoleMutation={updateRoleMutation}
            />

            {/* Delete Role Dialog */}
            <DeleteModal
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                deleteRoleMutation={deleteRoleMutation}
                currentRole={currentRole}
                handleDeleteRole={handleDeleteRole}
            />
        </div>
    );
}

function EditModal({
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentRole,
    setCurrentRole,
    handleEditRole,
    updateRoleMutation,
}: any) {
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Job Role</DialogTitle>
                    <DialogDescription>
                        Update the details of this job role
                    </DialogDescription>
                </DialogHeader>
                {currentRole && (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Role Name</Label>
                            <Input
                                id="edit-name"
                                value={currentRole.name}
                                disabled
                                // onChange={(e) =>
                                //   setCurrentRole({ ...currentRole, name: e.target.value })
                                // }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-color">Color</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="edit-color"
                                    type="color"
                                    className="w-12 h-10 p-1"
                                    value={currentRole.hexColor}
                                    onChange={(e: any) =>
                                        setCurrentRole({
                                            ...currentRole,
                                            hexColor: e.target.value,
                                        })
                                    }
                                />
                                <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                        This color will be used to identify the
                                        role in schedules
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="edit-description"
                                value={currentRole.description}
                                onChange={(e: any) =>
                                    setCurrentRole({
                                        ...currentRole,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={currentRole.status}
                                onChange={(e) =>
                                    setCurrentRole({
                                        ...currentRole,
                                        status: e.target.value,
                                    })
                                }
                            >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsEditDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={handleEditRole}
                        disabled={
                            !currentRole?.name.trim() ||
                            updateRoleMutation.isPending
                        }
                    >
                        {updateRoleMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteModal({
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    deleteRoleMutation,
    currentRole,
    handleDeleteRole,
}: any) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Job Role</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this job role? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {currentRole && (
                    <div className="py-4">
                        <p className="font-medium">{currentRole.name}</p>
                        <p className="text-sm text-muted-foreground">
                            {currentRole.description}
                        </p>
                    </div>
                )}
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsDeleteDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDeleteRole}
                        disabled={deleteRoleMutation.isPending}
                    >
                        {deleteRoleMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            'Delete'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CreateModal({
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newRole,
    setNewRole,
    handleCreateRole,
    createRoleMutation,
}: any) {
    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Role
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Job Role</DialogTitle>
                    <DialogDescription>
                        Add a new job role to the system. This will be used for
                        scheduling and employee assignments.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Role Name</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Head Chef"
                            value={newRole.name}
                            onChange={(e: any) =>
                                setNewRole({
                                    ...newRole,
                                    name: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex gap-2">
                            <Input
                                id="color"
                                type="color"
                                className="w-12 h-10 p-1"
                                value={newRole.hexColor}
                                onChange={(e: any) =>
                                    setNewRole({
                                        ...newRole,
                                        hexColor: e.target.value,
                                    })
                                }
                            />
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">
                                    This color will be used to identify the role
                                    in schedules
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">
                            Description (Optional)
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Describe the responsibilities of this role"
                            value={newRole.description}
                            onChange={(e: any) =>
                                setNewRole({
                                    ...newRole,
                                    description: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={handleCreateRole}
                        disabled={
                            !newRole.name.trim() || createRoleMutation.isPending
                        }
                    >
                        {createRoleMutation.isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
