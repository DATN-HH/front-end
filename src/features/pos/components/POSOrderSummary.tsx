'use client';

import { Minus, Plus, Trash2, StickyNote } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { POSKitchenNotesModal } from './POSKitchenNotesModal';
import { POSOrderItem } from './POSRegisterView';

interface POSOrderSummaryProps {
    items: POSOrderItem[];
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    onNotesChange: (itemId: string, notes: string[]) => void;
    subtotal: number;
    tax: number;
    total: number;
}

export function POSOrderSummary({
    items,
    onQuantityChange,
    onNotesChange,
    subtotal,
    tax,
    total,
}: POSOrderSummaryProps) {
    const [notesModalOpen, setNotesModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<POSOrderItem | null>(null);

    const handleAddNotes = (item: POSOrderItem) => {
        setSelectedItem(item);
        setNotesModalOpen(true);
    };

    const handleNotesApply = (notes: string[]) => {
        if (selectedItem) {
            onNotesChange(selectedItem.id, notes);
        }
        setNotesModalOpen(false);
        setSelectedItem(null);
    };
    return (
        <div className="p-4 space-y-4">
            {/* Order Items */}
            {items.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-lg font-medium mb-2">
                        No items in order
                    </div>
                    <div className="text-sm">
                        Select products to add to this order
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    {items.map((item) => (
                        <OrderItemCard
                            key={item.id}
                            item={item}
                            onQuantityChange={onQuantityChange}
                            onAddNotes={() => handleAddNotes(item)}
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
                            <span className="font-medium">
                                ${subtotal.toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax (10%)</span>
                            <span className="font-medium">
                                ${tax.toFixed(2)}
                            </span>
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

            {/* Kitchen Notes Modal */}
            <POSKitchenNotesModal
                isOpen={notesModalOpen}
                onClose={() => {
                    setNotesModalOpen(false);
                    setSelectedItem(null);
                }}
                onApply={handleNotesApply}
                currentNotes={selectedItem?.notes || []}
                itemName={selectedItem?.name}
            />
        </div>
    );
}

// Order Item Card Component
function OrderItemCard({
    item,
    onQuantityChange,
    onAddNotes,
}: {
    item: POSOrderItem;
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    onAddNotes: () => void;
}) {
    return (
        <div className="border-l-4 border-l-green-500 bg-white p-4 mb-3 shadow-sm">
            {/* Item Header */}
            <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-base">
                        {item.name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <span className="font-medium">
                            {item.quantity.toFixed(2)}
                        </span>
                        <span>x</span>
                        <span>${item.unitPrice.toFixed(2)} / Units</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                        ${item.totalPrice.toFixed(2)}
                    </div>
                </div>
            </div>

            {/* Notes Display */}
            {item.notes && item.notes.length > 0 && (
                <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                        {item.notes.map((note, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-between">
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onQuantityChange(
                                item.id,
                                Math.max(0, item.quantity - 1)
                            )
                        }
                        className="h-8 w-8 p-0"
                    >
                        <Minus className="h-3 w-3" />
                    </Button>

                    <span className="min-w-[2rem] text-center font-medium">
                        {item.quantity}
                    </span>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                        }
                        className="h-8 w-8 p-0"
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddNotes}
                        className="h-8 px-3 text-xs"
                    >
                        <StickyNote className="h-3 w-3 mr-1" />
                        Note
                    </Button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onQuantityChange(item.id, 0)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
