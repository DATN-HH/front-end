import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import { useUploadImage } from '@/api/v1/images';
import { useAllCategories } from '@/api/v1/menu/categories';
import {
    useUpdateFoodCombo,
    useFoodCombo,
    FoodComboUpdateRequest,
    ComboItemRequest,
} from '@/api/v1/menu/food-combos';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { useCustomToast } from '@/lib/show-toast';

interface FoodComboEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    comboId: number;
    onSuccess?: () => void;
}

export function FoodComboEditModal({
    open,
    onOpenChange,
    comboId,
    onSuccess,
}: FoodComboEditModalProps) {
    const { success, error: showError } = useCustomToast();
    const updateComboMutation = useUpdateFoodCombo();
    const uploadImageMutation = useUploadImage();
    const { data: comboDetail, isLoading: isLoadingDetail } =
        useFoodCombo(comboId);

    // API hooks
    const { data: categories = [] } = useAllCategories();

    // Image state
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        cost: '',
        internalReference: '',
        estimateTime: '',
        categoryId: '',
        canBeSold: true,
        canBePurchased: false,
        availableInPos: true,
        posSequence: '',
        image: '',
    });

    // Combo items state
    const [comboItems, setComboItems] = useState<ComboItemRequest[]>([]);

    // Load combo data
    useEffect(() => {
        if (comboDetail) {
            setFormData({
                name: comboDetail.name,
                description: comboDetail.description || '',
                price: comboDetail.price?.toString() || '',
                cost: comboDetail.cost?.toString() || '',
                internalReference: comboDetail.internalReference || '',
                estimateTime: comboDetail.estimateTime?.toString() || '',
                categoryId: comboDetail.categoryId?.toString() || '',
                canBeSold: comboDetail.canBeSold,
                canBePurchased: comboDetail.canBePurchased,
                availableInPos: comboDetail.availableInPos,
                posSequence: comboDetail.posSequence?.toString() || '',
                image: comboDetail.image || '',
            });
            setComboItems(comboDetail.comboItems || []);
            setImagePreview(comboDetail.image || null);
        }
    }, [comboDetail]);

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name) {
            newErrors.name = 'Combo name is required';
        }

        if (comboItems.length === 0) {
            newErrors.comboItems =
                'At least one product must be added to the combo';
        }

        // Validate each combo item
        comboItems.forEach((item, index) => {
            if (item.quantity <= 0) {
                newErrors[`item_${index}_quantity`] =
                    'Quantity must be greater than 0';
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Image upload handling
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showError('Invalid File Type', 'Please upload an image file.');
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                showError('File Too Large', 'Image must be less than 5MB.');
                return;
            }

            setUploadingImage(true);

            try {
                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);

                // Upload to server
                const uploadResult = await uploadImageMutation.mutateAsync({
                    file,
                    folder: 'food-combos',
                });

                // Update form with image URL
                setFormData((prev) => ({
                    ...prev,
                    image: uploadResult.secureUrl,
                }));
            } catch (err: any) {
                showError(
                    'Upload Failed',
                    err?.response?.data?.message || 'Failed to upload image.'
                );
                // Keep existing image if upload fails
                setImagePreview(formData.image || null);
            } finally {
                setUploadingImage(false);
            }
        },
        [uploadImageMutation, showError, formData.image]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
        },
        maxFiles: 1,
    });

    const removeImage = () => {
        setImagePreview(null);
        setFormData((prev) => ({
            ...prev,
            image: '',
        }));
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            showError(
                'Validation Error',
                'Please fix the errors before saving.'
            );
            return;
        }

        try {
            const requestData: FoodComboUpdateRequest = {
                name: formData.name,
                description: formData.description || undefined,
                price: formData.price ? Number(formData.price) : undefined,
                cost: formData.cost ? Number(formData.cost) : undefined,
                internalReference: formData.internalReference || undefined,
                estimateTime: formData.estimateTime
                    ? Number(formData.estimateTime)
                    : undefined,
                categoryId: formData.categoryId
                    ? Number(formData.categoryId)
                    : undefined,
                canBeSold: formData.canBeSold,
                canBePurchased: formData.canBePurchased,
                availableInPos: formData.availableInPos,
                posSequence: formData.posSequence
                    ? Number(formData.posSequence)
                    : undefined,
                comboItems,
                image: formData.image || undefined,
            };

            await updateComboMutation.mutateAsync({
                id: comboId,
                data: requestData,
            });

            success(
                'Food Combo Updated',
                `${formData.name} has been updated successfully.`
            );

            onOpenChange(false);
            onSuccess?.();
        } catch (err: any) {
            showError(
                'Error',
                err?.response?.data?.message || 'Failed to update food combo.'
            );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Food Combo</DialogTitle>
                    <DialogDescription>
                        Update food combo information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">
                                    Combo Name{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    placeholder="Enter combo name"
                                    className={
                                        errors.name ? 'border-red-500' : ''
                                    }
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">
                                        {errors.name}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.categoryId}
                                    onValueChange={(value) =>
                                        setFormData({
                                            ...formData,
                                            categoryId: value,
                                        })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id.toString()}
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                placeholder="Enter combo description"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <Label>Combo Image</Label>
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                                    isDragActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border'
                                }`}
                            >
                                <input {...getInputProps()} />
                                {uploadingImage ? (
                                    <div className="flex flex-col items-center justify-center h-[200px]">
                                        <div className="loading loading-spinner loading-md"></div>
                                        <p className="mt-2">
                                            Uploading image...
                                        </p>
                                    </div>
                                ) : imagePreview ? (
                                    <div className="relative h-[200px] w-full">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-contain rounded-lg"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="absolute top-2 right-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeImage();
                                            }}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[200px]">
                                        <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">
                                            Drag & drop an image here, or click
                                            to select
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            (Max size: 5MB, Formats: JPG, PNG,
                                            GIF, WebP)
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            price: e.target.value,
                                        })
                                    }
                                    placeholder="Enter price"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="cost">Cost</Label>
                                <Input
                                    id="cost"
                                    type="number"
                                    value={formData.cost}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            cost: e.target.value,
                                        })
                                    }
                                    placeholder="Enter cost"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="internalReference">
                                    Internal Reference
                                </Label>
                                <Input
                                    id="internalReference"
                                    value={formData.internalReference}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            internalReference: e.target.value,
                                        })
                                    }
                                    placeholder="Enter internal reference"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="estimateTime">
                                    Estimate Time (minutes)
                                </Label>
                                <Input
                                    id="estimateTime"
                                    type="number"
                                    value={formData.estimateTime}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            estimateTime: e.target.value,
                                        })
                                    }
                                    placeholder="Enter estimate time"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canBeSold"
                                    checked={formData.canBeSold}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            canBeSold: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="canBeSold">Can be sold</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="canBePurchased"
                                    checked={formData.canBePurchased}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            canBePurchased: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="canBePurchased">
                                    Can be purchased
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="availableInPos"
                                    checked={formData.availableInPos}
                                    onCheckedChange={(checked) =>
                                        setFormData({
                                            ...formData,
                                            availableInPos: checked as boolean,
                                        })
                                    }
                                />
                                <Label htmlFor="availableInPos">
                                    Available in POS
                                </Label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="posSequence">POS Sequence</Label>
                            <Input
                                id="posSequence"
                                type="number"
                                value={formData.posSequence}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        posSequence: e.target.value,
                                    })
                                }
                                placeholder="Enter POS sequence"
                            />
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
                        onClick={handleSubmit}
                        disabled={updateComboMutation.isPending}
                    >
                        {updateComboMutation.isPending
                            ? 'Saving...'
                            : 'Save Changes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
