import { BranchResponse } from '@/lib/response-object';
import apiClient from '@/services/api-client';

export async function getBranches(): Promise<BranchResponse[]> {
    const response = await apiClient.get('/branch');
    const data = response.data.payload.data;
    console.log('getBranch', data);
    return data.map((branch: any) => ({
        id: branch?.id,
        name: branch?.name,
        address: branch?.address,
        phone: branch?.phone,
        status: branch?.status,
        managerId: branch?.manager?.id,
        managerName: branch?.manager?.fullName,
        updateAt: branch?.updateAt,
    }));
}

// export async function updateRole(
//     id: number,
//     roleUpdateRequest: RoleRequest
// ): Promise<RoleResponse> {
//     const response = await apiClient.put(`/role/${id}`, roleUpdateRequest);
//     const data = response.data.payload;
//     console.log('updateRole', data);
//     return {
//         id: data.id,
//         name: data.name,
//         description: data.description,
//         hexColor: data.hexColor,
//         status: data.status,
//     };
// }

// export async function createRole(
//     roleCreateRequest: RoleRequest
// ): Promise<RoleResponse> {
//     const response = await apiClient.post('/role', roleCreateRequest);
//     const data = response.data.payload;
//     console.log('createRole', data);
//     return {
//         id: data.id,
//         name: data.name,
//         description: data.description,
//         hexColor: data.hexColor,
//         status: data.status,
//     };
// }
