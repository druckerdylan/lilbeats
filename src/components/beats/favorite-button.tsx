"use client";

import { Heart } from "lucide-react";
import { useFavoritesStore } from "@/lib/store/favorites-store";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  beatId,
  className,
}: {
  beatId: string;
  className?: string;
}) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(beatId));
  const toggle = useFavoritesStore((s) => s.toggle);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(beatId);
      }}
      aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      aria-pressed={isFavorite}
      className={cn(
        // Hairline ring on smoked glass; ignites to neon once it's saved.
        "group/fav flex size-8 items-center justify-center rounded-full bg-ink/55 text-smoke ring-1 ring-bone/20 outline-none backdrop-blur-sm transition-[color,background-color,box-shadow] duration-300 ring-inset hover:text-ember-bright hover:ring-ember/55",
        // The glow is never the only tell — the heart also fills.
        isFavorite &&
          "bg-ember/12 text-ember-bright shadow-[0_0_24px_-5px_rgba(255,10,60,0.9)] ring-ember/70",
        "focus-visible:text-ember-bright focus-visible:ring-2 focus-visible:ring-ember-bright",
        className
      )}
    >
      <Heart
        className={cn(
          "size-4 transition-transform duration-300 group-hover/fav:scale-110",
          isFavorite && "fill-ember-bright"
        )}
      />
    </button>
  );
}
