'use client';

import { Package, ChevronRight, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SelfOrderFoodComboSectionProps {
    className?: string;
    currentOrderItems: any[];
    onUpdateTempOrder: (items: any[]) => void;
}

interface SelfOrderFoodComboCardProps {
    combo: any;
    currentOrderItems: any[];
    onUpdateTempOrder: (items: any[]) => void;
}

function SelfOrderFoodComboCard({
    combo,
    currentOrderItems,
    onUpdateTempOrder,
}: SelfOrderFoodComboCardProps) {
    const router = useRouter();

    // Find current ordered quantity for this combo (both existing and new items)
    const existingItems = currentOrderItems.filter(
        (item) => item.comboId === combo.id && item.isCombo && item.orderItemId
    );
    const newItems = currentOrderItems.filter(
        (item) => item.comboId === combo.id && item.isCombo && !item.orderItemId
    );

    const existingQuantity = existingItems.reduce(
        (sum, item) => sum + item.quantity,
        0
    );
    const newQuantity = newItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalQuantity = existingQuantity + newQuantity;

    const handleQuantityChange = (increment: boolean) => {
        const targetNewQuantity = increment
            ? newQuantity + 1
            : Math.max(0, newQuantity - 1);

        // Remove all new items for this combo first
        const filteredItems = currentOrderItems.filter(
            (item) =>
                !(
                    item.comboId === combo.id &&
                    item.isCombo &&
                    !item.orderItemId
                )
        );

        // Add new item with the target quantity if > 0
        if (targetNewQuantity > 0) {
            filteredItems.push({
                comboId: combo.id,
                comboName: combo.name,
                quantity: targetNewQuantity,
                price: combo.price,
                notes: '',
                isCombo: true,
                comboItems:
                    combo.items?.map((item: any) => ({
                        productId: item.productId,
                        productName: item.productName,
                        quantity: item.quantity,
                    })) || [],
                // No orderItemId means this is a new item
            });
        }

        onUpdateTempOrder(filteredItems);
    };

    return (
        <Card className="group overflow-hidden">
            <CardContent className="p-0">
                {/* Combo Image */}
                <div
                    className="aspect-[3/2] relative bg-gray-100 cursor-pointer"
                    onClick={() => router.push(`/menu/food-combo/${combo.id}`)}
                >
                    {combo.image ? (
                        <img
                            src={combo.image}
                            alt={combo.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                        </div>
                    )}
                </div>

                {/* Combo Info */}
                <div className="p-4">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 truncate mb-1">
                        {combo.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {combo.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <p className="font-semibold text-gray-900">
                                {formatVietnameseCurrency(combo.price || 0)}
                            </p>
                            {combo.items?.length > 0 && (
                                <p className="text-xs text-gray-500 mt-1">
                                    {combo.items.length} items included
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            {existingQuantity > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-green-600 mb-1"
                                >
                                    Current: {existingQuantity}
                                </Badge>
                            )}
                            {newQuantity > 0 && (
                                <Badge
                                    variant="secondary"
                                    className="text-blue-600"
                                >
                                    Adding: {newQuantity}
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(false)}
                                disabled={newQuantity === 0}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                                {newQuantity}
                            </span>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleQuantityChange(true)}
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                                router.push(`/menu/food-combo/${combo.id}`)
                            }
                            className="text-blue-600 hover:text-blue-700"
                        >
                            View Details
                        </Button> */}
                    </div>

                    {existingQuantity > 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                            You already have {existingQuantity} of this combo in
                            your order
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export function SelfOrderFoodComboSection({
    className = '',
    currentOrderItems,
    onUpdateTempOrder,
}: SelfOrderFoodComboSectionProps) {
    const { data: combos = [], isLoading, error } = useAllFoodCombos();

    // Filter only active combos that can be sold
    const availableCombos = combos.filter(
        (combo) => combo.status === 'ACTIVE' && combo.canBeSold
    );

    if (isLoading) {
        return (
            <div className={`space-y-6 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Package className="w-6 h-6 text-orange-500" />
                        <h2 className="text-2xl font-bold text-gray-900">
                            Food Combos
                        </h2>
                    </div>
                </div>

                {/* Loading skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-0">
                                <div className="aspect-[3/2] bg-gray-200"></div>
                                <div className="p-4 space-y-3">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                                    <div className="h-8 bg-gray-200 rounded"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <Card className={`${className}`}>
                <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unable to Load Combos
                    </h3>
                    <p className="text-red-600">
                        Failed to load food combos. Please try again later.
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (availableCombos.length === 0) {
        return (
            <Card className={`${className}`}>
                <CardContent className="p-6 text-center">
                    <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No Combos Available
                    </h3>
                    <p className="text-gray-600">
                        We don't have any food combos available at the moment.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={`space-y-6 ${className}`}>
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-6 h-6 text-orange-500" />
                    <h2 className="text-2xl font-bold text-gray-900">
                        Food Combos
                    </h2>
                    <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {availableCombos.length} available
                    </span>
                </div>

                {availableCombos.length > 8 && (
                    <Button
                        variant="ghost"
                        className="text-orange-600 hover:text-orange-700"
                    >
                        View All
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                )}
            </div>

            {/* Combos Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {availableCombos.slice(0, 8).map((combo) => (
                    <SelfOrderFoodComboCard
                        key={combo.id}
                        combo={combo}
                        currentOrderItems={currentOrderItems}
                        onUpdateTempOrder={onUpdateTempOrder}
                    />
                ))}
            </div>
        </div>
    );
}
