import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { UserResponseDto } from '@/api/v1/users';

interface DeleteEmployeeModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    employee: UserResponseDto | null;
    onConfirm: () => void;
    isLoading: boolean;
}

export function DeleteEmployeeModal({
    isOpen,
    onOpenChange,
    employee,
    onConfirm,
    isLoading,
}: DeleteEmployeeModalProps) {
    if (!employee) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this employee? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium">
                                {employee.fullName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {employee.email}
                            </p>
                        </div>
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
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 