'use client';

import { Loader2, Tag, Palette } from 'lucide-react';
import { useState, useEffect } from 'react';

import {
    useUpdateTag,
    ProductTagUpdateRequest,
    ProductTagResponse,
    TagStatus,
} from '@/api/v1/menu/product-tags';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface TagEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tag: ProductTagResponse | null;
}

const DEFAULT_COLORS = [
    '#4CAF50',
    '#2E7D32',
    '#FF9800',
    '#F44336',
    '#2196F3',
    '#9C27B0',
    '#FF5722',
    '#8BC34A',
    '#FFEB3B',
    '#00BCD4',
    '#795548',
    '#607D8B',
    '#E91E63',
    '#3F51B5',
    '#009688',
];

export function TagEditModal({ open, onOpenChange, tag }: TagEditModalProps) {
    const { toast } = useToast();
    const updateTagMutation = useUpdateTag();

    // Form state
    const [formData, setFormData] = useState<ProductTagUpdateRequest>({
        name: '',
        color: '',
        description: '',
        status: 'ACTIVE',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Reset form when tag changes
    useEffect(() => {
        if (tag) {
            setFormData({
                name: tag.name,
                color: tag.color || '',
                description: tag.description || '',
                status: tag.status,
            });
            setErrors({});
        }
    }, [tag]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!tag) return;

        // Basic validation
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Tag name is required';
        }

        if (formData.color && !/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
            newErrors.color = 'Color must be a valid hex color (e.g., #FF5733)';
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length > 0) {
            return;
        }

        try {
            await updateTagMutation.mutateAsync({
                id: tag.id,
                data: {
                    name: formData.name?.trim(),
                    color: formData.color || undefined,
                    description: formData.description || undefined,
                    status: formData.status,
                },
            });

            toast({
                title: 'Success',
                description: 'Tag updated successfully.',
            });

            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message ||
                    'Failed to update tag. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleInputChange = (
        field: keyof ProductTagUpdateRequest,
        value: string | TagStatus
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const handleColorSelect = (color: string) => {
        handleInputChange('color', color);
    };

    if (!tag) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Tag className="h-5 w-5" />
                        <span>Edit Tag</span>
                    </DialogTitle>
                    <DialogDescription>
                        Update the tag information and settings.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                        {/* Tag Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Tag Name *</Label>
                            <Input
                                id="name"
                                placeholder="Enter tag name..."
                                value={formData.name}
                                onChange={(e) =>
                                    handleInputChange('name', e.target.value)
                                }
                                className={errors.name ? 'border-red-500' : ''}
                            />
                            {errors.name && (
                                <p className="text-sm text-red-500">
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value: TagStatus) =>
                                    handleInputChange('status', value)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ACTIVE">
                                        Active
                                    </SelectItem>
                                    <SelectItem value="INACTIVE">
                                        Inactive
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Color Selection */}
                        <div className="space-y-3">
                            <Label className="flex items-center space-x-2">
                                <Palette className="h-4 w-4" />
                                <span>Color (Optional)</span>
                            </Label>

                            {/* Predefined Colors */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    Choose a predefined color:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {DEFAULT_COLORS.map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform ${
                                                formData.color === color
                                                    ? 'border-gray-800'
                                                    : 'border-gray-300'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() =>
                                                handleColorSelect(color)
                                            }
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Custom Color Input */}
                            <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                    Or enter a custom hex color:
                                </p>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        placeholder="#FF5733"
                                        value={formData.color}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'color',
                                                e.target.value
                                            )
                                        }
                                        className={`w-32 ${errors.color ? 'border-red-500' : ''}`}
                                    />
                                    {formData.color && (
                                        <div
                                            className="w-8 h-8 rounded border border-gray-300"
                                            style={{
                                                backgroundColor: formData.color,
                                            }}
                                        />
                                    )}
                                </div>
                                {errors.color && (
                                    <p className="text-sm text-red-500">
                                        {errors.color}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">
                                Description (Optional)
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Enter tag description..."
                                value={formData.description}
                                onChange={(e) =>
                                    handleInputChange(
                                        'description',
                                        e.target.value
                                    )
                                }
                                rows={3}
                            />
                        </div>

                        {/* Usage Info */}
                        {tag.productCount !== undefined && (
                            <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Usage:</strong> This tag is
                                    currently used by {tag.productCount}{' '}
                                    product(s).
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={updateTagMutation.isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={updateTagMutation.isPending}
                        >
                            {updateTagMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Update Tag
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
