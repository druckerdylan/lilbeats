"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type FormValues = z.infer<typeof schema>;

/**
 * Lives at two very different widths — the homepage signup (wide, centred)
 * and the footer's narrow fourth column. Rather than asking each caller to
 * pass a layout, the form declares itself a container and swaps between a
 * stacked and a single-line arrangement off its *own* width. Drop it
 * anywhere and it resolves correctly.
 */
export function NewsletterForm({
  className,
  source = "footer",
}: {
  className?: string;
  source?: string;
}) {
  const [submitted, setSubmitted] = useState(false);
  const errorId = useId();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source }),
      });
      if (!res.ok) throw new Error();
      setSubmitted(true);
      reset();
      toast.success("You're subscribed. Welcome to Lil Beats.");
    } catch {
      toast.error("Something went wrong. Try again in a moment.");
    }
  }

  if (submitted) {
    return (
      <div className={cn("@container w-full max-w-md", className)}>
        <p className="flex items-start gap-3 text-sm leading-relaxed text-smoke @[24rem]:text-base">
          <span className="mt-2 h-px w-6 shrink-0 bg-ember" aria-hidden />
          <span>You&rsquo;re in. Check your inbox for a welcome note.</span>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("@container w-full max-w-md", className)}
      noValidate
    >
      <div className="flex flex-col gap-2 @[24rem]:flex-row">
        <Input
          type="email"
          placeholder="you@email.com"
          aria-label="Email address"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId : undefined}
          // `flex-1` is scoped to the row layout on purpose: in the stacked
          // layout the main axis is vertical, and a `0%` flex-basis would
          // collapse the field's 3rem height to nothing.
          //
          // The caret and the inset focus bar are the same two-token terminal
          // cue the contact and intake forms use — this field sits in the
          // footer beside them, so it has to speak the same language.
          className="input-cinema w-full min-w-0 text-bone caret-ember-bright placeholder:text-smoke focus-visible:shadow-[inset_2px_0_0_0_var(--ember-bright)] @[24rem]:flex-1"
          {...register("email")}
        />
        <Button
          type="submit"
          variant="cinema"
          size="cinema"
          disabled={isSubmitting}
          className="shrink-0"
        >
          {isSubmitting ? "Sending…" : "Subscribe"}
        </Button>
      </div>
      {errors.email && (
        <p id={errorId} role="alert" className="u-meta mt-3 text-destructive">
          {errors.email.message}
        </p>
      )}
    </form>
  );
}
