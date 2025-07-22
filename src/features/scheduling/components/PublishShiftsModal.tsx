'use client';

import { format, addDays } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';
import { useState } from 'react';

import {
    usePublishShifts,
    PublishShiftsRequest,
} from '@/api/v1/publish-shifts';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';

interface PublishShiftsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function PublishShiftsModal({
    open,
    onOpenChange,
}: PublishShiftsModalProps) {
    const { success, error } = useCustomToast();
    const { user } = useAuth();
    const branchId = user?.branch?.id || 0;

    const [publishForm, setPublishForm] = useState<PublishShiftsRequest>({
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: format(addDays(new Date(), 6), 'yyyy-MM-dd'),
        branchId,
    });

    const publishMutation = usePublishShifts();

    const handleInputChange = (
        field: keyof PublishShiftsRequest,
        value: any
    ) => {
        setPublishForm((prev) => ({
            ...prev,
            [field]: value,
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
                success(
                    'No Shifts to Publish',
                    result.message ||
                        'No draft shifts found in the specified date range'
                );
            } else {
                success(
                    'Shifts Published',
                    `Successfully published ${result.publishedShifts} shifts to staff`
                );
            }
            onOpenChange(false);
        } catch (err: any) {
            console.error(err);
            error(
                'Publish Failed',
                err.response?.data?.message || 'Failed to publish shifts'
            );
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <Send className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-foreground">
                                Publish Shifts
                            </DialogTitle>
                            <p className="text-base text-muted-foreground mt-1">
                                Send shift assignments to staff for feedback
                            </p>
                        </div>
                    </div>
                    <hr />
                </DialogHeader>

                <div className="space-y-6">
                    {/* Date Range Selection */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="startDate"
                                    className="text-sm font-medium"
                                >
                                    Start Date{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={publishForm.startDate}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'startDate',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="endDate"
                                    className="text-sm font-medium"
                                >
                                    End Date{' '}
                                    <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    value={publishForm.endDate}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'endDate',
                                            e.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    {/* Information */}
                    <div className="p-4 bg-muted/30 rounded-lg border">
                        <div className="text-sm">
                            <h4 className="font-medium text-foreground mb-2">
                                What happens when you publish:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>
                                    All DRAFT shifts in the selected period will
                                    be sent to staff
                                </li>
                                <li>
                                    You'll be notified of any rejections that
                                    need attention
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <DialogFooter className="border-t pt-6 bg-muted/30">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        disabled={publishMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePublish}
                        disabled={publishMutation.isPending}
                        className="gap-2"
                    >
                        {publishMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Publishing...
                            </>
                        ) : (
                            <>
                                <Send className="h-4 w-4" />
                                Publish Shifts
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
