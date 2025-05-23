import apiClient from '@/services/api-client';

export type Shift = {
    id?: number | string | null;
    startTime: string;
    endTime: string;
    branchId: number;
    branchName?: string;
    requirements: Requirement[];
};

export type Requirement = {
    id?: number;
    role: string;
    quantity: number;
};

export async function getShifts(
    branchId: any
): Promise<Shift[]> {
    const response = await apiClient.get('/shifts', {
        params: {
            branchId,
        },
    });
    const payload = response.data.payload;
    // console.log('shifts: ', payload);
    return payload.map((item: any) => ({
        id: item.id,
        startTime: item.startTime,
        endTime: item.endTime,
        branchId: item.branchId,
        branchName: item.branchName,
        requirements: item.requirements.map((req: any) => ({
            id: req.id,
            role: req.role,
            quantity: req.quantity,
        })),
    }));
}

export async function postShift(shift : Shift): Promise<Shift> {
    const response = await apiClient.post('/shifts', shift);
    const payload = response.data.payload;
    return {
        id: payload.id,
        startTime: payload.startTime,
        endTime: payload.endTime,
        branchId: payload.branchId,
        branchName: payload.branchName,
        requirements: payload.requirements.map((req: any) => ({
            id: req.id,
            role: req.role,
            quantity: req.quantity,
        })),
    };
}

export async function putShift(id : string, shift : Shift): Promise<Shift> {
    const response = await apiClient.put(`/shifts/${id}`, shift);
    const payload = response.data.payload;
    return {
        id: payload.id,
        startTime: payload.startTime,
        endTime: payload.endTime,
        branchId: payload.branchId,
        branchName: payload.branchName,
        requirements: payload.requirements.map((req: any) => ({
            id: req.id,
            role: req.role,
            quantity: req.quantity,
        })),
    };
}

export async function deleteShift(id: number | string): Promise<void> {
    await apiClient.delete(`/shifts/${id}`);
}
