'use client';

import { useState, useEffect } from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    Columns,
    Download,
} from 'lucide-react';

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
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DraggableColumnHeader } from './DraggableColumnHeader';
import { AdvancedFilter } from './AdvancedFilter';
import type { FilterDefinition } from './types';
import { downloadToCSV, downloadToExcel } from './export-utils';
import { SearchCondition } from '@/lib/response-object';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    tableId: string;
    // API response data
    pageIndex: number;
    pageSize: number;
    total: number;
    // Current sorting from parent component
    currentSorting?: string; // Format: "columnId:asc" or "columnId:desc" or empty string
    // Callback functions
    onPaginationChange: (pageIndex: number, pageSize: number) => void;
    onSortingChange: (sorting: string) => void;
    onFilterChange: (filters: TableFilterValue[]) => void;
    onSearchChange: (searchTerm: string) => void;
    // Filter definitions
    filterDefinitions?: FilterDefinition[];
    // Feature toggles
    enableSearch?: boolean;
    enableColumnVisibility?: boolean;
    enableSorting?: boolean;
    enablePinning?: boolean;
    enableColumnOrdering?: boolean;
    enableFiltering?: boolean;
    enablePagination?: boolean;
    enableExport?: boolean;
    loading?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    tableId,
    pageIndex,
    pageSize,
    total,
    currentSorting = '',
    onPaginationChange = () => { },
    onSortingChange = () => { },
    onFilterChange = () => { },
    onSearchChange = () => { },
    filterDefinitions = [],
    enableSearch = true,
    enableColumnVisibility = true,
    enableSorting = true,
    enablePinning = true,
    enableColumnOrdering = true,
    enableFiltering = true,
    enablePagination = true,
    enableExport = true,
    loading = false,
}: DataTableProps<TData, TValue>) {
    // Local UI state (not affecting API calls)
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {}
    );
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [pinnedColumns, setPinnedColumns] = useState<
        Record<string, 'left' | 'right' | false>
    >({});
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // Local state for UI controls
    const [searchTerm, setSearchTerm] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<SearchCondition[]>(
        []
    );

    // Convert currentSorting prop to TanStack Table sorting state for UI display
    const parsedSorting: SortingState = currentSorting
        ? (() => {
            const [id, direction] = currentSorting.split(':');
            return [{ id, desc: direction === 'desc' }];
        })()
        : [];

    // Load saved state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && tableId) {
            try {
                const savedState = localStorage.getItem(
                    `table-state-${tableId}`
                );
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    setColumnVisibility(parsedState.columnVisibility || {});
                    setColumnOrder(parsedState.columnOrder || []);
                    setPinnedColumns(parsedState.pinnedColumns || {});
                }
            } catch (error) {
                console.error(
                    'Error loading table state from localStorage:',
                    error
                );
            }
        }
    }, [tableId]);

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && tableId) {
            try {
                localStorage.setItem(
                    `table-state-${tableId}`,
                    JSON.stringify({
                        columnVisibility,
                        columnOrder,
                        pinnedColumns,
                    })
                );
            } catch (error) {
                console.error(
                    'Error saving table state to localStorage:',
                    error
                );
            }
        }
    }, [tableId, columnVisibility, columnOrder, pinnedColumns]);

    // Handle search with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onSearchChange(searchTerm);
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, onSearchChange]);

    // Handle advanced filters change
    useEffect(() => {
        onFilterChange(advancedFilters);
    }, [advancedFilters, onFilterChange]);

    // Handle sorting change - call parent's onSortingChange
    const handleSortingChange = (updaterOrValue: any) => {
        if (typeof updaterOrValue === 'function') {
            const newSorting = updaterOrValue(parsedSorting);
            if (newSorting.length === 0) {
                // No sorting
                onSortingChange('');
            } else {
                // Only take the first sorting (single column sort)
                const sort = newSorting[0];
                onSortingChange(`${sort.id}:${sort.desc ? 'desc' : 'asc'}`);
            }
        } else {
            // Direct value
            if (updaterOrValue.length === 0) {
                onSortingChange('');
            } else {
                const sort = updaterOrValue[0];
                onSortingChange(`${sort.id}:${sort.desc ? 'desc' : 'asc'}`);
            }
        }
    };

    // Setup table with manual pagination and sorting
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onSortingChange: handleSortingChange,
        onColumnFiltersChange: setColumnFilters,
        state: {
            sorting: parsedSorting,
            columnFilters,
            columnVisibility,
            pagination: {
                pageIndex,
                pageSize,
            },
            columnOrder,
        },
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: Math.ceil(total / pageSize),
        enableMultiSort: false, // Disable multi-column sorting
    });

    // Handle column reordering
    const handleColumnReorder = (
        draggedColumnId: string,
        targetColumnId: string
    ) => {
        const currentColumnOrder = table
            .getAllColumns()
            .map((column) => column.id);
        const draggedColumnIndex = currentColumnOrder.indexOf(draggedColumnId);
        const targetColumnIndex = currentColumnOrder.indexOf(targetColumnId);

        if (draggedColumnIndex === -1 || targetColumnIndex === -1) return;

        const newColumnOrder = [...currentColumnOrder];
        newColumnOrder.splice(draggedColumnIndex, 1);
        newColumnOrder.splice(targetColumnIndex, 0, draggedColumnId);

        setColumnOrder(newColumnOrder);
    };

    // Handle column pinning
    const handlePinColumn = (
        columnId: string,
        position: 'left' | 'right' | false
    ) => {
        setPinnedColumns((prev) => ({
            ...prev,
            [columnId]: position,
        }));
    };

    // Export functions
    const handleExportCSV = () => {
        downloadToCSV(data, columns, tableId);
    };

    const handleExportExcel = () => {
        downloadToExcel(data, columns, tableId);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setAdvancedFilters([]);
        table.resetColumnFilters();
    };

    // Pagination handlers
    const handleFirstPage = () => {
        onPaginationChange(0, pageSize);
    };

    const handlePreviousPage = () => {
        onPaginationChange(Math.max(0, pageIndex - 1), pageSize);
    };

    const handleNextPage = () => {
        onPaginationChange(
            Math.min(Math.ceil(total / pageSize) - 1, pageIndex + 1),
            pageSize
        );
    };

    const handleLastPage = () => {
        onPaginationChange(Math.ceil(total / pageSize) - 1, pageSize);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        onPaginationChange(0, newPageSize); // Reset to first page when changing page size
    };

    // Get active filter count
    const activeFilterCount = advancedFilters.length + (searchTerm ? 1 : 0);

    // Sort columns by pinned status
    const sortedColumns = [...table.getAllColumns()];
    sortedColumns.sort((a, b) => {
        const aPin = pinnedColumns[a.id] || false;
        const bPin = pinnedColumns[b.id] || false;

        if (aPin === 'left' && bPin !== 'left') return -1;
        if (aPin !== 'left' && bPin === 'left') return 1;
        if (aPin === 'right' && bPin !== 'right') return 1;
        if (aPin !== 'right' && bPin === 'right') return -1;
        return 0;
    });

    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < totalPages - 1;
    const startRow = pageIndex * pageSize + 1;
    const endRow = Math.min((pageIndex + 1) * pageSize, total);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="w-full">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-muted to-muted/50 border border-border rounded-t-xl p-6">
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                        {/* Left Section - Search and Filters */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1 w-full lg:w-auto">
                            {enableSearch && (
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search across all columns..."
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                        className="pl-10 pr-4 h-11 bg-background border-input focus:border-primary focus:ring-2 focus:ring-primary/20 shadow-sm transition-all duration-200"
                                    />
                                    {searchTerm && (
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => setSearchTerm('')}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-accent"
                                        >
                                            ×
                                        </Button>
                                    )}
                                </div>
                            )}

                            {enableFiltering &&
                                filterDefinitions.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <AdvancedFilter
                                            filterDefinitions={
                                                filterDefinitions
                                            }
                                            filters={advancedFilters}
                                            onFiltersChange={setAdvancedFilters}
                                        />
                                        {activeFilterCount > 0 && (
                                            <div className="flex items-center gap-2">
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-primary/15 text-primary border-primary/30"
                                                >
                                                    {activeFilterCount} filter
                                                    {activeFilterCount > 1
                                                        ? 's'
                                                        : ''}{' '}
                                                    active
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={clearAllFilters}
                                                    className="h-8 px-2 text-muted-foreground hover:text-foreground hover:bg-accent"
                                                >
                                                    Clear all
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* Right Section - Actions */}
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            {enableColumnVisibility && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            <Columns className="h-4 w-4 mr-2" />
                                            Columns
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-48 bg-popover border-border shadow-lg"
                                    >
                                        <div className="p-2 border-b border-border/30">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                Show/Hide Columns
                                            </span>
                                        </div>
                                        {table
                                            .getAllColumns()
                                            .filter((column) =>
                                                column.getCanHide()
                                            )
                                            .map((column) => (
                                                <DropdownMenuCheckboxItem
                                                    key={column.id}
                                                    className="capitalize hover:bg-accent"
                                                    checked={column.getIsVisible()}
                                                    onCheckedChange={(value) =>
                                                        column.toggleVisibility(
                                                            !!value
                                                        )
                                                    }
                                                >
                                                    {column.id}
                                                </DropdownMenuCheckboxItem>
                                            ))}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}

                            {enableExport && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            size="sm"
                                            className="bg-orange-500 hover:bg-orange-600"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        align="end"
                                        className="w-40 bg-popover border-border shadow-lg"
                                    >
                                        <DropdownMenuItem
                                            onClick={handleExportCSV}
                                            className="hover:bg-accent cursor-pointer"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export CSV
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={handleExportExcel}
                                            className="hover:bg-accent cursor-pointer"
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            Export Excel
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="border border-t-0 border-border rounded-b-xl overflow-hidden bg-background shadow-sm">
                    <div className="max-h-[60vh] overflow-auto">
                        <Table>
                            <TableHeader className="bg-muted border-b border-border">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow
                                        key={headerGroup.id}
                                        className="hover:bg-transparent"
                                    >
                                        {headerGroup.headers.map((header) => {
                                            const columnId = header.column.id;
                                            const isPinned =
                                                pinnedColumns[columnId] ||
                                                false;

                                            return (
                                                <TableHead
                                                    key={header.id}
                                                    style={{
                                                        position: isPinned
                                                            ? 'sticky'
                                                            : 'static',
                                                        left:
                                                            isPinned === 'left'
                                                                ? 0
                                                                : 'auto',
                                                        right:
                                                            isPinned === 'right'
                                                                ? 0
                                                                : 'auto',
                                                        zIndex: isPinned
                                                            ? 10
                                                            : 0,
                                                    }}
                                                    className={`
                                                        px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider
                                                        ${isPinned ? 'bg-muted/80 shadow-sm border-r border-border' : 'bg-muted'}
                                                    `}
                                                >
                                                    {enableColumnOrdering ? (
                                                        <DraggableColumnHeader
                                                            header={header}
                                                            columnId={columnId}
                                                            onColumnReorder={
                                                                handleColumnReorder
                                                            }
                                                            onPinColumn={
                                                                enablePinning
                                                                    ? handlePinColumn
                                                                    : undefined
                                                            }
                                                            isPinned={isPinned}
                                                            sorting={
                                                                currentSorting
                                                            }
                                                            enableSorting={
                                                                enableSorting
                                                            }
                                                        >
                                                            {header.isPlaceholder
                                                                ? null
                                                                : flexRender(
                                                                    header
                                                                        .column
                                                                        .columnDef
                                                                        .header,
                                                                    header.getContext()
                                                                )}
                                                        </DraggableColumnHeader>
                                                    ) : header.isPlaceholder ? null : (
                                                        flexRender(
                                                            header.column
                                                                .columnDef
                                                                .header,
                                                            header.getContext()
                                                        )
                                                    )}
                                                </TableHead>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="relative">
                                                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary"></div>
                                                </div>
                                                <span className="text-muted-foreground font-medium">
                                                    Loading data...
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.length ? (
                                    data.map((row, index) => {
                                        const tableRow =
                                            table.getRowModel().rows[index];
                                        return (
                                            <TableRow
                                                key={index}
                                                className={`
                                                    transition-colors duration-150 border-b border-border/30 last:border-b-0
                                                    hover:bg-muted
                                                    ${index % 2 === 0 ? 'bg-background' : 'bg-muted/25'}
                                                `}
                                            >
                                                {tableRow
                                                    ?.getVisibleCells()
                                                    .map((cell) => {
                                                        const columnId =
                                                            cell.column.id;
                                                        const isPinned =
                                                            pinnedColumns[
                                                            columnId
                                                            ] || false;

                                                        return (
                                                            <TableCell
                                                                key={cell.id}
                                                                style={{
                                                                    position:
                                                                        isPinned
                                                                            ? 'sticky'
                                                                            : 'static',
                                                                    left:
                                                                        isPinned ===
                                                                            'left'
                                                                            ? 0
                                                                            : 'auto',
                                                                    right:
                                                                        isPinned ===
                                                                            'right'
                                                                            ? 0
                                                                            : 'auto',
                                                                    zIndex: isPinned
                                                                        ? 5
                                                                        : 0,
                                                                }}
                                                                className={`
                                                                px-6 py-4 text-sm text-foreground
                                                                ${isPinned ? 'bg-background shadow-sm border-r border-border' : ''}
                                                            `}
                                                            >
                                                                {flexRender(
                                                                    cell.column
                                                                        .columnDef
                                                                        .cell,
                                                                    cell.getContext()
                                                                )}
                                                            </TableCell>
                                                        );
                                                    })}
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={columns.length}
                                            className="h-32 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                    <Search className="h-5 w-5 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-1">
                                                    <h3 className="text-sm font-medium text-foreground">
                                                        No results found
                                                    </h3>
                                                    <p className="text-xs text-muted-foreground">
                                                        Try adjusting your
                                                        search or filter
                                                        criteria
                                                    </p>
                                                </div>
                                                {activeFilterCount > 0 && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={
                                                            clearAllFilters
                                                        }
                                                        className="text-primary border-primary/30 hover:bg-primary/10"
                                                    >
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination Section */}
                {enablePagination && (
                    <div className="bg-background border border-t-0 border-border rounded-b-xl px-6 py-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            {/* Results info and page size selector */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <span>Show</span>
                                    <Select
                                        value={`${pageSize}`}
                                        onValueChange={(value) =>
                                            handlePageSizeChange(Number(value))
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-16 border-input focus:ring-2 focus:ring-primary/20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent
                                            side="top"
                                            className="bg-popover border-border"
                                        >
                                            {[10, 20, 50, 100].map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={`${size}`}
                                                >
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span>entries</span>
                                </div>

                                <div className="text-muted-foreground">
                                    Showing {startRow} to {endRow} of {total}{' '}
                                    results
                                </div>
                            </div>

                            {/* Pagination controls */}
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                                    Page {pageIndex + 1} of {totalPages || 1}
                                </div>
                                <div className="flex items-center gap-1 ml-4">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                        onClick={handleFirstPage}
                                        disabled={!canPreviousPage}
                                    >
                                        <ChevronsLeft className="h-4 w-4" />
                                        <span className="sr-only">
                                            First page
                                        </span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                        onClick={handlePreviousPage}
                                        disabled={!canPreviousPage}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        <span className="sr-only">
                                            Previous page
                                        </span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                        onClick={handleNextPage}
                                        disabled={!canNextPage}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                        <span className="sr-only">
                                            Next page
                                        </span>
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                        onClick={handleLastPage}
                                        disabled={!canNextPage}
                                    >
                                        <ChevronsRight className="h-4 w-4" />
                                        <span className="sr-only">
                                            Last page
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
}
