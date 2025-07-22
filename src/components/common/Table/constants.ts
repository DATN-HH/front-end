/**
 * Default page size options for table pagination
 */
export const DEFAULT_PAGE_SIZES = [10, 20, 50, 100] as const;

/**
 * Default configuration for DataTable features
 */
export const DEFAULT_TABLE_CONFIG = {
    enableSearch: true,
    enableColumnVisibility: true,
    enableSorting: true,
    enablePinning: true,
    enableColumnOrdering: true,
    enableFiltering: true,
    enablePagination: true,
    enableExport: true,
    loading: false,
} as const;

/**
 * Default values for pagination
 */
export const DEFAULT_PAGINATION = {
    pageIndex: 0,
    pageSize: 10,
} as const;

/**
 * Table state keys for localStorage
 */
export const TABLE_STATE_KEYS = {
    COLUMN_VISIBILITY: 'columnVisibility',
    COLUMN_ORDER: 'columnOrder',
    COLUMN_PINNING: 'columnPinning',
} as const;

/**
 * Debounce delay for search input (ms)
 */
export const SEARCH_DEBOUNCE_DELAY = 300;

/**
 * Maximum table height for sticky header
 */
export const MAX_TABLE_HEIGHT = '60vh';
