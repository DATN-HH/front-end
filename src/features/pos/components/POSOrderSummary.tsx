'use client';

import { Minus, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { POSOrderItem } from './POSRegisterView';

interface POSOrderSummaryProps {
    items: POSOrderItem[];
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    subtotal: number;
    tax: number;
    total: number;
}

export function POSOrderSummary({
    items,
    onQuantityChange,
    subtotal,
    tax,
    total
}: POSOrderSummaryProps) {
    return (
        <div className="p-4 space-y-4">
            {/* Order Items */}
            {items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-lg font-medium mb-2">No items in order</div>
                    <div className="text-sm">Select products to add to this order</div>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                            onQuantityChange={onQuantityChange}
                        />
                    ))}
                </div>
            )}

            {/* Order Totals */}
            {items.length > 0 && (
                <Card className="p-4 bg-gray-50">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax (10%)</span>
                            <span className="font-medium">${tax.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
}

// Order Item Card Component
function OrderItemCard({
    item,
    onQuantityChange
}: {
    item: POSOrderItem;
    onQuantityChange: (itemId: string, newQuantity: number) => void;
}) {
    return (
        <Card className="p-3 border border-gray-200">
            <div className="flex items-start justify-between">
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            {item.quantity}
                        </span>
                        <h4 className="font-medium text-gray-900 text-sm truncate">
                            {item.name}
                        </h4>
                    </div>
                    
                    {item.description && (
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                            {item.description}
                        </p>
                    )}

                    <div className="text-sm font-medium text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                    </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-1 ml-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                    >
                        <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                        {item.quantity}
                    </span>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                    
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onQuantityChange(item.id, 0)}
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
