"use client";

import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlitchText } from "@/components/visuals/glitch-text";
import { EXCLUSIVE_LICENSE_NOTE } from "@/lib/licensing";

export function ExclusiveLicenseDialog({ beatTitle }: { beatTitle: string }) {
  return (
    <Dialog>
      {/*
        The label is quoted verbatim in the FAQ copy, so it stays as-is. At
        11 mono characters of tracking per glyph it is a wide button, and
        `cinema`'s px-8 pushed it past a 390px column — the padding tightens
        on small screens instead of letting the row wrap under itself.
      */}
      <DialogTrigger
        render={<Button variant="cinemaGhost" size="cinema" className="px-5 sm:px-8" />}
      >
        Exclusive License Inquiry
      </DialogTrigger>
      {/* Square, near-black, hairline — the popup should read as the same
          material as the page, not as a rounded app sheet on top of it. The
          stock close affordance is a 28px rounded ghost button; squared and
          enlarged here so it is the same material and a real tap target.
          `neon-edge` is the one glow: a panel that has just been switched on.
          (Deliberately a box-shadow rather than `hud-corners`, which sets
          `position: relative` and would knock the popup off its centring.) */}
      <DialogContent
        className="neon-edge gap-0 rounded-none border border-bone/12 bg-pitch p-6 text-bone ring-0 sm:max-w-md sm:p-8 [&_[data-slot=dialog-close]]:top-3 [&_[data-slot=dialog-close]]:right-3 [&_[data-slot=dialog-close]]:size-10 [&_[data-slot=dialog-close]]:rounded-none"
      >
        <DialogHeader className="gap-0">
          <DialogTitle className="text-bone">
            {/* The popup mounts on open, so the status line decodes exactly
                once, as the panel comes up. The real string rides on
                `aria-label`, so the dialog's accessible name is unchanged. */}
            <span className="u-meta mb-4 block text-ember">
              <GlitchText text="Exclusive Rights" trigger="view" />
            </span>
            <span className="block max-w-[calc(100%-2.5rem)] font-display text-d3 uppercase leading-none">
              {beatTitle}
            </span>
          </DialogTitle>
          <div aria-hidden className="hairline-dim mt-6" />
          <DialogDescription className="mt-6 max-w-md text-base leading-relaxed text-smoke">
            {EXCLUSIVE_LICENSE_NOTE}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mx-0 mb-0 mt-8 rounded-none border-t border-bone/10 bg-transparent p-0 pt-6">
          <Button
            variant="cinema"
            size="cinema"
            className="w-full px-5 sm:w-auto sm:px-8"
            render={
              <Link
                href={`/contact?subject=exclusive-license&beat=${encodeURIComponent(beatTitle)}`}
              />
            }
          >
            Contact us about this beat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
