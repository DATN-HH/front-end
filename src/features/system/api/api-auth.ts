import { Role } from '@/lib/rbac';
import apiClient from '@/services/api-client';

export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  isFullRole: boolean;
  roles: Role[];
}

export interface LoginResponse {
  user: User;
  token: string;
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

export interface CreatedUserResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  birthdate: string;
  gender: 'FEMALE' | 'MALE';
  phoneNumber: string;
  isFullRole: boolean | null;
  userRoles: any[];
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  const response = await apiClient.post('/user/sign-in', credentials);

  const data = response.data.payload;

  const roles: Role[] = data.account.userRoles.map(
    (r: any) => r.role.name as Role
  );

  return {
    user: {
      id: data.account.id,
      email: data.account.email,
      username: data.account.username,
      fullName: data.account.fullName,
      isFullRole: data.account.isFullRole,
      roles,
    },
    token: data.token,
  };
}

export async function createUser(user: CreateUserPayload) {
  const payload = {
    ...user,
    isFullRole: user.isFullRole ?? null,
    userRoles: user.userRoles ?? [],
  };

  const response = await apiClient.post('/user', payload);

  return response.data.payload;
}

export async function verifyToken(token: string): Promise<LoginResponse> {
  const response = await apiClient.post('/user/verify-token', { token });

  const data = response.data.payload;

  const roles: Role[] = data.account.userRoles.map(
    (r: any) => r.role.name as Role
  );

  return {
    user: {
      id: data.account.id,
      email: data.account.email,
      username: data.account.username,
      fullName: data.account.fullName,
      isFullRole: data.account.isFullRole,
      roles,
    },
    token: data.token,
  };
}
