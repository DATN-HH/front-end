'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { useCustomToast } from '@/lib/show-toast';
import { DataTable } from '@/components/common/Table/DataTable';
import { SearchCondition } from '@/lib/response-object';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/api/v1/users';
import { UserCreateDto } from '@/api/v1/users';
import { useAdvanceSearch } from '@/api/v1/advance-search';
import { BaseListRequest } from '@/api/v1';
import { EmployeeTableColumns } from '@/features/system/employees/components/EmployeeTableColumns';
import { CreateEmployeeModal } from '@/features/system/employees/components/CreateEmployeeModal';
import { EditEmployeeModal } from '@/features/system/employees/components/EditEmployeeModal';
import { DeleteEmployeeModal } from '@/features/system/employees/components/DeleteEmployeeModal';
import { useRoles } from '@/api/v1/roles';
import { useAuth } from '@/contexts/auth-context';
import { Role } from '@/lib/rbac';
import { ProtectedRoute } from '@/components/protected-component';

    export function Employees() {
    const { user } = useAuth();

    // State management
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');

    const [employees, setEmployees] = useState<any[]>([]);
    const [total, setTotal] = useState(0);

    // Modal states
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);
    const [newEmployee, setNewEmployee] = useState<UserCreateDto>({
        email: '',
        fullName: '',
        password: '',
        branchId: user?.branch.id,
    });

    // Hooks
    const { error: toastError, success } = useCustomToast();
    const queryClient = useQueryClient();

    // Query params
    const queryParams: BaseListRequest = useMemo(
        () => ({
            status: 'ACTIVE',
            branchId: user?.branch.id,
            isEmployee: true,
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
    const { data: filterDefinitions = [] } = useAdvanceSearch('users');
    const { data: roles } = useRoles({});
    const {
        data: employeeList,
        isLoading,
        error,
    } = useUsers(queryParams);

    // Mutations
    const createUserMutation = useCreateUser();
    const updateUserMutation = useUpdateUser();
    const deleteUserMutation = useDeleteUser();

    // Effects
    useEffect(() => {
        if (employeeList) {
            setEmployees(employeeList.data);
            setPageIndex(employeeList.page);
            setTotal(employeeList.total);
        }
    }, [employeeList]);

    useEffect(() => {
        if (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to fetch employees';
            toastError('Error', errorMessage);
            console.error('Fetch employees error:', error);
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

    const resetNewEmployeeForm = () => {
        setNewEmployee({
            email: '',
            fullName: '',
            password: '',
            branchId: user?.branch.id,
        });
    };

    const handleCreateEmployee = () => {
        setNewEmployee(prev => ({
            ...prev,
            branchId: user?.branch.id,
        }));
        createUserMutation.mutate(newEmployee, {
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ['users'] });
                success('Success', 'Employee created successfully');
                setIsCreateDialogOpen(false);
                resetNewEmployeeForm();
            },
            onError: (error: any) => {
                toastError(
                    'Error',
                    error?.response?.data?.message || 'Failed to create employee'
                );
                console.error('Create employee error:', error);
            },
        });
    };

    const handleEditEmployee = () => {
        if (currentEmployee) {
            updateUserMutation.mutate(
                {
                    id: currentEmployee.id,
                    data: {
                        email: currentEmployee.email,
                        fullName: currentEmployee.fullName,
                        phoneNumber: currentEmployee.phoneNumber,
                        userRoles: currentEmployee.userRoles.map((role: any) => ({
                            userId: currentEmployee.id,
                            roleId: role.roleId,
                        })),
                    },
                },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ['users'] });
                        success('Success', 'Employee updated successfully');
                        setIsEditDialogOpen(false);
                    },
                    onError: (error: any) => {
                        toastError(
                            'Error',
                            error?.response?.data?.message || 'Failed to update employee'
                        );
                        console.error('Update employee error:', error);
                    },
                }
            );
        }
    };

    const handleDeleteEmployee = () => {
        if (currentEmployee) {
            deleteUserMutation.mutate(currentEmployee.id, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['users'] });
                    success('Success', 'Employee deleted successfully');
                    setIsDeleteDialogOpen(false);
                },
                onError: (error: any) => {
                    toastError(
                        'Error',
                        error?.response?.data?.message || 'Failed to delete employee'
                    );
                    console.error('Delete employee error:', error);
                },
            });
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <PageTitle
                icon={Users}
                title="Employees"
                left={
                    <Button
                        onClick={() => {
                            setIsCreateDialogOpen(true);
                        }}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                }
            />

            <DataTable
                columns={EmployeeTableColumns({
                    onEdit: (employee) => {
                        setCurrentEmployee(employee);
                        setIsEditDialogOpen(true);
                    },
                    onDelete: (employee) => {
                        setCurrentEmployee(employee);
                        setIsDeleteDialogOpen(true);
                    },
                })}
                data={employees}
                tableId="employees-table"
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

            <CreateEmployeeModal
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                newEmployee={newEmployee}
                setNewEmployee={setNewEmployee}
                onSubmit={handleCreateEmployee}
                isLoading={createUserMutation.isPending}
                roles={roles?.data}
            />

            <EditEmployeeModal
                isOpen={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                employee={currentEmployee}
                setEmployee={setCurrentEmployee}
                onSubmit={handleEditEmployee}
                isLoading={updateUserMutation.isPending}
                roles={roles?.data}
            />

            <DeleteEmployeeModal
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                employee={currentEmployee}
                onConfirm={handleDeleteEmployee}
                isLoading={deleteUserMutation.isPending}
            />
        </div >
    );
}

export default function EmployeesPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.SYSTEM_ADMIN]}>
            <Employees />
        </ProtectedRoute>
    );
}