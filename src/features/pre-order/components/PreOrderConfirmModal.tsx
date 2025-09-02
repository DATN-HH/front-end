'use client';

import {
    Calendar,
    Clock,
    MapPin,
    Phone,
    User,
    CreditCard,
    Utensils,
    CheckCircle,
    Mail,
    ShoppingBag,
} from 'lucide-react';

import { formatVietnameseCurrency } from '@/api/v1/menu/menu-products';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface MenuItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl?: string;
}

interface PreOrderConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    orderData: {
        branchId: string;
        branchName?: string;
        date: string;
        time: string;
        customerName: string;
        customerPhone: string;
        customerEmail?: string;
        specialNotes?: string;
    };
    orderItems: MenuItem[];
    totalPrice: number;
    isSubmitting?: boolean;
}

export function PreOrderConfirmModal({
    open,
    onOpenChange,
    onConfirm,
    orderData,
    orderItems,
    totalPrice,
    isSubmitting = false,
}: PreOrderConfirmModalProps) {
    const formatDateTime = (dateStr: string, timeStr: string) => {
        try {
            const date = new Date(`${dateStr}T${timeStr}:00`);
            return date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (error) {
            return `${dateStr} at ${timeStr}`;
        }
    };

    // Use the imported formatVietnameseCurrency function

    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-white to-gray-50/50">
                <DialogHeader className="pb-6">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="p-2 bg-gray-100 rounded-full">
                            <CheckCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-gray-900">
                                Confirm Your Order
                            </p>
                            <p className="text-sm text-gray-600 font-normal">
                                Please review your pre-order details
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-600" />
                            Customer Information
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Name
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {orderData.customerName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                    <Phone className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Phone
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {orderData.customerPhone}
                                    </p>
                                </div>
                            </div>
                            {orderData.customerEmail && (
                                <div className="flex items-center gap-3 sm:col-span-2">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        <Mail className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                                            Email
                                        </p>
                                        <p className="font-semibold text-gray-900">
                                            {orderData.customerEmail}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            Order Details
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Branch
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {orderData.branchName ||
                                            `Branch #${orderData.branchId}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Clock className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Pickup Time
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {formatDateTime(
                                            orderData.date,
                                            orderData.time
                                        )}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <ShoppingBag className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                                        Total Items
                                    </p>
                                    <p className="font-semibold text-gray-900">
                                        {totalItems} item
                                        {totalItems > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items Card */}
                    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Utensils className="w-4 h-4 text-purple-600" />
                            Order Items ({orderItems.length})
                        </h3>
                        <div className="space-y-3">
                            {orderItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 rounded-lg hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Utensils className="w-4 h-4 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {item.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Quantity: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-purple-600">
                                            {formatVietnameseCurrency(
                                                item.price * item.quantity
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatVietnameseCurrency(
                                                item.price
                                            )}
                                            /each
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Special Notes Card */}
                    {orderData.specialNotes && (
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-3">
                                Special Notes
                            </h3>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                <p className="text-sm text-amber-800 italic">
                                    "{orderData.specialNotes}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Summary Card */}
                    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-gray-600" />
                                Order Summary
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Total Items</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {totalItems} items
                                </p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600">Total Amount</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {formatVietnameseCurrency(totalPrice)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-12 border-gray-300 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            <span className="font-medium">Back to Edit</span>
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="flex-1 h-12"
                            disabled={isSubmitting}
                        >
                            <span className="font-medium">
                                {isSubmitting ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline-block" />
                                        Placing Order...
                                    </>
                                ) : (
                                    'Confirm & Place Order'
                                )}
                            </span>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
