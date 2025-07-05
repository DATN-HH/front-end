export interface PinUpdateRequest {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}

export interface AdminPinUpdateRequest {
  targetUserId: number;
  newPin: string;
  confirmPin: string;
  reason?: string;
}

export interface PinStatusResponse {
  hasPin: boolean;
}

export interface PinValidationResponse {
  isValid: boolean;
}

export interface TempPinResponse {
  temporaryPin: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}