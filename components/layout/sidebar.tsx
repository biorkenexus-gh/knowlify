import Link from "next/link";
import { Sparkles } from "lucide-react";
import { SITE } from "@/lib/constants";
import { NavLinks } from "./nav-links";

export function Sidebar() {
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
      <div className="p-4">
        <NavLinks />
      </div>
    </aside>
  );
}
