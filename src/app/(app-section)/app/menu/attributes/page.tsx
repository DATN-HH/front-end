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
    Trash2,
    Eye,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Filter,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { AttributeModal, AttributeEditModal } from '@/components/modals';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/Table/DataTable';
import { FilterDefinition } from '@/components/common/Table/types';
import { SearchCondition } from '@/lib/response-object';
import { OperandType } from '@/components/common/Table/types';

// Mock data - expanded
const allAttributes = [
    {
        id: 1,
        name: 'Pizza Size',
        displayType: 'Radio',
        creationMode: 'Instantly',
        valueCount: 3,
        values: ['Small', 'Medium', 'Large'],
        createdAt: '2024-01-15',
    },
    {
        id: 2,
        name: 'Spice Level',
        displayType: 'Select',
        creationMode: 'Instantly',
        valueCount: 4,
        values: ['No Spice', 'Mild', 'Medium', 'Very Spicy'],
        createdAt: '2024-01-14',
    },
    {
        id: 3,
        name: 'Color',
        displayType: 'Color',
        creationMode: 'Dynamically',
        valueCount: 5,
        values: ['Red', 'Blue', 'Yellow', 'White', 'Black'],
        createdAt: '2024-01-13',
    },
    {
        id: 4,
        name: 'Drink Size',
        displayType: 'Radio',
        creationMode: 'Instantly',
        valueCount: 3,
        values: ['S', 'M', 'L'],
        createdAt: '2024-01-12',
    },
    {
        id: 5,
        name: 'Crust Type',
        displayType: 'Select',
        creationMode: 'Instantly',
        valueCount: 4,
        values: ['Thin', 'Thick', 'Crispy', 'Cheese'],
        createdAt: '2024-01-11',
    },
    {
        id: 6,
        name: 'Toppings',
        displayType: 'Select',
        creationMode: 'Dynamically',
        valueCount: 8,
        values: [
            'Beef',
            'Pork',
            'Chicken',
            'Shrimp',
            'Mushroom',
            'Vegetables',
            'Cheese',
            'Egg',
        ],
        createdAt: '2024-01-10',
    },
];

type SortField = 'name' | 'displayType' | 'valueCount' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export default function AttributesPage() {
    const [pageIndex, setPageIndex] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [sorting, setSorting] = useState<string>('');
    const [columnFilters, setColumnFilters] = useState<SearchCondition[]>([]);
    const [keyword, setKeyword] = useState('');
    const [total, setTotal] = useState(allAttributes.length);
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
    const { toast } = useToast();

    const filterDefinitions: FilterDefinition[] = [
        {
            field: 'displayType',
            label: 'Display Type',
            type: OperandType.ENUM,
            options: [
                { value: 'Radio', label: 'Radio' },
                { value: 'Select', label: 'Select' },
                { value: 'Color', label: 'Color' },
            ],
        },
        {
            field: 'creationMode',
            label: 'Creation Mode',
            type: OperandType.ENUM,
            options: [
                { value: 'Instantly', label: 'Instantly' },
                { value: 'Dynamically', label: 'Dynamically' },
            ],
        },
    ];

    const columns: ColumnDef<any>[] = [
        {
            accessorKey: 'name',
            header: 'Attribute Name',
        },
        {
            accessorKey: 'displayType',
            header: 'Display Type',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.displayType}</Badge>
            ),
        },
        {
            accessorKey: 'creationMode',
            header: 'Creation Mode',
            cell: ({ row }) => (
                <Badge variant="outline">{row.original.creationMode}</Badge>
            ),
        },
        {
            accessorKey: 'valueCount',
            header: 'Value Count',
        },
        {
            accessorKey: 'values',
            header: 'Values',
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-1">
                    {row.original.values.map((value: string, index: number) => (
                        <Badge key={index} variant="secondary">
                            {value}
                        </Badge>
                    ))}
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
                        <Button
                            size="sm"
                            onClick={() => handleEdit(row.original)}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500"
                            onClick={() =>
                                handleDelete(row.original.id, row.original.name)
                            }
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
        },
    ];

    const handleDelete = (attributeId: number, attributeName: string) => {
        toast({
            title: 'Attribute Deleted',
            description: `${attributeName} has been deleted successfully.`,
        });
    };

    const handleEdit = (attribute: any) => {
        setSelectedAttribute(attribute);
        setShowEditModal(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Product Attributes
                    </h1>
                    <p className="text-muted-foreground">
                        Manage attributes to create product variants
                    </p>
                </div>
                <Button onClick={() => setShowAttributeModal(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Attribute
                </Button>
            </div>

                <DataTable
                    columns={columns}
                    data={allAttributes}
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    total={total}
                    tableId="attributes-table"
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

            <AttributeModal
                open={showAttributeModal}
                onOpenChange={setShowAttributeModal}
            />

            <AttributeEditModal
                open={showEditModal}
                onOpenChange={setShowEditModal}
                attribute={selectedAttribute}
            />
        </div>
    );
}
