'use client';

import {
    Calendar,
    Clock,
    Users,
    User,
    Phone,
    Mail,
    MessageSquare,
    Timer,
    X,
    CheckCircle,
    AlertCircle,
} from 'lucide-react';
import { useState } from 'react';

import {
    WaitlistResponseDto,
    useCancelWaitlist,
    getStatusColor,
    getStatusIcon,
    getStatusDisplayName,
    formatWaitTime,
} from '@/api/v1/waitlist';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useCustomToast } from '@/lib/show-toast';

interface WaitlistCardProps {
    waitlist: WaitlistResponseDto;
    onRefresh?: () => void;
    showActions?: boolean;
    compact?: boolean;
}

export function WaitlistCard({
    waitlist,
    onRefresh,
    showActions = true,
    compact = false,
}: WaitlistCardProps) {
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const { success, error } = useCustomToast();
    const cancelMutation = useCancelWaitlist();

    const formatDateTime = (datetime: string) => {
        return new Date(datetime).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDate = (datetime: string) => {
        return new Date(datetime).toLocaleDateString('vi-VN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (datetime: string) => {
        return new Date(datetime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleCancel = async () => {
        try {
            const response = await cancelMutation.mutateAsync(waitlist.id);

            if (response.success) {
                success(
                    'Success',
                    response.message || 'Waitlist entry cancelled successfully'
                );
                onRefresh?.();
                setShowCancelDialog(false);
            }
        } catch (err: any) {
            console.error('Cancel waitlist error:', err);
            const errorMessage =
                err.response?.data?.message ||
                err.message ||
                'An error occurred';
            error('Error', errorMessage);
        }
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return {
                    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
                    description:
                        'We are looking for a suitable table for you...',
                };
            case 'NOTIFIED':
                return {
                    color: 'text-blue-700 bg-blue-50 border-blue-200',
                    description:
                        'Table available! Please check your email to proceed with payment.',
                };
            case 'CONVERTED':
                return {
                    color: 'text-green-700 bg-green-50 border-green-200',
                    description:
                        'Booking confirmed successfully! Enjoy your meal.',
                };
            case 'EXPIRED':
                return {
                    color: 'text-red-700 bg-red-50 border-red-200',
                    description: 'Wait time has expired.',
                };
            case 'CANCELLED':
                return {
                    color: 'text-gray-700 bg-gray-50 border-gray-200',
                    description: 'Waitlist entry has been cancelled.',
                };
            default:
                return {
                    color: 'text-gray-700 bg-gray-50 border-gray-200',
                    description: '',
                };
        }
    };

    const statusInfo = getStatusInfo(waitlist.waitlistStatus);
    const canCancel =
        waitlist.waitlistStatus === 'ACTIVE' ||
        waitlist.waitlistStatus === 'NOTIFIED';

    return (
        <>
            <Card className="w-full">
                <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <CardTitle
                                className={`flex items-center gap-2 ${compact ? 'text-base' : 'text-lg'}`}
                            >
                                <Timer className="w-5 h-5 text-orange-500" />
                                Waitlist #{waitlist.id}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Registered at{' '}
                                {formatDateTime(waitlist.createdAt)}
                            </p>
                        </div>
                        <Badge
                            className={`${getStatusColor(waitlist.waitlistStatus)} font-medium`}
                        >
                            {getStatusIcon(waitlist.waitlistStatus)}{' '}
                            {getStatusDisplayName(waitlist.waitlistStatus)}
                        </Badge>
                    </div>
                </CardHeader>

                <CardContent className={`space-y-${compact ? '3' : '4'}`}>
                    {/* Status Description */}
                    <div
                        className={`p-3 rounded-lg border ${statusInfo.color}`}
                    >
                        <div className="flex items-center gap-2">
                            {waitlist.waitlistStatus === 'CONVERTED' && (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            {waitlist.waitlistStatus === 'EXPIRED' && (
                                <AlertCircle className="w-4 h-4" />
                            )}
                            {(waitlist.waitlistStatus === 'ACTIVE' ||
                                waitlist.waitlistStatus === 'NOTIFIED') && (
                                <Timer className="w-4 h-4" />
                            )}
                            <p className="text-sm font-medium">
                                {statusInfo.description}
                            </p>
                        </div>
                    </div>

                    {/* Time Information */}
                    <div
                        className={`grid grid-cols-1 ${compact ? 'gap-2' : 'md:grid-cols-2 gap-4'}`}
                    >
                        <div className={`space-y-${compact ? '2' : '3'}`}>
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-blue-500" />
                                <span className="font-medium">Date:</span>
                                <span>
                                    {compact
                                        ? formatDate(
                                              waitlist.preferredStartTime
                                          )
                                              .split(',')[1]
                                              ?.trim()
                                        : formatDate(
                                              waitlist.preferredStartTime
                                          )}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-green-500" />
                                <span className="font-medium">Time:</span>
                                <span>
                                    {formatTime(waitlist.preferredStartTime)} -{' '}
                                    {formatTime(waitlist.preferredEndTime)}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-purple-500" />
                                <span className="font-medium">Guests:</span>
                                <span>
                                    {waitlist.guestCount}{' '}
                                    {waitlist.guestCount === 1
                                        ? 'person'
                                        : 'people'}
                                </span>
                            </div>
                        </div>

                        {!compact && (
                            <div className="space-y-3">
                                {waitlist.waitlistStatus === 'ACTIVE' && (
                                    <>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Timer className="w-4 h-4 text-orange-500" />
                                            <span className="font-medium">
                                                Estimated wait time:
                                            </span>
                                            <span className="text-orange-600 font-medium">
                                                {formatWaitTime(
                                                    waitlist.estimatedWaitTime
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock className="w-4 h-4 text-red-500" />
                                            <span className="font-medium">
                                                Time remaining:
                                            </span>
                                            <span className="text-red-600 font-medium">
                                                {waitlist.timeRemaining}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">
                                        Duration:
                                    </span>
                                    <span>
                                        {waitlist.duration}{' '}
                                        {waitlist.duration === 1
                                            ? 'hour'
                                            : 'hours'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {!compact && (
                        <>
                            <Separator />

                            {/* Customer Information */}
                            <div className="space-y-3">
                                <h4 className="font-medium text-sm text-muted-foreground">
                                    Customer Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <User className="w-4 h-4 text-blue-500" />
                                        <span className="font-medium">
                                            Name:
                                        </span>
                                        <span>{waitlist.customerName}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="w-4 h-4 text-green-500" />
                                        <span className="font-medium">
                                            Phone:
                                        </span>
                                        <span>{waitlist.customerPhone}</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm md:col-span-2">
                                        <Mail className="w-4 h-4 text-purple-500" />
                                        <span className="font-medium">
                                            Email:
                                        </span>
                                        <span className="break-all">
                                            {waitlist.customerEmail}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {waitlist.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                            <MessageSquare className="w-4 h-4" />
                                            Notes
                                        </div>
                                        <p className="text-sm bg-gray-50 p-3 rounded-lg">
                                            {waitlist.notes}
                                        </p>
                                    </div>
                                </>
                            )}
                        </>
                    )}

                    {/* Action Buttons */}
                    {showActions && canCancel && (
                        <>
                            {!compact && <Separator />}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowCancelDialog(true)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel Waitlist
                                </Button>
                            </div>
                        </>
                    )}

                    {/* Booking Link */}
                    {waitlist.bookingCreatedId && (
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <p className="text-sm text-green-700">
                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                Booking created with ID:{' '}
                                <span className="font-mono font-medium">
                                    #{waitlist.bookingCreatedId}
                                </span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Cancel Confirmation Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Cancel Waitlist</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to cancel this waitlist entry?
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowCancelDialog(false)}
                            disabled={cancelMutation.isPending}
                        >
                            No
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending
                                ? 'Cancelling...'
                                : 'Cancel Waitlist'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
