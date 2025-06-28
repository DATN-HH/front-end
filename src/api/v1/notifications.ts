import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { NotificationType } from './publish-shifts';

// Re-export NotificationType for convenience
export { NotificationType } from './publish-shifts';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  relatedId?: number;
  isRead: boolean;
  createdAt: string;
}

// API Functions
export const getMyNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications/my-notifications');
  return response.data.payload;
};

export const getUnreadNotifications = async (): Promise<Notification[]> => {
  const response = await apiClient.get('/notifications/unread');
  return response.data.payload;
};

export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data.payload;
};

export const markNotificationAsRead = async (id: number): Promise<string> => {
  const response = await apiClient.put(`/notifications/${id}/mark-read`);
  return response.data.payload;
};

export const markAllNotificationsAsRead = async (): Promise<string> => {
  const response = await apiClient.put('/notifications/mark-all-read');
  return response.data.payload;
};

// React Query Hooks
export const useMyNotifications = () => {
  return useQuery({
    queryKey: ['my-notifications'],
    queryFn: getMyNotifications,
  });
};

export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: ['unread-notifications'],
    queryFn: getUnreadNotifications,
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: ['unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unread-count'] });
    },
  });
}; 