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
    Trash,
    Edit,
} from 'lucide-react';
import { useCustomToast } from '@/lib/show-toast';
import dayjs from 'dayjs';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/Table/DataTable';
import { FilterDefinition } from '@/components/Table/types';
import { SearchCondition } from '@/lib/response-object';

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
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(20);
    const [sorting, setSorting] = useState();
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');
    const [total, setTotal] = useState(0);

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

    const filterDefinitions = [
        {
            field: 'name',
            label: 'Name',
            type: 'STRING',
        },
    ];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'staff.fullName',
            header: 'Employee',
            cell: ({ row }) => {
                const staff = row.original.staff;
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor:
                                    staff.userRoles[0].role.hexColor,
                            }}
                        />
                        <span>{staff.fullName}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'type',
            header: 'Request Type',
        },
        {
            accessorKey: 'shift.date',
            header: 'Shift Date',
            cell: ({ row }) => {
                const rawDate: string = row.getValue('shift.date');
                const parsedDate = dayjs(rawDate);
                return <span>{parsedDate.format('YYYY-MM-DD')}</span>;
            },
        },
        {
            accessorKey: 'shift.startTime',
            header: 'Shift Time',
            cell: ({ row }) => {
                const startTime: string = row.getValue('shift.startTime');
                const endTime: string = row.getValue('shift.endTime');
                return (
                    <span>
                        {dayjs(startTime, 'HH:mm:ss').format('HH:mm')} -{' '}
                        {dayjs(endTime, 'HH:mm:ss').format('HH:mm')}
                    </span>
                );
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
        },
        {
            accessorKey: 'requestStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status: string = row.getValue('requestStatus');
                return (
                    <Badge
                        variant="outline"
                        className={`${
                            status == 'PENDING'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                                : status == 'APPROVED'
                                  ? 'bg-green-50 text-green-700 border-green-300'
                                  : 'bg-red-50 text-red-700 border-red-300'
                        }`}
                    >
                        {status}
                    </Badge>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() =>
                                openResponseDialog(row.original, 'approve')
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
                                openResponseDialog(row.original, 'reject')
                            }
                        >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                        </Button>
                    </div>
                );
            },
        },
    ];

    const columns2: ColumnDef<any>[] = [
        {
            accessorKey: 'staff.fullName',
            header: 'Employee',
            cell: ({ row }) => {
                const staff = row.original.staff;
                return (
                    <div className="flex items-center gap-2">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{
                                backgroundColor:
                                    staff.userRoles[0].role.hexColor,
                            }}
                        />
                        <span>{staff.fullName}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: 'startTime',
            header: 'Start Time',
            cell: ({ row }) => {
                const startTime: string = row.getValue('startTime');
                return formatDateTime(startTime);
            },
        },
        {
            accessorKey: 'endTime',
            header: 'End Time',
            cell: ({ row }) => {
                const endTime: string = row.getValue('endTime');
                return formatDateTime(endTime);
            },
        },
        {
            accessorKey: 'reason',
            header: 'Reason',
        },
        {
            accessorKey: 'requestStatus',
            header: 'Status',
            cell: ({ row }) => {
                const status: string = row.getValue('requestStatus');
                return getStatusBadge(status);
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row.original.requestStatus === 'PENDING' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-green-600 border-green-200 hover:bg-green-50"
                                    onClick={() =>
                                        openResponseDialog(
                                            row.original,
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
                                            row.original,
                                            'reject'
                                        )
                                    }
                                >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];
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
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">
                        Time-off Requests
                    </h1>
                    <p className="text-muted-foreground">
                        Manage employee requests for shift changes and time off
                    </p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                        <TabsTrigger value="shift-requests">
                            Shift Change Requests
                        </TabsTrigger>
                        <TabsTrigger value="unavailability-requests">
                            Time-off Requests
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <Tabs value={activeTab}>
                <TabsContent value="shift-requests">
                    <DataTable
                        columns={columns}
                        data={mockShiftRequests}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        total={total}
                        tableId="roles-table"
                        // loading={isLoading}
                        // enableSorting = {false}
                        filterDefinitions={
                            filterDefinitions as FilterDefinition[]
                        }
                        onSearchChange={(search) => {
                            setKeyword(search);
                        }}
                        onPaginationChange={(
                            pageIndex: number,
                            pageSize: number
                        ) => {
                            setPageIndex(pageIndex);
                            setPageSize(pageSize);
                        }}
                        onSortingChange={(sorting) => {
                            setSorting(sorting);
                        }}
                        onFilterChange={(filters: any) => {
                            setColumnFilters(filters);
                        }}
                        currentSorting={sorting}
                    />
                </TabsContent>

                <TabsContent value="unavailability-requests">
                    <DataTable
                        columns={columns2}
                        data={mockUnavailabilityRequests}
                        pageIndex={pageIndex}
                        pageSize={pageSize}
                        total={total}
                        tableId="roles-table"
                        // loading={isLoading}
                        // enableSorting = {false}
                        filterDefinitions={
                            filterDefinitions as FilterDefinition[]
                        }
                        onSearchChange={(search) => {
                            setKeyword(search);
                        }}
                        onPaginationChange={(
                            pageIndex: number,
                            pageSize: number
                        ) => {
                            setPageIndex(pageIndex);
                            setPageSize(pageSize);
                        }}
                        onSortingChange={(sorting) => {
                            setSorting(sorting);
                        }}
                        onFilterChange={(filters: any) => {
                            setColumnFilters(filters);
                        }}
                        currentSorting={sorting}
                    />
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
