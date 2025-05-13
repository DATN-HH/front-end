// 'use client';

// import { useState } from 'react';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { AuthProvider } from '@/contexts/auth-context';

// export function Providers({ children }: { children: React.ReactNode }) {
//   const [queryClient] = useState(
//     () =>
//       new QueryClient({
//         defaultOptions: {
//           queries: {
//             // Disable refetching on window focus for development
//             refetchOnWindowFocus: process.env.NODE_ENV === 'production',
//             retry: 1,
//             staleTime: 5 * 60 * 1000, // 5 minutes
//           },
//         },
//       })
//   );

//   return (
//     <QueryClientProvider client={queryClient}>
//       <AuthProvider>{children}</AuthProvider>
//       {/* {children} */}
//     </QueryClientProvider>
//   );
// }
