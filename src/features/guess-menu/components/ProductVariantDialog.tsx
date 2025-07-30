'use client';

import { Clock, Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import {
    MenuProduct,
    MenuVariant,
    formatVietnameseCurrency,
    getVariantPrice,
    getVariantDisplayName,
} from '@/api/v1/menu/menu-products';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

// Common quick notes for all items (same as AddToCartDialog)
const quickNotes = [
    'No onions',
    'Extra spicy',
    'On the side',
    'Well done',
    'Medium rare',
    'No cheese',
    'Extra sauce',
    'Gluten free',
    'Vegetarian',
    'Less salt',
    'No ice',
    'Extra hot',
    'Mild spice',
    'No garlic',
    'Extra crispy',
];

interface ProductVariantDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: MenuProduct | null;
    onAddToCart?: (
        product: MenuProduct,
        variant: MenuVariant | null,
        quantity: number,
        note?: string,
        customizations?: string[]
    ) => void;
}

export function ProductVariantDialog({
    open,
    onOpenChange,
    product,
    onAddToCart,
}: ProductVariantDialogProps) {
    const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(
        null
    );
    const [quantity, setQuantity] = useState(1);
    const [note, setNote] = useState('');
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);

    if (!product) return null;

    // Filter variants with non-null prices
    const validVariants =
        product.variants?.filter((variant) => variant.price !== null) || [];
    const hasVariants = validVariants.length > 0;
    const currentPrice = selectedVariant
        ? getVariantPrice(selectedVariant, product.price)
        : product.price;

    const handleAddToCart = () => {
        if (onAddToCart) {
            const allNotes = [note, ...selectedQuickNotes]
                .filter(Boolean)
                .join(', ');

            onAddToCart(
                product,
                selectedVariant,
                quantity,
                allNotes || undefined,
                selectedQuickNotes
            );
        }
        handleClose();
    };

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const toggleQuickNote = (noteText: string) => {
        setSelectedQuickNotes((prev) =>
            prev.includes(noteText)
                ? prev.filter((n) => n !== noteText)
                : [...prev, noteText]
        );
    };

    const handleClose = () => {
        // Reset state when closing
        setSelectedVariant(null);
        setQuantity(1);
        setNote('');
        setSelectedQuickNotes([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add {product.name} to Cart</DialogTitle>
                    {product.description && (
                        <p className="text-sm text-gray-600 mt-2">
                            {product.description}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    {/* Product Image */}
                    {product.image && (
                        <div className="aspect-video w-full overflow-hidden rounded-lg">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Product Info */}
                    <div className="space-y-2">
                        {product.description && (
                            <p className="text-sm text-gray-600">
                                {product.description}
                            </p>
                        )}

                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            <span>{product.estimateTime} minutes</span>
                        </div>
                    </div>

                    <Separator />

                    {/* Variants Selection */}
                    {hasVariants && (
                        <div className="space-y-2">
                            <Label>Choose your option</Label>
                            <div className="space-y-2">
                                {validVariants.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedVariant?.id === variant.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-orange-300'
                                        }`}
                                        onClick={() =>
                                            setSelectedVariant(variant)
                                        }
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1 mr-3">
                                                <p className="font-medium text-sm">
                                                    {getVariantDisplayName(
                                                        variant
                                                    )}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formatVietnameseCurrency(
                                                        getVariantPrice(
                                                            variant,
                                                            product.price
                                                        )
                                                    )}
                                                </p>
                                            </div>
                                            <div className="flex-shrink-0">
                                                {selectedVariant?.id ===
                                                    variant.id && (
                                                    <Badge className="text-xs bg-orange-500 hover:bg-orange-600">
                                                        Selected
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between">
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">
                                {quantity}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleQuantityChange(1)}
                            >
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Notes */}
                    <div className="space-y-2">
                        <Label>Quick Notes</Label>
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {quickNotes.map((noteText) => (
                                <Badge
                                    key={noteText}
                                    variant={
                                        selectedQuickNotes.includes(noteText)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`cursor-pointer text-xs transition-colors ${
                                        selectedQuickNotes.includes(noteText)
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                            : 'hover:bg-orange-50 hover:border-orange-300'
                                    }`}
                                    onClick={() => toggleQuickNote(noteText)}
                                >
                                    {noteText}
                                </Badge>
                            ))}
                        </div>
                        {selectedQuickNotes.length > 0 && (
                            <div className="text-xs text-gray-500">
                                Selected: {selectedQuickNotes.join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Custom Notes */}
                    <div className="space-y-2">
                        <Label htmlFor="note">Special Instructions</Label>
                        <Textarea
                            id="note"
                            placeholder="Any special requests or modifications..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>Unit Price:</span>
                            <span>
                                {formatVietnameseCurrency(currentPrice)}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold mt-2">
                            <span>Total:</span>
                            <span className="text-orange-600">
                                {formatVietnameseCurrency(
                                    currentPrice * quantity
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddToCart}
                            className="flex-1 bg-orange-500 hover:bg-orange-600"
                            disabled={hasVariants && !selectedVariant}
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
