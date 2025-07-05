'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { usePosStore } from '@/stores/pos-store';
import { useFoodCombo } from '@/api/v1/pos';
import { Package, Plus, Minus, Check } from 'lucide-react';

export function ComboSelectionModal() {
    const { showComboModal, closeComboModal, selectedCombo, addItem } = usePosStore();
    const { data: comboDetails } = useFoodCombo(selectedCombo?.id || 0);
    
    const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
    const [comboSelections, setComboSelections] = useState<Record<number, {
        productId: number;
        quantity: number;
        unitPrice?: number;
    }>>({});

    if (!selectedCombo || !comboDetails) return null;

    const handleProductSelection = (comboItemId: number, productId: number, price?: number) => {
        setComboSelections(prev => ({
            ...prev,
            [comboItemId]: {
                productId,
                quantity: 1,
                unitPrice: price
            }
        }));
    };

    const handleQuantityChange = (comboItemId: number, newQuantity: number) => {
        if (newQuantity <= 0) {
            setComboSelections(prev => {
                const newSelections = { ...prev };
                delete newSelections[comboItemId];
                return newSelections;
            });
            return;
        }

        setComboSelections(prev => ({
            ...prev,
            [comboItemId]: {
                ...prev[comboItemId],
                quantity: newQuantity
            }
        }));
    };

    const calculateTotalPrice = () => {
        const basePrice = selectedVariant 
            ? comboDetails.variants?.find(v => v.id === selectedVariant)?.price || comboDetails.basePrice
            : comboDetails.basePrice;

        const addOnsPrice = Object.values(comboSelections).reduce((total, selection) => {
            return total + ((selection.unitPrice || 0) * selection.quantity);
        }, 0);

        return basePrice + addOnsPrice;
    };

    const handleAddToOrder = () => {
        // Create combo item with selections
        const comboItem = {
            ...selectedCombo,
            selectedVariant,
            selections: comboSelections,
            totalPrice: calculateTotalPrice()
        };

        addItem(comboItem, 'COMBO');
        
        // Reset state and close modal
        setSelectedVariant(null);
        setComboSelections({});
        closeComboModal();
    };

    const totalPrice = calculateTotalPrice();

    return (
        <Dialog open={showComboModal} onOpenChange={closeComboModal}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Package className="h-5 w-5 mr-2 text-orange-600" />
                        Customize {selectedCombo.name}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Combo Description */}
                    {comboDetails.description && (
                        <p className="text-gray-600">{comboDetails.description}</p>
                    )}

                    {/* Variant Selection */}
                    {comboDetails.variants && comboDetails.variants.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Choose Size</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant={selectedVariant === null ? 'default' : 'outline'}
                                    onClick={() => setSelectedVariant(null)}
                                    className={`p-4 h-auto ${
                                        selectedVariant === null ? 'bg-orange-600 hover:bg-orange-700' : ''
                                    }`}
                                >
                                    <div className="text-left">
                                        <div className="font-medium">Regular</div>
                                        <div className="text-sm opacity-75">${comboDetails.basePrice.toFixed(2)}</div>
                                    </div>
                                </Button>
                                {comboDetails.variants.map((variant) => (
                                    <Button
                                        key={variant.id}
                                        variant={selectedVariant === variant.id ? 'default' : 'outline'}
                                        onClick={() => setSelectedVariant(variant.id)}
                                        className={`p-4 h-auto ${
                                            selectedVariant === variant.id ? 'bg-orange-600 hover:bg-orange-700' : ''
                                        }`}
                                    >
                                        <div className="text-left">
                                            <div className="font-medium">{variant.name}</div>
                                            <div className="text-sm opacity-75">${variant.price.toFixed(2)}</div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Combo Items Selection */}
                    {comboDetails.items && comboDetails.items.length > 0 && (
                        <div>
                            <h3 className="font-medium text-gray-900 mb-3">Customize Your Combo</h3>
                            <div className="space-y-4">
                                {comboDetails.items.map((comboItem) => (
                                    <Card key={comboItem.id} className="border-gray-200">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {comboItem.product.name}
                                                        {comboItem.isRequired && (
                                                            <Badge variant="secondary" className="ml-2">Required</Badge>
                                                        )}
                                                    </h4>
                                                    {comboItem.product.description && (
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {comboItem.product.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {comboItem.unitPrice && comboItem.unitPrice > 0 && (
                                                    <span className="text-sm font-medium text-orange-600">
                                                        +${comboItem.unitPrice.toFixed(2)}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    {comboSelections[comboItem.id] ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleQuantityChange(
                                                                    comboItem.id, 
                                                                    comboSelections[comboItem.id].quantity - 1
                                                                )}
                                                                className="h-6 w-6 p-0"
                                                            >
                                                                <Minus className="h-3 w-3" />
                                                            </Button>
                                                            <span className="w-8 text-center text-sm">
                                                                {comboSelections[comboItem.id].quantity}
                                                            </span>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => handleQuantityChange(
                                                                    comboItem.id, 
                                                                    comboSelections[comboItem.id].quantity + 1
                                                                )}
                                                                className="h-6 w-6 p-0"
                                                                disabled={!comboItem.canSelectMultiple && comboSelections[comboItem.id].quantity >= 1}
                                                            >
                                                                <Plus className="h-3 w-3" />
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleProductSelection(
                                                                comboItem.id,
                                                                comboItem.product.id,
                                                                comboItem.unitPrice
                                                            )}
                                                        >
                                                            Add
                                                        </Button>
                                                    )}
                                                </div>

                                                {comboSelections[comboItem.id] && (
                                                    <div className="flex items-center text-green-600">
                                                        <Check className="h-4 w-4 mr-1" />
                                                        <span className="text-sm">Added</span>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Total Price */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center text-lg font-semibold">
                            <span>Total Price:</span>
                            <span className="text-orange-600">${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={closeComboModal}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToOrder}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                        >
                            Add to Order - ${totalPrice.toFixed(2)}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}