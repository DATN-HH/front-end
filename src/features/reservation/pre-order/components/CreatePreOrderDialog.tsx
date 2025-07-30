'use client';

import { Plus, User, Utensils, ShoppingBag } from 'lucide-react';
import { useState } from 'react';

import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { useAllProducts } from '@/api/v1/menu/products';
import {
    useAdminCreatePreOrder,
    AdminCreatePreOrderRequest,
} from '@/api/v1/pre-order-management';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

interface CreatePreOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
}

interface OrderItem {
    id: number;
    name: string;
    type: 'product' | 'variant' | 'combo';
    quantity: number;
    note: string;
}

export function CreatePreOrderDialog({
    open,
    onOpenChange,
    onSuccess,
}: CreatePreOrderDialogProps) {
    const { user } = useAuth();
    const { success, error } = useCustomToast();

    // Form state
    const [formData, setFormData] = useState({
        type: 'takeaway' as 'dine-in' | 'takeaway',
        time: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        paymentType: 'banking' as 'cash' | 'banking',
        notes: '',
        bookingTableId: undefined as number | undefined,
    });

    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

    // API hooks
    const createPreOrderMutation = useAdminCreatePreOrder();
    const { data: foodCombosData } = useAllFoodCombos();
    const { data: productsData } = useAllProducts();

    // Safely access data arrays
    const foodCombos = foodCombosData || [];
    const products = productsData || [];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (
            !formData.customerName ||
            !formData.customerPhone ||
            !formData.time
        ) {
            error('Validation Error', 'Please fill in all required fields');
            return;
        }

        if (orderItems.length === 0) {
            error(
                'Validation Error',
                'Please add at least one item to the order'
            );
            return;
        }

        try {
            const request: AdminCreatePreOrderRequest = {
                type: formData.type,
                branchId: user?.branch.id!,
                time: formData.time,
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                customerEmail: formData.customerEmail || undefined,
                paymentType: formData.paymentType,
                notes: formData.notes || undefined,
                bookingTableId: formData.bookingTableId,
                orderItems: {
                    foodCombo: orderItems
                        .filter((item) => item.type === 'combo')
                        .map((item) => ({
                            id: item.id,
                            quantity: item.quantity,
                            note: item.note || '',
                        })),
                    productVariant: orderItems
                        .filter((item) => item.type === 'variant')
                        .map((item) => ({
                            id: item.id,
                            quantity: item.quantity,
                            note: item.note || '',
                        })),
                    product: orderItems
                        .filter((item) => item.type === 'product')
                        .map((item) => ({
                            id: item.id,
                            quantity: item.quantity,
                            note: item.note || '',
                        })),
                },
            };

            const result = await createPreOrderMutation.mutateAsync(request);

            success(
                'Success',
                result.message || 'Pre-order created successfully'
            );

            // Reset form
            setFormData({
                type: 'takeaway',
                time: '',
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                paymentType: 'banking',
                notes: '',
                bookingTableId: undefined,
            });
            setOrderItems([]);

            onOpenChange(false);
            onSuccess?.();
        } catch (err: any) {
            console.error('Failed to create pre-order:', err);
            error(
                'Error',
                err.response?.data?.message || 'Failed to create pre-order'
            );
        }
    };

    const addOrderItem = () => {
        const newItem: OrderItem = {
            id: 0,
            name: '',
            type: 'product',
            quantity: 1,
            note: '',
        };
        setOrderItems([...orderItems, newItem]);
    };

    const updateOrderItem = (index: number, updates: Partial<OrderItem>) => {
        const updated = [...orderItems];
        updated[index] = { ...updated[index], ...updates };
        setOrderItems(updated);
    };

    const removeOrderItem = (index: number) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Create New Pre-order
                    </DialogTitle>
                    <DialogDescription>
                        Create a new pre-order for a customer with payment
                        options
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Customer Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="customerName">
                                        Customer Name *
                                    </Label>
                                    <Input
                                        id="customerName"
                                        value={formData.customerName}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                customerName: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerPhone">
                                        Phone Number *
                                    </Label>
                                    <Input
                                        id="customerPhone"
                                        value={formData.customerPhone}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                customerPhone: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="customerEmail">Email</Label>
                                    <Input
                                        id="customerEmail"
                                        type="email"
                                        value={formData.customerEmail}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                customerEmail: e.target.value,
                                            }))
                                        }
                                        placeholder="Enter email (optional)"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Order Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Order Type *</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(
                                            value: 'dine-in' | 'takeaway'
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                type: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="takeaway">
                                                Takeaway
                                            </SelectItem>
                                            <SelectItem value="dine-in">
                                                Dine In
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="time">
                                        Pickup/Dining Time *
                                    </Label>
                                    <Input
                                        id="time"
                                        type="datetime-local"
                                        value={formData.time}
                                        onChange={(e) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                time: e.target.value,
                                            }))
                                        }
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="paymentType">
                                        Payment Type *
                                    </Label>
                                    <Select
                                        value={formData.paymentType}
                                        onValueChange={(
                                            value: 'cash' | 'banking'
                                        ) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                paymentType: value,
                                            }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="banking">
                                                Banking
                                            </SelectItem>
                                            <SelectItem value="cash">
                                                Cash
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Utensils className="w-4 h-4" />
                                    Order Items
                                </CardTitle>
                                <Button
                                    type="button"
                                    onClick={addOrderItem}
                                    size="sm"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Item
                                </Button>
                            </div>
                            <CardDescription>
                                Add items to the customer's order
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {orderItems.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <Utensils className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                    <p>No items added yet</p>
                                    <p className="text-sm">
                                        Click "Add Item" to start building the
                                        order
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orderItems.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex gap-4 items-end p-4 border rounded-lg"
                                        >
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Type</Label>
                                                    <Select
                                                        value={item.type}
                                                        onValueChange={(
                                                            value:
                                                                | 'product'
                                                                | 'variant'
                                                                | 'combo'
                                                        ) =>
                                                            updateOrderItem(
                                                                index,
                                                                {
                                                                    type: value,
                                                                    id: 0,
                                                                    name: '',
                                                                }
                                                            )
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="product">
                                                                Product
                                                            </SelectItem>
                                                            <SelectItem value="combo">
                                                                Food Combo
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Item</Label>
                                                    <Select
                                                        value={item.id.toString()}
                                                        onValueChange={(
                                                            value
                                                        ) => {
                                                            const id =
                                                                parseInt(value);
                                                            let name = '';

                                                            if (
                                                                item.type ===
                                                                'product'
                                                            ) {
                                                                name =
                                                                    products.find(
                                                                        (p) =>
                                                                            p.id ===
                                                                            id
                                                                    )?.name ||
                                                                    '';
                                                            } else if (
                                                                item.type ===
                                                                'combo'
                                                            ) {
                                                                name =
                                                                    foodCombos.find(
                                                                        (c) =>
                                                                            c.id ===
                                                                            id
                                                                    )?.name ||
                                                                    '';
                                                            }

                                                            updateOrderItem(
                                                                index,
                                                                { id, name }
                                                            );
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select item" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {item.type ===
                                                                'product' &&
                                                                products.map(
                                                                    (
                                                                        product
                                                                    ) => (
                                                                        <SelectItem
                                                                            key={
                                                                                product.id
                                                                            }
                                                                            value={product.id.toString()}
                                                                        >
                                                                            {
                                                                                product.name
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                            {item.type ===
                                                                'combo' &&
                                                                foodCombos.map(
                                                                    (combo) => (
                                                                        <SelectItem
                                                                            key={
                                                                                combo.id
                                                                            }
                                                                            value={combo.id.toString()}
                                                                        >
                                                                            {
                                                                                combo.name
                                                                            }
                                                                        </SelectItem>
                                                                    )
                                                                )}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Quantity</Label>
                                                    <Input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateOrderItem(
                                                                index,
                                                                {
                                                                    quantity:
                                                                        parseInt(
                                                                            e
                                                                                .target
                                                                                .value
                                                                        ) || 1,
                                                                }
                                                            )
                                                        }
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Note</Label>
                                                    <Input
                                                        value={item.note}
                                                        onChange={(e) =>
                                                            updateOrderItem(
                                                                index,
                                                                {
                                                                    note: e
                                                                        .target
                                                                        .value,
                                                                }
                                                            )
                                                        }
                                                        placeholder="Special requests"
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    removeOrderItem(index)
                                                }
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    notes: e.target.value,
                                }))
                            }
                            placeholder="Any special instructions or notes..."
                            rows={3}
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createPreOrderMutation.isPending}
                            className="flex-1"
                        >
                            {createPreOrderMutation.isPending
                                ? 'Creating...'
                                : 'Create Pre-order'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
