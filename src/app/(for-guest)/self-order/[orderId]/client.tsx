'use client';

import { Search, ShoppingCart, AlertCircle } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

import { useAllCategories } from '@/api/v1/menu/categories';
import { usePOSOrder } from '@/api/v1/pos-orders';
import { useAddItemsToOrder } from '@/api/v1/self-order';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SelfOrderFoodComboSection } from '@/features/guess-menu/components/SelfOrderFoodComboSection';
import {
    SelfOrderMenuCategorySection,
    ReviewOrderModal,
} from '@/features/guess-menu/components/SelfOrderMenuCategorySection';
import { useCustomToast } from '@/lib/show-toast';

interface SelfOrderClientProps {
    orderId: string;
}

export function SelfOrderClient({ orderId }: SelfOrderClientProps) {
    const { success, error: showError } = useCustomToast();
    const [selectedCategory, setSelectedCategory] = useState<number | 'All'>(
        'All'
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [tempOrderItems, setTempOrderItems] = useState<any[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);

    // Fetch order data
    const orderIdNumber = parseInt(orderId);
    const {
        data: orderData,
        isLoading: orderLoading,
        refetch,
    } = usePOSOrder(orderIdNumber);

    // Fetch categories data
    const { data: categoriesData, isLoading: categoriesLoading } =
        useAllCategories();

    // New API mutation
    const addItemsMutation = useAddItemsToOrder();

    // Process categories for UI
    const categories = useMemo(() => {
        if (!categoriesData) return [];
        return categoriesData.filter((cat) => cat.status === 'ACTIVE');
    }, [categoriesData]);

    // Get filtered categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        return categories.filter((category) =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    // Initialize temp order items from current order
    useEffect(() => {
        if (orderData?.items) {
            // Map API response items to our internal format
            const mappedItems = orderData.items.map((item) => ({
                orderItemId: item.id, // Map item.id to orderItemId
                productId: item.productId,
                productName: item.productName,
                comboId: item.isCombo ? item.productId : undefined, // Use productId for combos
                comboName: item.comboName,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.totalPrice,
                notes: item.notes || '',
                attributeCombination: item.attributeCombination,
                isCombo: item.isCombo || false,
                variantId: item.variantId,
                variantName: '', // Not available in POSOrderItem, set empty string
            }));
            setTempOrderItems(mappedItems);
        }
    }, [orderData]);

    const handleUpdateOrder = async () => {
        try {
            // Only send new items (items without orderItemId)
            const newItems = tempOrderItems.filter((item) => !item.orderItemId);

            if (newItems.length === 0) {
                showError('No Changes', 'No new items to add to the order');
                return;
            }

            // Prepare new items for the new API
            const itemsForAPI = newItems.map((item) => {
                const baseItem = {
                    quantity: item.quantity,
                    notes: item.notes || '',
                    attributeCombination: item.attributeCombination || '',
                };

                if (item.isCombo) {
                    return {
                        ...baseItem,
                        comboId: item.comboId,
                    };
                } else {
                    return {
                        ...baseItem,
                        productId: item.productId,
                        variantId: item.variantId || undefined,
                    };
                }
            });

            // Call the new add-items API
            await addItemsMutation.mutateAsync({
                orderId: orderIdNumber,
                items: itemsForAPI,
            });

            success(
                'Success',
                `Added ${newItems.length} new item(s) to your order`
            );
            refetch(); // Refresh order data
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to update order';
            showError('Error', errorMessage);
        }
    };

    // Loading state
    if (orderLoading || categoriesLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading menu...</p>
                </div>
            </div>
        );
    }

    // Check if order exists and is in PREPARING status
    if (!orderData || orderData.orderStatus !== 'PREPARING') {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="container mx-auto max-w-2xl">
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Order Not Available</AlertTitle>
                        <AlertDescription>
                            {!orderData
                                ? 'Order not found or has been removed.'
                                : `This order is currently ${orderData.orderStatus} and cannot be modified.`}
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Fixed Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 z-50 shadow-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Self Order #{orderIdNumber}
                            </h1>
                            <p className="text-sm text-gray-600">
                                Add more items to your order
                            </p>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                            <Button
                                variant="outline"
                                onClick={() => setShowReviewModal(true)}
                                className="flex-1 md:flex-none"
                            >
                                <ShoppingCart className="w-4 h-4 mr-2" />
                                {tempOrderItems.filter(
                                    (item) => !item.orderItemId
                                ).length > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-2 bg-blue-100 text-blue-700"
                                    >
                                        {
                                            tempOrderItems.filter(
                                                (item) => !item.orderItemId
                                            ).length
                                        }
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                onClick={handleUpdateOrder}
                                disabled={addItemsMutation.isPending}
                                className="flex-1 md:flex-none"
                            >
                                {addItemsMutation.isPending
                                    ? 'Adding Items...'
                                    : 'Add Items to Order'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Order Modal */}
            <ReviewOrderModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                currentOrderItems={tempOrderItems}
                onUpdateTempOrder={setTempOrderItems}
            />

            {/* Main Content */}
            <div className="container mx-auto px-4 py-8">
                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="w-full md:w-64">
                        <Select
                            value={selectedCategory.toString()}
                            onValueChange={(value) =>
                                setSelectedCategory(
                                    value === 'All' ? 'All' : parseInt(value)
                                )
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select category" />
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

                {/* Food Combos Section */}
                <SelfOrderFoodComboSection
                    className="mb-8 md:mb-12"
                    currentOrderItems={tempOrderItems}
                    onUpdateTempOrder={setTempOrderItems}
                />

                {/* Menu Categories */}
                <div className="space-y-8 md:space-y-12">
                    {selectedCategory === 'All'
                        ? filteredCategories.map((category) => (
                              <SelfOrderMenuCategorySection
                                  key={category.id}
                                  categoryId={category.id}
                                  categoryName={category.name}
                                  currentOrderItems={tempOrderItems}
                                  onUpdateTempOrder={setTempOrderItems}
                              />
                          ))
                        : (() => {
                              const category = categories.find(
                                  (cat) => cat.id === selectedCategory
                              );
                              return category ? (
                                  <SelfOrderMenuCategorySection
                                      key={category.id}
                                      categoryId={category.id}
                                      categoryName={category.name}
                                      currentOrderItems={tempOrderItems}
                                      onUpdateTempOrder={setTempOrderItems}
                                  />
                              ) : null;
                          })()}
                </div>

                {/* No Results Message */}
                {filteredCategories.length === 0 && searchQuery && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            No categories found matching "{searchQuery}"
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
