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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortField, setSortField] = useState<SortField>('name');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(5);
    const [filters, setFilters] = useState({
        displayType: 'all',
        creationMode: 'all',
    });
    const [showAttributeModal, setShowAttributeModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedAttribute, setSelectedAttribute] = useState<any>(null);
    const { toast } = useToast();

    // Filter and sort logic
    const filteredAndSortedAttributes = useMemo(() => {
        const filtered = allAttributes.filter((attribute) => {
            const matchesSearch = attribute.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesDisplayType =
                filters.displayType === 'all' ||
                attribute.displayType === filters.displayType;
            const matchesCreationMode =
                filters.creationMode === 'all' ||
                attribute.creationMode === filters.creationMode;

            return matchesSearch && matchesDisplayType && matchesCreationMode;
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
        filteredAndSortedAttributes.length / itemsPerPage
    );
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedAttributes = filteredAndSortedAttributes.slice(
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

    const clearFilters = () => {
        setFilters({
            displayType: 'all',
            creationMode: 'all',
        });
        setSearchTerm('');
        setCurrentPage(1);
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

            <Card>
                <CardHeader>
                    <CardTitle>Attribute List</CardTitle>
                    <CardDescription>
                        Showing {startIndex + 1}-
                        {Math.min(
                            startIndex + itemsPerPage,
                            filteredAndSortedAttributes.length
                        )}
                        of {filteredAndSortedAttributes.length} attributes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Search and Filters */}
                    <div className="flex flex-col space-y-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search attributes..."
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
                                                Display Type
                                            </label>
                                            <Select
                                                value={filters.displayType}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        displayType: value,
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
                                                    <SelectItem value="Radio">
                                                        Radio
                                                    </SelectItem>
                                                    <SelectItem value="Select">
                                                        Select
                                                    </SelectItem>
                                                    <SelectItem value="Color">
                                                        Color
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">
                                                Creation Mode
                                            </label>
                                            <Select
                                                value={filters.creationMode}
                                                onValueChange={(value) =>
                                                    setFilters({
                                                        ...filters,
                                                        creationMode: value,
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
                                                    <SelectItem value="Instantly">
                                                        Instantly
                                                    </SelectItem>
                                                    <SelectItem value="Dynamically">
                                                        Dynamically
                                                    </SelectItem>
                                                    <SelectItem value="Never">
                                                        Never
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
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('name')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Attribute Name
                                        {getSortIcon('name')}
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() =>
                                            handleSort('displayType')
                                        }
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Display Type
                                        {getSortIcon('displayType')}
                                    </Button>
                                </TableHead>
                                <TableHead>Creation Mode</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleSort('valueCount')}
                                        className="h-auto p-0 font-semibold"
                                    >
                                        Value Count
                                        {getSortIcon('valueCount')}
                                    </Button>
                                </TableHead>
                                <TableHead>Values</TableHead>
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
                            {paginatedAttributes.map((attribute) => (
                                <TableRow key={attribute.id}>
                                    <TableCell className="font-medium">
                                        {attribute.name}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">
                                            {attribute.displayType}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">
                                            {attribute.creationMode}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {attribute.valueCount}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1">
                                            {attribute.values
                                                .slice(0, 3)
                                                .map((value, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {value}
                                                    </Badge>
                                                ))}
                                            {attribute.values.length > 3 && (
                                                <Badge
                                                    variant="outline"
                                                    className="text-xs"
                                                >
                                                    +
                                                    {attribute.values.length -
                                                        3}
                                                </Badge>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {new Date(
                                            attribute.createdAt
                                        ).toLocaleDateString('en-US')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <Link
                                                href={`/app/menu/attributes/${attribute.id}/detail`}
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
                                                    handleEdit(attribute)
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
                                                            handleDelete(
                                                                attribute.id,
                                                                attribute.name
                                                            )
                                                        }
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
