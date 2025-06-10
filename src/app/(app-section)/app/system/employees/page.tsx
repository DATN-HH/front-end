'use client';

import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import {
    Edit,
    MoreHorizontal,
    Plus,
    Trash,
    Calendar,
    CheckCircle,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { delUser, getListUsers, putUser } from '@/features/system/api/api-user';
import { SearchCondition } from '@/lib/response-object';
import { useCustomToast } from '@/lib/show-toast';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition } from '@/components/common/Table/types';
import { advanceSearch } from '@/features/system/api/api-advance-search';
import { getRoles } from '@/features/system/api/api-role';
import { createUser } from '@/features/system/api/api-auth';
import { useAuth } from '@/contexts/auth-context';

export default function EmployeesPage() {
    const { user } = useAuth();

    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string | undefined>();
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [employees, setEmployees] = useState([]);
    const [total, setTotal] = useState(0);

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] =
        useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);
    const [newEmployee, setNewEmployee] = useState({
        branchId: user?.branch.id,
    });

    const { error: toastError, success } = useCustomToast();

    const queryClient = useQueryClient();

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'fullName',
            header: 'Employee',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <Avatar>
                        <AvatarImage
                            src={
                                row.original.gender == 'MALE'
                                    ? 'https://cdn1.iconfinder.com/data/icons/user-pictures/101/malecostume-512.png'
                                    : 'https://png.pngtree.com/png-clipart/20241117/original/pngtree-business-women-avatar-png-image_17163554.png'
                            }
                            alt={row.original.fullName}
                        />
                    </Avatar>
                    <span> {getInitials(row.original.fullName)}</span>
                </div>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
        },
        {
            id: 'roles',
            header: 'Roles',
            enableSorting: false,
            cell: ({ row }) => {
                return (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {row.original.isFullRole ? (
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500 text-white">
                                <CheckCircle className="w-3 h-3" />
                                <span>Full Roles</span>
                            </div>
                        ) : (
                            row.original.userRoles.map((userRole, index) => (
                                <div
                                    key={index}
                                    className="px-2 py-0.5 text-xs font-medium rounded-full bg-cyan-500 text-white"
                                >
                                    {userRole.role.name}
                                </div>
                            ))
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: 'birthdate',
            header: 'Birthdate',
            cell: ({ row }) => (
                <div>{dayjs(row.original.birthdate).format('DD/MM/YYYY')}</div>
            ),
        },
        {
            accessorKey: 'gender',
            header: 'Gender',
        },
        {
            accessorKey: 'phoneNumber',
            header: 'Phone',
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: ({ row }) => (
                <div>
                    {dayjs(row.original.createdAt).format(
                        'DD/MM/YYYY HH:mm:ss'
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated At',
            cell: ({ row }) => (
                <div>
                    {dayjs(row.original.updatedAt).format(
                        'DD/MM/YYYY HH:mm:ss'
                    )}
                </div>
            ),
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
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentEmployee(row.original);
                                    console.log(row.original);

                                    setIsEditDialogOpen(true);
                                }}
                            >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => {
                                    setCurrentEmployee(row.original);
                                    setIsUnavailabilityDialogOpen(true);
                                }}
                            >
                                <Calendar className="mr-2 h-4 w-4" />
                                Manage Unavailability
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                    setCurrentEmployee(row.original);
                                    setIsDeleteDialogOpen(true);
                                }}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const queryParams = useMemo(
        () => ({
            status: 'ACTIVE',
            branchId: user?.branch.id,
            isEmployee: true,
            page: pageIndex,
            size: pageSize,
            keyword,
            sortBy: sorting,
            searchCondition:
                columnFilters && columnFilters.length > 0
                    ? JSON.stringify(columnFilters)
                    : undefined,
        }),
        [pageIndex, pageSize, sorting, keyword, columnFilters, user]
    );

    // Fetch roles, using React Query
    const { data: roles } = useQuery({
        queryKey: ['roles'],
        queryFn: () => getRoles(),
    });

    // Fetch advance search, using React Query
    const { data: filterDefinitions = [] as FilterDefinition[] } = useQuery({
        queryKey: ['advance-search-users'],
        queryFn: () => advanceSearch('users'),
    });

    const {
        data: employeeList,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['employees', queryParams],
        queryFn: () => getListUsers(queryParams),
    });

    useEffect(() => {
        if (employeeList && 'data' in employeeList) {
            setEmployees(employeeList.data);
            setPageIndex(employeeList.page);
            setTotal(employeeList.total);
        }
    }, [employeeList]);

    useEffect(() => {
        if (error) {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to fetch employees'
            );
            console.error('Fetch employees error:', error);
        }
    }, [error]);

    // Update user mutation
    const updateUserMutation = useMutation({
        mutationFn: (data: { userId: any; userInfo: any }) =>
            putUser(data.userId, data.userInfo),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            success('Success', 'Employees updated successfully');
            setIsEditDialogOpen(false);
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to update'
            );
            console.error('Update error:', error);
        },
    });

    // Create user mutation
    const createUserMutation = useMutation({
        mutationFn: (user: any) => createUser(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            success('Success', 'Employees create successfully');
            setIsCreateDialogOpen(false);
            setNewEmployee({ branchId: user?.branch?.id });
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to create'
            );
            console.log('Create user success', user);

            console.error('Create error:', error);
        },
    });

    // Delete user mutation
    const deleteUserMutation = useMutation({
        mutationFn: (userId: any) => delUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            success('Success', 'Employees delete successfully');
            setIsDeleteDialogOpen(false);
        },
        onError: (error: any) => {
            toastError(
                'Error',
                error?.response?.data?.message || 'Failed to delete'
            );
            console.error('Delete error:', error);
        },
    });

    // Get initials from name
    const getInitials = (name: string) => {
        return name.toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Employees
                    </h1>
                    <p className="text-muted-foreground">
                        Manage your restaurant staff
                    </p>
                </div>

                <CreateModal
                    isCreateDialogOpen={isCreateDialogOpen}
                    setIsCreateDialogOpen={setIsCreateDialogOpen}
                    newEmployee={newEmployee}
                    setNewEmployee={setNewEmployee}
                    handleCreateEmployee={() =>
                        createUserMutation.mutate(newEmployee)
                    }
                />
            </div>

            <DataTable
                columns={columns}
                data={employees}
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={total}
                tableId="employees-table"
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

            {/* Edit Employee Dialog */}
            <EditModal
                isEditDialogOpen={isEditDialogOpen}
                setIsEditDialogOpen={setIsEditDialogOpen}
                currentEmployee={currentEmployee}
                setCurrentEmployee={setCurrentEmployee}
                roles={roles}
                updateUserMutation={updateUserMutation}
            />

            {/* Delete Employee Dialog */}
            <DeleteModal
                deleteUserMutation={deleteUserMutation}
                isDeleteDialogOpen={isDeleteDialogOpen}
                setIsDeleteDialogOpen={setIsDeleteDialogOpen}
                currentEmployee={currentEmployee}
            />

            {/* Manage Unavailability Dialog */}
            {/* <Dialog
                open={isUnavailabilityDialogOpen}
                onOpenChange={setIsUnavailabilityDialogOpen}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Manage Unavailability</DialogTitle>
                        <DialogDescription>
                            {currentEmployee?.name}'s unavailable time periods
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="space-y-4">
                            <div className="border rounded-md p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">
                                            May 15, 2025
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            All day
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Reason: Personal appointment
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="border rounded-md p-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-medium">
                                            May 20, 2025
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            9:00 AM - 1:00 PM
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Reason: Doctor's appointment
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            <Button className="w-full bg-orange-500 hover:bg-orange-600">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Unavailable Time
                            </Button>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsUnavailabilityDialogOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog> */}
        </div>
    );
}

