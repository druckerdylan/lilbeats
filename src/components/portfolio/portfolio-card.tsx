import { ArrowUpRight } from "lucide-react";
import { PortfolioItem } from "@/lib/types";
import { AudioPlayer } from "@/components/beats/audio-player";
import { FilmFrame } from "@/components/shared/film-frame";
import { GlitchText } from "@/components/visuals/glitch-text";
import { HudFrame } from "@/components/visuals/hud-frame";
import { Tilt } from "@/components/visuals/tilt";
import { cn } from "@/lib/utils";
import {
  InstagramIcon,
  SpotifyIcon,
  AppleMusicIcon,
  YoutubeIcon,
  SoundcloudIcon,
} from "@/components/shared/social-icons";

export const PLATFORM_META: Record<
  PortfolioItem["platform"],
  { label: string; Icon: typeof InstagramIcon }
> = {
  spotify: { label: "Spotify", Icon: SpotifyIcon },
  "apple-music": { label: "Apple Music", Icon: AppleMusicIcon },
  youtube: { label: "YouTube", Icon: YoutubeIcon },
  soundcloud: { label: "SoundCloud", Icon: SoundcloudIcon },
};

/**
 * Covers that are already dark and near-neutral: one is red neon on black,
 * the other a low-lit controller. `grade-cinema` plus the red wash is enough
 * for those, and forcing their hue as well only flattens the contrast they
 * already have.
 *
 * Everything else gets the duotone. Desaturation alone does not tame a
 * strongly coloured source — RGB desk lighting, a wall of dyed felt, a lit
 * screen — and those covers otherwise read as a second palette sitting next
 * to the near-black/red system.
 *
 * Keyed by id because the call is per photograph, not per field: real
 * artwork uploaded through the admin dashboard should be graded at the
 * source, and callers can always override with the `duotone` prop.
 */
const NEUTRAL_COVERS = new Set<string>(["pf-003", "pf-004"]);

export function coverNeedsDuotone(item: PortfolioItem) {
  return !NEUTRAL_COVERS.has(item.id);
}

/**
 * The "listen on <platform>" credit line. Exported so the featured-release
 * band on /portfolio ends on exactly the same end-credit as every tile.
 */
export function PlatformLink({
  item,
  className,
}: {
  item: PortfolioItem;
  className?: string;
}) {
  const platform = PLATFORM_META[item.platform];

  return (
    <a
      href={item.platformUrl}
      target="_blank"
      rel="noreferrer"
      className={cn(
        // `min-h-11` is the touch target: the credit voice is 11px type, and
        // a 15px-tall link is not tappable on a phone.
        "u-meta group/credit inline-flex min-h-11 items-center gap-3 text-smoke transition-colors duration-300 hover:text-ember",
        className
      )}
    >
      <platform.Icon className="size-4 shrink-0" aria-hidden />
      <span>Listen on {platform.label}</span>
      <ArrowUpRight
        aria-hidden
        className="size-3.5 shrink-0 transition-transform duration-300 group-hover/credit:-translate-y-0.5 group-hover/credit:translate-x-0.5"
      />
    </a>
  );
}

/**
 * A release tile, housed like a monitored channel: the credit line is hung
 * outside the frame as a HUD readout (role on the left, year on the right),
 * the graded still sits inside the housing, and the title decodes under the
 * pointer. The anatomy is still metadata → display → metadata, so a 44px
 * title sits between two 11px mono lines — the top line has just moved out
 * of the card and onto the instrument.
 *
 * The whole tile tilts under the pointer. `max` stays low: past a few
 * degrees a card with body copy in it stops reading as a lit surface and
 * starts reading as a novelty.
 *
 * The cover aspect and `sizes` are passed in per grid slot rather than fixed
 * here — the /portfolio wall varies tile widths, and a single ratio would
 * flatten it straight back into a uniform 3-up.
 */
export function PortfolioCard({
  item,
  className,
  coverClassName = "aspect-[16/10]",
  sizes = "(min-width: 1024px) 46vw, (min-width: 640px) 48vw, 100vw",
  duotone = coverNeedsDuotone(item),
}: {
  item: PortfolioItem;
  className?: string;
  /** Aspect utility for the cover, e.g. `aspect-square`. */
  coverClassName?: string;
  sizes?: string;
  /** Forces the cover's hue to brand red. Defaults per photograph. */
  duotone?: boolean;
}) {
  return (
    <Tilt max={5} className={cn("h-full w-full", className)}>
      {/* `pt-7` reserves the band the HUD readout hangs in — HudFrame lifts
          its label and readout to `-top-6`, outside its own border, so the
          tile has to leave that strip empty or the row above collides. */}
      <article className="flex h-full w-full flex-col pt-7">
        <HudFrame
          label={item.role}
          readout={String(item.year)}
          className={cn(
            "edge-hot group flex flex-1 flex-col bg-pitch",
            // `edge-hot` transitions `transform`, and Tailwind v4's translate
            // utilities write the *`translate`* property — which that
            // transition does not cover, so the lift would snap. Setting
            // `transform` directly keeps the hover on the curve edge-hot
            // already animates. Hover lives on this element rather than the
            // <article> so the lift, the igniting hairline and the cover
            // push-in all fire off one surface.
            "hover:[transform:translateY(-4px)]"
          )}
        >
          <div
            className={cn("relative w-full shrink-0 overflow-hidden bg-pitch", coverClassName)}
          >
            {/*
              Same treatment as every other photograph on the site — grade,
              duotone, red wash, vignette, drift — so a release cover and a
              full-bleed still read as one shoot. The frame itself carries the
              hover push-in; scaling it rather than the raw <Image> keeps the
              overlays locked to the picture instead of sliding across it.
            */}
            <FilmFrame
              src={item.coverUrl}
              alt={`${item.title} — ${item.artist}`}
              sizes={sizes}
              intensity={0.12}
              duotone={duotone}
              className="absolute inset-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-pitch via-pitch/50 to-transparent"
              aria-hidden
            />
          </div>

          <div className="flex flex-1 flex-col gap-6 p-5 sm:p-7">
            <header>
              <h3 className="font-display text-d3 uppercase text-balance text-bone">
                <GlitchText text={item.title} />
              </h3>
              <p className="u-meta mt-2.5 text-smoke">{item.artist}</p>
            </header>

            <p className="max-w-xl text-base leading-relaxed text-smoke">{item.description}</p>

            <div className="mt-auto flex flex-col gap-4 pt-1">
              <div className="hairline-dim" aria-hidden />
              <AudioPlayer beatId={item.id} src={item.previewAudioUrl} label="Preview" />
              <PlatformLink item={item} />
            </div>
          </div>
        </HudFrame>
      </article>
    </Tilt>
  );
}
