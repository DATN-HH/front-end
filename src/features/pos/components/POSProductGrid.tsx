'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

import { useAllCategories } from '@/api/v1/menu/categories';
import { useAvailablePosCombo } from '@/api/v1/menu/food-combos';
import { ProductVariantResponse } from '@/api/v1/menu/product-attributes';
import { useAllProducts } from '@/api/v1/menu/products';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

// Import API hooks and types

import { POSProductVariantModal } from './POSProductVariantModal';

// Types for POS products - based on variants
interface POSProduct {
    id: number;
    variantId?: number;
    name: string;
    displayName: string;
    description?: string;
    image?: string;
    categoryId?: number;
    categoryName?: string;
    price: number;
    effectivePrice: number;
    attributeCombination?: string;
    productTemplateId: number;
    productTemplateName: string;
    status: string;
    isActive?: boolean;
    isCombo?: boolean;
}

interface POSProductGridProps {
    onProductSelect: (product: POSProduct) => void;
}

// Helper function to convert Product to POSProduct
const convertProductToPOSProduct = (
    product: any,
    productVariants?: ProductVariantResponse[]
): POSProduct => {
    // If product has embedded variants or we were provided variants, use them
    const variants =
        productVariants ||
        (product.variants && Array.isArray(product.variants)
            ? product.variants
            : []);

    // If product has variants, use the default priced variant
    if (variants && variants.length > 0) {
        try {
            // Find a variant with a price (prioritize ones with effectivePrice which come from money attributes)
            const defaultVariant =
                variants.find(
                    (v: any) => v?.effectivePrice && v.effectivePrice > 0
                ) ||
                variants.find((v: any) => v?.price && v.price > 0) ||
                variants[0];

            if (defaultVariant?.id) {
                return {
                    id: product.id || 0,
                    variantId: defaultVariant.id,
                    name: product.name || '',
                    displayName:
                        defaultVariant.displayName || product.name || '',
                    description: product.description || '',
                    image: product.image || '',
                    categoryId: product.categoryId,
                    categoryName: product.categoryName || '',
                    price:
                        defaultVariant.effectivePrice ||
                        defaultVariant.price ||
                        product.price ||
                        0,
                    effectivePrice:
                        defaultVariant.effectivePrice ||
                        defaultVariant.price ||
                        product.price ||
                        0,
                    attributeCombination:
                        defaultVariant.attributeCombination || '',
                    productTemplateId: product.id || 0,
                    productTemplateName: product.name || '',
                    status: product.status || 'ACTIVE',
                    isActive:
                        product.canBeSold !== false &&
                        product.status === 'ACTIVE',
                    isCombo: false,
                };
            }
        } catch (err) {
            console.error('Error processing product variant:', err);
            // Continue to default product handling
        }
    }

    // Default product without variants
    return {
        id: product.id,
        variantId: undefined,
        name: product.name,
        displayName: product.name,
        description: product.description,
        image: product.image,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
        price: product.price || 0,
        effectivePrice: product.price || 0,
        attributeCombination: undefined,
        productTemplateId: product.id,
        productTemplateName: product.name,
        status: product.status,
        isActive: product.canBeSold && product.status === 'ACTIVE',
        isCombo: false,
    };
};

// Helper function to convert FoodCombo to POSProduct
const convertComboToPOSProduct = (combo: any): POSProduct => {
    try {
        return {
            id: combo.id || 0,
            variantId: undefined,
            name: combo.name || '',
            displayName: combo.name || '',
            description: combo.description || '',
            image: combo.image || '',
            categoryId: combo.categoryId || combo.posCategoryId || undefined,
            categoryName: combo.categoryName || combo.posCategoryName || '',
            price: combo.price || combo.effectivePrice || 0,
            effectivePrice: combo.effectivePrice || combo.price || 0,
            attributeCombination: `${combo.itemsCount || 0} items`,
            productTemplateId: combo.id || 0,
            productTemplateName: combo.name || '',
            status: combo.status || 'ACTIVE',
            isActive:
                combo.availableInPos !== false && combo.status === 'ACTIVE',
            isCombo: true,
        };
    } catch (err) {
        console.error('Error converting combo to POSProduct:', err);
        // Return a minimal valid POSProduct
        return {
            id: combo.id || 0,
            variantId: undefined,
            name: combo.name || 'Unknown Combo',
            displayName: combo.name || 'Unknown Combo',
            description: '',
            image: '',
            categoryId: undefined,
            categoryName: '',
            price: 0,
            effectivePrice: 0,
            attributeCombination: '',
            productTemplateId: combo.id || 0,
            productTemplateName: combo.name || 'Unknown Combo',
            status: 'ACTIVE',
            isActive: true,
            isCombo: true,
        };
    }
};

