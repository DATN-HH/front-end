'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
    CheckCircle,
    XCircle,
    Calendar,
    Clock,
    User,
    FileText,
} from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';

// Mock shift requests
const mockShiftRequests = [
    {
        id: 1,
        targetShiftId: 101,
        type: 'EXCHANGE',
        requestStatus: 'PENDING',
        reason: 'Family event',
        createdAt: '2025-05-20T10:30:00Z',
        staff: {
            id: 201,
            fullName: 'John Doe',
            displayName: 'John D.',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        },
        targetShift: {
            id: 101,
            date: '2025-05-23',
            shift: {
                startTime: '08:00:00',
                endTime: '12:00:00',
            },
        },
    },
    {
        id: 2,
        targetShiftId: 102,
        type: 'LEAVE',
        requestStatus: 'PENDING',
        reason: 'Doctor appointment',
        createdAt: '2025-05-21T14:15:00Z',
        staff: {
            id: 202,
            fullName: 'Sarah Adams',
            displayName: 'Sarah A.',
            userRoles: [{ role: { name: 'CASHIER', hexColor: '#2196F3' } }],
        },
        targetShift: {
            id: 102,
            date: '2025-05-24',
            shift: {
                startTime: '12:00:00',
                endTime: '16:00:00',
            },
        },
    },
    {
        id: 3,
        targetShiftId: 103,
        type: 'EXCHANGE',
        requestStatus: 'APPROVED',
        reason: 'Personal matter',
        createdAt: '2025-05-19T09:45:00Z',
        staff: {
            id: 203,
            fullName: 'Mike Johnson',
            displayName: 'Mike J.',
            userRoles: [{ role: { name: 'KITCHEN', hexColor: '#FF5722' } }],
        },
        targetShift: {
            id: 103,
            date: '2025-05-22',
            shift: {
                startTime: '16:00:00',
                endTime: '20:00:00',
            },
        },
    },
    {
        id: 4,
        targetShiftId: 104,
        type: 'LEAVE',
        requestStatus: 'REJECTED',
        reason: 'Family vacation',
        createdAt: '2025-05-18T16:20:00Z',
        staff: {
            id: 204,
            fullName: 'Emily Clark',
            displayName: 'Emily C.',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        },
        targetShift: {
            id: 104,
            date: '2025-05-25',
            shift: {
                startTime: '09:00:00',
                endTime: '17:00:00',
            },
        },
    },
];

// Mock unavailability requests
const mockUnavailabilityRequests = [
    {
        id: 1,
        startTime: '2025-05-26T09:00:00Z',
        endTime: '2025-05-26T17:00:00Z',
        reason: 'Family event',
        requestStatus: 'PENDING',
        createdAt: '2025-05-22T08:30:00Z',
        staff: {
            id: 201,
            fullName: 'John Doe',
            displayName: 'John D.',
            userRoles: [{ role: { name: 'WAITER', hexColor: '#4CAF50' } }],
        },
    },
    {
        id: 2,
        startTime: '2025-05-27T12:00:00Z',
        endTime: '2025-05-29T20:00:00Z',
        reason: 'Vacation',
        requestStatus: 'PENDING',
        createdAt: '2025-05-21T14:45:00Z',
        staff: {
            id: 202,
            fullName: 'Sarah Adams',
            displayName: 'Sarah A.',
            userRoles: [{ role: { name: 'CASHIER', hexColor: '#2196F3' } }],
        },
    },
    {
        id: 3,
        startTime: '2025-05-30T08:00:00Z',
        endTime: '2025-05-30T12:00:00Z',
        reason: 'Doctor appointment',
        requestStatus: 'APPROVED',
        createdAt: '2025-05-20T10:15:00Z',
        staff: {
            id: 203,
            fullName: 'Mike Johnson',
            displayName: 'Mike J.',
            userRoles: [{ role: { name: 'KITCHEN', hexColor: '#FF5722' } }],
        },
    },
];

