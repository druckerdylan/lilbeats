"use client";

import Image from "next/image";
import Link from "next/link";
import { X } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const setOpen = useCartStore((s) => s.setOpen);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);

  // The transport bar is `fixed bottom-0` and ~65px tall whenever a preview
  // is loaded. The drawer runs the full height of the viewport, so without
  // extra footer padding the Checkout CTA lands right on top of it.
  const transportDocked = useAudioPlayerStore((s) =>
    Boolean(s.currentTrack && s.currentBeatId)
  );

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          // `glass-dense` rather than `glass`: at 0.62 alpha the display type
          // on the page underneath reads straight through the blur.
          "glass-dense flex flex-col gap-0 border-l border-ember/25 p-0 text-bone",
          // The base sheet's width classes carry a `[data-side]` attribute
          // selector, so they outrank a plain `w-full` / `sm:max-w-md` and the
          // drawer silently stayed at 75% width on phones. Matching the
          // variant lets tailwind-merge replace them properly.
          "data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        )}
      >
        <SheetHeader className="gap-0 p-0 px-5 pt-7 pb-5 sm:px-6 sm:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="u-meta flex items-center gap-2 text-ember tabular-nums">
                {/* Held-order indicator, the same live glyph `HudFrame` uses.
                   It only burns while there is actually something queued. */}
                {items.length > 0 && (
                  <span className="relative flex size-1.5 shrink-0" aria-hidden>
                    <span className="animate-pulse-glow absolute inset-0 rounded-full bg-ember-bright" />
                    <span className="relative inline-flex size-1.5 rounded-full bg-ember-bright" />
                  </span>
                )}
                {items.length > 0 ? `${items.length} in cart` : "Cart"}
              </p>
              <SheetTitle className="mt-3 font-display text-d3 font-normal text-bone uppercase">
                Your Cart
              </SheetTitle>
            </div>
            <SheetClose
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="-mt-2 -mr-2 size-10 shrink-0 text-smoke hover:bg-bone/5 hover:text-bone"
                  aria-label="Close cart"
                />
              }
            >
              <X className="size-4" aria-hidden />
            </SheetClose>
          </div>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="relative flex flex-1 flex-col items-center justify-center px-5 text-center sm:px-6">
            <div
              aria-hidden
              className="spotlight pointer-events-none absolute inset-x-0 top-1/2 mx-auto h-72 w-full max-w-72 -translate-y-1/2 opacity-80"
            />
            <div className="relative w-full max-w-xs">
              <p className="u-meta text-smoke">Nothing queued</p>
              <p className="mt-5 font-display text-d2 text-bone uppercase">
                Empty
                <br />
                <span className="text-outline">Crate</span>
              </p>
              <p className="mt-6 text-base leading-relaxed text-smoke">
                Nothing picked out yet. The catalog is waiting.
              </p>
              <Button
                variant="cinema"
                size="cinema"
                className="mt-8 w-full"
                onClick={() => setOpen(false)}
                render={<Link href="/beats" />}
              >
                Browse Beats
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Manifest header: mono column labels over a ticked scale, so the
               list below reads as an order sheet rather than a stack of
               product cards. */}
            <div className="shrink-0 px-5 sm:px-6">
              <div className="flex items-end justify-between gap-4 pb-2.5">
                <p className="u-meta min-w-0 truncate text-smoke">Item / License</p>
                <p className="u-meta shrink-0 text-smoke">Price</p>
              </div>
              <div className="hud-ticks opacity-60" aria-hidden />
            </div>

            <ul className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-6">
              {items.map((item, index) => (
                <li key={item.id} className="group">
                  {index > 0 && <div className="hairline-dim" aria-hidden />}
                  <div className="flex items-start gap-4 py-5">
                    <div className="relative size-16 shrink-0 overflow-hidden">
                      <Image
                        src={item.artworkUrl}
                        alt={item.beatTitle}
                        fill
                        sizes="64px"
                        className="grade-cinema object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="vignette-frame pointer-events-none absolute inset-0" aria-hidden />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate font-display text-2xl leading-none text-bone uppercase">
                          {item.beatTitle}
                        </p>
                        <span className="shrink-0 font-display text-2xl leading-none text-bone tabular-nums">
                          {formatPrice(item.price)}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="u-meta min-w-0 truncate text-smoke">
                          {item.licenseName}
                          <span className="mx-2 text-bone/25">/</span>
                          Qty 1
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.beatTitle} (${item.licenseName})`}
                          className="-mr-1.5 flex size-9 shrink-0 items-center justify-center border border-bone/15 text-smoke transition-colors hover:border-ember/50 hover:text-ember-bright"
                        >
                          <X className="size-3.5" aria-hidden />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <SheetFooter
              className={cn(
                "mt-auto gap-0 p-0 px-5 pt-0 sm:px-6",
                transportDocked
                  ? "pb-[calc(6rem_+_env(safe-area-inset-bottom))]"
                  : "pb-[calc(2rem_+_env(safe-area-inset-bottom))]"
              )}
            >
              <div className="hairline" aria-hidden />
              <div className="flex items-baseline justify-between gap-4 pt-6">
                <span className="u-meta shrink-0 text-smoke">Subtotal</span>
                <span className="font-display text-4xl leading-none text-bone tabular-nums sm:text-5xl">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <Button
                variant="cinema"
                size="cinema"
                className="mt-6 w-full"
                onClick={() => setOpen(false)}
                render={<Link href="/checkout" />}
              >
                Checkout
              </Button>
              <p className="u-meta mt-4 text-center text-smoke">
                Instant delivery after payment
              </p>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
