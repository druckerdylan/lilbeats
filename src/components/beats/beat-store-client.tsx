"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Beat } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { BeatCard } from "@/components/beats/beat-card";
import {
  BeatFilters,
  countActiveFilters,
  FilterOptions,
  FilterState,
  SortOption,
} from "@/components/beats/beat-filters";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { HudFrame } from "@/components/visuals/hud-frame";
import { useAudioPlayerStore } from "@/lib/store/player-store";
import { cn } from "@/lib/utils";

function buildOptions(beats: Beat[]) {
  const genres = Array.from(new Set(beats.map((b) => b.genre))).sort();
  const moods = Array.from(new Set(beats.flatMap((b) => b.mood))).sort();
  const keys = Array.from(new Set(beats.map((b) => b.key))).sort();
  const bpms = beats.map((b) => b.bpm);

  // An unpublished catalog is a real state (fresh Supabase project); without
  // the guards the spreads below hand the range sliders ±Infinity.
  return {
    genres,
    moods,
    keys,
    bpmMin: bpms.length ? Math.min(...bpms) : 0,
    bpmMax: bpms.length ? Math.max(...bpms) : 0,
  };
}

/**
 * The constraints currently narrowing the catalog, as readout rows. Only
 * built for the empty state, where the fastest way to explain "no results" is
 * to show the query that produced them.
 */
function activeConstraints(
  search: string,
  filters: FilterState,
  options: FilterOptions
): { label: string; value: string }[] {
  const rows: { label: string; value: string }[] = [];
  const query = search.trim();

  if (query) rows.push({ label: "Query", value: `"${query}"` });
  if (filters.genres.length) rows.push({ label: "Genre", value: filters.genres.join(", ") });
  if (filters.moods.length) rows.push({ label: "Mood", value: filters.moods.join(", ") });
  if (filters.keys.length) rows.push({ label: "Key", value: filters.keys.join(", ") });
  if (filters.bpmRange[0] !== options.bpmMin || filters.bpmRange[1] !== options.bpmMax) {
    rows.push({ label: "BPM", value: `${filters.bpmRange[0]} – ${filters.bpmRange[1]}` });
  }

  return rows;
}

