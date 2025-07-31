'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
    useProductAttribute,
    useUpdateProductAttribute,
    ProductAttributeCreateRequest,
} from '@/api/v1/menu/product-attributes';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomToast } from '@/lib/show-toast';

// Form schema
const formSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be less than 100 characters'),
    displayType: z.enum(
        ['RADIO', 'SELECT', 'COLOR', 'CHECKBOX', 'TEXTBOX'] as const,
        {
            required_error: 'Display type is required',
        }
    ),
    variantCreationMode: z.enum(
        ['INSTANTLY', 'DYNAMICALLY', 'NEVER'] as const,
        {
            required_error: 'Variant creation mode is required',
        }
    ),
    description: z.string().optional(),
    isMoneyAttribute: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProductAttributeEditModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attributeId: number;
}

export function ProductAttributeEditModal({
    open,
    onOpenChange,
    attributeId,
}: ProductAttributeEditModalProps) {
    const { success, error: showError } = useCustomToast();

    const { data: attribute, isLoading } = useProductAttribute(attributeId);
    const updateAttributeMutation = useUpdateProductAttribute();

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            displayType: 'SELECT',
            variantCreationMode: 'DYNAMICALLY',
            description: '',
            isMoneyAttribute: false,
        },
    });

    // Update form when attribute data loads
    useEffect(() => {
        if (attribute) {
            form.reset({
                name: attribute.name,
                displayType: attribute.displayType,
                variantCreationMode: attribute.variantCreationMode,
                description: attribute.description || '',
                isMoneyAttribute: attribute.isMoneyAttribute || false,
            });
        }
    }, [attribute, form]);

    const onSubmit = async (data: FormData) => {
        try {
            const requestData: ProductAttributeCreateRequest = {
                name: data.name,
                displayType: data.displayType,
                variantCreationMode: data.variantCreationMode,
                description: data.description || undefined,
                isMoneyAttribute:
                    data.displayType === 'TEXTBOX'
                        ? data.isMoneyAttribute
                        : undefined,
            };

            await updateAttributeMutation.mutateAsync({
                id: attributeId,
                data: requestData,
            });

            success(
                'Attribute Updated',
                `${data.name} has been updated successfully.`
            );

            onOpenChange(false);
        } catch (err) {
            showError('Error', 'Failed to update attribute. Please try again.');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
    };

    const displayType = form.watch('displayType');

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <div className="flex items-center justify-center p-6">
                        <div className="text-center">
                            Loading attribute data...
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    if (!attribute) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[600px]">
                    <div className="flex items-center justify-center p-6">
                        <div className="text-center text-red-500">
                            Failed to load attribute data
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Edit Product Attribute</DialogTitle>
                    <DialogDescription>
                        Update the product attribute details.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Attribute Name *</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="e.g., Size, Color, Material"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="displayType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Type *</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select display type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="SELECT">
                                                    Dropdown
                                                </SelectItem>
                                                <SelectItem value="RADIO">
                                                    Radio Buttons
                                                </SelectItem>
                                                <SelectItem value="COLOR">
                                                    Color Picker
                                                </SelectItem>
                                                <SelectItem value="CHECKBOX">
                                                    Checkboxes
                                                </SelectItem>
                                                <SelectItem value="TEXTBOX">
                                                    Text Input
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            How this attribute will be displayed
                                            to users
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="variantCreationMode"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Variant Creation Mode *
                                    </FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select variant creation mode" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="INSTANTLY">
                                                Instantly
                                            </SelectItem>
                                            <SelectItem value="DYNAMICALLY">
                                                Dynamically
                                            </SelectItem>
                                            <SelectItem value="NEVER">
                                                Never
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        When product variants should be created
                                        for this attribute
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
                                            placeholder="Optional description for this attribute"
                                            className="resize-none"
                                            rows={3}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Money Attribute Option - Only show for TEXTBOX */}
                        {displayType === 'TEXTBOX' && (
                            <FormField
                                control={form.control}
                                name="isMoneyAttribute"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-blue-50">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel className="text-sm font-medium">
                                                Money Attribute
                                            </FormLabel>
                                            <FormDescription className="text-xs text-muted-foreground">
                                                Check this if this attribute
                                                represents a monetary value
                                                (e.g., price, cost, fee). This
                                                will enable currency formatting
                                                and validation.
                                            </FormDescription>
                                        </div>
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={updateAttributeMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={updateAttributeMutation.isPending}
                            >
                                {updateAttributeMutation.isPending
                                    ? 'Updating...'
                                    : 'Update Attribute'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
