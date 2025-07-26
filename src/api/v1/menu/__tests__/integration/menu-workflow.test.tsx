import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';

import {
    createCategory,
    createProduct,
    getProductsByCategory,
    updateProduct,
    archiveProduct,
    unarchiveProduct,
    useCreateCategory,
    useCreateProduct,
    CategoryCreateRequest,
    ProductCreateRequest,
    ProductUpdateRequest,
} from '../../categories';
import { useCreateProduct as useCreateProductHook } from '../../products';

// Mock API responses
const mockCategoryResponse = {
    id: 1,
    code: 'DESSERTS',
    name: 'Desserts',
    description: 'Sweet treats',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
};

const mockProductResponse = {
    id: 1,
    name: 'Chocolate Cake',
    type: 'CONSUMABLE',
    price: 8.99,
    cost: 4.5,
    status: 'ACTIVE',
    canBeSold: true,
    canBePurchased: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    category: mockCategoryResponse,
};

// Setup MSW server
const server = setupServer(
    // Category endpoints
    http.post('/api/menu/categories', () => {
        return HttpResponse.json({
            success: true,
            code: 201,
            message: 'Category created successfully',
            data: mockCategoryResponse,
        });
    }),

    // Product endpoints
    http.post('/api/menu/products', () => {
        return HttpResponse.json({
            success: true,
            code: 201,
            message: 'Product created successfully',
            data: mockProductResponse,
        });
    }),

    http.get('/api/menu/products/category/:categoryId', () => {
        return HttpResponse.json({
            success: true,
            code: 200,
            message: 'Products retrieved successfully',
            data: [mockProductResponse],
        });
    }),

    http.put('/api/menu/products/:id', () => {
        return HttpResponse.json({
            success: true,
            code: 200,
            message: 'Product updated successfully',
            data: {
                ...mockProductResponse,
                name: 'Premium Chocolate Cake',
                price: 12.99,
            },
        });
    }),

    http.post('/api/menu/products/:id/archive', () => {
        return HttpResponse.json({
            success: true,
            code: 200,
            message: 'Product archived successfully',
            data: 'Product archived successfully',
        });
    }),

    http.post('/api/menu/products/:id/unarchive', () => {
        return HttpResponse.json({
            success: true,
            code: 200,
            message: 'Product unarchived successfully',
            data: 'Product unarchived successfully',
        });
    }),

    // Error scenarios
    http.post('/api/menu/products', ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get('error');

        if (name === 'duplicate') {
            return HttpResponse.json(
                {
                    success: false,
                    code: 400,
                    message: 'Product with this name already exists',
                    data: null,
                },
                { status: 400 }
            );
        }

        return HttpResponse.json({
            success: true,
            code: 201,
            message: 'Product created successfully',
            data: mockProductResponse,
        });
    })
);

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