export function BeatStoreClient({ beats }: { beats: Beat[] }) {
  const options = useMemo(() => buildOptions(beats), [beats]);
  // The transport docks to the bottom of the viewport while a preview runs,
  // which is exactly where the drawer's action row sits.
  const transportOpen = useAudioPlayerStore((s) => Boolean(s.currentTrack && s.currentBeatId));
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    genres: [],
    moods: [],
    keys: [],
    bpmRange: [options.bpmMin, options.bpmMax],
    sort: "popular",
  });

  const activeCount = countActiveFilters(filters, options);

  const resetFilters = () =>
    setFilters({
      genres: [],
      moods: [],
      keys: [],
      bpmRange: [options.bpmMin, options.bpmMax],
      sort: "popular",
    });

  const filteredBeats = useMemo(() => {
    const searchLower = search.trim().toLowerCase();

    const result = beats.filter((beat) => {
      if (searchLower) {
        const haystack = `${beat.title} ${beat.genre} ${beat.tags.join(" ")}`.toLowerCase();
        if (!haystack.includes(searchLower)) return false;
      }
      if (filters.genres.length && !filters.genres.includes(beat.genre)) return false;
      if (filters.moods.length && !beat.mood.some((m) => filters.moods.includes(m))) return false;
      if (filters.keys.length && !filters.keys.includes(beat.key)) return false;
      if (beat.bpm < filters.bpmRange[0] || beat.bpm > filters.bpmRange[1]) return false;
      return true;
    });

    switch (filters.sort) {
      case "newest":
        return result.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      case "popular":
      default:
        return result.sort((a, b) => b.plays - a.plays);
    }
  }, [beats, search, filters]);

  // Only the empty state reads these, so they cost nothing the rest of the time.
  const catalogEmpty = beats.length === 0;
  const constraints =
    filteredBeats.length === 0 ? activeConstraints(search, filters, options) : [];

  return (
    <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-x-12 gap-y-10 px-5 pt-14 pb-28 sm:px-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-14 lg:pt-16 lg:pb-36 xl:gap-x-16">
      {/*
        The rail flows with the page rather than sticking. The full stack of
        racks runs well past a viewport, so a sticky column could only ever
        show its top — the previous `max-h` + `scrollbar-none` combination
        silently swallowed KEY, BPM and PRICE with no affordance at all.
      */}
      <aside className="hidden lg:block" aria-label="Filter beats">
        <div className="relative pr-10">
          <span
            aria-hidden
            className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-bone/12 to-transparent"
          />
          <BeatFilters
            filters={filters}
            onChange={setFilters}
            options={options}
            onReset={resetFilters}
          />
        </div>
      </aside>

      <div>
        <div className="mb-10 flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Terminal field: mono prompt copy, hairline box, and a glyph
                that ignites with the ember focus border. */}
            <div className="group relative flex-1">
              <Search
                aria-hidden
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-smoke transition-colors duration-300 group-focus-within:text-ember-bright"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search title / genre / tag"
                aria-label="Search beats"
                className="input-cinema w-full pl-11! text-bone placeholder:font-mono placeholder:text-[11px] placeholder:tracking-[0.22em] placeholder:uppercase placeholder:text-smoke/60 focus-visible:ring-0"
              />
            </div>

            <Sheet>
              <SheetTrigger
                render={<Button variant="cinemaGhost" size="cinemaSm" className="lg:hidden" />}
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeCount > 0 && (
                  <Badge
                    variant="metaHot"
                    className="min-w-5 px-1.5 tracking-normal tabular-nums"
                  >
                    {activeCount}
                  </Badge>
                )}
              </SheetTrigger>
              {/*
                Body scrolls, action row stays put. Its padding clears the
                now-playing transport whenever that is docked.
              */}
              <SheetContent
                side="left"
                className="gap-0 border-r border-bone/12 bg-pitch text-bone data-[side=left]:w-[85%]"
              >
                <SheetHeader className="sr-only">
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-14 pb-10">
                  <BeatFilters
                    filters={filters}
                    onChange={setFilters}
                    options={options}
                    onReset={resetFilters}
                  />
                </div>
                <div
                  className={cn(
                    "shrink-0 border-t border-bone/12 bg-pitch px-5 pt-4",
                    transportOpen ? "pb-[5.5rem]" : "pb-5"
                  )}
                >
                  {filteredBeats.length === 0 ? (
                    <Button
                      variant="cinemaGhost"
                      size="cinemaSm"
                      className="w-full"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </Button>
                  ) : (
                    <SheetClose
                      render={<Button variant="cinema" size="cinemaSm" className="w-full" />}
                    >
                      Show {filteredBeats.length}{" "}
                      {filteredBeats.length === 1 ? "Beat" : "Beats"}
                    </SheetClose>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/*
            Readout strip. The count is the one genuinely live number on the
            page, so it gets the housing: brackets, a status lamp, and the
            sort control docked into the same plate.
          */}
          <div className="hud-corners relative flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border border-bone/12 bg-charcoal/30 px-4 py-3 sm:px-5">
            <p className="u-meta flex items-center gap-2.5 text-smoke" aria-live="polite">
              <span aria-hidden className="relative flex size-1.5 shrink-0">
                <span className="animate-pulse-glow absolute inset-0 rounded-full bg-ember-bright" />
                <span className="relative inline-flex size-1.5 rounded-full bg-ember-bright" />
              </span>
              <span>
                <span className="tabular-nums text-bone">
                  {String(filteredBeats.length).padStart(2, "0")}
                </span>{" "}
                {filteredBeats.length === 1 ? "Beat" : "Beats"}
                <span className="mx-2 text-bone/25" aria-hidden>
                  /
                </span>
                <span className="tabular-nums">{beats.length}</span> In Catalog
              </span>
            </p>

            <div className="flex items-center gap-3">
              <span className="u-meta hidden text-smoke sm:inline" aria-hidden>
                Sort
              </span>
              <Select
                value={filters.sort}
                onValueChange={(value) =>
                  setFilters({ ...filters, sort: value as SortOption })
                }
              >
                <SelectTrigger
                  aria-label="Sort beats"
                  className="u-meta h-10 w-[186px] rounded-none border-bone/14 bg-ink/55 text-bone transition-colors hover:border-ember/45 dark:bg-ink/55"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  <SelectItem value="popular">Most Played</SelectItem>
                  <SelectItem value="newest">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filteredBeats.length === 0 ? (
          <HudFrame
            label="Catalog Query"
            readout={`00 / ${String(beats.length).padStart(2, "0")} Matched`}
            className="isolate mt-9 bg-charcoal/25 px-6 py-20 text-center sm:px-12 sm:py-24"
          >
            {/* Clipped on its own layer: `overflow-hidden` on the frame itself
                would swallow the corner brackets and the readout bar, which
                both sit outside its box. */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="spotlight absolute -top-32 left-1/2 h-[420px] w-[620px] -translate-x-1/2 opacity-55" />
            </div>

            <div className="relative mx-auto flex max-w-lg flex-col items-center">
              {/* The page's one cyan: signal-loss fringing on the failure. */}
              <p className="aberrate font-display text-d2 uppercase leading-none text-bone">
                No Signal
              </p>
              <p className="mt-6 text-base leading-relaxed text-smoke">
                {catalogEmpty
                  ? "Nothing is published to the catalog yet."
                  : "Those filters cut the catalog down to nothing. Widen the range or start the search over."}
              </p>

              {constraints.length > 0 && (
                <dl className="mt-10 w-full border-t border-bone/10 text-left">
                  {constraints.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-start gap-5 border-b border-bone/10 py-3"
                    >
                      <dt className="u-meta w-16 shrink-0 text-smoke">{row.label}</dt>
                      <dd className="u-meta flex-1 break-words text-ember-bright">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {!catalogEmpty && (
                <Button
                  variant="cinema"
                  size="cinemaSm"
                  className="mt-10"
                  onClick={resetFilters}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </HudFrame>
        ) : (
          <RevealGroup
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 xl:gap-7 2xl:grid-cols-4"
            stagger={0.05}
          >
            {filteredBeats.map((beat) => (
              <RevealItem key={beat.id} variant="rise" className="h-full [&>*]:h-full">
                <BeatCard beat={beat} />
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>
    </div>
  );
}
