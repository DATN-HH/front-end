'use client';

import {
    ArrowLeft,
    Clock,
    MapPin,
    Phone,
    User,
    CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

import { useBranches } from '@/api/v1/branches';
import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
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
import {
    MenuBookingProvider,
    useMenuBooking,
} from '@/features/pre-order/context/MenuBookingContext';

interface OrderData {
    type: 'dine-in' | 'takeaway';
    branchId?: string;
    bookingTableId?: string;
    time?: string;
    phone: string;
    customerName: string;
    notes: string;
}

function MenuBookingPageContent() {
    const searchParams = useSearchParams();
    const { data: branches } = useBranches();
    const {
        items: menuItems,
        clearItems,
        getTotalItems,
        getTotalPrice,
    } = useMenuBooking();

    const [orderData, setOrderData] = useState<OrderData>({
        type: 'dine-in',
        phone: '',
        customerName: '',
        notes: '',
    });

    // Auto-fill data from query params
    useEffect(() => {
        const bookingTableId = searchParams.get('bookingtableId');
        const branchId = searchParams.get('branchId');
        const time = searchParams.get('time');
        const phone = searchParams.get('phone');
        const customerName = searchParams.get('customerName');

        if (bookingTableId || branchId || time || phone || customerName) {
            setOrderData((prev) => ({
                ...prev,
                bookingTableId: bookingTableId || undefined,
                branchId: branchId || undefined,
                time: time || undefined,
                phone: phone || '',
                customerName: customerName || '',
            }));
        }
    }, [searchParams]);

    // Calculate totals from context
    const totalItems = getTotalItems();
    const totalPrice = getTotalPrice();

    const handleOrderTypeChange = (type: 'dine-in' | 'takeaway') => {
        setOrderData((prev) => ({ ...prev, type }));
    };

    const handlePlaceOrder = () => {
        // TODO: Implement order placement logic
        // console.log('Placing order:', {
        //     orderData,
        //     menuItems,
        //     totalPrice,
        // });
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
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/menu">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Menu
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold">Menu Booking</h1>
                            <p className="text-gray-600">
                                Order your favorite dishes
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Show booking info if coming from table booking */}
            {isFromTableBooking && (
                <div className="container mx-auto px-4 py-4">
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

            <div className="container mx-auto px-4 py-4 md:py-8">
                <div className="flex flex-col space-y-6">
                    {/* Order Summary - Mobile First */}
                    <div className="order-1 md:order-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {/* Order Type */}
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">
                                        Order Type
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <RadioGroup
                                        value={orderData.type}
                                        onValueChange={(value) =>
                                            handleOrderTypeChange(
                                                value as 'dine-in' | 'takeaway'
                                            )
                                        }
                                        className="space-y-2"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="dine-in"
                                                id="dine-in"
                                            />
                                            <Label
                                                htmlFor="dine-in"
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <MapPin className="h-3 w-3" />
                                                Dine In
                                            </Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem
                                                value="takeaway"
                                                id="takeaway"
                                            />
                                            <Label
                                                htmlFor="takeaway"
                                                className="flex items-center gap-2 text-sm"
                                            >
                                                <Clock className="h-3 w-3" />
                                                Takeaway
                                            </Label>
                                        </div>
                                    </RadioGroup>

                                    {/* Dine In Suggestion */}
                                    {orderData.type === 'dine-in' &&
                                        !isFromTableBooking && (
                                            <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                                                💡 Book a table first for better
                                                experience
                                                <Link href="/table-booking">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="mt-1 w-full text-xs h-7"
                                                    >
                                                        Book Table
                                                    </Button>
                                                </Link>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>

                            {/* Branch Selection */}
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">
                                        Branch
                                    </CardTitle>
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
                                        <SelectTrigger className="h-9">
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
                                        <div className="mt-2 text-xs text-gray-600">
                                            <p className="truncate">
                                                {selectedBranch.address}
                                            </p>
                                            <p>{selectedBranch.phone}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Customer Information */}
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">
                                        Customer Info
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-3">
                                    <div>
                                        <Label
                                            htmlFor="customerName"
                                            className="text-sm"
                                        >
                                            <User className="h-3 w-3 inline mr-1" />
                                            Name
                                        </Label>
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
                                            className="h-9 mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="phone"
                                            className="text-sm"
                                        >
                                            <Phone className="h-3 w-3 inline mr-1" />
                                            Phone
                                        </Label>
                                        <Input
                                            id="phone"
                                            placeholder="Phone number"
                                            value={orderData.phone}
                                            onChange={(e) =>
                                                setOrderData((prev) => ({
                                                    ...prev,
                                                    phone: e.target.value,
                                                }))
                                            }
                                            className="h-9 mt-1"
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Time Selection */}
                            <Card className="md:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">
                                        Time
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-3">
                                    <div>
                                        <Label
                                            htmlFor="orderDate"
                                            className="text-sm"
                                        >
                                            <Clock className="h-3 w-3 inline mr-1" />
                                            Date
                                        </Label>
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
                                                    time: `${e.target.value}T${prev.time?.split('T')[1] || '12:00:00'}`,
                                                }))
                                            }
                                            className="h-9 mt-1"
                                            disabled={!!isFromTableBooking}
                                        />
                                    </div>
                                    <div>
                                        <Label
                                            htmlFor="orderTime"
                                            className="text-sm"
                                        >
                                            Time
                                        </Label>
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
                                                    time: `${prev.time?.split('T')[0] || new Date().toISOString().split('T')[0]}T${e.target.value}:00`,
                                                }))
                                            }
                                            className="h-9 mt-1"
                                            disabled={!!isFromTableBooking}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card className="md:col-span-2 lg:col-span-1">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    {totalItems === 0 ? (
                                        <p className="text-gray-500 text-center py-4 text-sm">
                                            No items selected
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Selected Items List */}
                                            <div className="space-y-2 max-h-32 overflow-y-auto">
                                                {menuItems.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex justify-between items-start text-xs"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium truncate">
                                                                {item.name}
                                                            </p>
                                                            {item.notes && (
                                                                <p className="text-gray-500 text-xs truncate">
                                                                    {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="text-right ml-2 flex-shrink-0">
                                                            <p className="font-medium">
                                                                {item.quantity}x{' '}
                                                                {formatVietnameseCurrency(
                                                                    item.price
                                                                )}
                                                            </p>
                                                            <p className="text-gray-600">
                                                                {formatVietnameseCurrency(
                                                                    item.price *
                                                                        item.quantity
                                                                )}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator />

                                            {/* Total Summary */}
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-sm">
                                                    <span>
                                                        Items ({totalItems})
                                                    </span>
                                                    <span>
                                                        {formatVietnameseCurrency(
                                                            totalPrice
                                                        )}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between font-semibold">
                                                    <span>Total</span>
                                                    <span className="text-orange-600">
                                                        {formatVietnameseCurrency(
                                                            totalPrice
                                                        )}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Button
                                                    onClick={handlePlaceOrder}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 h-9"
                                                    disabled={
                                                        !orderData.customerName ||
                                                        !orderData.phone ||
                                                        !orderData.branchId
                                                    }
                                                >
                                                    Place Order
                                                </Button>
                                                <Button
                                                    onClick={clearItems}
                                                    variant="outline"
                                                    className="w-full h-8 text-xs"
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Special Instructions - Full Width */}
                        <Card className="mt-4">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">
                                    Special Instructions
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Textarea
                                    placeholder="Any special requests, dietary requirements, or preparation notes..."
                                    value={orderData.notes}
                                    onChange={(e) =>
                                        setOrderData((prev) => ({
                                            ...prev,
                                            notes: e.target.value,
                                        }))
                                    }
                                    rows={2}
                                    className="resize-none"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Menu Section - Mobile Second */}
                    <div className="order-2 md:order-1">
                        <MenuBookingContent />
                    </div>
                </div>
            </div>
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
