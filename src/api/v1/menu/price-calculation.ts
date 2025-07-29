import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '..';

// Types for price calculation API
export interface PriceCalculationRequestItem {
    id: number;
    note?: string;
    quantity: number;
}

export interface PriceCalculationRequest {
    foodCombo: PriceCalculationRequestItem[];
    productVariant: PriceCalculationRequestItem[];
    product: PriceCalculationRequestItem[];
}

export interface PriceCalculationResponseItem {
    id: number;
    tempId: string;
    note?: string;
    price: number;
    promotionPrice: number | null;
    quantity: number;
    totalPrice: number;
}

export interface PriceCalculationResponse {
    foodCombo: PriceCalculationResponseItem[];
    productVariant: PriceCalculationResponseItem[];
    product: PriceCalculationResponseItem[];
    total: number;
    totalPromotion: number | null;
}

// API call
const calculatePrice = async (
    request: PriceCalculationRequest
): Promise<BaseResponse<PriceCalculationResponse>> => {
    const response = await apiClient.post<
        BaseResponse<PriceCalculationResponse>
    >('/menu/price/calculate', request);
    return response.data;
};

// Hook for price calculation
export const usePriceCalculation = () => {
    return useMutation({
        mutationFn: calculatePrice,
    });
};
