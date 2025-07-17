'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Edit,
    Archive,
    Tag,
    TrendingUp,
} from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { useToast } from '@/hooks/use-toast';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition } from '@/components/common/Table/types';
import { OperandType } from '@/components/common/Table/types';
import { 
    useTagList, 
    useUpdateTag,
    usePopularTags,
    ProductTagListParams,
    ProductTagResponse,
    TagStatus
} from '@/api/v1/menu/product-tags';
import { TagCreateModal } from '@/components/modals/TagCreateModal';
import { TagEditModal } from '@/components/modals/TagEditModal';

export default function TagsPage() {
    const { toast } = useToast();
    
    // State for table controls
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(25);
    const [keyword, setKeyword] = useState('');
    const [activeOnly, setActiveOnly] = useState(true);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<any[]>([]);
    
    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedTag, setSelectedTag] = useState<ProductTagResponse | null>(null);

    // Build API parameters using /api/menu/tags/list
    const apiParams: ProductTagListParams = useMemo(() => {
        const [sortField, sortDirection] = sorting ? sorting.split(':') : ['name', 'asc'];
        
        const params: ProductTagListParams = {
            page: pageIndex,
            size: pageSize,
            search: keyword || undefined,
            activeOnly: activeOnly,
            sort: sortField || 'name',
            direction: (sortDirection as 'asc' | 'desc') || 'asc',
        };
        return params;
    }, [pageIndex, pageSize, keyword, activeOnly, sorting]);

    // API hooks
    const { data: tagData, isLoading, error } = useTagList(apiParams);
    const { data: popularTags } = usePopularTags(5);
    const updateTagMutation = useUpdateTag();

    // Extract data from API response
    const tags = tagData?.content || [];
    const totalElements = tagData?.totalElements || 0;

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
    ];

    // Event handlers using update API to toggle status between ACTIVE/INACTIVE
    const handleToggleStatus = async (tag: ProductTagResponse) => {
        try {
            const newStatus = tag.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateTagMutation.mutateAsync({
                id: tag.id,
                data: { 
                    name: tag.name,
                    color: tag.color,
                    description: tag.description,
                    status: newStatus 
                }
            });
            
            const action = newStatus === 'ACTIVE' ? 'activated' : 'deactivated';
            toast({
                title: 'Status Updated',
                description: `${tag.name} has been ${action} successfully.`,
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.response?.data?.message || 'Failed to update tag status. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (tag: ProductTagResponse) => {
        setSelectedTag(tag);
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

    const getStatusBadge = (status: TagStatus) => {
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

    const getTagColorDisplay = (tag: ProductTagResponse) => {
        if (!tag.color) return null;
        return (
            <div className="flex items-center space-x-2">
                <div 
                    className="w-4 h-4 rounded border border-gray-300"
                    style={{ backgroundColor: tag.color }}
                    title={tag.color}
                />
                <span className="text-sm font-mono text-gray-500">{tag.color}</span>
            </div>
        );
    };

    // Table columns
    const columns: ColumnDef<ProductTagResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Tag Name',
            cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    <Tag className="h-4 w-4 text-blue-500" />
                    <div>
                        <div className="font-medium">{row.original.name}</div>
                        {row.original.description && (
                            <div className="text-sm text-gray-500 max-w-[200px] truncate">
                                {row.original.description}
                            </div>
                        )}
                    </div>
                </div>
            ),
        },
        {
            accessorKey: 'color',
            header: 'Color',
            cell: ({ row }) => getTagColorDisplay(row.original),
        },
        {
            accessorKey: 'productCount',
            header: 'Products',
            cell: ({ row }) => (
                <div className="text-center">
                    <Badge variant="outline">
                        {row.original.productCount || 0}
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
                            disabled={updateTagMutation.isPending}
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
                    icon={Tag}
                    title="Product Tags"
                    left={
                        <Button onClick={() => window.location.reload()}>
                            <Plus className="mr-2 h-4 w-4" />
                            Retry
                        </Button>
                    }
                />
                <div className="text-center text-red-500">
                    Error loading tags: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Tag}
                title="Product Tags"
                left={
                    <div className="flex gap-2">
                        <Button onClick={() => setShowCreateModal(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Create New Tag
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => setActiveOnly(!activeOnly)}
                            className={!activeOnly ? 'bg-red-50 text-red-700' : ''}
                        >
                            <Archive className="mr-2 h-4 w-4" />
                            {activeOnly ? 'Show All' : 'Show Active Only'}
                        </Button>
                    </div>
                }
            />

            {/* Popular Tags Section */}
            {popularTags && popularTags.length > 0 && (
                <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center space-x-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        <h3 className="font-medium">Most Used Tags</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag) => (
                            <Badge 
                                key={tag.id} 
                                variant="outline"
                                className="cursor-pointer hover:bg-gray-50"
                                onClick={() => handleEdit(tag)}
                                style={{ 
                                    borderColor: tag.color || undefined,
                                    color: tag.color || undefined 
                                }}
                            >
                                {tag.name} ({tag.productCount})
                            </Badge>
                        ))}
                    </div>
                </div>
            )}

            <DataTable
                columns={columns}
                data={tags}
                tableId="tags-table"
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

            {/* Create Tag Modal */}
            <TagCreateModal 
                open={showCreateModal}
                onOpenChange={setShowCreateModal}
            />

            {/* Edit Tag Modal */}
            <TagEditModal 
                open={showEditModal}
                onOpenChange={setShowEditModal}
                tag={selectedTag}
            />
        </div>
    );
}