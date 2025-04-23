'use client';

import { useAuth } from '@/contexts/auth-context';
import { Permission } from '@/lib/rbac';
import { hasPermission } from '@/lib/rbac';

interface ProtectedComponentProps {
  children: React.ReactNode;
  permission: Permission;
  fallback?: React.ReactNode;
}

export function ProtectedComponent({ children, permission, fallback }: ProtectedComponentProps) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return null; // Or a loading spinner
  }
  
  if (!user || !hasPermission(user.role, permission)) {
    return fallback || null;
  }
  
  return <>{children}</>;
}