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
import { RoleResponseDto } from '@/api/v1/auth';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    employee: any | null;
    setEmployee: (employee: any) => void;
    onSubmit: () => void;
    isLoading: boolean;
    roles?: RoleResponseDto[];
}

export function EditEmployeeModal({
    isOpen,
    onOpenChange,
    employee,
    setEmployee,
    onSubmit,
    isLoading,
    roles,
}: EditEmployeeModalProps) {
    if (!employee) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee information
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="edit-name">Full Name</Label>
                        <Input
                            id="edit-name"
                            value={employee.fullName}
                            onChange={(e) =>
                                setEmployee({
                                    ...employee,
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
                            value={employee.email}
                            onChange={(e) =>
                                setEmployee({
                                    ...employee,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-phone">Phone Number</Label>
                        <Input
                            id="edit-phone"
                            value={employee.phoneNumber}
                            onChange={(e) =>
                                setEmployee({
                                    ...employee,
                                    phoneNumber: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-birthdate">Birthdate</Label>
                        <Input
                            id="edit-birthdate"
                            type="date"
                            value={employee.birthdate}
                            onChange={(e) =>
                                setEmployee({
                                    ...employee,
                                    birthdate: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="edit-role">Job Role</Label>
                        <Select
                            value={employee.userRoles[0]?.roleId.toString()}
                            onValueChange={(value) =>
                                setEmployee({
                                    ...employee,
                                    userRoles: [
                                        {
                                            userId: employee.id,
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
                            !employee.fullName ||
                            !employee.email ||
                            !employee.userRoles[0]?.roleId ||
                            isLoading
                        }
                    >
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 