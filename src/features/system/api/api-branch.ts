import { BranchResponse } from '@/lib/response-object';
import apiClient from '@/services/api-client';

export async function getBranches(): Promise<BranchResponse[]> {
  const response = await apiClient.get('/branch');
  const data = response.data.payload.data;
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
