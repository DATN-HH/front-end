import { BaseListRequest, RoleRequest } from '@/lib/request-object';
import { BaseListResponse, RoleResponse } from '@/lib/response-object';
import apiClient from '@/services/api-client';
import qs from 'qs';

export async function getRoles(
    query: BaseListRequest = {}
): Promise<BaseListResponse<RoleResponse>> {
    const response = await apiClient.get('/role', {
        params: query,
        paramsSerializer: (params) =>
            qs.stringify(params, {
                encode: true,
                arrayFormat: 'indices',
            }),
    });

    const payload = response.data.payload;
    return {
        page: payload.page,
        size: payload.size,
        total: payload.total,
        data: payload.data.map((role: RoleResponse) => ({
            id: role.id,
            name: role.name,
            description: role.description,
            hexColor: role.hexColor,
            status: role.status,
        })),
    };
}

export async function updateRole(
    id: number,
    roleUpdateRequest: RoleRequest
): Promise<RoleResponse> {
    const response = await apiClient.put(`/role/${id}`, roleUpdateRequest);
    const data = response.data.payload;
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
}
