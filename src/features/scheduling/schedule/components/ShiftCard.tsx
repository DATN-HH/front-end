import { Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/Table/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import type { Shift, Requirement } from '@/features/scheduling/api/api-shift';

export function ShiftCard({
    shifts,
    openEditDialog,
    deleteShift,
    roles,
    isLoading,
    setCurrentShift,
}: any) {
    const columns: ColumnDef<Shift>[] = [
        {
            accessorKey: 'startTime',
            header: 'Start Time',
        },
        {
            accessorKey: 'endTime',
            header: 'End Time',
        },
        {
            accessorKey: 'branchName',
            header: 'Branch',
        },
        {
            accessorKey: 'requirements',
            header: 'Requirements',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    {(
                        (row.getValue('requirements') as Requirement[]) || []
                    ).map((req, index) => {
                        const roleColor =
                            roles.find((r) => r.name === req.role)?.hexColor ||
                            '#333';
                        return (
                            <Badge
                                key={index}
                                variant="outline"
                                style={{
                                    backgroundColor: `${roleColor}20`,
                                    borderColor: roleColor,
                                    color: roleColor,
                                }}
                            >
                                {req.role}: {req.quantity}
                            </Badge>
                        );
                    })}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => {
                                setCurrentShift(row.original);
                                openEditDialog();
                            }}
                        >
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() => {
                                setCurrentShift(row.original);
                                deleteShift(row.original.id);
                            }}
                        >
                            <Trash className="h-4 w-4" />
                        </Button>
                    </div>
                );
            },
        },
    ];

    return (
        <DataTable
            columns={columns}
            data={shifts}
            pageIndex={0}
            pageSize={shifts.length}
            total={shifts.length}
            tableId="shift-table"
            loading={isLoading}
            enableSearch={false}
            enableSorting={false}
        />
    );
} 