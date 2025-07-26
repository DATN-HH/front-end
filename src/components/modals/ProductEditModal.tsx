'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Package, X, Image as ImageIcon } from 'lucide-react';
import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useUploadImage } from '@/api/v1/images';
import { useCategoryHierarchy } from '@/api/v1/menu/categories';
import {
    useUpdateProduct,
    useProductDetail,
    ProductUpdateRequest,
    ProductType,
} from '@/api/v1/menu/products';
import { CategorySelector } from '@/components/category/CategorySelector';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

// Form validation schema
const productSchema = z.object({
    name: z
        .string()
        .min(1, 'Product name is required')
        .max(100, 'Name too long'),
    size: z.string().max(50, 'Size too long').optional(),
    price: z.number().min(0, 'Price must be positive').optional(),
    cost: z.number().min(0, 'Cost must be positive').optional(),
    type: z.enum(['CONSUMABLE', 'STOCKABLE', 'SERVICE', 'EXTRA'] as const),
    image: z.string().optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    estimateTime: z
        .number()
        .min(0, 'Estimate time must be positive')
        .optional(),
    groupName: z.string().max(100, 'Group name too long').optional(),
    canBeSold: z.boolean().optional(),
    canBePurchased: z.boolean().optional(),
    categoryId: z.number().min(1, 'Please select a category').optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: number;
}

export function ProductEditModal({
    open,
    onOpenChange,
    productId,
}: ProductEditModalProps) {
    const { toast } = useToast();
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const updateProductMutation = useUpdateProduct();
    const uploadImageMutation = useUploadImage();
    const { data: categories = [] } = useCategoryHierarchy();
    const { data: productDetail, isLoading: isLoadingProduct } =
        useProductDetail(productId);

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            size: '',
            price: 0,
            cost: 0,
            type: 'CONSUMABLE',
            image: '',
            description: '',
            estimateTime: 0,
            groupName: '',
            canBeSold: true,
            canBePurchased: false,
            categoryId: 0,
        },
    });

    // Update form when product data is loaded
    useEffect(() => {
        if (productDetail && open) {
            form.reset({
                name: productDetail.name || '',
                size: productDetail.size || '',
                price: productDetail.price || 0,
                cost: productDetail.cost || 0,
                type: productDetail.type,
                image: productDetail.image || '',
                description: productDetail.description || '',
                estimateTime: productDetail.estimateTime || 0,
                groupName: productDetail.groupName || '',
                canBeSold: productDetail.canBeSold ?? true,
                canBePurchased: productDetail.canBePurchased ?? false,
                categoryId: productDetail.category?.id || 0,
            });

            // Set image preview if product has an image
            if (productDetail.image) {
                setImagePreview(productDetail.image);
            }
        }
    }, [productDetail, open, form]);

    // Image upload handling
    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            const file = acceptedFiles[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast({
                    title: 'Invalid File Type',
                    description: 'Please upload an image file.',
                    variant: 'destructive',
                });
                return;
            }

            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File Too Large',
                    description: 'Image must be less than 5MB.',
                    variant: 'destructive',
                });
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
                    folder: 'products',
                });

                // Update form with image URL
                form.setValue('image', uploadResult.secureUrl);

                toast({
                    title: 'Image Uploaded',
                    description:
                        'Product image has been uploaded successfully.',
                });
            } catch (error: any) {
                toast({
                    title: 'Upload Failed',
                    description:
                        error?.response?.data?.message ||
                        'Failed to upload image.',
                    variant: 'destructive',
                });
                // Revert to original image if upload fails
                if (productDetail?.image) {
                    setImagePreview(productDetail.image);
                    form.setValue('image', productDetail.image);
                } else {
                    setImagePreview(null);
                    form.setValue('image', '');
                }
            } finally {
                setUploadingImage(false);
            }
        },
        [uploadImageMutation, form, toast, productDetail]
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
        form.setValue('image', '');
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            const requestData: ProductUpdateRequest = {
                name: data.name,
                type: data.type,
                size: data.size || undefined,
                image: data.image || undefined,
                description: data.description || undefined,
                groupName: data.groupName || undefined,
                price: data.price === 0 ? undefined : data.price,
                cost: data.cost === 0 ? undefined : data.cost,
                estimateTime:
                    data.estimateTime === 0 ? undefined : data.estimateTime,
                categoryId: data.categoryId === 0 ? undefined : data.categoryId,
                canBeSold: data.canBeSold,
                canBePurchased: data.canBePurchased,
            };

            await updateProductMutation.mutateAsync({
                id: productId,
                data: requestData,
            });

            toast({
                title: 'Product Updated',
                description: `${data.name} has been updated successfully.`,
            });

            handleClose();
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error?.response?.data?.message ||
                    'Failed to update product. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setImagePreview(null);
    };

    const productTypes: {
        value: ProductType;
        label: string;
        description: string;
    }[] = [
        {
            value: 'CONSUMABLE',
            label: 'Consumable',
            description: 'Items that are consumed (food, drinks)',
        },
        {
            value: 'STOCKABLE',
            label: 'Stockable',
            description: 'Physical products with inventory tracking',
        },
        {
            value: 'SERVICE',
            label: 'Service',
            description: 'Services provided to customers',
        },
        {
            value: 'EXTRA',
            label: 'Extra',
            description: 'Add-ons or extras for other products',
        },
    ];

    if (isLoadingProduct) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Loading Product</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="ml-2">Loading product...</span>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Edit Product
                    </DialogTitle>
                    <DialogDescription>
                        Update the product information across the different
                        tabs.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">
                                    Basic Info
                                </TabsTrigger>
                                <TabsTrigger value="image">Image</TabsTrigger>
                                <TabsTrigger value="settings">
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Product Name *
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g., Beef Pho"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="type"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Product Type *
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select product type" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {productTypes.map(
                                                            (type) => (
                                                                <SelectItem
                                                                    key={
                                                                        type.value
                                                                    }
                                                                    value={
                                                                        type.value
                                                                    }
                                                                >
                                                                    <div>
                                                                        <div>
                                                                            {
                                                                                type.label
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">
                                                                            {
                                                                                type.description
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="categoryId"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Category</FormLabel>
                                                <FormControl>
                                                    <CategorySelector
                                                        categories={categories}
                                                        value={
                                                            field.value === 0
                                                                ? undefined
                                                                : field.value
                                                        }
                                                        onValueChange={(
                                                            value
                                                        ) =>
                                                            field.onChange(
                                                                value || 0
                                                            )
                                                        }
                                                        placeholder="Select category"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="price"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Sale Price (VND)
                                                </FormLabel>
                                                <FormControl>
                                                    <NumberInput
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        placeholder="50,000"
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="cost"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Cost (VND)
                                                </FormLabel>
                                                <FormControl>
                                                    <NumberInput
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        placeholder="30,000"
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="size"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Size</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="Medium, Large, etc."
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="estimateTime"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Estimate Time (minutes)
                                                </FormLabel>
                                                <FormControl>
                                                    <NumberInput
                                                        value={field.value}
                                                        onChange={
                                                            field.onChange
                                                        }
                                                        placeholder="15"
                                                        min={0}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Describe your product..."
                                                    rows={3}
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="groupName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="e.g., Vietnamese Noodles"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Group related products together
                                                for better organization
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </TabsContent>

                            <TabsContent value="image" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">
                                            Product Image
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upload a high-quality image of your
                                            product. Supported formats: JPEG,
                                            PNG, GIF, WebP (max 5MB)
                                        </p>
                                    </div>

                                    {imagePreview ? (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Product preview"
                                                className="w-full max-w-md h-64 object-cover rounded-lg border"
                                            />
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="sm"
                                                className="absolute top-2 right-2"
                                                onClick={removeImage}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                                                isDragActive
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-300 hover:border-gray-400'
                                            }`}
                                        >
                                            <input {...getInputProps()} />
                                            <div className="space-y-2">
                                                {uploadingImage ? (
                                                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                                                ) : (
                                                    <ImageIcon className="h-8 w-8 mx-auto text-gray-400" />
                                                )}
                                                <div>
                                                    <p className="text-lg font-medium">
                                                        {uploadingImage
                                                            ? 'Uploading...'
                                                            : 'Drop image here or click to upload'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        JPEG, PNG, GIF, WebP up
                                                        to 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">
                                        Product Settings
                                    </h3>

                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="canBeSold"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Can be sold
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Enable if this
                                                            product can be sold
                                                            to customers
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="canBePurchased"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={
                                                                field.value
                                                            }
                                                            onCheckedChange={
                                                                field.onChange
                                                            }
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>
                                                            Can be purchased
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Enable if this
                                                            product can be
                                                            purchased from
                                                            suppliers
                                                        </FormDescription>
                                                    </div>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <div className="flex justify-end space-x-2 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={updateProductMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateProductMutation.isPending}
                            >
                                {updateProductMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Update Product
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
