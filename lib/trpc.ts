import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  // Try environment variable first
  if (process.env.EXPO_PUBLIC_HAUS_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_HAUS_API_BASE_URL;
  }

  // Fallback URLs for development
  if (__DEV__) {
    // Default development URL
    return "http://localhost:3000";
  }

  // Production fallback - should be configured properly
  console.warn("No EXPO_PUBLIC_HAUS_API_BASE_URL found, using fallback");
  return "https://your-production-api.com";
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      // Add error handling and retry logic
      fetch: async (url, options) => {
        try {
          const response = await fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              ...options?.headers,
            },
          });
          
          if (!response.ok) {
            console.error(`tRPC HTTP Error: ${response.status} ${response.statusText}`);
          }
          
          return response;
        } catch (error) {
          console.error('tRPC Network Error:', error);
          throw error;
        }
      },
    }),
  ],
});