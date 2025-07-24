import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

import { apiClient } from '@/services/api-client';
import {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryByCode,
  searchCategories,
  getCategoryList,
  archiveCategory,
  unarchiveCategory,
  useAllCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  CategoryCreateRequest,
  CategoryUpdateRequest,
  CategoryResponse,
  CategoryListParams,
} from '../categories';

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

describe('Categories API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('API Functions', () => {
    const mockCategory: CategoryResponse = {
      id: 1,
      code: 'BEVERAGES',
      name: 'Beverages',
      description: 'All kinds of drinks',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      productCount: 5,
    };

    describe('getAllCategories', () => {
      it('should fetch all categories successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Success',
            data: [mockCategory],
          },
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await getAllCategories();

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/menu/categories');
        expect(result).toEqual([mockCategory]);
      });

      it('should handle API errors', async () => {
        mockApiClient.get.mockRejectedValue(new Error('Network error'));

        await expect(getAllCategories()).rejects.toThrow('Network error');
      });
    });

    describe('createCategory', () => {
      it('should create category successfully', async () => {
        const createRequest: CategoryCreateRequest = {
          code: 'DESSERTS',
          name: 'Desserts',
          description: 'Sweet treats',
          status: 'ACTIVE',
        };

        const mockResponse = {
          data: {
            success: true,
            code: 201,
            message: 'Created',
            data: { ...mockCategory, ...createRequest },
          },
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const result = await createCategory(createRequest);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/menu/categories',
          createRequest
        );
        expect(result.name).toBe(createRequest.name);
      });

      it('should create category with saveAndNew flag', async () => {
        const createRequest: CategoryCreateRequest = {
          code: 'APPETIZERS',
          name: 'Appetizers',
        };

        const mockResponse = {
          data: {
            success: true,
            code: 201,
            message: 'Created',
            data: mockCategory,
          },
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        await createCategory(createRequest, true);

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/menu/categories?saveAndNew=true',
          createRequest
        );
      });
    });

    describe('getCategory', () => {
      it('should fetch single category successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Success',
            data: mockCategory,
          },
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await getCategory(1);

        expect(mockApiClient.get).toHaveBeenCalledWith('/api/menu/categories/1');
        expect(result).toEqual(mockCategory);
      });
    });

    describe('updateCategory', () => {
      it('should update category successfully', async () => {
        const updateRequest: CategoryUpdateRequest = {
          name: 'Updated Beverages',
          description: 'Updated description',
        };

        const updatedCategory = { ...mockCategory, ...updateRequest };
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Updated',
            data: updatedCategory,
          },
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await updateCategory(1, updateRequest);

        expect(mockApiClient.put).toHaveBeenCalledWith(
          '/api/menu/categories/1',
          updateRequest
        );
        expect(result.name).toBe(updateRequest.name);
      });
    });

    describe('deleteCategory', () => {
      it('should delete category successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Deleted',
            data: 'Category deleted successfully',
          },
        };
        mockApiClient.delete.mockResolvedValue(mockResponse);

        const result = await deleteCategory(1);

        expect(mockApiClient.delete).toHaveBeenCalledWith('/api/menu/categories/1');
        expect(result).toBe('Category deleted successfully');
      });
    });

    describe('getCategoryByCode', () => {
      it('should fetch category by code successfully', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Success',
            data: mockCategory,
          },
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await getCategoryByCode('BEVERAGES');

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/api/menu/categories/code/BEVERAGES'
        );
        expect(result).toEqual(mockCategory);
      });
    });

    describe('searchCategories', () => {
      it('should search categories by name', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Success',
            data: [mockCategory],
          },
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const result = await searchCategories('Bev');

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/api/menu/categories/search?name=Bev'
        );
        expect(result).toEqual([mockCategory]);
      });
    });

    describe('getCategoryList', () => {
      it('should fetch paginated category list', async () => {
        const params: CategoryListParams = {
          search: 'bev',
          page: 0,
          size: 10,
          archived: false,
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
              data: [mockCategory],
            },
          },
        };
        mockApiClient.get.mockResolvedValue(mockApiResponse);

        const result = await getCategoryList(params);

        expect(mockApiClient.get).toHaveBeenCalledWith(
          '/api/menu/categories/list?search=bev&page=0&size=10&archived=false'
        );
        expect(result.content).toEqual([mockCategory]);
        expect(result.totalElements).toBe(1);
      });
    });

    describe('archiveCategory', () => {
      it('should archive category successfully', async () => {
        const archivedCategory = { ...mockCategory, status: 'DELETED' as const };
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Archived',
            data: archivedCategory,
          },
        };
        mockApiClient.put.mockResolvedValue(mockResponse);

        const result = await archiveCategory(1);

        expect(mockApiClient.put).toHaveBeenCalledWith(
          '/api/menu/categories/1',
          { status: 'DELETED' }
        );
        expect(result.status).toBe('DELETED');
      });
    });
  });

  describe('React Query Hooks', () => {
    const mockCategory: CategoryResponse = {
      id: 1,
      code: 'BEVERAGES',
      name: 'Beverages',
      description: 'All kinds of drinks',
      status: 'ACTIVE',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    describe('useAllCategories', () => {
      it('should fetch all categories', async () => {
        const mockResponse = {
          data: {
            success: true,
            code: 200,
            message: 'Success',
            data: [mockCategory],
          },
        };
        mockApiClient.get.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAllCategories(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual([mockCategory]);
        expect(mockApiClient.get).toHaveBeenCalledWith('/api/menu/categories');
      });
    });

    describe('useCreateCategory', () => {
      it('should create category and invalidate queries', async () => {
        const createRequest: CategoryCreateRequest = {
          code: 'DESSERTS',
          name: 'Desserts',
        };

        const mockResponse = {
          data: {
            success: true,
            code: 201,
            message: 'Created',
            data: mockCategory,
          },
        };
        mockApiClient.post.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useCreateCategory(), {
          wrapper: createWrapper(),
        });

        result.current.mutate({ data: createRequest });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockApiClient.post).toHaveBeenCalledWith(
          '/api/menu/categories',
          createRequest
        );
      });
    });
  });
});
