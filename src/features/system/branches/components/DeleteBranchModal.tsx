import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { BranchResponseDto } from '@/api/v1/branches';

interface DeleteBranchModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    branch: BranchResponseDto | null;
    onConfirm: () => void;
    isLoading: boolean;
}

export function DeleteBranchModal({
    isOpen,
    onOpenChange,
    branch,
    onConfirm,
    isLoading,
}: DeleteBranchModalProps) {
    if (!branch) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Branch</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this branch? This
                        action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <div className="flex items-center gap-3">
                        <div>
                            <p className="font-medium">
                                {branch.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {branch.address}
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