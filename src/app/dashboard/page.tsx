'use client';

import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedComponent } from '@/components/protected-component';
import { fetchUser } from '@/services/api';
import { useRouter } from 'next/navigation';
import { AuthLoading } from '@/components/common/auth-loading';

export default function DashboardPage() {
  const { user, logout, token } = useAuth();
  const router = useRouter();

  const { data: fetchedUser, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: () => fetchUser(token || ''),
    enabled: !!token && !user,
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  if (!user && fetchedUser) {
    // Update user from API
    // You can dispatch login here if needed
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  return (
    <AuthLoading>
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Welcome, <strong>{user.role}</strong>!</p>
            <div className="space-y-4 mt-4">
              <ProtectedComponent permission="CREATE_POST">
                <Button>Create Post</Button>
              </ProtectedComponent>
              <ProtectedComponent
                permission="VIEW_ANALYTICS"
                fallback={<p>You do not have permission to view analytics.</p>}
              >
                <Button>View Analytics</Button>
              </ProtectedComponent>
              <ProtectedComponent permission="MANAGE_USERS">
                <Button>Manage Users</Button>
              </ProtectedComponent>
              <Button variant="destructive" onClick={logout}>
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLoading>
  );
}