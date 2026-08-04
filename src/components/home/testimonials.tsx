"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { TESTIMONIALS } from "@/lib/mock-data";
import { SectionHeading } from "@/components/shared/section-heading";
import { HudFrame } from "@/components/visuals/hud-frame";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

export function Testimonials() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Nothing to show until real, permissioned quotes exist — an empty carousel
  // would leave a heading sitting over dead space. Placed after the hooks so
  // the hook order stays identical on every render.
  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="seam-top relative overflow-hidden py-24 sm:py-32 lg:py-36">
      <div aria-hidden className="hairline-dim absolute inset-x-0 top-0" />
      {/* Chapter numeral as set dressing — hollow, huge, half off the edge. */}
      <span
        aria-hidden
        className="text-outline pointer-events-none absolute -bottom-12 -right-6 select-none font-display leading-[0.75] text-[clamp(9rem,22vw,22rem)] opacity-[0.14]"
      >
        05
      </span>

      <div className="relative mx-auto max-w-[1600px] px-5 sm:px-8 lg:px-14">
        <Reveal className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-end">
          <SectionHeading
            chapter="05"
            eyebrow="Testimonials"
            title={
              <>
                What Artists <span className="text-gradient-ember">Say</span>
              </>
            }
            description="Feedback from artists who've licensed beats or booked mixing & mastering."
          />
          <div className="flex shrink-0 gap-px">
            <button
              onClick={() => emblaApi?.scrollPrev()}
              aria-label="Previous testimonial"
              className="flex size-12 items-center justify-center rounded-none border border-bone/20 text-bone transition-colors hover:border-ember hover:bg-ember/5 hover:text-ember"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              onClick={() => emblaApi?.scrollNext()}
              aria-label="Next testimonial"
              className="flex size-12 items-center justify-center rounded-none border border-bone/20 text-bone transition-colors hover:border-ember hover:bg-ember/5 hover:text-ember"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </Reveal>

        {/*
          The viewport is housed rather than open: corner brackets and a
          position readout turn the carousel into a monitored feed, and the
          readout is real state — it tracks the selected slide.

          The next slide peeking in gets feathered out rather than guillotined
          at the container edge — a half-word of 40px display type cut dead
          straight reads as a layout bug, not as a carousel.
        */}
        <HudFrame
          label="Client Feedback"
          readout={`${String(selectedIndex + 1).padStart(2, "0")} / ${String(
            TESTIMONIALS.length
          ).padStart(2, "0")}`}
          className="mt-16 p-6 sm:p-8 lg:mt-24 lg:p-10"
        >
          <div className="carousel-fade-r overflow-hidden" ref={emblaRef}>
            <div className="flex gap-10 lg:gap-16">
              {TESTIMONIALS.map((testimonial, index) => (
                <figure
                  key={testimonial.id}
                  className="min-w-0 flex-[0_0_100%] md:flex-[0_0_78%] lg:flex-[0_0_60%]"
                >
                  <div
                    className={cn(
                      "flex h-full flex-col justify-between border-l pl-6 transition-colors duration-500 sm:pl-10",
                      selectedIndex === index ? "border-ember/60" : "border-bone/15"
                    )}
                  >
                    <blockquote className="font-display uppercase text-d3 text-balance text-bone">
                      <span className="text-ember">&ldquo;</span>
                      {testimonial.quote}
                      <span className="text-ember">&rdquo;</span>
                    </blockquote>
                    <figcaption className="mt-8">
                      <div aria-hidden className="h-px w-14 bg-bone/30" />
                      <p className="u-meta mt-5 text-bone">{testimonial.name}</p>
                      <p className="u-meta mt-2 text-smoke">{testimonial.role}</p>
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          </div>
        </HudFrame>

        <div className="mt-12 flex justify-center gap-2">
          {TESTIMONIALS.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Go to testimonial ${index + 1}`}
              aria-current={selectedIndex === index}
              className={cn(
                "h-[3px] w-10 rounded-none transition-colors duration-300",
                selectedIndex === index ? "bg-ember" : "bg-bone/20 hover:bg-bone/45"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
