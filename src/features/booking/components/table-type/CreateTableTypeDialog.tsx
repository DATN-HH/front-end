'use client';

import { useState } from 'react';

import {
    useCreateTableType,
    validateTableTypeData,
    TableTypeCreateRequest,
} from '@/api/v1/table-types';
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
import { getIconByName } from '@/lib/icon-utils';

import { IconPicker } from './IconPicker';

interface CreateTableTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateTableTypeDialog({
    open,
    onOpenChange,
}: CreateTableTypeDialogProps) {
    const [formData, setFormData] = useState<TableTypeCreateRequest>({
        tableType: '',
        color: '#6B7280',
        icon: 'Table',
        depositForBooking: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createTableTypeMutation = useCreateTableType();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validation = validateTableTypeData(formData);
        if (!validation.isValid) {
            setErrors(validation.errors);
            return;
        }

        try {
            await createTableTypeMutation.mutateAsync(formData);
            onOpenChange(false);
            setFormData({
                tableType: '',
                color: '#6B7280',
                icon: 'Table',
                depositForBooking: 0,
            });
            setErrors({});
        } catch (error) {
            console.error('Error creating table type:', error);
        }
    };

    const handleChange = (
        field: keyof TableTypeCreateRequest,
        value: string | number
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-5 h-5" />;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Table Type</DialogTitle>
                    <DialogDescription>
                        Add a new table type to your restaurant configuration.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tableType">Table Type Name</Label>
                        <Input
                            id="tableType"
                            value={formData.tableType}
                            onChange={(e) =>
                                handleChange('tableType', e.target.value)
                            }
                            placeholder="Enter table type name"
                            className={errors.tableType ? 'border-red-500' : ''}
                        />
                        {errors.tableType && (
                            <p className="text-sm text-red-500">
                                {errors.tableType}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="color"
                                type="color"
                                value={formData.color}
                                onChange={(e) =>
                                    handleChange('color', e.target.value)
                                }
                                className={`w-16 h-10 p-1 ${errors.color ? 'border-red-500' : ''}`}
                            />
                            <Input
                                value={formData.color}
                                onChange={(e) =>
                                    handleChange('color', e.target.value)
                                }
                                placeholder="#000000"
                                className={`flex-1 ${errors.color ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {errors.color && (
                            <p className="text-sm text-red-500">
                                {errors.color}
                            </p>
                        )}
                    </div>

                    <IconPicker
                        value={formData.icon}
                        onChange={(iconName: string) =>
                            handleChange('icon', iconName)
                        }
                        label="Icon"
                        error={errors.icon}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="depositForBooking">
                            Deposit for Booking (VND)
                        </Label>
                        <Input
                            id="depositForBooking"
                            type="number"
                            min="0"
                            max="999999999.99"
                            step="1000"
                            value={formData.depositForBooking}
                            onChange={(e) =>
                                handleChange(
                                    'depositForBooking',
                                    parseFloat(e.target.value) || 0
                                )
                            }
                            placeholder="Enter deposit amount"
                            className={
                                errors.depositForBooking ? 'border-red-500' : ''
                            }
                        />
                        {errors.depositForBooking && (
                            <p className="text-sm text-red-500">
                                {errors.depositForBooking}
                            </p>
                        )}
                    </div>

                    <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Preview</h4>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: formData.color }}
                            >
                                {renderIcon(formData.icon)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-medium break-words">
                                    {formData.tableType || 'Table Type Name'}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Deposit:{' '}
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND',
                                    }).format(formData.depositForBooking)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createTableTypeMutation.isPending}
                        >
                            {createTableTypeMutation.isPending
                                ? 'Creating...'
                                : 'Create Table Type'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
