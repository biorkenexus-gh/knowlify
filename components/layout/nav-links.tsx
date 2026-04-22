"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Coins,
  Home,
  LayoutDashboard,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ADMIN_NAV_ITEMS, NAV_ITEMS } from "@/lib/constants";
import { useAuth } from "@/lib/hooks/use-auth";

const ICONS = {
  Home,
  BookOpen,
  Trophy,
  User,
  LayoutDashboard,
  Users,
  Activity,
  Coins,
} as const;

// Shared nav list, rendered by both the desktop <Sidebar> and the mobile
// drawer. When `onNavigate` fires we close the drawer on mobile.
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { role } = useAuth();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const items = isAdminRoute ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Home;
        const active =
          pathname === item.href ||
          (item.href !== "/admin" && pathname?.startsWith(item.href + "/"));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
      {role === "admin" && !isAdminRoute && (
        <Link
          href="/admin"
          onClick={onNavigate}
          className="mt-4 flex items-center gap-3 rounded-md border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <LayoutDashboard className="h-4 w-4" />
          Admin panel
        </Link>
      )}
    </nav>
  );
}
