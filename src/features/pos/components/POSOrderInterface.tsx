'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { usePOSOrder } from '@/contexts/pos-order-context';

// Import product API
import { useAllCategories } from '@/api/v1/menu/categories';
import { useProductsByCategory } from '@/api/v1/menu/products';
import type { CategoryResponse, ProductResponse } from '@/api/v1/menu/products';
import { POSOrderItemModifier } from '@/api/v1/pos-orders';

// Import components
import { ProductCustomizationDialog } from './ProductCustomizationDialog';
import { POSPaymentInterface } from './POSPaymentInterface';

interface POSOrderInterfaceProps {
    tableId?: string;
}

export function POSOrderInterface({ tableId }: POSOrderInterfaceProps) {
    const { state, addItem, setTable } = usePOSOrder();
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
        null
    );
    const [selectedProduct, setSelectedProduct] =
        useState<ProductResponse | null>(null);
    const [isCustomizationDialogOpen, setIsCustomizationDialogOpen] =
        useState(false);
    const [showPaymentInterface, setShowPaymentInterface] = useState(false);

    // API hooks
    const { data: categories = [], isLoading: isLoadingCategories } =
        useAllCategories();
    const { data: products = [], isLoading: isLoadingProducts } =
        useProductsByCategory(selectedCategoryId || 0);

    // Set table when component mounts
    useEffect(() => {
        if (tableId && !state.tableId) {
            setTable(parseInt(tableId), `Table ${tableId}`);
        }
    }, [tableId, state.tableId, setTable]);

    // Set default category when categories are loaded
    useEffect(() => {
        if (categories.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(categories[0].id);
        }
    }, [categories, selectedCategoryId]);

    // Handle product selection
    const handleProductClick = (product: ProductResponse) => {
        setSelectedProduct(product);
        setIsCustomizationDialogOpen(true);
    };

    // Handle adding product to order with customizations
    const handleAddToOrder = (
        product: ProductResponse,
        quantity: number,
        modifiers: POSOrderItemModifier[],
        notes?: string
    ) => {
        addItem(
            {
                id: product.id,
                name: product.name,
                price: product.price ? Number(product.price) : 0,
            },
            quantity,
            modifiers,
            notes
        );
    };

    // Handle payment completion
    const handlePaymentComplete = () => {
        // In a real implementation, this would save the order and clear the state
        alert('Payment completed successfully!');
        setShowPaymentInterface(false);
        // clearOrder(); // Uncomment to clear order after payment
    };

    // Show payment interface if requested
    if (showPaymentInterface) {
        return (
            <POSPaymentInterface
                onBack={() => setShowPaymentInterface(false)}
                onPaymentComplete={handlePaymentComplete}
            />
        );
    }

    return (
        <div className="flex h-full bg-gray-100">
            {/* Left Panel - Order Summary (Odoo Style) */}
            <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
                {/* Order Items Area */}
                <div className="flex-1 p-6">
                    {state.items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">
                                Start adding products
                            </h3>
                            <p className="text-gray-500 text-sm">
                                Select products from the catalog to build your
                                order
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {state.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                            {item.quantity}
                                        </div>
                                        <div>
                                            <div className="font-medium text-gray-900">
                                                {item.productName}
                                            </div>
                                            {item.modifiers &&
                                                item.modifiers.length > 0 && (
                                                    <div className="text-xs text-gray-500">
                                                        -{' '}
                                                        {item.modifiers
                                                            .map(
                                                                (mod) =>
                                                                    mod.name
                                                            )
                                                            .join(', ')}
                                                    </div>
                                                )}
                                        </div>
                                    </div>
                                    <div className="font-semibold text-gray-900">
                                        {item.totalPrice.toLocaleString()} ₫
                                    </div>
                                </div>
                            ))}

                            {/* Order Totals */}
                            <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxes</span>
                                    <span className="font-medium">
                                        {state.tax.toLocaleString()} ₫
                                    </span>
                                </div>
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>
                                        {state.total.toLocaleString()} ₫
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Customer Controls */}
                <div className="p-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <Button variant="outline" className="h-10">
                            Customer
                        </Button>
                        <Button
                            variant="outline"
                            className="h-10"
                            disabled={state.items.length === 0}
                        >
                            Note
                        </Button>
                        <Button variant="outline" className="h-10">
                            Dine In
                        </Button>
                        <Button variant="outline" className="h-10">
                            Course
                        </Button>
                    </div>

                    {/* Numeric Keypad */}
                    <div className="grid grid-cols-4 gap-2 mb-4">
                        {[
                            1,
                            2,
                            3,
                            'Qty',
                            4,
                            5,
                            6,
                            '%',
                            7,
                            8,
                            9,
                            'Price',
                            '+/-',
                            0,
                            '.',
                            '⌫',
                        ].map((key) => (
                            <Button
                                key={key}
                                variant="outline"
                                className="h-10 text-sm"
                                disabled={
                                    typeof key === 'string' &&
                                    !['⌫'].includes(key)
                                }
                            >
                                {key}
                            </Button>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            className="h-12 bg-orange-600 hover:bg-orange-700 text-white"
                            disabled={state.items.length === 0}
                        >
                            <div className="text-center">
                                <div className="font-medium">Order</div>
                                <div className="text-xs opacity-90">
                                    {state.items.reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                    ) > 0 &&
                                        `${state.items.reduce((sum, item) => sum + item.quantity, 0)} items`}
                                </div>
                            </div>
                        </Button>
                        <Button
                            className="h-12 bg-green-600 hover:bg-green-700 text-white"
                            disabled={state.items.length === 0}
                            onClick={() => setShowPaymentInterface(true)}
                        >
                            Payment
                        </Button>
                    </div>
                </div>
            </div>

            {/* Right Panel - Product Catalog (Odoo Style) */}
            <div className="flex-1 bg-gray-50 flex flex-col">
                {/* Category Tabs */}
                <div className="bg-white border-b border-gray-200 p-4">
                    {isLoadingCategories ? (
                        <div className="flex space-x-2">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-10 w-20 bg-gray-200 rounded animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex space-x-2 overflow-x-auto">
                            {categories.map((category) => (
                                <Button
                                    key={category.id}
                                    variant={
                                        selectedCategoryId === category.id
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`px-6 py-2 whitespace-nowrap ${
                                        selectedCategoryId === category.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 border-gray-300'
                                    }`}
                                    onClick={() =>
                                        setSelectedCategoryId(category.id)
                                    }
                                >
                                    {category.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Grid */}
                <div className="flex-1 p-6 overflow-auto">
                    {isLoadingProducts ? (
                        <div className="grid grid-cols-4 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="bg-white rounded-lg border-2 border-gray-200 p-4"
                                >
                                    <div className="w-full h-20 bg-gray-200 rounded-lg mb-3 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <h3 className="text-xl font-medium text-gray-700 mb-2">
                                No Products Found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {selectedCategoryId
                                    ? 'This category has no products yet.'
                                    : 'Select a category to view products.'}
                            </p>
                            <div className="space-x-3">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        (window.location.href =
                                            '/app/menu/products')
                                    }
                                >
                                    Manage Products
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-4 gap-4">
                            {products.map((product) => {
                                const quantity = state.items
                                    .filter(
                                        (item) => item.productId === product.id
                                    )
                                    .reduce(
                                        (sum, item) => sum + item.quantity,
                                        0
                                    );

                                return (
                                    <div
                                        key={product.id}
                                        className={`relative bg-white rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                            quantity > 0
                                                ? 'border-blue-300 bg-blue-50'
                                                : 'border-gray-200 hover:border-blue-300'
                                        }`}
                                        onClick={() =>
                                            handleProductClick(product)
                                        }
                                    >
                                        <div className="p-4 text-center">
                                            <div className="w-full h-20 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                                {product.image ? (
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        No Image
                                                    </span>
                                                )}
                                            </div>
                                            <h3
                                                className="font-medium text-sm text-gray-900 truncate"
                                                title={product.name}
                                            >
                                                {product.name}
                                            </h3>
                                            {product.price && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {Number(
                                                        product.price
                                                    ).toLocaleString()}{' '}
                                                    ₫
                                                </p>
                                            )}
                                        </div>
                                        {quantity > 0 && (
                                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                                                {quantity}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Customization Dialog */}
            <ProductCustomizationDialog
                isOpen={isCustomizationDialogOpen}
                onClose={() => setIsCustomizationDialogOpen(false)}
                product={selectedProduct}
                onAddToOrder={handleAddToOrder}
            />
        </div>
    );
}
