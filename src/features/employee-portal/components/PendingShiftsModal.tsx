'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
    Clock,
    Calendar,
    MapPin,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader2,
    User,
    MessageSquare
} from 'lucide-react';
import { useMyPendingShifts, useRespondToShift, RequestStatus, StaffShiftFeedback } from '@/api/v1/publish-shifts';
import { useCustomToast } from '@/lib/show-toast';
import { format, parseISO, differenceInHours } from 'date-fns';

interface PendingShiftsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PendingShiftsModal({ open, onOpenChange }: PendingShiftsModalProps) {
    const { success, error } = useCustomToast();
    const [selectedShift, setSelectedShift] = useState<StaffShiftFeedback | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectDialog, setShowRejectDialog] = useState(false);

    const { data: pendingShifts = [], isLoading, refetch } = useMyPendingShifts();
    const respondMutation = useRespondToShift();

    const handleClose = () => {
        onOpenChange(false);
        setSelectedShift(null);
        setRejectionReason('');
        setShowRejectDialog(false);
    };

    const handleApprove = async (shift: StaffShiftFeedback) => {
        try {
            await respondMutation.mutateAsync({
                staffShiftId: shift.staffShiftId,
                responseStatus: RequestStatus.APPROVED,
            });
            success('Shift Approved', `You have accepted the shift on ${format(parseISO(shift.staffShift.scheduledShift.date), 'dd/MM/yyyy')}`);
            refetch();
        } catch (err: any) {
            error('Response Failed', err.response?.data?.message || 'Failed to respond to shift');
        }
    };

    const handleReject = async () => {
        if (!selectedShift) return;

        if (!rejectionReason.trim()) {
            error('Reason Required', 'Please provide a reason for rejecting this shift');
            return;
        }

        try {
            await respondMutation.mutateAsync({
                staffShiftId: selectedShift.staffShiftId,
                responseStatus: RequestStatus.REJECTED,
                reason: rejectionReason,
            });
            success('Shift Rejected', 'Your response has been sent to the manager');
            setShowRejectDialog(false);
            setSelectedShift(null);
            setRejectionReason('');
            refetch();
        } catch (err: any) {
            error('Response Failed', err.response?.data?.message || 'Failed to respond to shift');
        }
    };

    const getTimeUntilDeadline = (deadline: string) => {
        const deadlineDate = parseISO(deadline);
        const now = new Date();
        const hoursLeft = differenceInHours(deadlineDate, now);

        if (hoursLeft < 0) return { text: 'Expired', isUrgent: true, isExpired: true };
        if (hoursLeft < 2) return { text: `${hoursLeft}h left`, isUrgent: true, isExpired: false };
        if (hoursLeft < 24) return { text: `${hoursLeft}h left`, isUrgent: false, isExpired: false };

        const daysLeft = Math.floor(hoursLeft / 24);
        return { text: `${daysLeft}d left`, isUrgent: false, isExpired: false };
    };

    if (isLoading) {
        return (
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-muted-foreground">Loading your pending shifts...</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader className="border-b pb-6">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">My Pending Shifts</h1>
                                <p className="text-base text-muted-foreground mt-1">
                                    Review and respond to your assigned shifts
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="py-6">
                        {pendingShifts.length === 0 ? (
                            <Card className="border-2 border-dashed border-muted">
                                <CardContent className="pt-12 pb-12">
                                    <div className="text-center text-muted-foreground">
                                        <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                            <CheckCircle className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground mb-2">No pending shifts</h3>
                                        <p className="text-sm text-muted-foreground">
                                            You have no shifts waiting for your response
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 pb-4 border-b">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent text-accent-foreground">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <h2 className="text-xl font-semibold text-foreground">
                                        {pendingShifts.length} shift{pendingShifts.length !== 1 ? 's' : ''} awaiting response
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {pendingShifts.map((shift) => {
                                        const deadline = getTimeUntilDeadline(shift.deadline);

                                        return (
                                            <Card key={shift.id} className="border-2 hover:border-primary/50 transition-colors">
                                                <CardHeader className="pb-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex-1">
                                                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                                                    <Clock className="h-4 w-4" />
                                                                </div>
                                                                {shift.staffShift.scheduledShift.shiftName}
                                                            </CardTitle>
                                                            <CardDescription className="mt-2 text-muted-foreground">
                                                                {format(parseISO(shift.staffShift.scheduledShift.date), 'EEEE, MMMM dd, yyyy')} • {shift.staffShift.scheduledShift.startTime} - {shift.staffShift.scheduledShift.endTime}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={deadline.isExpired ? "destructive" : deadline.isUrgent ? "secondary" : "outline"}>
                                                                {deadline.text}
                                                            </Badge>
                                                            {deadline.isUrgent && !deadline.isExpired && (
                                                                <AlertTriangle className="h-4 w-4 text-destructive" />
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="space-y-4 rounded-lg">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                                            <span>Published: {format(parseISO(shift.publishedDate), 'dd/MM/yyyy HH:mm')}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-foreground">
                                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                                            <span>Deadline: {format(parseISO(shift.deadline), 'dd/MM/yyyy HH:mm')}</span>
                                                        </div>
                                                    </div>

                                                    {shift.staffShift.note && (
                                                        <div className="p-3 bg-muted/50 rounded-lg">
                                                            <div className="text-sm">
                                                                <span className="font-medium text-foreground">Note: </span>
                                                                <span className="text-muted-foreground">{shift.staffShift.note}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3 pt-4 border-t">
                                                        <Button
                                                            onClick={() => handleApprove(shift)}
                                                            disabled={respondMutation.isPending || deadline.isExpired}
                                                            className="flex-1 gap-2"
                                                        >
                                                            {respondMutation.isPending ? (
                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="h-4 w-4" />
                                                            )}
                                                            Accept Shift
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => {
                                                                setSelectedShift(shift);
                                                                setShowRejectDialog(true);
                                                            }}
                                                            disabled={respondMutation.isPending || deadline.isExpired}
                                                            className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <XCircle className="h-4 w-4" />
                                                            Reject Shift
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="border-t pt-6 bg-muted/30">
                        <Button variant="outline" onClick={handleClose} className="px-8 h-11">
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Confirmation Dialog */}
            <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-destructive" />
                            Reject Shift
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejecting this shift. This will be sent to your manager.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        {selectedShift && (
                            <div className="p-3 bg-muted rounded-lg">
                                <div className="text-sm font-medium text-foreground">
                                    {selectedShift.staffShift.scheduledShift.shiftName}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {format(parseISO(selectedShift.staffShift.scheduledShift.date), 'EEEE, MMMM dd, yyyy')} • {selectedShift.staffShift.scheduledShift.startTime} - {selectedShift.staffShift.scheduledShift.endTime}
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="reason" className="text-sm font-medium text-foreground">
                                Reason for rejection <span className="text-destructive">*</span>
                            </Label>
                            <Textarea
                                id="reason"
                                placeholder="e.g., I have a medical appointment, family emergency, etc."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="min-h-[100px] bg-white"
                            />
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRejectionReason('')}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleReject}
                            disabled={!rejectionReason.trim() || respondMutation.isPending}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            {respondMutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <MessageSquare className="mr-2 h-4 w-4" />
                                    Submit Rejection
                                </>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 