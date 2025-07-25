'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Edit,
    Trash2,
    Settings,
    Package,
    Tag,
    Palette,
    Radio,
    ChevronDown,
    Eye,
    Tags,
} from 'lucide-react';
import { useState } from 'react';

import {
    useAllProductAttributes,
    useDeleteProductAttribute,
    ProductAttributeResponse,
    DisplayType,
    VariantCreationMode,
    Status,
} from '@/api/v1/menu/product-attributes';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition, OperandType } from '@/components/common/Table/types';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProductAttributeCreateModal } from '@/components/modals/ProductAttributeCreateModal';
import { ProductAttributeEditModal } from '@/components/modals/ProductAttributeEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function AttributesPage() {
    const { toast } = useToast();

    // Modal states
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAttributeId, setSelectedAttributeId] = useState<
        number | null
    >(null);

    // API hooks
    const {
        data: attributes = [],
        isLoading,
        error,
    } = useAllProductAttributes();
    const deleteAttributeMutation = useDeleteProductAttribute();

    // Event handlers
    const handleDelete = async (attributeId: number, attributeName: string) => {
        if (
            !confirm(
                `Are you sure you want to delete the attribute "${attributeName}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await deleteAttributeMutation.mutateAsync(attributeId);
            toast({
                title: 'Attribute Deleted',
                description: `${attributeName} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete attribute. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (attributeId: number) => {
        setSelectedAttributeId(attributeId);
        setShowEditModal(true);
    };

    // Helper functions
    const getDisplayTypeIcon = (type: DisplayType) => {
        switch (type) {
            case 'RADIO':
                return <Radio className="h-4 w-4" />;
            case 'SELECT':
                return <ChevronDown className="h-4 w-4" />;
            case 'COLOR':
                return <Palette className="h-4 w-4" />;
            case 'CHECKBOX':
                return <Package className="h-4 w-4" />;
            default:
                return <Tag className="h-4 w-4" />;
        }
    };

    const getDisplayTypeBadge = (type: DisplayType) => {
        const colors = {
            RADIO: 'bg-blue-100 text-blue-800',
            SELECT: 'bg-green-100 text-green-800',
            COLOR: 'bg-purple-100 text-purple-800',
            CHECKBOX: 'bg-orange-100 text-orange-800',
            TEXTBOX: 'bg-gray-100 text-gray-800',
        };

        return (
            <Badge className={colors[type]}>
                <span className="mr-1">{getDisplayTypeIcon(type)}</span>
                {type}
            </Badge>
        );
    };

    const getVariantCreationModeBadge = (mode: VariantCreationMode) => {
        const colors = {
            INSTANTLY: 'bg-green-100 text-green-800',
            DYNAMICALLY: 'bg-yellow-100 text-yellow-800',
            NEVER: 'bg-red-100 text-red-800',
        };

        return <Badge className={colors[mode]}>{mode}</Badge>;
    };

    const getStatusBadge = (status: Status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'DELETED':
                return <Badge variant="destructive">Deleted</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Filter definitions for DataTable
    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'displayType',
            label: 'Display Type',
            type: OperandType.ENUM,
            options: [
                { value: 'RADIO', label: 'Radio' },
                { value: 'SELECT', label: 'Select' },
                { value: 'COLOR', label: 'Color' },
                { value: 'CHECKBOX', label: 'Checkbox' },
            ],
        },
        {
            field: 'variantCreationMode',
            label: 'Creation Mode',
            type: OperandType.ENUM,
            options: [
                { value: 'INSTANTLY', label: 'Instantly' },
                { value: 'DYNAMICALLY', label: 'Dynamically' },
                { value: 'NEVER', label: 'Never' },
            ],
        },
        {
            field: 'status',
            label: 'Status',
            type: OperandType.ENUM,
            options: [
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'DELETED', label: 'Deleted' },
            ],
        },
    ];

    // Table columns
    const columns: ColumnDef<ProductAttributeResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Attribute Name',
            cell: ({ row }) => (
                <div>
                    <div className="font-medium">{row.original.name}</div>
                    {row.original.description && (
                        <div className="text-sm text-gray-500">
                            {row.original.description}
                        </div>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'displayType',
            header: 'Display Type',
            cell: ({ row }) => getDisplayTypeBadge(row.original.displayType),
        },
        {
            accessorKey: 'variantCreationMode',
            header: 'Creation Mode',
            cell: ({ row }) =>
                getVariantCreationModeBadge(row.original.variantCreationMode),
        },
        {
            accessorKey: 'valuesCount',
            header: 'Values',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.valuesCount || 0}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'productsCount',
            header: 'Products',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.productsCount || 0}
                    </Badge>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            accessorKey: 'createdAt',
            header: 'Created',
            cell: ({ row }) =>
                new Date(row.original.createdAt).toLocaleDateString(),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const isDeleted = row.original.status === 'DELETED';

                return (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                // Navigate to detail page or open values modal
                                window.open(
                                    `/app/menu/attributes/${row.original.id}/detail`,
                                    '_blank'
                                );
                            }}
                        >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                        </Button>
                        {!isDeleted && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleEdit(row.original.id)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() =>
                                        handleDelete(
                                            row.original.id,
                                            row.original.name
                                        )
                                    }
                                    disabled={deleteAttributeMutation.isPending}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    // Statistics
    const stats = {
        total: attributes.length,
        active: attributes.filter((attr) => attr.status === 'ACTIVE').length,
        totalValues: attributes.reduce(
            (sum, attr) => sum + (attr.valuesCount || 0),
            0
        ),
        totalProducts: attributes.reduce(
            (sum, attr) => sum + (attr.productsCount || 0),
            0
        ),
    };

    if (error) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={Tags}
                    title="Product Attributes"
                    left={
                        <Button onClick={() => window.location.reload()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    }
                />
                <div className="text-center text-red-500">
                    Error loading attributes: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Tags}
                title="Product Attributes"
                left={
                    <Button onClick={() => setShowAttributeModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Attribute
                    </Button>
                }
            />

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Attributes
                        </CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">
                            {stats.active} active
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Values
                        </CardTitle>
                        <Tag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalValues}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Across all attributes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Products Using
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.totalProducts}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Products with attributes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Avg Values
                        </CardTitle>
                        <Palette className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.total > 0
                                ? Math.round(stats.totalValues / stats.total)
                                : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Per attribute
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Attributes Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Product Attributes</CardTitle>
                    <CardDescription>
                        Manage attributes that can be used to create product
                        variants.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={attributes}
                        tableId="attributes-table"
                        pageIndex={0}
                        pageSize={25}
                        total={attributes.length}
                        onPaginationChange={() => {}}
                        onSortingChange={() => {}}
                        onFilterChange={() => {}}
                        onSearchChange={() => {}}
                        filterDefinitions={filterDefinitions}
                        enableSearch={true}
                        enableColumnVisibility={true}
                        enableSorting={true}
                        enableFiltering={true}
                        enableExport={true}
                        loading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Modals */}
            <ProductAttributeCreateModal
                open={showAttributeModal}
                onOpenChange={setShowAttributeModal}
            />

            {selectedAttributeId && (
                <ProductAttributeEditModal
                    open={showEditModal}
                    onOpenChange={(open: boolean) => {
                        setShowEditModal(open);
                        if (!open) setSelectedAttributeId(null);
                    }}
                    attributeId={selectedAttributeId}
                />
            )}
        </div>
    );
}
