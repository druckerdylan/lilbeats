"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CircleCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  name: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email address."),
  subject: z.string(),
  message: z.string().min(10, "Tell us a little more (10 characters minimum)."),
});

type FormValues = z.infer<typeof schema>;

/*
  `input-cinema` carries the marketing field recipe (48px, square corners,
  hairline border). The `!` background utilities exist because the base
  `Input`/`Textarea` set their fill through a `dark:` variant, which outranks
  a plain utility class on specificity and would otherwise win.

  The two additions are the terminal cue: an ember caret, and a 2px ember bar
  that lands on the inside edge of whichever field has focus — a cursor
  parking in a channel. It is drawn with an inset box-shadow rather than a
  border so the field's text never shifts by the width of the indicator.
*/
const FIELD =
  "input-cinema bg-charcoal/60! text-bone caret-ember-bright focus-visible:bg-charcoal/90! focus-visible:shadow-[inset_2px_0_0_0_var(--ember-bright)]";
const LABEL = "u-meta text-smoke";

/*
  `beat` and `subject` arrive as props from the server component rather than
  being read here with `useSearchParams`. That hook opts the whole subtree
  out of prerendering, and with the page's `<Suspense fallback={null}>` the
  consequence was that the built HTML contained no form at all — the
  "Send A Message" panel was an empty box until hydration, on the only
  working inbound channel the site has.
*/
export function ContactForm({
  beat = null,
  subject = null,
}: {
  beat?: string | null;
  subject?: string | null;
}) {
  const [submitted, setSubmitted] = useState(false);

  const exclusiveBeat = beat;
  const isExclusiveInquiry = subject === "exclusive-license";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      subject: isExclusiveInquiry ? "Exclusive License Inquiry" : "",
      message:
        isExclusiveInquiry && exclusiveBeat
          ? `I'm interested in an exclusive license for "${exclusiveBeat}". Here's my intended use and budget:`
          : "",
    },
  });

  async function onSubmit(values: FormValues) {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      setSubmitted(true);
    } else {
      form.setError("root", { message: "Something went wrong. Try again in a moment." });
    }
  }

  if (submitted) {
    return (
      <div className="hud-corners relative border border-ember/25 bg-pitch/60 px-6 py-14 text-center sm:px-10">
        <div className="hairline absolute inset-x-0 top-0" aria-hidden />
        <CircleCheck className="mx-auto size-10 text-ember" aria-hidden />
        <p className="u-meta mt-6 text-smoke">Transmitted</p>
        <h3 className="mt-3 font-display text-d3 uppercase text-bone">Message Sent</h3>
        <p className="mx-auto mt-4 max-w-sm text-base leading-relaxed text-smoke">
          Thanks for reaching out — we typically respond within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7" noValidate>
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Name</FormLabel>
                <FormControl>
                  <Input className={FIELD} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Email</FormLabel>
                <FormControl>
                  <Input type="email" className={FIELD} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem className="gap-3">
              <FormLabel className={LABEL}>Subject</FormLabel>
              <FormControl>
                <Input className={FIELD} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="gap-3">
              <FormLabel className={LABEL}>Message</FormLabel>
              <FormControl>
                <Textarea
                  rows={6}
                  className={`${FIELD} h-auto! min-h-44 py-3.5 leading-relaxed`}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root && (
          <p className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          variant="cinema"
          size="cinema"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {form.formState.isSubmitting ? "Sending…" : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
