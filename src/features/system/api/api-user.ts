import qs from 'qs';

import { BaseListRequest } from '@/lib/request-object';
import apiClient from '@/services/api-client';

export async function getListUsers(query: BaseListRequest = {}): Promise<any> {
    const response = await apiClient.get('/user/list', {
        params: query,
        paramsSerializer: (params) =>
            qs.stringify(params, {
                encode: true,
                arrayFormat: 'indices',
            }),
    });

    return response.data.payload;
}

export async function putUser(userId: string, userInfo: any): Promise<any> {
    const response = await apiClient.put(`/user/${userId}`, userInfo);

    return response.data.payload;
}

export async function delUser(userId: string): Promise<any> {
    const response = await apiClient.delete(`/user/${userId}`);

    return response.data.payload;
}