export function POSProductGrid({ onProductSelect }: POSProductGridProps) {
    const [selectedCategory, setSelectedCategory] = useState<number | null>(
        null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showVariantModal, setShowVariantModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Fetch categories
    const { data: categoriesData = [], isLoading: categoriesLoading } =
        useAllCategories();

    // Fetch all products
    const { data: allProducts = [], isLoading: productsLoading } =
        useAllProducts();

    // Fetch available food combos for POS
    const { data: allCombos = [], isLoading: combosLoading } =
        useAvailablePosCombo();

    // Create a map to store product variants
    const productVariantsMap = new Map<number, ProductVariantResponse[]>();

    // Instead of fetching variants in a loop, we'll handle them manually
    // by extracting the variants from the products that have them
    const productsWithVariants = allProducts.filter(
        (product: any) =>
            product.variants &&
            Array.isArray(product.variants) &&
            product.variants.length > 0
    );

    // Populate the map with available variants
    productsWithVariants.forEach((product: any) => {
        if (product.variants && Array.isArray(product.variants)) {
            productVariantsMap.set(product.id, product.variants);
        }
    });

    // Convert products to POS products with variant awareness
    let allProductsPOS: POSProduct[] = [];
    try {
        allProductsPOS = allProducts
            .map((product: any) =>
                convertProductToPOSProduct(
                    product,
                    productVariantsMap.get(product.id)
                )
            )
            .filter((product) => product?.isActive);
    } catch (err) {
        console.error('Error processing products:', err);
    }

    // Convert combos to POS products
    let allCombosPOS: POSProduct[] = [];
    try {
        allCombosPOS = allCombos
            .map((combo: any) => convertComboToPOSProduct(combo))
            .filter((combo) => combo?.isActive);
    } catch (err) {
        console.error('Error processing combos:', err);
    }

    // Combine products and combos
    const allPOSProducts = [...allProductsPOS, ...allCombosPOS];

    // Filter by category if selected
    let categoryFilteredProducts: POSProduct[] = allPOSProducts;
    try {
        if (selectedCategory) {
            categoryFilteredProducts = allPOSProducts.filter(
                (product) => product.categoryId === selectedCategory
            );
        }
    } catch (err) {
        console.error('Error filtering by category:', err);
    }

    // Filter products by search query
    let filteredProducts: POSProduct[] = categoryFilteredProducts;
    try {
        if (searchQuery) {
            filteredProducts = categoryFilteredProducts.filter(
                (product) =>
                    (product.displayName || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    (product.productTemplateName || '')
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                    product.description
                        ?.toLowerCase()
                        .includes(searchQuery.toLowerCase())
            );
        }
    } catch (err) {
        console.error('Error filtering by search query:', err);
    }

    return (
        <div className="h-full flex flex-col">
            {/* Search Bar */}
            <div className="bg-white border-b border-gray-200 p-4">
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-10 text-sm"
                    />
                </div>

                {/* Category Tabs - Odoo Style */}
                <div className="flex space-x-1">
                    <Button
                        variant={
                            selectedCategory === null ? 'default' : 'outline'
                        }
                        className={`px-4 py-2 font-medium ${
                            selectedCategory === null
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setSelectedCategory(null)}
                    >
                        All Items ({allPOSProducts.length})
                    </Button>
                    {categoriesData.map((category) => {
                        // Count both products and combos in this category
                        const categoryItemCount = allPOSProducts.filter(
                            (item) => item.categoryId === category.id
                        ).length;

                        // Don't show empty categories
                        if (categoryItemCount === 0) return null;

                        // Count products vs combos to show a breakdown
                        const productsCount = allPOSProducts.filter(
                            (item) =>
                                item.categoryId === category.id && !item.isCombo
                        ).length;

                        const combosCount = allPOSProducts.filter(
                            (item) =>
                                item.categoryId === category.id && item.isCombo
                        ).length;

                        return (
                            <Button
                                key={category.id}
                                variant={
                                    selectedCategory === category.id
                                        ? 'default'
                                        : 'outline'
                                }
                                className={`px-4 py-2 font-medium ${
                                    selectedCategory === category.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                                onClick={() => setSelectedCategory(category.id)}
                            >
                                {category.name} ({categoryItemCount})
                                {combosCount > 0 && productsCount > 0 && (
                                    <span className="text-xs ml-1">
                                        {productsCount}+{combosCount}
                                    </span>
                                )}
                            </Button>
                        );
                    })}
                </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto p-4">
                {productsLoading || combosLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {Array.from({ length: 15 }).map((_, index) => (
                            <Card key={index} className="p-3">
                                <Skeleton className="h-32 w-full mb-3 rounded-lg" />
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-3 w-1/2 mb-2" />
                                <Skeleton className="h-6 w-20" />
                            </Card>
                        ))}
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => {
                                    // If it's a combo, use the existing behavior
                                    if (product.isCombo) {
                                        onProductSelect(product);
                                    } else {
                                        // For regular products, check if we need to show variants
                                        console.log('Product clicked:', product);
                                        console.log('Product ID for variants lookup:', product.productTemplateId);
                                        console.log('Available variants in map:', productVariantsMap);
                                        
                                        // Check if we have variants or need to fetch them
                                        const productVariants =
                                            productVariantsMap.get(
                                                product.productTemplateId
                                            );
                                            
                                        console.log('Found variants for product:', productVariants);
                                            
                                        // Always show the modal when clicking on a non-combo product for testing
                                        setSelectedProduct({
                                            id: product.productTemplateId,
                                            name: product.name,
                                            description: product.description,
                                            image: product.image,
                                            price: product.price,
                                            // Use existing variants or empty array
                                            variants: productVariants || []
                                        });
                                        setShowVariantModal(true);
                                    }
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium mb-2">
                            No products found
                        </h3>
                        <p className="text-sm text-center">
                            {searchQuery
                                ? `No products match "${searchQuery}"`
                                : 'No products available in this category'}
                        </p>
                    </div>
                )}

                {/* Empty State */}
                {!productsLoading && filteredProducts.length === 0 && (
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center text-gray-500">
                            <div className="text-lg font-medium mb-2">
                                No products found
                            </div>
                            <div className="text-sm">
                                {selectedCategory
                                    ? 'No products in this category'
                                    : 'No products available'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Variant Modal */}
            {showVariantModal && selectedProduct && (
                <POSProductVariantModal
                    product={selectedProduct}
                    onVariantSelect={(variant) => {
                        // Map variant to POSProduct format
                        const posProduct: POSProduct = {
                            id: selectedProduct.productTemplateId,
                            variantId: variant.id,
                            name: selectedProduct.name,
                            displayName: variant.displayName,
                            description: selectedProduct.description,
                            image: selectedProduct.image,
                            categoryId: selectedProduct.categoryId,
                            categoryName: selectedProduct.categoryName,
                            price: variant.effectivePrice || 0,
                            effectivePrice: variant.effectivePrice || 0,
                            attributeCombination: variant.attributeCombination,
                            productTemplateId:
                                selectedProduct.productTemplateId,
                            productTemplateName:
                                selectedProduct.productTemplateName,
                            status: selectedProduct.status,
                            isActive: true,
                            isCombo: false,
                        };
                        onProductSelect(posProduct);
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                    }}
                    onClose={() => {
                        setShowVariantModal(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </div>
    );
}

// Product Card Component - Odoo Style
function ProductCard({
    product,
    onClick,
}: {
    product: POSProduct;
    onClick: () => void;
}) {
    return (
        <Card
            className={`p-3 cursor-pointer hover:shadow-xl transition-all duration-200 hover:scale-[1.02] border border-gray-200 bg-white rounded-xl overflow-hidden ${product.isCombo ? 'border-l-4 border-l-amber-500' : ''}`}
            onClick={onClick}
        >
            {/* Product Image */}
            <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover rounded-lg"
                    />
                ) : (
                    <div className="text-gray-400 text-sm text-center font-medium">
                        🍽️
                        <div className="text-xs mt-1">No Image</div>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 text-sm leading-tight line-clamp-1">
                    {product.isCombo ? '🍱 ' : ''}
                    {product.productTemplateName}
                </h3>

                <h4 className="font-medium text-blue-600 text-xs leading-tight line-clamp-1">
                    {product.displayName}
                </h4>

                {product.description && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {product.description}
                    </p>
                )}

                {/* Product Type Indicator */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center">
                        {product.isCombo ? (
                            <span className="text-sm font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                                Combo
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                                {product.variantId ? "Has Variants" : "Product"}
                            </span>
                        )}
                        
                        {/* Action hint */}
                        {!product.isCombo && (
                            <span className="ml-2 text-xs text-gray-500 px-1 py-0.5 rounded">
                                Click to select options
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
