'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
    Loader2,
    MapPin,
    User,
    Phone,
    MessageSquare,
    Building2,
    ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { useBranches, type BranchResponseDto } from '@/api/v1/branches';
import { createDeliveryOrder } from '@/api/v1/delivery/delivery-order';
import type {
    CreateDeliveryOrderRequest,
    DeliveryOrder,
} from '@/api/v1/delivery/delivery-order';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
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
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useCustomToast } from '@/lib/show-toast';
import type {
    CartItem,
    ProductCartItem,
    ProductVariantCartItem,
    FoodComboCartItem,
} from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';

import { OrderDetailsModal } from './OrderDetailsModal';

// Form validation schema
const checkoutFormSchema = z.object({
    name: z.string().min(1, 'Name is required').trim(),
    phone: z
        .string()
        .min(1, 'Phone number is required')
        .regex(/^[0-9+\-\s()]+$/, 'Invalid phone number format')
        .trim(),
    address: z.string().min(1, 'Delivery address is required').trim(),
    branchId: z.number().min(1, 'Branch selection is required'),
    note: z.string().trim(),
});

type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryOrder, setDeliveryOrder] = useState<DeliveryOrder | null>(
        null
    );
    const [selectedBranch, setSelectedBranch] =
        useState<BranchResponseDto | null>(null);
    const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);

    const items = useCartStore((state) => state.items);
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);
    const apiResponse = useCartStore((state) => state.apiResponse);
    const clearCart = useCartStore((state) => state.clearCart);

    const { success, error } = useCustomToast();

    // Fetch branches
    const { data: branches = [] } = useBranches({
        page: 0,
        size: 1000,
        sortBy: 'name',
        status: 'ACTIVE',
    });

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutFormSchema),
        defaultValues: {
            name: '',
            phone: '',
            address: '',
            branchId: 0,
            note: '',
        },
    });

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const shippingFee = 20000; // Fixed shipping fee
    const finalTotal = totalPrice + shippingFee;

    // Transform cart items to API request format
    const transformCartItemsToApiRequest = (
        items: CartItem[],
        formData: CheckoutFormData
    ): CreateDeliveryOrderRequest => {
        const request: CreateDeliveryOrderRequest = {
            foodCombo: [],
            productVariant: [],
            product: [],
            address: formData.address,
            branchId: formData.branchId,
            note: formData.note,
            phone: formData.phone,
            name: formData.name,
        };

        items.forEach((item) => {
            const baseItem = {
                note: item.notes || '',
                quantity: item.quantity,
            };

            switch (item.type) {
                case 'food_combo':
                    const comboItem = item as FoodComboCartItem;
                    request.foodCombo.push({
                        ...baseItem,
                        id: comboItem.comboId,
                        tempId: `fc_${comboItem.comboId}`,
                    });
                    break;
                case 'product_variant':
                    const variantItem = item as ProductVariantCartItem;
                    request.productVariant.push({
                        ...baseItem,
                        id: variantItem.variantId,
                        tempId: `pv_${variantItem.variantId}`,
                    });
                    break;
                case 'product':
                    const productItem = item as ProductCartItem;
                    request.product.push({
                        ...baseItem,
                        id: productItem.productId,
                        tempId: `p_${productItem.productId}`,
                    });
                    break;
            }
        });

        return request;
    };

    const onSubmit = async (data: CheckoutFormData) => {
        if (items.length === 0) {
            error('Error', 'Cart is empty');
            return;
        }

        if (!apiResponse) {
            error('Error', 'Please wait for price calculation');
            return;
        }

        if (!selectedBranch) {
            error('Error', 'Please select a branch');
            return;
        }

        setIsSubmitting(true);

        try {
            const apiRequest = transformCartItemsToApiRequest(items, data);
            const response = await createDeliveryOrder(apiRequest);

            if (response.success) {
                success('Success', 'Order has been created successfully');
                setDeliveryOrder(response.data);
                // Clear cart after successful order creation
                clearCart();
            } else {
                error('Error', 'Unable to create order');
            }
        } catch (err) {
            console.error('Create order error:', err);
            error('Error', 'An error occurred while creating order');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOrderDetailsClose = () => {
        setDeliveryOrder(null);
        onClose();
    };

    const handleModalClose = () => {
        if (!isSubmitting) {
            form.reset();
            setSelectedBranch(null);
            setBranchPopoverOpen(false);
            onClose();
        }
    };

    const handleBranchSelect = (branch: BranchResponseDto) => {
        setSelectedBranch(branch);
        form.setValue('branchId', branch.id);
        setBranchPopoverOpen(false);
    };

    // Show order details modal if we have a delivery order
    if (deliveryOrder) {
        return (
            <OrderDetailsModal
                isOpen={true}
                order={deliveryOrder}
                onClose={handleOrderDetailsClose}
            />
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleModalClose}>
            <DialogContent className="max-w-md mx-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Delivery Information
                    </DialogTitle>
                    <DialogDescription>
                        Please fill in all required information for delivery
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-sm mb-2">
                            Order Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal ({totalItems} items)</span>
                                <span>
                                    {formatVietnameseCurrency(totalPrice)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fee</span>
                                <span>
                                    {formatVietnameseCurrency(shippingFee)}
                                </span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                                <span>Total</span>
                                <span className="text-orange-600">
                                    {formatVietnameseCurrency(finalTotal)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Information Form */}
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4"
                        >
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            Full Name *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your full name"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Phone className="h-4 w-4" />
                                            Phone Number *
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your phone number"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Delivery Address *
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter full address (house number, street, ward, district, city)"
                                                className="min-h-[80px]"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="branchId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Branch *
                                        </FormLabel>
                                        <FormControl>
                                            <Popover
                                                open={branchPopoverOpen}
                                                onOpenChange={
                                                    setBranchPopoverOpen
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        className="w-full justify-between"
                                                        disabled={isSubmitting}
                                                    >
                                                        {selectedBranch ? (
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-medium">
                                                                    {
                                                                        selectedBranch.name
                                                                    }
                                                                </span>
                                                                {selectedBranch.address && (
                                                                    <span className="text-xs text-gray-500">
                                                                        {
                                                                            selectedBranch.address
                                                                        }
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            'Select branch...'
                                                        )}
                                                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[400px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Search branches..." />
                                                        <CommandList>
                                                            <CommandEmpty>
                                                                No branches
                                                                found.
                                                            </CommandEmpty>
                                                            <CommandGroup>
                                                                {branches.map(
                                                                    (
                                                                        branch
                                                                    ) => (
                                                                        <CommandItem
                                                                            key={
                                                                                branch.id
                                                                            }
                                                                            onSelect={() =>
                                                                                handleBranchSelect(
                                                                                    branch
                                                                                )
                                                                            }
                                                                            className="cursor-pointer"
                                                                        >
                                                                            <div className="flex flex-col">
                                                                                <span className="font-medium">
                                                                                    {
                                                                                        branch.name
                                                                                    }
                                                                                </span>
                                                                                {branch.address && (
                                                                                    <span className="text-xs text-gray-500">
                                                                                        {
                                                                                            branch.address
                                                                                        }
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </CommandItem>
                                                                    )
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="note"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4" />
                                            Notes (Optional)
                                        </FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Special notes for your order..."
                                                className="min-h-[60px]"
                                                {...field}
                                                disabled={isSubmitting}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleModalClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                                    disabled={
                                        isSubmitting ||
                                        items.length === 0 ||
                                        !apiResponse
                                    }
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Order'
                                    )}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
