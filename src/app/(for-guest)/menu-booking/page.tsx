'use client';

import {
    Clock,
    MapPin,
    Phone,
    User,
    CheckCircle,
    Trash2,
    Calendar,
    Minus,
    Plus,
} from 'lucide-react';
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
import { useAuth } from '@/contexts/auth-context';
import { MenuBookingContent } from '@/features/pre-order/components/MenuBookingContent';
import { PreOrderConfirmInfoModal } from '@/features/pre-order/components/PreOrderConfirmInfoModal';
import { PreOrderConfirmModal } from '@/features/pre-order/components/PreOrderConfirmModal';
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
    date?: string; // Added for date selection
}

function MenuBookingPageContent() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const { data: branches } = useBranches();
    const { success, error } = useCustomToast();
    const {
        items: menuItems,
        addItem,
        removeItem,
        updateQuantity,
        clearItems,
        getTotalItems,
        getTotalPrice,
        isCalculating,
        calculatePrices,
        apiResponse,
        getItemNameById,
    } = useMenuBooking();

    const [orderData, setOrderData] = useState<OrderData>({
        type: 'dine-in',
        customerName: user?.fullName || '',
        notes: '',
        customerPhone: user?.phoneNumber || '',
    });

    // Pre-order states
    const [showPreOrderDialog, setShowPreOrderDialog] = useState(false);
    const [showPreOrderConfirmModal, setShowPreOrderConfirmModal] =
        useState(false);
    const [preOrderData, setPreOrderData] = useState<PreOrderResponse | null>(
        null
    );
    const createPreOrderMutation = useCreatePreOrder();

    // Check if coming from table booking
    const isFromTableBooking = searchParams.get('bookingtableId');

    // Check which fields are pre-filled from query params (should be disabled)
    const hasQueryBranchId = !!searchParams.get('branchId');
    const hasQueryTime = !!searchParams.get('time');
    const hasQueryCustomerName = !!searchParams.get('customerName');
    const hasQueryCustomerPhone = !!searchParams.get('customerPhone');
    const hasQueryDate = !!searchParams.get('date');

    // Auto-fill data from query params
    useEffect(() => {
        const bookingTableId = searchParams.get('bookingtableId');
        const branchId = searchParams.get('branchId');
        const time = searchParams.get('time');
        const customerName = searchParams.get('customerName');
        const customerPhone = searchParams.get('customerPhone');
        const date = searchParams.get('date'); // Added date from query params

        if (
            bookingTableId ||
            branchId ||
            time ||
            customerName ||
            customerPhone ||
            date
        ) {
            // Parse datetime if time parameter is in ISO format (from table booking)
            let parsedDate = date;
            let parsedTime = time;

            if (time && time.includes('T')) {
                // time parameter is full datetime (e.g., "2025-09-02T17:00:00")
                const dateObj = new Date(time);
                parsedDate = dateObj.toISOString().split('T')[0]; // "2025-09-02"
                parsedTime = dateObj.toTimeString().split(' ')[0].slice(0, 5); // "17:00"
            }

            setOrderData((prev) => ({
                ...prev,
                bookingTableId: bookingTableId || undefined,
                branchId: branchId || undefined,
                time: parsedTime || undefined,
                customerName: customerName || '',
                customerPhone: customerPhone || '',
                date: parsedDate || undefined,
            }));
        }
    }, [searchParams]);

    // Auto-select first branch and set current date/time if not from table booking
    useEffect(() => {
        if (!isFromTableBooking) {
            // Auto-select first branch if not selected
            if (branches && branches.length > 0 && !orderData.branchId) {
                setOrderData((prev) => ({
                    ...prev,
                    branchId: branches[0].id.toString(),
                }));
            }

            // Auto-set current date/time if not set
            if (!orderData.time) {
                const now = new Date();
                // Set to next hour (or current if it's within business hours)
                const currentHour = now.getHours();
                let targetHour =
                    currentHour < 23 ? currentHour + 1 : currentHour;

                // Ensure it's within business hours (6-23)
                if (targetHour < 6) targetHour = 6;
                if (targetHour > 23) targetHour = 6; // Next day 6am

                const targetDate =
                    targetHour === 6 && currentHour > 23
                        ? new Date(now.getTime() + 24 * 60 * 60 * 1000) // Next day
                        : now;

                const dateStr = targetDate.toISOString().split('T')[0];
                const timeStr = `${targetHour.toString().padStart(2, '0')}:00:00`;

                setOrderData((prev) => ({
                    ...prev,
                    time: `${dateStr}T${timeStr}`,
                }));
            }
        }
    }, [branches, isFromTableBooking, orderData.branchId, orderData.time]);

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

    // Handle updating quantity for an item
    const handleUpdateQuantity = (
        apiItem: any,
        itemType: 'product' | 'variant' | 'combo',
        newQuantity: number
    ) => {
        // Find the corresponding local item
        const localItem = menuItems.find((item) => {
            const itemId = item.comboId || item.variantId || item.productId;
            return (
                itemId === apiItem.id &&
                item.type === itemType &&
                (item.notes || '') === (apiItem.note || '')
            );
        });

        if (localItem) {
            updateQuantity(localItem.id, newQuantity);
        }
    };

    const handleOrderTypeChange = (type: 'dine-in' | 'takeaway') => {
        setOrderData((prev) => ({ ...prev, type }));
    };

    const handlePlaceOrder = async () => {
        // Validate required fields
        if (
            !orderData.customerName ||
            !orderData.customerPhone ||
            !orderData.branchId
        ) {
            error('Validation Error', 'Please fill in all required fields');
            return;
        }

        if (!orderData.time || !orderData.date) {
            error(
                'Validation Error',
                'Please select pickup/dining date and time'
            );
            return;
        }

        if (menuItems.length === 0) {
            error('Validation Error', 'Please add items to your order');
            return;
        }

        // Show confirmation modal instead of directly placing order
        setShowPreOrderConfirmModal(true);
    };

    const handleConfirmPlaceOrder = async () => {
        try {
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
                time: `${orderData.date}T${orderData.time}:00`, // ISO format: yyyy-MM-ddTHH:mm:ss
                customerName: orderData.customerName,
                customerPhone: orderData.customerPhone,
                notes: orderData.notes || undefined,
                orderItems,
            };

            // Create pre-order
            const result =
                await createPreOrderMutation.mutateAsync(preOrderRequest);

            setPreOrderData(result);
            setShowPreOrderConfirmModal(false); // Close confirm modal
            setShowPreOrderDialog(true); // Show payment dialog
            success('Success', 'Pre-order created successfully!');
        } catch (err: any) {
            console.error('Failed to create pre-order:', err);
            error(
                'Error',
                err.response?.data?.message || 'Failed to create pre-order'
            );
        }
    };

    const selectedBranch = branches?.find(
        (b) => b.id.toString() === orderData.branchId
    );

    const formatBookingTime = (timeString: string, dateString?: string) => {
        if (dateString) {
            // If we have separate date and time strings, combine them
            const date = new Date(`${dateString}T${timeString}:00`);
            return date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        } else {
            // Assume timeString is already in full datetime format
            const date = new Date(timeString);
            return date.toLocaleString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            });
        }
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
                                            ` • ${formatBookingTime(orderData.time, orderData.date)}`}
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
                        {/* Order Type & Customer Info */}
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
                                <CardContent className="pt-0">
                                    <div className="space-y-4">
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
                                                    value={
                                                        orderData.customerName
                                                    }
                                                    onChange={(e) =>
                                                        setOrderData(
                                                            (prev) => ({
                                                                ...prev,
                                                                customerName:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="h-10 pl-10"
                                                    disabled={
                                                        hasQueryCustomerName
                                                    }
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
                                                    value={
                                                        orderData.customerPhone
                                                    }
                                                    onChange={(e) =>
                                                        setOrderData(
                                                            (prev) => ({
                                                                ...prev,
                                                                customerPhone:
                                                                    e.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    className="h-10 pl-10"
                                                    disabled={
                                                        hasQueryCustomerPhone
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Branch & Preferred Time */}
                        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3 space-y-1">
                                <CardTitle className="text-lg font-semibold">
                                    Branch & Preferred Time
                                </CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Choose your preferred branch and time
                                </p>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="branch"
                                            className="text-sm font-medium"
                                        >
                                            Branch
                                        </Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                                            <Select
                                                value={
                                                    orderData.branchId?.toString() ||
                                                    ''
                                                }
                                                onValueChange={(value) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        branchId: value,
                                                    }))
                                                }
                                                disabled={hasQueryBranchId}
                                            >
                                                <SelectTrigger className="h-10 pl-10">
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
                                                    )) || []}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="date"
                                            className="text-sm font-medium"
                                        >
                                            Date
                                        </Label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                                            <Input
                                                id="date"
                                                type="date"
                                                min={
                                                    new Date()
                                                        .toISOString()
                                                        .split('T')[0]
                                                }
                                                value={orderData.date}
                                                disabled={
                                                    hasQueryDate || hasQueryTime
                                                }
                                                onChange={(e) => {
                                                    const selectedDate =
                                                        e.target.value;
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        date: selectedDate,
                                                    }));

                                                    // If selecting today's date and current time is past 23:00 or selected time is in the past
                                                    const now = new Date();
                                                    const isToday =
                                                        selectedDate ===
                                                        now
                                                            .toISOString()
                                                            .split('T')[0];

                                                    if (
                                                        isToday &&
                                                        orderData.time
                                                    ) {
                                                        const [hours] =
                                                            orderData.time
                                                                .split(':')
                                                                .map(Number);
                                                        const currentHour =
                                                            now.getHours();

                                                        if (
                                                            hours < 6 ||
                                                            hours > 23 ||
                                                            hours <= currentHour
                                                        ) {
                                                            // Set to next valid hour
                                                            const nextHour =
                                                                Math.min(
                                                                    Math.max(
                                                                        currentHour +
                                                                            1,
                                                                        6
                                                                    ),
                                                                    23
                                                                );
                                                            setOrderData(
                                                                (current) => ({
                                                                    ...current,
                                                                    time: `${nextHour
                                                                        .toString()
                                                                        .padStart(
                                                                            2,
                                                                            '0'
                                                                        )}:00`,
                                                                })
                                                            );
                                                        }
                                                    }
                                                }}
                                                className="h-10 pl-10"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="time"
                                            className="text-sm font-medium"
                                        >
                                            Time
                                        </Label>
                                        <div className="relative">
                                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                                            <Select
                                                value={orderData.time}
                                                onValueChange={(value) =>
                                                    setOrderData((prev) => ({
                                                        ...prev,
                                                        time: value,
                                                    }))
                                                }
                                                disabled={hasQueryTime}
                                            >
                                                <SelectTrigger className="h-10 pl-10">
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {Array.from(
                                                        { length: 18 },
                                                        (_, i) => {
                                                            const hour = i + 6; // 6 AM to 11 PM
                                                            const timeStr = `${hour
                                                                .toString()
                                                                .padStart(
                                                                    2,
                                                                    '0'
                                                                )}:00`;

                                                            // Check if this hour should be disabled (past time on current date)
                                                            const isToday =
                                                                orderData.date ===
                                                                new Date()
                                                                    .toISOString()
                                                                    .split(
                                                                        'T'
                                                                    )[0];
                                                            const currentHour =
                                                                new Date().getHours();
                                                            const isPastHour =
                                                                isToday &&
                                                                hour <=
                                                                    currentHour;

                                                            return (
                                                                <SelectItem
                                                                    key={
                                                                        timeStr
                                                                    }
                                                                    value={
                                                                        timeStr
                                                                    }
                                                                    disabled={
                                                                        isPastHour
                                                                    }
                                                                >
                                                                    {timeStr}
                                                                    {isPastHour &&
                                                                        ' (Past)'}
                                                                </SelectItem>
                                                            );
                                                        }
                                                    )}
                                                </SelectContent>
                                            </Select>
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

                    {/* Order Summary - Right Side Sidebar */}
                    <div className="lg:w-[400px]">
                        <div className="lg:sticky lg:top-[80px] space-y-6">
                            {/* Order Summary */}
                            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-3 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-lg font-semibold">
                                                Order Summary ({totalItems}{' '}
                                                {totalItems === 1
                                                    ? 'item'
                                                    : 'items'}
                                                )
                                            </CardTitle>
                                            {/* <p className="text-sm text-muted-foreground">
                                        Review your order details
                                        {apiResponse && (
                                            <span className="inline-flex items-center gap-1 ml-2 text-green-600">
                                                <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full"></span>
                                                Prices calculated
                                            </span>
                                        )}
                                            </p> */}
                                        </div>
                                        <Button
                                            onClick={clearItems}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                                        >
                                            Clear
                                        </Button>
                                    </div>
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
                                            {/* Selected Items List - Scrollable */}
                                            <div className="space-y-3 max-h-[35vh] lg:max-h-[35vh] overflow-y-auto pr-2">
                                                {orderItems.length > 0 ? (
                                                    orderItems.map((item) => (
                                                        <div
                                                            key={item.tempId}
                                                            className="group py-3 px-3 hover:bg-gray-50 rounded-lg transition-colors duration-150"
                                                        >
                                                            {/* Item name with price indicator */}
                                                            <div className="flex items-center justify-between mb-2">
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    <h3 className="font-medium text-sm text-gray-900 truncate">
                                                                        {
                                                                            item.name
                                                                        }
                                                                    </h3>
                                                                    <span
                                                                        className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"
                                                                        title="Giá được tính tự động"
                                                                    />
                                                                </div>
                                                            </div>

                                                            {/* Note */}
                                                            {item.note && (
                                                                <p className="text-gray-600 text-xs mb-3 leading-relaxed">
                                                                    {item.note}
                                                                </p>
                                                            )}

                                                            {/* Price and total */}
                                                            <div className="flex justify-between items-center mb-3">
                                                                <span className="font-medium text-sm text-gray-900">
                                                                    {formatVietnameseCurrency(
                                                                        item.price
                                                                    )}
                                                                </span>
                                                                <span className="font-semibold text-sm text-gray-900">
                                                                    {formatVietnameseCurrency(
                                                                        item.totalPrice
                                                                    )}
                                                                </span>
                                                            </div>

                                                            {/* Quantity controls and delete */}
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateQuantity(
                                                                                item,
                                                                                item.type,
                                                                                item.quantity -
                                                                                    1
                                                                            )
                                                                        }
                                                                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                                                                        disabled={
                                                                            item.quantity <=
                                                                            1
                                                                        }
                                                                    >
                                                                        <Minus className="h-3 w-3" />
                                                                    </button>

                                                                    <span className="w-8 text-center text-sm font-medium text-gray-900">
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </span>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleUpdateQuantity(
                                                                                item,
                                                                                item.type,
                                                                                item.quantity +
                                                                                    1
                                                                            )
                                                                        }
                                                                        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
                                                                    >
                                                                        <Plus className="h-3 w-3" />
                                                                    </button>
                                                                </div>

                                                                {/* Delete button */}
                                                                <button
                                                                    onClick={() =>
                                                                        handleRemoveOrderItem(
                                                                            item,
                                                                            item.type
                                                                        )
                                                                    }
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-100 rounded-md text-red-500 hover:text-red-700"
                                                                    title="Remove item"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-8 text-gray-500">
                                                        <p className="text-sm">
                                                            No items in your
                                                            cart yet
                                                        </p>
                                                    </div>
                                                )}
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

                                            {/* Total Breakdown */}
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

                                            <div className="pt-3">
                                                <Button
                                                    onClick={handlePlaceOrder}
                                                    className="w-full bg-orange-500 hover:bg-orange-600 h-11 text-base"
                                                    disabled={
                                                        !orderData.customerName ||
                                                        !orderData.customerPhone ||
                                                        !orderData.branchId ||
                                                        !orderData.time ||
                                                        !orderData.date ||
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
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pre-Order Confirmation Modal */}
            <PreOrderConfirmModal
                open={showPreOrderConfirmModal}
                onOpenChange={setShowPreOrderConfirmModal}
                onConfirm={handleConfirmPlaceOrder}
                orderData={{
                    branchId: orderData.branchId || '',
                    branchName: selectedBranch?.name,
                    date: orderData.date || '',
                    time: orderData.time || '',
                    customerName: orderData.customerName,
                    customerPhone: orderData.customerPhone,
                    customerEmail: undefined, // OrderData doesn't have customerEmail field
                    specialNotes: orderData.notes,
                }}
                orderItems={menuItems.map((item) => ({
                    id: item.productId || item.comboId || item.variantId || 0,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: undefined, // MenuBookingItem doesn't have image field
                }))}
                totalPrice={totalPrice}
                isSubmitting={createPreOrderMutation.isPending}
            />

            {/* Pre-order Confirm Info Modal */}
            <PreOrderConfirmInfoModal
                open={showPreOrderDialog}
                onOpenChange={setShowPreOrderDialog}
                preOrderData={preOrderData}
                onCancel={() => {
                    setShowPreOrderDialog(false);
                }}
                onPaymentSuccess={() => {
                    clearItems();
                    setPreOrderData(null);
                    setShowPreOrderDialog(false);
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
