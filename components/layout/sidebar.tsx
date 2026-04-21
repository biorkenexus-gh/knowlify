"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Coins,
  Home,
  LayoutDashboard,
  Sparkles,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ADMIN_NAV_ITEMS, NAV_ITEMS, SITE } from "@/lib/constants";
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

export function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;
  const items = isAdminRoute ? ADMIN_NAV_ITEMS : NAV_ITEMS;

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <Link href="/dashboard" className="text-lg font-semibold">
          {SITE.name}
        </Link>
      </div>
      <nav className="space-y-1 p-4">
        {items.map((item) => {
          const Icon = ICONS[item.icon as keyof typeof ICONS] ?? Home;
          const active =
            pathname === item.href ||
            (item.href !== "/admin" && pathname?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
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
            className="mt-4 flex items-center gap-3 rounded-md border border-dashed px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LayoutDashboard className="h-4 w-4" />
            Admin panel
          </Link>
        )}
      </nav>
    </aside>
  );
}
