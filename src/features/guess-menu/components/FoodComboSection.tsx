'use client';

import { Package, ChevronRight } from 'lucide-react';

import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FoodComboCard, FoodComboCardMobile } from './FoodComboCard';

interface FoodComboSectionProps {
    className?: string;
}

export function FoodComboSection({ className = '' }: FoodComboSectionProps) {
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

                {/* Loading skeleton - Desktop */}
                <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-0">
                                <div className="aspect-[3/2] bg-gray-200"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                                    <div className="h-6 bg-gray-200 rounded"></div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Loading skeleton - Mobile */}
                <div className="md:hidden space-y-3">
                    {[...Array(3)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-0">
                                <div className="flex">
                                    <div className="w-20 h-20 bg-gray-200 rounded-l-lg"></div>
                                    <div className="flex-1 p-3 space-y-2">
                                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                                        <div className="h-6 bg-gray-200 rounded w-16 ml-auto"></div>
                                    </div>
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
                    <p className="text-gray-600">
                        There was an error loading food combos. Please try again
                        later.
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

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {availableCombos.slice(0, 10).map((combo) => (
                    <FoodComboCard key={combo.id} combo={combo} />
                ))}
            </div>

            {/* Mobile List */}
            <div className="md:hidden space-y-3">
                {availableCombos.slice(0, 8).map((combo) => (
                    <FoodComboCardMobile key={combo.id} combo={combo} />
                ))}
            </div>

            {/* Show more button - Desktop */}
            {availableCombos.length > 10 && (
                <div className="hidden md:block text-center">
                    <Button
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                        View All Combos ({availableCombos.length - 10} more)
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}

            {/* Show more button - Mobile */}
            {availableCombos.length > 8 && (
                <div className="md:hidden text-center">
                    <Button
                        variant="outline"
                        className="text-orange-600 border-orange-600 hover:bg-orange-50"
                    >
                        View All Combos ({availableCombos.length - 8} more)
                        <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            )}
        </div>
    );
}
