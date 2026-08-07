"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";
import { track } from "@/lib/analytics";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const schema = z.object({
  artistName: z.string().min(1, "Required"),
  fullName: z.string().min(1, "Required"),
  email: z.string().email("Enter a valid email address."),
  phone: z.string().min(1, "Required"),
  songTitle: z.string().min(1, "Required"),
  genre: z.string().min(1, "Required"),
  serviceRequested: z.enum(["mixing", "mastering", "mixing-mastering", "vocal-tuning", "other"]),
  numberOfSongs: z.number().int().min(1),
  referenceTracks: z.string(),
  desiredSound: z.string(),
  currentMixProblems: z.string(),
  deadline: z.string(),
  budget: z.string(),
  needsVocalTuning: z.boolean(),
  needsStemCleanup: z.boolean(),
  fileLink: z.string(),
  additionalNotes: z.string(),
  confirmsOwnership: z.boolean().refine((v) => v === true, {
    message: "You must confirm you own the rights to these files.",
  }),
});

type FormValues = z.infer<typeof schema>;

const SERVICE_OPTIONS: { value: FormValues["serviceRequested"]; label: string }[] = [
  { value: "mixing", label: "Mixing" },
  { value: "mastering", label: "Mastering" },
  { value: "mixing-mastering", label: "Mixing & Mastering" },
  { value: "vocal-tuning", label: "Vocal Tuning" },
  { value: "other", label: "Other" },
];

/*
  The form is set like a session intake sheet: mono metadata labels, square
  fields with no fill, and numbered acts separated by hairlines. Every class
  below is presentation only — the schema, resolver, and submit path are
  untouched.

  `caret-ember-bright` plus the 2px inset ember bar on focus is the site's
  terminal cue, shared with the contact and newsletter fields. It is an inset
  box-shadow rather than a border so the value never shifts sideways by the
  width of the indicator when a field is focused.
*/
const FOCUS_BAR =
  "caret-ember-bright focus-visible:shadow-[inset_2px_0_0_0_var(--ember-bright)]";
const FIELD =
  `input-cinema h-12 rounded-none border-bone/15 bg-charcoal/50 px-4 text-sm text-bone placeholder:text-smoke/60 focus-visible:border-ember/60 focus-visible:ring-0 dark:bg-charcoal/50 ${FOCUS_BAR}`;
/*
  `h-auto!` is load-bearing: `input-cinema` sets a fixed `height: 3rem` for
  single-line fields, which pins the textarea at its minimum and defeats the
  base component's `field-sizing-content` growth. Same fix the contact form
  carries.
*/
const AREA =
  `input-cinema h-auto! min-h-28 rounded-none border-bone/15 bg-charcoal/50 px-4 py-3.5 text-sm leading-relaxed text-bone placeholder:text-smoke/60 focus-visible:border-ember/60 focus-visible:ring-0 dark:bg-charcoal/50 ${FOCUS_BAR}`;
const TRIGGER =
  `input-cinema w-full rounded-none border-bone/15 bg-charcoal/50 px-4 text-sm text-bone data-[size=default]:h-12 dark:bg-charcoal/50 dark:hover:bg-charcoal/70 ${FOCUS_BAR}`;
const LABEL = "u-meta text-smoke";
const MESSAGE = "u-meta text-destructive";
const CHECKBOX = "size-4 shrink-0 rounded-none border-bone/30";
/*
  The whole plate is the tap target on a phone, not just the 16px box — the
  label is stretched to fill the row and `FormLabel`'s `htmlFor` does the
  toggling.
*/
const CHECK_ROW =
  "flex flex-row items-center gap-3.5 space-y-0 border border-bone/12 bg-charcoal/40 p-5";
const CHECK_LABEL = "u-meta flex-1 cursor-pointer text-smoke";

function Act({
  index,
  title,
  rule = true,
  children,
}: {
  index: string;
  title: string;
  /** The opening act sits under the page's own rule and doesn't need another. */
  rule?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="pt-12 first:pt-0">
      {rule && <div className="hairline-dim mb-9" aria-hidden />}
      <div className="mb-8 flex items-baseline gap-5">
        <span className="u-meta tabular-nums text-bone/30">{index}</span>
        <h2 className="font-display text-d3 uppercase text-bone">{title}</h2>
        {/* Measuring scale trailing off the act title, so the intake sheet
           reads as a console panel rather than a stack of fieldsets. Hidden
           on phones, where the title already fills the row. */}
        <span className="hud-ticks hidden flex-1 self-center opacity-45 sm:block" aria-hidden />
      </div>
      {children}
    </section>
  );
}

