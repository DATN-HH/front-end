// Common Types
export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';
export type Gender = 'FEMALE' | 'MALE' | 'OTHER';
export type RoleName =
    | 'MANAGER'
    | 'WAITER'
    | 'HOST'
    | 'KITCHEN'
    | 'CASHIER'
    | 'ACCOUNTANT'
    | 'EMPLOYEE'
    | 'CUSTOMER'
    | 'SUPPORT'
    | 'SYSTEM_ADMIN';
export type OperandType =
    | 'STRING'
    | 'INTEGER'
    | 'DECIMAL'
    | 'DATE'
    | 'TIME'
    | 'DATETIME'
    | 'BOOLEAN'
    | 'ENUM';
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
export type ShiftStatus = 'DRAFT' | 'PUBLISHED' | 'CONFLICTED';
export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ShiftRequestType =
    | 'EXCHANGE'
    | 'LEAVE'
    | 'UNAVAILABILITY'
    | 'SHIFT_REQUEST_ACCEPTED'
    | 'SHIFT_REQUEST_DECLINED';

// Base Interfaces
export interface BaseEntity {
    createdAt: string;
    createdBy: number;
    updatedAt: string;
    updatedBy: number;
    status: Status;
    createdUsername: string;
    updatedUsername: string;
    id: number;
}

export interface BaseResponse<T> {
    success: boolean;
    code: number;
    message: string;
    payload: T;
}

export interface BaseListRequest {
    keyword?: string;
    status?: Status;
    page?: number;
    size?: number;
    sortBy?: string;
    searchCondition?: string;
    searchConditions?: SearchCondition[];
    fieldNameMap?: string;
    fieldNameMaps?: Record<string, string>;
    searchConditionDisplay?: string;
}

export interface PageResponse<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
}

export interface SearchCondition {
    fieldName: string;
    operandType: OperandType;
    operatorType: OperatorType;
    data?: string;
    datas?: string[];
}

export interface LocalTime {
    hour: number;
    minute: number;
    second: number;
    nano: number;
}

// Re-export all modules
export * from './auth';
export * from './users';
export * from './roles';
export * from './branches';
export * from './shifts';
export * from './staff-shifts';
export * from './scheduled-shift';
export * from './advance-search';
export * from './table-booking';
