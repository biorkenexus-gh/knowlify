"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/use-auth";
import type { UserRole } from "@/types";

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

// Client-side auth guard. Firebase Auth is client-first (no session cookie by
// default), so middleware can't reliably enforce this. We show a skeleton while
// the auth state hydrates, then redirect unauthenticated users to /login.
export function RequireAuth({
  children,
  allowedRoles,
  fallback,
}: RequireAuthProps) {
  const router = useRouter();
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (allowedRoles && role && !allowedRoles.includes(role)) {
      router.replace("/dashboard");
    }
  }, [loading, user, role, allowedRoles, router]);

  if (loading || !user) {
    return (
      fallback ?? (
        <div className="space-y-4 p-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      )
    );
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-semibold">Not authorized</h2>
        <p className="text-sm text-muted-foreground">
          You don&apos;t have permission to view this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
