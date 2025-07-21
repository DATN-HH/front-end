import { Role } from './rbac';

export interface BaseListRequest {
  keyword?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  searchCondition?: string;
}

export interface UserListRequest extends BaseListRequest {
  branchId?: number | string;
  isEmployee?: boolean;
}

export interface RoleRequest {
  name: Role;
  description: string;
  hexColor: string;
  status: string;
}

export interface BranchRequest {
  name: string;
  address: string;
  phone: string;
  status: string;
  managerId: number | null;
}

export interface CreateUserPayload {
  email: string;
  username: string;
  fullName: string;
  birthdate: string;
  gender: 'FEMALE' | 'MALE';
  phoneNumber: string;
  password: string;
  isFullRole?: boolean | null;
  userRoles?: {
    id?: number | null;
    userId: number;
    roleId: number;
  }[];
}
