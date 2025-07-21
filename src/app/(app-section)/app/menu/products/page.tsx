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
  Image as ImageLucide,
  ChevronRight,
  Tag,
  X,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import { useAllTags, ProductTagResponse } from '@/api/v1/menu/product-tags';
import {
  useProductList,
  useGroupedProductList,
  useArchiveProduct,
  useUnarchiveProduct,
  ProductListParams,
  ProductGroupedParams,
  ProductListResponse,
  ProductType,
} from '@/api/v1/menu/products';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition, OperandType } from '@/components/common/Table/types';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { ProductEditModalNew } from '@/components/modals';
import { ProductCreateModal } from '@/components/modals/ProductCreateModal';
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

type ViewMode = 'table' | 'card' | 'grouped';

export default function ProductsPage() {
  const { toast } = useToast();

  // State for table controls
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [keyword, setKeyword] = useState('');
  const [selectedType, setSelectedType] = useState<ProductType | ''>('');
  const [canBeSold, setCanBeSold] = useState<boolean | undefined>(undefined);
  const [archived, setArchived] = useState(false);
  const [selectedTags, setSelectedTags] = useState<ProductTagResponse[]>([]);
  const [sorting, setSorting] = useState<string>('');
  const [columnFilters, setColumnFilters] = useState<any[]>([]);

  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Grouped view state
  const [groupBy, setGroupBy] = useState<string>('category');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  // Build API parameters
  const apiParams: ProductListParams = useMemo(() => {
    const [sortField, sortDirection] = sorting
      ? sorting.split(':')
      : ['name', 'asc'];

    const params: ProductListParams = {
      page: pageIndex,
      size: pageSize,
      search: keyword || undefined,
      type: selectedType || undefined,
      canBeSold,
      archived,
      sort: sortField || 'name',
      direction: (sortDirection as 'asc' | 'desc') || 'asc',
    };
    return params;
  }, [
    pageIndex,
    pageSize,
    keyword,
    selectedType,
    canBeSold,
    archived,
    sorting,
  ]);

  // Build grouped API parameters
  const groupedApiParams: ProductGroupedParams = useMemo(() => {
    const params: ProductGroupedParams = {
      search: keyword || undefined,
      type: selectedType || undefined,
      canBeSold,
      archived,
      groupBy,
    };
    return params;
  }, [keyword, selectedType, canBeSold, archived, groupBy]);

  // API hooks
  const { data: productData, isLoading, error } = useProductList(apiParams);
  const {
    data: groupedData,
    isLoading: groupedLoading,
    error: groupedError,
  } = useGroupedProductList(groupedApiParams);
  const { data: allTags = [] } = useAllTags();
  const archiveProductMutation = useArchiveProduct();
  const unarchiveProductMutation = useUnarchiveProduct();

  // Extract data from API response
  const products = productData?.content || [];
  const totalElements = productData?.totalElements || 0;
  const totalPages = productData?.totalPages || 0;

  // Group management functions
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  const expandAllGroups = () => {
    if (groupedData) {
      setExpandedGroups(new Set(groupedData.map((group) => group.groupKey)));
    }
  };

  const collapseAllGroups = () => {
    setExpandedGroups(new Set());
  };

  // Filter definitions for DataTable
  const filterDefinitions: FilterDefinition[] = [
    {
      field: 'type',
      label: 'Type',
      type: OperandType.ENUM,
      options: [
        { label: 'Consumable', value: 'CONSUMABLE' },
        { label: 'Stockable', value: 'STOCKABLE' },
        { label: 'Service', value: 'SERVICE' },
        { label: 'Extra', value: 'EXTRA' },
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

  // Event handlers
  const handleArchive = async (productId: number, productName: string) => {
    try {
      await archiveProductMutation.mutateAsync(productId);
      toast({
        title: 'Product Archived',
        description: `${productName} has been archived successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to archive product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUnarchive = async (productId: number, productName: string) => {
    try {
      await unarchiveProductMutation.mutateAsync(productId);
      toast({
        title: 'Product Unarchived',
        description: `${productName} has been unarchived successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to unarchive product. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
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

  const getTypeBadge = (type: ProductType) => {
    const typeColors = {
      CONSUMABLE: 'bg-blue-100 text-blue-800',
      STOCKABLE: 'bg-green-100 text-green-800',
      SERVICE: 'bg-purple-100 text-purple-800',
      EXTRA: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={typeColors[type] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  // Table columns
  const columns: ColumnDef<ProductListResponse>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            {row.original.image ? (
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100">
                <Image
                  src={row.original.image}
                  alt={row.original.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center">
                <ImageLucide className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-gray-500">
              {row.original.internalReference || '-'}
            </div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => getTypeBadge(row.original.type),
    },
    {
      accessorKey: 'categoryName',
      header: 'Category',
      cell: ({ row }) => row.original.categoryName || '-',
    },
    {
      accessorKey: 'price',
      header: 'Sale Price',
      cell: ({ row }) => formatCurrency(row.original.price),
    },
    {
      accessorKey: 'cost',
      header: 'Cost',
      cell: ({ row }) => formatCurrency(row.original.cost),
    },
    {
      accessorKey: 'size',
      header: 'Size',
      cell: ({ row }) => row.original.size || '-',
    },
    {
      accessorKey: 'canBeSold',
      header: 'Can Be Sold',
      cell: ({ row }) => (
        <Badge variant={row.original.canBeSold ? 'default' : 'secondary'}>
          {row.original.canBeSold ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      accessorKey: 'stockQuantity',
      header: 'Stock',
      cell: ({ row }) => {
        const stock = row.original.stockQuantity;
        const threshold = row.original.stockThreshold;

        if (stock === undefined) return '-';

        const isLowStock = threshold && stock <= threshold;
        return (
          <Badge variant={isLowStock ? 'destructive' : 'default'}>
            {stock}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isArchived = row.original.status === 'DELETED';

        return (
          <div className="flex gap-2">
            <Link href={`/app/menu/products/${row.original.id}/detail`}>
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </Link>
            {!isArchived && (
              <>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingProductId(row.original.id);
                    setShowEditModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-500"
                  onClick={() =>
                    handleArchive(row.original.id, row.original.name)
                  }
                  disabled={archiveProductMutation.isPending}
                >
                  <Archive className="h-4 w-4 mr-1" />
                  Archive
                </Button>
              </>
            )}
            {isArchived && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleUnarchive(row.original.id, row.original.name)
                }
                disabled={unarchiveProductMutation.isPending}
              >
                Unarchive
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Card View Component
  const ProductCard = ({ product }: { product: ProductListResponse }) => {
    const isArchived = product.status === 'DELETED';
    const stock = product.stockQuantity;
    const threshold = product.stockThreshold;
    const isLowStock = threshold && stock !== undefined && stock <= threshold;

    return (
      <Card className="hover:shadow-md transition-shadow overflow-hidden flex flex-col h-[400px]">
        {/* Image Section - Takes up half the card */}
        <div className="relative h-48 bg-gray-100 flex-shrink-0">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageLucide className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Status Badge Overlay */}
          <div className="absolute top-3 right-3">
            {getStatusBadge(product.status)}
          </div>
        </div>

        {/* Content Section - Takes up the other half */}
        <div className="flex-1 flex flex-col min-h-0">
          <CardHeader className="pb-2 flex-shrink-0">
            <CardTitle className="text-base font-semibold line-clamp-2 leading-tight">
              {product.name}
            </CardTitle>
            <CardDescription className="text-sm truncate">
              {product.internalReference || 'No reference'}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
            {/* Scrollable content area */}
            <div className="flex-1 space-y-2 min-h-0 overflow-y-auto">
              {/* Type and Category */}
              <div className="flex items-center justify-between">
                {getTypeBadge(product.type)}
                <span className="text-xs text-gray-500 truncate ml-2">
                  {product.categoryName || 'No category'}
                </span>
              </div>

              {/* Pricing */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500 text-xs">Sale Price:</span>
                  <div className="font-medium text-sm">
                    {formatCurrency(product.price)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 text-xs">Cost:</span>
                  <div className="font-medium text-sm">
                    {formatCurrency(product.cost)}
                  </div>
                </div>
              </div>

              {/* Stock and Sales Info */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 text-xs">Stock:</span>
                  {stock !== undefined ? (
                    <Badge
                      variant={isLowStock ? 'destructive' : 'default'}
                      className="text-xs"
                    >
                      {stock}
                    </Badge>
                  ) : (
                    <span className="text-xs">-</span>
                  )}
                </div>
                <Badge
                  variant={product.canBeSold ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {product.canBeSold ? 'Can Sell' : 'No Sell'}
                </Badge>
              </div>

              {/* Size */}
              {product.size && (
                <div className="text-sm">
                  <span className="text-gray-500 text-xs">Size: </span>
                  <span className="font-medium text-sm">{product.size}</span>
                </div>
              )}
            </div>

            {/* Actions - Always at bottom */}
            <div className="space-y-2 mt-3 flex-shrink-0">
              <div className="flex gap-2">
                <Link
                  href={`/app/menu/products/${product.id}/detail`}
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full h-8">
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                </Link>
                {!isArchived && (
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingProductId(product.id);
                      setShowEditModal(true);
                    }}
                    className="flex-1 h-8"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              {/* Archive/Unarchive */}
              {!isArchived ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-red-500 h-8"
                  onClick={() => handleArchive(product.id, product.name)}
                  disabled={archiveProductMutation.isPending}
                >
                  <Archive className="h-3 w-3 mr-1" />
                  Archive
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-8"
                  onClick={() => handleUnarchive(product.id, product.name)}
                  disabled={unarchiveProductMutation.isPending}
                >
                  Unarchive
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  };

  // Grouped View Component
  const GroupedView = () => {
    if (groupedLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j} className="animate-pulse">
                      <div className="h-32 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      );
    }

    if (groupedError || !groupedData) {
      return (
        <div className="text-center text-red-500 py-8">
          Error loading grouped products: {groupedError?.message}
        </div>
      );
    }

    if (groupedData.length === 0) {
      return (
        <div className="text-center py-8">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-500">
            Try adjusting your filters or create a new product.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {groupedData.map((group) => {
          const isExpanded = expandedGroups.has(group.groupKey);

          return (
            <Card key={group.groupKey} className="overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleGroup(group.groupKey)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {group.groupName || group.groupKey}
                      </CardTitle>
                      <CardDescription>
                        {group.totalCount}{' '}
                        {group.totalCount === 1 ? 'product' : 'products'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {group.totalCount}
                  </Badge>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {group.products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <PageTitle
          icon={Package}
          title="Products"
          left={
            <Button onClick={() => window.location.reload()}>
              <Plus className="mr-2 h-4 w-4" />
              Retry
            </Button>
          }
        />
        <div className="text-center text-red-500">
          Error loading products: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        icon={Package}
        title="Products"
        left={
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Product
            </Button>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md overflow-hidden">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4 mr-2" />
                Table
              </Button>
              <Button
                variant={viewMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('card')}
                className="rounded-none border-0"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant={viewMode === 'grouped' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grouped')}
                className="rounded-none border-0"
              >
                <Package className="h-4 w-4 mr-2" />
                Groups
              </Button>
            </div>

            {/* Group By Selector - only show for grouped view */}
            {viewMode === 'grouped' && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Group by:</span>
                <select
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="category">Category</option>
                  <option value="type">Product Type</option>
                  <option value="status">Status</option>
                  <option value="canBeSold">Can Be Sold</option>
                  <option value="groupName">Custom Group</option>
                </select>
              </div>
            )}
          </div>
        }
      />

      {/* Tag Filter Section */}
      {allTags.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <Tag className="h-5 w-5 text-blue-500" />
            <h3 className="font-medium">Filter by Tags</h3>
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3 p-2 bg-blue-50 rounded">
              {selectedTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="default"
                  className="flex items-center space-x-1"
                  style={{
                    backgroundColor: tag.color || undefined,
                    borderColor: tag.color || undefined,
                  }}
                >
                  <span>{tag.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() =>
                      setSelectedTags((prev) =>
                        prev.filter((t) => t.id !== tag.id)
                      )
                    }
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}

          {/* Available Tags */}
          <div className="flex flex-wrap gap-2">
            {allTags
              .filter(
                (tag) =>
                  !selectedTags.some((selected) => selected.id === tag.id)
              )
              .map((tag) => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedTags((prev) => [...prev, tag])}
                  style={{
                    borderColor: tag.color || undefined,
                    color: tag.color || undefined,
                  }}
                >
                  {tag.name}
                  {tag.productCount !== undefined && ` (${tag.productCount})`}
                </Badge>
              ))}
          </div>
        </div>
      )}

      {/* Group Controls - only show for grouped view */}
      {viewMode === 'grouped' && groupedData && groupedData.length > 0 && (
        <div className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg">
          <div className="text-sm text-gray-600">
            {groupedData.length} groups •{' '}
            {groupedData.reduce((sum, group) => sum + group.totalCount, 0)}{' '}
            total products
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAllGroups}
              disabled={expandedGroups.size === groupedData.length}
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAllGroups}
              disabled={expandedGroups.size === 0}
            >
              Collapse All
            </Button>
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={products}
          tableId="products-table"
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
      ) : viewMode === 'card' ? (
        <div className="space-y-4">
          {/* Search and Filter Bar for Card View */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPageIndex(0);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value as ProductType | '');
                  setPageIndex(0);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="CONSUMABLE">Consumable</option>
                <option value="STOCKABLE">Stockable</option>
                <option value="SERVICE">Service</option>
                <option value="EXTRA">Extra</option>
              </select>
            </div>
            <div className="text-sm text-gray-500">
              {totalElements} products found
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="h-64">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination for Card View */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Page {pageIndex + 1} of {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
                      disabled={pageIndex === 0}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPageIndex(Math.min(totalPages - 1, pageIndex + 1))
                      }
                      disabled={pageIndex >= totalPages - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Search and Filter Bar for Grouped View */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Search products..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedType}
                onChange={(e) =>
                  setSelectedType(e.target.value as ProductType | '')
                }
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="CONSUMABLE">Consumable</option>
                <option value="STOCKABLE">Stockable</option>
                <option value="SERVICE">Service</option>
                <option value="EXTRA">Extra</option>
              </select>
            </div>
          </div>

          <GroupedView />
        </div>
      )}

      <ProductCreateModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {editingProductId && (
        <ProductEditModalNew
          open={showEditModal}
          onOpenChange={(open) => {
            setShowEditModal(open);
            if (!open) {
              setEditingProductId(null);
            }
          }}
          productId={editingProductId}
        />
      )}
    </div>
  );
}
