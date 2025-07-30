'use client';

import { useEffect, useState } from 'react';
import { Minus, Plus, ShoppingCart, Trash2, Package, Coffee, Utensils } from 'lucide-react';

import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import type { CartItem } from '@/lib/types';
import { useCartStore } from '@/stores/cart-store';

interface CartItemCardProps {
    item: CartItem | any; // Allow API response items too
    onUpdateQuantity: (itemId: string, quantity: number) => void;
    onRemove: (itemId: string) => void;
    isFromApi?: boolean;
}

function CartItemCard({
    item,
    onUpdateQuantity,
    onRemove,
    isFromApi = false,
}: CartItemCardProps) {
    const getItemDisplayName = () => {
        if (isFromApi) {
            return item.name;
        }

        switch (item.type) {
            case 'product_variant':
                return `${item.baseProductName} (${item.variantName})`;
            case 'food_combo':
                return item.name;
            default:
                return item.name;
        }
    };

    const getItemDescription = () => {
        if (isFromApi) {
            return item.note || '';
        }

        switch (item.type) {
            case 'food_combo':
                return `${item.itemsCount} items included`;
            default:
                return item.description;
        }
    };

    const getItemId = () => {
        return isFromApi ? item.tempId : item.id;
    };

    const getItemPrice = () => {
        return isFromApi ? item.totalPrice : item.price * item.quantity;
    };

    const getItemIcon = () => {
        if (isFromApi) {
            switch (item.type) {
                case 'food_combo':
                    return { icon: Utensils, color: 'text-orange-600' };
                case 'product_variant':
                    return { icon: Coffee, color: 'text-blue-600' };
                default:
                    return { icon: Package, color: 'text-green-600' };
            }
        }

        switch (item.type) {
            case 'food_combo':
                return { icon: Utensils, color: 'text-orange-600' };
            case 'product_variant':
                return { icon: Coffee, color: 'text-blue-600' };
            default:
                return { icon: Package, color: 'text-green-600' };
        }
    };

    const { icon: ItemIcon, color: iconColor } = getItemIcon();

    return (
        <Card className="mb-3">
            <CardContent className="p-3">
                <div className="flex gap-3">
                    {/* Item Icon */}
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ItemIcon className={`h-8 w-8 ${iconColor}`} />
                        {item.type === 'food_combo' && (
                            <div className="absolute top-1 left-1">
                                <Badge className="bg-orange-500 text-white text-xs px-1 py-0">
                                    Combo
                                </Badge>
                            </div>
                        )}
                        {isFromApi && (
                            <div className="absolute top-1 right-1">
                                <div
                                    className="w-2 h-2 bg-green-500 rounded-full"
                                    title="Price calculated by system"
                                ></div>
                            </div>
                        )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">
                            {getItemDisplayName()}
                        </h4>

                        {getItemDescription() && (
                            <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                                {getItemDescription()}
                            </p>
                        )}

                        {(isFromApi ? item.note : item.notes) && (
                            <p className="text-xs text-blue-600 italic mt-1">
                                Note: {isFromApi ? item.note : item.notes}
                            </p>
                        )}

                        {!isFromApi &&
                            item.customizations &&
                            item.customizations.length > 0 && (
                                <p className="text-xs text-green-600 mt-1">
                                    {item.customizations.join(', ')}
                                </p>
                            )}

                        {/* Price and Controls */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="text-sm font-semibold text-orange-600">
                                {isFromApi && (
                                    <div className="flex flex-col">
                                        <span>
                                            {item.quantity}x{' '}
                                            {formatVietnameseCurrency(
                                                item.price
                                            )}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatVietnameseCurrency(
                                                getItemPrice()
                                            )}
                                        </span>
                                    </div>
                                )}
                                {!isFromApi &&
                                    formatVietnameseCurrency(getItemPrice())}
                            </div>

                            <div className="flex items-center gap-2">
                                {/* Quantity Controls */}
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                            onUpdateQuantity(
                                                getItemId(),
                                                item.quantity - 1
                                            )
                                        }
                                        disabled={item.quantity <= 1}
                                    >
                                        <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="text-sm font-medium w-6 text-center">
                                        {item.quantity}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() =>
                                            onUpdateQuantity(
                                                getItemId(),
                                                item.quantity + 1
                                            )
                                        }
                                    >
                                        <Plus className="h-3 w-3" />
                                    </Button>
                                </div>

                                {/* Remove Button */}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                                    onClick={() => onRemove(getItemId())}
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function CartSidebar() {
    const [isOpen, setIsOpen] = useState(false);

    const items = useCartStore((state) => state.items);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const getTotalItems = useCartStore((state) => state.getTotalItems);
    const getTotalPrice = useCartStore((state) => state.getTotalPrice);
    const apiResponse = useCartStore((state) => state.apiResponse);
    const isCalculating = useCartStore((state) => state.isCalculating);
    const getDisplayItems = useCartStore((state) => state.getDisplayItems);
    const calculatePrices = useCartStore((state) => state.calculatePrices);

    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();
    const displayItems = getDisplayItems();

    // Recalculate prices when cart is opened and has items but no API response
    useEffect(() => {
        if (isOpen && items.length > 0 && !apiResponse && !isCalculating) {
            console.log('Cart opened - recalculating prices...');
            calculatePrices();
        }
    }, [isOpen, items.length, apiResponse, isCalculating, calculatePrices]);

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {totalItems > 0 && (
                        <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                            {totalItems}
                        </Badge>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart ({totalItems} items)
                    </SheetTitle>
                </SheetHeader>

                <div className="flex flex-col h-full mt-6">
                    {items.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Your cart is empty
                                </h3>
                                <p className="text-gray-600">
                                    Add some delicious items to get started!
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Recalculating notification */}
                            {isCalculating && !apiResponse && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center gap-2 text-blue-700 text-sm">
                                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        Recalculating prices...
                                    </div>
                                </div>
                            )}

                            {/* Cart Items */}
                            <ScrollArea className="flex-1 -mx-6 px-6">
                                {displayItems.length > 0 && apiResponse
                                    ? // Show API response items with calculated prices
                                    displayItems.map((item) => (
                                        <CartItemCard
                                            key={item.tempId}
                                            item={item}
                                            onUpdateQuantity={(
                                                itemId,
                                                quantity
                                            ) => {
                                                // Find local item to update
                                                const localItem = items.find(
                                                    (local) => {
                                                        const localId =
                                                            local.type ===
                                                                'food_combo'
                                                                ? local.comboId
                                                                : local.type ===
                                                                    'product_variant'
                                                                    ? local.variantId
                                                                    : local.productId;
                                                        return (
                                                            localId ===
                                                            item.id &&
                                                            local.type.replace(
                                                                '_',
                                                                ''
                                                            ) ===
                                                            item.type.replace(
                                                                '_',
                                                                ''
                                                            ) &&
                                                            (local.notes ||
                                                                '') ===
                                                            (item.note ||
                                                                '')
                                                        );
                                                    }
                                                );
                                                if (localItem)
                                                    updateQuantity(
                                                        localItem.id,
                                                        quantity
                                                    );
                                            }}
                                            onRemove={(itemId) => {
                                                // Find local item to remove
                                                const localItem = items.find(
                                                    (local) => {
                                                        const localId =
                                                            local.type ===
                                                                'food_combo'
                                                                ? local.comboId
                                                                : local.type ===
                                                                    'product_variant'
                                                                    ? local.variantId
                                                                    : local.productId;
                                                        return (
                                                            localId ===
                                                            item.id &&
                                                            local.type.replace(
                                                                '_',
                                                                ''
                                                            ) ===
                                                            item.type.replace(
                                                                '_',
                                                                ''
                                                            ) &&
                                                            (local.notes ||
                                                                '') ===
                                                            (item.note ||
                                                                '')
                                                        );
                                                    }
                                                );
                                                if (localItem)
                                                    removeItem(localItem.id);
                                            }}
                                            isFromApi={true}
                                        />
                                    ))
                                    : // Fallback to local items
                                    items.map((item) => (
                                        <CartItemCard
                                            key={item.id}
                                            item={item}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeItem}
                                            isFromApi={false}
                                        />
                                    ))}
                            </ScrollArea>

                            {/* Cart Summary */}
                            <div className="border-t pt-4 mt-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>
                                            Subtotal ({totalItems} items)
                                            {apiResponse && (
                                                <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                                                    <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                                                    Calculated
                                                </span>
                                            )}
                                        </span>
                                        <span>
                                            {isCalculating ? (
                                                <span className="text-muted-foreground">
                                                    Calculating...
                                                </span>
                                            ) : (
                                                formatVietnameseCurrency(
                                                    totalPrice
                                                )
                                            )}
                                        </span>
                                    </div>
                                    {apiResponse?.totalPromotion && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Promotion Discount</span>
                                            <span>
                                                -
                                                {formatVietnameseCurrency(
                                                    apiResponse.total -
                                                    apiResponse.totalPromotion
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span>Delivery Fee</span>
                                        <span>Free</span>
                                    </div>
                                    <Separator />
                                    <div className="flex justify-between text-lg font-semibold">
                                        <span>Total</span>
                                        <span className="text-orange-600">
                                            {isCalculating ? (
                                                <span className="text-muted-foreground">
                                                    Calculating...
                                                </span>
                                            ) : (
                                                formatVietnameseCurrency(
                                                    apiResponse?.totalPromotion ||
                                                    totalPrice
                                                )
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2 mt-4">
                                    <Button
                                        className="w-full bg-orange-500 hover:bg-orange-600"
                                        disabled={
                                            isCalculating || totalItems === 0
                                        }
                                    >
                                        {isCalculating
                                            ? 'Calculating...'
                                            : 'Proceed to Checkout'}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={clearCart}
                                    >
                                        Clear Cart
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
