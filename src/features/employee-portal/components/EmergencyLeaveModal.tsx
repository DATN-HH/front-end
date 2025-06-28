'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Clock, MapPin, Calendar } from 'lucide-react';
import { useRequestEmergencyLeave } from '@/api/v1/staff-shifts';
import { useCustomToast } from '@/lib/show-toast';
import { format } from 'date-fns';

interface EmergencyLeaveModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    shift?: {
        id: number;
        shiftName: string;
        startTime: string;
        endTime: string;
        date: string;
        branchName: string;
        note?: string;
    } | null;
    onSuccess?: () => void;
}

export function EmergencyLeaveModal({
    open,
    onOpenChange,
    shift,
    onSuccess
}: EmergencyLeaveModalProps) {
    const [reason, setReason] = useState('');
    const { success, error } = useCustomToast();

    const requestEmergencyLeaveMutation = useRequestEmergencyLeave();

    const handleSubmit = async () => {
        if (!shift) return;

        try {
            await requestEmergencyLeaveMutation.mutateAsync({
                staffShiftId: shift.id,
                reason: reason.trim() || undefined
            });

            success('Success', 'Emergency leave request submitted successfully');
            onOpenChange(false);
            setReason('');
            onSuccess?.();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to submit emergency leave request');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setReason('');
    };

    if (!shift) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive/10 text-destructive">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                Emergency Leave Request
                            </DialogTitle>
                            <DialogDescription className="text-base text-muted-foreground mt-1">
                                Request emergency leave for your scheduled shift
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Shift Information */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <h3 className="font-semibold text-foreground mb-3">Shift Details</h3>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{format(new Date(shift.date), 'EEEE, MMMM dd, yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{shift.shiftName} ({shift.startTime.slice(0, 5)} - {shift.endTime.slice(0, 5)})</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span>{shift.branchName}</span>
                            </div>
                            {shift.note && (
                                <div className="text-sm text-muted-foreground italic">
                                    Note: {shift.note}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Warning Message */}
                    <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
                            <div>
                                <h4 className="font-medium text-destructive mb-1">Important Notice</h4>
                                <p className="text-sm text-destructive/80">
                                    This will mark your shift as conflicted and notify all managers at your branch.
                                    Emergency leave should only be requested for urgent situations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason Input */}
                    <div className="space-y-2">
                        <Label htmlFor="reason">
                            Reason for Emergency Leave
                            <span className="text-muted-foreground font-normal">(Optional)</span>
                        </Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a brief explanation for your emergency leave request..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            maxLength={255}
                            className="resize-none"
                        />
                        <div className="text-xs text-muted-foreground text-right">
                            {reason.length}/255 characters
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={requestEmergencyLeaveMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleSubmit}
                        disabled={requestEmergencyLeaveMutation.isPending}
                        className="gap-2"
                    >
                        {requestEmergencyLeaveMutation.isPending ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-4 w-4" />
                                Submit Emergency Leave
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 