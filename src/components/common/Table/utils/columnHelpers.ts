import type { ColumnDef, ColumnPinningState } from '@tanstack/react-table';

/**
 * Extract column ID from various column definition sources
 * Handles different column definition patterns
 */
export const extractColumnId = (column: ColumnDef<any, any>): string | undefined => {
    // Get column id from various sources
    if (typeof column.id === 'string') {
        return column.id;
    } else if ('accessorKey' in column && typeof (column as any).accessorKey === 'string') {
        return (column as any).accessorKey;
    } else if ('accessorFn' in column && typeof column.header === 'string') {
        return column.header;
    }
    return undefined;
};

/**
 * Extract initial column pinning from column definitions
 * Looks for meta.pin property in column definitions
 */
export const extractPinningFromColumns = (columns: ColumnDef<any, any>[]): ColumnPinningState => {
    const pinningFromColumns: ColumnPinningState = { left: [], right: [] };

    columns.forEach((column) => {
        const columnId = extractColumnId(column);
        const pinPosition = (column as any).meta?.pin;

        if (pinPosition === 'left' && columnId) {
            pinningFromColumns.left?.push(columnId);
        } else if (pinPosition === 'right' && columnId) {
            pinningFromColumns.right?.push(columnId);
        }
    });

    return pinningFromColumns;
};

/**
 * Combine column-based pinning with initial pinning props
 * Returns merged pinning state
 */
export const combineColumnPinning = (
    columnPinning: ColumnPinningState,
    initialColumnPinning?: { left?: string[]; right?: string[] }
): ColumnPinningState => {
    return {
        left: [
            ...(columnPinning.left || []),
            ...(initialColumnPinning?.left || [])
        ],
        right: [
            ...(columnPinning.right || []),
            ...(initialColumnPinning?.right || [])
        ]
    };
}; 