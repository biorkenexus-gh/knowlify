"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Coins, LogOut, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "@/lib/hooks/use-auth";
import { signOut } from "@/lib/firebase/auth";
import { formatNumber } from "@/lib/utils/format";

export function Topbar() {
  const router = useRouter();
  const { user, profile, role } = useAuth();
  const initials = (user?.displayName ?? user?.email ?? "?")
    .slice(0, 2)
    .toUpperCase();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold">Knowlify</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2 md:gap-4">
        {profile && (
          <div className="hidden items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium sm:flex">
            <Coins className="h-4 w-4 text-amber-500" />
            <span>{formatNumber(profile.coins)}</span>
            <span className="text-xs text-muted-foreground">coins</span>
          </div>
        )}
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              aria-label="Account menu"
              className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <Avatar>
                {user?.photoURL && (
                  <AvatarImage src={user.photoURL} alt="avatar" />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{user?.displayName ?? "Signed in"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {user?.email}
                </span>
                {role && (
                  <span className="mt-1 text-xs font-normal uppercase tracking-wider text-primary">
                    {role}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Dashboard</Link>
            </DropdownMenuItem>
            {role === "admin" && (
              <DropdownMenuItem asChild>
                <Link href="/admin">Admin panel</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
