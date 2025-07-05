// POS API Types

export interface PosUser {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  pin?: string;
  isActive: boolean;
  branchId?: number;
  branchName?: string;
}

export interface PosSession {
  id: string;
  userId: number;
  user: PosUser;
  loginTime: string;
  lastActivity: string;
  isLocked: boolean;
  branchId?: number;
}

export interface PosLoginRequest {
  pin: string;
  userId?: number;
  branchId: number;
  openingCashAmount?: number;
  sessionNotes?: string;
}

export interface PosLoginResponse {
  success: boolean;
  session: PosSession;
  token: string;
  message?: string;
}

export interface EmployeeSwitchRequest {
  targetUserId: number;
  pin?: string;
}

export interface CashTransaction {
  id: number;
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  reason: string;
  description?: string;
  userId: number;
  userName: string;
  sessionId: string;
  timestamp: string;
  createdAt: string;
}

export interface CashTransactionRequest {
  type: 'CASH_IN' | 'CASH_OUT';
  amount: number;
  reason: string;
  description?: string;
}

export interface PosOrder {
  id: number;
  orderNumber: string;
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  totalAmount: number;
  customerName?: string;
  itemsCount: number;
  createdAt: string;
  updatedAt: string;
  estimatedTime?: number;
}

export interface PosOrderSummary {
  totalOrders: number;
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  todayRevenue: number;
  todayOrdersCount: number;
}

export interface PosNotification {
  id: number;
  type: 'ORDER' | 'CASH' | 'SYSTEM' | 'ERROR';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  orderId?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

// API Response wrapper
export interface PosApiResponse<T> {
  success: boolean;
  code: number;
  message: string;
  data: T;
}