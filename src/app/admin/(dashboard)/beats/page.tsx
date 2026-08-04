import Link from "next/link";
import { Plus, UploadCloud } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import { DeleteBeatButton } from "@/components/admin/delete-beat-button";

export default async function AdminBeatsPage() {
  const configured = isSupabaseConfigured();
  const beats = configured
    ? (
        await createAdminClient()
          .from("beats")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div>
            <p className="u-meta text-smoke">
              {configured ? `${beats.length} in catalog` : "Catalog"}
            </p>
            <h1 className="mt-2.5 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
              Beats
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="cinemaGhost"
              size="cinemaSm"
              render={<Link href="/admin/beats/bulk" />}
            >
              <UploadCloud />
              Bulk Upload
            </Button>
            <Button variant="cinema" size="cinemaSm" render={<Link href="/admin/beats/new" />}>
              <Plus />
              Upload Beat
            </Button>
          </div>
        </div>
        <div aria-hidden className="hairline-dim mt-6" />
      </header>

      {!configured ? (
        <div className="border border-ember/35 bg-ember/10 p-4 text-sm text-bone">
          <p className="u-meta mb-2 text-ember">Setup required</p>
          Supabase isn&rsquo;t configured yet — connect it to manage beats here. The public store
          falls back to the sample catalog in the meantime.
        </div>
      ) : beats.length === 0 ? (
        <div className="border border-dashed border-bone/15 p-12 text-center">
          <p className="u-meta text-smoke">No beats uploaded yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-bone/10">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="u-meta border-b border-bone/12 bg-charcoal text-left text-smoke [&>th]:px-4 [&>th]:py-3.5 [&>th]:font-normal">
                <th scope="col">Title</th>
                <th scope="col">Genre</th>
                <th scope="col">BPM</th>
                <th scope="col">Price</th>
                <th scope="col">Status</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {beats.map((beat) => (
                <tr
                  key={beat.id}
                  className="border-b border-bone/10 transition-colors last:border-none hover:bg-bone/5 [&>td]:px-4 [&>td]:py-3"
                >
                  <td className="font-medium text-bone">{beat.title}</td>
                  <td className="text-smoke">{beat.genre}</td>
                  <td className="font-mono text-xs text-smoke tabular-nums">{beat.bpm}</td>
                  <td className="font-mono text-xs text-smoke tabular-nums">
                    {formatPrice(Number(beat.base_price))}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {beat.featured && <Badge variant="metaHot">Featured</Badge>}
                      <Badge
                        variant="meta"
                        className={
                          beat.published
                            ? "border-bone/25 text-bone"
                            : "border-destructive/50 text-destructive"
                        }
                      >
                        {beat.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </td>
                  <td className="text-right">
                    <DeleteBeatButton beatId={beat.id} beatTitle={beat.title} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
