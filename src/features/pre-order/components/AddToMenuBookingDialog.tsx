'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Textarea } from '@/components/ui/textarea';
import { useMenuBooking } from '@/features/pre-order/context/MenuBookingContext';

interface AddToMenuBookingDialogProps {
    isOpen: boolean;
    onClose: () => void;
    item: {
        id: number;
        name: string;
        price: number;
        type: 'product' | 'variant' | 'combo';
        productId?: number;
        variantId?: number;
        comboId?: number;
    };
    quickNotes?: string[];
}

export function AddToMenuBookingDialog({
    isOpen,
    onClose,
    item,
    quickNotes = [],
}: AddToMenuBookingDialogProps) {
    const { addItem } = useMenuBooking();
    const [quantity, setQuantity] = useState(1);
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
    const [customNotes, setCustomNotes] = useState('');

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

        addItem({
            name: item.name,
            price: item.price,
            quantity,
            notes: allNotes.length > 0 ? allNotes.join(', ') : undefined,
            type: item.type,
            productId: item.productId,
            variantId: item.variantId,
            comboId: item.comboId,
        });

        toast.success(`Added ${quantity}x ${item.name} to order`);

        // Reset form
        setQuantity(1);
        setSelectedQuickNotes([]);
        setCustomNotes('');
        onClose();
    };

    const totalPrice = item.price * quantity;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{item.name}</DialogTitle>
                    <DialogDescription>
                        Customize your order and add to booking
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
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
                    {quickNotes.length > 0 && (
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
                    )}

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

                    {/* Price Summary */}
                    <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Total:</span>
                            <span className="text-lg font-bold text-orange-600">
                                {totalPrice.toLocaleString('vi-VN')}₫
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
                    >
                        Add to Order
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
