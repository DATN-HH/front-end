'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
    useCreateProductAttribute,
    useCreateAttributeValue,
    ProductAttributeCreateRequest,
    ProductAttributeValueCreateRequest,
} from '@/api/v1/menu/product-attributes';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { useToast } from '@/hooks/use-toast';

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

interface AttributeValue {
    name: string;
    colorCode?: string;
    textValue?: string;
    description?: string;
}

interface ProductAttributeCreateModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProductAttributeCreateModal({
    open,
    onOpenChange,
}: ProductAttributeCreateModalProps) {
    const { toast } = useToast();
    const [saveAndNew, setSaveAndNew] = useState(false);
    const [attributeValues, setAttributeValues] = useState<AttributeValue[]>(
        []
    );
    const [newValue, setNewValue] = useState<AttributeValue>({
        name: '',
        colorCode: '',
        textValue: '',
        description: '',
    });

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

    const createAttributeMutation = useCreateProductAttribute();
    const createValueMutation = useCreateAttributeValue();

    const addValue = () => {
        if (!newValue.name.trim()) {
            toast({
                title: 'Validation Error',
                description: 'Value name is required.',
                variant: 'destructive',
            });
            return;
        }

        if (
            attributeValues.some(
                (v) => v.name.toLowerCase() === newValue.name.toLowerCase()
            )
        ) {
            toast({
                title: 'Validation Error',
                description: 'Value name already exists.',
                variant: 'destructive',
            });
            return;
        }

        setAttributeValues([...attributeValues, { ...newValue }]);
        setNewValue({
            name: '',
            colorCode: '',
            textValue: '',
            description: '',
        });
    };

    const removeValue = (index: number) => {
        setAttributeValues(attributeValues.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: FormData) => {
        try {
            // First, create the attribute
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

            const createdAttribute = await createAttributeMutation.mutateAsync({
                data: requestData,
                saveAndNew: false,
            });

            // Then, create all the values if any were added
            if (attributeValues.length > 0) {
                const valuePromises = attributeValues.map((value, index) => {
                    const valueRequest: ProductAttributeValueCreateRequest = {
                        name: value.name,
                        colorCode: value.colorCode || undefined,
                        sequence: index + 1,
                        textValue: value.textValue || undefined,
                        description: value.description || undefined,
                        attributeId: createdAttribute.id,
                    };
                    return createValueMutation.mutateAsync(valueRequest);
                });

                await Promise.all(valuePromises);
            }

            toast({
                title: 'Attribute Created',
                description: `${data.name} has been created successfully${attributeValues.length > 0 ? ` with ${attributeValues.length} values` : ''}.`,
            });

            if (saveAndNew) {
                form.reset();
                setAttributeValues([]);
                setNewValue({
                    name: '',
                    colorCode: '',
                    textValue: '',
                    description: '',
                });
                setSaveAndNew(false);
            } else {
                handleClose();
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create attribute. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        form.reset();
        setAttributeValues([]);
        setNewValue({
            name: '',
            colorCode: '',
            textValue: '',
            description: '',
        });
        setSaveAndNew(false);
    };

    const displayType = form.watch('displayType');

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Product Attribute</DialogTitle>
                    <DialogDescription>
                        Create a new product attribute that can be used to
                        define product variants.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                    >
                        {/* Basic Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                                <CardDescription>
                                    Define the basic properties of the attribute
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Attribute Name *
                                                </FormLabel>
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
                                                <FormLabel>
                                                    Display Type *
                                                </FormLabel>
                                                <Select
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    defaultValue={field.value}
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
                                                    How this attribute will be
                                                    displayed to users
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
                                                defaultValue={field.value}
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
                                                When product variants should be
                                                created for this attribute
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
                                                        onCheckedChange={
                                                            field.onChange
                                                        }
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel className="text-sm font-medium">
                                                        Money Attribute
                                                    </FormLabel>
                                                    <FormDescription className="text-xs text-muted-foreground">
                                                        Check this if this
                                                        attribute represents a
                                                        monetary value (e.g.,
                                                        price, cost, fee). This
                                                        will enable currency
                                                        formatting and
                                                        validation.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                )}
                            </CardContent>
                        </Card>

                        {/* Attribute Values */}
                        {displayType !== 'TEXTBOX' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Attribute Values</CardTitle>
                                    <CardDescription>
                                        Add possible values for this attribute
                                        (not needed for textbox type)
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Add new value form */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Value Name *
                                            </label>
                                            <Input
                                                value={newValue.name}
                                                onChange={(e) =>
                                                    setNewValue({
                                                        ...newValue,
                                                        name: e.target.value,
                                                    })
                                                }
                                                placeholder="e.g., Small, Red, Cotton"
                                            />
                                        </div>

                                        {displayType === 'COLOR' && (
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Color Code
                                                </label>
                                                <div className="flex space-x-2">
                                                    <Input
                                                        type="color"
                                                        value={
                                                            newValue.colorCode ||
                                                            '#000000'
                                                        }
                                                        onChange={(e) =>
                                                            setNewValue({
                                                                ...newValue,
                                                                colorCode:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        className="w-12 h-10 p-1"
                                                    />
                                                    <Input
                                                        value={
                                                            newValue.colorCode ||
                                                            ''
                                                        }
                                                        onChange={(e) =>
                                                            setNewValue({
                                                                ...newValue,
                                                                colorCode:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        }
                                                        placeholder="#000000"
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {(displayType as string) ===
                                            'TEXTBOX' && (
                                            <div>
                                                <label className="text-sm font-medium">
                                                    Default Text Value
                                                </label>
                                                <Input
                                                    value={
                                                        newValue.textValue || ''
                                                    }
                                                    onChange={(e) =>
                                                        setNewValue({
                                                            ...newValue,
                                                            textValue:
                                                                e.target.value,
                                                        })
                                                    }
                                                    placeholder="Default value (optional)"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-end">
                                            <Button
                                                type="button"
                                                onClick={addValue}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Value
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Display added values */}
                                    {attributeValues.length > 0 && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">
                                                Added Values (
                                                {attributeValues.length})
                                            </label>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {attributeValues.map(
                                                    (value, index) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between p-3 border rounded-lg"
                                                        >
                                                            <div className="flex items-center space-x-3">
                                                                {value.colorCode && (
                                                                    <div
                                                                        className="w-6 h-6 rounded border"
                                                                        style={{
                                                                            backgroundColor:
                                                                                value.colorCode,
                                                                        }}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <span className="font-medium">
                                                                        {
                                                                            value.name
                                                                        }
                                                                    </span>
                                                                    {value.textValue && (
                                                                        <span className="ml-2 text-sm text-gray-600">
                                                                            "
                                                                            {
                                                                                value.textValue
                                                                            }
                                                                            "
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() =>
                                                                    removeValue(
                                                                        index
                                                                    )
                                                                }
                                                            >
                                                                <X className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="saveAndNew"
                                checked={saveAndNew}
                                onCheckedChange={(checked) =>
                                    setSaveAndNew(checked === true)
                                }
                            />
                            <label
                                htmlFor="saveAndNew"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Save and create another
                            </label>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={createAttributeMutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={createAttributeMutation.isPending}
                            >
                                {createAttributeMutation.isPending
                                    ? 'Creating...'
                                    : 'Create Attribute'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
