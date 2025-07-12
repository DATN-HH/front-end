'use client';

import { useState } from 'react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { Building2 } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { useCustomToast } from '@/lib/show-toast';
import { ProtectedRoute } from '@/components/protected-component';
import { Role } from '@/lib/rbac';
import {
    useFloorsByBranch,
    useCreateFloor,
    useUpdateFloor,
    useDeleteFloor,
    type FloorResponse
} from '@/api/v1/floors';

// Import components
import { FloorFilters } from './components/FloorFilters';
import { FloorGrid } from './components/FloorGrid';
import { CreateFloorDialog } from './components/CreateFloorDialog';
import { EditFloorDialog } from './components/EditFloorDialog';
import { DeleteFloorDialog } from './components/DeleteFloorDialog';
import { ImageViewDialog } from './components/ImageViewDialog';
import { EmptyState } from './components/EmptyState';

export function FloorManagementPage() {
    const { user } = useAuth();
    const { success, error } = useCustomToast();

    // State
    const [includeDeleted, setIncludeDeleted] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
    const [selectedFloor, setSelectedFloor] = useState<FloorResponse | null>(null);

    // Get branch from user
    const branchId = user?.branch?.id;
    const branchName = user?.branch?.name;

    // API hooks
    const { data: floors = [], isLoading: isLoadingFloors } = useFloorsByBranch(
        branchId || 0,
        includeDeleted
    );
    const createFloorMutation = useCreateFloor();
    const updateFloorMutation = useUpdateFloor();
    const deleteFloorMutation = useDeleteFloor();

    // Handlers
    const handleCreateFloor = async (data: { name: string; order?: number; image?: File }) => {
        if (!branchId) {
            error('Error', 'No branch selected');
            return;
        }

        await createFloorMutation.mutateAsync({
            name: data.name,
            branchId: branchId,
            order: data.order,
            image: data.image
        });

        success('Success', 'Floor created successfully');
    };

    const handleEditFloor = (floor: FloorResponse) => {
        setSelectedFloor(floor);
        setIsEditDialogOpen(true);
    };

    const handleUpdateFloor = async (data: { name: string; order?: number; image?: File }) => {
        if (!selectedFloor) return;

        await updateFloorMutation.mutateAsync({
            id: selectedFloor.id,
            data: {
                name: data.name,
                order: data.order,
                image: data.image
            }
        });

        success('Success', 'Floor updated successfully');
        setSelectedFloor(null);
    };

    const handleDeleteFloor = (floor: FloorResponse) => {
        setSelectedFloor(floor);
        setIsDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedFloor) return;

        await deleteFloorMutation.mutateAsync(selectedFloor.id);
        success('Success', 'Floor deleted successfully');
        setSelectedFloor(null);
    };

    const handleViewImage = (floor: FloorResponse) => {
        setSelectedFloor(floor);
        setIsImageDialogOpen(true);
    };

    // Close dialogs
    const handleCloseCreateDialog = () => {
        setIsCreateDialogOpen(false);
    };

    const handleCloseEditDialog = () => {
        setIsEditDialogOpen(false);
        setSelectedFloor(null);
    };

    const handleCloseDeleteDialog = () => {
        setIsDeleteDialogOpen(false);
        setSelectedFloor(null);
    };

    const handleCloseImageDialog = () => {
        setIsImageDialogOpen(false);
        setSelectedFloor(null);
    };

    return (
        <ProtectedRoute requiredRoles={[Role.MANAGER]}>
            <div className="min-h-screen bg-white">
                <PageTitle
                    icon={Building2}
                    title="Floor Management"
                    className="mb-4 sm:mb-6"
                />

                {/* Filters */}
                <FloorFilters
                    includeDeleted={includeDeleted}
                    onIncludeDeletedChange={setIncludeDeleted}
                    onAddFloor={() => setIsCreateDialogOpen(true)}
                    branchName={branchName}
                    className="mb-4 sm:mb-6"
                />

                {/* Main Content */}
                {branchId ? (
                    <FloorGrid
                        floors={floors}
                        isLoading={isLoadingFloors}
                        onEdit={handleEditFloor}
                        onDelete={handleDeleteFloor}
                        onViewImage={handleViewImage}
                    />
                ) : (
                    <EmptyState
                        title="No Branch Selected"
                        description="Your account is not associated with any branch. Please contact your administrator to assign a branch to your account."
                        icon={<Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground" />}
                    />
                )}

                {/* Dialogs */}
                <CreateFloorDialog
                    isOpen={isCreateDialogOpen}
                    onClose={handleCloseCreateDialog}
                    onSubmit={handleCreateFloor}
                    isLoading={createFloorMutation.isPending}
                    branchName={branchName}
                />

                <EditFloorDialog
                    isOpen={isEditDialogOpen}
                    onClose={handleCloseEditDialog}
                    onSubmit={handleUpdateFloor}
                    isLoading={updateFloorMutation.isPending}
                    floor={selectedFloor}
                />

                <DeleteFloorDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={handleCloseDeleteDialog}
                    onConfirm={handleConfirmDelete}
                    isLoading={deleteFloorMutation.isPending}
                    floor={selectedFloor}
                />

                <ImageViewDialog
                    isOpen={isImageDialogOpen}
                    onClose={handleCloseImageDialog}
                    floor={selectedFloor}
                />
            </div>
        </ProtectedRoute>
    );
}

export default FloorManagementPage; 