export function MixingRequestForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedService = searchParams.get("service");
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      artistName: "",
      fullName: "",
      email: "",
      phone: "",
      songTitle: "",
      genre: "",
      serviceRequested:
        preselectedService === "mastering" ||
        preselectedService === "mixing-mastering" ||
        preselectedService === "vocal-production"
          ? preselectedService === "vocal-production"
            ? "vocal-tuning"
            : (preselectedService as FormValues["serviceRequested"])
          : "mixing-mastering",
      numberOfSongs: 1,
      referenceTracks: "",
      desiredSound: "",
      currentMixProblems: "",
      deadline: "",
      budget: "",
      needsVocalTuning: false,
      needsStemCleanup: false,
      fileLink: "",
      additionalNotes: "",
      confirmsOwnership: false,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (file) formData.append("projectFile", file);

      const res = await fetch("/api/mixing-request", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submission failed.");

      /*
        Only after the route has accepted and stored it — a request that
        400s on a validation error is not a lead. The two props are the
        shape of the job, not the person asking: this form also collects a
        name, email, phone, and song title, and none of those go anywhere
        near analytics.
      */
      track("mixing_request", {
        service: values.serviceRequested,
        songs: values.numberOfSongs,
      });

      router.push("/mixing-mastering/request/confirmation");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-0" noValidate>
        <Act index="01" title="The Artist" rule={false}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="artistName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Artist Name</FormLabel>
                  <FormControl>
                    <Input className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Full Name</FormLabel>
                  <FormControl>
                    <Input className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Email</FormLabel>
                  <FormControl>
                    <Input type="email" className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Phone</FormLabel>
                  <FormControl>
                    <Input type="tel" className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
          </div>
        </Act>

        <Act index="02" title="The Record">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="songTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Song Title</FormLabel>
                  <FormControl>
                    <Input className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Genre</FormLabel>
                  <FormControl>
                    <Input className={FIELD} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="serviceRequested"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Service Requested</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger className={TRIGGER}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none">
                      {SERVICE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numberOfSongs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Number of Songs</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      className={FIELD}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
          </div>
        </Act>

        <Act index="03" title="The Sound">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="referenceTracks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Reference Tracks</FormLabel>
                  <FormControl>
                    <Textarea
                      className={AREA}
                      placeholder="Links to songs that capture the sound you're going for"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desiredSound"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Desired Sound</FormLabel>
                  <FormControl>
                    <Textarea
                      className={AREA}
                      placeholder="Describe the tone and feel you want"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="currentMixProblems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Problems With Current Mix</FormLabel>
                  <FormControl>
                    <Textarea
                      className={AREA}
                      placeholder="What's not working right now?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
          </div>
        </Act>

        <Act index="04" title="The Schedule">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Deadline</FormLabel>
                  <FormControl>
                    <Input className={FIELD} placeholder="e.g. August 15" {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Budget</FormLabel>
                  <FormControl>
                    <Input className={FIELD} placeholder="e.g. $150" {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="needsVocalTuning"
              render={({ field }) => (
                <FormItem className={CHECK_ROW}>
                  <FormControl>
                    <Checkbox
                      className={CHECKBOX}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className={CHECK_LABEL}>Need vocal tuning?</FormLabel>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needsStemCleanup"
              render={({ field }) => (
                <FormItem className={CHECK_ROW}>
                  <FormControl>
                    <Checkbox
                      className={CHECKBOX}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className={CHECK_LABEL}>Need stem cleanup?</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </Act>

        <Act index="05" title="The Files">
          <div className="space-y-6">
            <div>
              <label className="u-meta mb-3 block text-smoke" htmlFor="project-file">
                Project File Upload
              </label>
              {/* Corner brackets turn the dashed plate into an intake port —
                 the one element in this form that genuinely is a piece of
                 equipment rather than a text field. */}
              <label
                htmlFor="project-file"
                className="hud-corners group flex cursor-pointer flex-col items-center gap-3 border border-dashed border-bone/20 bg-charcoal/40 px-5 py-9 text-center transition-colors duration-300 hover:border-ember/50 sm:px-10 sm:py-10"
              >
                <UploadCloud
                  className={cn(
                    "size-6 transition-colors duration-300 group-hover:text-ember",
                    file ? "text-ember" : "text-smoke"
                  )}
                  aria-hidden
                />
                {/* Filenames arrive from the OS as one unbreakable token —
                    without `break-words` a long stem bounce overflows the
                    dashed plate and pushes the page sideways on a phone. */}
                <span
                  className={cn(
                    "u-meta max-w-full break-words",
                    file ? "text-bone" : "text-smoke"
                  )}
                  aria-live="polite"
                >
                  {file ? file.name : "Click to upload stems, session, or reference audio"}
                </span>
                <span className="u-meta text-bone/25">
                  {file ? "Replace file" : "100MB max"}
                </span>
                <input
                  id="project-file"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <FormField
              control={form.control}
              name="fileLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Google Drive / Dropbox Link</FormLabel>
                  <FormControl>
                    <Input
                      className={FIELD}
                      placeholder="https://drive.google.com/…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={LABEL}>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea className={AREA} {...field} />
                  </FormControl>
                  <FormMessage className={MESSAGE} />
                </FormItem>
              )}
            />
          </div>
        </Act>

        <div className="pt-12">
          <div className="hairline-dim mb-9" aria-hidden />

          <FormField
            control={form.control}
            name="confirmsOwnership"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start gap-3.5 space-y-0 border border-bone/12 bg-charcoal/40 p-5">
                <FormControl>
                  <Checkbox
                    className={`${CHECKBOX} mt-0.5`}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="grid min-w-0 gap-2">
                  <FormLabel className="cursor-pointer text-sm leading-relaxed text-bone/85">
                    I confirm I own the rights to all files submitted, or have permission to
                    use them.
                  </FormLabel>
                  <FormMessage className={MESSAGE} />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="cinema"
            size="cinema"
            disabled={form.formState.isSubmitting}
            className="mt-8 w-full"
          >
            {form.formState.isSubmitting ? "Submitting…" : "Submit Request"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
