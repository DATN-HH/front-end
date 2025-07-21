import { useAuth } from '@/contexts/auth-context';
import { Role, Permission } from '@/lib/rbac';

export const usePermissions = () => {
  const { user, hasRole, hasPermission, isAuthenticated, isLoading } =
    useAuth();

  const checkRole = (role: Role | Role[]): boolean => {
    if (!isAuthenticated()) return false;
    return hasRole(role);
  };

  const checkPermission = (permission: Permission | Permission[]): boolean => {
    if (!isAuthenticated()) return false;
    return hasPermission(permission);
  };

  const checkAnyRole = (roles: Role[]): boolean => {
    if (!isAuthenticated()) return false;
    return roles.some((role) => hasRole(role));
  };

  const checkAllRoles = (roles: Role[]): boolean => {
    if (!isAuthenticated()) return false;
    return roles.every((role) => hasRole(role));
  };

  const checkAnyPermission = (permissions: Permission[]): boolean => {
    if (!isAuthenticated()) return false;
    return permissions.some((permission) => hasPermission(permission));
  };

  const checkAllPermissions = (permissions: Permission[]): boolean => {
    if (!isAuthenticated()) return false;
    return permissions.every((permission) => hasPermission(permission));
  };

  const isManager = (): boolean => checkRole(Role.MANAGER);
  const isEmployee = (): boolean => checkRole(Role.EMPLOYEE);
  const isSystemAdmin = (): boolean => checkRole(Role.SYSTEM_ADMIN);

  return {
    user,
    isLoading,
    isAuthenticated,
    checkRole,
    checkPermission,
    checkAnyRole,
    checkAllRoles,
    checkAnyPermission,
    checkAllPermissions,
    isManager,
    isEmployee,
    isSystemAdmin,
  };
};
