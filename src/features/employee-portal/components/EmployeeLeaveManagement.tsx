'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, Loader2, X, AlertTriangle, Clock, CheckCircle, XCircle, Plus, CalendarCheck, BarChart3, History } from 'lucide-react';
import {
    useMyLeaveRequests,
    useMyLeaveBalance,
    useSubmitLeaveRequest,
    useCancelLeaveRequest,
    LeaveType,
    LeaveStatus,
    LeaveDuration,
    SubmitLeaveRequestDto,
    getLeaveTypeLabel,
    getLeaveDurationLabel,
    getLeaveStatusLabel,
    getStatusColor
} from '@/api/v1/leave-management';
import { useCustomToast } from '@/lib/show-toast';
import { format } from 'date-fns';

interface EmployeeLeaveManagementProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EmployeeLeaveManagement({ open, onOpenChange }: EmployeeLeaveManagementProps) {
    const { success, error } = useCustomToast();
    const [activeTab, setActiveTab] = useState<'new' | 'history' | 'balance'>('new');
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

    // Form state
    const [formData, setFormData] = useState<SubmitLeaveRequestDto>({
        leaveType: LeaveType.ANNUAL,
        startDate: '',
        endDate: '',
        leaveDuration: LeaveDuration.FULL_DAY,
        reason: ''
    });

    // API hooks
    const { data: leaveRequests = [], isLoading: isLoadingRequests, refetch: refetchRequests } = useMyLeaveRequests(selectedYear);
    const { data: leaveBalance, isLoading: isLoadingBalance, refetch: refetchBalance } = useMyLeaveBalance(selectedYear);
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

        // Validate half-day only for single day
        if ((formData.leaveDuration === LeaveDuration.MORNING_HALF || formData.leaveDuration === LeaveDuration.AFTERNOON_HALF)
            && formData.startDate !== formData.endDate) {
            error('Error', 'Half-day leave can only be applied for a single day');
            return;
        }

