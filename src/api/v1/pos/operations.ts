import { apiClient } from '@/services/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  PosApiResponse,
  CashTransaction,
  CashTransactionRequest,
  PosOrder,
  PosOrderSummary,
  PosNotification,
} from './types';

// ========== API Functions ==========

// Get orders summary for POS dashboard
export const getPosOrderSummary = async (): Promise<PosOrderSummary> => {
  const response = await apiClient.get<PosApiResponse<PosOrderSummary>>('/api/pos/orders/summary');
  return response.data.data;
};

// Get active orders
export const getPosOrders = async (status?: string): Promise<PosOrder[]> => {
  const params = status ? `?status=${status}` : '';
  const response = await apiClient.get<PosApiResponse<PosOrder[]>>(`/api/pos/orders${params}`);
  return response.data.data;
};

// Get single order
export const getPosOrder = async (orderId: number): Promise<PosOrder> => {
  const response = await apiClient.get<PosApiResponse<PosOrder>>(`/api/pos/orders/${orderId}`);
  return response.data.data;
};

// Update order status
export const updateOrderStatus = async (
  orderId: number,
  status: string
): Promise<PosOrder> => {
  const response = await apiClient.patch<PosApiResponse<PosOrder>>(
    `/api/pos/orders/${orderId}/status`,
    { status }
  );
  return response.data.data;
};

// Cash In transaction
export const cashIn = async (data: CashTransactionRequest): Promise<CashTransaction> => {
  const response = await apiClient.post<PosApiResponse<CashTransaction>>(
    '/api/pos/cash/in',
    data
  );
  return response.data.data;
};

// Cash Out transaction
export const cashOut = async (data: CashTransactionRequest): Promise<CashTransaction> => {
  const response = await apiClient.post<PosApiResponse<CashTransaction>>(
    '/api/pos/cash/out',
    data
  );
  return response.data.data;
};

// Get cash transactions history
export const getCashTransactions = async (
  limit: number = 10
): Promise<CashTransaction[]> => {
  const response = await apiClient.get<PosApiResponse<CashTransaction[]>>(
    `/api/pos/cash/transactions?limit=${limit}`
  );
  return response.data.data;
};

// Get cash balance for current session
export const getCashBalance = async (): Promise<{ balance: number; transactions: number }> => {
  const response = await apiClient.get<PosApiResponse<{ balance: number; transactions: number }>>(
    '/api/pos/cash/balance'
  );
  return response.data.data;
};

// Get POS notifications
export const getPosNotifications = async (unreadOnly: boolean = false): Promise<PosNotification[]> => {
  const params = unreadOnly ? '?unread=true' : '';
  const response = await apiClient.get<PosApiResponse<PosNotification[]>>(
    `/api/pos/notifications${params}`
  );
  return response.data.data;
};

// Mark notification as read
export const markNotificationRead = async (notificationId: number): Promise<void> => {
  await apiClient.patch(`/api/pos/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllNotificationsRead = async (): Promise<void> => {
  await apiClient.patch('/api/pos/notifications/read-all');
};

// ========== React Query Hooks ==========

// Get orders summary
export const usePosOrderSummary = () => {
  return useQuery({
    queryKey: ['pos', 'orders', 'summary'],
    queryFn: getPosOrderSummary,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

// Get orders
export const usePosOrders = (status?: string) => {
  return useQuery({
    queryKey: ['pos', 'orders', status || 'all'],
    queryFn: () => getPosOrders(status),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
};

// Get single order
export const usePosOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['pos', 'orders', orderId],
    queryFn: () => getPosOrder(orderId),
    enabled: !!orderId,
  });
};

// Update order status
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) =>
      updateOrderStatus(orderId, status),
    onSuccess: (updatedOrder) => {
      // Update specific order cache
      queryClient.setQueryData(['pos', 'orders', updatedOrder.id], updatedOrder);
      
      // Invalidate orders list and summary
      queryClient.invalidateQueries({ queryKey: ['pos', 'orders'] });
    },
  });
};

// Cash In mutation
export const useCashIn = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cashIn,
    onSuccess: () => {
      // Invalidate cash-related queries
      queryClient.invalidateQueries({ queryKey: ['pos', 'cash'] });
    },
  });
};

// Cash Out mutation
export const useCashOut = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cashOut,
    onSuccess: () => {
      // Invalidate cash-related queries
      queryClient.invalidateQueries({ queryKey: ['pos', 'cash'] });
    },
  });
};

// Get cash transactions
export const useCashTransactions = (limit: number = 10) => {
  return useQuery({
    queryKey: ['pos', 'cash', 'transactions', limit],
    queryFn: () => getCashTransactions(limit),
  });
};

// Get cash balance
export const useCashBalance = () => {
  return useQuery({
    queryKey: ['pos', 'cash', 'balance'],
    queryFn: getCashBalance,
    refetchInterval: 60000, // Refetch every minute
  });
};

// Get notifications
export const usePosNotifications = (unreadOnly: boolean = false) => {
  return useQuery({
    queryKey: ['pos', 'notifications', unreadOnly ? 'unread' : 'all'],
    queryFn: () => getPosNotifications(unreadOnly),
    refetchInterval: 15000, // Refetch every 15 seconds
  });
};

// Mark notification as read
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['pos', 'notifications'] });
    },
  });
};

// Mark all notifications as read
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      // Invalidate notifications queries
      queryClient.invalidateQueries({ queryKey: ['pos', 'notifications'] });
    },
  });
};