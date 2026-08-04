"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";
import { uploadBeatAssets } from "@/lib/upload-client";
import { LICENSE_TIERS } from "@/lib/licensing";
import { formatPrice } from "@/lib/format";
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

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/*
  The same field recipe the marketing forms use — 48px, square corners,
  hairline border. The `!` background utilities are required because the base
  `Input`/`Textarea`/`SelectTrigger` set their fill through a `dark:` variant,
  which outranks a plain utility class on specificity.
*/
const FIELD = "input-cinema bg-ink/70! text-bone focus-visible:bg-ink!";
const LABEL = "u-meta text-smoke";

const schema = z.object({
  title: z.string().min(1, "Required"),
  bpm: z.number().int().min(1),
  key: z.string().min(1),
  keyMode: z.enum(["Major", "Minor"]),
  genre: z.string().min(1, "Required"),
  mood: z.string().min(1, "Comma-separated, e.g. Dark, Moody"),
  tags: z.string().min(1, "Comma-separated tags"),
  description: z.string().min(1, "Required"),
  durationSeconds: z.number().int().min(1),
  featured: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function FileInput({
  label,
  file,
  onChange,
  accept,
  required,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  required?: boolean;
}) {
  const id = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className={`${LABEL} mb-2 block`}>
        {label} {required && <span className="text-ember">*</span>}
      </label>
      <label
        htmlFor={id}
        className="flex h-12 cursor-pointer items-center gap-2.5 border border-dashed border-bone/20 bg-ink/70 px-4 text-sm transition-colors duration-200 hover:border-ember/60"
      >
        <UploadCloud aria-hidden className="size-4 shrink-0 text-smoke" />
        <span className={`truncate ${file ? "text-bone" : "text-smoke"}`}>
          {file ? file.name : `Choose ${label.toLowerCase()}`}
        </span>
        <input
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

export function BeatUploadForm() {
  const router = useRouter();
  const [artwork, setArtwork] = useState<File | null>(null);
  const [previewAudio, setPreviewAudio] = useState<File | null>(null);
  const [fullMp3, setFullMp3] = useState<File | null>(null);
  const [wav, setWav] = useState<File | null>(null);
  const [stems, setStems] = useState<File | null>(null);
  /** Which asset is currently uploading, for the submit button. */
  const [status, setStatus] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      bpm: 140,
      key: "C",
      keyMode: "Minor",
      genre: "",
      mood: "",
      tags: "",
      description: "",
      durationSeconds: 180,
      featured: false,
    },
  });

  async function onSubmit(values: FormValues) {
    if (!artwork || !previewAudio || !fullMp3 || !wav) {
      toast.error("Artwork, preview MP3, full MP3, and WAV are all required.");
      return;
    }

    // Audio goes browser -> Supabase Storage directly; only the resulting
    // paths are POSTed here. Routing multi-hundred-megabyte WAVs through the
    // API route would 413 on Vercel's 4.5 MB body limit.
    setStatus("Uploading Artwork…");
    try {
      const paths = await uploadBeatAssets(
        { artwork, previewAudio, fullMp3, wav, stems },
        (p) => setStatus(p.label)
      );

      const res = await fetch("/api/admin/beats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ...paths }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data.error ?? "Could not publish beat.");
        return;
      }

      toast.success("Beat published.");
      router.push("/admin/beats");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setStatus(null);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8" noValidate>
        <section>
          <h2 className="u-meta text-smoke">Files</h2>
          <div aria-hidden className="hairline-dim mt-3 mb-6" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FileInput label="Artwork" file={artwork} onChange={setArtwork} accept="image/*" required />
            <FileInput label="MP3 Preview" file={previewAudio} onChange={setPreviewAudio} accept="audio/*" required />
            <FileInput label="Full MP3" file={fullMp3} onChange={setFullMp3} accept="audio/*" required />
            <FileInput label="WAV" file={wav} onChange={setWav} accept="audio/*" required />
            <FileInput label="Stems (ZIP)" file={stems} onChange={setStems} accept=".zip" />
          </div>
        </section>

        <section className="space-y-8">
          <div>
            <h2 className="u-meta text-smoke">Details</h2>
            <div aria-hidden className="hairline-dim mt-3" />
          </div>

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Beat Title</FormLabel>
                <FormControl>
                  <Input className={FIELD} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <FormField
              control={form.control}
              name="bpm"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className={LABEL}>BPM</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className={FIELD}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className={LABEL}>Key</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      {/* `h-12!` because SelectTrigger sizes itself through a
                        `data-[size=default]` variant, which outranks the plain
                        height `input-cinema` sets. */}
                    <SelectTrigger className={`${FIELD} h-12! w-full`}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {KEYS.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="keyMode"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className={LABEL}>Mode</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      {/* `h-12!` because SelectTrigger sizes itself through a
                        `data-[size=default]` variant, which outranks the plain
                        height `input-cinema` sets. */}
                    <SelectTrigger className={`${FIELD} h-12! w-full`}>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Major">Major</SelectItem>
                      <SelectItem value="Minor">Minor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className={LABEL}>Genre</FormLabel>
                  <FormControl>
                    <Input className={FIELD} placeholder="Dark Trap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="durationSeconds"
              render={({ field }) => (
                <FormItem className="gap-3">
                  <FormLabel className={LABEL}>Track Length (seconds)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      className={FIELD}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mood"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Mood Tags</FormLabel>
                <FormControl>
                  <Input className={FIELD} placeholder="Dark, Moody, Cinematic" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Search Tags</FormLabel>
                <FormControl>
                  <Input className={FIELD} placeholder="night drive, travis scott type beat" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="gap-3">
                <FormLabel className={LABEL}>Description</FormLabel>
                <FormControl>
                  {/* `input-cinema` fixes a 48px height — a textarea has to opt
                      back out of it or it collapses to one line. */}
                  <Textarea
                    rows={4}
                    className={`${FIELD} h-auto! min-h-32 py-3.5 leading-relaxed`}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/*
            Read-only on purpose. Pricing is flat per licence tier and shared
            across the whole catalogue, so a per-beat price box here would be
            a control that changes nothing — which is exactly what it used to
            be after the tiers moved off multipliers.
          */}
          <div className="gap-3">
            <p className={LABEL}>Licence Pricing</p>
            <ul className="mt-3 space-y-1.5">
              {LICENSE_TIERS.map((tier) => (
                <li
                  key={tier.id}
                  className="u-meta flex items-center justify-between border-b border-bone/10 py-2 text-smoke"
                >
                  <span>{tier.name}</span>
                  <span className="tabular-nums text-bone">{formatPrice(tier.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-smoke">
              Set for every beat in <code>src/lib/licensing.ts</code>. Unlimited and
              Exclusive are only offered when a stems ZIP is uploaded.
            </p>
          </div>

          <FormField
            control={form.control}
            name="featured"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-3 space-y-0 border border-bone/12 bg-charcoal p-4">
                <FormControl>
                  {/* `border-input` is 6% bone under the new palette — an
                    unchecked box was invisible against the card. */}
                <Checkbox
                  className="rounded-none border-bone/30"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                </FormControl>
                <FormLabel className="text-sm text-bone">
                  Feature this beat on the homepage
                </FormLabel>
              </FormItem>
            )}
          />
        </section>

        <Button
          type="submit"
          variant="cinema"
          size="cinema"
          disabled={form.formState.isSubmitting}
          className="w-full"
        >
          {status ?? (form.formState.isSubmitting ? "Publishing…" : "Publish Beat")}
        </Button>
      </form>
    </Form>
  );
}
