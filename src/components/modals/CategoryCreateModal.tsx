'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
    useCreateCategory,
    useAllCategories,
    CategoryCreateRequest,
    CategoryResponse,
} from '@/api/v1/menu/categories';
import { Button } from '@/components/ui/button';
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const categorySchema = z.object({
    code: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length >= 2,
            'Code must be at least 2 characters'
        )
        .refine(
            (val) => !val || val.length <= 20,
            'Code must be at most 20 characters'
        )
        .refine(
            (val) => !val || /^[A-Z0-9_]+$/.test(val),
            'Code must contain only uppercase letters, numbers, and underscores'
        ),
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be at most 100 characters'),
    description: z
        .string()
        .max(500, 'Description must be at most 500 characters')
        .optional(),
    status: z.enum(['ACTIVE', 'INACTIVE'] as const),
    parentId: z.string().optional(),
    sequence: z.string().optional(),
    image: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    parentCategory?: CategoryResponse | null; // Pre-selected parent category
}

export function CategoryCreateModal({
    open,
    onOpenChange,
    parentCategory,
}: CategoryCreateModalProps) {
    const { toast } = useToast();
    const [saveAndNew, setSaveAndNew] = useState(false);

    // Get all categories for parent selection
    const { data: allCategories = [] } = useAllCategories();

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            status: 'ACTIVE',
            parentId: parentCategory?.id.toString() || '',
            sequence: '',
            image: '',
        },
    });

    const createCategoryMutation = useCreateCategory();

    // Reset form when parent category changes
    React.useEffect(() => {
        if (parentCategory) {
            form.setValue('parentId', parentCategory.id.toString());
        }
    }, [parentCategory, form]);

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            const categoryData: CategoryCreateRequest = {
                code: data.code || undefined,
                name: data.name,
                description: data.description || undefined,
                status: data.status,
                parentId: data.parentId && data.parentId !== 'root' ? Number(data.parentId) : undefined,
                sequence: data.sequence ? Number(data.sequence) : undefined,
                image: data.image || undefined,
            };

            await createCategoryMutation.mutateAsync({
                data: categoryData,
                saveAndNew,
            });

            toast({
                title: 'Category Created',
                description: `Category "${data.name}" has been created successfully.`,
            });

            if (saveAndNew) {
                form.reset({
                    code: '',
                    name: '',
                    description: '',
                    status: 'ACTIVE',
                });
                setSaveAndNew(false);
            } else {
                form.reset();
                onOpenChange(false);
            }
        } catch (error: any) {
            toast({
                title: 'Error',
                description:
                    error.response?.data?.message ||
                    'Failed to create category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        form.reset();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Add a new product category to organize your inventory.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Code *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., MAIN_COURSE"
                                                {...field}
                                                className="uppercase"
                                                onChange={(e) => {
                                                    field.onChange(
                                                        e.target.value.toUpperCase()
                                                    );
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Main Course"
                                                {...field}
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
                                            placeholder="Enter category description..."
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
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status *</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">
                                                Active
                                            </SelectItem>
                                            <SelectItem value="INACTIVE">
                                                Inactive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Parent Category Selection */}
                        <FormField
                            control={form.control}
                            name="parentId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Parent Category</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select parent category (optional)" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="root">
                                                No Parent (Root Category)
                                            </SelectItem>
                                            {allCategories
                                                .filter(
                                                    (cat) =>
                                                        cat.id !==
                                                        parentCategory?.id
                                                ) // Prevent self-selection
                                                .map((category) => (
                                                    <SelectItem
                                                        key={category.id}
                                                        value={category.id.toString()}
                                                    >
                                                        {category.name}
                                                        {category.code &&
                                                            ` (${category.code})`}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Additional Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sequence"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Order</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com/image.jpg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={createCategoryMutation.isPending}
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
                                disabled={createCategoryMutation.isPending}
                            >
                                {createCategoryMutation.isPending &&
                                saveAndNew ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save & New
                            </Button>
                            <Button
                                type="submit"
                                disabled={createCategoryMutation.isPending}
                            >
                                {createCategoryMutation.isPending &&
                                !saveAndNew ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Create Category
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
