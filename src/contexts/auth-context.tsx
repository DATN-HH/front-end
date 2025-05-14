'use client';

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { loginUser, User, verifyToken } from '@/features/system/api/api-auth';
import { useRouter } from 'next/navigation';
import { Role, Permission, rolePermissions } from '@/lib/rbac';
import { useCustomToast } from '@/lib/show-toast';

export function getDefaultRedirectByRole(role: Role): string {
  switch (role) {
    case Role.MANAGER:
      return '/app';
    case Role.WAITER:
    case Role.HOST:
    case Role.KITCHEN:
    case Role.CASHIER:
    case Role.ACCOUNTANT:
    case Role.SUPPORT:
    case Role.EMPLOYEE:
      return '/app/employee-portal';
    case Role.SYSTEM_ADMIN:
      return '/app/system-admin';
    case Role.CUSTOMER:
    default:
      return '/';
  }
}

interface AuthContextType {
  user: User | null;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    error: toastError,
    success,
    info,
    warning,
    default: defaultToast,
  } = useCustomToast();
  const router = useRouter();

  /*
  Kiểm tra tính hợp lệ của token khi ứng dụng khởi động
*/
  useEffect(() => {
    async function fetchData() {
      const storedToken =
        typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          const { user } = await verifyToken(storedToken);
          setUser(user);
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

  /*
  Đăng nhập người dùng
*/
  const login = useCallback(
    async (credentials: { email: string; password: string }) => {
      setIsLoading(true);
      try {
        const { user, token } = await loginUser(credentials);
        setUser(user);
        setToken(token);

        console.log('Login successful:', user);
        success('Success', 'Login successful');

        if (typeof window !== 'undefined') {
          localStorage.setItem('token', token);

          // Ưu tiên lấy redirect từ URL
          const params = new URLSearchParams(window.location.search);
          const redirectUrl = params.get('redirect');

          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (user.isFullRole) {
            router.push('/app');
          } else if (user.roles && user.roles.length > 0) {
            const targetUrl = getDefaultRedirectByRole(user.roles[0]);
            router.push(targetUrl);
          } else {
            router.push('/');
          }
        }
      } catch (error: any) {
        console.error('Login failed:', error?.response?.data?.message);
        toastError('Error', error?.response?.data?.message || 'Login failed');
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /*
  Đăng xuất người dùng
*/
  const logout = useCallback(async () => {
    setUser(null);
    setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    router.push('/login');
  }, []);

  /*
  Kiểm tra xem người dùng đã đăng nhập hay chưa
  Hàm này trả về true nếu người dùng đã đăng nhập (có token), ngược lại trả về false
*/
  const isAuthenticated = useCallback(() => {
    return !!token;
  }, [token]);

  const hasRole = useCallback(
    (role: Role | Role[]) => {
      if (user && user.isFullRole) {
        return true;
      }

      if (!user || !user.roles) {
        return false;
      }

      if (Array.isArray(role)) {
        return role.some((r) => user.roles.includes(r));
      }
      return user.roles.includes(role);
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: Permission | Permission[]) => {
      if (user && user.isFullRole) {
        return true;
      }

      if (!user || !user.roles) {
        return false;
      }

      if (Array.isArray(permission)) {
        return permission.some((p) =>
          user.roles.some((role) => rolePermissions[role]?.includes(p))
        );
      }

      return user.roles.some((role) =>
        rolePermissions[role]?.includes(permission)
      );
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

  // Always render children, but use context to signal loading state
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
