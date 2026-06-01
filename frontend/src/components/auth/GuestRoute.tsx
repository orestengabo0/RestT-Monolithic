"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface GuestRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * GuestRoute Component
 * 
 * Wraps components that should only be accessible to non-authenticated users.
 * Redirects to dashboard if user is already authenticated.
 * 
 * @example
 * ```tsx
 * <GuestRoute>
 *   <LoginForm />
 * </GuestRoute>
 * ```
 */
export function GuestRoute({ 
  children, 
  redirectTo = "/dashboard" 
}: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-800">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100 rounded-full mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if authenticated
  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
