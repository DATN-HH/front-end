'use client';

import { Search } from 'lucide-react';
import { useState, useMemo } from 'react';

import { useAllCategories, CategoryResponse } from '@/api/v1/menu/categories';
import {
    MenuProduct,
    MenuVariant,
    getVariantDisplayName,
} from '@/api/v1/menu/menu-products';
import { MenuCategorySection } from '@/components/common/MenuCategorySection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useCustomToast } from '@/lib/show-toast';

export default function MenuPage() {
    const [selectedCategory, setSelectedCategory] = useState<number | 'All'>(
        'All'
    );
    const [searchQuery, setSearchQuery] = useState('');

    // Toast for notifications
    const { success, error } = useCustomToast();

    // Fetch categories data
    const { data: categoriesData, isLoading: categoriesLoading } =
        useAllCategories();

    // Process categories for UI
    const categories = useMemo(() => {
        if (!categoriesData) return [];
        // Filter out categories without products (will be handled by lazy loading)
        return categoriesData.filter((cat) => cat.status === 'ACTIVE');
    }, [categoriesData]);

    // Get filtered categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter((category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    // Handle add to cart
    const handleAddToCart = (
        product: MenuProduct,
        variant: MenuVariant | null,
        quantity: number,
        note?: string
    ) => {
        const itemName = variant
            ? `${product.name} (${getVariantDisplayName(variant)})`
            : product.name;
        const noteText = note ? ` with note: "${note}"` : '';
        success(
            'Added to Cart',
            `${quantity}x ${itemName} added to cart${noteText}`
        );

        // Here you would typically dispatch to a cart context or state management
        console.log('Add to cart:', { product, variant, quantity, note });
    };

    // Show loading state
    if (categoriesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                <div className="container mx-auto px-4 py-16 text-center">
                    <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4">
                        Culinary Excellence
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                        Discover our carefully crafted dishes made with the
                        finest ingredients and traditional techniques
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        {/* Category Filter */}
                        <Select
                            value={selectedCategory.toString()}
                            onValueChange={(value) =>
                                setSelectedCategory(
                                    value === 'All' ? 'All' : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger className="w-full lg:w-48">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">
                                    All Categories
                                </SelectItem>
                                {categories.map((category) => (
                                    <SelectItem
                                        key={category.id}
                                        value={category.id.toString()}
                                    >
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Menu Categories with Lazy Loading */}
                <div className="space-y-8 md:space-y-12">
                    {selectedCategory === 'All'
                        ? // Show all categories
                          filteredCategories.map((category) => (
                              <MenuCategorySection
                                  key={category.id}
                                  categoryId={category.id}
                                  categoryName={category.name}
                                  onAddToCart={handleAddToCart}
                              />
                          ))
                        : // Show specific category
                          (() => {
                              const category = categories.find(
                                  (cat) => cat.id === selectedCategory
                              );
                              return category ? (
                                  <MenuCategorySection
                                      key={category.id}
                                      categoryId={category.id}
                                      categoryName={category.name}
                                      onAddToCart={handleAddToCart}
                                  />
                              ) : null;
                          })()}
                </div>

                {/* No Results Message */}
                {filteredCategories.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground mb-4">
                            No categories found matching "{searchQuery}".
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('All');
                            }}
                        >
                            Clear Search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
