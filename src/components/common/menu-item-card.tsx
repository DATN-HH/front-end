'use client';

import { Plus, Star, Tag } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/cart-context';
import type { MenuItem } from '@/lib/types';

// Quick notes for menu items
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
];

interface MenuItemCardProps {
    item: MenuItem;
}

export function MenuItemCard({ item }: MenuItemCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
    const { dispatch } = useCart();

    const handleAddToCart = () => {
        const allNotes = [notes, ...selectedQuickNotes]
            .filter(Boolean)
            .join(', ');
        dispatch({
            type: 'ADD_ITEM',
            payload: {
                menuItem: item,
                notes: allNotes || undefined,
                customizations: selectedQuickNotes,
            },
        });
        setIsOpen(false);
        setNotes('');
        setSelectedQuickNotes([]);
    };

    const toggleQuickNote = (note: string) => {
        setSelectedQuickNotes((prev) =>
            prev.includes(note)
                ? prev.filter((n) => n !== note)
                : [...prev, note]
        );
    };

    const displayPrice =
        item.isPromotion && item.originalPrice ? item.price : item.price;
    const originalPrice =
        item.isPromotion && item.originalPrice ? item.originalPrice : null;

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative">
                <Image
                    src={item.image || '/placeholder.svg'}
                    alt={item.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                />

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.isBestSeller && (
                        <Badge className="bg-yellow-500 text-black">
                            <Star className="h-3 w-3 mr-1" />
                            Best Seller
                        </Badge>
                    )}
                    {item.isPromotion && (
                        <Badge variant="destructive">
                            <Tag className="h-3 w-3 mr-1" />
                            {item.promotionType === 'percentage'
                                ? `${item.promotionValue}% OFF`
                                : `$${item.promotionValue} OFF`}
                        </Badge>
                    )}
                    {item.isCombo && (
                        <Badge variant="secondary">Combo Deal</Badge>
                    )}
                </div>
            </div>

            <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {item.description}
                </p>

                {item.isCombo && item.comboItems && (
                    <div className="mb-3">
                        <p className="text-xs text-muted-foreground mb-1">
                            Includes:
                        </p>
                        <div className="text-xs">
                            {item.comboItems.map((comboItem, index) => (
                                <span key={index}>
                                    {comboItem.quantity}x {comboItem.name}
                                    {index < item.comboItems!.length - 1 &&
                                        ', '}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-primary">
                            ${displayPrice.toFixed(2)}
                        </span>
                        {originalPrice && (
                            <span className="text-sm text-muted-foreground line-through">
                                ${originalPrice.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm">
                                <Plus className="h-4 w-4 mr-1" />
                                Add
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>
                                    Add {item.name} to Cart
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="notes">
                                        Special Instructions
                                    </Label>
                                    <Textarea
                                        id="notes"
                                        placeholder="Any special requests or modifications..."
                                        value={notes}
                                        onChange={(e) =>
                                            setNotes(e.target.value)
                                        }
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <Label>Quick Options</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {quickNotes.map((note) => (
                                            <Button
                                                key={note}
                                                variant={
                                                    selectedQuickNotes.includes(
                                                        note
                                                    )
                                                        ? 'default'
                                                        : 'outline'
                                                }
                                                size="sm"
                                                onClick={() =>
                                                    toggleQuickNote(note)
                                                }
                                            >
                                                {note}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t">
                                    <span className="font-semibold">
                                        Total: ${displayPrice.toFixed(2)}
                                    </span>
                                    <Button onClick={handleAddToCart}>
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardContent>
        </Card>
    );
}
