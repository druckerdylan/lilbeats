import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BeatUploadForm } from "@/components/admin/beat-upload-form";

export default function AdminNewBeatPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-8">
        <Link
          href="/admin/beats"
          className="u-meta inline-flex items-center gap-2 text-smoke transition-colors duration-200 hover:text-ember"
        >
          <ArrowLeft aria-hidden className="size-3.5" />
          Back to beats
        </Link>
        <h1 className="mt-4 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
          Upload Beat
        </h1>
        <div aria-hidden className="hairline-dim mt-6" />
      </header>
      <BeatUploadForm />
    </div>
  );
}