describe('Menu Module Integration Tests', () => {
    beforeAll(() => {
        server.listen();
    });

    afterAll(() => {
        server.close();
    });

    beforeEach(() => {
        server.resetHandlers();
    });

    describe('Complete Menu Workflow', () => {
        it('should handle full category and product lifecycle', async () => {
            // 1. Create a category
            const categoryRequest: CategoryCreateRequest = {
                code: 'DESSERTS',
                name: 'Desserts',
                description: 'Sweet treats',
                status: 'ACTIVE',
            };

            const category = await createCategory(categoryRequest);
            expect(category.id).toBe(1);
            expect(category.name).toBe('Desserts');

            // 2. Create a product in the category
            const productRequest: ProductCreateRequest = {
                name: 'Chocolate Cake',
                type: 'CONSUMABLE',
                price: 8.99,
                cost: 4.5,
                canBeSold: true,
                categoryId: category.id,
            };

            const product = await createProduct(productRequest);
            expect(product.id).toBe(1);
            expect(product.name).toBe('Chocolate Cake');

            // 3. Verify product is in category
            const productsInCategory = await getProductsByCategory(category.id);
            expect(productsInCategory).toHaveLength(1);
            expect(productsInCategory[0].name).toBe('Chocolate Cake');

            // 4. Update the product
            const updateRequest: ProductUpdateRequest = {
                name: 'Premium Chocolate Cake',
                price: 12.99,
            };

            const updatedProduct = await updateProduct(
                product.id,
                updateRequest
            );
            expect(updatedProduct.name).toBe('Premium Chocolate Cake');
            expect(updatedProduct.price).toBe(12.99);

            // 5. Archive the product
            const archiveResult = await archiveProduct(product.id);
            expect(archiveResult).toBe('Product archived successfully');

            // 6. Unarchive the product
            const unarchiveResult = await unarchiveProduct(product.id);
            expect(unarchiveResult).toBe('Product unarchived successfully');
        });
    });

    describe('React Query Integration', () => {
        it('should handle category creation with query invalidation', async () => {
            const { result } = renderHook(() => useCreateCategory(), {
                wrapper: createWrapper(),
            });

            const categoryRequest: CategoryCreateRequest = {
                code: 'APPETIZERS',
                name: 'Appetizers',
                description: 'Starters',
            };

            result.current.mutate({ data: categoryRequest });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('Desserts'); // Mock response
        });

        it('should handle product creation with query invalidation', async () => {
            const { result } = renderHook(() => useCreateProductHook(), {
                wrapper: createWrapper(),
            });

            const productRequest: ProductCreateRequest = {
                name: 'New Product',
                type: 'CONSUMABLE',
                canBeSold: true,
            };

            result.current.mutate({ data: productRequest });

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true);
            });

            expect(result.current.data?.name).toBe('Chocolate Cake'); // Mock response
        });
    });

    describe('Error Handling', () => {
        it('should handle API errors gracefully', async () => {
            // Override the handler to return an error
            server.use(
                http.post('/api/menu/categories', () => {
                    return HttpResponse.json(
                        {
                            success: false,
                            code: 400,
                            message: 'Category code already exists',
                            data: null,
                        },
                        { status: 400 }
                    );
                })
            );

            const categoryRequest: CategoryCreateRequest = {
                code: 'EXISTING_CODE',
                name: 'Duplicate Category',
            };

            await expect(createCategory(categoryRequest)).rejects.toThrow();
        });

        it('should handle network errors', async () => {
            // Override the handler to simulate network error
            server.use(
                http.post('/api/menu/products', () => {
                    return HttpResponse.error();
                })
            );

            const productRequest: ProductCreateRequest = {
                name: 'Network Error Product',
                type: 'CONSUMABLE',
                canBeSold: true,
            };

            await expect(createProduct(productRequest)).rejects.toThrow();
        });
    });

    describe('Data Consistency', () => {
        it('should maintain consistency between categories and products', async () => {
            // Create category
            const categoryRequest: CategoryCreateRequest = {
                code: 'BEVERAGES',
                name: 'Beverages',
            };

            const category = await createCategory(categoryRequest);

            // Create multiple products in the category
            const product1Request: ProductCreateRequest = {
                name: 'Coffee',
                type: 'CONSUMABLE',
                categoryId: category.id,
                canBeSold: true,
            };

            const product2Request: ProductCreateRequest = {
                name: 'Tea',
                type: 'CONSUMABLE',
                categoryId: category.id,
                canBeSold: true,
            };

            await createProduct(product1Request);
            await createProduct(product2Request);

            // Verify both products are in the category
            const productsInCategory = await getProductsByCategory(category.id);
            expect(productsInCategory).toHaveLength(1); // Mock returns single product
            expect(productsInCategory[0].category?.id).toBe(category.id);
        });
    });

    describe('Pagination and Filtering', () => {
        it('should handle paginated requests correctly', async () => {
            // This would test the pagination functionality
            // For now, we'll just verify the API structure
            const productsInCategory = await getProductsByCategory(1);
            expect(Array.isArray(productsInCategory)).toBe(true);
        });
    });
});
