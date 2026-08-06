"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingBag } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/layout/logo";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { NAV_LINKS, SOCIAL_LINKS } from "@/lib/constants";
import { useCartStore, useCartCount } from "@/lib/store/cart-store";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

const DRAWER_SOCIALS = [
  { label: "YouTube", href: SOCIAL_LINKS.youtube },
  { label: "BeatStars", href: SOCIAL_LINKS.beatstars },
];

/* Square hairline chip. Both header controls share it so the right edge of
   the bar reads as one instrument panel rather than two loose icons. */
const CHIP =
  "size-10 rounded-none border-bone/15 text-bone transition-colors duration-300 hover:border-ember/55 hover:bg-ember/10 hover:text-bone dark:hover:bg-ember/10";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartCount();
  const setCartOpen = useCartStore((s) => s.setOpen);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 w-full">
      {/*
        The backdrop is its own layer that crossfades, instead of the bar
        swapping background classes — a hard cut to an opaque slab is the
        template habit. Keeping it behind the content (and out of the way of
        the fixed z-50 ScrollProgress hairline) means the red scrubber still
        sits on top of the glass at the very top edge of the viewport.
      */}
      <div
        aria-hidden
        className={cn(
          "glass-dense absolute inset-0 -z-10 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
      <div
        aria-hidden
        className={cn(
          "hairline-dim absolute inset-x-0 bottom-0 transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
      {/*
        The one instrument detail in the bar: a measuring scale hanging just
        inside the seam, masked so it dies away at both ends rather than
        striping the full viewport. Anything more here and the header starts
        reading as a cockpit instead of a title bar.
      */}
      <div
        aria-hidden
        className={cn(
          "hud-ticks absolute inset-x-0 bottom-px transition-opacity duration-500 [mask-image:linear-gradient(90deg,transparent,#000_16%,#000_84%,transparent)]",
          scrolled ? "opacity-50" : "opacity-0"
        )}
      />

      <nav
        aria-label="Main"
        className="mx-auto flex h-18 max-w-[1600px] items-center justify-between gap-6 px-5 sm:px-8 lg:px-14"
      >
        <Logo />

        <div className="hidden items-center gap-6 md:flex lg:gap-9">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "u-meta relative py-2 whitespace-nowrap text-smoke transition-colors duration-300 hover:text-bone",
                  active && "text-bone"
                )}
              >
                {/* Mono + uppercase already, so the decode lands on the
                    glyph grid instead of reflowing the bar. */}
                <GlitchText text={link.label} trigger="hover" />
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    aria-hidden
                    transition={
                      reduced ? { duration: 0 } : { duration: 0.45, ease: EASE }
                    }
                    className="absolute inset-x-0 -bottom-0.5 h-px bg-ember shadow-[0_0_10px_rgba(255,45,71,0.8)]"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Cart (${cartCount} item${cartCount === 1 ? "" : "s"})`}
            className={cn("relative", CHIP)}
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="size-4" />
            {cartCount > 0 && (
              <span
                aria-hidden
                className="absolute -top-1.5 -right-1.5 flex min-w-4 items-center justify-center bg-ember px-1 font-mono text-[10px] leading-4 font-semibold tabular-nums text-bone"
              >
                {cartCount}
              </span>
            )}
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className={cn(CHIP, "md:hidden")}
                />
              }
            >
              <Menu className="size-4" />
            </SheetTrigger>
            <SheetContent
              side="right"
              className="gap-0 border-l border-bone/10 bg-ink/95 p-0 text-bone backdrop-blur-xl"
            >
              <SheetHeader className="px-5 pt-5 pb-5">
                <SheetTitle className="text-bone">
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div aria-hidden className="hairline-dim" />

              <nav aria-label="Mobile" className="flex flex-col px-5">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <div key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "u-meta flex items-center gap-4 py-5 text-smoke transition-colors duration-300 hover:text-bone",
                          active && "text-bone"
                        )}
                      >
                        {/* End-credit numbering — the menu as a cue sheet. */}
                        <span
                          aria-hidden
                          className={cn(
                            "tabular-nums",
                            active ? "text-ember" : "text-smoke/45"
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="flex-1">{link.label}</span>
                        {active && (
                          <span
                            aria-hidden
                            className="h-px w-6 bg-ember shadow-[0_0_10px_rgba(255,45,71,0.8)]"
                          />
                        )}
                      </Link>
                      <div aria-hidden className="hairline-dim" />
                    </div>
                  );
                })}
              </nav>

              <div className="mt-auto px-5 pb-8">
                <div aria-hidden className="hairline-dim" />
                <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6">
                  {DRAWER_SOCIALS.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      className="u-meta text-smoke transition-colors duration-300 hover:text-ember"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
