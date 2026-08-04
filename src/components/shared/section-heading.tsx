import { cn } from "@/lib/utils";

/**
 * Mono, wide-tracked label. Every eyebrow, timecode, and metadata line on
 * the site uses this so the "credits" voice stays consistent against the
 * display face.
 */
export function Kicker({
  children,
  chapter,
  className,
  tone = "ember",
}: {
  children: React.ReactNode;
  /** Act number, e.g. "01". Rendered hollow before a hairline dash. */
  chapter?: string;
  className?: string;
  tone?: "ember" | "smoke";
}) {
  return (
    <p
      className={cn(
        "u-meta flex items-center gap-3",
        tone === "ember" ? "text-ember" : "text-smoke",
        className
      )}
    >
      {chapter && (
        <>
          <span className="tabular-nums text-bone/35">{chapter}</span>
          <span className="h-px w-8 bg-current opacity-40" aria-hidden />
        </>
      )}
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  chapter,
  title,
  description,
  align = "left",
  size = "lg",
  className,
}: {
  eyebrow?: string;
  chapter?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** `xl` is a page-opening title card; `md` is a sub-section. */
  size?: "md" | "lg" | "xl";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto flex flex-col items-center text-center",
        className
      )}
    >
      {eyebrow && (
        <Kicker chapter={chapter} className="mb-5">
          {eyebrow}
        </Kicker>
      )}
      <h2
        className={cn(
          "font-display uppercase text-bone",
          size === "xl" && "text-d1",
          size === "lg" && "text-d2",
          size === "md" && "text-d3"
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-6 max-w-xl text-base leading-relaxed text-smoke sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
