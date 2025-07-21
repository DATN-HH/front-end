'use client';

import { Trash2, Edit, Plus, Table } from 'lucide-react';
import { useState } from 'react';

import {
    useTableTypes,
    useDeleteTableType,
    formatCurrency,
    TableTypeResponse,
} from '@/api/v1/table-types';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProtectedRoute } from '@/components/protected-component';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateTableTypeDialog } from '@/features/booking/components/table-type/CreateTableTypeDialog';
import { DeleteTableTypeDialog } from '@/features/booking/components/table-type/DeleteTableTypeDialog';
import { EditTableTypeDialog } from '@/features/booking/components/table-type/EditTableTypeDialog';
import { getIconByName } from '@/lib/icon-utils';
import { Role } from '@/lib/rbac';

export function TableTypes() {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTableType, setSelectedTableType] =
        useState<TableTypeResponse | null>(null);

    const { data: tableTypes = [], isLoading, error } = useTableTypes();
    const deleteTableTypeMutation = useDeleteTableType();

    const handleEdit = (tableType: TableTypeResponse) => {
        setSelectedTableType(tableType);
        setEditDialogOpen(true);
    };

    const handleDelete = (tableType: TableTypeResponse) => {
        setSelectedTableType(tableType);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (selectedTableType) {
            await deleteTableTypeMutation.mutateAsync(selectedTableType.id);
            setDeleteDialogOpen(false);
            setSelectedTableType(null);
        }
    };

    const renderIcon = (iconName: string) => {
        const IconComponent = getIconByName(iconName);
        return <IconComponent className="w-5 h-5" />;
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading table types...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-500">
                    Error loading table types
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 lg:gap-6">
            <PageTitle
                icon={Table}
                title="Table Types"
                left={
                    <Button
                        onClick={() => setCreateDialogOpen(true)}
                        className="flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Table Type
                    </Button>
                }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                {tableTypes.map((tableType) => (
                    <Card
                        key={tableType.id}
                        className="hover:shadow-md transition-shadow"
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex-shrink-0">
                                        {renderIcon(tableType.icon)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-lg break-words">
                                            {tableType.tableType}
                                        </CardTitle>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(tableType)}
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(tableType)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Status:
                                    </span>
                                    <Badge
                                        variant={
                                            tableType.status === 'ACTIVE'
                                                ? 'default'
                                                : 'secondary'
                                        }
                                    >
                                        {tableType.status}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Deposit for Booking:
                                    </span>
                                    <span className="font-medium">
                                        {formatCurrency(
                                            tableType.depositForBooking
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">
                                        Color:
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <div
                                            className="w-4 h-4 rounded border"
                                            style={{
                                                backgroundColor:
                                                    tableType.color,
                                            }}
                                        />
                                        <span className="text-sm font-mono">
                                            {tableType.color}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-4 space-y-1">
                                    <div>
                                        Created:{' '}
                                        {new Date(
                                            tableType.createdAt
                                        ).toLocaleDateString()}
                                    </div>
                                    <div>
                                        Updated:{' '}
                                        {new Date(
                                            tableType.updatedAt
                                        ).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {tableTypes.length === 0 && (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <Table className="w-12 h-12 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                        No table types found
                    </h3>
                    <p className="text-sm mb-4">
                        Create your first table type to get started
                    </p>
                    <Button onClick={() => setCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Table Type
                    </Button>
                </div>
            )}

            <CreateTableTypeDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />

            <EditTableTypeDialog
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
                tableType={selectedTableType}
            />

            <DeleteTableTypeDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                tableType={selectedTableType}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}

export default function TableTypesPage() {
    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.SYSTEM_ADMIN]}>
            <TableTypes />
        </ProtectedRoute>
    );
}
