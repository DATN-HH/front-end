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
import { Badge } from '@/components/ui/badge';
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
    Archive,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ProductModal, ProductEditModal } from '@/components/modals';

// Mock data - expanded for pagination demo
const allProducts = [
    {
        id: 1,
        name: 'Beef Pho',
        type: 'Consumable',
        price: 50000,
        cost: 30000,
        category: 'Main Course',
        posCategory: 'Pho',
        active: true,
        availableInPos: true,
        hasImage: true,
        createdAt: '2024-01-15',
    },
    {
        id: 2,
        name: 'Grilled Pork Vermicelli',
        type: 'Consumable',
        price: 45000,
        cost: 25000,
        category: 'Main Course',
        posCategory: 'Noodles',
        active: true,
        availableInPos: true,
        hasImage: false,
        createdAt: '2024-01-14',
    },
    {
        id: 3,
        name: 'Black Coffee',
        type: 'Consumable',
        price: 25000,
        cost: 8000,
        category: 'Beverages',
        posCategory: 'Coffee',
        active: false,
        availableInPos: false,
        hasImage: true,
        createdAt: '2024-01-13',
    },
    {
        id: 4,
        name: 'Grilled Pork Banh Mi',
        type: 'Consumable',
        price: 30000,
        cost: 15000,
        category: 'Main Course',
        posCategory: 'Banh Mi',
        active: true,
        availableInPos: true,
        hasImage: true,
        createdAt: '2024-01-12',
    },
    {
        id: 5,
        name: 'Iced Tea',
        type: 'Consumable',
        price: 10000,
        cost: 3000,
        category: 'Beverages',
        posCategory: 'Tea',
        active: true,
        availableInPos: true,
        hasImage: false,
        createdAt: '2024-01-11',
    },
    {
        id: 6,
        name: 'Broken Rice',
        type: 'Consumable',
        price: 40000,
        cost: 20000,
        category: 'Main Course',
        posCategory: 'Rice',
        active: true,
        availableInPos: true,
        hasImage: true,
        createdAt: '2024-01-10',
    },
    {
        id: 7,
        name: 'Avocado Smoothie',
        type: 'Consumable',
        price: 35000,
        cost: 18000,
        category: 'Beverages',
        posCategory: 'Smoothie',
        active: true,
        availableInPos: true,
        hasImage: false,
        createdAt: '2024-01-09',
    },
    {
        id: 8,
        name: 'Three-Color Dessert',
        type: 'Consumable',
        price: 20000,
        cost: 10000,
        category: 'Desserts',
        posCategory: 'Dessert',
        active: false,
        availableInPos: false,
        hasImage: true,
        createdAt: '2024-01-08',
    },
    {
        id: 9,
        name: 'Spring Rolls',
        type: 'Consumable',
        price: 25000,
        cost: 12000,
        category: 'Appetizers',
        posCategory: 'Rolls',
        active: true,
        availableInPos: true,
        hasImage: true,
        createdAt: '2024-01-07',
    },
    {
        id: 10,
        name: 'Grilled Meat',
        type: 'Consumable',
        price: 55000,
        cost: 35000,
        category: 'Main Course',
        posCategory: 'Grilled',
        active: true,
        availableInPos: true,
        hasImage: false,
        createdAt: '2024-01-06',
    },
];

