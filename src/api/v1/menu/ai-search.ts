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

export const aiSearchMenu = async (
    query: string
): Promise<AiSearchResponse> => {
    // The API expects the query parameter in the URL, so we need to properly encode it
    // Use encodeURIComponent to ensure proper encoding of special characters including Vietnamese
    const encodedQuery = encodeURIComponent(query);
    const response = await apiClient.post(
        `/api/menu/ai-search/semantic?query=${encodedQuery}`
    );
    return response.data;
};
