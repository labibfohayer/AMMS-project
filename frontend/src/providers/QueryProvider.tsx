/* eslint-disable */
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,       // 🏎️ 5 minutes fresh: instantaneous 0ms page transitions
        gcTime: 1000 * 60 * 30,          // 30 minutes in browser memory cache
        refetchOnWindowFocus: false,     // Never freeze/reload when switching apps or browser tabs
        refetchOnMount: false,           // Use existing cache instantly without spinner flicker
        retry: 1,                        // Prevent hanging on network hiccups
      },
    },
  }));
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
