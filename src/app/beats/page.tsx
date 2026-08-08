import type { Metadata } from "next";
import { getAllBeats } from "@/lib/beats-repo";
import { BeatStoreClient } from "@/components/beats/beat-store-client";
import { Kicker } from "@/components/shared/section-heading";
import { Reveal, SplitWords } from "@/components/shared/reveal";
import { GlitchText } from "@/components/visuals/glitch-text";
import { CatalogSpectrum } from "@/components/visuals/catalog-spectrum";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Beats",
  description:
    "Browse the full Lil Beats catalog — dark, cinematic instrumentals available for instant MP3, WAV, and stems licensing.",
  // Overrides the root layout's canonical, which would otherwise point this
  // page at the homepage. See the note in app/layout.tsx.
  alternates: { canonical: "/beats" },
};

export default async function BeatsPage() {
  const beats = await getAllBeats();

  const bpms = beats.map((b) => b.bpm);
  const genreCount = new Set(beats.map((b) => b.genre)).size;
  const tempoRange = bpms.length
    ? `${Math.min(...bpms)}–${Math.max(...bpms)}`
    : null;

  return (
    <div className="relative">
      <CatalogSpectrum />

      {/* `isolate` on the header would trap it in its own stacking context and
          hide the fixed backdrop behind it, so the layers are ordered here
          instead: backdrop at z-0, everything readable above it. */}
      <header className="relative z-10 overflow-hidden">
        {/* Key light pooling behind the title card. */}
        <div
          aria-hidden
          className="spotlight pointer-events-none absolute -top-64 left-[6%] h-[640px] w-[820px] opacity-70"
        />

        <div className="relative mx-auto max-w-[1600px] px-5 pt-24 pb-16 sm:px-8 lg:px-14 lg:pt-32 lg:pb-24">
          <Reveal variant="fade" duration={0.7}>
            <div className="flex flex-wrap items-center justify-between gap-x-10 gap-y-3">
              <Kicker>
                <GlitchText text="The Catalog" trigger="view" />
              </Kicker>
              <p className="u-meta text-smoke">
                <span className="tabular-nums text-bone">{beats.length}</span> Instrumentals In
                Rotation
              </p>
            </div>
          </Reveal>

          {/*
            The page's single neon moment. `neon-text` sets its own colour, so
            no `text-bone` here — the two would fight over `color` depending on
            which utility the stylesheet emitted last.
          */}
          <h1 className="neon-text mt-7 font-display text-d0 uppercase">
            <SplitWords text="Beats" />
          </h1>

          <div className="mt-10 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <Reveal variant="rise" delay={0.12}>
              <p className="max-w-xl text-base leading-relaxed text-smoke sm:text-lg">
                Every instrumental below is available for instant licensing. Preview in-browser,
                filter by BPM, key, mood, or genre, and check out in minutes.
              </p>
            </Reveal>

            {beats.length > 0 && (
              <Reveal variant="fade" delay={0.26}>
                {/* Gauge cluster: a hairline rule per readout so the stats
                    read as three instruments rather than one paragraph. */}
                <dl className="flex flex-wrap gap-x-8 gap-y-6 lg:justify-end">
                  <div className="border-l border-bone/14 pl-5">
                    <dt className="u-meta text-smoke">Titles</dt>
                    <dd className="mt-2 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                      {String(beats.length).padStart(2, "0")}
                    </dd>
                  </div>
                  <div className="border-l border-bone/14 pl-5">
                    <dt className="u-meta text-smoke">Genres</dt>
                    <dd className="mt-2 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                      {String(genreCount).padStart(2, "0")}
                    </dd>
                  </div>
                  {tempoRange && (
                    <div className="border-l border-bone/14 pl-5">
                      <dt className="u-meta text-smoke">Tempo</dt>
                      <dd className="mt-2 font-display text-d3 uppercase leading-none tabular-nums text-bone">
                        {tempoRange}
                        <span className="u-meta ml-2 align-middle text-smoke">BPM</span>
                      </dd>
                    </div>
                  )}
                </dl>
              </Reveal>
            )}
          </div>
        </div>

        <div className="hairline" aria-hidden />
      </header>

      <div className="relative z-10">
        <BeatStoreClient beats={beats} />
      </div>
    </div>
  );
}
