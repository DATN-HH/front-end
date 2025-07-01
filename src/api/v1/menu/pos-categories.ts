import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ========== Type Definitions ==========

export type Status = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export interface PosCategoryCreateRequest {
  name: string;
  parentId?: number;
  sequence?: number;
  image?: string;
  description?: string;
}

export interface PosCategoryUpdateRequest {
  name: string;
  parentId?: number;
  sequence?: number;
  image?: string;
  description?: string;
}

export interface CategorySequenceItem {
  id: number;
  sequence: number;
}

export interface PosCategorySequenceUpdateRequest {
  categories: CategorySequenceItem[];
}

export interface PosCategoryResponse {
  id: number;
  name: string;
  sequence: number;
  image?: string;
  description?: string;
  status: Status;
  createdAt: string;
  updatedAt: string;
  
  // Parent information
  parentId?: number;
  parentName?: string;
  
  // Hierarchy information
  level: number;
  isRoot: boolean;
  hasChildren: boolean;
  hasProducts: boolean;
  
  // Children categories (for tree structure)
  children?: PosCategoryResponse[];
  
  // Counts for smart buttons
  childrenCount: number;
  productsCount: number;
}

// ========== API Functions ==========

// Create POS Category
export const createPosCategory = async (
  data: PosCategoryCreateRequest,
  saveAndNew: boolean = false
): Promise<PosCategoryResponse> => {
  const params = saveAndNew ? '?saveAndNew=true' : '';
  const response = await apiClient.post<ApiResponse<PosCategoryResponse>>(
    `/api/menu/pos-categories${params}`,
    data
  );
  return response.data.data;
};

// Get all POS categories (flat list)
export const getAllPosCategories = async (): Promise<PosCategoryResponse[]> => {
  const response = await apiClient.get<ApiResponse<PosCategoryResponse[]>>('/api/menu/pos-categories');
  return response.data.data;
};

// Get POS category tree structure
export const getPosCategoryTree = async (): Promise<PosCategoryResponse[]> => {
  const response = await apiClient.get<ApiResponse<PosCategoryResponse[]>>('/api/menu/pos-categories/tree');
  return response.data.data;
};

// Get single POS category
export const getPosCategory = async (id: number): Promise<PosCategoryResponse> => {
  const response = await apiClient.get<ApiResponse<PosCategoryResponse>>(`/api/menu/pos-categories/${id}`);
  return response.data.data;
};

// Update POS category
export const updatePosCategory = async (
  id: number,
  data: PosCategoryUpdateRequest
): Promise<PosCategoryResponse> => {
  const response = await apiClient.put<ApiResponse<PosCategoryResponse>>(
    `/api/menu/pos-categories/${id}`,
    data
  );
  return response.data.data;
};

// Delete POS category
export const deletePosCategory = async (id: number): Promise<string> => {
  const response = await apiClient.delete<ApiResponse<string>>(`/api/menu/pos-categories/${id}`);
  return response.data.data;
};

// Update category sequences
export const updateCategorySequences = async (
  data: PosCategorySequenceUpdateRequest
): Promise<string> => {
  const response = await apiClient.put<ApiResponse<string>>(
    '/api/menu/pos-categories/sequences',
    data
  );
  return response.data.data;
};

// Move category (convenience endpoint)
export const moveCategorySequence = async (
  id: number,
  direction: 'up' | 'down'
): Promise<string> => {
  const response = await apiClient.post<ApiResponse<string>>(
    `/api/menu/pos-categories/${id}/move?direction=${direction}`
  );
  return response.data.data;
};

// ========== React Query Hooks ==========

// POS Categories Hooks
export const useAllPosCategories = () => {
  return useQuery({
    queryKey: ['pos-categories', 'all'],
    queryFn: getAllPosCategories,
  });
};

export const usePosCategoryTree = () => {
  return useQuery({
    queryKey: ['pos-categories', 'tree'],
    queryFn: getPosCategoryTree,
  });
};

export const usePosCategory = (id: number) => {
  return useQuery({
    queryKey: ['pos-categories', id],
    queryFn: () => getPosCategory(id),
    enabled: !!id,
  });
};

export const useCreatePosCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ data, saveAndNew = false }: { data: PosCategoryCreateRequest; saveAndNew?: boolean }) =>
      createPosCategory(data, saveAndNew),
    onSuccess: () => {
      // Invalidate all POS category queries
      queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
    },
  });
};

export const useUpdatePosCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PosCategoryUpdateRequest }) =>
      updatePosCategory(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate all POS category queries
      queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
      queryClient.invalidateQueries({ queryKey: ['pos-categories', id] });
    },
  });
};

export const useDeletePosCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePosCategory,
    onSuccess: () => {
      // Invalidate all POS category queries
      queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
    },
  });
};

export const useUpdateCategorySequences = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateCategorySequences,
    onSuccess: () => {
      // Invalidate all POS category queries to refresh order
      queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
    },
  });
};

export const useMoveCategorySequence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, direction }: { id: number; direction: 'up' | 'down' }) =>
      moveCategorySequence(id, direction),
    onSuccess: () => {
      // Invalidate all POS category queries to refresh order
      queryClient.invalidateQueries({ queryKey: ['pos-categories'] });
    },
  });
};