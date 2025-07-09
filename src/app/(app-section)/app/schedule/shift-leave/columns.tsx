'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { Eye, Check, X, Clock } from 'lucide-react';
import { ShiftLeaveRequestDto } from '@/api/v1/shift-leave-management';

// Format time helper
const formatTime = (time: any) => {
    if (typeof time === 'string') return time;
    if (time && typeof time === 'object' && time.hour !== undefined && time.minute !== undefined) {
        return `${time.hour.toString().padStart(2, '0')}:${time.minute.toString().padStart(2, '0')}`;
    }
    return time?.toString() || '';
};

// Get status color
const getStatusColor = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-100 text-yellow-800';
        case 'APPROVED':
            return 'bg-green-100 text-green-800';
        case 'REJECTED':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

interface ColumnActions {
    onViewDetails: (request: ShiftLeaveRequestDto) => void;
    onApprove?: (request: ShiftLeaveRequestDto) => void;
    onReject?: (request: ShiftLeaveRequestDto) => void;
}

export const createShiftLeaveColumns = (actions: ColumnActions): ColumnDef<ShiftLeaveRequestDto>[] => [
    {
        id: 'employee',
        accessorKey: 'employee.fullName',
        header: 'Employee',
        cell: ({ row }) => (
            <div className="min-w-[120px]">
                <div className="font-medium text-sm">{row.original.employee.fullName}</div>
                <div className="text-xs text-gray-500 truncate">{row.original.employee.email}</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'period',
        header: 'Period',
        cell: ({ row }) => (
            <div className="min-w-[100px]">
                <div className="font-medium text-sm">
                    {format(new Date(row.original.startDate), 'MMM d')}
                </div>
                <div className="text-xs text-gray-500">
                    to {format(new Date(row.original.endDate), 'MMM d')}
                </div>
            </div>
        ),
        enableSorting: false,
    },
    {
        id: 'shifts',
        header: 'Shifts',
        cell: ({ row }) => {
            const shifts = row.original.requestedShifts;
            const fullShiftsText = shifts.map(shift =>
                `${shift.name} (${formatTime(shift.startTime)}-${formatTime(shift.endTime)})`
            ).join(', ');

            return (
                <div className="max-w-[120px]">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex flex-wrap gap-1">
                                    {shifts.slice(0, 1).map((shift) => (
                                        <Badge key={shift.id} variant="secondary" className="text-xs">
                                            {shift.name}
                                        </Badge>
                                    ))}
                                    {shifts.length > 1 && (
                                        <Badge variant="outline" className="text-xs">
                                            +{shifts.length - 1}
                                        </Badge>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-sm">{fullShiftsText}</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            );
        },
        enableSorting: false,
    },
    {
        id: 'reason',
        accessorKey: 'reason',
        header: 'Reason',
        cell: ({ row }) => (
            <div className="max-w-[150px]">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className="text-sm truncate cursor-pointer">
                                {row.original.reason}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-sm max-w-xs">{row.original.reason}</div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        ),
        enableSorting: false,
    },
    {
        id: 'status',
        accessorKey: 'requestStatus',
        header: 'Status',
        cell: ({ row }) => (
            <Badge className={getStatusColor(row.original.requestStatus)}>
                {row.original.requestStatus === 'PENDING' ? 'Pending' :
                    row.original.requestStatus === 'APPROVED' ? 'Approved' : 'Rejected'}
            </Badge>
        ),
        enableSorting: true,
    },
    {
        id: 'affectedShifts',
        accessorKey: 'affectedShiftsCount',
        header: 'Affected',
        cell: ({ row }) => (
            <div className="text-center">
                {row.original.affectedShiftsCount > 0 ? (
                    <Badge variant="destructive" className="text-xs">
                        {row.original.affectedShiftsCount}
                    </Badge>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'createdAt',
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ row }) => (
            <div className="min-w-[80px]">
                <div className="text-sm">
                    {format(new Date(row.original.createdAt), 'MMM d')}
                </div>
                <div className="text-xs text-gray-500">
                    {format(new Date(row.original.createdAt), 'HH:mm')}
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'managerNote',
        accessorKey: 'managerNote',
        header: 'Note',
        cell: ({ row }) => (
            <div className="max-w-[120px]">
                {row.original.managerNote ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="text-sm text-blue-600 truncate cursor-pointer">
                                    {row.original.managerNote}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <div className="text-sm max-w-xs">{row.original.managerNote}</div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </div>
        ),
        enableSorting: false,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <div className="flex gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => actions.onViewDetails(row.original)}
                >
                    <Eye className="h-4 w-4" />
                </Button>
                {row.original.requestStatus === 'PENDING' && actions.onApprove && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:bg-green-50"
                        onClick={() => actions.onApprove!(row.original)}
                    >
                        <Check className="h-4 w-4" />
                    </Button>
                )}
                {row.original.requestStatus === 'PENDING' && actions.onReject && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => actions.onReject!(row.original)}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

// Columns for pending requests (with approve/reject actions)
export const pendingShiftLeaveColumns = (actions: ColumnActions) =>
    createShiftLeaveColumns(actions);

// Columns for all requests (view only)
export const allShiftLeaveColumns = (actions: Pick<ColumnActions, 'onViewDetails'>) =>
    createShiftLeaveColumns(actions); 