        try {
            await submitMutation.mutateAsync(formData);
            success('Success', 'Leave request submitted successfully');
            setFormData({
                leaveType: LeaveType.ANNUAL,
                startDate: '',
                endDate: '',
                leaveDuration: LeaveDuration.FULL_DAY,
                reason: ''
            });
            refetchRequests();
            refetchBalance();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to submit leave request');
        }
    };

    const handleCancel = async (requestId: number) => {
        try {
            await cancelMutation.mutateAsync(requestId);
            success('Success', 'Leave request cancelled successfully');
            refetchRequests();
            refetchBalance();
        } catch (err: any) {
            error('Error', err.response?.data?.message || 'Failed to cancel leave request');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const pendingRequests = leaveRequests.filter(req => req.status === LeaveStatus.PENDING);
    const approvedRequests = leaveRequests.filter(req => req.status === LeaveStatus.APPROVED);
    const rejectedRequests = leaveRequests.filter(req => req.status === LeaveStatus.REJECTED);

    const getStatusIcon = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return <CheckCircle className="h-4 w-4 text-green-600" />;
            case LeaveStatus.PENDING: return <Clock className="h-4 w-4 text-yellow-600" />;
            case LeaveStatus.REJECTED: return <XCircle className="h-4 w-4 text-red-600" />;
            case LeaveStatus.CANCELLED: return <X className="h-4 w-4 text-gray-600" />;
            default: return null;
        }
    };

    const getTabIcon = (tab: string) => {
        switch (tab) {
            case 'new': return <Plus className="h-4 w-4" />;
            case 'history': return <History className="h-4 w-4" />;
            case 'balance': return <BarChart3 className="h-4 w-4" />;
            default: return null;
        }
    };

    const canSubmitForm = formData.startDate && formData.endDate && formData.reason.trim();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
                {/* Header */}
                <DialogHeader className="flex-shrink-0 border-b pb-6">
                    <DialogTitle className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                            <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Leave Management</h1>
                            <p className="text-base text-muted-foreground mt-1">
                                Submit new requests or manage existing leave applications
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {/* Year Selector & Tab Navigation */}
                <div className="flex-shrink-0 space-y-4">
                    {/* Year Selector */}
                    <div className="flex items-center gap-2">
                        <Label htmlFor="year" className="text-sm font-medium">Year:</Label>
                        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[2023, 2024, 2025].map(year => (
                                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex border-b">
                        {[
                            { key: 'new', label: 'New Request' },
                            { key: 'history', label: 'Request History' },
                            { key: 'balance', label: 'Leave Balance' }
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key as any)}
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                {getTabIcon(tab.key)}
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body with fixed height and scroll */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <div className="py-6">
                        {activeTab === 'new' && (
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
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(LeaveType).map(type => (
                                                    <SelectItem key={type} value={type}>{getLeaveTypeLabel(type)}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="leaveDuration">Leave Duration *</Label>
                                        <Select
                                            value={formData.leaveDuration}
                                            onValueChange={(value: LeaveDuration) => setFormData({ ...formData, leaveDuration: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(LeaveDuration).map(duration => (
                                                    <SelectItem key={duration} value={duration}>{getLeaveDurationLabel(duration)}</SelectItem>
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
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="reason">Reason for Leave *</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Please provide a reason for your leave request..."
                                        value={formData.reason}
                                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                        rows={3}
                                        required
                                    />
                                </div>

                                {/* Leave Balance Warning */}
                                {leaveBalance && (
                                    <Card className="border-l-4 border-l-blue-500 bg-blue-50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 text-blue-800">
                                                <AlertTriangle className="h-4 w-4" />
                                                <span className="font-medium">Current leave balance: {leaveBalance.remainingDays} days remaining</span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </form>
                        )}

                        {activeTab === 'history' && (
                            /* Request History */
                            <div className="space-y-6">
                                {/* Summary Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <Clock className="h-8 w-8 text-yellow-600" />
                                                <div>
                                                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
                                                    <p className="text-sm text-muted-foreground">Pending</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-8 w-8 text-green-600" />
                                                <div>
                                                    <p className="text-2xl font-bold">{approvedRequests.length}</p>
                                                    <p className="text-sm text-muted-foreground">Approved</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-3">
                                                <XCircle className="h-8 w-8 text-red-600" />
                                                <div>
                                                    <p className="text-2xl font-bold">{rejectedRequests.length}</p>
                                                    <p className="text-sm text-muted-foreground">Rejected</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

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
                                        <h3 className="text-lg font-medium text-foreground mb-2">No leave requests found</h3>
                                        <p className="text-muted-foreground">You haven't submitted any leave requests in {selectedYear}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {leaveRequests.map((request) => (
                                            <Card key={request.id} className="border">
                                                <CardContent className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                {getStatusIcon(request.status)}
                                                                <div>
                                                                    <h4 className="font-medium">{getLeaveTypeLabel(request.leaveType)}</h4>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {format(new Date(request.startDate), 'dd/MM/yyyy')} - {format(new Date(request.endDate), 'dd/MM/yyyy')}
                                                                        <span className="ml-2">({request.totalDays} days • {getLeaveDurationLabel(request.leaveDuration)})</span>
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {request.reason && (
                                                                <p className="text-sm text-muted-foreground mb-2">
                                                                    <strong>Reason:</strong> {request.reason}
                                                                </p>
                                                            )}

                                                            {request.status === LeaveStatus.APPROVED && request.approvedByName && request.approvedAt && (
                                                                <p className="text-sm text-green-700 bg-green-50 p-2 rounded">
                                                                    <strong>Approved by:</strong> {request.approvedByName} on {format(new Date(request.approvedAt), 'dd/MM/yyyy HH:mm')}
                                                                </p>
                                                            )}

                                                            {request.status === LeaveStatus.REJECTED && request.rejectionReason && (
                                                                <div className="flex items-start gap-2 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                                                                    <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                                                                    <div>
                                                                        <p className="text-sm font-medium text-destructive">Rejection reason:</p>
                                                                        <p className="text-sm text-destructive">{request.rejectionReason}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Badge variant={getStatusColor(request.status)}>
                                                                {getLeaveStatusLabel(request.status)}
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

                        {activeTab === 'balance' && (
                            /* Leave Balance */
                            <div className="space-y-6">
                                {isLoadingBalance ? (
                                    <div className="animate-pulse space-y-4">
                                        <div className="h-32 bg-muted rounded-lg"></div>
                                        <div className="h-24 bg-muted rounded-lg"></div>
                                    </div>
                                ) : leaveBalance ? (
                                    <>
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Leave Overview {selectedYear}</CardTitle>
                                                <CardDescription>Detailed information about your leave entitlements</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-6">
                                                {/* Progress Bar */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm">
                                                        <span>Used: {leaveBalance.usedDays} days</span>
                                                        <span>Remaining: {leaveBalance.remainingDays} days</span>
                                                    </div>
                                                    <Progress
                                                        value={(leaveBalance.usedDays / leaveBalance.totalAllocatedDays) * 100}
                                                        className="h-3"
                                                    />
                                                </div>

                                                <Separator />

                                                {/* Balance Details */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-2xl font-bold text-blue-600">{leaveBalance.annualLeaveDays}</p>
                                                        <p className="text-sm text-muted-foreground">Annual Leave</p>
                                                    </div>
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-2xl font-bold text-green-600">{leaveBalance.carriedOverDays}</p>
                                                        <p className="text-sm text-muted-foreground">Carried Over</p>
                                                    </div>
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-2xl font-bold text-purple-600">{leaveBalance.bonusDays}</p>
                                                        <p className="text-sm text-muted-foreground">Bonus Days</p>
                                                    </div>
                                                    <div className="text-center p-4 border rounded-lg">
                                                        <p className="text-2xl font-bold text-orange-600">{leaveBalance.totalAllocatedDays}</p>
                                                        <p className="text-sm text-muted-foreground">Total Allocated</p>
                                                    </div>
                                                </div>

                                                {/* Status Alert */}
                                                {leaveBalance.remainingDays <= 2 && (
                                                    <Card className="border-l-4 border-l-red-500 bg-red-50">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-2 text-red-800">
                                                                <AlertTriangle className="h-4 w-4" />
                                                                <span className="font-medium">
                                                                    Warning: Your leave balance is low ({leaveBalance.remainingDays} days remaining)
                                                                </span>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </>
                                ) : (
                                    <div className="text-center py-12">
                                        <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-foreground mb-2">No data available</h3>
                                        <p className="text-muted-foreground">No leave balance information found for {selectedYear}</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="flex-shrink-0 border-t pt-6 bg-muted/30">
                    {activeTab === 'new' ? (
                        <div className="flex gap-3 w-full">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="px-8 h-11 flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={submitMutation.isPending || !canSubmitForm}
                                className="px-8 h-11 flex-1"
                            >
                                {submitMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="h-4 w-4 mr-2" />
                                )}
                                Submit Request
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={handleClose} className="px-8 h-11 w-full">
                            Close
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 