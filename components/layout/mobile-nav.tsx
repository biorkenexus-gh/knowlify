"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NavLinks } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b p-6 text-left">
          <Link
            href="/dashboard"
            onClick={() => setOpen(false)}
            className="inline-flex items-center"
            aria-label="Knowlify home"
          >
            {/* Visually-hidden title for accessibility (Sheet requires one) */}
            <SheetTitle className="sr-only">Knowlify</SheetTitle>
            <Image
              src="/logo.png"
              alt="Knowlify"
              width={300}
              height={200}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
        </SheetHeader>
        <div className="p-4">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
