import apiClient from './api-client';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER' | 'GUEST';
}

export interface LoginResponse {
  user: User;
  token: string;
}

export async function loginUser(credentials: { email: string; password: string }): Promise<LoginResponse> {
  // For development, mock the API response
  if (process.env.NODE_ENV === 'development') {
    const isAdmin = credentials.email.includes('admin');
    return {
      user: {
        id: isAdmin ? '1' : '2',
        name: isAdmin ? 'Admin User' : 'Regular User',
        email: credentials.email,
        role: isAdmin ? 'ADMIN' : 'USER',
      },
      token: 'mock-jwt-token-' + Math.random().toString(36).substring(2),
    };
  }
  
  // In production, use the real API
  const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
  return response.data;
}

export async function logoutUser(): Promise<void> {
  // For development, just return
  if (process.env.NODE_ENV === 'development') {
    return Promise.resolve();
  }
  
  // In production, use the real API
  await apiClient.post('/auth/logout');
}

export async function fetchUser(token: string): Promise<User> {
  // For development, mock the API response
  if (process.env.NODE_ENV === 'development') {
    const isAdmin = token.includes('admin');
    return {
      id: isAdmin ? '1' : '2',
      name: isAdmin ? 'Admin User' : 'Regular User',
      email: isAdmin ? 'admin@example.com' : 'user@example.com',
      role: isAdmin ? 'ADMIN' : 'USER',
    };
  }
  
  // In production, use the real API with the token
  const response = await apiClient.get<User>('/users/me', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
}

export async function fetchPosts() {
  // Mock posts data
  if (process.env.NODE_ENV === 'development') {
    return [
      { id: '1', title: 'First Post', content: 'This is the first post content' },
      { id: '2', title: 'Second Post', content: 'This is the second post content' },
    ];
  }
  
  const response = await apiClient.get('/posts');
  return response.data;
}