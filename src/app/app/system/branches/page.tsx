'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash,
    Loader2,
} from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import { Role } from '@/lib/rbac';
import { getBranches } from '@/features/system/api/api-branch';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/Table/DataTable';
import { SearchCondition } from '@/lib/response-object';
import dayjs from 'dayjs';

export default function JobRolesPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState();
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');
    const [total, setTotal] = useState(0);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<any | null>(null);
    const [newBranch, setNewBranch] = useState<any>({
        name: '',
        address: '',
        phone: '',
        managerId: null,
        status: 'ACTIVE',
    });

    const filterDefinitions = [
        {
            field: 'name',
            label: 'Name',
            type: 'STRING',
        }
    ];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'address',
            header: 'Address',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'manager',
            header: 'Manager',
            cell: ({ row }) => {
                return <span>{row.original?.managerName}</span>;
            },
        },
        {
            accessorKey: 'updateAt',
            header: 'Last Updated',
            cell: ({ row }) => {
                const rawDate: string = row.getValue('updateAt');
                const parsedDate = dayjs(rawDate?.split('.')[0]); // Cắt phần microseconds
                return <span>{parsedDate.format('YYYY-MM-DD HH:mm:ss')}</span>;
            },
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
                                // setCurrentRole(row.original);
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
                                // setCurrentRole(row.original);
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

    const [searchQuery, setSearchQuery] = useState('');

    const { error: toastError, success } = useCustomToast();

    const queryClient = useQueryClient();

    // Fetch branch using React Query
    const {
        data: branch = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });

    //   // Create role mutation
    //   const createRoleMutation = useMutation({
    //     mutationFn: createRole,
    //     onSuccess: () => {
    //       queryClient.invalidateQueries({ queryKey: ['roles'] });
    //       success('Success', 'Role created successfully');
    //       setIsCreateDialogOpen(false);
    //       resetNewRoleForm();
    //     },
    //     onError: (error: any) => {
    //       toastError(
    //         'Error',
    //         error?.response?.data?.message || 'Failed to create role'
    //       );
    //       console.error('Create role error:', error);
    //     },
    //   });

    //   // Update role mutation
    //   const updateRoleMutation = useMutation({
    //     mutationFn: (role: RoleResponse) =>
    //       updateRole(role.id, role as RoleRequest),
    //     onSuccess: () => {
    //       queryClient.invalidateQueries({ queryKey: ['roles'] });
    //       success('Success', 'Role updated successfully');
    //       setIsEditDialogOpen(false);
    //     },
    //     onError: (error: any) => {
    //       toastError(
    //         'Error',
    //         error?.response?.data?.message || 'Failed to update role'
    //       );
    //       console.error('Update role error:', error);
    //     },
    //   });

    //   // Delete role mutation
    //   const deleteRoleMutation = useMutation({
    //     mutationFn: deleteRole,
    //     onSuccess: () => {
    //       queryClient.invalidateQueries({ queryKey: ['roles'] });
    //       success('Success', 'Role deleted successfully');
    //       setIsDeleteDialogOpen(false);
    //     },
    //     onError: (error: any) => {
    //       toastError(
    //         'Error',
    //         error?.response?.data?.message || 'Failed to delete role'
    //       );
    //       console.error('Delete role error:', error);
    //     },
    //   });

    // Reset new role form
    const resetNewRoleForm = () => {
        setNewBranch({
            name: '',
            address: '',
            phone: '',
            managerId: null,
            status: 'ACTIVE',
        });
    };

    // // Handle create role
    // const handleCreateRole = () => {
    //     createRoleMutation.mutate(newRole);
    // };

    // // Handle edit role
    // const handleEditRole = () => {
    //     if (currentRole) {
    //         updateRoleMutation.mutate(currentRole);
    //     }
    // };

    // // Handle delete role
    // const handleDeleteRole = () => {
    //     if (currentRole) {
    //         deleteRoleMutation.mutate(currentRole.id);
    //     }
    // };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Branches
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your restaurant branches, including adding,
                        editing, and removing branches
                    </p>
                </div>

                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Branch
                        </Button>
                    </DialogTrigger>
                    {/* <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Job Role</DialogTitle>
                            <DialogDescription>
                                Add a new job role to the system. This will be
                                used for scheduling and employee assignments.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Head Chef"
                                    value={newBranch.name}
                                    onChange={(e) =>
                                        setNewBranch({
                                            ...newBranch,
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
                                        value={newBranch.hexColor}
                                        onChange={(e) =>
                                            setNewBranch({
                                                ...newBranch,
                                                hexColor: e.target.value,
                                            })
                                        }
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            This color will be used to identify
                                            the role in schedules
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
                                    onChange={(e) =>
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
                                    !newRole.name.trim() ||
                                    createRoleMutation.isPending
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
                    </DialogContent> */}
                </Dialog>
            </div>

            <div className="flex items-center justify-between">
                {/* MODAL FOR CREATING A NEW BRANCH */}
            </div>

            {/* TABLE FOR DISPLAYING BRANCHES */}
            <DataTable
                columns={columns}
                data={branch}
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={total}
                tableId="roles-table"
                loading={isLoading}
                // enableSorting = {false}
                filterDefinitions={filterDefinitions}
                onSearchChange={(search) => {
                    setKeyword(search);
                }}
                onPaginationChange={(pageIndex: number, pageSize: number) => {
                    setPageIndex(pageIndex);
                    setPageSize(pageSize);
                }}
                onSortingChange={(sorting) => {
                    setSorting(sorting);
                }}
                onFilterChange={(filters) => {
                    setColumnFilters(filters);
                }}
                currentSorting={sorting}
            />

            {/* MODAL FOR EDITING A ROLE */}
            {/* <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                                        onChange={(e) =>
                                            setCurrentRole({
                                                ...currentRole,
                                                hexColor: e.target.value,
                                            })
                                        }
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm text-muted-foreground">
                                            This color will be used to identify
                                            the role in schedules
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
                                    onChange={(e) =>
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
            </Dialog> */}

            {/* MODAL FOR DELETING A BRANCH */}
            {/* <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
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
            </Dialog> */}
        </div>
    );
}