type SortField = 'name' | 'price' | 'cost' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function ProductsPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        type: 'all',
        category: 'all',
        active: 'all',
        availableInPos: 'all',
    });
    const [showProductModal, setShowProductModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const { toast } = useToast();

    // Filter and sort logic
    const filteredAndSortedProducts = useMemo(() => {
        const filtered = allProducts.filter((product) => {
            const matchesSearch = product.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesType =
                filters.type === 'all' || product.type === filters.type;
            const matchesCategory =
                filters.category === 'all' ||
                product.category === filters.category;
            const matchesActive =
                filters.active === 'all' ||
                product.active.toString() === filters.active;
            const matchesPos =
                filters.availableInPos === 'all' ||
                product.availableInPos.toString() === filters.availableInPos;

            return (
                matchesSearch &&
                matchesType &&
                matchesCategory &&
                matchesActive &&
                matchesPos
            );
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
        filteredAndSortedProducts.length / itemsPerPage
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = filteredAndSortedProducts.slice(
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

    const handleArchive = (productId: number, productName: string) => {
        toast({
            title: 'Product Archived',
            description: `${productName} has been archived successfully.`,
        });
    };

    const handleEdit = (product: any) => {
        setSelectedProduct(product);
        setShowEditModal(true);
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 1000); // Convert VND to USD for display
    };

    const clearFilters = () => {
        setFilters({
            type: 'all',
            category: 'all',
            active: 'all',
            availableInPos: 'all',
        });
        setSearchTerm('');
        setCurrentPage(1);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Product Management
                    </h1>
                    <p className="text-muted-foreground">
                        Manage all products in the system
                    </p>
                </div>
                <Button onClick={() => setShowProductModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Product
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product List</CardTitle>
                    <CardDescription>
                        Showing {startIndex + 1}-
                        {Math.min(
                            startIndex + itemsPerPage,
                            filteredAndSortedProducts.length
                        )}
                        of {filteredAndSortedProducts.length} products
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Filters */}
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search products..."
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
                                                Product Type
                                            </label>
                                            <Select
                                                value={filters.type}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        type: value,
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
                                                    <SelectItem value="Consumable">
                                                        Consumable
                                                    </SelectItem>
                                                    <SelectItem value="Stockable">
                                                        Stockable
                                                    </SelectItem>
                                                    <SelectItem value="Service">
                                                        Service
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Category
                                            </label>
                                            <Select
                                                value={filters.category}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        category: value,
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
                                                    <SelectItem value="Main Course">
                                                        Main Course
                                                    </SelectItem>
                                                    <SelectItem value="Beverages">
                                                        Beverages
                                                    </SelectItem>
                                                    <SelectItem value="Appetizers">
                                                        Appetizers
                                                    </SelectItem>
                                                    <SelectItem value="Desserts">
                                                        Desserts
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Status
                                            </label>
                                            <Select
                                                value={filters.active}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        active: value,
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
                                                    <SelectItem value="true">
                                                        Active
                                                    </SelectItem>
                                                    <SelectItem value="false">
                                                        Archived
                                                    </SelectItem>
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
                                <TableHead>Image</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('name')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Product Name
                                        {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('price')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Sales Price
                                        {getSortIcon('price')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('cost')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Cost
                                        {getSortIcon('cost')}
                                    </Button>
                                </TableHead>
                                <TableHead>POS Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>POS</TableHead>
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
                            {paginatedProducts.map((product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <div className="w-10 h-10 bg-gray-100 rounded-md flex items-center justify-center">
                                            {product.hasImage ? (
                                                <ImageIcon className="h-6 w-6 text-gray-400" />
                                            ) : (
                                                <div className="w-8 h-8 bg-gray-200 rounded" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {product.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {product.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(product.price)}
                                    </TableCell>
                                    <TableCell>
                                        {formatCurrency(product.cost)}
                                    </TableCell>
                                    <TableCell>{product.posCategory}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.active
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.active
                                                ? 'Active'
                                                : 'Archived'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                product.availableInPos
                                                    ? 'default'
                                                    : 'secondary'
                                            }
                                        >
                                            {product.availableInPos
                                                ? 'Yes'
                                                : 'No'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(
                                            product.createdAt
                                        ).toLocaleDateString('en-US')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/app/menu/products/${product.id}/detail`}
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
                                                    handleEdit(product)
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
                                                            handleArchive(
                                                                product.id,
                                                                product.name
                                                            )
                                                        }
                                                    >
                                                        <Archive className="mr-2 h-4 w-4" />
                                                        {product.active
                                                            ? 'Archive'
                                                            : 'Unarchive'}
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

            <ProductModal
                open={showProductModal}
                onOpenChange={setShowProductModal}
            />
            <ProductEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                product={selectedProduct}
            />
        </div>
    );
}
