import { Role } from '@/lib/rbac';
import apiClient from '@/services/api-client';

export interface RoleResponse {
  id: number;
  name: Role;
  description: string;
  hexColor: string;
  status: string;
}

export interface RoleRequest {
  name: Role;
  description: string;
  hexColor: string;
  status: string;
}

export async function getRoles(): Promise<RoleResponse[]> {
  const response = await apiClient.get('/role');

  const data = response.data.payload;
  console.log('getRoles', data);
  return data.map((role: RoleResponse) => ({
    id: role.id,
    name: role.name,
    description: role.description,
    hexColor: role.hexColor,
    status: role.status,
  }));
}

export async function updateRole(
  id: number,
  roleUpdateRequest: RoleRequest
): Promise<RoleResponse> {
  const response = await apiClient.put(`/role/${id}`, roleUpdateRequest);
  const data = response.data.payload;
  console.log('updateRole', data);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    hexColor: data.hexColor,
    status: data.status,
  };
}

export async function createRole(
  roleCreateRequest: RoleRequest
): Promise<RoleResponse> {
  const response = await apiClient.post('/role', roleCreateRequest);
  const data = response.data.payload;
  console.log('createRole', data);
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    hexColor: data.hexColor,
    status: data.status,
  };
}

export async function deleteRole(id: number): Promise<void> {
  await apiClient.delete(`/role/${id}`);
  console.log('deleteRole', id);
}
