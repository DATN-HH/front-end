'use client';

import { X, Plus, Minus } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

import type { ProductResponse } from '@/api/v1/menu/products';
import { POSOrderItemModifier } from '@/api/v1/pos-orders';

interface ProductCustomizationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: ProductResponse | null;
    onAddToOrder: (product: ProductResponse, quantity: number, modifiers: POSOrderItemModifier[], notes?: string) => void;
}

export function ProductCustomizationDialog({
    isOpen,
    onClose,
    product,
    onAddToOrder,
}: ProductCustomizationDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedModifiers, setSelectedModifiers] = useState<POSOrderItemModifier[]>([]);

    // Mock modifiers - in real implementation, these would come from the product API
    const mockModifiers = [
        { id: 1, name: 'Extra Cheese', price: 5000 },
        { id: 2, name: 'Extra Bacon', price: 8000 },
        { id: 3, name: 'No Onions', price: 0 },
        { id: 4, name: 'Extra Spicy', price: 0 },
        { id: 5, name: 'Belgian fresh homemade fries', price: 0 },
    ];

    const handleClose = () => {
        setQuantity(1);
        setNotes('');
        setSelectedModifiers([]);
        onClose();
    };

    const handleModifierToggle = (modifier: POSOrderItemModifier) => {
        setSelectedModifiers(prev => {
            const exists = prev.find(m => m.id === modifier.id);
            if (exists) {
                return prev.filter(m => m.id !== modifier.id);
            } else {
                return [...prev, modifier];
            }
        });
    };

    const handleAddToOrder = () => {
        if (product) {
            onAddToOrder(product, quantity, selectedModifiers, notes || undefined);
            handleClose();
        }
    };

    const calculateTotalPrice = () => {
        if (!product) return 0;
        const basePrice = product.price ? Number(product.price) : 0;
        const modifiersPrice = selectedModifiers.reduce((sum, mod) => sum + mod.price, 0);
        return (basePrice + modifiersPrice) * quantity;
    };

    const calculateTax = () => {
        return calculateTotalPrice() * 0.1; // 10% tax
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-lg font-semibold">
                            {product.name}
                        </DialogTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Product Info */}
                    <div className="text-center">
                        <div className="w-full h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                                <img 
                                    src={product.image} 
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <span className="text-gray-400">No Image</span>
                            )}
                        </div>
                        <div className="text-sm text-gray-600">
                            {product.name} | {product.price ? Number(product.price).toLocaleString() : 0} ₫ | VAT: 10% (= {Math.round(Number(product.price || 0) * 0.1).toLocaleString()} ₫)
                        </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center space-x-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="h-8 w-8 p-0"
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setQuantity(quantity + 1)}
                            className="h-8 w-8 p-0"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Modifiers Section */}
                    <div>
                        <Label className="text-sm font-medium text-gray-700 mb-3 block">
                            Sides
                        </Label>
                        <div className="space-y-2">
                            {mockModifiers.map((modifier) => (
                                <div
                                    key={modifier.id}
                                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedModifiers.find(m => m.id === modifier.id)
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleModifierToggle(modifier)}
                                >
                                    <span className="text-sm">{modifier.name}</span>
                                    {modifier.price > 0 && (
                                        <span className="text-sm text-gray-600">
                                            +{modifier.price.toLocaleString()} ₫
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <Label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-2 block">
                            Special Instructions
                        </Label>
                        <Textarea
                            id="notes"
                            placeholder="Add any special instructions..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="resize-none"
                            rows={3}
                        />
                    </div>

                    {/* Price Summary */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                <span>{(calculateTotalPrice() - calculateTax()).toLocaleString()} ₫</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax (10%):</span>
                                <span>{calculateTax().toLocaleString()} ₫</span>
                            </div>
                            <div className="flex justify-between font-semibold text-base border-t pt-2">
                                <span>Total:</span>
                                <span>{calculateTotalPrice().toLocaleString()} ₫</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleAddToOrder}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
