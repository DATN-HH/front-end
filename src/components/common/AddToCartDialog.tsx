'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Common quick notes for all items
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

interface AddToCartDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    price: number;
    onAddToCart: (
        quantity: number,
        notes?: string,
        customizations?: string[]
    ) => void;
    formatPrice: (price: number) => string;
}

export function AddToCartDialog({
    open,
    onOpenChange,
    title,
    description,
    price,
    onAddToCart,
    formatPrice,
}: AddToCartDialogProps) {
    const [quantity, setQuantity] = useState(1);
    const [notes, setNotes] = useState('');
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);

    const handleAddToCart = () => {
        const allNotes = [notes, ...selectedQuickNotes]
            .filter(Boolean)
            .join(', ');

        onAddToCart(quantity, allNotes || undefined, selectedQuickNotes);

        // Reset form
        setQuantity(1);
        setNotes('');
        setSelectedQuickNotes([]);
        onOpenChange(false);
    };

    const handleQuantityChange = (delta: number) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1) {
            setQuantity(newQuantity);
        }
    };

    const toggleQuickNote = (note: string) => {
        setSelectedQuickNotes((prev) =>
            prev.includes(note)
                ? prev.filter((n) => n !== note)
                : [...prev, note]
        );
    };

    const handleClose = () => {
        // Reset form when closing
        setQuantity(1);
        setNotes('');
        setSelectedQuickNotes([]);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Add {title} to Cart</DialogTitle>
                    {description && (
                        <p className="text-sm text-gray-600 mt-2">
                            {description}
                        </p>
                    )}
                </DialogHeader>

                <div className="space-y-4">
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
                            {quickNotes.map((note) => (
                                <Badge
                                    key={note}
                                    variant={
                                        selectedQuickNotes.includes(note)
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`cursor-pointer text-xs transition-colors ${
                                        selectedQuickNotes.includes(note)
                                            ? 'bg-orange-500 hover:bg-orange-600 text-white'
                                            : 'hover:bg-orange-50 hover:border-orange-300'
                                    }`}
                                    onClick={() => toggleQuickNote(note)}
                                >
                                    {note}
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
                        <Label htmlFor="notes">Special Instructions</Label>
                        <Textarea
                            id="notes"
                            placeholder="Any special requests or modifications..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={3}
                            className="resize-none"
                        />
                    </div>

                    {/* Price Summary */}
                    <div className="border-t pt-4">
                        <div className="flex items-center justify-between text-sm">
                            <span>Unit Price:</span>
                            <span>{formatPrice(price)}</span>
                        </div>
                        <div className="flex items-center justify-between text-lg font-bold mt-2">
                            <span>Total:</span>
                            <span className="text-orange-600">
                                {formatPrice(price * quantity)}
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
                        >
                            Add
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
