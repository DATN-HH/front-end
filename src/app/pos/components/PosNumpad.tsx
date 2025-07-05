'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Delete, X, Hash, DollarSign, Percent, CreditCard } from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';

interface PosNumpadProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'quantity' | 'price' | 'discount' | 'payment';
    selectedOrderItem?: string | null;
}

export default function PosNumpad({
    isOpen,
    onClose,
    mode,
    selectedOrderItem
}: PosNumpadProps) {
    const { updateItemQuantity, numpadValue, setNumpadValue, currentOrder } = usePosStore();
    const [display, setDisplay] = useState('');

    // Get the current item if one is selected
    const selectedItem = selectedOrderItem 
        ? currentOrder.find(item => item.localId === selectedOrderItem)
        : null;

    // Set initial value based on mode and selected item
    useEffect(() => {
        if (isOpen) {
            switch (mode) {
                case 'quantity':
                    setDisplay(selectedItem ? selectedItem.quantity.toString() : '1');
                    break;
                case 'price':
                    setDisplay(selectedItem?.unitPrice?.toString() || '0');
                    break;
                case 'discount':
                    setDisplay('0');
                    break;
                case 'payment':
                    setDisplay('');
                    break;
                default:
                    setDisplay('');
            }
        }
    }, [isOpen, mode, selectedItem]);

    const handleNumberClick = (num: string) => {
        if (display === "0") {
            setDisplay(num);
        } else {
            setDisplay(display + num);
        }
    };

    const handleDecimalClick = () => {
        if (!display.includes(".")) {
            setDisplay(display === "" ? "0." : display + ".");
        }
    };

    const handleClear = () => {
        setDisplay("");
    };

    const handleBackspace = () => {
        setDisplay(display.slice(0, -1));
    };

    const handleConfirm = () => {
        const value = parseFloat(display) || 0;
        
        switch (mode) {
            case 'quantity':
                if (selectedOrderItem && value > 0) {
                    updateItemQuantity(selectedOrderItem, value);
                }
                break;
            case 'price':
                // Handle price override
                console.log('Price override:', value);
                break;
            case 'discount':
                // Handle discount application
                console.log('Discount applied:', value);
                break;
            case 'payment':
                // Set payment amount
                setNumpadValue(display);
                break;
        }
        
        onClose();
    };

    const getTitle = () => {
        switch (mode) {
            case 'quantity':
                return selectedItem ? `Set Quantity - ${selectedItem.productName || selectedItem.comboName}` : 'Set Quantity';
            case 'price':
                return 'Price Override';
            case 'discount':
                return 'Apply Discount';
            case 'payment':
                return 'Payment Amount';
            default:
                return 'Calculator';
        }
    };

    const getIcon = () => {
        switch (mode) {
            case 'quantity':
                return Hash;
            case 'price':
                return DollarSign;
            case 'discount':
                return Percent;
            case 'payment':
                return CreditCard;
            default:
                return Calculator;
        }
    };

    const Icon = getIcon();

    // Quick value buttons for different modes
    const getQuickButtons = () => {
        switch (mode) {
            case 'quantity':
                return [
                    { label: '0.5', value: '0.5' },
                    { label: '1', value: '1' },
                    { label: '2', value: '2' },
                    { label: '5', value: '5' },
                ];
            case 'discount':
                return [
                    { label: '5%', value: '5' },
                    { label: '10%', value: '10' },
                    { label: '15%', value: '15' },
                    { label: '20%', value: '20' },
                ];
            default:
                return [];
        }
    };

    const quickButtons = getQuickButtons();

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Icon className="h-5 w-5 mr-2 text-orange-600" />
                        {getTitle()}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Current Item Info */}
                    {selectedItem && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-gray-900 text-sm">
                                        {selectedItem.productName || selectedItem.comboName}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                        Current: {mode === 'quantity' ? selectedItem.quantity : `$${selectedItem.unitPrice?.toFixed(2) || '0.00'}`}
                                    </p>
                                </div>
                                <Badge variant="secondary">
                                    {mode === 'quantity' ? 'Qty' : 'Price'}
                                </Badge>
                            </div>
                        </div>
                    )}

                    {/* Display */}
                    <div>
                        <Label htmlFor="display">
                            {mode === 'quantity' ? 'Quantity' : 
                             mode === 'price' ? 'Price' :
                             mode === 'discount' ? 'Discount %' : 'Amount'}
                        </Label>
                        <Input
                            id="display"
                            value={display}
                            placeholder="0"
                            readOnly
                            className="text-right text-xl font-mono"
                        />
                    </div>

                    {/* Quick Value Buttons */}
                    {quickButtons.length > 0 && (
                        <div>
                            <Label className="text-sm text-gray-600 mb-2 block">Quick Values</Label>
                            <div className="grid grid-cols-4 gap-1">
                                {quickButtons.map((button) => (
                                    <Button
                                        key={button.value}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDisplay(button.value)}
                                        className="h-8 text-xs"
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-2">
                        {/* Numbers 1-9 */}
                        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                            <Button
                                key={num}
                                variant="outline"
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-12 text-lg"
                            >
                                {num}
                            </Button>
                        ))}

                        {/* Bottom row */}
                        <Button
                            variant="outline"
                            onClick={handleDecimalClick}
                            className="h-12"
                        >
                            .
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleNumberClick("0")}
                            className="h-12 text-lg"
                        >
                            0
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleBackspace}
                            className="h-12"
                        >
                            <Delete className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Clear Button */}
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="w-full h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Clear
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            disabled={!display || parseFloat(display) <= 0}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}