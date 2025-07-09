'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShiftLeaveRequestDto } from '@/api/v1/shift-leave-management';

interface ApproveRejectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: ShiftLeaveRequestDto | null;
    approvalStatus: 'APPROVED' | 'REJECTED';
    onSubmit: (note: string) => void;
    isLoading?: boolean;
}

export function ApproveRejectModal({
    open,
    onOpenChange,
    request,
    approvalStatus,
    onSubmit,
    isLoading = false,
}: ApproveRejectModalProps) {
    const [managerNote, setManagerNote] = useState('');

    useEffect(() => {
        if (open) {
            setManagerNote('');
        }
    }, [open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(managerNote);
    };

    const isApprove = approvalStatus === 'APPROVED';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {isApprove ? 'Approve Request' : 'Reject Request'}
                    </DialogTitle>
                </DialogHeader>

                {request && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm">
                            <div className="font-medium">{request.employee.fullName}</div>
                            <div className="text-gray-600">{request.reason}</div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="managerNote">Manager Note</Label>
                        <Textarea
                            id="managerNote"
                            value={managerNote}
                            onChange={(e) => setManagerNote(e.target.value)}
                            placeholder="Add a note (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant={isApprove ? 'default' : 'destructive'}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : (isApprove ? 'Approve' : 'Reject')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 