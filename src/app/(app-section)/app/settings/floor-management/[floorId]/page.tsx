'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Building2, ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomToast } from '@/lib/show-toast';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';
import {
    useTablesByFloor,
    useCreateTable,
    useUpdateTable,
    useDeleteTable,
    type TableResponse,
    type TableCreateRequest,
    type TableUpdateRequest
} from '@/api/v1/tables';

// Import components
import { FloorCanvas } from './components/FloorCanvas';
import { TablePropertiesPanel } from './components/TablePropertiesPanel';
import { CreateTableDialog } from './components/CreateTableDialog';
import { EditTableDialog } from './components/EditTableDialog';
import { DeleteTableDialog } from './components/DeleteTableDialog';

export function FloorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { success, error } = useCustomToast();

    const floorId = parseInt(params.floorId as string);

    // State
    const [selectedTable, setSelectedTable] = useState<TableResponse | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    // API hooks
    const { data: floorData, isLoading: isLoadingFloor } = useTablesByFloor(floorId);
    const createTableMutation = useCreateTable();
    const updateTableMutation = useUpdateTable();
    const deleteTableMutation = useDeleteTable();

    // Handlers
    const handleCreateTable = async (data: Omit<TableCreateRequest, 'floorId'>) => {
        try {
            await createTableMutation.mutateAsync({
                ...data,
                floorId: floorId
            });
            success('Success', 'Table created successfully');
            setIsCreateDialogOpen(false);
        } catch (err) {
            error('Error', 'Failed to create table');
        }
    };

    const handleUpdateTable = async (data: TableUpdateRequest) => {
        if (!selectedTable) return;

        try {
            await updateTableMutation.mutateAsync({
                id: selectedTable.id,
                data: data
            });
            success('Success', 'Table updated successfully');
            setIsEditDialogOpen(false);
            setSelectedTable(null);
        } catch (err) {
            error('Error', 'Failed to update table');
        }
    };

    const handleDeleteTable = async () => {
        if (!selectedTable) return;

        try {
            await deleteTableMutation.mutateAsync(selectedTable.id);
            success('Success', 'Table deleted successfully');
            setIsDeleteDialogOpen(false);
            setSelectedTable(null);
        } catch (err) {
            error('Error', 'Failed to delete table');
        }
    };

    const handleTableDrop = useCallback(async (tableId: number, newPosition: { x: number; y: number }, imageSize?: { width: number; height: number; offsetX: number; offsetY: number }) => {
        const table = floorData?.tables.find(t => t.id === tableId);
        if (!table) return;

        // Use provided image size or fallback to default
        const imageWidth = imageSize?.width || 800;
        const imageHeight = imageSize?.height || 600;
        const offsetX = imageSize?.offsetX || 0;
        const offsetY = imageSize?.offsetY || 0;

        const xRatio = (newPosition.x - offsetX) / imageWidth;
        const yRatio = (newPosition.y - offsetY) / imageHeight;

        try {
            await updateTableMutation.mutateAsync({
                id: tableId,
                data: {
                    tableName: table.tableName,
                    capacity: table.capacity,
                    tableShape: table.tableShape,
                    tableTypeId: typeof table.tableType === 'object' ? table.tableType.id : 1,
                    xRatio: Math.max(0, Math.min(1, xRatio)),
                    yRatio: Math.max(0, Math.min(1, yRatio)),
                    widthRatio: table.widthRatio,
                    heightRatio: table.heightRatio
                }
            });
        } catch (err) {
            error('Error', 'Failed to move table');
        }
    }, [floorData?.tables, updateTableMutation, error]);

    const handleTableResize = useCallback(async (tableId: number, newSize: { width: number; height: number }, imageSize?: { width: number; height: number; offsetX: number; offsetY: number }) => {
        const table = floorData?.tables.find(t => t.id === tableId);
        if (!table) return;

        // Use provided image size or fallback to default
        const imageWidth = imageSize?.width || 800;
        const imageHeight = imageSize?.height || 600;

        const widthRatio = newSize.width / imageWidth;
        const heightRatio = newSize.height / imageHeight;

        try {
            await updateTableMutation.mutateAsync({
                id: tableId,
                data: {
                    tableName: table.tableName,
                    capacity: table.capacity,
                    tableShape: table.tableShape,
                    tableTypeId: typeof table.tableType === 'object' ? table.tableType.id : 1,
                    xRatio: (table.xRatio ?? table.xratio) ?? 0.5,
                    yRatio: (table.yRatio ?? table.yratio) ?? 0.5,
                    widthRatio: Math.max(0.01, Math.min(1, widthRatio)),
                    heightRatio: Math.max(0.01, Math.min(1, heightRatio))
                }
            });
        } catch (err) {
            error('Error', 'Failed to resize table');
        }
    }, [floorData?.tables, updateTableMutation, error]);

    const handleTableSelect = useCallback((table: TableResponse | null) => {
        setSelectedTable(table);
    }, []);

    const handleEditTable = (table: TableResponse) => {
        setSelectedTable(table);
        setIsEditDialogOpen(true);
    };

    const handleDeleteTableDialog = (table: TableResponse) => {
        setSelectedTable(table);
        setIsDeleteDialogOpen(true);
    };

    const handleDragStart = () => {
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    if (isLoadingFloor) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!floorData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Floor not found</h2>
                    <p className="text-gray-600 mb-4">This floor does not exist or has been deleted</p>
                    <Button onClick={() => router.push('/app/settings/floor-management')}>
                        Back to Floor Management
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER, Role.SYSTEM_ADMIN]}>
            <div className="min-h-screen bg-gray-50">
                <div className="flex flex-col lg:flex-row h-screen">
                    {/* Main Canvas Area */}
                    <div className="flex-1 flex flex-col">
                        {/* Header */}
                        <div className="bg-white border-b p-4 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => router.push('/app/settings/floor-management')}
                                    className="flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <PageTitle
                                    icon={Building2}
                                    title={`${floorData.floor.name} - ${floorData.tables.length} tables`}
                                    className="mb-0"
                                />
                            </div>
                            <Button
                                onClick={() => setIsCreateDialogOpen(true)}
                                className="gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Table
                            </Button>
                        </div>

                        {/* Canvas */}
                        <div className="flex-1 p-4">
                            <FloorCanvas
                                floor={floorData.floor}
                                tables={floorData.tables}
                                selectedTable={selectedTable}
                                onTableSelect={handleTableSelect}
                                onTableDrop={handleTableDrop}
                                onTableResize={handleTableResize}
                                isDragging={isDragging}
                                onDragStart={handleDragStart}
                                onDragEnd={handleDragEnd}
                                modeView="edit"
                            />
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div className="w-full lg:w-80 bg-white border-l">
                        <TablePropertiesPanel
                            selectedTable={selectedTable}
                            onEdit={handleEditTable}
                            onDelete={handleDeleteTableDialog}
                        />
                    </div>
                </div>

                {/* Dialogs */}
                <CreateTableDialog
                    isOpen={isCreateDialogOpen}
                    onClose={() => setIsCreateDialogOpen(false)}
                    onSubmit={handleCreateTable}
                    isLoading={createTableMutation.isPending}
                />

                <EditTableDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => {
                        setIsEditDialogOpen(false);
                        setSelectedTable(null);
                    }}
                    onSubmit={handleUpdateTable}
                    table={selectedTable}
                    isLoading={updateTableMutation.isPending}
                />

                <DeleteTableDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setSelectedTable(null);
                    }}
                    onConfirm={handleDeleteTable}
                    table={selectedTable}
                    isLoading={deleteTableMutation.isPending}
                />
            </div>
        </ProtectedRoute>
    );
}

export default FloorDetailPage; 