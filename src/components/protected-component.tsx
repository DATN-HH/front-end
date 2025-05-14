import { ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/auth-context';
import { Role, Permission } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: Role | Role[];
  requiredPermissions?: Permission | Permission[];
}

export const ProtectedRoute = ({
  children,
  requiredRoles,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { user, isLoading, hasRole, hasPermission } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    router.push(`/login?redirect=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  const hasRequiredRole = !requiredRoles || hasRole(requiredRoles);
  const hasRequiredPermission =
    !requiredPermissions || hasPermission(requiredPermissions);

  if (!hasRequiredRole || !hasRequiredPermission) {
    router.push('/unauthorized');
    return null;
  }

  return <>{children}</>;
};
