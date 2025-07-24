'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import {
    useProductAttribute,
    useAttributeValues,
    useDeleteProductAttribute,
    useDeleteAttributeValue,
    ProductAttributeValueResponse,
    DisplayType,
    VariantCreationMode,
    Status,
} from '@/api/v1/menu/product-attributes';
import { DataTable } from '@/components/common/Table/DataTable';
import { AttributeValuesModal } from '@/components/modals/AttributeValuesModal';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

export default function AttributeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { toast } = useToast();
    const attributeId = parseInt(params.id as string);

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showValuesModal, setShowValuesModal] = useState(false);
    const [editingValueId, setEditingValueId] = useState<number | null>(null);

    // API hooks
    const {
        data: attribute,
        isLoading: attributeLoading,
        error: attributeError,
    } = useProductAttribute(attributeId);
    const {
        data: attributeValues = [],
        isLoading: valuesLoading,
        error: valuesError,
    } = useAttributeValues(attributeId);
    const deleteAttributeMutation = useDeleteProductAttribute();
    const deleteValueMutation = useDeleteAttributeValue();

    // Helper functions
    const getDisplayTypeIcon = (type: DisplayType) => {
        switch (type) {
            case 'RADIO':
                return '📻';
            case 'SELECT':
                return '📋';
            case 'COLOR':
                return '🎨';
            case 'CHECKBOX':
                return '☑️';
            default:
                return '🏷️';
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
                {getDisplayTypeIcon(type)} {type}
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

    // Event handlers
    const handleDeleteAttribute = async () => {
        if (!attribute) return;

        if (
            !confirm(
                `Are you sure you want to delete the attribute "${attribute.name}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await deleteAttributeMutation.mutateAsync(attributeId);
            toast({
                title: 'Attribute Deleted',
                description: `${attribute.name} has been deleted successfully.`,
            });
            router.push('/app/menu/attributes');
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete attribute. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteValue = async (valueId: number, valueName: string) => {
        if (
            !confirm(
                `Are you sure you want to delete the value "${valueName}"? This action cannot be undone.`
            )
        ) {
            return;
        }

        try {
            await deleteValueMutation.mutateAsync(valueId);
            toast({
                title: 'Value Deleted',
                description: `${valueName} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete value. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEditValue = (valueId: number) => {
        setEditingValueId(valueId);
        setShowValuesModal(true);
    };

    // Table columns for attribute values
    const valueColumns: ColumnDef<ProductAttributeValueResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Value Name',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {row.original.colorCode && (
                        <div
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: row.original.colorCode }}
                        />
                    )}
                    <span className="font-medium">{row.original.name}</span>
                </div>
            ),
        },
        {
            accessorKey: 'sequence',
            header: 'Sequence',
            cell: ({ row }) => row.original.sequence || 0,
        },
        {
            accessorKey: 'priceExtra',
            header: 'Price Extra',
            cell: ({ row }) => {
                const priceExtra = (row.original as any).priceExtra;
                if (!priceExtra || priceExtra === 0) return '-';
                return new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                }).format(Number(priceExtra));
            },
        },
        {
            accessorKey: 'usageCount',
            header: 'Usage Count',
            cell: ({ row }) => (
                <Badge variant="outline">{(row.original as any).usageCount || 0}</Badge>
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
                        {!isDeleted && (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        handleEditValue(row.original.id)
                                    }
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() =>
                                        handleDeleteValue(
                                            row.original.id,
                                            row.original.name
                                        )
                                    }
                                    disabled={deleteValueMutation.isPending}
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

    if (attributeLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Loading attribute details...
                    </p>
                </div>
            </div>
        );
    }

    if (attributeError || !attribute) {
        return (
            <div className="space-y-6">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/attributes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Attribute Not Found
                        </h1>
                        <p className="text-muted-foreground">
                            The requested attribute could not be found.
                        </p>
                    </div>
                </div>
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500">
                            Error loading attribute:{' '}
                            {attributeError?.message || 'Attribute not found'}
                        </p>
                        <Button
                            className="mt-4"
                            onClick={() => router.push('/app/menu/attributes')}
                        >
                            Back to Attributes
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/app/menu/attributes">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            {attribute.name}
                        </h1>
                        <p className="text-muted-foreground">
                            Product attribute details and configuration
                        </p>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Button onClick={() => setShowEditModal(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDeleteAttribute}
                        disabled={deleteAttributeMutation.isPending}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">
                        General Information
                    </TabsTrigger>
                    <TabsTrigger value="values">
                        Values ({attributeValues.length})
                    </TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Basic Information</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Attribute Name
                                        </label>
                                        <p className="text-sm font-medium">
                                            {attribute.name}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Display Type
                                        </label>
                                        <div className="mt-1">
                                            {getDisplayTypeBadge(
                                                attribute.displayType
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Variant Creation Mode
                                        </label>
                                        <div className="mt-1">
                                            {getVariantCreationModeBadge(
                                                attribute.variantCreationMode
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Status
                                        </label>
                                        <div className="mt-1">
                                            {getStatusBadge(attribute.status)}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Created Date
                                        </label>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                attribute.createdAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Last Updated
                                        </label>
                                        <p className="text-sm font-medium">
                                            {new Date(
                                                attribute.updatedAt
                                            ).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                {attribute.description && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">
                                            Description
                                        </label>
                                        <p className="text-sm">
                                            {attribute.description}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Usage Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {attribute.productsCount || 0}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Products using this attribute
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {attribute.valuesCount || 0}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Attribute values
                                    </p>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-primary">
                                        {attributeValues.reduce(
                                            (sum, value) =>
                                                sum + (value.usageCount || 0),
                                            0
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Total usage count
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="values" className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Attribute Values</CardTitle>
                                <CardDescription>
                                    Manage the possible values for this
                                    attribute
                                </CardDescription>
                            </div>
                            <Button onClick={() => setShowValuesModal(true)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Value
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <DataTable
                                columns={valueColumns}
                                data={attributeValues}
                                tableId="attribute-values-table"
                                pageIndex={0}
                                pageSize={25}
                                total={attributeValues.length}
                                onPaginationChange={() => {}}
                                onSortingChange={() => {}}
                                onFilterChange={() => {}}
                                onSearchChange={() => {}}
                                enableSearch={true}
                                enableColumnVisibility={true}
                                enableSorting={true}
                                enableExport={true}
                                loading={valuesLoading}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Advanced Settings</CardTitle>
                            <CardDescription>
                                Configure advanced settings for this attribute
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">
                                            Variant Creation Mode
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            Controls when product variants are
                                            created
                                        </p>
                                    </div>
                                    {getVariantCreationModeBadge(
                                        attribute.variantCreationMode
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">
                                            Display Type
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            How this attribute is displayed to
                                            users
                                        </p>
                                    </div>
                                    {getDisplayTypeBadge(attribute.displayType)}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">Status</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Current status of this attribute
                                        </p>
                                    </div>
                                    {getStatusBadge(attribute.status)}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modals */}
            <ProductAttributeEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                attributeId={attributeId}
            />

            <AttributeValuesModal
                open={showValuesModal}
                onOpenChange={(open) => {
                    setShowValuesModal(open);
                    if (!open) {
                        setEditingValueId(null);
                    }
                }}
                attributeId={attributeId}
                editingValueId={editingValueId}
            />
        </div>
    );
}
