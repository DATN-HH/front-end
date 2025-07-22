import { Role } from './rbac';

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

export interface BaseListResponse<T> {
    page: number;
    size: number;
    total: number;
    data: T[];
}

export interface BaseResponse {
    createdAt?: string;
    createdBy?: string;
    updatedAt?: string;
    updatedBy?: string;
    status?: string;
    createdUsername?: string;
    updatedUsername?: string;
    id?: string;
}

export interface RoleResponse extends BaseResponse {
    name: Role;
    description: string;
    hexColor: string;
}

export interface BranchResponse extends BaseResponse {
    name: string;
    address: string;
    phone: string;
    managerId?: string;
    managerName?: string;
}

export interface User extends BaseResponse {
    email: string;
    username: string;
    fullName: string;
    isFullRole: boolean;
    roles: Role[];
    branch: BranchResponse;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface CreatedUserResponse {
    id: string;
    email: string;
    username: string;
    fullName: string;
    birthdate: string;
    gender: 'FEMALE' | 'MALE';
    phoneNumber: string;
    isFullRole: boolean | null;
    userRoles: any[];
}
