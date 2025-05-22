'use client';

import { useState } from 'react';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Edit,
    MoreHorizontal,
    Plus,
    Search,
    Trash,
    Calendar,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Sample data for job roles
const jobRoles = [
    { id: 1, name: 'Head Chef', color: '#FF5733' },
    { id: 2, name: 'Sous Chef', color: '#33FF57' },
    { id: 3, name: 'Waiter', color: '#3357FF' },
    { id: 4, name: 'Bartender', color: '#F033FF' },
    { id: 5, name: 'Host/Hostess', color: '#FF33A8' },
];

// Sample data for employees
const initialEmployees = [
    {
        id: 1,
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '555-123-4567',
        roleId: 3,
        status: 'active',
        avatar: '/avatars/john.png',
    },
    {
        id: 2,
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '555-234-5678',
        roleId: 5,
        status: 'active',
        avatar: '/avatars/sarah.png',
    },
    {
        id: 3,
        name: 'Michael Brown',
        email: 'michael.brown@example.com',
        phone: '555-345-6789',
        roleId: 1,
        status: 'active',
        avatar: '/avatars/michael.png',
    },
    {
        id: 4,
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        phone: '555-456-7890',
        roleId: 2,
        status: 'active',
        avatar: '/avatars/emily.png',
    },
    {
        id: 5,
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        phone: '555-567-8901',
        roleId: 4,
        status: 'active',
        avatar: '/avatars/david.png',
    },
    {
        id: 6,
        name: 'Jessica Taylor',
        email: 'jessica.taylor@example.com',
        phone: '555-678-9012',
        roleId: 3,
        status: 'inactive',
        avatar: '/avatars/jessica.png',
    },
    {
        id: 7,
        name: 'Daniel Martinez',
        email: 'daniel.martinez@example.com',
        phone: '555-789-0123',
        roleId: 2,
        status: 'active',
        avatar: '/avatars/daniel.png',
    },
    {
        id: 8,
        name: 'Olivia Anderson',
        email: 'olivia.anderson@example.com',
        phone: '555-890-1234',
        roleId: 3,
        status: 'active',
        avatar: '/avatars/olivia.png',
    },
];

