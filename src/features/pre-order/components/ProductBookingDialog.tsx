'use client';

import { Clock, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useMenuBooking } from '@/features/pre-order/context/MenuBookingContext';

interface ProductBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    product: MenuProduct | null;
    quickNotes?: string[];
}

export function ProductBookingDialog({
    isOpen,
    onClose,
    product,
    quickNotes = ['No spicy', 'Extra sauce', 'Less salt', 'Well done'],
}: ProductBookingDialogProps) {
    const { addItem } = useMenuBooking();
    const [selectedVariant, setSelectedVariant] = useState<MenuVariant | null>(
        null
    );
    const [quantity, setQuantity] = useState(1);
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
    const [customNotes, setCustomNotes] = useState('');

    if (!product) return null;

    // Filter variants with non-null prices
    const validVariants =
        product.variants?.filter((variant) => variant.price !== null) || [];
    const hasVariants = validVariants.length > 0;
    const currentPrice = selectedVariant
        ? getVariantPrice(selectedVariant, product.price || 0)
        : product.price || 0;

    const handleQuantityChange = (delta: number) => {
        setQuantity((prev) => Math.max(1, prev + delta));
    };

    const toggleQuickNote = (note: string) => {
        setSelectedQuickNotes((prev) =>
            prev.includes(note)
                ? prev.filter((n) => n !== note)
                : [...prev, note]
        );
    };

    const handleAddToBooking = () => {
        const allNotes = [...selectedQuickNotes];
        if (customNotes.trim()) {
            allNotes.push(customNotes.trim());
        }

        const itemName = selectedVariant
            ? `${product.name} (${getVariantDisplayName(selectedVariant)})`
            : product.name;

        addItem({
            name: itemName,
            price: currentPrice,
            quantity,
            notes: allNotes.length > 0 ? allNotes.join(', ') : undefined,
            type: selectedVariant ? 'variant' : 'product',
            productId: product.id,
            variantId: selectedVariant?.id,
        });

        toast.success(`Added ${quantity}x ${itemName} to order`);

        // Reset form
        setSelectedVariant(null);
        setQuantity(1);
        setSelectedQuickNotes([]);
        setCustomNotes('');
        onClose();
    };

    const totalPrice = currentPrice * quantity;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {product.name}
                        {product.estimateTime && (
                            <Badge variant="secondary" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                {product.estimateTime}min
                            </Badge>
                        )}
                    </DialogTitle>
                    {product.description && (
                        <DialogDescription>
                            {product.description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="space-y-4">
                    {/* Variant Selection */}
                    {hasVariants && (
                        <div>
                            <Label className="text-sm font-medium">
                                Choose Option
                            </Label>
                            <div className="grid grid-cols-1 gap-2 mt-2">
                                {validVariants.map((variant) => (
                                    <div
                                        key={variant.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedVariant?.id === variant.id
                                                ? 'border-orange-500 bg-orange-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                        onClick={() =>
                                            setSelectedVariant(variant)
                                        }
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {getVariantDisplayName(
                                                        variant
                                                    )}
                                                </p>
                                            </div>
                                            <p className="font-semibold text-orange-600">
                                                {formatVietnameseCurrency(
                                                    getVariantPrice(
                                                        variant,
                                                        product.price || 0
                                                    )
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quantity */}
                    <div>
                        <Label>Quantity</Label>
                        <div className="flex items-center gap-3 mt-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(-1)}
                                disabled={quantity <= 1}
                                className="h-8 w-8"
                            >
                                <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                                type="number"
                                value={quantity}
                                onChange={(e) =>
                                    setQuantity(
                                        Math.max(
                                            1,
                                            parseInt(e.target.value) || 1
                                        )
                                    )
                                }
                                className="w-20 text-center h-8"
                                min="1"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleQuantityChange(1)}
                                className="h-8 w-8"
                            >
                                <Plus className="h-3 w-3" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Notes */}
                    <div>
                        <Label>Quick Notes</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {quickNotes.map((note) => (
                                <Badge
                                    key={note}
                                    variant={
                                        selectedQuickNotes.includes(note)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className="cursor-pointer"
                                    onClick={() => toggleQuickNote(note)}
                                >
                                    {note}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Custom Notes */}
                    <div>
                        <Label htmlFor="custom-notes">Custom Notes</Label>
                        <Textarea
                            id="custom-notes"
                            placeholder="Any special requests..."
                            value={customNotes}
                            onChange={(e) => setCustomNotes(e.target.value)}
                            rows={2}
                            className="mt-2"
                        />
                    </div>

                    <Separator />

                    {/* Price Summary */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span>Unit Price:</span>
                            <span>
                                {formatVietnameseCurrency(currentPrice)}
                            </span>
                        </div>
                        <div className="flex justify-between items-center font-semibold">
                            <span>Total ({quantity}x):</span>
                            <span className="text-lg text-orange-600">
                                {formatVietnameseCurrency(totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddToBooking}
                        className="bg-orange-500 hover:bg-orange-600"
                        disabled={hasVariants && !selectedVariant}
                    >
                        Add to Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
