'use client';

import { Clock, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { FoodComboResponse } from '@/api/v1/menu/food-combos';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { AddToCartDialog } from '@/components/common/AddToCartDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCustomToast } from '@/lib/show-toast';
import { useCartStore } from '@/stores/cart-store';

interface FoodComboCardProps {
    combo: FoodComboResponse;
    className?: string;
}

// Desktop version - vertical card
export function FoodComboCard({ combo, className = '' }: FoodComboCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const addFoodCombo = useCartStore((state) => state.addFoodCombo);
    const { success } = useCustomToast();

    // Create comma-separated list of items
    const itemsList =
        combo.comboItems
            ?.map((item) => `${item.quantity}x ${item.productName}`)
            .join(', ') || '';

    const handleAddToCart = (
        quantity: number,
        notes?: string,
        customizations?: string[]
    ) => {
        addFoodCombo(combo, {
            quantity,
            notes,
            customizations,
        });
        success('Added to Cart', `${combo.name} added to cart`);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card
                className={`group hover:shadow-md transition-all duration-300 overflow-hidden ${className}`}
            >
                <CardContent className="p-0">
                    {/* Image Section - Smaller aspect ratio */}
                    <div className="relative aspect-[3/2] overflow-hidden">
                        <Image
                            src={combo.image ?? '/placeholder.svg'}
                            alt={combo.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Combo Badge */}
                        <div className="absolute top-2 left-2">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                <Package className="w-3 h-3 mr-1" />
                                Combo
                            </Badge>
                        </div>
                    </div>

                    {/* Content Section - More compact */}
                    <div className="p-3 space-y-2">
                        {/* Title */}
                        <Link href={`/menu/food-combo/${combo.id}`}>
                            <h3 className="font-semibold text-base text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors cursor-pointer">
                                {combo.name}
                            </h3>
                        </Link>

                        {/* Combo Items Preview - Single line with commas */}
                        {itemsList && (
                            <div>
                                <p className="text-xs font-medium text-gray-500 mb-1">
                                    Includes:
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-1">
                                    {itemsList}
                                </p>
                            </div>
                        )}

                        {/* Price and Time */}
                        <div className="flex items-center justify-between pt-2">
                            <div className="space-y-1">
                                <div className="text-lg font-bold text-orange-600">
                                    {formatVietnameseCurrency(
                                        combo.effectivePrice
                                    )}
                                </div>
                                {combo.calculatedPrice !==
                                    combo.effectivePrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                        {formatVietnameseCurrency(
                                            combo.calculatedPrice
                                        )}
                                    </div>
                                )}
                            </div>

                            {combo.estimateTime && (
                                <div className="flex items-center text-xs text-gray-500">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {combo.estimateTime} min
                                </div>
                            )}
                        </div>

                        {/* Action Button */}
                        <Button
                            onClick={handleButtonClick}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                            size="sm"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Add to Cart Dialog */}
            <AddToCartDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={combo.name}
                description={itemsList}
                price={combo.effectivePrice}
                onAddToCart={handleAddToCart}
                formatPrice={formatVietnameseCurrency}
            />
        </>
    );
}

// Mobile version - horizontal card
export function FoodComboCardMobile({
    combo,
    className = '',
}: FoodComboCardProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const addFoodCombo = useCartStore((state) => state.addFoodCombo);
    const { success } = useCustomToast();

    // Create comma-separated list of items
    const itemsList =
        combo.comboItems
            ?.map((item) => `${item.quantity}x ${item.productName}`)
            .join(', ') || '';

    const handleAddToCart = (
        quantity: number,
        notes?: string,
        customizations?: string[]
    ) => {
        addFoodCombo(combo, {
            quantity,
            notes,
            customizations,
        });
        success('Added to Cart', `${combo.name} added to cart`);
    };

    const handleButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDialogOpen(true);
    };

    return (
        <>
            <Card
                className={`group hover:shadow-md transition-all duration-300 ${className}`}
            >
                <CardContent className="p-0">
                    <div className="flex">
                        {/* Image */}
                        <div className="relative w-20 h-20 flex-shrink-0">
                            <Image
                                src={combo.image ?? '/placeholder.svg'}
                                alt={combo.name}
                                fill
                                className="object-cover rounded-l-lg"
                                sizes="80px"
                            />
                            <div className="absolute top-1 left-1">
                                <Badge className="bg-orange-500 text-white text-xs px-1 py-0.5">
                                    Combo
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-3 min-w-0">
                            <div className="space-y-1">
                                <Link href={`/menu/food-combo/${combo.id}`}>
                                    <h4 className="font-medium text-gray-900 line-clamp-1 text-sm hover:text-orange-600 transition-colors cursor-pointer">
                                        {combo.name}
                                    </h4>
                                </Link>

                                {/* Items list */}
                                {itemsList && (
                                    <p className="text-xs text-gray-600 line-clamp-1">
                                        {itemsList}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                    <div className="space-y-0.5">
                                        <div className="text-base font-bold text-orange-600">
                                            {formatVietnameseCurrency(
                                                combo.effectivePrice
                                            )}
                                        </div>
                                        {combo.calculatedPrice !==
                                            combo.effectivePrice && (
                                            <div className="text-xs text-gray-500 line-through">
                                                {formatVietnameseCurrency(
                                                    combo.calculatedPrice
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end gap-1">
                                        {combo.estimateTime && (
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {combo.estimateTime} min
                                            </div>
                                        )}

                                        <Button
                                            onClick={handleButtonClick}
                                            size="sm"
                                            className="bg-orange-500 hover:bg-orange-600 text-white text-xs px-3 py-1"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Add to Cart Dialog */}
            <AddToCartDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                title={combo.name}
                description={itemsList}
                price={combo.effectivePrice}
                onAddToCart={handleAddToCart}
                formatPrice={formatVietnameseCurrency}
            />
        </>
    );
}