export default function EmployeesPage() {
    const [employees, setEmployees] = useState(initialEmployees);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isUnavailabilityDialogOpen, setIsUnavailabilityDialogOpen] =
        useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        phone: '',
        roleId: '',
        status: 'active',
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Filter employees based on search query and filters
    const filteredEmployees = employees.filter((employee) => {
        const matchesSearch =
            employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.phone.includes(searchQuery);

        const matchesRole = filterRole
            ? employee.roleId === Number.parseInt(filterRole)
            : true;
        const matchesStatus = filterStatus
            ? employee.status === filterStatus
            : true;

        return matchesSearch && matchesRole && matchesStatus;
    });

    // Create a new employee
    const handleCreateEmployee = () => {
        const id = Math.max(0, ...employees.map((e) => e.id)) + 1;
        const roleId = Number.parseInt(newEmployee.roleId);
        setEmployees([
            ...employees,
            {
                id,
                ...newEmployee,
                roleId,
                avatar: '/placeholder.svg?height=40&width=40',
            },
        ]);
        setNewEmployee({
            name: '',
            email: '',
            phone: '',
            roleId: '',
            status: 'active',
        });
        setIsCreateDialogOpen(false);
    };

    // Edit an existing employee
    const handleEditEmployee = () => {
        setEmployees(
            employees.map((employee) =>
                employee.id === currentEmployee.id ? currentEmployee : employee
            )
        );
        setIsEditDialogOpen(false);
    };

    // Delete an employee
    const handleDeleteEmployee = () => {
        setEmployees(
            employees.filter((employee) => employee.id !== currentEmployee.id)
        );
        setIsDeleteDialogOpen(false);
    };

    // Get role name by ID
    const getRoleName = (roleId: number) => {
        return jobRoles.find((role) => role.id === roleId)?.name || '';
    };

    // Get role color by ID
    const getRoleColor = (roleId: number) => {
        return jobRoles.find((role) => role.id === roleId)?.color || '#000000';
    };

    // Get initials from name
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                <p className="text-muted-foreground">
                    Manage your restaurant staff
                </p>
            </div>

            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search employees..."
                            className="w-full pl-8"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Select value={filterRole} onValueChange={setFilterRole}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            {jobRoles.map((role) => (
                                <SelectItem
                                    key={role.id}
                                    value={role.id.toString()}
                                >
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filterStatus}
                        onValueChange={setFilterStatus}
                    >
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Dialog
                    open={isCreateDialogOpen}
                    onOpenChange={setIsCreateDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button className="bg-orange-500 hover:bg-orange-600">
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
                                    id="name"
                                    placeholder="John Smith"
                                    value={newEmployee.name}
                                    onChange={(e) =>
                                        setNewEmployee({
                                            ...newEmployee,
                                            name: e.target.value,
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
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input
                                    id="phone"
                                    placeholder="555-123-4567"
                                    value={newEmployee.phone}
                                    onChange={(e) =>
                                        setNewEmployee({
                                            ...newEmployee,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="role">Job Role</Label>
                                <Select
                                    value={newEmployee.roleId}
                                    onValueChange={(value) =>
                                        setNewEmployee({
                                            ...newEmployee,
                                            roleId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobRoles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id.toString()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
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
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
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
                                disabled={
                                    !newEmployee.name ||
                                    !newEmployee.email ||
                                    !newEmployee.roleId
                                }
                            >
                                Add Employee
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employees List</CardTitle>
                    <CardDescription>
                        View and manage all employees in your restaurant
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Email
                                </TableHead>
                                <TableHead className="hidden md:table-cell">
                                    Phone
                                </TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        No employees found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TableRow key={employee.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={
                                                            employee.avatar ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt={employee.name}
                                                    />
                                                    <AvatarFallback>
                                                        {getInitials(
                                                            employee.name
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">
                                                        {employee.name}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground md:hidden">
                                                        {employee.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            getRoleColor(
                                                                employee.roleId
                                                            ),
                                                    }}
                                                />
                                                <span>
                                                    {getRoleName(
                                                        employee.roleId
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {employee.email}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            {employee.phone}
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs ${
                                                    employee.status === 'active'
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}
                                            >
                                                {employee.status.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setCurrentEmployee(
                                                                employee
                                                            );
                                                            setIsEditDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => {
                                                            setCurrentEmployee(
                                                                employee
                                                            );
                                                            setIsUnavailabilityDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <Calendar className="mr-2 h-4 w-4" />
                                                        Manage Unavailability
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-red-600"
                                                        onClick={() => {
                                                            setCurrentEmployee(
                                                                employee
                                                            );
                                                            setIsDeleteDialogOpen(
                                                                true
                                                            );
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Employee Dialog */}
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
                                    value={currentEmployee.name}
                                    onChange={(e) =>
                                        setCurrentEmployee({
                                            ...currentEmployee,
                                            name: e.target.value,
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
                                    value={currentEmployee.phone}
                                    onChange={(e) =>
                                        setCurrentEmployee({
                                            ...currentEmployee,
                                            phone: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-role">Job Role</Label>
                                <Select
                                    value={currentEmployee.roleId.toString()}
                                    onValueChange={(value) =>
                                        setCurrentEmployee({
                                            ...currentEmployee,
                                            roleId: Number.parseInt(value),
                                        })
                                    }
                                >
                                    <SelectTrigger id="edit-role">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {jobRoles.map((role) => (
                                            <SelectItem
                                                key={role.id}
                                                value={role.id.toString()}
                                            >
                                                {role.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-status">Status</Label>
                                <Select
                                    value={currentEmployee.status}
                                    onValueChange={(value) =>
                                        setCurrentEmployee({
                                            ...currentEmployee,
                                            status: value,
                                        })
                                    }
                                >
                                    <SelectTrigger id="edit-status">
                                        <SelectValue placeholder="Select a status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">
                                            Active
                                        </SelectItem>
                                        <SelectItem value="inactive">
                                            Inactive
                                        </SelectItem>
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
                            onClick={handleEditEmployee}
                            disabled={
                                !currentEmployee?.name ||
                                !currentEmployee?.email
                            }
                        >
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Employee Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            >
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
                                <Avatar>
                                    <AvatarImage
                                        src={
                                            currentEmployee.avatar ||
                                            '/placeholder.svg'
                                        }
                                        alt={currentEmployee.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(currentEmployee.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">
                                        {currentEmployee.name}
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
                            onClick={handleDeleteEmployee}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Manage Unavailability Dialog */}
            <Dialog
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
            </Dialog>
        </div>
    );
}
