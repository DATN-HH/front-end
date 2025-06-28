import { apiClient } from '@/services/api-client'
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Types and Interfaces
export interface Role {
  id: number
  name: string
  description: string
  hexColor: string
  rolePermissions: any[]
  roleScreens: any[]
  createdAt: string
  createdBy: number | null
  updatedAt: string
  updatedBy: number | null
  status: string
  createdUsername: string
  updatedUsername: string
}

export interface UserRole {
  id: number
  userId: number
  roleId: number
  role: Role
}

export interface Branch {
  id: number
  name: string
  address: string
  phone: string
  manager: any
  createdAt: string
  createdBy: number
  updatedAt: string
  updatedBy: number
  status: string
  createdUsername: string
  updatedUsername: string
}

export interface ReplacementStaff {
  id: number
  email: string
  username: string
  fullName: string
  birthdate: string | null
  gender: "MALE" | "FEMALE" | "OTHER"
  phoneNumber: string
  isFullRole: boolean | null
  userRoles: UserRole[]
  branch: Branch
  displayName: string
  createdAt: string
  createdBy: number
  updatedAt: string
  updatedBy: number
  status: string
  createdUsername: string
  updatedUsername: string
}

export interface Shift {
  id: number
  name: string
  startTime: string
  endTime: string
}

export interface ScheduledShift {
  id: number
  date: string
  shift: Shift
  branch: Branch
}

export interface StaffShift {
  id: number
  note: string
  shiftStatus: "DRAFT" | "PUBLISHED" | "APPROVED" | "REJECTED"
  staff: ReplacementStaff
  scheduledShift: ScheduledShift
}

export interface BaseResponse<T> {
  success: boolean
  code: number
  message: string
  payload: T
}

// API Functions
export const getReplacementStaff = async (staffShiftId: number): Promise<ReplacementStaff[]> => {
  console.log('🔍 API Call - getReplacementStaff:', { staffShiftId })
  
  const response = await apiClient.get<BaseResponse<ReplacementStaff[]>>(
    `/staff-shifts/${staffShiftId}/replacement-staff`
  )
  
  console.log('🔍 API Response - getReplacementStaff:', {
    status: response.status,
    data: response.data,
    success: response.data.success,
    payload: response.data.payload,
    payloadLength: response.data.payload?.length
  })
  
  if (!response.data.success) {
    console.error('❌ API Error:', response.data.message)
    throw new Error(response.data.message || "Failed to get replacement staff")
  }
  
  const result = response.data.payload || []
  console.log('🔍 Final result:', { result, resultLength: result.length })
  
  return result
}

export const replaceStaff = async (staffShiftId: number, newStaffId: number): Promise<StaffShift> => {
  const response = await apiClient.put<BaseResponse<StaffShift>>(
    `/staff-shifts/${staffShiftId}/replace-staff/${newStaffId}`
  )
  
  if (!response.data.success) {
    throw new Error(response.data.message || "Failed to replace staff")
  }
  
  return response.data.payload!
}

// React Query Hooks
export const useGetReplacementStaff = (staffShiftId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['replacement-staff', staffShiftId],
    queryFn: () => getReplacementStaff(staffShiftId),
    enabled: enabled && !!staffShiftId,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 2
  })
}

export const useReplaceStaff = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ staffShiftId, newStaffId }: { staffShiftId: number; newStaffId: number }) =>
      replaceStaff(staffShiftId, newStaffId),
    onSuccess: (data, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['staff-shifts-grouped'] })
      queryClient.invalidateQueries({ queryKey: ['scheduled-shifts'] })
      queryClient.invalidateQueries({ queryKey: ['replacement-staff', variables.staffShiftId] })
    }
  })
} 