'use client';

import { Clock, MapPin, Phone, User, CheckCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { useBranches } from '@/api/v1/branches';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { useCreatePreOrder, PreOrderResponse } from '@/api/v1/pre-order';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { MenuBookingContent } from '@/features/pre-order/components/MenuBookingContent';
import { PreOrderConfirmDialog } from '@/features/pre-order/components/PreOrderConfirmDialog';
import {
    MenuBookingProvider,
    useMenuBooking,
} from '@/features/pre-order/context/MenuBookingContext';
import { useCustomToast } from '@/lib/show-toast';

interface OrderData {
    type: 'dine-in' | 'takeaway';
    branchId?: string;
    bookingTableId?: string;
    time?: string;
    customerName: string;
    customerPhone: string;
    notes: string;
}

function MenuBookingPageContent() {
    const searchParams = useSearchParams();
    const { data: branches } = useBranches();
    const { success, error } = useCustomToast();
    const {
        items: menuItems,
        clearItems,
        getTotalItems,
        getTotalPrice,
        isCalculating,
        apiResponse,
        getItemNameById,
        removeItem,
    } = useMenuBooking();

    const [orderData, setOrderData] = useState<OrderData>({
        type: 'dine-in',
        customerName: '',
        notes: '',
        customerPhone: '',
    });

    // Pre-order states
    const [showPreOrderDialog, setShowPreOrderDialog] = useState(false);
    const [preOrderData, setPreOrderData] = useState<PreOrderResponse | null>(
        null
    );
    const createPreOrderMutation = useCreatePreOrder();

    // Auto-fill data from query params
    useEffect(() => {
        const bookingTableId = searchParams.get('bookingtableId');
        const branchId = searchParams.get('branchId');
        const time = searchParams.get('time');
        const customerName = searchParams.get('customerName');
        const customerPhone = searchParams.get('customerPhone');

        if (
            bookingTableId ||
            branchId ||
            time ||
            customerName ||
            customerPhone
        ) {
            setOrderData((prev) => ({
                ...prev,
                bookingTableId: bookingTableId || undefined,
                branchId: branchId || undefined,
                time: time || undefined,
                customerName: customerName || '',
                customerPhone: customerPhone || '',
            }));
        }
    }, [searchParams]);

    // Calculate totals from context
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    // Get all items for display (from API response if available)
    const getAllOrderItems = () => {
        if (!apiResponse) return [];

        const allItems = [
            ...apiResponse.foodCombo.map((item) => ({
                ...item,
                type: 'combo' as const,
                name: getItemNameById(item.id, 'combo', item.note),
            })),
            ...apiResponse.productVariant.map((item) => ({
                ...item,
                type: 'variant' as const,
                name: getItemNameById(item.id, 'variant', item.note),
            })),
            ...apiResponse.product.map((item) => ({
                ...item,
                type: 'product' as const,
                name: getItemNameById(item.id, 'product', item.note),
            })),
        ];

        return allItems;
    };

    const orderItems = getAllOrderItems();

    // Handle removing an item from the order
    const handleRemoveOrderItem = (
        apiItem: any,
        itemType: 'product' | 'variant' | 'combo'
    ) => {
        // Find the corresponding local item to remove
        const localItem = menuItems.find((item) => {
            const itemId = item.comboId || item.variantId || item.productId;
            return (
                itemId === apiItem.id &&
                item.type === itemType &&
                (item.notes || '') === (apiItem.note || '')
            );
        });

        if (localItem) {
            removeItem(localItem.id);
        }
    };

    const handleOrderTypeChange = (type: 'dine-in' | 'takeaway') => {
        setOrderData((prev) => ({ ...prev, type }));
    };

    const handlePlaceOrder = async () => {
        try {
            // Validate required fields
            if (
                !orderData.customerName ||
                !orderData.customerPhone ||
                !orderData.branchId
            ) {
                error('Validation Error', 'Please fill in all required fields');
                return;
            }

            if (!orderData.time) {
                error('Validation Error', 'Please select pickup/dining time');
                return;
            }

            if (menuItems.length === 0) {
                error('Validation Error', 'Please add items to your order');
                return;
            }

            // Convert menu items to API format
            const orderItems = {
                foodCombo: menuItems
                    .filter((item) => item.type === 'combo')
                    .map((item) => ({
                        id: item.comboId!,
                        quantity: item.quantity,
                        note: item.notes || '',
                    })),
                productVariant: menuItems
                    .filter((item) => item.type === 'variant')
                    .map((item) => ({
                        id: item.variantId!,
                        quantity: item.quantity,
                        note: item.notes || '',
                    })),
                product: menuItems
                    .filter((item) => item.type === 'product')
                    .map((item) => ({
                        id: item.productId!,
                        quantity: item.quantity,
                        note: item.notes || '',
                    })),
            };

            // Create pre-order request
            const preOrderRequest = {
                type: orderData.type,
                branchId: Number(orderData.branchId),
                bookingTableId: orderData.bookingTableId
                    ? Number(orderData.bookingTableId)
                    : undefined,
                time: orderData.time,
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                notes: orderData.notes || undefined,
                orderItems,
            };

            // Create pre-order
            const result =
                await createPreOrderMutation.mutateAsync(preOrderRequest);

            setPreOrderData(result);
            setShowPreOrderDialog(true);
            success('Success', 'Pre-order created successfully!');
        } catch (err: any) {
            console.error('Failed to create pre-order:', err);
            error(
                'Error',
                err.response?.data?.message || 'Failed to create pre-order'
            );
        }
    };

    const isFromTableBooking = searchParams.get('bookingtableId');
    const selectedBranch = branches?.find(
        (b) => b.id.toString() === orderData.branchId
    );

    const formatBookingTime = (timeString: string) => {
        const date = new Date(timeString);
        return date.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Menu Booking</h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                    Order your favorite dishes
                </p>
            </div>

            {/* Table Booking Info Alert */}
            {isFromTableBooking && (
                <div className="container mx-auto px-4 py-3">
                    <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-semibold">
                                        Table Booking Confirmed!
                                    </span>
                                    <p className="text-sm mt-1">
                                        Booking ID: #{isFromTableBooking}
                                        {orderData.time &&
                                            ` • ${formatBookingTime(orderData.time)}`}
                                    </p>
                                </div>
                            </div>
                        </AlertDescription>
                    </Alert>
                </div>
            )}

            <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Content - Left Side on Desktop */}
                    <div className="flex-1 space-y-8">
                        {/* Order Type & Branch Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* Order Type */}
                            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 space-y-1">
                                    <CardTitle className="text-lg font-semibold">
                                        Order Type
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Choose how you want to receive your
                                        order
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <RadioGroup
                                        value={orderData.type}
                                        onValueChange={(value) =>
                                            handleOrderTypeChange(
                                                value as 'dine-in' | 'takeaway'
                                            )
                                        }
                                        className="space-y-3"
                                    >
                                        <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem
                                                value="dine-in"
                                                id="dine-in"
                                            />
                                            <Label
                                                htmlFor="dine-in"
                                                className="flex items-center gap-2 text-sm cursor-pointer"
                                            >
                                                <MapPin className="h-4 w-4 text-orange-500" />
                                                <div>
                                                    <div className="font-medium">
                                                        Dine In
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Enjoy your meal at our
                                                        restaurant
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-3 rounded-lg border p-3 cursor-pointer hover:bg-gray-50">
                                            <RadioGroupItem
                                                value="takeaway"
                                                id="takeaway"
                                            />
                                            <Label
                                                htmlFor="takeaway"
                                                className="flex items-center gap-2 text-sm cursor-pointer"
                                            >
                                                <Clock className="h-4 w-4 text-orange-500" />
                                                <div>
                                                    <div className="font-medium">
                                                        Takeaway
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        Pick up your order at
                                                        selected time
                                                    </div>
                                                </div>
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {/* Dine In Suggestion */}
                                    {orderData.type === 'dine-in' &&
                                        !isFromTableBooking && (
                                            <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                                                <div className="flex items-start gap-2">
                                                    <div className="text-orange-500">
                                                        💡
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-orange-800 font-medium">
                                                            Want a better dining
                                                            experience?
                                                        </p>
                                                        <p className="text-xs text-orange-700 mt-1">
                                                            Book a table in
                                                            advance to ensure
                                                            your spot
                                                        </p>
                                                        <Link href="/table-booking">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="mt-2 w-full text-xs h-8 border-orange-200 text-orange-700 hover:bg-orange-100"
                                                            >
                                                                Book a Table
                                                            </Button>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>

                            {/* Branch Selection */}
                            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 space-y-1">
                                    <CardTitle className="text-lg font-semibold">
                                        Branch
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Select your preferred location
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Select
                                        value={orderData.branchId}
                                        onValueChange={(value) =>
                                            setOrderData((prev) => ({
                                                ...prev,
                                                branchId: value,
                                            }))
                                        }
                                        disabled={!!isFromTableBooking}
                                    >
                                        <SelectTrigger className="h-10 bg-white">
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {branches?.map((branch) => (
                                                <SelectItem
                                                    key={branch.id}
                                                    value={branch.id.toString()}
                                                >
                                                    {branch.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    {selectedBranch && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <MapPin className="h-4 w-4" />
                                                <p className="truncate">
                                                    {selectedBranch.address}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="h-4 w-4" />
                                                <p>{selectedBranch.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Time Selection */}
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3 space-y-1">
                                <CardTitle className="text-lg font-semibold">
                                    Preferred Time
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Choose when you'd like to receive your order
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="orderDate"
                                            className="text-sm font-medium"
                                        >
                                            Date
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="orderDate"
                                                type="date"
                                                value={
                                                    orderData.time
                                                        ? orderData.time.split(
                                                              'T'
                                                          )[0]
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        time: `${e.target.value}T${
                                                            prev.time?.split(
                                                                'T'
                                                            )[1] || '12:00:00'
                                                        }`,
                                                    }))
                                                }
                                                className="h-10 pl-10"
                                                disabled={!!isFromTableBooking}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="orderTime"
                                            className="text-sm font-medium"
                                        >
                                            Time
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="orderTime"
                                                type="time"
                                                value={
                                                    orderData.time
                                                        ? orderData.time
                                                              .split('T')[1]
                                                              ?.substring(0, 5)
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        time: `${
                                                            prev.time?.split(
                                                                'T'
                                                            )[0] ||
                                                            new Date()
                                                                .toISOString()
                                                                .split('T')[0]
                                                        }T${e.target.value}:00`,
                                                    }))
                                                }
                                                className="h-10 pl-10"
                                                disabled={!!isFromTableBooking}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Menu Selection */}
                        <div className="bg-white rounded-xl shadow-md">
                            <MenuBookingContent />
                        </div>
                    </div>

                    {/* Order Summary - Right Side on Desktop, Bottom on Mobile */}
                    <div className="lg:w-[400px]">
                        <div className="lg:sticky lg:top-[80px] space-y-6">
                            {/* Customer Information */}
                            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 space-y-1">
                                    <CardTitle className="text-lg font-semibold">
                                        Customer Info
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Enter your contact details
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="customerName"
                                            className="text-sm font-medium"
                                        >
                                            Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="customerName"
                                                placeholder="Your name"
                                                value={orderData.customerName}
                                                onChange={(e) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        customerName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="h-10 pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="customerPhone"
                                            className="text-sm font-medium"
                                        >
                                            Phone
                                        </Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                            <Input
                                                id="customerPhone"
                                                placeholder="Phone number"
                                                value={orderData.customerPhone}
                                                onChange={(e) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        customerPhone:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="h-10 pl-10"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 space-y-1">
                                    <CardTitle className="text-lg font-semibold">
                                        Order Summary
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground">
                                        Review your order details
                                        {apiResponse && (
                                            <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                                                <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                                                Prices calculated
                                            </span>
                                        )}
                                    </p>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {totalItems === 0 ? (
                                        <div className="py-8 text-center">
                                            <p className="text-muted-foreground text-sm">
                                                No items in your cart yet
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Browse our menu to add items
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {/* Selected Items List */}
                                            <div className="space-y-3 max-h-[240px] overflow-y-auto pr-2">
                                                {orderItems.length > 0
                                                    ? orderItems.map((item) => (
                                                          <div
                                                              key={item.tempId}
                                                              className="flex justify-between items-start py-2 group hover:bg-gray-50 rounded-lg px-2 -mx-2"
                                                          >
                                                              <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-1">
                                                                      <p className="font-medium text-sm">
                                                                          {
                                                                              item.name
                                                                          }
                                                                      </p>
                                                                      <span
                                                                          className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"
                                                                          title="Price calculated by system"
                                                                      ></span>
                                                                  </div>
                                                                  {item.note && (
                                                                      <p className="text-muted-foreground text-xs mt-0.5">
                                                                          {
                                                                              item.note
                                                                          }
                                                                      </p>
                                                                  )}
                                                              </div>
                                                              <div className="flex items-center gap-3">
                                                                  <div className="text-right">
                                                                      <p className="font-medium text-sm">
                                                                          {
                                                                              item.quantity
                                                                          }
                                                                          x{' '}
                                                                          {formatVietnameseCurrency(
                                                                              item.price
                                                                          )}
                                                                      </p>
                                                                      <p className="text-muted-foreground text-xs mt-0.5">
                                                                          {formatVietnameseCurrency(
                                                                              item.totalPrice
                                                                          )}
                                                                      </p>
                                                                  </div>
                                                                  <button
                                                                      onClick={() =>
                                                                          handleRemoveOrderItem(
                                                                              item,
                                                                              item.type
                                                                          )
                                                                      }
                                                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-md text-red-500 hover:text-red-700"
                                                                      title="Remove item"
                                                                  >
                                                                      <Trash2 className="h-4 w-4" />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      ))
                                                    : // Fallback to local items if API data not available
                                                      menuItems.map((item) => (
                                                          <div
                                                              key={item.id}
                                                              className="flex justify-between items-start py-2 group hover:bg-gray-50 rounded-lg px-2 -mx-2"
                                                          >
                                                              <div className="flex-1 min-w-0">
                                                                  <p className="font-medium text-sm">
                                                                      {
                                                                          item.name
                                                                      }
                                                                  </p>
                                                                  {item.notes && (
                                                                      <p className="text-muted-foreground text-xs mt-0.5">
                                                                          {
                                                                              item.notes
                                                                          }
                                                                      </p>
                                                                  )}
                                                              </div>
                                                              <div className="flex items-center gap-3">
                                                                  <div className="text-right">
                                                                      <p className="font-medium text-sm">
                                                                          {
                                                                              item.quantity
                                                                          }
                                                                          x{' '}
                                                                          {formatVietnameseCurrency(
                                                                              item.price
                                                                          )}
                                                                      </p>
                                                                      <p className="text-muted-foreground text-xs mt-0.5">
                                                                          {formatVietnameseCurrency(
                                                                              item.price *
                                                                                  item.quantity
                                                                          )}
                                                                      </p>
                                                                  </div>
                                                                  <button
                                                                      onClick={() =>
                                                                          removeItem(
                                                                              item.id
                                                                          )
                                                                      }
                                                                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded-md text-red-500 hover:text-red-700"
                                                                      title="Remove item"
                                                                  >
                                                                      <Trash2 className="h-4 w-4" />
                                                                  </button>
                                                              </div>
                                                          </div>
                                                      ))}
                                            </div>

                                            <Separator />

                                            {/* Special Instructions */}
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">
                                                    Special Instructions
                                                </Label>
                                                <Textarea
                                                    placeholder="Any special requests, dietary requirements..."
                                                    value={orderData.notes}
                                                    onChange={(e) =>
                                                        setOrderData(
                                                            (prev) => ({
                                                                ...prev,
                                                                notes: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    rows={2}
                                                    className="resize-none text-sm"
                                                />
                                            </div>

                                            <Separator />

                                            {/* Total Summary */}
                                            <div className="space-y-2">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">
                                                        Items ({totalItems})
                                                    </span>
                                                    <span>
                                                        {isCalculating ? (
                                                            <span className="text-muted-foreground">
                                                                Calculating...
                                                            </span>
                                                        ) : (
                                                            formatVietnameseCurrency(
                                                                totalPrice
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                                {apiResponse?.totalPromotion && (
                                                    <div className="flex justify-between text-sm text-green-600">
                                                        <span>
                                                            Promotion Discount
                                                        </span>
                                                        <span>
                                                            -
                                                            {formatVietnameseCurrency(
                                                                apiResponse.total -
                                                                    apiResponse.totalPromotion
                                                            )}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="flex justify-between text-lg font-semibold">
                                                    <span>Total</span>
                                                    <span className="text-orange-600">
                                                        {isCalculating ? (
                                                            <span className="text-muted-foreground">
                                                                Calculating...
                                                            </span>
                                                        ) : (
                                                            formatVietnameseCurrency(
                                                                apiResponse?.totalPromotion ||
                                                                    totalPrice
                                                            )
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-3">
                                                <Button
                                                    onClick={handlePlaceOrder}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 h-11 text-base"
                                                    disabled={
                                                        !orderData.customerName ||
                                                        !orderData.customerPhone ||
                                                        !orderData.branchId ||
                                                        !orderData.time ||
                                                        totalItems === 0 ||
                                                        isCalculating ||
                                                        createPreOrderMutation.isPending
                                                    }
                                                >
                                                    {createPreOrderMutation.isPending
                                                        ? 'Creating Order...'
                                                        : isCalculating
                                                          ? 'Calculating...'
                                                          : 'Place Order'}
                                                </Button>
                                                <Button
                                                    onClick={clearItems}
                                                    variant="outline"
                                                    className="w-full h-9 text-sm border-gray-300"
                                                >
                                                    Clear Cart
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pre-order Confirm Dialog */}
            <PreOrderConfirmDialog
                open={showPreOrderDialog}
                onOpenChange={setShowPreOrderDialog}
                preOrderData={preOrderData}
                onPaymentSuccess={() => {
                    clearItems();
                    setPreOrderData(null);
                }}
            />
        </div>
    );
}

export default function MenuBookingPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MenuBookingProvider>
                <MenuBookingPageContent />
            </MenuBookingProvider>
        </Suspense>
    );
}
