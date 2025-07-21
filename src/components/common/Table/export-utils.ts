// export-utils.ts
import { ColumnDef } from '@tanstack/react-table';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface CellValue {
    toString(): string;
}

// Helper to extract plain values from cell renders
const extractValue = <T>(data: T, column: ColumnDef<T, any>): string => {
    if (column.accessorFn) {
        const value = column.accessorFn(data, 0);
        return value !== null && value !== undefined ? String(value) : '';
    }

    if (column.accessorKey && typeof column.accessorKey === 'string') {
        const value = (data as Record<string, any>)[column.accessorKey];
        return value !== null && value !== undefined ? String(value) : '';
    }

    return '';
};

// Export data to CSV
export const downloadToCSV = <T>(
    data: T[],
    columns: ColumnDef<T, any>[],
    fileName: string
) => {
    try {
        // Generate headers
        const headers = columns
            .filter((column) => column.id && typeof column.id === 'string')
            .map((column) => {
                const header =
                    typeof column.header === 'string'
                        ? column.header
                        : column.id;
                return header;
            });

        // Generate rows
        const rows = data.map((item) => {
            return columns
                .filter((column) => column.id && typeof column.id === 'string')
                .map((column) => extractValue(item, column));
        });

        // Combine headers and rows
        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.join(',')),
        ].join('\n');

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `${fileName}.csv`);
    } catch (error) {
        console.error('Error exporting to CSV:', error);
    }
};

// Export data to Excel
export const downloadToExcel = <T>(
    data: T[],
    columns: ColumnDef<T, any>[],
    fileName: string
) => {
    try {
        // Generate headers
        const headers = columns
            .filter((column) => column.id && typeof column.id === 'string')
            .map((column) => {
                const header =
                    typeof column.header === 'string'
                        ? column.header
                        : column.id;
                return header;
            });

        // Generate rows
        const rows = data.map((item) => {
            return columns
                .filter((column) => column.id && typeof column.id === 'string')
                .map((column) => extractValue(item, column));
        });

        // Create worksheet
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

        // Create workbook
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

        // Generate Excel file and download
        const excelBuffer = XLSX.write(workbook, {
            bookType: 'xlsx',
            type: 'array',
        });
        const blob = new Blob([excelBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${fileName}.xlsx`);
    } catch (error) {
        console.error('Error exporting to Excel:', error);
    }
};
