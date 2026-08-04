"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Circle, Loader2, Plus, Trash2, UploadCloud, XCircle } from "lucide-react";
import { toast } from "sonner";
import { uploadBeatAssets } from "@/lib/upload-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/*
  Inline table fields stay compact rather than taking the 48px `input-cinema`
  recipe the standalone forms use — this grid is a spreadsheet, and density is
  the point. They do get an explicit hairline: `border-input` is 6% bone,
  which on a near-black row is effectively no border at all.

  The `!`s exist because `SelectTrigger` sets its height through a
  `data-[size=default]` variant and its fill through a `dark:` variant, both of
  which outrank a plain utility class — without them the selects would sit a
  notch shorter than the inputs beside them.
*/
const CELL_FIELD = "h-9! rounded-none border-bone/15 bg-ink/70! text-bone";

type RowStatus = "idle" | "uploading" | "success" | "error";

interface BulkRow {
  id: string;
  title: string;
  genre: string;
  bpm: string;
  key: string;
  keyMode: "Major" | "Minor";
  mood: string;
  featured: boolean;
  artwork: File | null;
  previewAudio: File | null;
  fullMp3: File | null;
  wav: File | null;
  stems: File | null;
  status: RowStatus;
  error?: string;
}

let rowCounter = 0;
function newRowId() {
  rowCounter += 1;
  return `row-${rowCounter}-${Date.now()}`;
}

function guessTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function blankRow(overrides: Partial<BulkRow> = {}): BulkRow {
  return {
    id: newRowId(),
    title: "",
    genre: "",
    bpm: "140",
    key: "C",
    keyMode: "Minor",
    mood: "",
    featured: false,
    artwork: null,
    previewAudio: null,
    fullMp3: null,
    wav: null,
    stems: null,
    status: "idle",
    ...overrides,
  };
}

function FilePicker({
  label,
  file,
  accept,
  onChange,
}: {
  label: string;
  file: File | null;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex h-9 w-full items-center gap-1.5 border border-dashed border-bone/20 bg-ink/70 px-2 text-left text-xs transition-colors duration-200 hover:border-ember/60"
      title={label}
    >
      <UploadCloud aria-hidden className="size-3.5 shrink-0 text-smoke" />
      <span className={`truncate ${file ? "text-bone" : "text-smoke"}`}>
        {file ? file.name : label}
      </span>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </button>
  );
}

