'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Plus,
    Search,
    MoreHorizontal,
    Edit,
    Trash2,
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Filter,
    ChevronLeft,
    ChevronRight,
    Eye,
    Layers,
} from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { PosCategoryModal, PosCategoryEditModal } from '@/components/modals';
import { 
    useAllPosCategories, 
    useDeletePosCategory, 
    useMoveCategorySequence,
    PosCategoryResponse 
} from '@/api/v1/menu/pos-categories';
import { Loader2 } from 'lucide-react';

type SortField = 'name' | 'sequence' | 'productsCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function PosCategoriesPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('sequence');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        parentCategory: 'all',
    });
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<PosCategoryResponse | null>(null);
    const { toast } = useToast();

    // API hooks
    const { data: allCategories = [], isLoading, error } = useAllPosCategories();
    const deletePosCategoryMutation = useDeletePosCategory();
    const moveCategoryMutation = useMoveCategorySequence();

    // Filter and sort logic
    const filteredAndSortedCategories = useMemo(() => {
        const filtered = allCategories.filter((category) => {
            const matchesSearch = category.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesParent =
                filters.parentCategory === 'all' ||
                (filters.parentCategory === 'root'
                    ? !category.parentName
                    : category.parentName === filters.parentCategory);

            return matchesSearch && matchesParent;
        });

        // Sort
        filtered.sort((a, b) => {
            let aValue: any = a[sortField];
            let bValue: any = b[sortField];

            if (sortField === 'createdAt') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [searchTerm, sortField, sortDirection, filters]);

    // Pagination logic
    const totalPages = Math.ceil(
        filteredAndSortedCategories.length / itemsPerPage
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedCategories = filteredAndSortedCategories.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getSortIcon = (field: SortField) => {
        if (sortField !== field)
            return <ArrowUpDown className="ml-2 h-4 w-4" />;
        return sortDirection === 'asc' ? (
            <ArrowUp className="ml-2 h-4 w-4" />
        ) : (
            <ArrowDown className="ml-2 h-4 w-4" />
        );
    };

    const handleDelete = async (categoryId: number, categoryName: string) => {
        if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await deletePosCategoryMutation.mutateAsync(categoryId);
            toast({
                title: 'Category Deleted',
                description: `${categoryName} has been deleted successfully.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleMoveUp = async (categoryId: number, categoryName: string) => {
        try {
            await moveCategoryMutation.mutateAsync({ id: categoryId, direction: 'up' });
            toast({
                title: 'Moved Up',
                description: `${categoryName} has been moved up.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to move category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleMoveDown = async (categoryId: number, categoryName: string) => {
        try {
            await moveCategoryMutation.mutateAsync({ id: categoryId, direction: 'down' });
            toast({
                title: 'Moved Down',
                description: `${categoryName} has been moved down.`,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to move category. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (category: any) => {
        setSelectedCategory(category);
        setShowEditModal(true);
    };

    const clearFilters = () => {
        setFilters({
            parentCategory: 'all',
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    // Get unique parent categories for filter dropdown
    const uniqueParentCategories = useMemo(() => {
        const parents = allCategories
            .map(cat => cat.parentName)
            .filter((name): name is string => name !== null && name !== undefined);
        return [...new Set(parents)];
    }, [allCategories]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={Layers}
                    title="POS Categories"
                    description="Manage product categories displayed on Point of Sale"
                />
                <div className="flex items-center justify-center min-h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading categories...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="space-y-6">
                <PageTitle
                    icon={Layers}
                    title="POS Categories"
                    description="Manage product categories displayed on Point of Sale"
                />
                <div className="text-center text-red-500 min-h-[400px] flex items-center justify-center">
                    Failed to load categories. Please try again.
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Layers}
                title="POS Categories"
                description="Manage product categories displayed on Point of Sale"
                left={
                    <Button onClick={() => setShowCategoryModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Category
                    </Button>
                }
            />

            <Card>
                <CardHeader>
                    <CardTitle>POS Category List</CardTitle>
                    <CardDescription>
                        Showing {startIndex + 1}-
                        {Math.min(
                            startIndex + itemsPerPage,
                            filteredAndSortedCategories.length
                        )}
                        of {filteredAndSortedCategories.length} categories
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Filters */}
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search categories..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="pl-8"
                                />
                            </div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline">
                                        <Filter className="mr-2 h-4 w-4" />
                                        Filters
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56"
                                >
                                    <DropdownMenuLabel>
                                        Filters
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <div className="p-2 space-y-2">
                                        <div>
                                            <label className="text-sm font-medium">
                                                Category Level
                                            </label>
                                            <Select
                                                value={filters.parentCategory}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        parentCategory: value,
                                                    })
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="root">
                                                        Root Categories
                                                    </SelectItem>
                                                    {uniqueParentCategories.map((parentName) => (
                                                        <SelectItem key={parentName} value={parentName}>
                                                            Children of {parentName}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={clearFilters}>
                                        Clear all filters
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('name')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Category Name
                                        {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>Parent Category</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('sequence')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Sequence
                                        {getSortIcon('sequence')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            handleSort('productsCount')
                                        }
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Product Count
                                        {getSortIcon('productsCount')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('createdAt')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Created Date
                                        {getSortIcon('createdAt')}
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedCategories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell className="font-medium">
                                        {category.parentName && (
                                            <span className="text-gray-400 mr-2">
                                                └─
                                            </span>
                                        )}
                                        {category.name}
                                    </TableCell>
                                    <TableCell>
                                        {category.parentName || '—'}
                                    </TableCell>
                                    <TableCell>{category.sequence}</TableCell>
                                    <TableCell>
                                        {category.productsCount}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(
                                            category.createdAt
                                        ).toLocaleDateString('en-US')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/app/menu/pos-categories/${category.id}/detail`}
                                            >
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleEdit(category)
                                                }
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleMoveUp(
                                                                category.id,
                                                                category.name
                                                            )
                                                        }
                                                        disabled={moveCategoryMutation.isPending}
                                                    >
                                                        <ArrowUp className="mr-2 h-4 w-4" />
                                                        Move Up
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleMoveDown(
                                                                category.id,
                                                                category.name
                                                            )
                                                        }
                                                        disabled={moveCategoryMutation.isPending}
                                                    >
                                                        <ArrowDown className="mr-2 h-4 w-4" />
                                                        Move Down
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            handleDelete(
                                                                category.id,
                                                                category.name
                                                            )
                                                        }
                                                        disabled={deletePosCategoryMutation.isPending}
                                                        className="text-red-600"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    <div className="flex items-center justify-between space-x-2 py-4">
                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">Show</p>
                            <Select
                                value={itemsPerPage.toString()}
                                onValueChange={(value) => {
                                    setItemsPerPage(Number(value));
                                    setCurrentPage(1);
                                }}
                            >
                                <SelectTrigger className="h-8 w-[70px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 50].map((pageSize) => (
                                        <SelectItem
                                            key={pageSize}
                                            value={pageSize.toString()}
                                        >
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-sm font-medium">items</p>
                        </div>

                        <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium">
                                Page {currentPage} of {totalPages}
                            </p>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.max(1, currentPage - 1)
                                        )
                                    }
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setCurrentPage(
                                            Math.min(
                                                totalPages,
                                                currentPage + 1
                                            )
                                        )
                                    }
                                    disabled={currentPage === totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <PosCategoryModal
                open={showCategoryModal}
                onOpenChange={setShowCategoryModal}
            />
            <PosCategoryEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                category={selectedCategory}
            />
        </div>
    );
}
