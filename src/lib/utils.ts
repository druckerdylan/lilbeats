import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/**
 * tailwind-merge only knows Tailwind's stock scale, so it has to guess at
 * this project's custom `text-*` utilities — and it guesses "colour" for all
 * of them. That silently deletes classes: `cn("text-bone", "text-d1")` was
 * dropping the colour, and `cn("text-d2 ...", "text-outline")` was dropping
 * the *size*, which is why the marquee's display type rendered at 16px.
 *
 * Registering the tokens fixes both directions: size still overrides size,
 * colour still overrides colour, and the two stop fighting each other.
 *
 * `text-bloom` / `text-chromatic` set only `text-shadow`, so they get their
 * own group — they must never displace a colour. `text-outline` and
 * `text-gradient-ember` do set `color`, so leaving them in the colour group
 * is correct.
 */
// The type parameter declares the extra class-group id; without it
// tailwind-merge only accepts its own built-in group names.
const twMerge = extendTailwindMerge<"lb-text-fx">({
  extend: {
    classGroups: {
      "font-size": [{ text: ["d0", "d1", "d2", "d3", "meta", "meta-lg"] }],
      "lb-text-fx": [{ text: ["bloom", "chromatic"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
