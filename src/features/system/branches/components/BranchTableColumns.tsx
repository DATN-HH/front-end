'use client';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BranchResponseDto } from '@/api/v1/branches';
import { formatDate } from '@/lib/utils';

interface BranchTableColumnsProps {
    onEdit: (branch: BranchResponseDto) => void;
    onDelete: (branch: BranchResponseDto) => void;
}

export const BranchTableColumns = ({
    onEdit,
    onDelete,
}: BranchTableColumnsProps): ColumnDef<BranchResponseDto>[] => [
        {
            accessorKey: 'name',
            header: 'Name',
        },
        {
            accessorKey: 'address',
            header: 'Address',
        },
        {
            accessorKey: 'phone',
            header: 'Phone',
        },
        {
            accessorKey: 'manager',
            header: 'Manager',
            cell: ({ row }) => {
                const manager = row.getValue('manager') as BranchResponseDto['manager'];
                return manager ? manager.fullName : '-';
            },
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.getValue('status') as string;
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs ${status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}
                    >
                        {status}
                    </span>
                );
            },
        },
        {
            accessorKey: 'createdAt',
            header: 'Created At',
            cell: ({ row }) => {
                return formatDate(row.getValue('createdAt'));
            },
        },
        {
            accessorKey: 'updatedAt',
            header: 'Updated At',
            cell: ({ row }) => {
                return formatDate(row.getValue('updatedAt'));
            },
        },
        {
            id: 'actions',
            cell: ({ row }) => {
                const branch = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => onEdit(branch)}
                                className="cursor-pointer"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(branch)}
                                className="cursor-pointer text-red-600"
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ]; 