export function BulkBeatUpload() {
  const router = useRouter();
  const quickAddRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<BulkRow[]>([blankRow()]);
  const [submitting, setSubmitting] = useState(false);

  function updateRow(id: string, patch: Partial<BulkRow>) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((row) => row.id !== id));
  }

  function addBlankRow() {
    setRows((prev) => [...prev, blankRow()]);
  }

  function handleQuickAdd(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    const newRows: BulkRow[] = [];

    for (const file of files) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      const title = guessTitle(file.name);
      if (ext === "mp3") {
        newRows.push(blankRow({ title, fullMp3: file, previewAudio: file }));
      } else if (ext === "wav") {
        newRows.push(blankRow({ title, wav: file }));
      }
    }

    if (newRows.length === 0) {
      toast.error("Only .mp3 and .wav files are recognized for quick add.");
      return;
    }

    setRows((prev) => {
      const withoutBlankFirst =
        prev.length === 1 && !prev[0].title && !prev[0].fullMp3 && !prev[0].wav ? [] : prev;
      return [...withoutBlankFirst, ...newRows];
    });
    toast.success(`Added ${newRows.length} track${newRows.length === 1 ? "" : "s"} — fill in the rest of each row.`);
  }

  function rowIsValid(row: BulkRow): string | null {
    if (!row.title.trim()) return "Title is required.";
    if (!row.genre.trim()) return "Genre is required.";
    if (!row.artwork) return "Artwork is required.";
    if (!row.previewAudio) return "MP3 preview is required.";
    if (!row.fullMp3) return "Full MP3 is required.";
    if (!row.wav) return "WAV is required.";
    const bpm = Number(row.bpm);
    if (!bpm || bpm < 1) return "BPM must be a positive number.";
    return null;
  }

  /**
   * Uploads one row's audio straight from the browser into Supabase Storage,
   * then POSTs just the metadata and the resulting paths.
   *
   * The files deliberately never touch the API route: Vercel caps a
   * Serverless Function's request body at 4.5 MB, and a single WAV — let
   * alone a stems ZIP — is far past that, so the old multipart POST worked
   * locally and 413'd in production.
   */
  async function publishRow(row: BulkRow, onStatus?: (label: string) => void) {
    const paths = await uploadBeatAssets(
      {
        artwork: row.artwork as File,
        previewAudio: row.previewAudio as File,
        fullMp3: row.fullMp3 as File,
        wav: row.wav as File,
        stems: row.stems,
      },
      (p) => onStatus?.(p.label)
    );

    const res = await fetch("/api/admin/beats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: row.title,
        genre: row.genre,
        bpm: Number(row.bpm),
        key: row.key,
        keyMode: row.keyMode,
        mood: row.mood,
        tags: "",
        description: "",
        durationSeconds: 180,
        featured: row.featured,
        ...paths,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Upload failed.");
  }

  async function handlePublishAll() {
    const invalidRows = rows.filter((row) => rowIsValid(row));
    if (invalidRows.length > 0) {
      setRows((prev) =>
        prev.map((row) => {
          const error = rowIsValid(row);
          return error ? { ...row, status: "error", error } : row;
        })
      );
      toast.error(`${invalidRows.length} row${invalidRows.length === 1 ? "" : "s"} need attention before publishing.`);
      return;
    }

    setSubmitting(true);
    let successCount = 0;

    for (const row of rows) {
      updateRow(row.id, { status: "uploading", error: undefined });
      try {
        await publishRow(row);
        updateRow(row.id, { status: "success" });
        successCount += 1;
      } catch (error) {
        updateRow(row.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed.",
        });
      }
    }

    setSubmitting(false);
    if (successCount > 0) {
      toast.success(`Published ${successCount} beat${successCount === 1 ? "" : "s"}.`);
      router.refresh();
    }
    if (successCount < rows.length) {
      toast.error(`${rows.length - successCount} row(s) failed — check the errors below.`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-dashed border-bone/20 bg-charcoal transition-colors duration-200 hover:border-ember/50">
        <button
          type="button"
          onClick={() => quickAddRef.current?.click()}
          className="flex w-full flex-col items-center gap-3 p-6 text-center sm:p-8"
        >
          <UploadCloud aria-hidden className="size-6 text-ember" />
          <p className="u-meta text-bone">Quick add</p>
          <p className="max-w-md text-sm leading-relaxed text-smoke">
            Select all your MP3s and WAVs from BeatStars at once. Each audio file becomes its
            own row with a guessed title — you&rsquo;ll still add artwork and confirm the
            details before publishing.
          </p>
          <input
            ref={quickAddRef}
            type="file"
            accept=".mp3,.wav"
            multiple
            className="hidden"
            onChange={(e) => handleQuickAdd(e.target.files)}
          />
        </button>
      </div>

      <div className="overflow-x-auto border border-bone/10">
        <table className="w-full min-w-[1100px] text-sm">
          <thead>
            <tr className="u-meta border-b border-bone/12 bg-charcoal text-left text-smoke [&>th]:px-3 [&>th]:py-3 [&>th]:font-normal">
              <th scope="col">Title</th>
              <th scope="col">Genre</th>
              <th scope="col" className="w-20">BPM</th>
              <th scope="col" className="w-32">Key</th>
              <th scope="col">Artwork</th>
              <th scope="col">Preview</th>
              <th scope="col">Full MP3</th>
              <th scope="col">WAV</th>
              <th scope="col">Stems</th>
              <th scope="col" className="w-16">Feat.</th>
              <th scope="col" className="w-12">
                <span className="sr-only">Status</span>
              </th>
              <th scope="col" className="w-12">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-bone/10 align-top last:border-none">
                <td className="p-2">
                  <Input
                    value={row.title}
                    onChange={(e) => updateRow(row.id, { title: e.target.value })}
                    placeholder="Beat title"
                    className={CELL_FIELD}
                  />
                </td>
                <td className="p-2">
                  <Input
                    value={row.genre}
                    onChange={(e) => updateRow(row.id, { genre: e.target.value })}
                    placeholder="Dark Trap"
                    className={CELL_FIELD}
                  />
                </td>
                <td className="p-2">
                  <Input
                    type="number"
                    value={row.bpm}
                    onChange={(e) => updateRow(row.id, { bpm: e.target.value })}
                    className={CELL_FIELD}
                  />
                </td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Select
                      value={row.key}
                      onValueChange={(v) => v && updateRow(row.id, { key: v })}
                    >
                      <SelectTrigger className={`${CELL_FIELD} min-w-0 flex-1`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KEYS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={row.keyMode}
                      onValueChange={(v) => updateRow(row.id, { keyMode: v as "Major" | "Minor" })}
                    >
                      <SelectTrigger className={`${CELL_FIELD} min-w-0 flex-1`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Major">Maj</SelectItem>
                        <SelectItem value="Minor">Min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </td>
                <td className="p-2">
                  <FilePicker
                    label="Artwork"
                    file={row.artwork}
                    accept="image/*"
                    onChange={(file) => updateRow(row.id, { artwork: file })}
                  />
                </td>
                <td className="p-2">
                  <FilePicker
                    label="Preview"
                    file={row.previewAudio}
                    accept="audio/*"
                    onChange={(file) => updateRow(row.id, { previewAudio: file })}
                  />
                </td>
                <td className="p-2">
                  <FilePicker
                    label="Full MP3"
                    file={row.fullMp3}
                    accept="audio/*"
                    onChange={(file) => updateRow(row.id, { fullMp3: file })}
                  />
                </td>
                <td className="p-2">
                  <FilePicker
                    label="WAV"
                    file={row.wav}
                    accept="audio/*"
                    onChange={(file) => updateRow(row.id, { wav: file })}
                  />
                </td>
                <td className="p-2">
                  <FilePicker
                    label="Stems"
                    file={row.stems}
                    accept=".zip"
                    onChange={(file) => updateRow(row.id, { stems: file })}
                  />
                </td>
                <td className="p-2">
                  <div className="flex h-9 items-center justify-center">
                    <Checkbox
                      aria-label="Feature on homepage"
                      className="rounded-none border-bone/30"
                      checked={row.featured}
                      onCheckedChange={(v) => updateRow(row.id, { featured: Boolean(v) })}
                    />
                  </div>
                </td>
                <td className="p-2">
                  {/* `text-border` here was 8%-alpha bone under the new palette —
                      the idle marker had gone effectively invisible. */}
                  <div className="flex h-9 items-center justify-center">
                    {row.status === "uploading" && (
                      <Loader2 aria-label="Uploading" className="size-4 animate-spin text-ember" />
                    )}
                    {row.status === "success" && (
                      <CheckCircle2 aria-label="Published" className="size-4 text-ember" />
                    )}
                    {row.status === "error" && (
                      <span title={row.error}>
                        <XCircle aria-label="Failed" className="size-4 text-destructive" />
                      </span>
                    )}
                    {row.status === "idle" && (
                      <Circle aria-hidden className="size-4 text-bone/25" />
                    )}
                  </div>
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    onClick={() => removeRow(row.id)}
                    aria-label="Remove row"
                    className="inline-flex size-9 items-center justify-center text-smoke transition-colors duration-200 hover:text-destructive"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.some((r) => r.status === "error" && r.error) && (
        <div
          role="alert"
          className="border border-destructive/40 bg-destructive/10 p-4 text-sm text-bone"
        >
          <p className="u-meta mb-3 text-destructive">Rows need attention</p>
          <ul className="list-disc space-y-1 pl-5">
            {rows
              .filter((r) => r.status === "error" && r.error)
              .map((r) => (
                <li key={r.id} className="break-words">
                  {r.title || "Untitled row"}: {r.error}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="cinemaGhost"
          size="cinemaSm"
          onClick={addBlankRow}
        >
          <Plus />
          Add Row
        </Button>
        <Button
          type="button"
          variant="cinema"
          size="cinemaSm"
          onClick={handlePublishAll}
          disabled={submitting || rows.length === 0}
        >
          {submitting ? "Publishing…" : `Publish ${rows.length} Beat${rows.length === 1 ? "" : "s"}`}
        </Button>
        <Button
          variant="cinemaGhost"
          size="cinemaSm"
          render={<Link href="/admin/beats" />}
        >
          Back to Beats
        </Button>
      </div>
    </div>
  );
}
