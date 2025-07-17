'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, FileText, Loader2, X, AlertTriangle } from 'lucide-react';
import {
    useMyLeaveRequests,
    useSubmitLeaveRequest,
    useCancelLeaveRequest,
    LeaveType,
    LeaveStatus,
    SubmitLeaveRequestDto
} from '@/api/v1/employee-portal';
import { useCustomToast } from '@/lib/show-toast';
import { format } from 'date-fns';

interface LeaveRequestModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LeaveRequestModal({ open, onOpenChange }: LeaveRequestModalProps) {
    const { success, error } = useCustomToast();
    const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');

    // Form state
    const [formData, setFormData] = useState<SubmitLeaveRequestDto>({
        leaveType: LeaveType.ANNUAL,
        startDate: '',
        endDate: '',
        reason: ''
    });

    // API hooks
    const { data: leaveRequests = [], isLoading: isLoadingRequests, refetch } = useMyLeaveRequests();
    const submitMutation = useSubmitLeaveRequest();
    const cancelMutation = useCancelLeaveRequest();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate) {
            error('Error', 'Please select start and end dates');
            return;
        }

        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            error('Error', 'End date must be after start date');
            return;
        }

        try {
            await submitMutation.mutateAsync(formData);
            success('Success', 'Leave request submitted successfully');
            setFormData({
                leaveType: LeaveType.ANNUAL,
                startDate: '',
                endDate: '',
                reason: ''
            });
            refetch();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to submit leave request');
        }
    };

    const handleCancel = async (requestId: number) => {
        try {
            await cancelMutation.mutateAsync(requestId);
            success('Success', 'Leave request cancelled successfully');
            refetch();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to cancel leave request');
        }
    };

    const getLeaveTypeLabel = (type: LeaveType) => {
        switch (type) {
            case LeaveType.ANNUAL: return 'Annual Leave';
            case LeaveType.SICK: return 'Sick Leave';
            case LeaveType.EMERGENCY: return 'Emergency Leave';
            case LeaveType.MATERNITY: return 'Maternity Leave';
            case LeaveType.PERSONAL: return 'Personal Leave';
            case LeaveType.UNPAID: return 'Unpaid Leave';
            default: return type;
        }
    };

    const getStatusColor = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return 'default';
            case LeaveStatus.PENDING: return 'secondary';
            case LeaveStatus.REJECTED: return 'destructive';
            case LeaveStatus.CANCELLED: return 'outline';
            default: return 'outline';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-primary-foreground">
                            <FileText className="h-5 w-5" />
                        </div>
                        Leave Request Management
                    </DialogTitle>
                    <DialogDescription>
                        Submit new leave requests or manage your existing ones
                    </DialogDescription>
                </DialogHeader>

                {/* Tab Navigation */}
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('new')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'new'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        New Request
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history'
                                ? 'border-primary text-primary'
                                : 'border-transparent text-muted-foreground hover:text-foreground'
                            }`}
                    >
                        Request History
                    </button>
                </div>

                <div className="py-6">
                    {activeTab === 'new' ? (
                        /* New Request Form */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="leaveType">Leave Type *</Label>
                                    <Select
                                        value={formData.leaveType}
                                        onValueChange={(value: LeaveType) => setFormData({ ...formData, leaveType: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select leave type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(LeaveType).map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {getLeaveTypeLabel(type)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Start Date *</Label>
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                        min={format(new Date(), 'yyyy-MM-dd')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="endDate">End Date *</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                        min={formData.startDate || format(new Date(), 'yyyy-MM-dd')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason (Optional)</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Brief reason for leave request..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitMutation.isPending}>
                                    {submitMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="mr-2 h-4 w-4" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        /* Request History */
                        <div className="space-y-4">
                            {isLoadingRequests ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="animate-pulse">
                                            <div className="h-24 bg-muted rounded-lg"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : leaveRequests.length === 0 ? (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-foreground mb-2">No Leave Requests</h3>
                                    <p className="text-muted-foreground">You haven't submitted any leave requests yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {leaveRequests.map((request) => (
                                        <Card key={request.id} className="border">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                                                <Calendar className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <h4 className="font-medium">{getLeaveTypeLabel(request.leaveType)}</h4>
                                                                <p className="text-sm text-muted-foreground">
                                                                    {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                                                                    <span className="ml-2">({request.totalDays} day{request.totalDays !== 1 ? 's' : ''})</span>
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {request.reason && (
                                                            <p className="text-sm text-muted-foreground mb-2">
                                                                <strong>Reason:</strong> {request.reason}
                                                            </p>
                                                        )}

                                                        {request.status === LeaveStatus.APPROVED && request.approvedByName && (
                                                            <p className="text-sm text-muted-foreground">
                                                                <strong>Approved by:</strong> {request.approvedByName} on {format(new Date(request.approvedAt!), 'MMM dd, yyyy')}
                                                            </p>
                                                        )}

                                                        {request.status === LeaveStatus.REJECTED && request.rejectionReason && (
                                                            <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                                                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                                                <div>
                                                                    <p className="text-sm font-medium text-destructive">Rejection Reason:</p>
                                                                    <p className="text-sm text-destructive">{request.rejectionReason}</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={getStatusColor(request.status)}>
                                                            {request.status}
                                                        </Badge>
                                                        {request.status === LeaveStatus.PENDING && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleCancel(request.id)}
                                                                disabled={cancelMutation.isPending}
                                                            >
                                                                {cancelMutation.isPending ? (
                                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                                ) : (
                                                                    <X className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
} 