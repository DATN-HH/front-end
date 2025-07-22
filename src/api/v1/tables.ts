import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

import { apiClient } from '@/services/api-client';

import { TableTypeResponse } from './table-types';

import { BaseResponse } from '.';

// Enums

export enum TableShape {
    SQUARE = 'SQUARE',
    ROUND = 'ROUND',
    RECTANGLE = 'RECTANGLE',
    OVAL = 'OVAL',
}

// Legacy enum for backward compatibility

export enum TableType {
    STANDARD = 'STANDARD',
    VIP = 'VIP',
    OUTDOOR = 'OUTDOOR',
    PRIVATE = 'PRIVATE',
    COUPLE = 'COUPLE',
    FAMILY = 'FAMILY',
    BUSINESS = 'BUSINESS',
    SMOKING = 'SMOKING',
    NON_SMOKING = 'NON_SMOKING',
    WHEELCHAIR_ACCESSIBLE = 'WHEELCHAIR_ACCESSIBLE',
}

// Updated Interfaces
export interface TableCreateRequest {
    tableName: string;
    capacity: number;
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
    tableShape: TableShape;
    tableTypeId: number; // Changed from tableType enum to tableTypeId
    floorId: number;
}

export interface TableUpdateRequest {
    tableName: string;
    capacity: number;
    xRatio: number;
    yRatio: number;
    widthRatio: number;
    heightRatio: number;
    tableShape: TableShape;
    tableTypeId: number; // Changed from tableType enum to tableTypeId
}

export interface TableResponse {
    id: number;
    tableName: string;
    capacity: number;
    xRatio: number | null;
    yRatio: number | null;
    xratio: number; // API returns lowercase
    yratio: number; // API returns lowercase
    widthRatio: number;
    heightRatio: number;
    tableShape: TableShape;
    tableType: TableTypeResponse; // Changed from TableType enum to TableTypeResponse object
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: number;
    updatedBy: number;
    createdUsername: string;
    updatedUsername: string;
    floor?: {
        id: number;
        name: string;
        imageUrl: string;
        order: number;
    } | null;
}

export interface FloorTablesResponse {
    floor: {
        id: number;
        name: string;
        imageUrl: string;
        order: number;
        status: string;
        createdAt: string;
        updatedAt: string;
        createdBy: number;
        updatedBy: number;
        createdUsername: string;
        updatedUsername: string;
        branch?: {
            id: number;
            name: string;
            address: string;
            phone: string;
            status: string;
            createdAt: string;
            updatedAt: string;
            createdBy: number;
            updatedBy: number;
            createdUsername: string;
            updatedUsername: string;
            manager?: {
                id: number;
                fullName: string;
                email: string;
            };
        };
    };
    tables: TableResponse[];
}

// API Functions
const createTable = async (
    data: TableCreateRequest
): Promise<TableResponse> => {
    const response = await apiClient.post<BaseResponse<TableResponse>>(
        '/tables',
        data
    );
    return response.data.payload!;
};

const updateTable = async (
    id: number,
    data: TableUpdateRequest
): Promise<TableResponse> => {
    const response = await apiClient.put<BaseResponse<TableResponse>>(
        `/tables/${id}`,
        data
    );
    return response.data.payload!;
};

const getTablesByFloor = async (
    floorId: number
): Promise<FloorTablesResponse> => {
    const response = await apiClient.get<BaseResponse<FloorTablesResponse>>(
        `/tables/floors/${floorId}`
    );
    const data = response.data.payload!;

    // Normalize table data
    return {
        ...data,
        tables: data.tables.map(normalizeTableData),
    };
};

const deleteTable = async (id: number): Promise<void> => {
    await apiClient.delete(`/tables/${id}`);
};

// React Query Hooks
export const useCreateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createTable,
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['tables', 'floor', data.floor?.id],
            });
        },
    });
};

export const useUpdateTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: TableUpdateRequest }) =>
            updateTable(id, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['tables', 'floor', data.floor?.id],
            });
        },
    });
};

export const useTablesByFloor = (floorId: number) => {
    return useQuery({
        queryKey: ['tables', 'floor', floorId],
        queryFn: () => getTablesByFloor(floorId),
        enabled: !!floorId,
    });
};

export const useDeleteTable = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteTable,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tables'] });
        },
    });
};

// Updated utility functions to work with TableTypeResponse object
export const getTableShapeLabel = (tableShape: TableShape): string => {
    switch (tableShape) {
        case TableShape.SQUARE:
            return 'Square';
        case TableShape.ROUND:
            return 'Round';
        case TableShape.RECTANGLE:
            return 'Rectangle';
        case TableShape.OVAL:
            return 'Oval';
        default:
            return tableShape;
    }
};

// Normalize table data from API response
export const normalizeTableData = (table: TableResponse): TableResponse => {
    return {
        ...table,
        xRatio: table.xRatio ?? table.xratio,
        yRatio: table.yRatio ?? table.yratio,
    };
};

// Debounce hook for position updates
export const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export const validateTableData = (
    tableData: Partial<TableCreateRequest | TableUpdateRequest>
) => {
    const errors: Record<string, string> = {};

    if (!tableData.tableName?.trim()) {
        errors.tableName = 'Table name is required';
    }

    if (
        !tableData.capacity ||
        tableData.capacity < 1 ||
        tableData.capacity > 50
    ) {
        errors.capacity = 'Capacity must be between 1 and 50 people';
    }

    if (
        tableData.xRatio === undefined ||
        tableData.xRatio < 0 ||
        tableData.xRatio > 1
    ) {
        errors.xRatio = 'X position must be between 0.0 and 1.0';
    }

    if (
        tableData.yRatio === undefined ||
        tableData.yRatio < 0 ||
        tableData.yRatio > 1
    ) {
        errors.yRatio = 'Y position must be between 0.0 and 1.0';
    }

    if (
        tableData.widthRatio === undefined ||
        tableData.widthRatio < 0.01 ||
        tableData.widthRatio > 1
    ) {
        errors.widthRatio = 'Width must be between 0.01 and 1.0';
    }

    if (
        tableData.heightRatio === undefined ||
        tableData.heightRatio < 0.01 ||
        tableData.heightRatio > 1
    ) {
        errors.heightRatio = 'Height must be between 0.01 and 1.0';
    }

    if (!tableData.tableShape) {
        errors.tableShape = 'Table shape is required';
    }

    if (!tableData.tableTypeId) {
        errors.tableTypeId = 'Table type is required';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