export default function RequestsPage() {
    const [activeTab, setActiveTab] = useState('shift-requests');
    const [shiftRequests, setShiftRequests] = useState(mockShiftRequests);
    const [unavailabilityRequests, setUnavailabilityRequests] = useState(
        mockUnavailabilityRequests
    );
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [responseNote, setResponseNote] = useState('');
    const [responseAction, setResponseAction] = useState<
        'approve' | 'reject' | null
    >(null);

    const { error: toastError, success } = useCustomToast();

    // Format date for display
    const formatDate = (dateString: string) => {
        return format(parseISO(dateString), 'MMM d, yyyy');
    };

    // Format time for display
    const formatTime = (timeString: string) => {
        return timeString.substring(0, 5);
    };

    // Format datetime for display
    const formatDateTime = (dateTimeString: string) => {
        return format(parseISO(dateTimeString), 'MMM d, yyyy h:mm a');
    };

    // Open response dialog
    const openResponseDialog = (request: any, action: 'approve' | 'reject') => {
        setSelectedRequest(request);
        setResponseAction(action);
        setResponseNote('');
        setIsDialogOpen(true);
    };

    // Handle request response (approve/reject)
    const handleRequestResponse = () => {
        if (!selectedRequest || !responseAction) return;

        const isShiftRequest = 'targetShiftId' in selectedRequest;
        const newStatus =
            responseAction === 'approve' ? 'APPROVED' : 'REJECTED';

        if (isShiftRequest) {
            // Update shift request
            setShiftRequests((prev) =>
                prev.map((req) =>
                    req.id === selectedRequest.id
                        ? { ...req, requestStatus: newStatus }
                        : req
                )
            );
        } else {
            // Update unavailability request
            setUnavailabilityRequests((prev) =>
                prev.map((req) =>
                    req.id === selectedRequest.id
                        ? { ...req, requestStatus: newStatus }
                        : req
                )
            );
        }

        success(
            `Request ${responseAction === 'approve' ? 'approved' : 'rejected'}`,
            `Request ${responseAction === 'approve' ? 'approved' : 'rejected'}`
        );

        setIsDialogOpen(false);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return (
                    <Badge
                        variant="outline"
                        className="bg-yellow-50 text-yellow-700 border-yellow-300"
                    >
                        Pending
                    </Badge>
                );
            case 'APPROVED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-300"
                    >
                        Approved
                    </Badge>
                );
            case 'REJECTED':
                return (
                    <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-300"
                    >
                        Rejected
                    </Badge>
                );
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-6">Time-off Requests</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="shift-requests">
                        Shift Change Requests
                    </TabsTrigger>
                    <TabsTrigger value="unavailability-requests">
                        Time-off Requests
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="shift-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shift Change Requests</CardTitle>
                            <CardDescription>
                                Manage employee requests to exchange or drop
                                shifts
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Request Type</TableHead>
                                        <TableHead>Shift Date</TableHead>
                                        <TableHead>Shift Time</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {shiftRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                request.staff
                                                                    .userRoles[0]
                                                                    .role
                                                                    .hexColor,
                                                        }}
                                                    />
                                                    {request.staff.fullName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {request.type === 'EXCHANGE'
                                                    ? 'Shift Exchange'
                                                    : 'Leave Request'}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(
                                                    request.targetShift.date
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatTime(
                                                    request.targetShift.shift
                                                        .startTime
                                                )}{' '}
                                                -{' '}
                                                {formatTime(
                                                    request.targetShift.shift
                                                        .endTime
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {request.reason}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    request.requestStatus
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {request.requestStatus ===
                                                    'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() =>
                                                                openResponseDialog(
                                                                    request,
                                                                    'approve'
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() =>
                                                                openResponseDialog(
                                                                    request,
                                                                    'reject'
                                                                )
                                                            }
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="unavailability-requests">
                    <Card>
                        <CardHeader>
                            <CardTitle>Time-off Requests</CardTitle>
                            <CardDescription>
                                Manage employee requests for time off
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unavailabilityRequests.map((request) => (
                                        <TableRow key={request.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{
                                                            backgroundColor:
                                                                request.staff
                                                                    .userRoles[0]
                                                                    .role
                                                                    .hexColor,
                                                        }}
                                                    />
                                                    {request.staff.fullName}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    request.startTime
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {formatDateTime(
                                                    request.endTime
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {request.reason}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(
                                                    request.requestStatus
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {request.requestStatus ===
                                                    'PENDING' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() =>
                                                                openResponseDialog(
                                                                    request,
                                                                    'approve'
                                                                )
                                                            }
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() =>
                                                                openResponseDialog(
                                                                    request,
                                                                    'reject'
                                                                )
                                                            }
                                                        >
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Response Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {responseAction === 'approve'
                                ? 'Approve Request'
                                : 'Reject Request'}
                        </DialogTitle>
                        <DialogDescription>
                            {responseAction === 'approve'
                                ? 'Are you sure you want to approve this request?'
                                : 'Are you sure you want to reject this request?'}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedRequest && (
                        <div className="py-4">
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">
                                            {selectedRequest.staff.fullName}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {
                                                selectedRequest.staff
                                                    .userRoles[0].role.name
                                            }
                                        </p>
                                    </div>
                                </div>

                                {'targetShiftId' in selectedRequest ? (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">
                                                    Shift Date
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        selectedRequest
                                                            .targetShift.date
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-3">
                                            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">
                                                    Shift Time
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatTime(
                                                        selectedRequest
                                                            .targetShift.shift
                                                            .startTime
                                                    )}{' '}
                                                    -{' '}
                                                    {formatTime(
                                                        selectedRequest
                                                            .targetShift.shift
                                                            .endTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start gap-3">
                                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                            <div>
                                                <p className="font-medium">
                                                    Time Off Period
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDateTime(
                                                        selectedRequest.startTime
                                                    )}{' '}
                                                    -{' '}
                                                    {formatDateTime(
                                                        selectedRequest.endTime
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-start gap-3">
                                    <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="font-medium">Reason</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedRequest.reason}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="text-sm font-medium">
                                    Response Note (Optional)
                                </label>
                                <Textarea
                                    placeholder="Add a note to your response..."
                                    value={responseNote}
                                    onChange={(e) =>
                                        setResponseNote(e.target.value)
                                    }
                                    className="mt-1"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleRequestResponse}
                            variant={
                                responseAction === 'approve'
                                    ? 'default'
                                    : 'destructive'
                            }
                        >
                            {responseAction === 'approve'
                                ? 'Approve'
                                : 'Reject'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
