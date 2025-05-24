import apiClient from '@/services/api-client';
import qs from 'qs';

export async function getStaffShift(query: any): Promise<any[]> {
    const response = await apiClient.get('/staff-shifts', {
        params: query,
        paramsSerializer: (params) =>
            qs.stringify(params, {
                encode: true,
                arrayFormat: 'indices',
            }),
    });

    console.log('getStaffShift', response.data.data);

    return response.data.data;
}

export async function postStaffShiftBulk(staffShift: any[]): Promise<any[]> {
    const response = await apiClient.post('/staff-shifts/bulk', staffShift);
    return response.data.payload.data;
}

export async function publicStaffShifts(query: any): Promise<any[]> {
    const response = await apiClient.put('/staff-shifts/publish', {
        params: query,
        paramsSerializer: (params) =>
            qs.stringify(params, {
                encode: true,
                arrayFormat: 'indices',
            }),
    });
    return response.data.payload.data;
}

export async function delStaffShift(id : any): Promise<void> {
    await apiClient.delete(`/staff-shifts/${id}`);
}

// export async function putShift(id : string, shift : Shift): Promise<Shift> {
//     const response = await apiClient.put(`/shifts/${id}`, shift);
//     const payload = response.data.payload;
//     return {
//         id: payload.id,
//         startTime: payload.startTime,
//         endTime: payload.endTime,
//         branchId: payload.branchId,
//         branchName: payload.branchName,
//         requirements: payload.requirements.map((req: any) => ({
//             id: req.id,
//             role: req.role,
//             quantity: req.quantity,
//         })),
//     };
// }

// export async function deleteShift(id: number | string): Promise<void> {
//     await apiClient.delete(`/shifts/${id}`);
// }