function CreateModal({
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    newEmployee,
    setNewEmployee,
    handleCreateEmployee,
}: any) {
    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Employee
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Add a new employee to your restaurant staff
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="fullName"
                            placeholder="John Smith"
                            value={newEmployee.fullName}
                            onChange={(e) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    fullName: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john.smith@example.com"
                            value={newEmployee.email}
                            onChange={(e) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="123@abcZZZ"
                            value={newEmployee.password}
                            onChange={(e) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    password: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            placeholder="555-123-4567"
                            value={newEmployee.phoneNumber}
                            onChange={(e) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    phoneNumber: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            value={newEmployee.gender}
                            onValueChange={(value) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    gender: value,
                                })
                            }
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="MALE">Male</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            value={newEmployee.status}
                            onValueChange={(value) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    status: value,
                                })
                            }
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
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
                        onClick={handleCreateEmployee}
                        disabled={!newEmployee.fullName || !newEmployee.email}
                    >
                        Add Employee
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function EditModal({
    isEditDialogOpen,
    setIsEditDialogOpen,
    currentEmployee,
    setCurrentEmployee,
    roles,
    updateUserMutation,
}: any) {
    return (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee information
                    </DialogDescription>
                </DialogHeader>
                {currentEmployee && (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                                id="edit-name"
                                value={currentEmployee.fullName}
                                onChange={(e) =>
                                    setCurrentEmployee({
                                        ...currentEmployee,
                                        fullName: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-email">Email</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={currentEmployee.email}
                                onChange={(e) =>
                                    setCurrentEmployee({
                                        ...currentEmployee,
                                        email: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-phone">Phone Number</Label>
                            <Input
                                id="edit-phone"
                                value={currentEmployee.phoneNumber}
                                onChange={(e) =>
                                    setCurrentEmployee({
                                        ...currentEmployee,
                                        phoneNumber: e.target.value,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-role">Job Role</Label>
                            <Select
                                value={currentEmployee.userRoles[0]?.roleId}
                                onValueChange={(value) =>
                                    setCurrentEmployee({
                                        ...currentEmployee,
                                        userRoles: [
                                            {
                                                userId: currentEmployee.id,
                                                roleId: Number(value),
                                            },
                                        ],
                                    })
                                }
                            >
                                <SelectTrigger id="edit-role">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles?.data?.map((role) => (
                                        <SelectItem
                                            key={role?.id}
                                            value={role?.id}
                                        >
                                            {role?.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
                        onClick={() =>
                            updateUserMutation.mutate({
                                userId: currentEmployee.id,
                                userInfo: {
                                    ...currentEmployee,
                                },
                            })
                        }
                        disabled={
                            !currentEmployee?.fullName ||
                            !currentEmployee?.email
                        }
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function DeleteModal({
    deleteUserMutation,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    currentEmployee,
}: any) {
    return (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this employee? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                {currentEmployee && (
                    <div className="py-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <p className="font-medium">
                                    {currentEmployee.fullName}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {currentEmployee.email}
                                </p>
                            </div>
                        </div>
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
                        onClick={() =>
                            deleteUserMutation.mutate(currentEmployee.id)
                        }
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
