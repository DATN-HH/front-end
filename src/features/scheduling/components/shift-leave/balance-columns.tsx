'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Calculator, Plus, User } from 'lucide-react';

import { ShiftLeaveBalanceDto } from '@/api/v1/shift-leave-management';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface BalanceColumnActions {
    onUpdateBalance: (balance: ShiftLeaveBalanceDto) => void;
}

export const createBalanceColumns = (
    actions: BalanceColumnActions
): ColumnDef<ShiftLeaveBalanceDto>[] => [
    {
        id: 'employee',
        accessorKey: 'user.fullName',
        header: 'Employee',
        cell: ({ row }) => (
            <div className="min-w-[150px]">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                        <div className="font-medium text-sm">
                            {row.original.user.fullName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                            {row.original.user.email}
                        </div>
                    </div>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'totalShifts',
        accessorKey: 'totalShifts',
        header: 'Total',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                    {row.original.totalShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'usedShifts',
        accessorKey: 'usedShifts',
        header: 'Used',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                    {row.original.usedShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'bonusShifts',
        accessorKey: 'bonusShifts',
        header: 'Bonus',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                    {row.original.bonusShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'availableShifts',
        accessorKey: 'availableShifts',
        header: 'Available',
        cell: ({ row }) => (
            <div className="text-center">
                <div
                    className={`text-lg font-semibold ${row.original.availableShifts <= 5 ? 'text-red-600' : 'text-green-600'}`}
                >
                    {row.original.availableShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const available = row.original.availableShifts;
            if (available <= 2) {
                return <Badge variant="destructive">Critical</Badge>;
            } else if (available <= 5) {
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        Low
                    </Badge>
                );
            } else {
                return (
                    <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                    >
                        Good
                    </Badge>
                );
            }
        },
        enableSorting: false,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                onClick={() => actions.onUpdateBalance(row.original)}
                className="gap-2"
            >
                <Calculator className="h-4 w-4" />
                Update
            </Button>
        ),
        enableSorting: false,
    },
];

export const createLowBalanceColumns = (
    actions: BalanceColumnActions
): ColumnDef<ShiftLeaveBalanceDto>[] => [
    {
        id: 'employee',
        accessorKey: 'user.fullName',
        header: 'Employee',
        cell: ({ row }) => (
            <div className="min-w-[150px]">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-red-500" />
                    <div>
                        <div className="font-medium text-sm text-red-800">
                            {row.original.user.fullName}
                        </div>
                        <div className="text-xs text-red-600 truncate">
                            {row.original.user.email}
                        </div>
                    </div>
                </div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'totalShifts',
        accessorKey: 'totalShifts',
        header: 'Total',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-blue-600">
                    {row.original.totalShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'usedShifts',
        accessorKey: 'usedShifts',
        header: 'Used',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                    {row.original.usedShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'bonusShifts',
        accessorKey: 'bonusShifts',
        header: 'Bonus',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-green-600">
                    {row.original.bonusShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'availableShifts',
        accessorKey: 'availableShifts',
        header: 'Available',
        cell: ({ row }) => (
            <div className="text-center">
                <div className="text-lg font-semibold text-red-600">
                    {row.original.availableShifts}
                </div>
                <div className="text-xs text-gray-500">shifts</div>
            </div>
        ),
        enableSorting: true,
    },
    {
        id: 'urgency',
        header: 'Urgency',
        cell: ({ row }) => {
            const available = row.original.availableShifts;
            if (available <= 0) {
                return <Badge variant="destructive">Urgent</Badge>;
            } else if (available <= 2) {
                return <Badge variant="destructive">Critical</Badge>;
            } else {
                return (
                    <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                    >
                        Low
                    </Badge>
                );
            }
        },
        enableSorting: false,
    },
    {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
            <Button
                variant="outline"
                size="sm"
                onClick={() => actions.onUpdateBalance(row.original)}
                className="gap-2 text-green-600 hover:bg-green-50"
            >
                <Plus className="h-4 w-4" />
                Add Bonus
            </Button>
        ),
        enableSorting: false,
    },
];

export const balanceColumns = (actions: BalanceColumnActions) =>
    createBalanceColumns(actions);
export const lowBalanceColumns = (actions: BalanceColumnActions) =>
    createLowBalanceColumns(actions);
