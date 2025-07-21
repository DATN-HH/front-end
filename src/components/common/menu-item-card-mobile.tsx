'use client';

import { Plus, Star, Tag, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { quickNotes } from '@/lib/restaurant-data';
import type { MenuItem } from '@/lib/types';

interface MenuItemCardMobileProps {
  item: MenuItem;
  viewMode: 'list' | 'grid';
}

export function MenuItemCardMobile({
  item,
  viewMode,
}: MenuItemCardMobileProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedQuickNotes, setSelectedQuickNotes] = useState<string[]>([]);
  const { dispatch } = useCart();

  const handleAddToCart = () => {
    const allNotes = [notes, ...selectedQuickNotes].filter(Boolean).join(', ');
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
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const displayPrice =
    item.isPromotion && item.originalPrice ? item.price : item.price;
  const originalPrice =
    item.isPromotion && item.originalPrice ? item.originalPrice : null;

  if (viewMode === 'list') {
    return (
      <div className="mobile-menu-card mb-3">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            fill
            className="object-cover"
          />
          {/* Badges */}
          <div className="absolute -top-1 -right-1 flex flex-col gap-1">
            {item.isBestSeller && (
              <Badge className="bg-yellow-500 text-black text-xs px-1 py-0">
                <Star className="h-2 w-2" />
              </Badge>
            )}
            {item.isPromotion && (
              <Badge variant="destructive" className="text-xs px-1 py-0">
                <Tag className="h-2 w-2" />
              </Badge>
            )}
          </div>
        </div>

        <div className="flex-1 p-3 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <Link href={`/menu/${item.id}`} className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {item.name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              <span className="text-sm font-bold text-primary">
                ${displayPrice.toFixed(2)}
              </span>
              {originalPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{item.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{item.preparationTime}min</span>
              </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-7 px-2 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add {item.name} to Cart</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Special Instructions</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any special requests or modifications..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Quick Options</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {quickNotes.slice(0, 8).map((note) => (
                        <Button
                          key={note}
                          variant={
                            selectedQuickNotes.includes(note)
                              ? 'default'
                              : 'outline'
                          }
                          size="sm"
                          onClick={() => toggleQuickNote(note)}
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
                    <Button onClick={handleAddToCart}>Add to Cart</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    );
  }

  // Grid view (horizontal scroll cards)
  return (
    <div className="mobile-menu-horizontal">
      <div className="relative h-32">
        <Image
          src={item.image || '/placeholder.svg'}
          alt={item.name}
          fill
          className="object-cover"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isBestSeller && (
            <Badge className="bg-yellow-500 text-black text-xs">
              <Star className="h-3 w-3 mr-1" />
              Best
            </Badge>
          )}
          {item.isPromotion && (
            <Badge variant="destructive" className="text-xs">
              <Tag className="h-3 w-3 mr-1" />
              {item.promotionType === 'percentage'
                ? `${item.promotionValue}%`
                : `$${item.promotionValue}`}{' '}
              OFF
            </Badge>
          )}
        </div>
      </div>

      <div className="p-3">
        <Link href={`/menu/${item.id}`}>
          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
            {item.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {item.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span>{item.rating}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{item.preparationTime}min</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold text-primary">
              ${displayPrice.toFixed(2)}
            </span>
            {originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-7 px-2 text-xs">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add {item.name} to Cart</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="notes">Special Instructions</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special requests or modifications..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Quick Options</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {quickNotes.slice(0, 8).map((note) => (
                      <Button
                        key={note}
                        variant={
                          selectedQuickNotes.includes(note)
                            ? 'default'
                            : 'outline'
                        }
                        size="sm"
                        onClick={() => toggleQuickNote(note)}
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
                  <Button onClick={handleAddToCart}>Add to Cart</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
