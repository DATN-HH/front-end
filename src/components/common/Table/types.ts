// types.ts
export enum OperandType {
    STRING = 'STRING',
    INTEGER = 'INTEGER',
    DECIMAL = 'DECIMAL',
    DATE = 'DATE',
    TIME = 'TIME',
    DATETIME = 'DATETIME',
    BOOLEAN = 'BOOLEAN',
    ENUM = 'ENUM',
}

export interface OperatorOption {
    value: string;
    label: string;
}

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterDefinition {
    field: string;
    label: string;
    type: OperandType;
    options?: FilterOption[];
}

// This is for column pinning and visibility states
export interface TableState {
    columnVisibility: Record<string, boolean>;
    columnOrder: string[];
    pinnedColumns: Record<string, 'left' | 'right' | false>;
}
