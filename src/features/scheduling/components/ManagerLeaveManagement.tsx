import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, User, Calendar, FileText, Settings2 } from 'lucide-react';
import {
    usePendingLeaveRequests,
    useAllLeaveRequests,
    useApproveLeaveRequest,
    useRejectLeaveRequest,
    getLeaveTypeLabel,
    type LeaveRequest,
} from '@/api/v1/leave-management';
import { format } from 'date-fns';
import { useCustomToast } from '@/lib/show-toast';

interface ManagerLeaveManagementProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    branchId: number;
}

interface RejectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (reason: string) => void;
    requestId: number;
    employeeName: string;
}

function RejectModal({ open, onOpenChange, onConfirm, requestId, employeeName }: RejectModalProps) {
    const [reason, setReason] = useState('');
    const { error } = useCustomToast();

    const handleConfirm = () => {
        if (!reason.trim()) {
            error('Error', 'Rejection reason is required');
            return;
        }
        onConfirm(reason);
        setReason('');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reject Leave Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        You are about to reject the leave request from <strong>{employeeName}</strong>.
                        Please provide a reason for rejection.
                    </p>
                    <div className="space-y-2">
                        <Label htmlFor="reason">Rejection Reason</Label>
                        <Textarea
                            id="reason"
                            placeholder="Please provide a reason for rejecting this request..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirm}>
                            Reject Request
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function ManagerLeaveManagement({
    open,
    onOpenChange,
    branchId,
}: ManagerLeaveManagementProps) {
    const currentYear = new Date().getFullYear();
    const { success, error } = useCustomToast();
    const [rejectModal, setRejectModal] = useState<{
        open: boolean;
        requestId: number;
        employeeName: string;
    }>({
        open: false,
        requestId: 0,
        employeeName: '',
    });

    // API hooks
    const { data: pendingRequests = [], isLoading: isLoadingPending } = usePendingLeaveRequests(branchId);
    const { data: allRequests = [], isLoading: isLoadingAll } = useAllLeaveRequests(branchId, currentYear);

    const approveMutation = useApproveLeaveRequest();
    const rejectMutation = useRejectLeaveRequest();

    const isLoading = isLoadingPending || isLoadingAll;

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
            case 'approved':
                return 'bg-green-100 text-green-800 hover:bg-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 hover:bg-red-200';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch {
            return 'Invalid date';
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            await approveMutation.mutateAsync(requestId);
            success('Success', 'Leave request approved successfully');
        } catch (err) {
            error('Error', 'Failed to approve leave request');
        }
    };

    const handleReject = (requestId: number, employeeName: string) => {
        setRejectModal({
            open: true,
            requestId,
            employeeName,
        });
    };

    const handleRejectConfirm = async (reason: string) => {
        try {
            await rejectMutation.mutateAsync({
                requestId: rejectModal.requestId,
                reason,
            });
            success('Success', 'Leave request rejected');
        } catch (err) {
            error('Error', 'Failed to reject leave request');
        }
    };

    const handleClose = () => {
        onOpenChange(false);
    };

    const PendingRequestCard = ({ request }: { request: LeaveRequest }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {request.employeeName || 'Unknown Employee'}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {getLeaveTypeLabel(request.leaveType)}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </span>
                        </CardDescription>
                    </div>
                    <Badge className={getStatusColor(request.status)}>
                        <Clock className="h-3 w-3 mr-1" />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                {request.reason && (
                    <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Reason:</p>
                        <p className="text-sm">{request.reason}</p>
                    </div>
                )}
                <div className="flex gap-2">
                    <Button
                        onClick={() => handleApprove(request.id)}
                        disabled={approveMutation.isPending}
                        className="flex-1"
                        size="sm"
                    >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => handleReject(request.id, request.employeeName || 'Unknown Employee')}
                        disabled={rejectMutation.isPending}
                        className="flex-1"
                        size="sm"
                    >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                    </Button>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <>
            <Dialog open={open} onOpenChange={handleClose}>
                <DialogContent className="max-w-6xl h-[85vh] flex flex-col overflow-hidden">
                    <DialogHeader className="flex-shrink-0 border-b pb-6">
                        <DialogTitle className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary">
                                <Settings2 className="h-6 w-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-foreground">Leave Management Panel</h1>
                                <p className="text-base text-muted-foreground mt-1">
                                    Manage and review employee leave requests for your branch
                                </p>
                            </div>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    <span className="text-muted-foreground">Loading leave requests...</span>
                                </div>
                            </div>
                        ) : (
                            <Tabs defaultValue="pending" className="h-full flex flex-col">
                                <div className="flex-shrink-0 pt-6 pb-4">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="pending">
                                            Pending Requests ({pendingRequests.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="all">
                                            All Requests ({allRequests.length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <TabsContent value="pending" className="h-full overflow-hidden m-0">
                                        <div className="h-full overflow-y-auto pr-2">
                                            {pendingRequests.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                                    <p className="text-lg font-medium">No pending requests</p>
                                                    <p className="text-muted-foreground">All leave requests have been processed</p>
                                                </div>
                                            ) : (
                                                <div className="grid gap-4 pb-4">
                                                    {pendingRequests.map((request) => (
                                                        <PendingRequestCard key={request.id} request={request} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="all" className="h-full overflow-hidden m-0">
                                        <div className="h-full overflow-y-auto">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Employee</TableHead>
                                                        <TableHead>Leave Type</TableHead>
                                                        <TableHead>Duration</TableHead>
                                                        <TableHead>Submitted</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {allRequests.map((request) => (
                                                        <TableRow key={request.id}>
                                                            <TableCell className="font-medium">
                                                                {request.employeeName || 'Unknown Employee'}
                                                            </TableCell>
                                                            <TableCell>{getLeaveTypeLabel(request.leaveType)}</TableCell>
                                                            <TableCell>
                                                                {formatDate(request.startDate)} - {formatDate(request.endDate)}
                                                            </TableCell>
                                                            <TableCell>{formatDate(request.createdAt)}</TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusColor(request.status)}>
                                                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        )}
                    </div>

                    <DialogFooter className="flex-shrink-0 border-t pt-6 bg-muted/30">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="px-8 h-11"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <RejectModal
                open={rejectModal.open}
                onOpenChange={(open) => setRejectModal(prev => ({ ...prev, open }))}
                onConfirm={handleRejectConfirm}
                requestId={rejectModal.requestId}
                employeeName={rejectModal.employeeName}
            />
        </>
    );
} 