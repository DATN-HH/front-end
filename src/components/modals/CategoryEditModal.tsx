'use client';

import { useState, useEffect } from 'react';
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
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
    useUpdateCategory, 
    CategoryUpdateRequest,
    CategoryResponse,
    Status 
} from '@/api/v1/menu/categories';
import { Loader2 } from 'lucide-react';

const categoryEditSchema = z.object({
    code: z
        .string()
        .min(1, 'Code is required')
        .min(2, 'Code must be at least 2 characters')
        .max(20, 'Code must be at most 20 characters')
        .regex(/^[A-Z0-9_]+$/, 'Code must contain only uppercase letters, numbers, and underscores'),
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
});

type CategoryEditFormValues = z.infer<typeof categoryEditSchema>;

interface CategoryEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: CategoryResponse | null;
}

export function CategoryEditModal({ open, onOpenChange, category }: CategoryEditModalProps) {
    const { toast } = useToast();

    const form = useForm<CategoryEditFormValues>({
        resolver: zodResolver(categoryEditSchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            status: 'ACTIVE',
        },
    });

    const updateCategoryMutation = useUpdateCategory();

    // Reset form when category changes
    useEffect(() => {
        if (category) {
            form.reset({
                code: category.code || '',
                name: category.name || '',
                description: category.description || '',
                status: (category.status === 'DELETED' ? 'INACTIVE' : category.status) as 'ACTIVE' | 'INACTIVE',
            });
        }
    }, [category, form]);

    const onSubmit = async (data: CategoryEditFormValues) => {
        if (!category) return;

        try {
            const updateData: CategoryUpdateRequest = {
                code: data.code,
                name: data.name,
                description: data.description || undefined,
                status: data.status,
            };

            await updateCategoryMutation.mutateAsync({ 
                id: category.id, 
                data: updateData 
            });

            toast({
                title: 'Category Updated',
                description: `Category "${data.name}" has been updated successfully.`,
            });

            form.reset();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update category. Please try again.',
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
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update the category information.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                                    field.onChange(e.target.value.toUpperCase());
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
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select status" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="ACTIVE">Active</SelectItem>
                                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={updateCategoryMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateCategoryMutation.isPending}
                            >
                                {updateCategoryMutation.isPending ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Update Category
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
} 