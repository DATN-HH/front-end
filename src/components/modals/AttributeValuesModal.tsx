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
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Plus,
    Edit,
    Trash2,
    Palette,
    DollarSign,
    Save,
    X,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
    useAttributeValues,
    useCreateAttributeValue,
    useUpdateAttributeValue,
    useDeleteAttributeValue,
    useProductAttribute,
    ProductAttributeValueCreateRequest,
    ProductAttributeValueResponse
} from '@/api/v1/menu/product-attributes';

// Form schema for attribute values
const valueFormSchema = z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters'),
    colorCode: z.string().optional(),
    sequence: z.number().min(0, 'Sequence must be non-negative'),
    priceExtra: z.number().optional(),
    description: z.string().optional(),
});

type ValueFormData = z.infer<typeof valueFormSchema>;

interface AttributeValuesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attributeId: number;
    editingValueId?: number | null;
}

export function AttributeValuesModal({ open, onOpenChange, attributeId, editingValueId: externalEditingValueId }: AttributeValuesModalProps) {
    const { toast } = useToast();
    
    // State for editing
    const [editingValueId, setEditingValueId] = useState<number | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // API hooks
    const { data: attribute } = useProductAttribute(attributeId);
    const { data: values = [], isLoading } = useAttributeValues(attributeId);
    const createValueMutation = useCreateAttributeValue();
    const updateValueMutation = useUpdateAttributeValue();
    const deleteValueMutation = useDeleteAttributeValue();

    const form = useForm<ValueFormData>({
        resolver: zodResolver(valueFormSchema),
        defaultValues: {
            name: '',
            colorCode: '',
            sequence: 0,
            priceExtra: 0,
            description: '',
        },
    });

    // Event handlers
    const onSubmit = async (data: ValueFormData) => {
        try {
            const requestData: ProductAttributeValueCreateRequest = {
                name: data.name,
                colorCode: data.colorCode || undefined,
                sequence: data.sequence || 0,
                priceExtra: data.priceExtra || undefined,
                description: data.description || undefined,
                attributeId,
            };

            if (editingValueId) {
                await updateValueMutation.mutateAsync({ id: editingValueId, data: requestData });
                toast({
                    title: 'Value Updated',
                    description: `${data.name} has been updated successfully.`,
                });
                setEditingValueId(null);
            } else {
                await createValueMutation.mutateAsync(requestData);
                toast({
                    title: 'Value Created',
                    description: `${data.name} has been created successfully.`,
                });
                setShowCreateForm(false);
            }

            form.reset();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save attribute value. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (value: ProductAttributeValueResponse) => {
        setEditingValueId(value.id);
        form.reset({
            name: value.name,
            colorCode: value.colorCode || '',
            sequence: value.sequence || 0,
            priceExtra: value.priceExtra || 0,
            description: value.description || '',
        });
        setShowCreateForm(false);
    };

    const handleDelete = async (valueId: number, valueName: string) => {
        if (!confirm(`Are you sure you want to delete "${valueName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deleteValueMutation.mutateAsync(valueId);
            toast({
                title: 'Value Deleted',
                description: `${valueName} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete attribute value. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        setEditingValueId(null);
        setShowCreateForm(false);
        form.reset();
    };

    const handleCreateNew = () => {
        setEditingValueId(null);
        setShowCreateForm(true);
        form.reset();
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const isColorAttribute = attribute?.displayType === 'COLOR';

    // Handle external editing value ID
    useEffect(() => {
        if (open && externalEditingValueId && values.length > 0) {
            const valueToEdit = values.find(v => v.id === externalEditingValueId);
            if (valueToEdit) {
                handleEdit(valueToEdit);
            }
        }
    }, [open, externalEditingValueId, values]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Manage Attribute Values</DialogTitle>
                    <DialogDescription>
                        Manage values for the "{attribute?.name}" attribute.
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue={editingValueId ? "form" : "values"} key={editingValueId || "default"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="values">Values ({values.length})</TabsTrigger>
                        <TabsTrigger value="form">
                            {editingValueId ? 'Edit Value' : 'Add Value'}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="values" className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">Attribute Values</h3>
                            <Button onClick={handleCreateNew}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Value
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8">Loading values...</div>
                        ) : values.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                No values found. Create the first value to get started.
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {values.map((value) => (
                                    <Card key={value.id}>
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    {isColorAttribute && value.colorCode && (
                                                        <div
                                                            className="w-6 h-6 rounded border border-gray-300"
                                                            style={{ backgroundColor: value.colorCode }}
                                                        />
                                                    )}
                                                    <div>
                                                        <div className="font-medium">{value.name}</div>
                                                        {value.description && (
                                                            <div className="text-sm text-muted-foreground">
                                                                {value.description}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    {value.priceExtra && value.priceExtra > 0 && (
                                                        <Badge variant="outline">
                                                            <DollarSign className="h-3 w-3 mr-1" />
                                                            {formatCurrency(value.priceExtra)}
                                                        </Badge>
                                                    )}
                                                    <Badge variant="outline">
                                                        Seq: {value.sequence || 0}
                                                    </Badge>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleEdit(value)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-red-500"
                                                        onClick={() => handleDelete(value.id, value.name)}
                                                        disabled={deleteValueMutation.isPending}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="form" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {editingValueId ? 'Edit Attribute Value' : 'Create Attribute Value'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Value Name *</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="e.g., Small, Red, Cotton"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

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
                                                                onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        {isColorAttribute && (
                                            <FormField
                                                control={form.control}
                                                name="colorCode"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Color Code</FormLabel>
                                                        <FormControl>
                                                            <div className="flex items-center space-x-2">
                                                                <Input
                                                                    type="color"
                                                                    className="w-16 h-10"
                                                                    {...field}
                                                                />
                                                                <Input
                                                                    placeholder="#000000"
                                                                    {...field}
                                                                />
                                                            </div>
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        )}

                                        <FormField
                                            control={form.control}
                                            name="priceExtra"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Price Extra (VND)</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder="0"
                                                            {...field}
                                                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                                        />
                                                    </FormControl>
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
                                                            placeholder="Optional description"
                                                            rows={3}
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="flex justify-end space-x-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={createValueMutation.isPending || updateValueMutation.isPending}
                                            >
                                                <Save className="h-4 w-4 mr-2" />
                                                {editingValueId ? 'Update Value' : 'Create Value'}
                                            </Button>
                                        </div>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
} 