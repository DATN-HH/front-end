'use client';

import { FloorResponse } from '@/api/v1/floors';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteFloorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
    floor: FloorResponse | null;
}

export function DeleteFloorDialog({
    isOpen,
    onClose,
    onConfirm,
    isLoading,
    floor,
}: DeleteFloorDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
            onClose();
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Floor</AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-2">
                            <p>
                                Are you sure you want to delete "{floor?.name}"?
                            </p>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone and will also
                                remove the floor layout image.
                            </p>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <AlertDialogCancel
                        disabled={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-600"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
