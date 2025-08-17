'use client';

import { Clock, User, ChevronRight, ChevronLeft, Package } from 'lucide-react';
import React, { useState } from 'react';

import { KdsItem, useUpdateItemStatus } from '@/api/v1/kds';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
    KdsItemStatus,
    KDS_STATUS_LABELS,
    KDS_STATUS_COLORS,
    ORDER_TYPE_LABELS,
    getNextStatus,
    getPreviousStatus,
    getPriorityColor,
    formatWaitingTime,
} from '@/types/kds';

import { StaffAssignmentModal } from './StaffAssignmentModal';

interface KDSItemCardProps {
    item: KdsItem;
    showActions: boolean;
    compact: boolean;
}

export function KDSItemCard({ item, showActions, compact }: KDSItemCardProps) {
    const [showStaffModal, setShowStaffModal] = useState(false);
    const updateStatusMutation = useUpdateItemStatus();

    // Convert string status to enum
    const currentStatus = item.itemStatus as KdsItemStatus;
    const nextStatus = getNextStatus(currentStatus);
    const previousStatus = getPreviousStatus(currentStatus);

    const handleStatusChange = async (
        newStatus: KdsItemStatus,
        assignedUserId?: number
    ) => {
        // The API expects the string type directly
        try {
            await updateStatusMutation.mutateAsync({
                itemId: item.id,
                newStatus: newStatus as
                    | 'COOKING'
                    | 'READY_TO_SERVE'
                    | 'COMPLETED',
                assignedUserId,
            });
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleNextStatus = () => {
        if (!nextStatus) return;

        // If moving to COOKING status, show staff assignment modal
        if (nextStatus === KdsItemStatus.COOKING) {
            setShowStaffModal(true);
        } else {
            handleStatusChange(nextStatus);
        }
    };

    const handlePreviousStatus = () => {
        if (!previousStatus) return;
        handleStatusChange(previousStatus);
    };

    const handleStaffAssignment = (staffId: number) => {
        if (nextStatus) {
            handleStatusChange(nextStatus, staffId);
        }
        setShowStaffModal(false);
    };

    return (
        <>
            <Card className="hover:shadow-md transition-shadow h-full w-full max-w-md min-w-[320px]">
                <div
                    className="grid h-full"
                    style={{ gridTemplateColumns: '40px 1fr 40px' }}
                >
                    {/* Left Arrow Column */}
                    <div className="flex items-stretch h-full border-r">
                        {previousStatus && showActions && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handlePreviousStatus}
                                disabled={updateStatusMutation.isPending}
                                className="h-full w-full rounded-none hover:bg-gray-100 px-0"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Button>
                        )}
                    </div>

                    {/* Main Content */}
                    <div className="overflow-hidden">
                        <CardHeader className="p-3 pb-2 flex-shrink-0">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center gap-1 mb-1">
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${KDS_STATUS_COLORS[item.itemStatus]}`}
                                        >
                                            {KDS_STATUS_LABELS[item.itemStatus]}
                                        </Badge>
                                        {item.itemStatus ===
                                            KdsItemStatus.SEND_TO_KITCHEN &&
                                            item.priority && (
                                                <Badge
                                                    variant="secondary"
                                                    className="text-xs"
                                                >
                                                    P{item.priority}
                                                </Badge>
                                            )}
                                        <div
                                            className={`w-2 h-2 rounded-full ${getPriorityColor(item.waitingTimeMinutes)}`}
                                            title={`Wait time: ${formatWaitingTime(item.waitingTimeMinutes)}`}
                                        />
                                    </div>
                                    <h3 className="font-semibold text-sm text-gray-900 truncate max-w-full">
                                        {item.isCombo
                                            ? item.comboName
                                            : item.productName}
                                        {item.variantName &&
                                            ` (${item.variantName})`}
                                    </h3>
                                    <p className="text-xs text-gray-600 truncate max-w-full">
                                        #{item.orderId} •{' '}
                                        {item.tableNumbers || 'Takeaway'}
                                    </p>
                                </div>
                                <div className="text-right flex-shrink-0 ml-2">
                                    <p className="font-bold text-sm whitespace-nowrap">
                                        x{item.quantity}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-3 pt-0 flex-1 flex flex-col overflow-hidden">
                            {/* Order Info - Compact */}
                            <div className="space-y-1 mb-3 flex-1">
                                <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                                    <Package className="h-3 w-3" />
                                    <span>
                                        {ORDER_TYPE_LABELS[item.orderType]}
                                    </span>
                                    {item.customerName && (
                                        <>
                                            <span>•</span>
                                            <span className="truncate">
                                                {item.customerName}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        Wait:{' '}
                                        {formatWaitingTime(
                                            item.waitingTimeMinutes
                                        )}
                                    </span>
                                </div>

                                {item.assignedUserName && (
                                    <div className="flex items-center gap-1 text-xs text-gray-600 truncate">
                                        <User className="h-3 w-3" />
                                        <span className="truncate">
                                            {item.assignedUserName}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Notes - Compact */}
                            {item.notes && (
                                <div className="mb-2">
                                    <p className="text-xs text-gray-700 bg-gray-50 p-1 rounded truncate">
                                        {item.notes}
                                    </p>
                                </div>
                            )}

                            {/* Combo Items - Show All */}
                            {item.isCombo &&
                                item.comboItems &&
                                item.comboItems.length > 0 && (
                                    <div className="mb-2 overflow-hidden">
                                        <p className="text-xs font-medium text-gray-600 mb-1">
                                            Combo:
                                        </p>
                                        <div className="space-y-0.5">
                                            {item.comboItems.map(
                                                (comboItem, index) => (
                                                    <div
                                                        key={index}
                                                        className="text-xs text-gray-600 flex justify-between"
                                                    >
                                                        <span className="truncate flex-1 mr-2">
                                                            •{' '}
                                                            {
                                                                comboItem.productName
                                                            }
                                                        </span>
                                                        <span className="flex-shrink-0">
                                                            x
                                                            {comboItem.quantity}
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}
                        </CardContent>
                    </div>

                    {/* Right Arrow Column */}
                    <div className="flex items-stretch h-full border-l">
                        {nextStatus && showActions && (
                            <Button
                                size="sm"
                                onClick={handleNextStatus}
                                disabled={updateStatusMutation.isPending}
                                className="h-full w-full rounded-none hover:bg-gray-100 px-0"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Staff Assignment Modal */}
            <StaffAssignmentModal
                isOpen={showStaffModal}
                onClose={() => setShowStaffModal(false)}
                onAssign={handleStaffAssignment}
                itemName={item.isCombo ? item.comboName : item.productName}
            />
        </>
    );
}
