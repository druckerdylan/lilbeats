import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BulkBeatUpload } from "@/components/admin/bulk-beat-upload";

export default function AdminBulkBeatUploadPage() {
  return (
    <div>
      <header className="mb-8">
        <Link
          href="/admin/beats"
          className="u-meta inline-flex items-center gap-2 text-smoke transition-colors duration-200 hover:text-ember"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Back to beats
        </Link>
        <h1 className="mt-4 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
          Bulk Upload
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-smoke">
          Bring your BeatStars catalog over in one pass. Download your audio files from your
          BeatStars producer dashboard first, then drop them in below — each track publishes
          through the same pipeline as a single upload, just batched.
        </p>
        <div aria-hidden className="hairline-dim mt-6" />
      </header>
      <BulkBeatUpload />
    </div>
  );
}
