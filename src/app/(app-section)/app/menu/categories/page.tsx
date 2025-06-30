'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit,
    Archive,
    Eye,
    FolderOpen,
    Search,
} from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition } from '@/components/common/Table/types';
import { OperandType } from '@/components/common/Table/types';
import { 
    useCategoryList, 
    useUpdateCategory,
    useProductCountByCategory,
    CategoryListParams,
    CategoryResponse,
    Status
} from '@/api/v1/menu/categories';
import { CategoryCreateModal } from '@/components/modals/CategoryCreateModal';
import { CategoryEditModal } from '@/components/modals/CategoryEditModal';

export default function CategoriesPage() {
    const { toast } = useToast();
    
    // State for table controls
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [keyword, setKeyword] = useState('');
    const [archived, setArchived] = useState(false);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    
    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryResponse | null>(null);

    // Build API parameters using /api/menu/categories/list
    const apiParams: CategoryListParams = useMemo(() => {
        const [sortField, sortDirection] = sorting ? sorting.split(':') : ['name', 'asc'];
        
        const params: CategoryListParams = {
            page: pageIndex,
            size: pageSize,
            search: keyword || undefined,
            archived: archived,
            sort: sortField || 'name',
            direction: (sortDirection as 'asc' | 'desc') || 'asc',
        };
        return params;
    }, [pageIndex, pageSize, keyword, archived, sorting]);

    // API hooks
    const { data: categoryData, isLoading, error } = useCategoryList(apiParams);
    const updateCategoryMutation = useUpdateCategory();

    // Extract data from API response
    const categories = categoryData?.content || [];
    const totalElements = categoryData?.totalElements || 0;

    // Filter definitions for DataTable
    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'archived',
            label: 'Archived Status',
            type: OperandType.BOOLEAN,
        },
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
    ];

    // Event handlers using update API to toggle status between ACTIVE/INACTIVE
    const handleToggleStatus = async (category: CategoryResponse) => {
        try {
            const newStatus = category.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateCategoryMutation.mutateAsync({
                id: category.id,
                data: { 
                    code: category.code,
                    name: category.name,
                    description: category.description,
                    status: newStatus 
                }
            });
            
            const action = newStatus === 'ACTIVE' ? 'activated' : 'deactivated';
            toast({
                title: 'Status Updated',
                description: `${category.name} has been ${action} successfully.`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update category status. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (category: CategoryResponse) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: Status) => {
        switch (status) {
            case 'ACTIVE':
                return <Badge variant="default">Active</Badge>;
            case 'INACTIVE':
                return <Badge variant="secondary">Inactive</Badge>;
            case 'DELETED':
                return <Badge variant="destructive">Archived</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    // Component to display product count using /api/menu/categories/{id}/product-count
    const ProductCountCell = ({ categoryId }: { categoryId: number }) => {
        const { data: productCount } = useProductCountByCategory(categoryId);
        
        return (
            <div className="text-center">
                <Badge variant="outline">
                    {productCount !== undefined ? productCount : '...'}
                </Badge>
            </div>
        );
    };

    // Table columns
    const columns: ColumnDef<CategoryResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Category Name',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <FolderOpen className="h-4 w-4 text-blue-500" />
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        <div className="text-sm text-gray-500">
                            Code: {row.original.code}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Description',
            cell: ({ row }) => (
                <div className="max-w-[200px] truncate" title={row.original.description || '-'}>
                    {row.original.description || '-'}
                </div>
            ),
        },
        {
            accessorKey: 'productCount',
            header: 'Products',
            cell: ({ row }) => <ProductCountCell categoryId={row.original.id} />,
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => getStatusBadge(row.original.status),
        },
        {
            accessorKey: 'createdAt',
            header: 'Created Date',
            cell: ({ row }) => formatDate(row.original.createdAt),
        },
        {
            accessorKey: 'updatedAt',
            header: 'Last Updated',
            cell: ({ row }) => formatDate(row.original.updatedAt),
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Link href={`/app/menu/categories/${row.original.id}/detail`}>
                            <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </Link>
                        <Button
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                        >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant={row.original.status === 'ACTIVE' ? 'outline' : 'default'}
                            size="sm"
                            className={row.original.status === 'ACTIVE' ? 'text-orange-600' : 'text-green-600'}
                            onClick={() => handleToggleStatus(row.original)}
                            disabled={updateCategoryMutation.isPending}
                        >
                            <Archive className="h-4 w-4 mr-1" />
                            {row.original.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </Button>
                    </div>
                );
            },
        },
    ];

    if (error) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={FolderOpen}
                    title="Categories"
                    left={
                        <Button onClick={() => window.location.reload()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    }
                />
                <div className="text-center text-red-500">
                    Error loading categories: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle
                icon={FolderOpen}
                title="Categories"
                left={
                    <div className="flex gap-2">
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Category
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setArchived(!archived)}
                            className={archived ? 'bg-red-50 text-red-700' : ''}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            {archived ? 'Show Active' : 'Show Archived'}
                        </Button>
                    </div>
                }
            />

            <DataTable
                columns={columns}
                data={categories}
                tableId="categories-table"
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={totalElements}
                currentSorting={sorting}
                onPaginationChange={(newPageIndex: number, newPageSize: number) => {
                    setPageIndex(newPageIndex);
                    setPageSize(newPageSize);
                }}
                onSortingChange={setSorting}
                onFilterChange={(filters) => {
                    setColumnFilters(filters);
                }}
                onSearchChange={(searchTerm) => {
                    setKeyword(searchTerm);
                    setPageIndex(0); // Reset to first page when searching
                }}
                filterDefinitions={filterDefinitions}
                enableSearch={true}
                enableColumnVisibility={true}
                enableSorting={true}
                enablePinning={true}
                enableColumnOrdering={true}
                enableFiltering={true}
                enablePagination={true}
                enableExport={true}
                loading={isLoading}
            />

            {/* Create Category Modal */}
            <CategoryCreateModal 
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />

            {/* Edit Category Modal */}
            <CategoryEditModal 
                open={showEditModal}
                onOpenChange={setShowEditModal}
                category={selectedCategory}
            />
        </div>
    );
} 