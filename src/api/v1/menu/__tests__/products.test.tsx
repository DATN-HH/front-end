import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { apiClient } from '@/services/api-client';
import {
    getAllProducts,
    createProduct,
    getProduct,
    getProductDetail,
    updateProduct,
    getProductsByCategory,
    searchProducts,
    getProductList,
    archiveProduct,
    unarchiveProduct,
    useAllProducts,
    useCreateProduct,
    useUpdateProduct,
    ProductCreateRequest,
    ProductUpdateRequest,
    ProductResponse,
    ProductDetailResponse,
    ProductListParams,
} from '../products';

// Mock the API client
vi.mock('@/services/api-client', () => ({
    apiClient: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn(),
    },
}));

const mockApiClient = vi.mocked(apiClient);

// Test wrapper for React Query
const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};

describe('Products API', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('API Functions', () => {
        const mockProduct: ProductResponse = {
            id: 1,
            name: 'Test Product',
            type: 'CONSUMABLE',
            price: 10.99,
            cost: 5.5,
            status: 'ACTIVE',
            canBeSold: true,
            canBePurchased: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z',
        };

        describe('getAllProducts', () => {
            it('should fetch all products successfully', async () => {
                const mockResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Success',
                        data: [mockProduct],
                    },
                };
                mockApiClient.get.mockResolvedValue(mockResponse);

                const result = await getAllProducts();

                expect(mockApiClient.get).toHaveBeenCalledWith(
                    '/api/menu/products'
                );
                expect(result).toEqual([mockProduct]);
            });

            it('should handle API errors', async () => {
                mockApiClient.get.mockRejectedValue(new Error('Network error'));

                await expect(getAllProducts()).rejects.toThrow('Network error');
            });
        });

        describe('createProduct', () => {
            it('should create product successfully', async () => {
                const createRequest: ProductCreateRequest = {
                    name: 'New Product',
                    type: 'CONSUMABLE',
                    price: 15.99,
                    canBeSold: true,
                };

                const mockResponse = {
                    data: {
                        success: true,
                        code: 201,
                        message: 'Created',
                        data: { ...mockProduct, ...createRequest },
                    },
                };
                mockApiClient.post.mockResolvedValue(mockResponse);

                const result = await createProduct(createRequest);

                expect(mockApiClient.post).toHaveBeenCalledWith(
                    '/api/menu/products?saveAndNew=false',
                    createRequest
                );
                expect(result.name).toBe(createRequest.name);
            });

            it('should create product with saveAndNew flag', async () => {
                const createRequest: ProductCreateRequest = {
                    name: 'New Product',
                    type: 'CONSUMABLE',
                };

                const mockResponse = {
                    data: {
                        success: true,
                        code: 201,
                        message: 'Created',
                        data: mockProduct,
                    },
                };
                mockApiClient.post.mockResolvedValue(mockResponse);

                await createProduct(createRequest, true);

                expect(mockApiClient.post).toHaveBeenCalledWith(
                    '/api/menu/products?saveAndNew=true',
                    createRequest
                );
            });
        });

        describe('getProduct', () => {
            it('should fetch single product successfully', async () => {
                const mockResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Success',
                        data: mockProduct,
                    },
                };
                mockApiClient.get.mockResolvedValue(mockResponse);

                const result = await getProduct(1);

                expect(mockApiClient.get).toHaveBeenCalledWith(
                    '/api/menu/products/1'
                );
                expect(result).toEqual(mockProduct);
            });
        });

        describe('updateProduct', () => {
            it('should update product successfully', async () => {
                const updateRequest: ProductUpdateRequest = {
                    name: 'Updated Product',
                    price: 20.99,
                };

                const mockDetailResponse: ProductDetailResponse = {
                    ...mockProduct,
                    ...updateRequest,
                    createdBy: 'admin',
                    updatedBy: 'admin',
                };

                const mockResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Updated',
                        data: mockDetailResponse,
                    },
                };
                mockApiClient.put.mockResolvedValue(mockResponse);

                const result = await updateProduct(1, updateRequest);

                expect(mockApiClient.put).toHaveBeenCalledWith(
                    '/api/menu/products/1',
                    updateRequest
                );
                expect(result.name).toBe(updateRequest.name);
            });
        });

        describe('getProductList', () => {
            it('should fetch paginated product list', async () => {
                const params: ProductListParams = {
                    search: 'test',
                    page: 0,
                    size: 10,
                    type: 'CONSUMABLE',
                };

                const mockApiResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Success',
                        data: {
                            page: 0,
                            size: 10,
                            total: 1,
                            data: [mockProduct],
                        },
                    },
                };
                mockApiClient.get.mockResolvedValue(mockApiResponse);

                const result = await getProductList(params);

                expect(mockApiClient.get).toHaveBeenCalledWith(
                    '/api/menu/products/list?search=test&page=0&size=10&type=CONSUMABLE'
                );
                expect(result.content).toEqual([mockProduct]);
                expect(result.totalElements).toBe(1);
                expect(result.totalPages).toBe(1);
            });
        });

        describe('archiveProduct', () => {
            it('should archive product successfully', async () => {
                const mockResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Archived',
                        data: 'Product archived successfully',
                    },
                };
                mockApiClient.post.mockResolvedValue(mockResponse);

                const result = await archiveProduct(1);

                expect(mockApiClient.post).toHaveBeenCalledWith(
                    '/api/menu/products/1/archive'
                );
                expect(result).toBe('Product archived successfully');
            });
        });
    });

    describe('React Query Hooks', () => {
        describe('useAllProducts', () => {
            it('should fetch all products', async () => {
                const mockResponse = {
                    data: {
                        success: true,
                        code: 200,
                        message: 'Success',
                        data: [mockProduct],
                    },
                };
                mockApiClient.get.mockResolvedValue(mockResponse);

                const { result } = renderHook(() => useAllProducts(), {
                    wrapper: createWrapper(),
                });

                await waitFor(() => {
                    expect(result.current.isSuccess).toBe(true);
                });

                expect(result.current.data).toEqual([mockProduct]);
                expect(mockApiClient.get).toHaveBeenCalledWith(
                    '/api/menu/products'
                );
            });
        });

        describe('useCreateProduct', () => {
            it('should create product and invalidate queries', async () => {
                const createRequest: ProductCreateRequest = {
                    name: 'New Product',
                    type: 'CONSUMABLE',
                };

                const mockResponse = {
                    data: {
                        success: true,
                        code: 201,
                        message: 'Created',
                        data: mockProduct,
                    },
                };
                mockApiClient.post.mockResolvedValue(mockResponse);

                const { result } = renderHook(() => useCreateProduct(), {
                    wrapper: createWrapper(),
                });

                result.current.mutate({ data: createRequest });

                await waitFor(() => {
                    expect(result.current.isSuccess).toBe(true);
                });

                expect(mockApiClient.post).toHaveBeenCalledWith(
                    '/api/menu/products?saveAndNew=false',
                    createRequest
                );
            });
        });
    });
});
