import apiClient from '@/services/api-client';

export interface Post {
  id: string;
  title: string;
  content: string;
}

export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await apiClient.get('/posts');
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch posts');
  }
}

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
  try {
    const response = await apiClient.post('/posts', post);
    return response.data;
  } catch (error) {
    throw new Error('Failed to create post');
  }
}
