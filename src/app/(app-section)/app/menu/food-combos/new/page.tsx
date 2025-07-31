'use client';

import {
    ArrowLeft,
    Save,
    Plus,
    Search,
    X,
    Package,
    ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import { useUploadImage } from '@/api/v1/images';
import { useAllCategories } from '@/api/v1/menu/categories';
import {
    useCreateFoodCombo,
    FoodComboCreateRequest,
    ComboItemRequest,
} from '@/api/v1/menu/food-combos';
import { useAllProducts } from '@/api/v1/menu/products';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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

interface ProductSelectionModal {
    isOpen: boolean;
    products: any[];
    searchTerm: string;
    selectedProducts: Set<number>;
}

export default function NewFoodComboPage() {
    const router = useRouter();
    const { success, error: showError } = useCustomToast();
    const createComboMutation = useCreateFoodCombo();
    const uploadImageMutation = useUploadImage();

    // API hooks
    const { data: categories = [] } = useAllCategories();
    const { data: products = [] } = useAllProducts();

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
        image: '', // Add image field
    });

    // Combo items state
    const [comboItems, setComboItems] = useState<ComboItemRequest[]>([]);

    // Product selection modal state
    const [productModal, setProductModal] = useState<ProductSelectionModal>({
        isOpen: false,
        products: [],
        searchTerm: '',
        selectedProducts: new Set(),
    });

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
                setImagePreview(null);
                setFormData((prev) => ({
                    ...prev,
                    image: '',
                }));
            } finally {
                setUploadingImage(false);
            }
        },
        [uploadImageMutation]
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

    const handleSubmit = async (saveAndNew = false) => {
        if (!validateForm()) {
            showError(
                'Validation Error',
                'Please fix the errors before saving.'
            );
            return;
        }

        try {
            const requestData: FoodComboCreateRequest = {
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
                image: formData.image || undefined, // Add image to request
            };

            await createComboMutation.mutateAsync({
                data: requestData,
                saveAndNew,
            });

            success(
                'Food Combo Created',
                `${formData.name} has been created successfully.`
            );

            if (saveAndNew) {
                // Reset form
                setFormData({
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
                setComboItems([]);
                setImagePreview(null);
                setErrors({});
                success(
                    'Ready for next combo',
                    'Form has been reset. You can create another combo.'
                );
            } else {
                router.push('/app/menu/food-combos');
            }
        } catch (err: any) {
            showError(
                'Error',
                err?.response?.data?.message || 'Failed to create food combo.'
            );
        }
    };

    const openProductModal = () => {
        setProductModal({
            isOpen: true,
            products: products.filter(
                (p) => p.status === 'ACTIVE' && p.canBeSold
            ),
            searchTerm: '',
            selectedProducts: new Set(),
        });
    };

    const closeProductModal = () => {
        setProductModal({
            isOpen: false,
            products: [],
            searchTerm: '',
            selectedProducts: new Set(),
        });
    };

    const handleProductSearch = (searchTerm: string) => {
        const trimmedSearchTerm = searchTerm.trim().toLowerCase();
        const filtered = products.filter(
            (p) =>
                p.status === 'ACTIVE' &&
                p.canBeSold &&
                (p.name.toLowerCase().includes(trimmedSearchTerm) ||
                    p.internalReference
                        ?.toLowerCase()
                        .includes(trimmedSearchTerm))
        );

        setProductModal((prev) => ({
            ...prev,
            searchTerm,
            products: filtered,
        }));
    };

    const addProductsToCombo = () => {
        const selectedProductIds = Array.from(productModal.selectedProducts);
        const newItems: ComboItemRequest[] = selectedProductIds.map(
            (productId, index) => {
                const product = products.find((p) => p.id === productId);
                return {
                    productId,
                    quantity: 1,
                    unitPrice: product?.price,
                    unitCost: product?.cost,
                    sequenceOrder: comboItems.length + index,
                    isOptional: false,
                    isSubstitutable: false,
                };
            }
        );

        setComboItems((prev) => [...prev, ...newItems]);
        closeProductModal();

        success(
            'Products Added',
            `${newItems.length} product(s) added to the combo.`
        );
    };

    const updateComboItem = (
        index: number,
        field: keyof ComboItemRequest,
        value: any
    ) => {
        setComboItems((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        );
    };

    const removeComboItem = (index: number) => {
        setComboItems((prev) => prev.filter((_, i) => i !== index));
    };

    const getProductName = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        return product?.name || `Product ${productId}`;
    };

    const getProductImage = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        return product?.image;
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '0';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Link href="/app/menu/food-combos">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Create New Food Combo
                    </h1>
                    <p className="text-muted-foreground">
                        Create a combination of products to sell as a bundle
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>
                            Enter basic combo information
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
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
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="categoryId">Category</Label>
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
                                        <SelectValue placeholder="Select category" />
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
                            <div className="space-y-2">
                                <Label htmlFor="price">
                                    Override Price (VND)
                                </Label>
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
                                    placeholder="Auto-calculated"
                                />
                                <p className="text-xs text-gray-500">
                                    Leave empty to auto-calculate from items
                                </p>
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
                                    placeholder="0"
                                />
                            </div>
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
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="loading loading-spinner loading-md"></div>
                                        <p className="mt-2">
                                            Uploading image...
                                        </p>
                                    </div>
                                ) : imagePreview ? (
                                    <div className="relative w-full aspect-video">
                                        <Image
                                            src={imagePreview}
                                            alt="Preview"
                                            fill
                                            className="object-cover rounded-lg"
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
                                    <div className="flex flex-col items-center justify-center py-4">
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
                    </CardContent>
                </Card>

                {/* Combo Items */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Combo Items</CardTitle>
                                <CardDescription>
                                    Add products to this combo
                                </CardDescription>
                            </div>
                            <Button onClick={openProductModal}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Products
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {errors.comboItems && (
                            <p className="text-sm text-red-500">
                                {errors.comboItems}
                            </p>
                        )}

                        {comboItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                <p>No products added yet</p>
                                <p className="text-sm">
                                    Click "Add Products" to get started
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {comboItems.map((item, index) => {
                                    const productImage = getProductImage(
                                        item.productId
                                    );
                                    const productName = getProductName(
                                        item.productId
                                    );

                                    return (
                                        <div
                                            key={index}
                                            className="border rounded-lg p-4"
                                        >
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    {productImage ? (
                                                        <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={
                                                                    productImage
                                                                }
                                                                alt={
                                                                    productName
                                                                }
                                                                fill
                                                                className="object-cover"
                                                                sizes="48px"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                                                            <Package className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="flex-1">
                                                    <h4 className="font-medium">
                                                        {productName}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Unit Price:{' '}
                                                        {formatCurrency(
                                                            item.unitPrice
                                                        )}
                                                    </p>
                                                </div>

                                                {/* Quantity */}
                                                <div className="flex items-center space-x-2">
                                                    <Label
                                                        htmlFor={`quantity-${index}`}
                                                        className="text-sm"
                                                    >
                                                        Qty:
                                                    </Label>
                                                    <Input
                                                        id={`quantity-${index}`}
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateComboItem(
                                                                index,
                                                                'quantity',
                                                                Number(
                                                                    e.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                        className="w-20"
                                                    />
                                                </div>

                                                {/* Options */}
                                                <div className="flex items-center space-x-4">
                                                    <label className="flex items-center space-x-1">
                                                        <Checkbox
                                                            checked={
                                                                item.isOptional
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                updateComboItem(
                                                                    index,
                                                                    'isOptional',
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            Optional
                                                        </span>
                                                    </label>

                                                    <label className="flex items-center space-x-1">
                                                        <Checkbox
                                                            checked={
                                                                item.isSubstitutable
                                                            }
                                                            onCheckedChange={(
                                                                checked
                                                            ) =>
                                                                updateComboItem(
                                                                    index,
                                                                    'isSubstitutable',
                                                                    checked
                                                                )
                                                            }
                                                        />
                                                        <span className="text-sm">
                                                            Substitutable
                                                        </span>
                                                    </label>
                                                </div>

                                                {/* Remove Button */}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        removeComboItem(index)
                                                    }
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            {/* Notes */}
                                            <div className="mt-3">
                                                <Label
                                                    htmlFor={`notes-${index}`}
                                                    className="text-sm"
                                                >
                                                    Notes (optional)
                                                </Label>
                                                <Input
                                                    id={`notes-${index}`}
                                                    value={item.notes || ''}
                                                    onChange={(e) =>
                                                        updateComboItem(
                                                            index,
                                                            'notes',
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Add any special notes for this item"
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                        <CardDescription>
                            Set up combo options and availability
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="font-medium">Sales Options</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="canBeSold"
                                            checked={formData.canBeSold}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    canBeSold:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="canBeSold">
                                            Can be sold
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="canBePurchased"
                                            checked={formData.canBePurchased}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    canBePurchased:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="canBePurchased">
                                            Can be purchased
                                        </Label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-medium">
                                    POS Configuration
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="availableInPos"
                                            checked={formData.availableInPos}
                                            onCheckedChange={(checked) =>
                                                setFormData({
                                                    ...formData,
                                                    availableInPos:
                                                        checked as boolean,
                                                })
                                            }
                                        />
                                        <Label htmlFor="availableInPos">
                                            Available in POS
                                        </Label>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="posSequence">
                                            POS Sequence
                                        </Label>
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
                                            placeholder="Display order in POS"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex justify-end space-x-4">
                    <Link href="/app/menu/food-combos">
                        <Button variant="outline">Cancel</Button>
                    </Link>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleSubmit(true)}
                        disabled={createComboMutation.isPending}
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Save & Create New
                    </Button>
                    <Button
                        onClick={() => handleSubmit(false)}
                        disabled={createComboMutation.isPending}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        {createComboMutation.isPending ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* Product Selection Modal */}
            {productModal.isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium">
                                Add Products to Combo
                            </h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={closeProductModal}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search products..."
                                    value={productModal.searchTerm}
                                    onChange={(e) =>
                                        handleProductSearch(e.target.value)
                                    }
                                    className="pl-10"
                                />
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                            {productModal.products.map((product) => (
                                <div
                                    key={product.id}
                                    className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50"
                                >
                                    <Checkbox
                                        checked={productModal.selectedProducts.has(
                                            product.id
                                        )}
                                        onCheckedChange={(checked) => {
                                            const newSelected = new Set(
                                                productModal.selectedProducts
                                            );
                                            if (checked) {
                                                newSelected.add(product.id);
                                            } else {
                                                newSelected.delete(product.id);
                                            }
                                            setProductModal((prev) => ({
                                                ...prev,
                                                selectedProducts: newSelected,
                                            }));
                                        }}
                                    />
                                    {product.image ? (
                                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                                            <Image
                                                src={product.image}
                                                alt={product.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-medium">
                                            {product.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {formatCurrency(product.price)} •{' '}
                                            {product.categoryName ||
                                                'No category'}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex justify-end space-x-3">
                            <Button
                                variant="outline"
                                onClick={closeProductModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={addProductsToCombo}
                                disabled={
                                    productModal.selectedProducts.size === 0
                                }
                            >
                                Add {productModal.selectedProducts.size}{' '}
                                Product(s)
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
