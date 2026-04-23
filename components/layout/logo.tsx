import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  /** Where to link to. Pass `null` for a non-link logo. Defaults to `/`. */
  href?: string | null;
  /** Tailwind class controlling height. Width auto-scales to maintain aspect. */
  className?: string;
  /** Use `priority` on the logo above the fold (LCP optimization). */
  priority?: boolean;
}

/**
 * Centralized brand mark. The PNG lives at `public/logo.png` and includes the
 * book+bulb icon plus the "Knowlify" wordmark. Use this everywhere a brand
 * mark belongs — sidebar, topbar, marketing nav, auth pages, etc.
 */
export function Logo({
  href = "/",
  className,
  priority = false,
}: LogoProps) {
  const img = (
    <Image
      src="/logo.png"
      alt="Knowlify"
      width={300}
      height={200}
      priority={priority}
      className={cn("h-10 w-auto object-contain", className)}
    />
  );
  if (href === null) return img;
  return (
    <Link href={href} aria-label="Knowlify home" className="inline-flex">
      {img}
    </Link>
  );
}
