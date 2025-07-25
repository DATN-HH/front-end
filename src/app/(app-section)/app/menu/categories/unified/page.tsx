'use client';

import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Layers,
  List,
  TreePine,
  Filter,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo } from 'react';

import {
  useAllCategories,
  useCategoryHierarchy,
  useDeleteCategory,
  useUpdateCategorySequence,
  CategoryResponse,
} from '@/api/v1/menu/categories';
import { CategoryHierarchyTree } from '@/components/category/CategoryHierarchyTree';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import { CategoryCreateModal } from '@/components/modals/CategoryCreateModal';
import { CategoryEditModal } from '@/components/modals/CategoryEditModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'list' | 'hierarchy';
type SortField = 'name' | 'sequence' | 'productsCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function UnifiedCategoriesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [filters, setFilters] = useState({
    parentCategory: 'all',
    migrationSource: 'all', // all, original, migrated
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryResponse | null>(null);
  const [parentCategoryForCreate, setParentCategoryForCreate] =
    useState<CategoryResponse | null>(null);
  const { toast } = useToast();

  // API hooks
  const {
    data: allCategories = [],
    isLoading: isLoadingList,
    error: listError,
  } = useAllCategories();

  const {
    data: hierarchyCategories = [],
    isLoading: isLoadingHierarchy,
    error: hierarchyError,
  } = useCategoryHierarchy();

  const deleteCategory = useDeleteCategory();
  const updateSequence = useUpdateCategorySequence();

  const isLoading = isLoadingList || isLoadingHierarchy;
  const error = listError || hierarchyError;

  // Filter and sort logic for list view
  const filteredAndSortedCategories = useMemo(() => {
    const filtered = allCategories.filter((category) => {
      const matchesSearch = category.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const matchesParent =
        filters.parentCategory === 'all' ||
        (filters.parentCategory === 'root'
          ? !category.parentId
          : filters.parentCategory === 'child'
            ? !!category.parentId
            : true);

        const matchesMigration =
            filters.migrationSource === 'all' ||
            (filters.migrationSource === 'original'
                ? !category.migrationSource || category.migrationSource === null
                : filters.migrationSource === 'migrated'
                  ? category.migrationSource === 'POS_CATEGORY'
                  : true);

      return matchesSearch && matchesParent && matchesMigration;
    });

    return filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'sequence':
          aValue = a.sequence || 0;
          bValue = b.sequence || 0;
          break;
        case 'productsCount':
          aValue = a.productsCount || 0;
          bValue = b.productsCount || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [allCategories, searchTerm, sortField, sortDirection, filters]);

  const handleEdit = (category: CategoryResponse) => {
    setSelectedCategory(category);
    setShowEditModal(true);
  };

  const handleDelete = async (category: CategoryResponse) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        await deleteCategory.mutateAsync(category.id);
        toast({
          title: 'Category Deleted',
          description: `${category.name} has been deleted successfully.`,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete category. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500">Error loading categories</p>
          <p className="text-sm text-gray-500">
            Please try refreshing the page
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <PageTitle title="Categories" />
        <p className="text-muted-foreground">
          Manage your product categories with hierarchy support
        </p>
      </div>



      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              List
            </Button>
            <Button
              variant={viewMode === 'hierarchy' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('hierarchy')}
            >
              <TreePine className="h-4 w-4 mr-2" />
              Hierarchy
            </Button>
          </div>
        </div>

        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Parent Filter */}
            <Select
              value={filters.parentCategory}
              onValueChange={(value) =>
                setFilters({ ...filters, parentCategory: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="root">Root Categories</SelectItem>
                <SelectItem value="child">Child Categories</SelectItem>
              </SelectContent>
            </Select>

            {/* Migration Source Filter */}
            <Select
              value={filters.migrationSource}
              onValueChange={(value) =>
                setFilters({ ...filters, migrationSource: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="original">Original Categories</SelectItem>
                <SelectItem value="migrated">Migrated from POS</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={`${sortField}:${sortDirection}`}
              onValueChange={(value) => {
                const [field, direction] = value.split(':') as [
                  SortField,
                  SortDirection,
                ];
                setSortField(field);
                setSortDirection(direction);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name:asc">Name (A-Z)</SelectItem>
                <SelectItem value="name:desc">Name (Z-A)</SelectItem>
                <SelectItem value="sequence:asc">
                  Sequence (Low-High)
                </SelectItem>
                <SelectItem value="sequence:desc">
                  Sequence (High-Low)
                </SelectItem>
                <SelectItem value="productsCount:desc">
                  Most Products
                </SelectItem>
                <SelectItem value="createdAt:desc">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as ViewMode)}
      >
        <TabsList>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Categories List</CardTitle>
              <CardDescription>
                {filteredAndSortedCategories.length} categories found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAndSortedCategories.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No categories found</p>
                  <p className="text-sm text-gray-400">
                    Try adjusting your search or filters
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAndSortedCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h3 className="font-medium">{category.name}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              {category.code && (
                                <Badge variant="outline" className="text-xs">
                                  {category.code}
                                </Badge>
                              )}
                              {category.migrationSource === 'POS_CATEGORY' && (
                                <Badge variant="secondary" className="text-xs">
                                  Migrated
                                </Badge>
                              )}
                              {category.parentName && (
                                <Badge variant="outline" className="text-xs">
                                  Child of {category.parentName}
                                </Badge>
                              )}
                              {category.isRoot && (
                                <Badge variant="default" className="text-xs">
                                  Root
                                </Badge>
                              )}
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-500 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right text-sm">
                          <p className="font-medium">
                            {category.productsCount || 0} products
                          </p>
                          {category.childrenCount &&
                            category.childrenCount > 0 && (
                              <p className="text-gray-500">
                                {category.childrenCount} children
                              </p>
                            )}
                          {category.sequence !== undefined && (
                            <p className="text-gray-500">
                              Seq: {category.sequence}
                            </p>
                          )}
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEdit(category)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/app/menu/categories/${category.id}/detail`}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(category)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Hierarchy</CardTitle>
              <CardDescription>
                {hierarchyCategories.length} root categories with nested
                structure
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CategoryHierarchyTree
                categories={hierarchyCategories}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddChild={(parentCategory) => {
                  // Set parent for new category
                  setParentCategoryForCreate(parentCategory);
                  setShowCreateModal(true);
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CategoryCreateModal
        open={showCreateModal}
        onOpenChange={(open) => {
          setShowCreateModal(open);
          if (!open) {
            setParentCategoryForCreate(null);
          }
        }}
        parentCategory={parentCategoryForCreate}
      />

      <CategoryEditModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        category={selectedCategory}
      />
    </div>
  );
}
