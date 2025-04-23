'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPosts } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProtectedComponent } from '@/components/protected-component';
import { Button } from '@/components/ui/button';

interface Post {
  id: string;
  title: string;
  content: string;
}

export function PostList() {
  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
  });

  if (isLoading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <ProtectedComponent permission="CREATE_POST">
          <Button>Create New Post</Button>
        </ProtectedComponent>
        <ul className="mt-4 space-y-2">
          {posts.map((post: Post) => (
            <li key={post.id} className="border p-2 rounded">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
