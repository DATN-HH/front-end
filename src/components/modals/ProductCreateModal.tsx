'use client';

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useDropzone } from 'react-dropzone';
import { 
    useCreateProduct, 
    ProductCreateRequest, 
    ProductType 
} from '@/api/v1/menu/products';
import { useUploadImage } from '@/api/v1/images';
import { useAllCategories } from '@/api/v1/menu/categories';
import { useAssignTagsToProduct, ProductTagResponse } from '@/api/v1/menu/product-tags';
import { TagSelector } from '@/components/forms/TagSelector';
import { Loader2, Package, X, Image as ImageIcon } from 'lucide-react';

// Form validation schema
const productSchema = z.object({
    name: z.string().min(1, 'Product name is required').max(100, 'Name too long'),
    type: z.enum(['CONSUMABLE', 'STOCKABLE', 'SERVICE', 'EXTRA'] as const),
    categoryId: z.number().min(1, 'Please select a category').optional(),
    groupName: z.string().max(100, 'Group name too long').optional(),
    description: z.string().max(1000, 'Description too long').optional(),
    image: z.string().optional(),
    internalReference: z.string().max(50, 'Internal reference too long').optional(),
    canBeSold: z.boolean().optional(),
    canBePurchased: z.boolean().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultCategoryId?: number;
}

export function ProductCreateModal({ open, onOpenChange, defaultCategoryId }: ProductCreateModalProps) {
    const { toast } = useToast();
    const [saveAndNew, setSaveAndNew] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [selectedTags, setSelectedTags] = useState<ProductTagResponse[]>([]);
    const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
    
    const createProductMutation = useCreateProduct();
    const uploadImageMutation = useUploadImage();
    const assignTagsMutation = useAssignTagsToProduct();
    const { data: categories } = useAllCategories();

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            type: 'CONSUMABLE',
            categoryId: defaultCategoryId || undefined,
            groupName: '',
            description: '',
            image: '',
            internalReference: '',
            canBeSold: true,
            canBePurchased: false,
        },
    });

    // Image selection handling (no immediate upload)
    const onDrop = useCallback((acceptedFiles: File[]) => {
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

        // Store file for later upload and create preview
        setSelectedImageFile(file);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    }, [toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
        },
        maxFiles: 1,
    });

    const removeImage = () => {
        setImagePreview(null);
        setSelectedImageFile(null);
        form.setValue('image', '');
    };

    const onSubmit = async (data: ProductFormData) => {
        try {
            let imageUrl = data.image;

            // Upload image first if one is selected
            if (selectedImageFile) {
                setUploadingImage(true);
                try {
                    const uploadResult = await uploadImageMutation.mutateAsync({
                        file: selectedImageFile,
                        folder: 'products'
                    });
                    imageUrl = uploadResult.secureUrl;
                } catch (error: any) {
                    toast({
                        title: 'Image Upload Failed',
                        description: error?.response?.data?.message || 'Failed to upload image.',
                        variant: 'destructive',
                    });
                    return; // Stop if image upload fails
                } finally {
                    setUploadingImage(false);
                }
            }

            const requestData: ProductCreateRequest = {
                name: data.name,
                type: data.type,
                image: imageUrl || undefined,
                description: data.description || undefined,
                groupName: data.groupName || undefined,
                internalReference: data.internalReference || undefined,
                categoryId: data.categoryId,
                canBeSold: data.canBeSold,
                canBePurchased: data.canBePurchased,
            };

            const createdProduct = await createProductMutation.mutateAsync({
                data: requestData,
                saveAndNew,
            });

            // Assign tags to the created product if any tags are selected
            if (selectedTags.length > 0) {
                await assignTagsMutation.mutateAsync({
                    productId: createdProduct.id,
                    tagIds: selectedTags.map(tag => tag.id),
                });
            }

            toast({
                title: 'Product Created',
                description: `${data.name} has been created successfully.`,
            });

            if (saveAndNew) {
                // Reset form but keep some values for convenience
                form.reset({
                    name: '',
                    type: data.type,
                    categoryId: data.categoryId,
                    groupName: data.groupName || '',
                    description: '',
                    image: '',
                    internalReference: '',
                    canBeSold: data.canBeSold,
                    canBePurchased: data.canBePurchased,
                });
                setImagePreview(null);
                setSelectedImageFile(null);
                setSelectedTags([]);
                setSaveAndNew(false);
            } else {
                handleClose();
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error?.response?.data?.message || 'Failed to create product. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
        setImagePreview(null);
        setSelectedImageFile(null);
        setSelectedTags([]);
        setSaveAndNew(false);
    };

    const productTypes: { value: ProductType; label: string; description: string }[] = [
        { value: 'CONSUMABLE', label: 'Consumable', description: 'Items that are consumed (food, drinks)' },
        { value: 'STOCKABLE', label: 'Stockable', description: 'Physical products with inventory tracking' },
        { value: 'SERVICE', label: 'Service', description: 'Services provided to customers' },
        { value: 'EXTRA', label: 'Extra', description: 'Add-ons or extras for other products' },
    ];

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Create New Product
                    </DialogTitle>
                    <DialogDescription>
                        Add a new product to your menu. Fill in the information across the different tabs.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                <TabsTrigger value="image">Image</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-6">
                                {/* Essential Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Essential Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Product Name *</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="e.g., Beef Pho" {...field} />
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
                                                    <FormLabel>Product Type *</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select product type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {productTypes.map((type) => (
                                                                <SelectItem key={type.value} value={type.value}>
                                                                    <div>
                                                                        <div>{type.label}</div>
                                                                        <div className="text-xs text-gray-500">{type.description}</div>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
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
                                                    <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Select category (will use 'Other' if not selected)" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {categories?.map((category) => (
                                                                <SelectItem key={category.id} value={category.id.toString()}>
                                                                    {category.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        If no category is selected, the product will be placed in the 'Other' category
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="internalReference"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Internal Reference</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Auto-generated if left empty" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Leave empty for auto-generation
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </div>

                                {/* Organization */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Organization</h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="groupName"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Group Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="e.g., Vietnamese Noodles" {...field} />
                                                </FormControl>
                                                <FormDescription>
                                                    Group related products together for better organization
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

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

                                    {/* Tag Selector */}
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        onTagsChange={setSelectedTags}
                                        placeholder="Add tags to categorize this product..."
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="image" className="space-y-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium mb-2">Product Image</h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Upload a high-quality image of your product. Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
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
                                                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
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
                                                        {uploadingImage ? 'Uploading...' : 'Drop image here or click to upload'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        JPEG, PNG, GIF, WebP up to 5MB
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="settings" className="space-y-4">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-medium">Product Settings</h3>
                                    
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="canBeSold"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                                    <FormControl>
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Can be sold</FormLabel>
                                                        <FormDescription>
                                                            Enable if this product can be sold to customers
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
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                    <div className="space-y-1 leading-none">
                                                        <FormLabel>Can be purchased</FormLabel>
                                                        <FormDescription>
                                                            Enable if this product can be purchased from suppliers
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
                                disabled={createProductMutation.isPending || uploadingImage}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setSaveAndNew(true);
                                    form.handleSubmit(onSubmit)();
                                }}
                                disabled={createProductMutation.isPending || uploadingImage}
                            >
                                {(createProductMutation.isPending || uploadingImage) && saveAndNew ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {uploadingImage ? 'Uploading...' : 'Save & New'}
                            </Button>
                            <Button
                                type="submit"
                                disabled={createProductMutation.isPending || uploadingImage}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                {(createProductMutation.isPending || uploadingImage) && !saveAndNew ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {uploadingImage ? 'Uploading Image...' : 'Create Product'}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 