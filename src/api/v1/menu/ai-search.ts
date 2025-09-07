import { apiClient } from '@/services/api-client';

export interface AiSearchResponse {
    success: boolean;
    code: number;
    message: string;
    data: {
        foodCombo: any[];
        products: any[];
    };
}

export const aiSearchMenu = async (query: string): Promise<AiSearchResponse> => {
    const params = new URLSearchParams();
    params.append('query', query);
    
    const response = await apiClient.post(`/api/menu/ai-search/semantic?${params.toString()}`);
    return response.data;
};