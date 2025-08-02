'use client';

import { ColumnDef } from '@tanstack/react-table';
import {
    Plus,
    Edit,
    Archive,
    Eye,
    Package,
    Grid3X3,
    List,
    Users,
    X,
    ShoppingCart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import {
    useAllFoodCombos,
    useDeleteFoodCombo,
    FoodComboResponse,
    Status,
} from '@/api/v1/menu/food-combos';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition, OperandType } from '@/components/common/Table/types';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { FoodComboEditModal } from '@/components/modals/FoodComboEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useCustomToast } from '@/lib/show-toast';

type ViewMode = 'table' | 'card';

export default function FoodCombosPage() {
    const { success, error: showError } = useCustomToast();

    // State for filtering
    const [keyword, setKeyword] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<Status | ''>('');
    const [canBeSold, setCanBeSold] = useState<boolean | undefined>(undefined);
    const [showArchived, setShowArchived] = useState(false);

    // View mode state
    const [viewMode, setViewMode] = useState<ViewMode>('table');

    // Modal state

    const [editingComboId, setEditingComboId] = useState<number | null>(null);

    // Add this to handle edit modal
    const [editModalOpen, setEditModalOpen] = useState(false);

    // API hooks
    const {
        data: combos = [],
        isLoading,
        error: apiError,
    } = useAllFoodCombos();
    const deleteComboMutation = useDeleteFoodCombo();

    const handleEdit = (comboId: number) => {
        setEditingComboId(comboId);
        setEditModalOpen(true);
    };

    // Filter combos based on current filters
    const filteredCombos = useMemo(() => {
        return combos.filter((combo) => {
            // Keyword search
            if (
                keyword &&
                !combo.name.toLowerCase().includes(keyword.toLowerCase()) &&
                !combo.description
                    ?.toLowerCase()
                    .includes(keyword.toLowerCase()) &&
                !combo.internalReference
                    ?.toLowerCase()
                    .includes(keyword.toLowerCase())
            ) {
                return false;
            }

            // Status filter
            if (selectedStatus && combo.status !== selectedStatus) {
                return false;
            }

            // Can be sold filter
            if (canBeSold !== undefined && combo.canBeSold !== canBeSold) {
                return false;
            }

            // Archive filter
            if (!showArchived && combo.status === 'DELETED') {
                return false;
            }

            return true;
        });
    }, [combos, keyword, selectedStatus, canBeSold, showArchived]);

    // Filter definitions for DataTable
    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'status',
            label: 'Status',
            type: OperandType.ENUM,
            options: [
                { label: 'Active', value: 'ACTIVE' },
                { label: 'Inactive', value: 'INACTIVE' },
                { label: 'Deleted', value: 'DELETED' },
            ],
        },
        {
            field: 'canBeSold',
            label: 'Can Be Sold',
            type: OperandType.BOOLEAN,
        },
        {
            field: 'canBePurchased',
            label: 'Can Be Purchased',
            type: OperandType.BOOLEAN,
        },
        {
            field: 'availableInPos',
            label: 'Available in POS',
            type: OperandType.BOOLEAN,
        },
    ];

    // Event handlers
    const handleDelete = async (comboId: number, comboName: string) => {
        try {
            await deleteComboMutation.mutateAsync(comboId);
            success(
                'Food Combo Deleted',
                `${comboName} has been deleted successfully.`
            );
        } catch (err) {
            showError(
                'Error',
                'Failed to delete food combo. Please try again.'
            );
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (!amount) return '-';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
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

    // Table columns
    const columns: ColumnDef<FoodComboResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Combo Name',
            cell: ({ row }) => (
                <Link
                    href={`/app/menu/food-combos/${row.original.id}/detail`}
                    className="flex items-center space-x-3 group"
                >
                    <div className="flex-shrink-0">
                        {row.original.image ? (
                            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-gray-100">
                                <Image
                                    src={row.original.image}
                                    alt={row.original.name}
                                    fill
                                    className="object-cover"
                                    sizes="48px"
                                />
                            </div>
                        ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center">
                                <ShoppingCart className="h-6 w-6 text-gray-400" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div className="font-medium group-hover:underline text-blue-500 hover:underline ">
                            {row.original.name}
                        </div>
                        <div className="text-sm text-gray-500">
                            {row.original.internalReference || '-'}
                        </div>
                    </div>
                </Link>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-600 line-clamp-2">
                        {row.original.description || '-'}
                    </p>
                </div>
            ),
        },
        {
            accessorKey: 'categoryName',
            header: 'Category',
            cell: ({ row }) => row.original.categoryName || '-',
        },
        {
            accessorKey: 'itemsCount',
            header: 'Items',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span>{row.original.itemsCount}</span>
                </div>
            ),
        },
        {
            accessorKey: 'effectivePrice',
            header: 'Price',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {formatCurrency(row.original.effectivePrice)}
                    </div>
                    {row.original.price &&
                        row.original.price !== row.original.effectivePrice && (
                            <div className="text-xs text-gray-500">
                                Override: {formatCurrency(row.original.price)}
                            </div>
                        )}
                </div>
            ),
        },
        {
            accessorKey: 'effectiveCost',
            header: 'Cost',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="font-medium">
                        {formatCurrency(row.original.effectiveCost)}
                    </div>
                    {row.original.cost &&
                        row.original.cost !== row.original.effectiveCost && (
                            <div className="text-xs text-gray-500">
                                Override: {formatCurrency(row.original.cost)}
                            </div>
                        )}
                </div>
            ),
        },
        {
            accessorKey: 'canBeSold',
            header: 'Can Be Sold',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.canBeSold ? 'default' : 'secondary'}
                >
                    {row.original.canBeSold ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            accessorKey: 'variantsCount',
            header: 'Variants',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4 text-gray-400" />
                    <span>{row.original.variantsCount}</span>
                </div>
            ),
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            id: 'actions',
            header: 'Actions',
            meta: { pin: 'right' },
            cell: ({ row }) => {
                const combo = row.original;
                const isDeleted = combo.status === 'DELETED';

                return (
                    <div className="flex gap-2">
                        <Link href={`/app/menu/food-combos/${combo.id}/detail`}>
                            <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />{' '}
                            </Button>
                        </Link>
                        {!isDeleted && (
                            <>
                                <Button
                                    size="sm"
                                    onClick={() => handleEdit(combo.id)}
                                >
                                    <Edit className="h-4 w-4 mr-1" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500"
                                    onClick={() =>
                                        handleDelete(combo.id, combo.name)
                                    }
                                    disabled={deleteComboMutation.isPending}
                                >
                                    <Archive className="h-4 w-4 mr-1" />
                                </Button>
                            </>
                        )}
                    </div>
                );
            },
        },
    ];

    // Card View Component
    const ComboCard = ({ combo }: { combo: FoodComboResponse }) => {
        const isDeleted = combo.status === 'DELETED';
        const hasVariants = combo.variantsCount > 0;
        const hasCustomPricing =
            combo.price && combo.price !== combo.effectivePrice;

        return (
            <Card className="hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[420px]">
                {/* Image Section */}
                <div className="relative h-48 bg-gray-100 flex-shrink-0">
                    {combo.image ? (
                        <Image
                            src={combo.image}
                            alt={combo.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="h-16 w-16 text-gray-400" />
                        </div>
                    )}

                    {/* Status Badge Overlay */}
                    <div className="absolute top-3 right-3">
                        {getStatusBadge(combo.status)}
                    </div>

                    {/* Variants Indicator */}
                    {hasVariants && (
                        <div className="absolute top-3 left-3">
                            <Badge variant="outline" className="bg-white/90">
                                {combo.variantsCount} variants
                            </Badge>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="flex-1 flex flex-col min-h-0">
                    <CardHeader className="pb-2 flex-shrink-0">
                        <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
                            {combo.name}
                        </CardTitle>
                        <CardDescription className="text-sm truncate">
                            {combo.internalReference || 'No reference'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
                        {/* Scrollable content area */}
                        <div className="flex-1 space-y-3 min-h-0 overflow-y-auto">
                            {/* Description */}
                            {combo.description && (
                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {combo.description}
                                </p>
                            )}

                            {/* Category */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Category:
                                </span>
                                <span className="text-sm font-medium">
                                    {combo.categoryName || 'No category'}
                                </span>
                            </div>

                            {/* Items Count */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                    Items:
                                </span>
                                <div className="flex items-center space-x-1">
                                    <Users className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm font-medium">
                                        {combo.itemsCount}
                                    </span>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Price:
                                    </span>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(combo.effectivePrice)}
                                    </span>
                                </div>
                                {hasCustomPricing && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            Override:
                                        </span>
                                        <span className="text-xs text-gray-400">
                                            {formatCurrency(combo.price)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        Cost:
                                    </span>
                                    <span className="text-sm font-medium">
                                        {formatCurrency(combo.effectiveCost)}
                                    </span>
                                </div>
                            </div>

                            {/* Sales Info */}
                            <div className="flex items-center justify-between">
                                <Badge
                                    variant={
                                        combo.canBeSold
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {combo.canBeSold ? 'Can Sell' : 'No Sell'}
                                </Badge>
                                <Badge
                                    variant={
                                        combo.availableInPos
                                            ? 'default'
                                            : 'secondary'
                                    }
                                    className="text-xs"
                                >
                                    {combo.availableInPos ? 'POS' : 'No POS'}
                                </Badge>
                            </div>
                        </div>

                        {/* Actions - Always at bottom */}
                        <div className="space-y-2 mt-3 flex-shrink-0">
                            <div className="flex gap-2">
                                <Link
                                    href={`/app/menu/food-combos/${combo.id}/detail`}
                                    className="flex-1"
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full h-8"
                                    >
                                        <Eye className="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                </Link>
                                {!isDeleted && (
                                    <Button
                                        size="sm"
                                        onClick={() => handleEdit(combo.id)}
                                        className="flex-1 h-8"
                                    >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {/* Delete */}
                            {!isDeleted && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-red-500 h-8"
                                    onClick={() =>
                                        handleDelete(combo.id, combo.name)
                                    }
                                    disabled={deleteComboMutation.isPending}
                                >
                                    <Archive className="h-3 w-3 mr-1" />
                                    Delete
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>
        );
    };

    if (apiError) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={ShoppingCart}
                    title="Food Combos"
                    left={
                        <Button onClick={() => window.location.reload()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    }
                />
                <div className="text-center text-red-500">
                    Error loading food combos: {apiError.message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle
                icon={ShoppingCart}
                title="Food Combos"
                left={
                    <div className="flex items-center space-x-4">
                        <Link href="/app/menu/food-combos/new">
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Combo
                            </Button>
                        </Link>

                        {/* View Mode Toggle */}
                        <div className="flex border rounded-md overflow-hidden">
                            <Button
                                variant={
                                    viewMode === 'table' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setViewMode('table')}
                                className="rounded-none border-0"
                            >
                                <List className="h-4 w-4 mr-2" />
                                Table
                            </Button>
                            <Button
                                variant={
                                    viewMode === 'card' ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => setViewMode('card')}
                                className="rounded-none border-0"
                            >
                                <Grid3X3 className="h-4 w-4 mr-2" />
                                Cards
                            </Button>
                        </div>
                    </div>
                }
            />

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg border space-y-4">
                <div className="flex items-center space-x-4">
                    <input
                        type="text"
                        placeholder="Search food combos..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
                    />

                    <select
                        value={selectedStatus}
                        onChange={(e) =>
                            setSelectedStatus(e.target.value as Status | '')
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="DELETED">Deleted</option>
                    </select>

                    <select
                        value={
                            canBeSold === undefined ? '' : canBeSold.toString()
                        }
                        onChange={(e) => {
                            const value = e.target.value;
                            setCanBeSold(
                                value === '' ? undefined : value === 'true'
                            );
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Can Be Sold - All</option>
                        <option value="true">Can Be Sold - Yes</option>
                        <option value="false">Can Be Sold - No</option>
                    </select>

                    <label className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={showArchived}
                            onChange={(e) => setShowArchived(e.target.checked)}
                            className="rounded"
                        />
                        <span className="text-sm">Show Archived</span>
                    </label>

                    {(keyword ||
                        selectedStatus ||
                        canBeSold !== undefined ||
                        showArchived) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setKeyword('');
                                setSelectedStatus('');
                                setCanBeSold(undefined);
                                setShowArchived(false);
                            }}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear
                        </Button>
                    )}
                </div>

                <div className="text-sm text-gray-600">
                    {filteredCombos.length} of {combos.length} food combos
                </div>
            </div>

            {/* Content */}
            {viewMode === 'table' ? (
                <DataTable
                    columns={columns}
                    data={filteredCombos}
                    tableId="food-combos-table"
                    pageIndex={0}
                    pageSize={25}
                    total={filteredCombos.length}
                    currentSorting=""
                    onPaginationChange={() => {}}
                    onSortingChange={() => {}}
                    onFilterChange={() => {}}
                    onSearchChange={() => {}}
                    filterDefinitions={filterDefinitions}
                    enableSearch={false} // We have custom search above
                    enableColumnVisibility={true}
                    enableSorting={true}
                    enablePinning={true}
                    enableColumnOrdering={true}
                    enableFiltering={false} // We have custom filters above
                    enablePagination={true}
                    enableExport={true}
                    loading={isLoading}
                />
            ) : (
                <div className="space-y-4">
                    {/* Cards Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <Card key={i} className="h-96">
                                    <CardContent className="p-6">
                                        <div className="animate-pulse space-y-4">
                                            <div className="h-32 bg-gray-200 rounded"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : filteredCombos.length === 0 ? (
                        <div className="text-center py-12">
                            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No food combos found
                            </h3>
                            <p className="text-gray-500 mb-4">
                                {combos.length === 0
                                    ? 'Get started by creating your first food combo.'
                                    : 'Try adjusting your filters or search terms.'}
                            </p>
                            <Link href="/app/menu/food-combos/new">
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Create Food Combo
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredCombos.map((combo) => (
                                <ComboCard key={combo.id} combo={combo} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add the edit modal */}
            {editingComboId && (
                <FoodComboEditModal
                    open={editModalOpen}
                    onOpenChange={setEditModalOpen}
                    comboId={editingComboId}
                    onSuccess={() => {
                        setEditModalOpen(false);
                        setEditingComboId(null);
                    }}
                />
            )}
        </div>
    );
}
