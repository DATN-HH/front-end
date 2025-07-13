'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { TableTypeResponse, formatCurrency } from '@/api/v1/table-types';
import { getIconByName } from '@/lib/icon-utils';

interface DeleteTableTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tableType: TableTypeResponse | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function DeleteTableTypeDialog({
    open,
    onOpenChange,
    tableType,
    onConfirm,
    isLoading = false
}: DeleteTableTypeDialogProps) {
    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-5 h-5 text-white" />;
    };

    if (!tableType) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Table Type
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this table type? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <strong>Warning:</strong> Deleting this table type will affect all tables currently using this type.
                            Make sure to update or reassign existing tables before deletion.
                        </AlertDescription>
                    </Alert>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Table Type to Delete:</h4>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                                style={{ backgroundColor: tableType.color }}
                            >
                                {renderIcon(tableType.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium break-words">{tableType.tableType}</div>
                                <div className="text-sm text-gray-600">
                                    Deposit: {formatCurrency(tableType.depositForBooking)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Icon: {tableType.icon} | Color: {tableType.color}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? 'Deleting...' : 'Delete Table Type'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 