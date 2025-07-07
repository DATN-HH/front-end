import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api-client';

// Types for payment flow
export interface TipCreateRequest {
  percentage?: number;
  customAmount?: number;
  subtotalAmount: number;
}

export interface TipResponse {
  tipAmount: number;
  tipPercentage?: number;
  subtotalAmount: number;
  newTotal: number;
  tipType: 'PERCENTAGE' | 'CUSTOM_AMOUNT';
}

export interface PaymentInitiateRequest {
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT' | 'GIFT_CARD';
  totalAmount: number;
  terminalId?: string;
  notes?: string;
}

export interface PaymentInitiateResponse {
  paymentId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  requiredAmount: number;
  message: string;
}

export interface PaymentValidateRequest {
  paymentId: string;
  paymentMethod: 'CASH' | 'CARD' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'MOBILE_PAYMENT' | 'GIFT_CARD';
  amountTendered?: number;
  transactionReference?: string;
  terminalResponse?: string;
  tipAmount?: number;
  notes?: string;
}

export interface PaymentValidateResponse {
  orderNumber: string;
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  changeAmount?: number;
  receiptId: string;
  totalPaid: number;
  paymentDate: string;
  message: string;
}

export interface ReceiptResponse {
  receiptNumber: string;
  orderNumber: string;
  content: string;
  format: string;
  generatedAt: string;
  downloadUrl?: string;
  emailSent?: boolean;
  message: string;
}

export interface CustomerSearchResponse {
  id: number;
  fullName: string;
  email?: string;
  phoneNumber?: string;
  status: string;
  isActive: boolean;
}

// Tip management hooks
export const useAddTip = () => {
  return useMutation({
    mutationFn: async ({ orderId, tipData }: { orderId: number; tipData: TipCreateRequest }) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/tip`, tipData);
      return response.data.payload as TipResponse;
    },
  });
};

export const useGetTip = (orderId: number) => {
  return useQuery({
    queryKey: ['pos', 'order', orderId, 'tip'],
    queryFn: async () => {
      const response = await apiClient.get(`/api/pos/orders/${orderId}/tip`);
      return response.data.payload as TipResponse;
    },
    enabled: !!orderId,
  });
};

export const useRemoveTip = () => {
  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.delete(`/api/pos/orders/${orderId}/tip`);
      return response.data.payload as TipResponse;
    },
  });
};

// Payment flow hooks
export const useInitiatePayment = () => {
  return useMutation({
    mutationFn: async ({ orderId, paymentData }: { orderId: number; paymentData: PaymentInitiateRequest }) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/payments/initiate`, paymentData);
      return response.data.payload as PaymentInitiateResponse;
    },
  });
};

export const useValidatePayment = () => {
  return useMutation({
    mutationFn: async ({ orderId, validateData }: { orderId: number; validateData: PaymentValidateRequest }) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/payments/validate`, validateData);
      return response.data.payload as PaymentValidateResponse;
    },
  });
};

export const useGetPaymentStatus = (orderId: number, paymentId: string) => {
  return useQuery({
    queryKey: ['pos', 'order', orderId, 'payment', paymentId],
    queryFn: async () => {
      const response = await apiClient.get(`/api/pos/orders/${orderId}/payments/status?paymentId=${paymentId}`);
      return response.data.payload;
    },
    enabled: !!orderId && !!paymentId,
  });
};

// Receipt hooks
export const useGenerateReceipt = () => {
  return useMutation({
    mutationFn: async ({ orderId, format = 'thermal' }: { orderId: number; format?: string }) => {
      const response = await apiClient.get(`/api/pos/orders/${orderId}/receipt?format=${format}`);
      return response.data.payload as ReceiptResponse;
    },
  });
};

export const useEmailReceipt = () => {
  return useMutation({
    mutationFn: async ({ orderId, emailAddress }: { orderId: number; emailAddress: string }) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/receipt/email`, {
        emailAddress,
        format: 'standard'
      });
      return response.data.payload as ReceiptResponse;
    },
  });
};

export const useGenerateInvoice = () => {
  return useMutation({
    mutationFn: async (orderId: number) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/invoice`);
      return response.data.payload as ReceiptResponse;
    },
  });
};

// Customer management hooks
export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: ['pos', 'customers', 'search', query],
    queryFn: async () => {
      if (!query || query.length < 2) return [];
      const response = await apiClient.get(`/api/pos/customers/search?q=${encodeURIComponent(query)}`);
      return response.data.payload as CustomerSearchResponse[];
    },
    enabled: query.length >= 2,
  });
};

export const useRecentCustomers = () => {
  return useQuery({
    queryKey: ['pos', 'customers', 'recent'],
    queryFn: async () => {
      const response = await apiClient.get('/api/pos/customers/recent?limit=10');
      return response.data.payload as CustomerSearchResponse[];
    },
  });
};

export const useAssociateCustomer = () => {
  return useMutation({
    mutationFn: async ({ orderId, customerData }: { 
      orderId: number; 
      customerData: { customerId?: number; customerName: string; email?: string; phone?: string; createIfNotExists?: boolean; }
    }) => {
      const response = await apiClient.post(`/api/pos/orders/${orderId}/customer`, customerData);
      return response.data.payload as CustomerSearchResponse;
    },
  });
};

export const useRemoveCustomerAssociation = () => {
  return useMutation({
    mutationFn: async (orderId: number) => {
      await apiClient.delete(`/api/pos/orders/${orderId}/customer`);
    },
  });
};