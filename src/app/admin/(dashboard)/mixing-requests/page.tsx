import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { requireAdminUser } from "@/lib/admin-auth";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function AdminMixingRequestsPage() {
  /* Selects `*` from mixing_requests — names, emails, phone numbers and the
     paths of uploaded client files. Same reasoning as the orders page: the
     gate is re-checked here rather than inherited. */
  if (!(await requireAdminUser())) notFound();

  const configured = isSupabaseConfigured();
  const requests = configured
    ? (
        await createAdminClient()
          .from("mixing_requests")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  return (
    <div>
      <header className="mb-8">
        <p className="u-meta text-smoke">
          {configured ? `${requests.length} submitted` : "Inbound"}
        </p>
        <h1 className="mt-2.5 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
          Mixing Requests
        </h1>
        <div aria-hidden className="hairline-dim mt-6" />
      </header>

      {!configured ? (
        <div className="border border-ember/35 bg-ember/10 p-4 text-sm text-bone">
          <p className="u-meta mb-2 text-ember">Setup required</p>
          Supabase isn&rsquo;t configured yet — submitted requests are only emailed until it&rsquo;s
          connected.
        </div>
      ) : requests.length === 0 ? (
        <div className="border border-dashed border-bone/15 p-12 text-center">
          <p className="u-meta text-smoke">No requests yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <article
              key={request.id}
              className="border border-bone/10 bg-charcoal p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                <div className="min-w-0">
                  <h2 className="font-display text-2xl leading-none tracking-[0.02em] text-bone uppercase">
                    {request.song_title}
                  </h2>
                  {/* Three joined fields including an email — has to be able to
                      break mid-token at 390px. */}
                  <p className="mt-2 text-sm break-words text-smoke">
                    {request.artist_name} &middot; {request.full_name} &middot;{" "}
                    <span className="break-all">{request.email}</span>
                  </p>
                </div>
                <Badge variant="meta" className="border-bone/20 text-smoke">
                  {request.status}
                </Badge>
              </div>

              <div aria-hidden className="hairline-dim my-5" />

              <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-4">
                <div>
                  <dt className="u-meta text-smoke">Service</dt>
                  <dd className="mt-1.5 text-bone">{request.service_requested}</dd>
                </div>
                <div>
                  <dt className="u-meta text-smoke">Genre</dt>
                  <dd className="mt-1.5 text-bone">{request.genre}</dd>
                </div>
                <div>
                  <dt className="u-meta text-smoke">Songs</dt>
                  <dd className="mt-1.5 text-bone tabular-nums">{request.number_of_songs}</dd>
                </div>
                <div>
                  <dt className="u-meta text-smoke">Deadline</dt>
                  <dd className="mt-1.5 text-bone">{request.deadline || "—"}</dd>
                </div>
              </dl>

              {request.additional_notes && (
                <p className="mt-5 border-l border-ember/40 pl-4 text-sm break-words text-bone/90">
                  {request.additional_notes}
                </p>
              )}

              <p className="u-meta mt-5 text-smoke">
                Submitted {formatDate(request.created_at)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
