import { apiClient } from '@/services/api-client';
import { BaseListResponse } from '@/lib/response-object';

// Types for feedback system
export interface RestaurantFeedbackCreateDto {
    overallRating: number;
    title: string;
    reviewText?: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    branchId: number;
    orderType?: 'POS_ORDER' | 'PRE_ORDER' | 'BOOKING_TABLE';
    categoryRatings?: Record<string, number>;
    imageUrls?: string[];
}

export interface ProductFeedbackCreateDto {
    overallRating: number;
    title: string;
    reviewText: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    branchId: number;
    productId: number;
    orderId?: number;
    orderType?: 'POS_ORDER' | 'PRE_ORDER' | 'BOOKING_TABLE';
    categoryRatings?: Record<string, number>;
    imageUrls?: string[];
}

export interface FeedbackRatingDto {
    category:
        | 'SERVICE'
        | 'FOOD_QUALITY'
        | 'TASTE'
        | 'PRESENTATION'
        | 'VALUE_FOR_MONEY'
        | 'AMBIANCE'
        | 'CLEANLINESS'
        | 'SPEED';
    rating: number;
}

export interface FeedbackResponseCreateDto {
    responseText: string;
    internalNotes?: string;
    markAsResolved?: boolean;
}

export interface FeedbackResponseDto {
    id: number;
    feedbackType: 'RESTAURANT' | 'PRODUCT';
    overallRating: number;
    title: string;
    reviewText: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    branchId: number;
    branchName?: string;
    productId?: number;
    productName?: string;
    orderId?: number;
    orderType?: 'POS_ORDER' | 'PRE_ORDER' | 'BOOKING_TABLE';
    responseText?: string;
    responseDate?: string;
    respondedBy?: number;
    respondedByName?: string;
    feedbackStatus: 'PENDING' | 'RESPONDED' | 'RESOLVED' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
    updatedAt: string;
    categoryRatings?: Record<string, number>;
    images: string[];
    internalNotes?: string;
}

export interface FeedbackSummaryDto {
    totalFeedback: number;
    totalRestaurantFeedback: number;
    totalProductFeedback: number;
    averageRating: number;
    pendingFeedback: number;
    respondedFeedback: number;
    ratingDistribution: Record<number, number>;
}

// Customer Feedback API
export const customerFeedbackAPI = {
    // Submit restaurant feedback
    submitRestaurantFeedback: async (
        data: RestaurantFeedbackCreateDto
    ): Promise<FeedbackResponseDto> => {
        const response = await apiClient.post(
            '/api/feedback/customer/restaurant',
            data
        );
        return response.data;
    },

    // Submit product feedback
    submitProductFeedback: async (
        data: ProductFeedbackCreateDto
    ): Promise<FeedbackResponseDto> => {
        const response = await apiClient.post(
            '/api/feedback/customer/product',
            data
        );
        return response.data;
    },

    // Upload feedback images
    uploadFeedbackImages: async (
        feedbackId: number,
        files: File[]
    ): Promise<string[]> => {
        const formData = new FormData();
        files.forEach((file) => formData.append('images', file));

        const response = await apiClient.post(
            `/api/feedback/customer/${feedbackId}/images`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },
};

// Manager Feedback API
export const managerFeedbackAPI = {
    // Get all feedback with filters
    getAllFeedback: async (params: {
        branchId?: number;
        status?: string;
        feedbackType?: string;
        minRating?: number;
        maxRating?: number;
        startDate?: string;
        endDate?: string;
        search?: string;
        page?: number;
        size?: number;
    }): Promise<BaseListResponse<FeedbackResponseDto>> => {
        const response = await apiClient.get('/api/feedback/manager', {
            params,
        });
        return response.data.data;
    },

    // Get feedback summary
    getFeedbackSummary: async (params: {
        branchId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<FeedbackSummaryDto> => {
        const response = await apiClient.get('/api/feedback/manager/summary', {
            params,
        });
        return response.data;
    },

    // Get rating analytics
    getRatingAnalytics: async (params: {
        branchId?: number;
        startDate?: string;
        endDate?: string;
        feedbackType?: string;
    }): Promise<any> => {
        const response = await apiClient.get(
            '/api/feedback/manager/analytics/ratings',
            { params }
        );
        return response.data;
    },

    // Get feedback trends
    getFeedbackTrends: async (params: {
        branchId?: number;
        period?: string;
        periods?: number;
    }): Promise<any> => {
        const response = await apiClient.get(
            '/api/feedback/manager/analytics/trends',
            { params }
        );
        return response.data;
    },

    // Respond to feedback
    respondToFeedback: async (
        feedbackId: number,
        data: FeedbackResponseCreateDto
    ): Promise<FeedbackResponseDto> => {
        const response = await apiClient.post(
            `/api/feedback/manager/${feedbackId}/respond`,
            data
        );
        return response.data;
    },

    // Update feedback status
    updateFeedbackStatus: async (
        feedbackId: number,
        status: string
    ): Promise<FeedbackResponseDto> => {
        const response = await apiClient.put(
            `/api/feedback/manager/${feedbackId}/status`,
            { status }
        );
        return response.data;
    },

    // Update feedback priority
    updateFeedbackPriority: async (
        feedbackId: number,
        priority: string
    ): Promise<FeedbackResponseDto> => {
        const response = await apiClient.put(
            `/api/feedback/manager/${feedbackId}/priority`,
            { priority }
        );
        return response.data;
    },

    // Export feedback data
    exportFeedbackData: async (params: {
        format: string;
        branchId?: number;
        startDate?: string;
        endDate?: string;
    }): Promise<string> => {
        const response = await apiClient.get('/api/feedback/manager/export', {
            params,
        });
        return response.data;
    },
};
