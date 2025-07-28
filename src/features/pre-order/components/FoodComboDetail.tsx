'use client';

import {
    ArrowLeft,
    Plus,
    Minus,
    Clock,
    Heart,
    Share2,
    ShoppingCart,
    Info,
    Package,
    Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { useFoodCombo } from '@/api/v1/menu/food-combos';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
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
import { useCustomToast } from '@/lib/show-toast';
import { useCartStore } from '@/stores/cart-store';

// Quick notes for combo items
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

interface FoodComboDetailProps {
    id: string;
}

export default function FoodComboDetail({ id }: FoodComboDetailProps) {
    const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const addFoodCombo = useCartStore((state) => state.addFoodCombo);
    const { success } = useCustomToast();

    // Fetch combo details from API
    const comboId = parseInt(id);
    const { data: combo, isLoading, error } = useFoodCombo(comboId);

    const handleAddToCart = () => {
        if (!combo) return;

        const allNotes = [notes, ...selectedQuickNotes]
            .filter(Boolean)
            .join(', ');

        addFoodCombo(combo, {
            quantity,
            notes: allNotes || undefined,
            customizations: selectedQuickNotes,
        });

        success('Added to Cart', `${combo.name} added to cart`);

        setIsAddToCartOpen(false);
        setNotes('');
        setSelectedQuickNotes([]);
        setQuantity(1);
    };

    const toggleQuickNote = (note: string) => {
        setSelectedQuickNotes((prev) =>
            prev.includes(note)
                ? prev.filter((n) => n !== note)
                : [...prev, note]
        );
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: combo?.name,
                text: combo?.description,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading combo...</p>
                </div>
            </div>
        );
    }

    if (error || !combo) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        Combo Not Found
                    </h1>
                    <p className="text-gray-600 mb-8">
                        The food combo you're looking for doesn't exist.
                    </p>
                    <Link href="/menu">
                        <Button className="bg-orange-500 hover:bg-orange-600">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Menu
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <Link href="/menu">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsFavorite(!isFavorite)}
                            >
                                <Heart
                                    className={`w-4 h-4 ${isFavorite
                                            ? 'fill-red-500 text-red-500'
                                            : 'text-gray-600'
                                        }`}
                                />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleShare}
                            >
                                <Share2 className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Combo Image */}
                    <div className="space-y-4">
                        <div className="aspect-square w-full overflow-hidden rounded-2xl bg-gray-100 relative">
                            <Image
                                src={combo.image || '/placeholder.svg'}
                                alt={combo.name}
                                width={600}
                                height={600}
                                className="w-full h-full object-cover"
                                priority
                            />
                            {/* Combo Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-orange-500 hover:bg-orange-600 text-white">
                                    <Package className="w-3 h-3 mr-1" />
                                    Combo Deal
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Combo Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {combo.name}
                            </h1>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                {combo.description}
                            </p>
                        </div>

                        {/* Combo Stats */}
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                <span>{combo.itemsCount} items</span>
                            </div>
                            {combo.estimateTime && (
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{combo.estimateTime} min</span>
                                </div>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-4">
                                <span className="text-3xl font-bold text-orange-600">
                                    {formatVietnameseCurrency(
                                        combo.effectivePrice
                                    )}
                                </span>
                                {combo.calculatedPrice !==
                                    combo.effectivePrice && (
                                        <span className="text-xl text-gray-500 line-through">
                                            {formatVietnameseCurrency(
                                                combo.calculatedPrice
                                            )}
                                        </span>
                                    )}
                            </div>
                            {combo.calculatedPrice !== combo.effectivePrice && (
                                <p className="text-sm text-green-600 font-medium">
                                    You save{' '}
                                    {formatVietnameseCurrency(
                                        combo.calculatedPrice -
                                        combo.effectivePrice
                                    )}
                                    !
                                </p>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <Dialog
                            open={isAddToCartOpen}
                            onOpenChange={setIsAddToCartOpen}
                        >
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg"
                                >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Add Combo to Cart
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                    <DialogTitle>
                                        Add {combo.name} to Cart
                                    </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    {/* Quantity */}
                                    <div className="flex items-center justify-between">
                                        <Label>Quantity</Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setQuantity(
                                                        Math.max(
                                                            1,
                                                            quantity - 1
                                                        )
                                                    )
                                                }
                                                disabled={quantity <= 1}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="w-8 text-center">
                                                {quantity}
                                            </span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    setQuantity(quantity + 1)
                                                }
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Quick Notes */}
                                    <div className="space-y-2">
                                        <Label>Quick Notes</Label>
                                        <div className="flex flex-wrap gap-2">
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
                                                    className="text-xs"
                                                >
                                                    {note}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Custom Notes */}
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">
                                            Special Instructions
                                        </Label>
                                        <Textarea
                                            id="notes"
                                            placeholder="Any special requests for this combo..."
                                            value={notes}
                                            onChange={(e) =>
                                                setNotes(e.target.value)
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    {/* Total */}
                                    <div className="flex items-center justify-between pt-4 border-t">
                                        <span className="font-semibold">
                                            Total:
                                        </span>
                                        <span className="text-xl font-bold text-orange-600">
                                            {formatVietnameseCurrency(
                                                combo.effectivePrice * quantity
                                            )}
                                        </span>
                                    </div>

                                    <Button
                                        onClick={handleAddToCart}
                                        className="w-full bg-orange-500 hover:bg-orange-600"
                                    >
                                        Add
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Combo Items Section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        What's Included
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {combo.comboItems.map((item) => (
                            <Card
                                key={item.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-start gap-3">
                                        {item.productImage && (
                                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={item.productImage}
                                                    alt={item.productName}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded">
                                                    {item.quantity}x
                                                </span>
                                                <h3 className="font-medium text-gray-900 line-clamp-1">
                                                    {item.productName}
                                                </h3>
                                            </div>
                                            {item.productDescription && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {item.productDescription}
                                                </p>
                                            )}
                                            {item.notes && (
                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                    Note: {item.notes}
                                                </p>
                                            )}
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {formatVietnameseCurrency(
                                                        item.totalPrice
                                                    )}
                                                </span>
                                                {item.isOptional && (
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs"
                                                    >
                                                        Optional
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Coming Soon Sections */}
                <div className="mt-12 space-y-8">
                    {/* Reviews Section */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Customer Reviews
                                </h3>
                                <p className="text-gray-600">
                                    Reviews and ratings feature coming soon!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Related Combos Section */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Related Combos
                                </h3>
                                <p className="text-gray-600">
                                    Combo recommendations coming soon!
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Nutritional Information Section */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Nutritional Information
                                </h3>
                                <p className="text-gray-600">
                                    Detailed nutritional facts coming soon!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
