import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';
import { toast } from 'sonner';

// Types
export interface PosOrderItem {
  id?: number;
  itemType: 'PRODUCT' | 'COMBO';
  productId?: number;
  comboId?: number;
  comboVariantId?: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  notes?: string;
  specialInstructions?: string;
  productName?: string;
  productImageUrl?: string;
  comboName?: string;
  comboVariantName?: string;
  comboSelections?: PosComboSelection[];
}

export interface PosComboSelection {
  id?: number;
  comboItemId: number;
  selectedProductId?: number;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  isIncluded: boolean;
  notes?: string;
  specialInstructions?: string;
  comboItemName?: string;
  selectedProductName?: string;
  selectedProductImageUrl?: string;
}

export interface PosOrderPayment {
  id?: number;
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT' | 'BANK_TRANSFER' | 'VOUCHER' | 'GIFT_CARD';
  amount: number;
  tipAmount?: number;
  totalAmount?: number;
  paymentStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  transactionReference?: string;
  paymentDate?: string;
  notes?: string;
}

export interface PosOrder {
  id?: number;
  orderNumber?: string;
  sessionId: number;
  customerId?: number;
  customerName?: string;
  orderStatus: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP';
  subtotalAmount?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  customerNotes?: string;
  specialInstructions?: string;
  orderDate?: string;
  completedDate?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: PosOrderItem[];
  payments?: PosOrderPayment[];
}

export interface CreatePosOrderRequest {
  sessionId: number;
  customerId?: number;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP';
  customerNotes?: string;
  specialInstructions?: string;
  items?: {
    itemType: 'PRODUCT' | 'COMBO';
    productId?: number;
    comboId?: number;
    comboVariantId?: number;
    quantity: number;
    unitPrice?: number;
    notes?: string;
    specialInstructions?: string;
    comboSelections?: {
      comboItemId: number;
      selectedProductId?: number;
      quantity: number;
      unitPrice?: number;
      isIncluded: boolean;
      notes?: string;
      specialInstructions?: string;
    }[];
  }[];
}

export interface UpdatePosOrderRequest {
  customerId?: number;
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'PICKUP';
  orderStatus?: 'DRAFT' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'PAID' | 'COMPLETED' | 'CANCELLED';
  customerNotes?: string;
  specialInstructions?: string;
  items?: {
    itemType: 'PRODUCT' | 'COMBO';
    productId?: number;
    comboId?: number;
    comboVariantId?: number;
    quantity: number;
    unitPrice?: number;
    notes?: string;
    specialInstructions?: string;
    comboSelections?: {
      comboItemId: number;
      selectedProductId?: number;
      quantity: number;
      unitPrice?: number;
      isIncluded: boolean;
      notes?: string;
      specialInstructions?: string;
    }[];
  }[];
}

export interface CreatePaymentRequest {
  orderId: number;
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT' | 'BANK_TRANSFER' | 'VOUCHER' | 'GIFT_CARD';
  amount: number;
  tipAmount?: number;
  transactionReference?: string;
  notes?: string;
}

// API functions
const createOrder = async (data: CreatePosOrderRequest): Promise<PosOrder> => {
  const response = await apiClient.post('/pos/orders', data);
  return response.data.data;
};

const updateOrder = async ({ orderId, data }: { orderId: number; data: UpdatePosOrderRequest }): Promise<PosOrder> => {
  const response = await apiClient.put(`/pos/orders/${orderId}`, data);
  return response.data.data;
};

const getOrder = async (orderId: number): Promise<PosOrder> => {
  const response = await apiClient.get(`/pos/orders/${orderId}`);
  return response.data.data;
};

const getOrderByOrderNumber = async (orderNumber: string): Promise<PosOrder> => {
  const response = await apiClient.get(`/pos/orders/order-number/${orderNumber}`);
  return response.data.data;
};

const getOrdersBySession = async (sessionId: number): Promise<PosOrder[]> => {
  const response = await apiClient.get(`/pos/orders/session/${sessionId}`);
  return response.data.data;
};

const getDraftOrdersBySession = async (sessionId: number): Promise<PosOrder[]> => {
  const response = await apiClient.get(`/pos/orders/session/${sessionId}/draft`);
  return response.data.data;
};

const confirmOrder = async (orderId: number): Promise<PosOrder> => {
  const response = await apiClient.post(`/pos/orders/${orderId}/confirm`);
  return response.data.data;
};

const cancelOrder = async (orderId: number): Promise<PosOrder> => {
  const response = await apiClient.post(`/pos/orders/${orderId}/cancel`);
  return response.data.data;
};

const deleteOrder = async (orderId: number): Promise<void> => {
  await apiClient.delete(`/pos/orders/${orderId}`);
};

const createPayment = async (data: CreatePaymentRequest): Promise<PosOrderPayment> => {
  const response = await apiClient.post('/pos/payments', data);
  return response.data.data;
};

const getPaymentsByOrder = async (orderId: number): Promise<PosOrderPayment[]> => {
  const response = await apiClient.get(`/pos/payments/order/${orderId}`);
  return response.data.data;
};

const refundPayment = async ({ paymentId, refundAmount }: { paymentId: number; refundAmount: number }): Promise<PosOrderPayment> => {
  const response = await apiClient.post(`/pos/payments/${paymentId}/refund?refundAmount=${refundAmount}`);
  return response.data.data;
};

// React Query hooks
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders-session', data.sessionId] });
      toast.success(`Order ${data.orderNumber} has been created successfully.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    }
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders-session', data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
      toast.success(`Order ${data.orderNumber} has been updated successfully.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update order');
    }
  });
};

export const useOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['pos-order', orderId],
    queryFn: () => getOrder(orderId),
    enabled: !!orderId
  });
};

export const useOrderByOrderNumber = (orderNumber: string) => {
  return useQuery({
    queryKey: ['pos-order-number', orderNumber],
    queryFn: () => getOrderByOrderNumber(orderNumber),
    enabled: !!orderNumber
  });
};

export const useOrdersBySession = (sessionId: number) => {
  return useQuery({
    queryKey: ['pos-orders-session', sessionId],
    queryFn: () => getOrdersBySession(sessionId),
    enabled: !!sessionId
  });
};

export const useDraftOrdersBySession = (sessionId: number) => {
  return useQuery({
    queryKey: ['pos-draft-orders-session', sessionId],
    queryFn: () => getDraftOrdersBySession(sessionId),
    enabled: !!sessionId
  });
};

export const useConfirmOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: confirmOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders-session', data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
      toast.success(`Order ${data.orderNumber} has been confirmed.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to confirm order');
    }
  });
};

export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: cancelOrder,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      queryClient.invalidateQueries({ queryKey: ['pos-orders-session', data.sessionId] });
      queryClient.invalidateQueries({ queryKey: ['pos-order', data.id] });
      toast.success(`Order ${data.orderNumber} has been cancelled.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-orders'] });
      toast.success('Order has been deleted successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete order');
    }
  });
};

export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pos-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pos-order'] });
      toast.success(`Payment of $${data.totalAmount?.toFixed(2)} has been processed successfully.`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process payment');
    }
  });
};

export const usePaymentsByOrder = (orderId: number) => {
  return useQuery({
    queryKey: ['pos-payments-order', orderId],
    queryFn: () => getPaymentsByOrder(orderId),
    enabled: !!orderId
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: refundPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pos-payments'] });
      queryClient.invalidateQueries({ queryKey: ['pos-order'] });
      toast.success('Payment refund has been processed successfully.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to process refund');
    }
  });
};