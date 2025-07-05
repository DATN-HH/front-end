'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calculator, Delete, X, Hash, DollarSign, Percent, CreditCard, ChevronDown } from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';

interface SlideUpNumpadProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'quantity' | 'price' | 'discount' | 'payment';
    selectedOrderItem?: string | null;
}

export default function SlideUpNumpad({
    isOpen,
    onClose,
    mode,
    selectedOrderItem
}: SlideUpNumpadProps) {
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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop - only cover left panel */}
            <div 
                className="fixed bottom-0 left-0 top-0 bg-black bg-opacity-30 z-40"
                style={{ width: '40%', maxWidth: '500px' }}
                onClick={onClose}
            />
            
            {/* Slide-up panel - positioned to slide from below the left panel */}
            <div className={`fixed left-0 bg-white border-t border-r border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-y-0' : 'translate-y-full'
            }`} 
            style={{ 
                width: '40%', 
                maxWidth: '500px',
                bottom: '0',
                height: 'auto',
                maxHeight: '70vh'
            }}>
                {/* Handle bar */}
                <div className="flex justify-center py-3 border-b border-gray-100">
                    <button 
                        onClick={onClose}
                        className="flex items-center text-gray-400 hover:text-gray-600"
                    >
                        <ChevronDown className="h-6 w-6" />
                    </button>
                </div>

                <div className="p-4 max-h-[70vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Icon className="h-5 w-5 mr-2 text-orange-600" />
                            <h2 className="text-lg font-semibold">{getTitle()}</h2>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Current Item Info */}
                    {selectedItem && (
                        <div className="p-3 bg-gray-50 rounded-lg mb-4">
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
                    <div className="mb-4">
                        <Label htmlFor="display" className="text-sm text-gray-600">
                            {mode === 'quantity' ? 'Quantity' : 
                             mode === 'price' ? 'Price' :
                             mode === 'discount' ? 'Discount %' : 'Amount'}
                        </Label>
                        <Input
                            id="display"
                            value={display}
                            placeholder="0"
                            readOnly
                            className="text-right text-2xl font-mono h-12 mt-1"
                        />
                    </div>

                    {/* Quick Value Buttons */}
                    {quickButtons.length > 0 && (
                        <div className="mb-4">
                            <Label className="text-sm text-gray-600 mb-2 block">Quick Values</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {quickButtons.map((button) => (
                                    <Button
                                        key={button.value}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setDisplay(button.value)}
                                        className="h-10 text-sm"
                                    >
                                        {button.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Numpad */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {/* Numbers 1-9 */}
                        {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                            <Button
                                key={num}
                                variant="outline"
                                onClick={() => handleNumberClick(num.toString())}
                                className="h-14 text-xl font-semibold"
                            >
                                {num}
                            </Button>
                        ))}

                        {/* Bottom row */}
                        <Button
                            variant="outline"
                            onClick={handleDecimalClick}
                            className="h-14 text-xl"
                        >
                            .
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleNumberClick("0")}
                            className="h-14 text-xl font-semibold"
                        >
                            0
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleBackspace}
                            className="h-14"
                        >
                            <Delete className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Clear Button */}
                    <Button
                        variant="outline"
                        onClick={handleClear}
                        className="w-full h-12 mb-4 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                        Clear
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 h-12"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            className="flex-1 h-12 bg-orange-600 hover:bg-orange-700"
                            disabled={!display || parseFloat(display) <= 0}
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}