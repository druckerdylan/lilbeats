"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Music,
  ShoppingBag,
  Sliders,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Admin navigation, in the site's metadata voice — the same `u-meta` mono
 * caps the public navbar uses, so the dashboard reads as the same product.
 *
 * This is the only client island in the admin chrome: the dashboard layout
 * stays a server component (it holds the Supabase session check), and only
 * the part that needs `usePathname` for the active state ships to the
 * browser. Two shapes of the same list — a vertical rail for the desktop
 * sidebar, a horizontal scroller for small screens, where the sidebar is
 * hidden and there would otherwise be no way to move between sections.
 */

interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV: AdminNavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/beats", label: "Beats", icon: Music },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/mixing-requests", label: "Mixing Requests", icon: Sliders },
];

/* "/admin" is the index route — a prefix match would light it up on every
   child page, so it only counts as active on an exact hit. */
function isActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNavList() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin sections" className="flex flex-col">
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "u-meta relative flex items-center gap-3 py-3.5 pr-3 pl-5 text-smoke transition-colors duration-200 hover:bg-bone/5 hover:text-bone",
              active && "bg-ember/10 text-bone"
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-px bg-ember shadow-[0_0_10px_rgba(255,45,71,0.85)]"
              />
            )}
            <item.icon
              aria-hidden
              className={cn("size-4 shrink-0", active ? "text-ember" : "text-smoke")}
            />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminNavRail() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="scrollbar-none flex overflow-x-auto"
    >
      {NAV.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              /* `whitespace-nowrap` is correct here and only here: the rail is
                 its own horizontal scroll container, so long labels scroll
                 rather than widening the page. */
              "u-meta relative flex shrink-0 items-center gap-2 px-4 py-4 whitespace-nowrap text-smoke transition-colors duration-200",
              active && "text-bone"
            )}
          >
            <item.icon
              aria-hidden
              className={cn("size-3.5 shrink-0", active ? "text-ember" : "text-smoke")}
            />
            {item.label}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-3 bottom-0 h-px bg-ember shadow-[0_0_10px_rgba(255,45,71,0.85)]"
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
