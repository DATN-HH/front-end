export enum OperatorType {
    CONTAIN = 'CONTAIN',
    START_WITH = 'START_WITH',
    END_WITH = 'END_WITH',
    EQUAL = 'EQUAL',
    GREATER_EQUAL = 'GREATER_EQUAL',
    LESS_EQUAL = 'LESS_EQUAL',
    BETWEEN = 'BETWEEN',
    IN = 'IN',
}

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

export interface SearchCondition {
    fieldName: string;
    operandType: OperandType;
    operatorType: OperatorType;
    data?: string;
    datas?: string[];
    label?: string;
    minDate?: string;
    maxDate?: string;
    min?: string;
    max?: string;
}

export interface BaseListRequest {
    keyword?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    searchCondition?: string;
}

export interface BaseListResponse<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
}
