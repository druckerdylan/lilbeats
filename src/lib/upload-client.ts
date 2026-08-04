"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Browser-side uploader for beat assets.
 *
 * The bytes go straight from the admin's machine to Supabase Storage using
 * a signed URL minted by /api/admin/uploads/sign. Nothing large passes
 * through a Next route handler, which is what keeps this working on Vercel
 * — its Serverless Functions reject request bodies over 4.5 MB, and a
 * single WAV is routinely ten times that.
 *
 * Only the resulting storage paths are sent to /api/admin/beats afterwards.
 */

export type UploadBucket = "artwork" | "previews" | "files";

export interface UploadProgress {
  /** 0-1 across the whole batch for this beat. */
  fraction: number;
  label: string;
}

async function signUpload(bucket: UploadBucket, filename: string) {
  const res = await fetch("/api/admin/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bucket, filename }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Could not start upload.");
  return json as { path: string; token: string; bucket: string };
}

/** Uploads one file and resolves to the storage path to persist on the beat. */
export async function uploadToStorage(
  bucket: UploadBucket,
  file: File
): Promise<string> {
  const { path, token, bucket: realBucket } = await signUpload(bucket, file.name);
  const supabase = createClient();

  const { error } = await supabase.storage
    .from(realBucket)
    .uploadToSignedUrl(path, token, file, {
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(`Upload failed for ${file.name}: ${error.message}`);
  }
  return path;
}

export interface BeatAssetFiles {
  artwork: File;
  previewAudio: File;
  fullMp3: File;
  wav: File;
  stems?: File | null;
}

export interface BeatAssetPaths {
  artworkPath: string;
  previewAudioPath: string;
  fullMp3Path: string;
  wavPath: string;
  stemsPath: string | null;
}

/**
 * Uploads every asset for one beat, reporting coarse progress as each file
 * lands. Runs sequentially rather than in parallel: a producer uploading a
 * batch is usually on domestic upstream, and four concurrent multi-hundred-
 * megabyte PUTs make all of them crawl and time out together.
 */
export async function uploadBeatAssets(
  files: BeatAssetFiles,
  onProgress?: (progress: UploadProgress) => void
): Promise<BeatAssetPaths> {
  const steps: { key: keyof BeatAssetPaths; bucket: UploadBucket; file: File; label: string }[] = [
    { key: "artworkPath", bucket: "artwork", file: files.artwork, label: "Artwork" },
    { key: "previewAudioPath", bucket: "previews", file: files.previewAudio, label: "Preview MP3" },
    { key: "fullMp3Path", bucket: "files", file: files.fullMp3, label: "Full MP3" },
    { key: "wavPath", bucket: "files", file: files.wav, label: "WAV" },
  ];
  if (files.stems) {
    steps.push({ key: "stemsPath", bucket: "files", file: files.stems, label: "Stems" });
  }

  const paths: Partial<BeatAssetPaths> = { stemsPath: null };

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    onProgress?.({ fraction: i / steps.length, label: `Uploading ${step.label}…` });
    const path = await uploadToStorage(step.bucket, step.file);
    paths[step.key] = path;
  }

  onProgress?.({ fraction: 1, label: "Saving beat…" });
  return paths as BeatAssetPaths;
}
