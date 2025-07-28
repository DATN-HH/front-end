'use client';

import { Clock, Package, Plus } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { FoodComboResponse } from '@/api/v1/menu/food-combos';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { AddToMenuBookingDialog } from './AddToMenuBookingDialog';

interface FoodComboSectionBookingProps {
    combos: FoodComboResponse[];
    isLoading: boolean;
}

interface FoodComboCardProps {
    combo: FoodComboResponse;
    onAddClick: (combo: FoodComboResponse) => void;
}

function FoodComboCard({ combo, onAddClick }: FoodComboCardProps) {
    const itemsList =
        combo.comboItems
            ?.map((item) => `${item.quantity}x ${item.productName}`)
            .join(', ') || '';

    return (
        <Card className="group hover:shadow-md transition-all duration-300 overflow-hidden">
            <CardContent className="p-0">
                {/* Mobile: Horizontal Layout, Desktop: Vertical Layout */}
                <div className="flex md:flex-col">
                    {/* Image */}
                    <div className="relative w-24 h-24 md:w-full md:aspect-[4/3] overflow-hidden flex-shrink-0">
                        <Image
                            src={combo.image ?? '/placeholder.svg'}
                            alt={combo.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 96px, (max-width: 1200px) 50vw, 33vw"
                        />

                        {/* Combo Badge */}
                        <div className="absolute top-1 left-1 md:top-2 md:left-2">
                            <Badge className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                                <Package className="w-3 h-3 mr-1" />
                                Combo
                            </Badge>
                        </div>

                        {combo.estimateTime && (
                            <div className="absolute top-1 right-1 md:top-2 md:right-2">
                                <Badge className="bg-black/70 text-white text-xs">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {combo.estimateTime}min
                                </Badge>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-3 md:p-4 space-y-2 md:space-y-3">
                        <div>
                            <h3 className="font-semibold text-sm md:text-lg text-gray-900 line-clamp-1">
                                {combo.name}
                            </h3>

                            {/* Combo Items Preview */}
                            {itemsList && (
                                <div className="mt-1 md:mt-2">
                                    <p className="text-xs font-medium text-gray-500 mb-1 hidden md:block">
                                        Includes:
                                    </p>
                                    <p className="text-xs text-gray-600 line-clamp-1 md:line-clamp-2">
                                        {itemsList}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm md:text-lg font-bold text-orange-600">
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

                            <Button
                                size="sm"
                                className="bg-orange-500 hover:bg-orange-600 h-7 md:h-9 text-xs md:text-sm px-2 md:px-3"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onAddClick(combo);
                                }}
                            >
                                <Plus className="h-3 w-3 mr-1" />
                                Add
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export function FoodComboSectionBooking({
    combos,
    isLoading,
}: FoodComboSectionBookingProps) {
    const [selectedCombo, setSelectedCombo] =
        useState<FoodComboResponse | null>(null);
    const [showAddToBookingDialog, setShowAddToBookingDialog] = useState(false);

    const handleAddClick = (combo: FoodComboResponse) => {
        setSelectedCombo(combo);
        setShowAddToBookingDialog(true);
    };

    const handleCloseDialog = () => {
        setShowAddToBookingDialog(false);
        setSelectedCombo(null);
    };

    const getBookingItem = () => {
        if (!selectedCombo) return null;

        return {
            id: selectedCombo.id,
            name: selectedCombo.name,
            price: selectedCombo.price || 0,
            type: 'combo' as const,
            comboId: selectedCombo.id,
        };
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    if (!combos || combos.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No food combos available</p>
            </div>
        );
    }

    return (
        <>
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                    Food Combos
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {combos.map((combo) => (
                        <FoodComboCard
                            key={combo.id}
                            combo={combo}
                            onAddClick={handleAddClick}
                        />
                    ))}
                </div>
            </div>

            {/* Add to Menu Booking Dialog */}
            {getBookingItem() && (
                <AddToMenuBookingDialog
                    isOpen={showAddToBookingDialog}
                    onClose={handleCloseDialog}
                    item={getBookingItem()!}
                    quickNotes={[
                        'No spicy',
                        'Extra sauce',
                        'Less salt',
                        'Well done',
                    ]}
                />
            )}
        </>
    );
}
