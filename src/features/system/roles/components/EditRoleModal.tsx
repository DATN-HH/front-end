import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { RoleResponseDto } from '@/api/v1/auth';
import { RoleName } from '@/api/v1';

interface EditRoleModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    role: RoleResponseDto | null;
    setRole: (role: RoleResponseDto | null) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export function EditRoleModal({
    isOpen,
    onOpenChange,
    role,
    setRole,
    onSubmit,
    isLoading,
}: EditRoleModalProps) {
    if (!role) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Role</DialogTitle>
                    <DialogDescription>
                        Edit role details and permissions
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={role.name}
                            onChange={(e) =>
                                setRole({
                                    ...role,
                                    name: e.target.value as RoleName,
                                })
                            }
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="description"
                            value={role.description}
                            onChange={(e) =>
                                setRole({
                                    ...role,
                                    description: e.target.value,
                                })
                            }
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="color" className="text-right">
                            Color
                        </Label>
                        <Input
                            id="color"
                            type="color"
                            value={role.hexColor}
                            onChange={(e) =>
                                setRole({
                                    ...role,
                                    hexColor: e.target.value,
                                })
                            }
                            className="col-span-3"
                        />
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
                        onClick={onSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            'Update'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 