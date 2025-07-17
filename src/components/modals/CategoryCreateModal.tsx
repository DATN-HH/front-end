'use client';

import { useState } from 'react';
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
    useCreateCategory, 
    CategoryCreateRequest 
} from '@/api/v1/menu/categories';
import { Loader2 } from 'lucide-react';

const categorySchema = z.object({
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

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CategoryCreateModal({ open, onOpenChange }: CategoryCreateModalProps) {
    const { toast } = useToast();
    const [saveAndNew, setSaveAndNew] = useState(false);

    const form = useForm<CategoryFormValues>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            code: '',
            name: '',
            description: '',
            status: 'ACTIVE',
        },
    });

    const createCategoryMutation = useCreateCategory();

    const onSubmit = async (data: CategoryFormValues) => {
        try {
            const categoryData: CategoryCreateRequest = {
                code: data.code,
                name: data.name,
                description: data.description || undefined,
                status: data.status,
            };

            await createCategoryMutation.mutateAsync({ 
                data: categoryData, 
                saveAndNew 
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
                description: error.response?.data?.message || 'Failed to create category. Please try again.',
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
                                {createCategoryMutation.isPending && saveAndNew ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Save & New
                            </Button>
                            <Button
                                type="submit"
                                disabled={createCategoryMutation.isPending}
                            >
                                {createCategoryMutation.isPending && !saveAndNew ? (
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