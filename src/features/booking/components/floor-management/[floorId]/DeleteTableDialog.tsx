'use client';

import { AlertTriangle, Users } from 'lucide-react';

import { TableResponse } from '@/api/v1/tables';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';

interface DeleteTableDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    table: TableResponse | null;
    isLoading: boolean;
}

export function DeleteTableDialog({
    isOpen,
    onClose,
    onConfirm,
    table,
    isLoading,
}: DeleteTableDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        onClose();
    };

    if (!table) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Confirm Delete Table
                    </DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The table will be
                        permanently deleted from the system.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Table Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">
                            Table Information
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Table Name:
                                </span>
                                <span className="font-medium">
                                    {table.tableName}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Capacity:</span>
                                <span className="flex items-center">
                                    <Users className="w-4 h-4 mr-1" />
                                    {table.capacity} people
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">
                                    Table Type:
                                </span>
                                <span>{table.tableType.tableType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Status:</span>
                                <span
                                    className={`px-2 py-1 rounded text-xs font-medium ${
                                        table.status === 'ACTIVE'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                    }`}
                                >
                                    {table.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-red-900 mb-1">
                                    Warning
                                </h4>
                                <p className="text-sm text-red-800">
                                    This table will be permanently deleted and
                                    cannot be recovered. Please make sure you
                                    want to continue.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleConfirm}
                            disabled={isLoading}
                            className="flex-1 sm:flex-none"
                        >
                            {isLoading ? 'Deleting...' : 'Delete Table'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
