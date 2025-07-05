import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

// Types
export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  displayOrder?: number;
  parentId?: number;
  children?: Category[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
  displayOrder?: number;
  isFeatured?: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  variants?: ProductVariant[];
  attributes?: ProductAttribute[];
}

export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  sku?: string;
}

export interface ProductAttribute {
  id: number;
  name: string;
  values: ProductAttributeValue[];
}

export interface ProductAttributeValue {
  id: number;
  value: string;
  priceExtra?: number;
}

export interface FoodCombo {
  id: number;
  name: string;
  description?: string;
  basePrice: number;
  imageUrl?: string;
  variants?: FoodComboVariant[];
  items?: FoodComboItem[];
}

export interface FoodComboVariant {
  id: number;
  name: string;
  price: number;
}

export interface FoodComboItem {
  id: number;
  productId: number;
  product: Product;
  quantity: number;
  unitPrice?: number;
  isRequired: boolean;
  canSelectMultiple: boolean;
  maxSelections?: number;
}

// API functions
const getCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get('/api/pos/catalog/categories');
  return response.data.payload;
};

const getCategoriesByParent = async (parentId: number | null): Promise<Category[]> => {
  const url = parentId 
    ? `/api/pos/catalog/categories/parent/${parentId}`
    : '/api/pos/catalog/categories/root';
  const response = await apiClient.get(url);
  return response.data.payload;
};

const getCategory = async (categoryId: number): Promise<Category> => {
  const response = await apiClient.get(`/api/pos/catalog/categories/${categoryId}`);
  return response.data.payload;
};

const getProductsByCategory = async (categoryId: number): Promise<Product[]> => {
  const response = await apiClient.get(`/api/pos/catalog/categories/${categoryId}/products`);
  return response.data.payload;
};

const getProducts = async (page: number = 0, size: number = 20): Promise<Product[]> => {
  const response = await apiClient.get(`/api/pos/catalog/products?page=${page}&size=${size}`);
  return response.data.payload;
};

const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  const response = await apiClient.get(`/api/pos/catalog/products/search?q=${encodeURIComponent(searchTerm)}`);
  return response.data.payload;
};

const getFeaturedProducts = async (): Promise<Product[]> => {
  const response = await apiClient.get('/api/pos/catalog/products/featured');
  return response.data.payload;
};

const getProduct = async (productId: number): Promise<Product> => {
  const response = await apiClient.get(`/api/pos/catalog/products/${productId}`);
  return response.data.payload;
};

const getFoodCombos = async (): Promise<FoodCombo[]> => {
  const response = await apiClient.get('/api/menu/food-combos');
  return response.data.data;
};

const getFoodCombo = async (comboId: number): Promise<FoodCombo> => {
  const response = await apiClient.get(`/api/menu/food-combos/${comboId}`);
  return response.data.data;
};

// React Query hooks
export const useCategories = () => {
  return useQuery({
    queryKey: ['pos-categories'],
    queryFn: getCategories
  });
};

export const useCategoriesByParent = (parentId: number | null) => {
  return useQuery({
    queryKey: ['pos-categories-parent', parentId],
    queryFn: () => getCategoriesByParent(parentId)
  });
};

export const useCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['pos-category', categoryId],
    queryFn: () => getCategory(categoryId),
    enabled: !!categoryId
  });
};

export const useProductsByCategory = (categoryId: number) => {
  return useQuery({
    queryKey: ['pos-products-category', categoryId],
    queryFn: () => getProductsByCategory(categoryId),
    enabled: !!categoryId
  });
};

export const useProducts = (page: number = 0, size: number = 20) => {
  return useQuery({
    queryKey: ['pos-products', page, size],
    queryFn: () => getProducts(page, size)
  });
};

export const useSearchProducts = (searchTerm: string) => {
  return useQuery({
    queryKey: ['pos-products-search', searchTerm],
    queryFn: () => searchProducts(searchTerm),
    enabled: !!searchTerm && searchTerm.length >= 2
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ['pos-products-featured'],
    queryFn: getFeaturedProducts
  });
};

export const useProduct = (productId: number) => {
  return useQuery({
    queryKey: ['pos-product', productId],
    queryFn: () => getProduct(productId),
    enabled: !!productId
  });
};

export const useFoodCombos = () => {
  return useQuery({
    queryKey: ['pos-food-combos'],
    queryFn: getFoodCombos
  });
};

export const useFoodCombo = (comboId: number) => {
  return useQuery({
    queryKey: ['pos-food-combo', comboId],
    queryFn: () => getFoodCombo(comboId),
    enabled: !!comboId
  });
};