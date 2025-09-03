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
    Navigation,
    Clock,
    AlertCircle,
} from 'lucide-react';
import { useState, useEffect } from 'react';
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
import {
    getBranchDistance,
    getCurrentLocationAddress,
    type DistanceResult,
} from '@/utils/distance';

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

// Helper function to extract distance in km from string like "5.2 km"
const extractDistanceInKm = (distanceString: string): number | null => {
    const match = distanceString.match(/(\d+\.?\d*)\s*km/i);
    return match ? parseFloat(match[1]) : null;
};

export function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deliveryOrder, setDeliveryOrder] = useState<DeliveryOrder | null>(
        null
    );
    const [selectedBranch, setSelectedBranch] =
        useState<BranchResponseDto | null>(null);
    const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);
    const [distanceInfo, setDistanceInfo] = useState<DistanceResult | null>(
        null
    );
    const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

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

    // Check if branch is within delivery radius
    const isWithinDeliveryRadius = () => {
        if (!distanceInfo) return true; // Allow if distance not calculated
        const distanceInKm = extractDistanceInKm(distanceInfo.distance);
        return distanceInKm === null || distanceInKm <= 15;
    };

    // Auto-fill current location and reset when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            // Auto-fill current location
            const fillCurrentLocation = async () => {
                setIsLoadingLocation(true);
                try {
                    const address = await getCurrentLocationAddress();
                    form.setValue('address', address);
                } catch (err) {
                    console.error('Auto-fill location error:', err);
                    // Fail silently - user can manually enter address
                } finally {
                    setIsLoadingLocation(false);
                }
            };

            fillCurrentLocation();
        } else {
            setSelectedBranch(null);
            setDistanceInfo(null);
            setIsCalculatingDistance(false);
            setIsLoadingLocation(false);
            form.reset();
        }
    }, [isOpen, form]);

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

        // Check delivery radius
        if (!isWithinDeliveryRadius()) {
            error(
                'Error',
                'Delivery is only available within 15km radius from the selected branch'
            );
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

    const handleBranchSelect = async (branch: BranchResponseDto) => {
        // Reset previous state first
        setDistanceInfo(null);
        setIsCalculatingDistance(false);

        // Set new branch
        setSelectedBranch(branch);
        form.setValue('branchId', branch.id);
        setBranchPopoverOpen(false);

        // Calculate distance if branch has coordinates
        if (branch.lat && branch.lng) {
            setIsCalculatingDistance(true);

            try {
                console.log('Calculating distance for branch:', branch.name, {
                    lat: branch.lat,
                    lng: branch.lng,
                });
                const distance = await getBranchDistance(
                    branch.lat,
                    branch.lng
                );
                console.log('Distance calculated:', distance);
                setDistanceInfo(distance);
            } catch (error) {
                console.warn('Distance calculation failed:', error);
                // Don't show error to user, just fail silently
            } finally {
                setIsCalculatingDistance(false);
            }
        } else {
            console.log('Branch has no coordinates:', branch.name);
            setDistanceInfo(null);
        }
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
            <DialogContent className="max-w-5xl mx-auto max-h-[95vh] overflow-y-auto w-[95vw] sm:w-[90vw] md:w-full">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                        <MapPin className="h-5 w-5" />
                        Delivery Information
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">
                        Please fill in all required information for delivery
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                    {/* Left Column - Customer Information Form */}
                    <div className="order-2 lg:order-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Customer Information
                        </h3>

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
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                <User className="h-4 w-4" />
                                                Full Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your full name"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className="h-11"
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
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                <Phone className="h-4 w-4" />
                                                Phone Number
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Enter your phone number"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                    className="h-11"
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
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                <MapPin className="h-4 w-4" />
                                                Delivery Address
                                                {isLoadingLocation && (
                                                    <div className="flex items-center gap-1 text-xs text-blue-600">
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                        <span>
                                                            Getting your
                                                            location...
                                                        </span>
                                                    </div>
                                                )}
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder={
                                                        isLoadingLocation
                                                            ? 'Getting your current location...'
                                                            : 'Enter full address (house number, street, ward, district, city)'
                                                    }
                                                    className="min-h-[80px] resize-none"
                                                    {...field}
                                                    disabled={
                                                        isSubmitting ||
                                                        isLoadingLocation
                                                    }
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
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                <Building2 className="h-4 w-4" />
                                                Branch
                                            </FormLabel>
                                            <FormControl>
                                                <div className="space-y-2">
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
                                                                className="w-full justify-between h-auto min-h-[44px] p-3"
                                                                disabled={
                                                                    isSubmitting
                                                                }
                                                            >
                                                                {selectedBranch ? (
                                                                    <div className="flex flex-col items-start w-full min-w-0">
                                                                        <span className="font-medium text-left truncate w-full">
                                                                            {
                                                                                selectedBranch.name
                                                                            }
                                                                        </span>
                                                                        {selectedBranch.address && (
                                                                            <span className="text-xs text-gray-500 text-left truncate w-full mt-0.5">
                                                                                {
                                                                                    selectedBranch.address
                                                                                }
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-500">
                                                                        Select
                                                                        branch...
                                                                    </span>
                                                                )}
                                                                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </PopoverTrigger>
                                                        <PopoverContent
                                                            className="w-[90vw] sm:w-[400px] p-0"
                                                            align="start"
                                                        >
                                                            <Command>
                                                                <CommandInput placeholder="Search branches..." />
                                                                <CommandList>
                                                                    <CommandEmpty>
                                                                        No
                                                                        branches
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
                                                                                    <div className="flex flex-col w-full min-w-0">
                                                                                        <span className="font-medium truncate">
                                                                                            {
                                                                                                branch.name
                                                                                            }
                                                                                        </span>
                                                                                        {branch.address && (
                                                                                            <span className="text-xs text-gray-500 truncate mt-0.5">
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

                                                    {/* Distance Information - Separate from button */}
                                                    {selectedBranch && (
                                                        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                            {isCalculatingDistance && (
                                                                <div className="flex items-center gap-2 text-sm text-blue-600">
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    <span>
                                                                        Calculating
                                                                        distance...
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {distanceInfo &&
                                                                !isCalculatingDistance && (
                                                                    <div className="space-y-2">
                                                                        <div className="flex items-center justify-between text-sm">
                                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                                <Navigation className="w-4 h-4" />
                                                                                <span>
                                                                                    Distance:{' '}
                                                                                    {
                                                                                        distanceInfo.distance
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                                <Clock className="w-4 h-4" />
                                                                                <span>
                                                                                    {
                                                                                        distanceInfo.duration
                                                                                    }
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        {!isWithinDeliveryRadius() && (
                                                                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                                                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                                                <span>
                                                                                    This
                                                                                    branch
                                                                                    is
                                                                                    outside
                                                                                    our
                                                                                    15km
                                                                                    delivery
                                                                                    radius
                                                                                </span>
                                                                            </div>
                                                                        )}
                                                                        {isWithinDeliveryRadius() &&
                                                                            distanceInfo && (
                                                                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                                                                                    <div className="w-2 h-2 bg-green-600 rounded-full shrink-0"></div>
                                                                                    <span>
                                                                                        Available
                                                                                        for
                                                                                        delivery
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                    </div>
                                                                )}
                                                        </div>
                                                    )}
                                                </div>
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
                                            <FormLabel className="flex items-center gap-2 text-sm font-medium">
                                                <MessageSquare className="h-4 w-4" />
                                                Notes (Optional)
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Special notes for your order..."
                                                    className="min-h-[60px] resize-none"
                                                    {...field}
                                                    disabled={isSubmitting}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col sm:flex-row gap-3 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1 h-12 font-medium"
                                        onClick={handleModalClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-white font-medium"
                                        disabled={
                                            isSubmitting ||
                                            items.length === 0 ||
                                            !apiResponse ||
                                            !isWithinDeliveryRadius()
                                        }
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating Order...
                                            </>
                                        ) : (
                                            'Create Order'
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="order-1 lg:order-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Order Summary
                        </h3>

                        {/* Price Breakdown */}
                        <div className="bg-white border border-gray-200 rounded-lg p-4 sticky top-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalItems} items)</span>
                                    <span className="font-medium">
                                        {formatVietnameseCurrency(totalPrice)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Shipping Fee</span>
                                    <span className="font-medium">
                                        {formatVietnameseCurrency(shippingFee)}
                                    </span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span className="text-orange-600">
                                        {formatVietnameseCurrency(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Delivery Info */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-xs text-gray-600 space-y-1">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        <span>
                                            Delivery within 15km radius only
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            Estimated delivery: 30-45 minutes
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
