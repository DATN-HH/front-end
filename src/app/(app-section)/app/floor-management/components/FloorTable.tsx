'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataTable } from '@/components/common/Table/DataTable';
import { Building2, Edit3, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { FloorResponse } from '@/api/v1/floors';

interface FloorTableProps {
    floors: FloorResponse[];
    isLoading: boolean;
    onEdit: (floor: FloorResponse) => void;
    onDelete: (floor: FloorResponse) => void;
    onViewImage: (floor: FloorResponse) => void;
}

// Floor Table Columns
const createFloorColumns = (
    onEdit: (floor: FloorResponse) => void,
    onDelete: (floor: FloorResponse) => void,
    onViewImage: (floor: FloorResponse) => void
): ColumnDef<FloorResponse>[] => [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Floor Name',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                        {row.original.imageUrl ? (
                            <img
                                src={row.original.imageUrl}
                                alt={row.original.name}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onViewImage(row.original)}
                            />
                        ) : (
                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm sm:text-base truncate">
                            {row.original.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            ID: {row.original.id}
                        </p>
                    </div>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={
                        row.original.status === 'ACTIVE' ? 'default' :
                            row.original.status === 'INACTIVE' ? 'secondary' : 'destructive'
                    }
                    className="text-xs"
                >
                    {row.original.status}
                </Badge>
            ),
            enableSorting: true,
        },
        {
            id: 'updatedAt',
            accessorKey: 'updatedAt',
            header: 'Last Updated',
            cell: ({ row }) => (
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm truncate">
                        {format(new Date(row.original.updatedAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                        By: {row.original.updatedUsername}
                    </p>
                </div>
            ),
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    {row.original.imageUrl && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewImage(row.original)}
                            className="h-8 w-8 p-0"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                        className="h-8 w-8 p-0"
                    >
                        <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(row.original)}
                        className="h-8 w-8 p-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            ),
            enableSorting: false,
        },
    ];

export function FloorTable({ floors, isLoading, onEdit, onDelete, onViewImage }: FloorTableProps) {
    const columns = createFloorColumns(onEdit, onDelete, onViewImage);

    return (
        <Card>
            <CardHeader className="pb-4">
                <CardTitle className="text-lg sm:text-xl">Floors</CardTitle>
                <CardDescription>
                    {floors.length} floor(s) found
                </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
                <DataTable
                    columns={columns}
                    data={floors}
                    loading={isLoading}
                    enableSearch={true}
                    enableColumnVisibility={true}
                    enableSorting={true}
                    enablePagination={true}
                    enableExport={true}
                    tableId="floor-management"
                />
            </CardContent>
        </Card>
    );
} 