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
    Package,
} from 'lucide-react';
import { ImageIcon } from 'lucide-react';
import { PageTitle } from '@/components/layouts/app-section/page-title';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { ProductModal, ProductEditModal } from '@/components/modals';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition } from '@/components/common/Table/types';
import { SearchCondition } from '@/lib/response-object';
import { OperandType } from '@/components/common/Table/types';

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
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');
    const [total, setTotal] = useState(allProducts.length);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const { toast } = useToast();

    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'type',
            label: 'Type',
            type: OperandType.ENUM,
            options: [
                { value: 'Consumable', label: 'Consumable' },
                { value: 'Service', label: 'Service' },
            ],
        },
        {
            field: 'category',
            label: 'Category',
            type: OperandType.ENUM,
            options: [
                { value: 'Main Course', label: 'Main Course' },
                { value: 'Beverages', label: 'Beverages' },
                { value: 'Desserts', label: 'Desserts' },
                { value: 'Appetizers', label: 'Appetizers' },
            ],
        },
        {
            field: 'active',
            label: 'Status',
            type: OperandType.BOOLEAN,
        },
        {
            field: 'availableInPos',
            label: 'Available in POS',
            type: OperandType.BOOLEAN,
        },
    ];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Product Name',
        },
        {
            accessorKey: 'type',
            header: 'Type',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.type}</Badge>
            ),
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }) => formatCurrency(row.original.price),
        },
        {
            accessorKey: 'cost',
            header: 'Cost',
            cell: ({ row }) => formatCurrency(row.original.cost),
        },
        {
            accessorKey: 'category',
            header: 'Category',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.category}</Badge>
            ),
        },
        {
            accessorKey: 'posCategory',
            header: 'POS Category',
            cell: ({ row }) => (
                <Badge variant="secondary">{row.original.posCategory}</Badge>
            ),
        },
        {
            accessorKey: 'active',
            header: 'Status',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.active ? 'default' : 'secondary'}
                >
                    {row.original.active ? 'Active' : 'Inactive'}
                </Badge>
            ),
        },
        {
            accessorKey: 'availableInPos',
            header: 'POS',
            cell: ({ row }) => (
                <Badge
                    variant={row.original.availableInPos ? 'default' : 'secondary'}
                >
                    {row.original.availableInPos ? 'Yes' : 'No'}
                </Badge>
            ),
        },
        {
            accessorKey: 'hasImage',
            header: 'Image',
            cell: ({ row }) => (
                <div className="flex justify-center">
                    {row.original.hasImage ? (
                        <ImageIcon className="h-4 w-4" />
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: 'createdAt',
            header: 'Created Date',
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <Link href={`/app/menu/products/${row.original.id}/detail`}>
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
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() =>
                                handleArchive(row.original.id, row.original.name)
                            }
                        >
                            <Archive className="h-4 w-4 mr-1" />
                            Archive
                        </Button>
                    </div>
                );
            },
        },
    ];

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
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    return (
        <div className="space-y-6">
            <PageTitle
                icon={Package}
                title="Products"
                description="Manage your restaurant's products"
                left={
                    <Button onClick={() => setShowProductModal(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create New Product
                    </Button>
                }
            />

            <DataTable
                columns={columns}
                data={allProducts}
                pageIndex={pageIndex}
                pageSize={pageSize}
                total={total}
                tableId="products-table"
                filterDefinitions={filterDefinitions}
                onSearchChange={(search) => {
                    setKeyword(search);
                }}
                onPaginationChange={(pageIndex: number, pageSize: number) => {
                    setPageIndex(pageIndex);
                    setPageSize(pageSize);
                }}
                onSortingChange={(sorting) => {
                    setSorting(sorting);
                }}
                onFilterChange={(filters: any) => {
                    setColumnFilters(filters);
                }}
                currentSorting={sorting}
            />

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
