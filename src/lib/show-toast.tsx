'use client';

import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook để hiển thị các loại toast khác nhau
 * @returns Object chứa các hàm để hiển thị toast tương ứng
 */
export const useCustomToast = () => {
  const { toast } = useToast();

  // Các helper functions
  return {
    // Hiển thị toast thông thường
    default: (title: string, message: string) =>
      toast({
        title: title,
        description: message,
      }),

    // Hiển thị toast lỗi
    error: (title: string, message: string) =>
      toast({
        variant: 'destructive',
        title: title,
        description: message,
      }),

    // Hiển thị toast thành công
    success: (title: string, message: string) =>
      toast({
        className: 'bg-green-500 text-white border-green-600',
        title: title,
        description: message,
      }),

    // Hiển thị toast thông tin
    info: (title: string, message: string) =>
      toast({
        className: 'bg-blue-500 text-white border-blue-600',
        title: title,
        description: message,
      }),

    // Hiển thị toast cảnh báo
    warning: (title: string, message: string) =>
      toast({
        className: 'bg-yellow-500 text-white border-yellow-600',
        title: title,
        description: message,
      }),

    // Hàm gốc từ useToast nếu cần sử dụng trực tiếp
    toast,
  };
};
