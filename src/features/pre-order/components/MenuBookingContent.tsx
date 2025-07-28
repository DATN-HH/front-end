'use client';

import { useState, useEffect } from 'react';

import { useAllCategories } from '@/api/v1/menu/categories';
import { useAllFoodCombos } from '@/api/v1/menu/food-combos';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { CategoryWithProducts } from './CategoryWithProducts';
import { FoodComboSectionBooking } from './FoodComboSectionBooking';
import { MenuCategorySectionBooking } from './MenuCategorySectionBooking';

export function MenuBookingContent() {
    const [activeCategory, setActiveCategory] = useState<number | 'all' | null>(
        null
    );

    const { data: categories, isLoading: categoriesLoading } =
        useAllCategories();
    const { data: combos, isLoading: combosLoading } = useAllFoodCombos();

    // Set "all" as active when categories load
    useEffect(() => {
        if (categories && categories.length > 0 && activeCategory === null) {
            setActiveCategory('all');
        }
    }, [categories, activeCategory]);

    if (categoriesLoading) {
        return (
            <div className="space-y-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton
                            key={i}
                            className="h-10 w-24 rounded-full flex-shrink-0"
                        />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Skeleton key={i} className="h-64 rounded-lg" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h2 className="text-2xl font-bold mb-6">Choose Your Dishes</h2>

                <Tabs defaultValue="products" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="products">Products</TabsTrigger>
                        <TabsTrigger value="combos">Food Combos</TabsTrigger>
                    </TabsList>

                    <TabsContent value="products" className="space-y-6">
                        {/* Category Navigation */}
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {/* All Tab */}
                            <Button
                                variant={
                                    activeCategory === 'all'
                                        ? 'default'
                                        : 'outline'
                                }
                                size="sm"
                                className={`flex-shrink-0 ${
                                    activeCategory === 'all'
                                        ? 'bg-orange-500 hover:bg-orange-600'
                                        : 'hover:bg-orange-50'
                                }`}
                                onClick={() => setActiveCategory('all')}
                            >
                                All
                            </Button>

                            {/* Category Tabs - Only show categories with products */}
                            {categories?.map((category) => (
                                <CategoryWithProducts
                                    key={category.id}
                                    categoryId={category.id}
                                    categoryName={category.name}
                                    isActive={activeCategory === category.id}
                                    onClick={() =>
                                        setActiveCategory(category.id)
                                    }
                                />
                            ))}
                        </div>

                        {/* Products by Category */}
                        <div className="space-y-8">
                            {activeCategory === 'all'
                                ? // Show all categories when "All" is selected
                                  categories?.map((category) => (
                                      <MenuCategorySectionBooking
                                          key={category.id}
                                          categoryId={category.id}
                                          categoryName={category.name}
                                      />
                                  ))
                                : // Show specific category
                                  categories?.map((category) => (
                                      <div
                                          key={category.id}
                                          className={
                                              activeCategory === category.id
                                                  ? 'block'
                                                  : 'hidden'
                                          }
                                      >
                                          <MenuCategorySectionBooking
                                              categoryId={category.id}
                                              categoryName={category.name}
                                          />
                                      </div>
                                  ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="combos" className="space-y-6">
                        <FoodComboSectionBooking
                            combos={combos || []}
                            isLoading={combosLoading}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
