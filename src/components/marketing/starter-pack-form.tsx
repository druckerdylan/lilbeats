"use client";

import { useId } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});

type FormValues = z.infer<typeof schema>;

/**
 * The source tag the /api/newsletter route branches on to send the pack
 * email instead of the newsletter welcome. Must match the constant there.
 */
const SOURCE = "free-starter-pack";

/**
 * The /free capture. Structurally the same field as `NewsletterForm` — same
 * schema, same `input-cinema` + `variant="cinema"` tokens, same terminal
 * caret and inset focus bar — because the two sit in the same design system
 * and a lead magnet is not the place to introduce a second form language.
 *
 * The one real difference is what success looks like. `NewsletterForm`
 * swaps itself for a line of confirmation text, which is right for a footer
 * signup you happened to pass. Here the signup *is* the page, so the reply
 * has to be a page of its own — /thanks/free tells them to check spam, gives
 * them the sending address, and points at the catalogue. Inline text at the
 * bottom of a landing page does none of that.
 */
export function StarterPackForm({ className }: { className?: string }) {
  const router = useRouter();
  const errorId = useId();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, source: SOURCE }),
      });
      if (!res.ok) throw new Error();

      // Source only — never the address that was just typed in.
      track("magnet_signup", { source: SOURCE });

      router.push("/thanks/free");
    } catch {
      toast.error("Something went wrong. Try again in a moment.");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={cn("@container w-full", className)}
      noValidate
    >
      {/*
        Stacks below `28rem` rather than the newsletter's `24rem`: this
        button's label is nine characters longer at the same mono tracking,
        so the row arrangement runs out of room a good deal earlier.
      */}
      <div className="flex flex-col gap-2 @[28rem]:flex-row">
        <Input
          type="email"
          placeholder="you@email.com"
          aria-label="Email address"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? errorId : undefined}
          // `flex-1` is scoped to the row layout on purpose: in the stacked
          // layout the main axis is vertical, and a `0%` flex-basis would
          // collapse the field's 3rem height to nothing.
          className="input-cinema w-full min-w-0 text-bone caret-ember-bright placeholder:text-smoke focus-visible:shadow-[inset_2px_0_0_0_var(--ember-bright)] @[28rem]:flex-1"
          {...register("email")}
        />
        <Button
          type="submit"
          variant="cinema"
          size="cinema"
          disabled={isSubmitting}
          // `cinema` is nowrap by default and this label is long enough to
          // overflow a 390px viewport, so it goes full-bleed and wraps until
          // there is room for it on one line.
          className="h-auto w-full shrink-0 py-4 text-center whitespace-normal @[28rem]:h-12 @[28rem]:w-auto @[28rem]:py-0"
        >
          {isSubmitting ? "Sending…" : "SEND ME THE FIVE BEATS"}
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
