'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import {
    Send,
    Calendar,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    Loader2,
    MessageSquare
} from 'lucide-react';
import { usePublishShifts, usePendingFeedbacks, useRejectedFeedbacks, PublishShiftsRequest } from '@/api/v1/publish-shifts';
import { useCustomToast } from '@/lib/show-toast';
import { useAuth } from '@/contexts/auth-context';
import { format, addDays } from 'date-fns';

interface PublishShiftsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PublishShiftsModal({ open, onOpenChange }: PublishShiftsModalProps) {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const branchId = user?.branch?.id;

    const [publishForm, setPublishForm] = useState<PublishShiftsRequest>({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
        branchId: branchId!,
    });

    const publishMutation = usePublishShifts();
    const { data: pendingFeedbacks = [], refetch: refetchPending } = usePendingFeedbacks(branchId!);
    const { data: rejectedFeedbacks = [], refetch: refetchRejected } = useRejectedFeedbacks(branchId!);

    const handleInputChange = (field: keyof PublishShiftsRequest, value: any) => {
        setPublishForm(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handlePublish = async () => {
        if (!publishForm.startDate || !publishForm.endDate) {
            error('Validation Error', 'Please select start and end dates');
            return;
        }

        if (new Date(publishForm.startDate) > new Date(publishForm.endDate)) {
            error('Validation Error', 'Start date must be before end date');
            return;
        }

        try {
            const result = await publishMutation.mutateAsync(publishForm);
            if (result.publishedShifts === 0) {
                success('No Shifts to Publish', result.message || 'No draft shifts found in the specified date range');
            } else {
                success('Shifts Published', `Successfully published ${result.publishedShifts} shifts to staff`);
            }
            refetchPending();
            refetchRejected();
            onOpenChange(false);
        } catch (err: any) {
            console.log(err);
            error('Publish Failed', err.response?.data?.message || 'Failed to publish shifts');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setPublishForm({
            startDate: format(new Date(), 'yyyy-MM-dd'),
            endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
            branchId: branchId!,
        });
    };

    if (!branchId) return null;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className="border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Send className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Publish Shifts</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Send shift assignments to staff for feedback and confirmation
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-8 py-6">
                    {/* Publish Form */}
                    <Card className="border-2 border-primary/20 bg-primary/5">
                        <CardHeader className="pb-4">
                            <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                                    <Calendar className="h-4 w-4" />
                                </div>
                                Publish Schedule
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                                Select the date range to publish shifts to staff
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label htmlFor="startDate" className="text-sm font-medium text-foreground">Start Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={publishForm.startDate}
                                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                                        className="h-11 bg-white"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label htmlFor="endDate" className="text-sm font-medium text-foreground">End Date <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={publishForm.endDate}
                                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                                        className="h-11 bg-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-muted/50 p-4 rounded-lg">
                                <div className="text-sm text-foreground">
                                    <strong>What happens when you publish:</strong>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-muted-foreground">
                                        <li>All DRAFT shifts in the selected period will be sent to staff</li>
                                        <li>Staff will receive notifications to review their assignments</li>
                                        <li>Staff can accept or reject shifts with reasons</li>
                                        <li>You'll be notified of any rejections that need attention</li>
                                    </ul>
                                </div>
                            </div>

                            <Button
                                onClick={handlePublish}
                                disabled={publishMutation.isPending}
                                className="w-full h-12 font-medium"
                            >
                                {publishMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Publishing Shifts...
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-2 h-5 w-5" />
                                        Publish Shifts to Staff
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Pending Responses */}
                    {pendingFeedbacks.length > 0 && (
                        <Card className="border-2 border-secondary/50 bg-secondary/10">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-secondary-foreground">
                                        <Clock className="h-4 w-4" />
                                    </div>
                                    Pending Staff Responses
                                    <Badge variant="secondary" className="ml-auto">
                                        {pendingFeedbacks.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Staff members who haven't responded to their shift assignments yet
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 rounded-lg">
                                <div className="grid gap-3 max-h-40 overflow-y-auto">
                                    {pendingFeedbacks.slice(0, 5).map((feedback) => (
                                        <div key={feedback.id} className="flex items-center justify-between p-3 bg-card border rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-foreground">{feedback.staffName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {feedback.staffShift.scheduledShift.shiftName} • {format(new Date(feedback.staffShift.scheduledShift.date), 'MMM dd, yyyy')}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="outline">Pending</Badge>
                                                <div className="text-xs text-muted-foreground mt-1">
                                                    Deadline: {format(new Date(feedback.deadline), 'MMM dd HH:mm')}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {pendingFeedbacks.length > 5 && (
                                    <div className="text-center text-sm text-muted-foreground">
                                        And {pendingFeedbacks.length - 5} more pending responses...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Rejected Shifts */}
                    {rejectedFeedbacks.length > 0 && (
                        <Card className="border-2 border-destructive/50 bg-destructive/10">
                            <CardHeader className="pb-4">
                                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-foreground">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-destructive text-destructive-foreground">
                                        <AlertTriangle className="h-4 w-4" />
                                    </div>
                                    Rejected Shifts Need Attention
                                    <Badge variant="destructive" className="ml-auto">
                                        {rejectedFeedbacks.length}
                                    </Badge>
                                </CardTitle>
                                <CardDescription className="text-muted-foreground">
                                    Staff members who rejected their shift assignments - replacement needed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4 rounded-lg">
                                <div className="grid gap-3 max-h-40 overflow-y-auto">
                                    {rejectedFeedbacks.slice(0, 5).map((feedback) => (
                                        <div key={feedback.id} className="flex items-start justify-between p-3 bg-card border border-destructive/20 rounded-lg">
                                            <div className="flex-1">
                                                <div className="font-medium text-foreground">{feedback.staffName}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {feedback.staffShift.scheduledShift.shiftName} • {format(new Date(feedback.staffShift.scheduledShift.date), 'MMM dd, yyyy')}
                                                </div>
                                                {feedback.reason && (
                                                    <div className="text-sm text-destructive mt-1 flex items-start gap-2">
                                                        <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                        <span>{feedback.reason}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <Badge variant="destructive">Rejected</Badge>
                                        </div>
                                    ))}
                                </div>
                                {rejectedFeedbacks.length > 5 && (
                                    <div className="text-center text-sm text-muted-foreground">
                                        And {rejectedFeedbacks.length - 5} more rejected shifts...
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {pendingFeedbacks.length === 0 && rejectedFeedbacks.length === 0 && (
                        <Card className="border-2 border-dashed border-muted">
                            <CardContent className="pt-12 pb-12">
                                <div className="text-center text-muted-foreground">
                                    <div className="flex items-center justify-center w-16 h-16 bg-muted rounded-full mx-auto mb-4">
                                        <CheckCircle className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-lg font-medium text-foreground mb-2">All Clear!</h3>
                                    <p className="text-sm text-muted-foreground">
                                        No pending responses or rejected shifts at the moment
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button variant="outline" onClick={handleClose} className="px-8 h-11">
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 