import { Role } from '@/lib/rbac';
import { LoginResponse } from '@/lib/response-object';
import apiClient from '@/services/api-client';

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
            branch: {
                id: data?.account?.branch?.id,
                name: data?.account?.branch?.name,
                address: data?.account?.branch?.address,
                phone: data?.account?.branch?.phone,
                status: data?.account?.branch?.status,
            },
        },

        token: data.token,
    };
}

export async function createUser(user: any) {
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
            branch: {
                id: data?.account?.branch?.id,
                name: data?.account?.branch?.name,
                address: data?.account?.branch?.address,
                phone: data?.account?.branch?.phone,
                status: data?.account?.branch?.status,
            },
        },
        token: data.token,
    };
}
