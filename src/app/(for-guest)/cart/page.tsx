'use client';

import { Minus, Plus, Trash2, MapPin, Clock, Home, Link } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCart } from '@/contexts/cart-context';
import type { OrderData } from '@/lib/types';

const branches = [
  'Downtown Location',
  'Mall Branch',
  'Airport Terminal',
  'Suburban Plaza',
];

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [orderData, setOrderData] = useState<OrderData>({
    type: 'dine-in',
    notes: '',
  });

  const totalPrice = state.items.reduce(
    (sum, item) => sum + item.menuItem.price * item.quantity,
    0
  );

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleOrderTypeChange = (type: 'dine-in' | 'takeaway' | 'delivery') => {
    setOrderData((prev) => ({ ...prev, type }));
  };

  if (state.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-8">
          Add some delicious items from our menu!
        </p>
        <Button asChild>
          <Link href="/menu">Browse Menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <Image
                    src={item.menuItem.image || '/placeholder.svg'}
                    alt={item.menuItem.name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h3 className="font-semibold">{item.menuItem.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {item.menuItem.description}
                    </p>
                    {item.notes && (
                      <p className="text-xs text-primary mb-2">
                        Note: {item.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          ${(item.menuItem.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Type</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={orderData.type}
                onValueChange={(value) => handleOrderTypeChange(value as any)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dine-in" id="dine-in" />
                  <Label htmlFor="dine-in" className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Dine In
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="takeaway" id="takeaway" />
                  <Label htmlFor="takeaway" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Takeaway
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery
                  </Label>
                </div>
              </RadioGroup>

              {/* Conditional Fields */}
              {orderData.type === 'dine-in' && (
                <div className="mt-4">
                  <Label htmlFor="table">Table Number</Label>
                  <Input
                    id="table"
                    placeholder="Enter table number"
                    value={orderData.tableNumber || ''}
                    onChange={(e) =>
                      setOrderData((prev) => ({
                        ...prev,
                        tableNumber: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {orderData.type === 'delivery' && (
                <div className="mt-4">
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full address"
                    value={orderData.address || ''}
                    onChange={(e) =>
                      setOrderData((prev) => ({
                        ...prev,
                        address: e.target.value,
                      }))
                    }
                  />
                </div>
              )}

              {(orderData.type === 'takeaway' ||
                orderData.type === 'delivery') && (
                <div className="mt-4">
                  <Label htmlFor="branch">Branch</Label>
                  <Select
                    value={orderData.branch || ''}
                    onValueChange={(value) =>
                      setOrderData((prev) => ({
                        ...prev,
                        branch: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((branch) => (
                        <SelectItem key={branch} value={branch}>
                          {branch}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="notes">Special Instructions</Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests..."
                  value={orderData.notes || ''}
                  onChange={(e) =>
                    setOrderData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(totalPrice * 0.1).toFixed(2)}</span>
                </div>
                {orderData.type === 'delivery' && (
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$3.99</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      $
                      {(
                        totalPrice * 1.1 +
                        (orderData.type === 'delivery' ? 3.99 : 0)
                      ).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button className="w-full mt-6" size="lg">
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
