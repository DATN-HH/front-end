'use client';

import { ShieldX, ArrowLeft, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { Role, Permission } from '@/lib/rbac';

// Component hiển thị khi không có quyền truy cập
const UnauthorizedContent = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full text-center px-6">
        <div className="mb-8">
          <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <ShieldX className="w-12 h-12 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">403</h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            You don't have permission to access this page. Please contact your
            administrator to get the necessary permissions.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full h-12 text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push('/')}
            className="w-full h-12 text-sm font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

// Component để bảo vệ route - hiển thị unauthorized content nếu không có quyền
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role | Role[];
  requiredPermissions?: Permission | Permission[];
  fallback?: ReactNode;
}

export const ProtectedRoute = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback = (
    <div className="flex items-center justify-center h-screen">Loading...</div>
  ),
}: ProtectedRouteProps) => {
  const { isLoading, hasRole, hasPermission, isAuthenticated } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <>{fallback}</>;
  }

  // Nếu chưa đăng nhập, redirect đến login
  if (!isAuthenticated()) {
    const currentPath = window.location.pathname;
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    return null;
  }

  // Nếu đã đăng nhập nhưng không có quyền, hiển thị UnauthorizedContent
  const hasRequiredRole = !requiredRoles || hasRole(requiredRoles);
  const hasRequiredPermission =
    !requiredPermissions || hasPermission(requiredPermissions);

  // if (!hasRequiredRole || !hasRequiredPermission) {
  //   return <UnauthorizedContent />;
  // }

  return <>{children}</>;
};

// Component để bảo vệ element - ẩn/hiện element dựa trên role
interface ProtectedElementProps {
  children: ReactNode;
  requiredRoles?: Role | Role[];
  requiredPermissions?: Permission | Permission[];
  fallback?: ReactNode;
  showLoading?: boolean;
}

export const ProtectedElement = ({
  children,
  requiredRoles,
  requiredPermissions,
  fallback = null,
  showLoading = false,
}: ProtectedElementProps) => {
  const { isLoading, hasRole, hasPermission, isAuthenticated } = useAuth();

  if (isLoading && showLoading) {
    return <div className="animate-pulse bg-gray-200 rounded h-4 w-16"></div>;
  }

  // Nếu chưa đăng nhập, không hiển thị
  if (!isAuthenticated()) {
    return <>{fallback}</>;
  }

  // Kiểm tra quyền
  const hasRequiredRole = !requiredRoles || hasRole(requiredRoles);
  const hasRequiredPermission =
    !requiredPermissions || hasPermission(requiredPermissions);

  // if (!hasRequiredRole || !hasRequiredPermission) {
  //   return <>{fallback}</>;
  // }

  return <>{children}</>;
};
