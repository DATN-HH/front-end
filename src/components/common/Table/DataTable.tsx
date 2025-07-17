'use client';

import { useState, useEffect, useMemo } from 'react';
import {
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
    type VisibilityState,
    type ColumnPinningState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DraggableColumnHeader } from './DraggableColumnHeader';
import { AdvancedFilter } from './AdvancedFilter';
import type { FilterDefinition } from './types';
import { downloadToCSV, downloadToExcel } from './export-utils';
import { SearchCondition } from '@/lib/response-object';

// Import utilities and constants
import { getCommonPinningStyles } from './utils/tableStyles';
import { extractPinningFromColumns, combineColumnPinning } from './utils/columnHelpers';
import {
    DEFAULT_PAGE_SIZES,
    DEFAULT_TABLE_CONFIG,
    TABLE_STATE_KEYS,
    SEARCH_DEBOUNCE_DELAY,
    MAX_TABLE_HEIGHT
} from './constants';

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
    onFilterChange: (filters: SearchCondition[]) => void;
    onSearchChange: (searchTerm: string) => void;
    onClickRow?: (row: TData) => void;
    // Filter definitions
    filterDefinitions?: FilterDefinition[];
    // Initial column pinning
    initialColumnPinning?: {
        left?: string[];
        right?: string[];
    };
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
    onClickRow,
    filterDefinitions = [],
    initialColumnPinning,
    enableSearch = DEFAULT_TABLE_CONFIG.enableSearch,
    enableColumnVisibility = DEFAULT_TABLE_CONFIG.enableColumnVisibility,
    enableSorting = DEFAULT_TABLE_CONFIG.enableSorting,
    enablePinning = DEFAULT_TABLE_CONFIG.enablePinning,
    enableColumnOrdering = DEFAULT_TABLE_CONFIG.enableColumnOrdering,
    enableFiltering = DEFAULT_TABLE_CONFIG.enableFiltering,
    enablePagination = DEFAULT_TABLE_CONFIG.enablePagination,
    enableExport = DEFAULT_TABLE_CONFIG.enableExport,
    loading = DEFAULT_TABLE_CONFIG.loading,
}: DataTableProps<TData, TValue>) {

    /* ==========================================
     * INITIAL SETUP & MEMOIZED VALUES
     * ========================================== */

    // Mobile detection
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkIsMobile = () => {
            if (typeof window !== 'undefined') {
                setIsMobile(window.innerWidth < 768); // sm breakpoint
            }
        };

        checkIsMobile();
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', checkIsMobile);
            return () => window.removeEventListener('resize', checkIsMobile);
        }
    }, []);

    // Get initial pinning state with useMemo to avoid recalculation
    const initialPinning = useMemo((): ColumnPinningState => {
        // Disable pinning on mobile
        if (isMobile) {
            return { left: [], right: [] };
        }
        const pinningFromColumns = extractPinningFromColumns(columns);
        return combineColumnPinning(pinningFromColumns, initialColumnPinning);
    }, [columns, initialColumnPinning, isMobile]);

    // Convert currentSorting prop to TanStack Table sorting state for UI display
    const parsedSorting: SortingState = useMemo(() => {
        return currentSorting
            ? (() => {
                const [id, direction] = currentSorting.split(':');
                return [{ id, desc: direction === 'desc' }];
            })()
            : [];
    }, [currentSorting]);

    /* ==========================================
     * STATE MANAGEMENT
     * ========================================== */

    // Local UI state (not affecting API calls)
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [columnOrder, setColumnOrder] = useState<string[]>([]);
    const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(initialPinning);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    // Update pinning when mobile state or initial pinning changes
    useEffect(() => {
        setColumnPinning(initialPinning);
    }, [initialPinning]);

    // Local state for UI controls
    const [searchTerm, setSearchTerm] = useState('');
    const [advancedFilters, setAdvancedFilters] = useState<SearchCondition[]>([]);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    /* ==========================================
     * LOCALSTORAGE & LIFECYCLE EFFECTS
     * ========================================== */

    // Load saved state from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && tableId) {
            try {
                const savedState = localStorage.getItem(`table-state-${tableId}`);
                if (savedState) {
                    const parsedState = JSON.parse(savedState);
                    setColumnVisibility(parsedState[TABLE_STATE_KEYS.COLUMN_VISIBILITY] || {});
                    setColumnOrder(parsedState[TABLE_STATE_KEYS.COLUMN_ORDER] || []);
                    // Use saved pinning if it exists and has content, otherwise keep initial pinning
                    if (parsedState[TABLE_STATE_KEYS.COLUMN_PINNING] &&
                        (parsedState[TABLE_STATE_KEYS.COLUMN_PINNING].left?.length > 0 ||
                            parsedState[TABLE_STATE_KEYS.COLUMN_PINNING].right?.length > 0)) {
                        setColumnPinning(parsedState[TABLE_STATE_KEYS.COLUMN_PINNING]);
                    }
                    // If no saved pinning, keep the initial pinning that was already set
                }
                // If no saved state at all, keep the initial pinning that was already set
            } catch (error) {
                console.error('Error loading table state from localStorage:', error);
                // On error, keep the initial pinning that was already set
            }
        }
    }, [tableId]);

    // Apply initial pinning on mount
    useEffect(() => {
        // Apply initial pinning if current pinning is empty and we have initial config
        if ((!columnPinning.left?.length && !columnPinning.right?.length) &&
            (initialPinning.left?.length || initialPinning.right?.length)) {
            setColumnPinning(initialPinning);
        }
    }, [initialPinning]);

    // Save state to localStorage
    useEffect(() => {
        if (typeof window !== 'undefined' && tableId) {
            try {
                localStorage.setItem(
                    `table-state-${tableId}`,
                    JSON.stringify({
                        [TABLE_STATE_KEYS.COLUMN_VISIBILITY]: columnVisibility,
                        [TABLE_STATE_KEYS.COLUMN_ORDER]: columnOrder,
                        [TABLE_STATE_KEYS.COLUMN_PINNING]: columnPinning,
                    })
                );
            } catch (error) {
                console.error('Error saving table state to localStorage:', error);
            }
        }
    }, [tableId, columnVisibility, columnOrder, columnPinning]);

    // Handle search with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            onSearchChange(searchTerm);
        }, SEARCH_DEBOUNCE_DELAY);
        return () => clearTimeout(debounceTimer);
    }, [searchTerm, onSearchChange]);

    // Handle advanced filters change
    useEffect(() => {
        onFilterChange(advancedFilters);
    }, [advancedFilters, onFilterChange]);

    /* ==========================================
     * TABLE INSTANCE SETUP
     * ========================================== */

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
        onColumnPinningChange: setColumnPinning,
        enableColumnPinning: enablePinning && !isMobile, // Disable pinning on mobile
        state: {
            sorting: parsedSorting,
            columnFilters,
            columnVisibility,
            columnPinning,
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

    // Initialize columnOrder from table columns
    useEffect(() => {
        if (columnOrder.length === 0) {
            const initialColumnOrder = table.getAllColumns().map((column) => column.id);
            setColumnOrder(initialColumnOrder);
        }
    }, [table, columnOrder.length]);

    /* ==========================================
     * EVENT HANDLERS
     * ========================================== */

    // Handle column drag end
    const handleDragEnd = (event: DragEndEvent) => {
        // Disable drag and drop on mobile
        if (isMobile) return;

        const { active, over } = event;

        if (!over) return;

        if (active.id !== over.id) {
            setColumnOrder((currentOrder) => {
                const oldIndex = currentOrder.indexOf(active.id as string);
                const newIndex = currentOrder.indexOf(over.id as string);

                if (oldIndex !== -1 && newIndex !== -1) {
                    return arrayMove(currentOrder, oldIndex, newIndex);
                }
                return currentOrder;
            });
        }
    };

    // Handle column pinning
    const handlePinColumn = (
        columnId: string,
        position: 'left' | 'right' | false
    ) => {
        const column = table.getColumn(columnId);
        if (column) {
            column.pin(position);
        }
    };

    // Export functions
    const handleExportCSV = () => {
        downloadToCSV(data, columns, tableId);
    };

    const handleExportExcel = () => {
        downloadToExcel(data, columns, tableId);
    };

    // Column visibility handlers
    const handleShowAllColumns = () => {
        table.getAllColumns().forEach((column) => {
            if (column.getCanHide()) {
                column.toggleVisibility(true);
            }
        });
    };

    const handleHideAllColumns = () => {
        table.getAllColumns().forEach((column) => {
            if (column.getCanHide()) {
                column.toggleVisibility(false);
            }
        });
    };

    // Handle toggle all columns
    const handleToggleAllColumns = () => {
        const hidableColumns = table.getAllColumns().filter((column) => column.getCanHide());
        const allVisible = hidableColumns.every((column) => column.getIsVisible());

        if (allVisible) {
            // If all visible, hide all
            handleHideAllColumns();
        } else {
            // If some or none visible, show all
            handleShowAllColumns();
        }
    };

    // Get checkbox state for select all
    const getSelectAllState = () => {
        const hidableColumns = table.getAllColumns().filter((column) => column.getCanHide());
        const visibleCount = hidableColumns.filter((column) => column.getIsVisible()).length;

        if (visibleCount === 0) return false; // None visible
        if (visibleCount === hidableColumns.length) return true; // All visible
        return 'indeterminate'; // Some visible
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

    /* ==========================================
     * COMPUTED VALUES
     * ========================================== */

    // Get active filter count
    const activeFilterCount = advancedFilters.length + (searchTerm ? 1 : 0);

    // Calculate pagination info
    const totalPages = Math.ceil(total / pageSize);
    const canPreviousPage = pageIndex > 0;
    const canNextPage = pageIndex < totalPages - 1;
    const startRow = pageIndex * pageSize + 1;
    const endRow = Math.min((pageIndex + 1) * pageSize, total);

    /* ==========================================
     * RENDER HELPERS
     * ========================================== */

    // Render header groups with proper pinning
    const renderHeaderGroups = (headerGroups: any[]) => {
        return headerGroups.map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                >
                    {headerGroup.headers.map((header: any) => {
                        const columnId = header.column.id;
                        const isPinned = header.column.getIsPinned();
                        const pinningStyles = getCommonPinningStyles(header.column);

                        return (
                            <TableHead
                                key={header.id}
                                colSpan={header.colSpan}
                                style={isMobile ? {} : pinningStyles}
                                className="px-6 py-4 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border"
                            >
                                {enableColumnOrdering ? (
                                    <DraggableColumnHeader
                                        header={header}
                                        columnId={columnId}
                                        onPinColumn={
                                            enablePinning && !isMobile
                                                ? handlePinColumn
                                                : undefined
                                        }
                                        isPinned={isPinned}
                                        sorting={currentSorting}
                                        enableSorting={enableSorting}
                                        enableDragAndDrop={enableColumnOrdering && !isMobile}
                                    >
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </DraggableColumnHeader>
                                ) : header.isPlaceholder ? null : (
                                    flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )
                                )}
                            </TableHead>
                        );
                    })}
                </SortableContext>
            </TableRow>
        ));
    };

    // Render table rows with proper pinning
    const renderTableRows = () => {
        if (loading) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
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
            );
        }

        if (!data?.length) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Search className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-medium text-foreground">
                                    No results found
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Try adjusting your search or filter criteria
                                </p>
                            </div>
                            {activeFilterCount > 0 && (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    className="text-primary border-primary/30 hover:bg-primary/10"
                                >
                                    Clear filters
                                </Button>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
            );
        }

        return data.map((row, index) => {
            const tableRow = table.getRowModel().rows[index];
            return (
                <TableRow
                    key={index}
                    className={`
                        transition-colors duration-150 border-b border-border/30 last:border-b-0
                        hover:bg-muted/50
                        ${index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                        ${onClickRow ? 'cursor-pointer' : ''}
                    `}
                    onClick={onClickRow ? () => onClickRow(row) : undefined}
                >
                    {tableRow?.getVisibleCells().map((cell) => {
                        const pinningStyles = getCommonPinningStyles(cell.column);

                        return (
                            <TableCell
                                key={cell.id}
                                style={isMobile ? {} : {
                                    ...pinningStyles,
                                    backgroundColor: pinningStyles.backgroundColor
                                        ? index % 2 === 0
                                            ? 'hsl(var(--background))'
                                            : 'hsl(var(--muted))'
                                        : undefined
                                }}
                                className="px-6 py-4 text-sm text-foreground"
                            >
                                {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext()
                                )}
                            </TableCell>
                        );
                    })}
                </TableRow>
            );
        });
    };

    /* ==========================================
     * MAIN RENDER
     * ========================================== */

    return (
        <DndContext
            sensors={isMobile ? [] : sensors}
            collisionDetection={closestCenter}
            onDragEnd={isMobile ? () => { } : handleDragEnd}
        >
            <div className="w-full">
                {/* Header Section */}
                {!isMobile && (enableSearch || enableFiltering || enableColumnVisibility || enableExport) && (
                    <div className="bg-gradient-to-r from-muted to-muted/50 border border-border rounded-t-xl p-4 lg:p-6">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-6">
                            {/* Left Section - Search and Filters */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 lg:gap-4 flex-1 w-full lg:w-auto">
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
                                                className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
                                            >
                                                <Columns className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Columns</span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="w-56 bg-popover border-border shadow-lg"
                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                        >
                                            <div className="p-3 border-b border-border/30">
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                    Show/Hide Columns
                                                </span>
                                            </div>

                                            {/* Toggle All Controls */}
                                            <div className="p-2 border-b border-border/30">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id="toggle-all"
                                                        checked={getSelectAllState()}
                                                        onCheckedChange={handleToggleAllColumns}
                                                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                    />
                                                    <label
                                                        htmlFor="toggle-all"
                                                        className="text-sm font-medium text-foreground cursor-pointer"
                                                    >
                                                        {getSelectAllState() === true ? 'Hide All' : 'Show All'}
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Individual Column Controls */}
                                            <div className="max-h-64 overflow-y-auto">
                                                {table
                                                    .getAllColumns()
                                                    .filter((column) =>
                                                        column.getCanHide()
                                                    )
                                                    .map((column) => (
                                                        <div
                                                            key={column.id}
                                                            className="flex items-center space-x-2 p-2 hover:bg-accent/50 transition-colors"
                                                            onClick={(e) => e.preventDefault()}
                                                        >
                                                            <Checkbox
                                                                id={`column-${column.id}`}
                                                                checked={column.getIsVisible()}
                                                                onCheckedChange={(value) =>
                                                                    column.toggleVisibility(
                                                                        !!value
                                                                    )
                                                                }
                                                                className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                                                            />
                                                            <label
                                                                htmlFor={`column-${column.id}`}
                                                                className="text-sm capitalize text-foreground cursor-pointer flex-1"
                                                            >
                                                                {column.id}
                                                            </label>
                                                        </div>
                                                    ))}
                                            </div>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}

                                {enableExport && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                disabled
                                                size="sm"
                                                className="bg-orange-500 hover:bg-orange-600 w-full sm:w-auto"
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                <span className="hidden sm:inline">Export</span>
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
                )}

                {/* Table Section */}
                <div className={`border ${(!isMobile && (enableSearch || enableFiltering || enableColumnVisibility || enableExport)) ? 'border-t-0' : ''} border-border ${(!isMobile && (enableSearch || enableFiltering || enableColumnVisibility || enableExport)) ? 'rounded-b-xl' : 'rounded-xl'} bg-background shadow-sm`}>
                    <div
                        className="overflow-x-auto"
                        style={{
                            borderCollapse: 'separate',
                            maxHeight: MAX_TABLE_HEIGHT
                        }}
                    >
                        <Table className="min-w-full" style={{ width: table.getTotalSize() }}>
                            <TableHeader className="border-b border-border sticky top-0 z-10 bg-background shadow-sm">
                                {renderHeaderGroups(table.getHeaderGroups())}
                            </TableHeader>
                            <TableBody>
                                {renderTableRows()}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Pagination Section */}
                {enablePagination && (
                    <div className={`bg-background border border-t-0 border-border rounded-b-xl px-4 lg:px-6 py-3 lg:py-4`}>
                        <div className="flex flex-col lg:flex-row items-center justify-between gap-3 lg:gap-4">
                            {/* Results info */}
                            <div className="text-sm text-muted-foreground text-center lg:text-left">
                                Showing {startRow} to {endRow} of {total} results
                            </div>

                            {/* Pagination controls */}
                            <div className="flex flex-col sm:flex-row items-center gap-3 lg:gap-4">
                                {/* Page size selector */}
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className="hidden sm:inline">Show</span>
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
                                            {DEFAULT_PAGE_SIZES.map((size) => (
                                                <SelectItem
                                                    key={size}
                                                    value={`${size}`}
                                                >
                                                    {size}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <span className="hidden sm:inline">entries</span>
                                </div>

                                {/* Page navigation */}
                                <div className="flex items-center gap-2 lg:gap-3">
                                    {/* Navigation buttons */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                            onClick={handleFirstPage}
                                            disabled={!canPreviousPage}
                                        >
                                            <ChevronsLeft className="h-4 w-4" />
                                            <span className="sr-only">First page</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                            onClick={handlePreviousPage}
                                            disabled={!canPreviousPage}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span className="sr-only">Previous page</span>
                                        </Button>
                                    </div>

                                    {/* Page input */}
                                    <div className="flex items-center gap-1 lg:gap-2 text-sm">
                                        <span className="text-muted-foreground hidden sm:inline">Page</span>
                                        <Input
                                            type="number"
                                            min="1"
                                            max={totalPages || 1}
                                            value={pageIndex + 1}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (value >= 1 && value <= totalPages) {
                                                    onPaginationChange(value - 1, pageSize);
                                                }
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    const value = parseInt(e.currentTarget.value);
                                                    if (value >= 1 && value <= totalPages) {
                                                        onPaginationChange(value - 1, pageSize);
                                                    }
                                                }
                                            }}
                                            className="h-9 w-14 lg:w-16 text-center border-input focus:ring-2 focus:ring-primary/20"
                                        />
                                        <span className="text-muted-foreground">/ {totalPages || 1}</span>
                                    </div>

                                    {/* Navigation buttons */}
                                    <div className="flex items-center gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                            onClick={handleNextPage}
                                            disabled={!canNextPage}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                            <span className="sr-only">Next page</span>
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="h-9 w-9 p-0 border-input hover:bg-accent disabled:opacity-50"
                                            onClick={handleLastPage}
                                            disabled={!canNextPage}
                                        >
                                            <ChevronsRight className="h-4 w-4" />
                                            <span className="sr-only">Last page</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DndContext>
    );
}
