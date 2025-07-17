'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import { Role, Permission } from '@/lib/rbac';
import { useCustomToast } from '@/lib/show-toast';
import { useSignIn, useSignOut, useVerifyToken, UserDtoResponse, RoleResponseDto } from '@/api/v1/auth';
import { useQueryClient } from '@tanstack/react-query';

export function getDefaultRedirectByRole(role: RoleResponseDto): string {
  switch (role.name) {
    case Role.MANAGER:
      return '/app';
    case Role.WAITER:
    case Role.HOST:
    case Role.KITCHEN:
    case Role.CASHIER:
    case Role.ACCOUNTANT:
    case Role.SUPPORT:
    case Role.EMPLOYEE:
    case Role.SYSTEM_ADMIN:
      return '/app/employee-portal';
    case Role.CUSTOMER:
    default:
      return '/';
  }
}

interface AuthContextType {
  user: UserDtoResponse | null;
  token: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: () => boolean;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDtoResponse | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    error: toastError,
    success,
  } = useCustomToast();
  const router = useRouter();
  const queryClient = useQueryClient();

  const signInMutation = useSignIn();
  const signOutMutation = useSignOut();
  const verifyTokenMutation = useVerifyToken();

  useEffect(() => {
    async function fetchData() {
      // Development mode bypass - auto login with admin role
      if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        const devBypass = localStorage.getItem('dev_bypass_auth');
        if (devBypass === 'true') {
          // Mock admin user for development
          const mockAdminUser: UserDtoResponse = {
            id: 1,
            email: 'admin@dev.com',
            username: 'admin',
            fullName: 'Development Admin',
            birthdate: '1990-01-01',
            gender: 'MALE',
            phoneNumber: '+1234567890',
            isFullRole: true,
            userRoles: [{
              id: 1,
              userId: 1,
              roleId: 1,
              role: {
                id: 1,
                name: 'SYSTEM_ADMIN',
                description: 'System Administrator',
                hexColor: '#FF0000',
                rolePermissions: [],
                roleScreens: [],
                createdAt: new Date().toISOString(),
                createdBy: 1,
                updatedAt: new Date().toISOString(),
                updatedBy: 1,
                status: 'ACTIVE',
                createdUsername: 'system',
                updatedUsername: 'system'
              }
            }],
            branch: {
              id: 1,
              name: 'Main Branch',
              address: '123 Main St',
              phone: '+1234567890',
              manager: {} as UserDtoResponse,
              createdAt: new Date().toISOString(),
              createdBy: 1,
              updatedAt: new Date().toISOString(),
              updatedBy: 1,
              status: 'ACTIVE',
              createdUsername: 'system',
              updatedUsername: 'system'
            },
            displayName: 'Development Admin',
            createdAt: new Date().toISOString(),
            createdBy: 1,
            updatedAt: new Date().toISOString(),
            updatedBy: 1,
            status: 'ACTIVE',
            createdUsername: 'system',
            updatedUsername: 'system'
          };

          setUser(mockAdminUser);
          setToken('dev-token-' + Date.now());
          setIsLoading(false);
          return;
        }
      }

      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          const response = await verifyTokenMutation.mutateAsync({ token: storedToken });
          setUser(response.account);
          success('Success', 'Token verified successfully');
        } catch (error: any) {
          console.error(
            'Token verification failed:',
            error?.response?.data?.message
          );
          toastError(
            'Error',
            error?.response?.data?.message || 'Token verification failed'
          );
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        setToken(null);
        setUser(null);
      }

      setIsLoading(false);
    }

    fetchData();
  }, [token]);

  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        const response = await signInMutation.mutateAsync(credentials);
        if (!response.success) {
          throw new Error(response.message || 'Login failed');
        }

        const data = response.payload;
        setUser(data.account);
        setToken(data.token);

        success('Success', 'Login successful');

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.token);

          // Ưu tiên lấy redirect từ URL
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect');

          if (redirectUrl) {
            router.push(redirectUrl);
            // } else if (data.account.isFullRole) {
            //   router.push('/app');
          } else if (data.account.userRoles && data.account.userRoles.length > 0) {
            const targetUrl = getDefaultRedirectByRole(data.account.userRoles[0].role);
            router.push(targetUrl);
          } else {
            router.push('/');
          }
        }
      } catch (error: any) {
        console.error('Login failed:', error);
        toastError('Error', error?.response?.data?.message || error.message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await signOutMutation.mutateAsync();
      setUser(null);
      setToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      queryClient.clear();
      // Force redirect to login without any query parameters
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      } else {
        router.push('/login');
      }
    } catch (error: any) {
      console.error('Logout failed:', error);
      toastError('Error', error?.response?.data?.message || 'Logout failed');
    }
  }, []);

  const isAuthenticated = useCallback(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return !!token && !!storedToken;
  }, [token]);

  const hasRole = useCallback(
    (role: Role | Role[]) => {
      // if (user && user.isFullRole) {
      //   return true;
      // }

      if (!user || !user.userRoles) {
        return false;
      }

      if (Array.isArray(role)) {
        return role.some((r) => user.userRoles.some((ur) => ur.role.name === r));
      }
      return user.userRoles.some((ur) => ur.role.name === role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: Permission | Permission[]) => {
      // if (user && user.isFullRole) {
      //   return true;
      // }

      // if (!user || !user.userRoles) {
      //   return false;
      // }

      // if (Array.isArray(permission)) {
      //   return permission.some((p) =>
      //     user.userRoles.some((ur) =>
      //       rolePermissions[ur.role.name as Role]?.includes(p)
      //     )
      //   );
      // }

      // return user.userRoles.some((ur) =>
      //   rolePermissions[ur.role.name as Role]?.includes(permission)
      // );

      return true;
    },
    [user]
  );

  const contextValue = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
