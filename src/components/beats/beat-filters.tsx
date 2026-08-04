"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { GlitchText } from "@/components/visuals/glitch-text";
import { cn } from "@/lib/utils";

export type SortOption = "popular" | "newest";

export interface FilterState {
  genres: string[];
  moods: string[];
  keys: string[];
  bpmRange: [number, number];
  sort: SortOption;
}

export interface FilterOptions {
  genres: string[];
  moods: string[];
  keys: string[];
  bpmMin: number;
  bpmMax: number;
}

interface BeatFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  options: FilterOptions;
  onReset: () => void;
}

/**
 * How many rows a checkbox list shows before the rest collapse behind a
 * counted toggle. The catalog carries ~18 moods; run them all out and the
 * BPM/PRICE racks end up a screen and a half below the fold.
 */
const LIST_LIMIT = 8;

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

/** Shared by the rail and the mobile drawer trigger, so the two agree. */
export function countActiveFilters(filters: FilterState, options: FilterOptions): number {
  return (
    filters.genres.length +
    filters.moods.length +
    filters.keys.length +
    (filters.bpmRange[0] !== options.bpmMin || filters.bpmRange[1] !== options.bpmMax ? 1 : 0)
  );
}

/**
 * One rack unit. A ticked measuring rule above each group — masked so it
 * trails off rather than ruling the full width five times — keeps the panel
 * reading as stacked gear rather than a stack of form fieldsets. The index
 * numbers are rack positions, not chapter numbers.
 */
function FilterGroup({
  index,
  label,
  readout,
  hot = false,
  children,
}: {
  index: string;
  label: string;
  readout?: React.ReactNode;
  /** Ignites the readout once the group is actually constraining the catalog. */
  hot?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div
        aria-hidden
        className="hud-ticks opacity-55 [mask-image:linear-gradient(90deg,#000_0%,#000_58%,transparent_100%)]"
      />
      <div className="pt-5">
        {/*
          Wraps rather than squeezes: at the rail's 250px the PRICE readout
          (`$29.00 – $99.00`) plus its rack index is wider than the column, and
          a clipped readout on an instrument panel is worse than a second line.
        */}
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1.5">
          <h3 className="u-meta flex items-baseline gap-2.5 text-smoke">
            <span className="tabular-nums text-bone/25" aria-hidden>
              {index}
            </span>
            {label}
          </h3>
          {readout ? (
            <span
              className={cn(
                "u-meta ml-auto whitespace-nowrap tabular-nums transition-colors",
                hot ? "text-ember-bright" : "text-bone/35"
              )}
            >
              {readout}
            </span>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Gauge endpoints under a range control, so the slider reads as a scale. */
function SliderScale({ min, max }: { min: React.ReactNode; max: React.ReactNode }) {
  return (
    <div aria-hidden className="mt-3 flex items-center justify-between">
      <span className="u-meta tabular-nums text-bone/25">{min}</span>
      <span className="u-meta tabular-nums text-bone/25">{max}</span>
    </div>
  );
}

function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-3 py-2 text-sm transition-colors",
        checked ? "text-bone" : "text-smoke hover:text-bone"
      )}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        // Lit indicator when engaged: the box doesn't just fill, it emits.
        className="size-[15px] shrink-0 rounded-none border-bone/25 transition-[color,border-color,background-color,box-shadow] group-hover:border-bone/45 data-checked:border-ember data-checked:bg-ember data-checked:shadow-[0_0_12px_-3px_rgba(255,10,60,0.9)]"
      />
      <span className="truncate">{label}</span>
    </label>
  );
}

/**
 * A checkbox list that folds its tail away once it runs long. The toggle
 * always carries the count it is hiding, and a collapsed list still keeps
 * every ticked row on screen — nothing that is filtering the catalog can end
 * up out of sight.
 */
function CheckList({
  values,
  selected,
  onToggle,
}: {
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();

  const foldable = values.length > LIST_LIMIT;
  const collapsed = values.filter((value, i) => i < LIST_LIMIT || selected.includes(value));
  const visible = expanded || !foldable ? values : collapsed;
  const hiddenCount = values.length - collapsed.length;
  const showToggle = foldable && (expanded || hiddenCount > 0);

  return (
    <div>
      <div className="space-y-0.5" id={listId}>
        {visible.map((value) => (
          <CheckRow
            key={value}
            label={value}
            checked={selected.includes(value)}
            onToggle={() => onToggle(value)}
          />
        ))}
      </div>

      {showToggle && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-expanded={expanded}
          aria-controls={listId}
          className="u-meta group mt-2 flex w-full items-center gap-2.5 py-2 text-smoke transition-colors hover:text-ember"
        >
          <span
            aria-hidden
            className="h-px w-4 bg-current opacity-40 transition-all duration-300 group-hover:w-7"
          />
          <span>{expanded ? "Show Less" : `${hiddenCount} More`}</span>
          <ChevronDown
            aria-hidden
            className={cn("size-3 transition-transform duration-300", expanded && "rotate-180")}
          />
        </button>
      )}
    </div>
  );
}

