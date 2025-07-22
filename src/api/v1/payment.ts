import { useMutation } from '@tanstack/react-query';

import { apiClient } from '@/services/api-client';

import { BaseResponse } from '.';

// Types
export interface CheckoutResponseData {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
}

// API calls
const createPaymentLinkForOrder = async (
    orderId: number
): Promise<CheckoutResponseData> => {
    const response = await apiClient.post<BaseResponse<CheckoutResponseData>>(
        `/payment/create-payment-link-for-order/${orderId}`
    );
    return response.data.payload;
};

const createPaymentLinkForBookingTable = async (
    bookingTableId: number
): Promise<CheckoutResponseData> => {
    const response = await apiClient.post<BaseResponse<CheckoutResponseData>>(
        `/payment/create-payment-link-for-booking-table/${bookingTableId}`
    );
    return response.data.payload;
};

const createPaymentLinkForPreOrder = async (
    preOrderId: number
): Promise<CheckoutResponseData> => {
    const response = await apiClient.post<BaseResponse<CheckoutResponseData>>(
        `/payment/create-payment-link-for-pre-order/${preOrderId}`
    );
    return response.data.payload;
};

// Hooks
export const useCreatePaymentLinkForOrder = () => {
    return useMutation({
        mutationFn: createPaymentLinkForOrder,
    });
};

export const useCreatePaymentLinkForBookingTable = () => {
    return useMutation({
        mutationFn: createPaymentLinkForBookingTable,
    });
};

export const useCreatePaymentLinkForPreOrder = () => {
    return useMutation({
        mutationFn: createPaymentLinkForPreOrder,
    });
};
