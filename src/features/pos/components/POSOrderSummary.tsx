'use client';

import { Minus, Plus, Trash2, StickyNote } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { POSKitchenNotesModal } from './POSKitchenNotesModal';
import { POSOrderItem } from './POSRegisterView';

// Helper function to format currency to VND
const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

interface POSOrderSummaryProps {
    items: POSOrderItem[];
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    onNotesChange: (itemId: string, notes: string[]) => void;
    subtotal: number;
    tax: number;
    total: number;
    disabled?: boolean;
}

export function POSOrderSummary({
    items,
    onQuantityChange,
    onNotesChange,
    subtotal,
    tax,
    total,
    disabled = false,
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
        <div className="p-4 space-y-4 overflow-x-hidden">
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
                            disabled={disabled}
                        />
                    ))}
                </div>
            )}

            {/* Order Totals */}
            {/* {items.length > 0 && (
                <Card className="p-4 bg-gray-50">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                                {formatVND(subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax (10%)</span>
                            <span className="font-medium">
                                {formatVND(tax)}
                            </span>
                        </div>
                        <div className="border-t border-gray-200 pt-2">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{formatVND(total)}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            )} */}

            {/* Notes Modal */}
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

// Helper function to get status color
const getStatusColor = (status?: string) => {
    switch (status) {
        case 'RECEIVED':
            return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'SEND_TO_KITCHEN':
            return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'COOKING':
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'READY_TO_SERVE':
            return 'bg-green-100 text-green-800 border-green-200';
        case 'COMPLETED':
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// Helper function to check if item can be deleted
const canDeleteItem = (status?: string) => {
    return status === 'RECEIVED' || status === 'SEND_TO_KITCHEN';
};

// Order Item Card Component
function OrderItemCard({
    item,
    onQuantityChange,
    onAddNotes,
    disabled,
}: {
    item: POSOrderItem;
    onQuantityChange: (itemId: string, newQuantity: number) => void;
    onAddNotes: () => void;
    disabled: boolean;
}) {
    const canDelete = canDeleteItem(item.itemStatus);
    return (
        <div className="border-l-4 border-l-green-500 bg-white p-2 mb-2 shadow-sm overflow-hidden">
            {/* Item Header */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {' '}
                    {/* min-w-0 helps truncate work properly */}
                    <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 text-sm truncate max-w-[200px]">
                            {item.name}
                        </h4>
                        {item.itemStatus && (
                            <span
                                className={`px-2 py-0.5 text-xs font-medium rounded-full border whitespace-nowrap ${getStatusColor(item.itemStatus)}`}
                            >
                                {item.itemStatus}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                        <span className="whitespace-nowrap">
                            {formatVND(item.unitPrice)} × {item.quantity}
                        </span>
                        <span className="font-medium whitespace-nowrap">
                            {formatVND(item.totalPrice)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                            onQuantityChange(item.id, item.quantity - 1)
                        }
                        disabled={disabled}
                    >
                        <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">
                        {item.quantity}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() =>
                            onQuantityChange(item.id, item.quantity + 1)
                        }
                        disabled={disabled}
                    >
                        <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={onAddNotes}
                        disabled={disabled}
                    >
                        <StickyNote className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => onQuantityChange(item.id, 0)}
                        disabled={disabled || !canDelete}
                        title={
                            !canDelete
                                ? 'Can only delete items with RECEIVED or SEND_TO_KITCHEN status'
                                : 'Delete item'
                        }
                    >
                        <Trash2 className="w-3 h-3" />
                    </Button>
                </div>
            </div>

            {/* Notes Display */}
            {item.notes && item.notes.length > 0 && (
                <div className="mt-1">
                    <div className="flex flex-wrap gap-1">
                        {item.notes.map((note, index) => (
                            <span
                                key={index}
                                className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-700 text-xs rounded"
                            >
                                {note}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
