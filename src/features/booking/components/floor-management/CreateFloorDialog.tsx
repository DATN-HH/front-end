'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface CreateFloorDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        order?: number;
        image?: File;
    }) => Promise<void>;
    isLoading: boolean;
    branchName?: string;
}

export function CreateFloorDialog({
    isOpen,
    onClose,
    onSubmit,
    isLoading,
    branchName,
}: CreateFloorDialogProps) {
    const [formData, setFormData] = useState({
        name: '',
        order: undefined as number | undefined,
        image: undefined as File | undefined,
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            await onSubmit({
                name: formData.name.trim(),
                order: formData.order,
                image: formData.image,
            });
            handleClose();
        } catch (error) {
            // Error handling is done in parent component
        }
    };

    const handleClose = () => {
        if (isLoading) return;
        setFormData({ name: '', order: undefined, image: undefined });
        setImagePreview(null);
        onClose();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setFormData((prev) => ({ ...prev, image: file }));

        // 🆕 NEW: Create image preview
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    const handleClearImage = () => {
        setFormData((prev) => ({ ...prev, image: undefined }));
        setImagePreview(null);
        // Reset file input
        const fileInput = document.getElementById(
            'create-image'
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = '';
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Create New Floor</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label
                            htmlFor="create-branch"
                            className="text-sm font-medium"
                        >
                            Branch
                        </Label>
                        <div className="p-2 bg-muted rounded-md">
                            <span className="text-sm">
                                {branchName || 'No branch selected'}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="create-name"
                            className="text-sm font-medium"
                        >
                            Floor Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="create-name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    name: e.target.value,
                                }))
                            }
                            placeholder="e.g., Ground Floor, 1st Floor..."
                            required
                            disabled={isLoading}
                        />
                    </div>

                    {/* 🆕 NEW: Order field */}
                    <div className="space-y-2">
                        <Label
                            htmlFor="create-order"
                            className="text-sm font-medium"
                        >
                            Display Order
                        </Label>
                        <Input
                            id="create-order"
                            type="number"
                            value={formData.order?.toString() || ''}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    order: e.target.value
                                        ? parseInt(e.target.value)
                                        : undefined,
                                }))
                            }
                            placeholder="1, 2, 3..."
                            min="1"
                            disabled={isLoading}
                        />
                        <p className="text-xs text-muted-foreground">
                            Optional. Floors will be displayed in this order.
                            Lower numbers appear first.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="create-image"
                            className="text-sm font-medium"
                        >
                            Floor Layout Image
                        </Label>

                        {/* 🆕 NEW: Image preview */}
                        {imagePreview && (
                            <div className="p-2 border rounded-md bg-muted/50">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-16 h-16 object-cover rounded"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        Preview
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Input
                                    id="create-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    disabled={isLoading}
                                    className="flex-1"
                                />
                                {formData.image && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearImage}
                                        disabled={isLoading}
                                        className="h-10 w-10 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                            {formData.image && (
                                <div className="text-sm text-muted-foreground">
                                    Selected: {formData.image.name}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Optional. Max 10MB. Formats: JPG, PNG, GIF, etc.
                        </p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
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
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 sm:flex-none"
                        >
                            {isLoading ? 'Creating...' : 'Create Floor'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
