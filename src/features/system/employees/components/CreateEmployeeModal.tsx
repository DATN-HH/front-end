import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserCreateDto } from '@/api/v1/users';
import { RoleResponseDto } from '@/api/v1/auth';

interface CreateEmployeeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    newEmployee: UserCreateDto;
    setNewEmployee: (employee: UserCreateDto) => void;
    onSubmit: () => void;
    isLoading: boolean;
    roles?: RoleResponseDto[];
}

export function CreateEmployeeModal({
    isOpen,
    onOpenChange,
    newEmployee,
    setNewEmployee,
    onSubmit,
    isLoading,
    roles,
}: CreateEmployeeModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
                                    gender: value as 'FEMALE' | 'MALE' | 'OTHER',
                                })
                            }
                        >
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select a gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={newEmployee.userRoles?.[0]?.roleId?.toString()}
                            onValueChange={(value) =>
                                setNewEmployee({
                                    ...newEmployee,
                                    userRoles: [
                                        {
                                            roleId: Number(value),
                                        },
                                    ],
                                })
                            }
                        >
                            <SelectTrigger id="role">
                                <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                                {roles?.map((role) => (
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
                                    status: value as 'ACTIVE' | 'INACTIVE',
                                })
                            }
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ACTIVE">Active</SelectItem>
                                <SelectItem value="INACTIVE">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        className="bg-orange-500 hover:bg-orange-600"
                        onClick={onSubmit}
                        disabled={
                            !newEmployee.fullName ||
                            !newEmployee.email ||
                            !newEmployee.password ||
                            !newEmployee.userRoles?.[0]?.roleId ||
                            isLoading
                        }
                    >
                        Add Employee
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 