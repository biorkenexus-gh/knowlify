import { Logo } from "./logo";
import { NavLinks } from "./nav-links";

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r bg-card md:block">
      <div className="flex h-16 items-center border-b px-6">
        <Logo href="/dashboard" className="h-8 w-auto" />
      </div>
      <div className="p-4">
        <NavLinks />
      </div>
    </aside>
  );
}
