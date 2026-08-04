/**
 * Thin helper around Unsplash's image CDN for placeholder photography.
 * Swap these photo IDs for your own shots (studio, artwork, portraits)
 * whenever you're ready — the admin dashboard uploads real artwork to
 * Supabase Storage instead of this path.
 */
export function unsplash(id: string, params = "w=1200&q=80&fit=crop&auto=format") {
  return `https://images.unsplash.com/photo-${id}?${params}`;
}
