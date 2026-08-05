"use client";

import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { Pause, Play, ShoppingCart } from "lucide-react";
import { Beat } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/beats/favorite-button";
import { EqBars } from "@/components/shared/eq-bars";
import { GlitchText } from "@/components/visuals/glitch-text";
import { Tilt } from "@/components/visuals/tilt";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { useCartStore } from "@/lib/store/cart-store";
import { getLicenseTier, priceForLicense } from "@/lib/licensing";
import { formatDuration, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * The catalogue tile. `feature` is the oversized editorial variant used once
 * per grid — same anatomy, bigger type, and artwork that fills whatever
 * height the grid gives it instead of locking to a square.
 *
 * The artwork is treated as instrumentation rather than a picture: targeting
 * brackets at the corners and a mono transport readout along the foot, all of
 * it driven by the beat's real data (BPM, key, duration) and, once this is the
 * playing track, by the live position from the player store.
 */
export function BeatCard({
  beat,
  variant = "tile",
  className,
}: {
  beat: Beat;
  variant?: "tile" | "feature";
  className?: string;
}) {
  const currentBeatId = useAudioPlayerStore((s) => s.currentBeatId);
  const isPlaying = useAudioPlayerStore((s) => s.isPlaying);
  const currentTime = useAudioPlayerStore((s) => s.currentTime);
  const duration = useAudioPlayerStore((s) => s.duration);
  const toggle = useAudioPlayerStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);
  const hasLicense = useCartStore((s) => s.hasLicense);

  const isFeature = variant === "feature";
  const isActive = currentBeatId === beat.id;
  const progress = isActive && duration > 0 ? (currentTime / duration) * 100 : 0;
  const mp3Tier = getLicenseTier("mp3")!;
  const mp3Price = priceForLicense("mp3");
  const inCart = hasLicense(beat.id, "mp3");

  // BPM and running time moved onto the artwork readout, so the credits line
  // carries what's left rather than repeating it.
  const meta = [
    beat.genre,
    `${beat.key} ${beat.keyMode}`,
    ...(isFeature ? [beat.licenseAvailability.map((id) => id.toUpperCase()).join(" / ")] : []),
  ];

  // The live glow lives on the tilt wrapper, not the card: `edge-hot:hover`
  // owns the card's own box-shadow, so stacking them there would trade the
  // live state away the moment the pointer arrived.
  return (
    <Tilt max={6} className={cn("h-full", isActive && "neon-edge", className)}>
      <div
        className={cn(
          "edge-hot group relative flex h-full flex-col overflow-hidden bg-charcoal hover:-translate-y-1",
          // The playing card should be findable from across a grid: glowing
          // edge, lit title, live readout.
          isActive && "border-ember/45"
        )}
      >
        <div
          className={cn(
            "relative w-full overflow-hidden bg-pitch",
            isFeature ? "min-h-[18rem] flex-1" : "aspect-square"
          )}
        >
          <Image
            src={beat.artworkUrl}
            alt={beat.title}
            fill
            sizes={
              isFeature
                ? "(min-width: 1024px) 46vw, (min-width: 640px) 92vw, 100vw"
                : "(min-width: 1280px) 25vw, (min-width: 640px) 46vw, 100vw"
            }
            className="grade-cinema-soft object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          {/* Grading pass: corner falloff plus a foot of black so every cover,
              whatever it was shot like, sits in the same catalogue. */}
          <div aria-hidden className="vignette-frame pointer-events-none absolute inset-0" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-ink/25 to-transparent"
          />
          {/* Key light from below. Latched on while this track is live, so the
              playing tile stays lit after the pointer leaves. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-500",
              isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            style={{
              background:
                "radial-gradient(120% 90% at 50% 100%, rgba(194,20,47,0.28), transparent 62%)",
            }}
          />

          <div className="absolute right-4 top-4 z-30 flex flex-col gap-2">
            <FavoriteButton beatId={beat.id} />
          </div>

          {(beat.featured || beat.isNew) && (
            <div className="absolute left-4 top-4 z-30 flex gap-1.5">
              {beat.isNew && <Badge variant="metaHot">New</Badge>}
              {beat.featured && !beat.isNew && <Badge variant="meta">Featured</Badge>}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              toggle(beat.id, beat.previewAudioUrl, {
                title: beat.title,
                subtitle: `${beat.genre} · ${beat.bpm} BPM`,
                artworkUrl: beat.artworkUrl,
                href: `/beats/${beat.slug}`,
              })
            }
            aria-label={isActive && isPlaying ? `Pause ${beat.title}` : `Play ${beat.title} preview`}
            className={cn(
              "absolute inset-0 z-30 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100",
              isActive && "opacity-100"
            )}
          >
            <span
              className={cn(
                "flex items-center justify-center rounded-full bg-ink/70 text-bone ring-1 ring-ember/40 backdrop-blur-sm transition-transform duration-300 hover:scale-110",
                "shadow-[0_0_34px_-6px_rgba(194,20,47,0.7)]",
                isFeature ? "size-20" : "size-14"
              )}
            >
              {isActive && isPlaying ? (
                <Pause className={isFeature ? "size-7" : "size-5"} />
              ) : (
                <Play className={cn("ml-0.5", isFeature ? "size-7" : "size-5")} />
              )}
            </span>
          </button>

          {/* Transport readout. Tempo on the left, running time on the right —
              real values only, switching to a live position counter once this
              is the track on the deck. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/80 to-transparent px-4 pb-3.5 pt-12">
            <span
              className={cn(
                "u-meta flex items-center gap-2 transition-colors duration-300",
                isActive ? "text-ember-bright" : "text-smoke group-hover:text-bone"
              )}
            >
              {isActive && <EqBars playing={isPlaying} bars={4} className="h-3" />}
              {beat.bpm} BPM
            </span>
            <span
              className={cn(
                "u-meta tabular-nums transition-colors duration-300",
                isActive ? "text-bone" : "text-smoke/70"
              )}
            >
              {isActive
                ? // Counts against the loaded preview once its metadata is in,
                  // so the two halves of the readout always agree.
                  `${formatDuration(currentTime)} / ${formatDuration(duration > 0 ? duration : beat.durationSeconds)}`
                : formatDuration(beat.durationSeconds)}
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-bone/10">
            <div
              className={cn(
                "h-full bg-ember transition-[width] duration-150",
                isActive && "bg-ember-bright"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Targeting brackets. The wrapper carries the state so the frame
              sits at a whisper until the card is hovered or goes live. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-0 z-30 transition-opacity duration-500",
              isActive ? "opacity-100" : "opacity-40 group-hover:opacity-100"
            )}
          >
            <div className="hud-corners size-full" />
          </div>
        </div>

        <div className={cn("flex flex-col gap-4", isFeature ? "p-7 sm:p-9" : "flex-1 p-5")}>
          <div>
            {/*
              Stretched link: the pseudo-element covers the whole card so any
              dead space opens the beat, while the title stays the actual
              anchor for assistive tech and for the URL preview on hover.

              Nesting the card inside an <a> would be invalid — the card
              already holds a play button, a favourite toggle and an add-to-
              cart button. Those sit above this layer on z-30 and keep working.
            */}
            <Link
              href={`/beats/${beat.slug}`}
              className="block font-display uppercase text-bone transition-colors hover:text-ember after:absolute after:inset-0 after:z-10 after:content-['']"
            >
              <GlitchText
                text={beat.title}
                trigger="hover"
                className={cn(
                  "block",
                  isActive && "neon-text",
                  isFeature ? "text-d2 line-clamp-2" : "text-d3 line-clamp-1"
                )}
              />
            </Link>
            <p className="u-meta mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-smoke">
              {meta.map((item, i) => (
                <Fragment key={item}>
                  {i > 0 && <span aria-hidden className="h-2.5 w-px bg-bone/25" />}
                  <span>{item}</span>
                </Fragment>
              ))}
            </p>
          </div>

          {isFeature && (
            <p className="max-w-xl text-base leading-relaxed text-smoke line-clamp-2">
              {beat.description}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {beat.mood.slice(0, isFeature ? 4 : 2).map((mood) => (
              <Badge key={mood} variant="meta">
                {mood}
              </Badge>
            ))}
          </div>

          <div
            className={cn(
              "mt-auto flex flex-wrap items-end justify-between gap-4",
              isFeature ? "pt-4" : "pt-2"
            )}
          >
            <div>
              <p className="u-meta text-smoke">From</p>
              <p
                className={cn(
                  "mt-1.5 font-display leading-none text-bone",
                  isFeature ? "text-d3" : "text-4xl"
                )}
              >
                {formatPrice(mp3Price)}
              </p>
            </div>
            <Button
              variant="cinema"
              size={isFeature ? "cinema" : "cinemaSm"}
              disabled={inCart}
              onClick={() =>
                addItem({
                  beatId: beat.id,
                  beatSlug: beat.slug,
                  beatTitle: beat.title,
                  artworkUrl: beat.artworkUrl,
                  licenseId: "mp3",
                  licenseName: mp3Tier.name,
                  price: mp3Price,
                })
              }
              // `relative z-30` lifts it clear of the stretched link that
              // makes the rest of the card open the beat page.
              className={cn(
                "relative z-30",
                inCart && "bg-gunmetal text-smoke hover:bg-gunmetal hover:shadow-none"
              )}
            >
              <ShoppingCart />
              {inCart ? "In cart" : "Add"}
            </Button>
          </div>
        </div>
      </div>
    </Tilt>
  );
}
