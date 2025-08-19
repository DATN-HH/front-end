'use client';

import {
    Clock,
    User,
    Phone,
    MapPin,
    UtensilsCrossed,
    ArrowRight,
    RefreshCw,
    Search,
} from 'lucide-react';
import { useState } from 'react';

import {
    useBranchPreOrders,
    useConvertPreOrderToPos,
    PreOrderListResponse,
    formatOrderType,
} from '@/api/v1/preorder-pos';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCustomToast } from '@/lib/show-toast';

interface PreOrderListProps {
    branchId: number | null;
    onConvertSuccess?: (posOrderId: number) => void;
}

export function PreOrderList({
    branchId,
    onConvertSuccess,
}: PreOrderListProps) {
    const { success, error } = useCustomToast();
    const [convertingIds, setConvertingIds] = useState<Set<number>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPreOrderId, setSelectedPreOrderId] = useState<number | null>(
        null
    );
    const [selectedOrderType, setSelectedOrderType] = useState<
        'dine-in' | 'takeaway' | 'all'
    >('all');

    const {
        data: preorders = [],
        isLoading,
        error: fetchError,
        refetch,
    } = useBranchPreOrders(branchId);

    const convertMutation = useConvertPreOrderToPos();

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'BOOKED':
                return 'bg-blue-100 text-blue-800';
            case 'DEPOSIT_PAID':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Filter preorders based on search and type
    const filteredPreOrders = preorders.filter((preorder) => {
        const matchesSearch =
            !searchQuery ||
            preorder.id.toString().includes(searchQuery) ||
            preorder.customerName
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
            preorder.customerPhone.includes(searchQuery);

        const matchesType =
            selectedOrderType === 'all' || preorder.type === selectedOrderType;

        return matchesSearch && matchesType;
    });

    // Get selected preorder details
    const selectedPreOrder = selectedPreOrderId
        ? filteredPreOrders.find(
              (preorder) => preorder.id === selectedPreOrderId
          )
        : filteredPreOrders[0];

    const handleConvert = async (preOrder: PreOrderListResponse) => {
        try {
            setConvertingIds((prev) => new Set(prev).add(preOrder.id));
            const result = await convertMutation.mutateAsync(preOrder.id);

            success(
                'Success',
                `PreOrder #${preOrder.id} converted to POS Order #${result.posOrderId} successfully`
            );

            onConvertSuccess?.(result.posOrderId);
            refetch(); // Refresh the list
        } catch (err: any) {
            error('Error', err.message || 'Failed to convert preorder');
        } finally {
            setConvertingIds((prev) => {
                const newSet = new Set(prev);
                newSet.delete(preOrder.id);
                return newSet;
            });
        }
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="flex h-full bg-gray-50">
            {/* Left Panel - PreOrders List */}
            <div className="w-2/3 bg-white border-r border-gray-200 flex flex-col">
                {/* PreOrders Header */}
                <div className="p-4 border-b border-gray-200 space-y-4">
                    {/* Order Type Tabs */}
                    <div className="flex space-x-1">
                        {(['all', 'dine-in', 'takeaway'] as const).map(
                            (type) => (
                                <Button
                                    key={type}
                                    variant={
                                        selectedOrderType === type
                                            ? 'default'
                                            : 'outline'
                                    }
                                    className={`px-4 py-2 font-medium capitalize ${
                                        selectedOrderType === type
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    onClick={() => setSelectedOrderType(type)}
                                >
                                    {type === 'all'
                                        ? 'All Types'
                                        : type.replace('-', ' ')}
                                </Button>
                            )
                        )}
                    </div>

                    {/* Search and Refresh */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                placeholder="Search by ID, customer name, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-10 w-10 p-0"
                            onClick={() => refetch()}
                            disabled={isLoading}
                            title="Reload preorders"
                        >
                            <RefreshCw
                                className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                            />
                        </Button>
                    </div>
                </div>

                {/* PreOrders List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-4">
                            <div className="animate-pulse space-y-3">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <div
                                        key={index}
                                        className="h-16 bg-gray-200 rounded"
                                    ></div>
                                ))}
                            </div>
                        </div>
                    ) : filteredPreOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                            <UtensilsCrossed className="w-12 h-12 mb-4" />
                            <p className="text-lg font-medium">
                                No PreOrders Found
                            </p>
                            <p className="text-sm">
                                {fetchError
                                    ? 'Error loading preorders'
                                    : 'No preorders match your criteria'}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {filteredPreOrders.map((preorder) => {
                                const totalAmount = preorder.items.reduce(
                                    (sum, item) =>
                                        sum + item.price * item.quantity,
                                    0
                                );
                                const isSelected =
                                    selectedPreOrder?.id === preorder.id;

                                return (
                                    <div
                                        key={preorder.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                            isSelected
                                                ? 'bg-blue-50 border-r-4 border-blue-500'
                                                : ''
                                        }`}
                                        onClick={() =>
                                            setSelectedPreOrderId(preorder.id)
                                        }
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-semibold text-gray-900">
                                                        PreOrder #{preorder.id}
                                                    </span>
                                                    <Badge
                                                        className={getStatusColor(
                                                            preorder.bookingStatus
                                                        )}
                                                    >
                                                        {preorder.bookingStatus}
                                                    </Badge>
                                                </div>

                                                <div className="text-sm text-gray-600 space-y-1">
                                                    <div className="flex items-center gap-1">
                                                        <User className="w-3 h-3" />
                                                        <span>
                                                            {
                                                                preorder.customerName
                                                            }
                                                        </span>
                                                        <span className="text-gray-400">
                                                            •
                                                        </span>
                                                        <Phone className="w-3 h-3" />
                                                        <span>
                                                            {
                                                                preorder.customerPhone
                                                            }
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>
                                                            {formatOrderType(
                                                                preorder.type
                                                            )}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            •
                                                        </span>
                                                        <Clock className="w-3 h-3" />
                                                        <span>
                                                            {formatDateTime(
                                                                preorder.time
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <UtensilsCrossed className="w-3 h-3" />
                                                        <span>
                                                            {
                                                                preorder.items
                                                                    .length
                                                            }{' '}
                                                            items
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900">
                                                    {formatVND(totalAmount)}
                                                </div>
                                                {preorder.totalDeposit > 0 && (
                                                    <div className="text-xs text-green-600">
                                                        Deposit:{' '}
                                                        {formatVND(
                                                            preorder.totalDeposit
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - PreOrder Details */}
            <div className="w-1/3 bg-white flex flex-col">
                {selectedPreOrder ? (
                    <>
                        {/* PreOrder Header */}
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-lg font-semibold">
                                    PreOrder #{selectedPreOrder.id}
                                </h2>
                                <Badge
                                    className={getStatusColor(
                                        selectedPreOrder.bookingStatus
                                    )}
                                >
                                    {selectedPreOrder.bookingStatus}
                                </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                                Created:{' '}
                                {formatDateTime(selectedPreOrder.createdAt)}
                            </p>
                        </div>

                        {/* PreOrder Details */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Customer Information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                        Customer Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-500" />
                                        <span className="font-medium">
                                            {selectedPreOrder.customerName}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>
                                            {selectedPreOrder.customerPhone}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>
                                            {formatOrderType(
                                                selectedPreOrder.type
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span>
                                            {formatDateTime(
                                                selectedPreOrder.time
                                            )}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Notes */}
                            {selectedPreOrder.notes && (
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">
                                            Notes
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-gray-700">
                                            {selectedPreOrder.notes}
                                        </p>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Items */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                        <UtensilsCrossed className="w-4 h-4" />
                                        Items ({selectedPreOrder.items.length})
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {selectedPreOrder.items.map(
                                        (item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-start p-2 bg-gray-50 rounded"
                                            >
                                                <div className="flex-1">
                                                    <div className="font-medium text-sm">
                                                        {item.productName}
                                                    </div>
                                                    {item.note && (
                                                        <div className="text-xs text-gray-500">
                                                            Note: {item.note}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge
                                                            variant="outline"
                                                            className="text-xs"
                                                        >
                                                            {item.type}
                                                        </Badge>
                                                        <span className="text-xs text-gray-500">
                                                            Qty: {item.quantity}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-sm font-medium">
                                                    {formatVND(
                                                        item.price *
                                                            item.quantity
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </CardContent>
                            </Card>

                            {/* Order Summary */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm">
                                        Order Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Total Amount:</span>
                                        <span className="font-medium">
                                            {formatVND(
                                                selectedPreOrder.items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.price *
                                                            item.quantity,
                                                    0
                                                )
                                            )}
                                        </span>
                                    </div>
                                    {selectedPreOrder.totalDeposit > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span>Deposit Paid:</span>
                                            <span className="font-medium text-green-600">
                                                {formatVND(
                                                    selectedPreOrder.totalDeposit
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm font-medium border-t pt-2">
                                        <span>Remaining:</span>
                                        <span>
                                            {formatVND(
                                                selectedPreOrder.items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        item.price *
                                                            item.quantity,
                                                    0
                                                ) -
                                                    selectedPreOrder.totalDeposit
                                            )}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* PreOrder Actions */}
                        <div className="p-4 border-t border-gray-200">
                            <Button
                                onClick={() => handleConvert(selectedPreOrder)}
                                disabled={
                                    convertingIds.has(selectedPreOrder.id) ||
                                    selectedPreOrder.bookingStatus ===
                                        'CANCELLED'
                                }
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                {convertingIds.has(selectedPreOrder.id) ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                        Converting...
                                    </>
                                ) : (
                                    <>
                                        <ArrowRight className="w-4 h-4 mr-2" />
                                        Convert to POS Order
                                    </>
                                )}
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <UtensilsCrossed className="w-16 h-16 mb-4 text-gray-400" />
                        <p className="text-lg font-medium">Select a PreOrder</p>
                        <p className="text-sm">
                            Click on a preorder to view details
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
