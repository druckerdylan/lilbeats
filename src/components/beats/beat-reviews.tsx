import { Star } from "lucide-react";
import { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Five glyphs, filled in ember up to `value`. The row carries the whole
 * rating as one accessible label so assistive tech hears "4 out of 5"
 * rather than five unlabelled icons.
 */
function StarRow({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <span role="img" aria-label={label} className="flex shrink-0 items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("size-3.5", i < value ? "fill-ember text-ember" : "text-bone/20", className)}
        />
      ))}
    </span>
  );
}

export function BeatReviews({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    // A hairline and a mono label, not a bordered box — the FAQ column
    // beside this one is built from rules, and a card here would be the
    // only panel in the section.
    return (
      <div>
        <div aria-hidden className="hairline-dim" />
        <p className="u-meta mt-7 text-bone/35">No reviews logged</p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-smoke">
          Nothing on the record for this beat yet — be the first to leave one after purchase.
        </p>
      </div>
    );
  }

  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  return (
    <div>
      {/* The score is the biggest thing in this column by an order of
          magnitude; everything qualifying it is set as credits. */}
      <div className="flex flex-wrap items-end gap-x-6 gap-y-4 border-b border-bone/10 pb-7">
        <p className="font-display text-d2 uppercase leading-none tabular-nums text-bone">
          {average.toFixed(1)}
        </p>
        <div className="pb-1.5">
          <StarRow
            value={Math.round(average)}
            label={`${average.toFixed(1)} out of 5 stars`}
            className="size-4"
          />
          <p className="u-meta mt-3 text-smoke">
            Out Of 5 &middot; {reviews.length} Review{reviews.length === 1 ? "" : "s"}
          </p>
        </div>
      </div>

      <ul className="mt-10 space-y-9">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="border-b border-bone/[0.07] pb-9 last:border-none last:pb-0"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <StarRow value={review.rating} label={`${review.rating} out of 5 stars`} />
              <p className="u-meta text-bone/70">{review.authorName}</p>
              <span aria-hidden className="hidden h-2.5 w-px bg-bone/20 sm:block" />
              <p className="u-meta text-bone/35">{formatDate(review.createdAt)}</p>
            </div>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-bone/85">{review.comment}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
