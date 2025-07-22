'use client';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface FloorFiltersProps {
    includeDeleted: boolean;
    onIncludeDeletedChange: (value: boolean) => void;
    onAddFloor: () => void;
    branchName?: string;
    className?: string;
}

export function FloorFilters({
    includeDeleted,
    onIncludeDeletedChange,
    onAddFloor,
    branchName,
    className,
}: FloorFiltersProps) {
    return (
        <div
            className={`flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${className}`}
        >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Branch:</Label>
                    <span className="text-sm text-muted-foreground">
                        {branchName || 'No branch selected'}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Switch
                        id="include-deleted"
                        checked={includeDeleted}
                        onCheckedChange={onIncludeDeletedChange}
                    />
                    <Label htmlFor="include-deleted" className="text-sm">
                        Include deleted
                    </Label>
                </div>
            </div>

            <Button onClick={onAddFloor} className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Floor</span>
                <span className="sm:hidden">Add</span>
            </Button>
        </div>
    );
}
