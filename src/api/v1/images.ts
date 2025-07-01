import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// ========== Type Definitions ==========

export interface ImageUploadResponse {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  resourceType: string;
  createdAt: string;
  folder: string;
  originalFilename: string;
}

// API Response wrapper interface
interface ApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}

// ========== API Functions ==========

// Upload single image using /api/images/upload
export const uploadImage = async (file: File, folder?: string): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiClient.post<ApiResponse<ImageUploadResponse>>('/api/images/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Upload multiple images using /api/images/upload/multiple
export const uploadMultipleImages = async (files: File[], folder?: string): Promise<ImageUploadResponse[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('files', file);
  });
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiClient.post<ApiResponse<ImageUploadResponse[]>>('/api/images/upload/multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Update image using /api/images/{publicId}
export const updateImage = async (publicId: string, file: File, folder?: string): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) {
    formData.append('folder', folder);
  }

  const response = await apiClient.put<ApiResponse<ImageUploadResponse>>(`/api/images/${publicId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};

// Delete image using /api/images/{publicId}
export const deleteImage = async (publicId: string): Promise<string> => {
  const response = await apiClient.delete<ApiResponse<string>>(`/api/images/${publicId}`);
  return response.data.data;
};

// Get supported formats using /api/images/formats
export const getSupportedFormats = async (): Promise<string[]> => {
  const response = await apiClient.get<ApiResponse<string[]>>('/api/images/formats');
  return response.data.data;
};

// Get upload constraints using /api/images/constraints
export const getUploadConstraints = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<string>>('/api/images/constraints');
  return response.data.data;
};

// Health check using /api/images/health
export const healthCheck = async (): Promise<string> => {
  const response = await apiClient.get<ApiResponse<string>>('/api/images/health');
  return response.data.data;
};

// ========== React Query Hooks ==========

// Query hooks
export const useSupportedFormats = () => {
  return useQuery({
    queryKey: ['images', 'formats'],
    queryFn: getSupportedFormats,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useUploadConstraints = () => {
  return useQuery({
    queryKey: ['images', 'constraints'],
    queryFn: getUploadConstraints,
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useImageHealthCheck = () => {
  return useQuery({
    queryKey: ['images', 'health'],
    queryFn: healthCheck,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutation hooks
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ file, folder }: { file: File; folder?: string }) =>
      uploadImage(file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

export const useUploadMultipleImages = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ files, folder }: { files: File[]; folder?: string }) =>
      uploadMultipleImages(files, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

export const useUpdateImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ publicId, file, folder }: { publicId: string; file: File; folder?: string }) =>
      updateImage(publicId, file, folder),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
};

export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
    },
  });
}; 