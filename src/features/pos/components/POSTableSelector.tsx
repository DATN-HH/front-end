'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Table {
    id: number;
    name: string;
    status: string;
    floorName?: string;
    floorId?: number;
}

interface POSTableSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    tables: Table[];
    selectedTables: Table[];
    onTablesChange: (tables: Table[]) => void;
    disabled?: boolean;
    isEditMode?: boolean; // Allow selecting occupied tables in edit mode
}

export function POSTableSelector({
    isOpen,
    onClose,
    tables,
    selectedTables,
    onTablesChange,
    disabled = false,
    isEditMode = false,
}: POSTableSelectorProps) {
    const handleTableClick = (table: Table) => {
        if (disabled) return;

        const isSelected = selectedTables.some((t) => t.id === table.id);
        if (isSelected) {
            onTablesChange(selectedTables.filter((t) => t.id !== table.id));
        } else {
            onTablesChange([...selectedTables, table]);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Select Tables</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[400px] pr-4">
                    <div className="grid grid-cols-4 gap-4">
                        {tables.map((table) => {
                            const isSelected = selectedTables.some(
                                (t) => t.id === table.id
                            );
                            const isAvailable = table.status === 'AVAILABLE';
                            const canSelect =
                                isAvailable || isEditMode || isSelected;

                            return (
                                <Button
                                    key={table.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={cn(
                                        'h-24 flex flex-col items-center justify-center gap-2',
                                        !canSelect && 'opacity-50',
                                        disabled && 'cursor-not-allowed'
                                    )}
                                    onClick={() => handleTableClick(table)}
                                    disabled={disabled || !canSelect}
                                >
                                    <span className="text-lg font-semibold">
                                        {table.name}
                                    </span>
                                    {table.floorName && (
                                        <span className="text-xs text-muted-foreground">
                                            {table.floorName}
                                        </span>
                                    )}
                                    <span className="text-sm text-muted-foreground">
                                        {table.status}
                                    </span>
                                </Button>
                            );
                        })}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