/**
 * Track/thumb restyle for the range controls — square, hairline, ember fill.
 * Deliberately unglowing: everything else in the rail only emits once it is
 * actually engaged, and two sliders' worth of permanently-lit handles would
 * have been the loudest thing on a page whose accent is supposed to be a key
 * light.
 */
const SLIDER_SKIN =
  "[&_[data-slot=slider-track]]:h-[3px] [&_[data-slot=slider-track]]:rounded-none [&_[data-slot=slider-track]]:bg-bone/12 [&_[data-slot=slider-range]]:bg-ember [&_[data-slot=slider-thumb]]:size-3 [&_[data-slot=slider-thumb]]:rounded-none [&_[data-slot=slider-thumb]]:border-ember [&_[data-slot=slider-thumb]]:bg-bone";

export function BeatFilters({ filters, onChange, options, onReset }: BeatFiltersProps) {
  const activeCount = countActiveFilters(filters, options);

  const bpmHot =
    filters.bpmRange[0] !== options.bpmMin || filters.bpmRange[1] !== options.bpmMax;

  return (
    <div className="flex flex-col gap-6">
      {/*
        Front plate: name above, status bar below. Two rows rather than one,
        because at the rail's 250px a `text-d3` "FILTERS" and a RESET control
        do not share a line at large viewports — and a device's label should
        never be the thing that gets squeezed.
      */}
      <div className="hud-corners relative border border-bone/12 bg-charcoal/35 px-4 py-4">
        <h2 className="font-display text-d3 uppercase leading-none text-bone">Filters</h2>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5">
          <p className="u-meta flex items-center gap-2">
            {activeCount > 0 ? (
              <>
                <span aria-hidden className="relative flex size-1.5 shrink-0">
                  <span className="animate-pulse-glow absolute inset-0 rounded-full bg-ember-bright" />
                  <span className="relative inline-flex size-1.5 rounded-full bg-ember-bright" />
                </span>
                <span className="text-ember-bright">
                  <span className="tabular-nums">{activeCount}</span> Active
                </span>
              </>
            ) : (
              <span className="text-smoke">Full Catalog</span>
            )}
          </p>
          <button
            type="button"
            onClick={onReset}
            className="u-meta -mr-1 ml-auto px-2 py-1 text-smoke transition-colors hover:text-ember-bright"
          >
            <GlitchText text="Reset" />
          </button>
        </div>
      </div>

      <FilterGroup
        index="01"
        label="Genre"
        hot={filters.genres.length > 0}
        readout={`${filters.genres.length} / ${options.genres.length}`}
      >
        <CheckList
          values={options.genres}
          selected={filters.genres}
          onToggle={(genre) => onChange({ ...filters, genres: toggleValue(filters.genres, genre) })}
        />
      </FilterGroup>

      <FilterGroup
        index="02"
        label="Mood"
        hot={filters.moods.length > 0}
        readout={`${filters.moods.length} / ${options.moods.length}`}
      >
        <CheckList
          values={options.moods}
          selected={filters.moods}
          onToggle={(mood) => onChange({ ...filters, moods: toggleValue(filters.moods, mood) })}
        />
      </FilterGroup>

      <FilterGroup
        index="03"
        label="Key"
        hot={filters.keys.length > 0}
        readout={`${filters.keys.length} / ${options.keys.length}`}
      >
        <div className="flex flex-wrap gap-1.5">
          {options.keys.map((key) => {
            const active = filters.keys.includes(key);
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ ...filters, keys: toggleValue(filters.keys, key) })}
                className={cn(
                  "u-meta flex min-w-10 items-center justify-center border px-2.5 py-2.5 transition-[color,border-color,background-color,box-shadow] duration-300",
                  active
                    ? "border-ember/70 bg-ember/12 text-ember-bright shadow-[0_0_16px_-5px_rgba(255,10,60,0.9)]"
                    : "border-bone/12 text-smoke hover:border-bone/35 hover:text-bone"
                )}
              >
                {key}
              </button>
            );
          })}
        </div>
      </FilterGroup>

      <FilterGroup
        index="04"
        label="BPM"
        hot={bpmHot}
        readout={`${filters.bpmRange[0]} – ${filters.bpmRange[1]}`}
      >
        <Slider
          min={options.bpmMin}
          max={options.bpmMax}
          step={1}
          value={filters.bpmRange}
          onValueChange={(value) => onChange({ ...filters, bpmRange: value as [number, number] })}
          className={SLIDER_SKIN}
        />
        <SliderScale min={options.bpmMin} max={options.bpmMax} />
      </FilterGroup>
      {/*
        No price filter: licence pricing is flat across the whole catalogue
        (see `LICENSE_TIERS`), so every beat shares the same "from" price and
        a range slider here could never narrow anything.
      */}
    </div>
  );
}
