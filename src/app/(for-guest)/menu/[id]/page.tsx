'use client';

import { ArrowLeft, Plus, Star, Clock, ChefHat, Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { MenuItemCardMobile } from '@/components/common/menu-item-card-mobile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/cart-context';
import { menuItems, reviews, quickNotes } from '@/lib/restaurant-data';

interface MenuItemDetailProps {
    params: { id: string };
}

export default function MenuItemDetail({ params }: MenuItemDetailProps) {
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAddToCartOpen, setIsAddToCartOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
    const { dispatch } = useCart();

    const item = menuItems.find((item) => item.id === params.id);

    if (!item) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h1 className="text-3xl font-bold mb-4">Item Not Found</h1>
                <p className="text-muted-foreground mb-8">
                    The menu item you're looking for doesn't exist.
                </p>
                <Button asChild>
                    <Link href="/menu">Back to Menu</Link>
                </Button>
            </div>
        );
    }

    const relatedItems = menuItems
        .filter(
            (relatedItem) =>
                relatedItem.category === item.category &&
                relatedItem.id !== item.id
        )
        .slice(0, 4);

    const itemReviews = reviews.filter((review) => Math.random() > 0.5); // Simulate item-specific reviews

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
        setIsAddToCartOpen(false);
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-4">
                    <Button variant="ghost" asChild className="mb-4">
                        <Link href="/menu">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Menu
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-8 mb-12">
                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                                src={item.images?.[selectedImage] || item.image}
                                alt={item.name}
                                fill
                                className="object-cover"
                                priority
                            />
                            {/* Badges */}
                            <div className="absolute top-4 left-4 flex flex-col gap-2">
                                {item.isBestSeller && (
                                    <Badge className="bg-yellow-500 text-black">
                                        <Star className="h-4 w-4 mr-1" />
                                        Best Seller
                                    </Badge>
                                )}
                                {item.isPromotion && (
                                    <Badge variant="destructive">
                                        {item.promotionType === 'percentage'
                                            ? `${item.promotionValue}% OFF`
                                            : `$${item.promotionValue} OFF`}
                                    </Badge>
                                )}
                                {item.isVegetarian && (
                                    <Badge variant="secondary">
                                        <Leaf className="h-4 w-4 mr-1" />
                                        Vegetarian
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Thumbnail Gallery */}
                        {item.images && item.images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto">
                                {item.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                                            selectedImage === index
                                                ? 'border-primary'
                                                : 'border-transparent'
                                        }`}
                                    >
                                        <Image
                                            src={image || '/placeholder.svg'}
                                            alt={`${item.name} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Item Details */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-3xl font-serif font-bold mb-2">
                                {item.name}
                            </h1>
                            <p className="text-lg text-muted-foreground mb-4">
                                {item.description}
                            </p>

                            <div className="flex items-center gap-4 mb-4">
                                <div className="flex items-center gap-1">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="font-semibold">
                                        {item.rating}
                                    </span>
                                    <span className="text-muted-foreground">
                                        ({item.reviewCount} reviews)
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>{item.preparationTime} min</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl font-bold text-primary">
                                        ${displayPrice.toFixed(2)}
                                    </span>
                                    {originalPrice && (
                                        <span className="text-xl text-muted-foreground line-through">
                                            ${originalPrice.toFixed(2)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {item.chef && (
                                <div className="flex items-center gap-2 mb-4">
                                    <ChefHat className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-muted-foreground">
                                        Prepared by {item.chef}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Combo Items */}
                        {item.isCombo && item.comboItems && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">
                                        This Combo Includes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {item.comboItems.map(
                                            (comboItem, index) => (
                                                <div
                                                    key={index}
                                                    className="flex justify-between items-center"
                                                >
                                                    <span>
                                                        {comboItem.name}
                                                    </span>
                                                    <Badge variant="outline">
                                                        x{comboItem.quantity}
                                                    </Badge>
                                                </div>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Add to Cart */}
                        <Dialog
                            open={isAddToCartOpen}
                            onOpenChange={setIsAddToCartOpen}
                        >
                            <DialogTrigger asChild>
                                <Button size="lg" className="w-full">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add to Cart - ${displayPrice.toFixed(2)}
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
                </div>

                {/* Detailed Information Tabs */}
                <Tabs defaultValue="description" className="mb-12">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="description">
                            Description
                        </TabsTrigger>
                        <TabsTrigger value="ingredients">
                            Ingredients
                        </TabsTrigger>
                        <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
                        <TabsTrigger value="reviews">Reviews</TabsTrigger>
                    </TabsList>

                    <TabsContent value="description" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-lg leading-relaxed">
                                    {item.detailedDescription}
                                </p>
                                {item.allergens.length > 0 && (
                                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                                        <h4 className="font-semibold text-yellow-800 mb-2">
                                            Allergen Information
                                        </h4>
                                        <p className="text-yellow-700">
                                            Contains:{' '}
                                            {item.allergens.join(', ')}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="ingredients" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="font-semibold mb-4">
                                    Ingredients
                                </h3>
                                <div className="grid sm:grid-cols-2 gap-2">
                                    {item.ingredients.map(
                                        (ingredient, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2"
                                            >
                                                <div className="w-2 h-2 bg-primary rounded-full"></div>
                                                <span>{ingredient}</span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="nutrition" className="mt-6">
                        <Card>
                            <CardContent className="p-6">
                                {item.nutritionalInfo ? (
                                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {item.nutritionalInfo.calories}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Calories
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {item.nutritionalInfo.protein}g
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Protein
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {item.nutritionalInfo.carbs}g
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Carbs
                                            </div>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <div className="text-2xl font-bold text-primary">
                                                {item.nutritionalInfo.fat}g
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                Fat
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">
                                        Nutritional information not available
                                        for this item.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="reviews" className="mt-6">
                        <div className="space-y-4">
                            {itemReviews.length > 0 ? (
                                itemReviews.map((review) => (
                                    <Card key={review.id}>
                                        <CardContent className="p-6">
                                            <div className="flex items-start gap-4">
                                                <Avatar>
                                                    <AvatarImage
                                                        src={
                                                            review.userAvatar ||
                                                            '/placeholder.svg'
                                                        }
                                                    />
                                                    <AvatarFallback>
                                                        {review.userName.charAt(
                                                            0
                                                        )}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="font-semibold">
                                                            {review.userName}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {[...Array(5)].map(
                                                                (_, i) => (
                                                                    <Star
                                                                        key={i}
                                                                        className={`h-4 w-4 ${
                                                                            i <
                                                                            review.rating
                                                                                ? 'fill-yellow-400 text-yellow-400'
                                                                                : 'text-gray-300'
                                                                        }`}
                                                                    />
                                                                )
                                                            )}
                                                        </div>
                                                        <span className="text-sm text-muted-foreground">
                                                            {review.date}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground">
                                                        {review.comment}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            👍 Helpful (
                                                            {review.helpful})
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <Card>
                                    <CardContent className="p-6 text-center">
                                        <p className="text-muted-foreground">
                                            No reviews yet. Be the first to
                                            review this item!
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Related Items */}
                {relatedItems.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-serif font-bold mb-6">
                            You Might Also Like
                        </h2>
                        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedItems.map((relatedItem) => (
                                <MenuItemCardMobile
                                    key={relatedItem.id}
                                    item={relatedItem}
                                    viewMode="grid"
                                />
                            ))}
                        </div>
                        <div className="md:hidden flex gap-4 overflow-x-auto pb-4">
                            {relatedItems.map((relatedItem) => (
                                <MenuItemCardMobile
                                    key={relatedItem.id}
                                    item={relatedItem}
                                    viewMode="grid"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
