import Link from "next/link";
import { Music, ShoppingBag, Sliders, Users, Plus, UploadCloud } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";

async function getStats() {
  if (!isSupabaseConfigured()) {
    return { beats: 0, orders: 0, revenue: 0, mixingRequests: 0, subscribers: 0, configured: false };
  }

  const supabase = createAdminClient();
  const [beats, orders, mixingRequests, subscribers] = await Promise.all([
    supabase.from("beats").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("amount_total"),
    supabase.from("mixing_requests").select("id", { count: "exact", head: true }),
    supabase.from("subscribers").select("id", { count: "exact", head: true }),
  ]);

  const revenue = (orders.data ?? []).reduce((sum, o) => sum + Number(o.amount_total), 0);

  return {
    beats: beats.count ?? 0,
    orders: orders.data?.length ?? 0,
    revenue,
    mixingRequests: mixingRequests.count ?? 0,
    subscribers: subscribers.count ?? 0,
    configured: true,
  };
}

export default async function AdminDashboardPage() {
  const stats = await getStats();

  /* Terse labels — at 390px the grid is two columns wide and a wrapped
     two-line label knocks the numbers out of alignment across the row. */
  const cards = [
    { label: "Beats", value: stats.beats, icon: Music },
    { label: "Orders", value: stats.orders, icon: ShoppingBag },
    { label: "Revenue", value: formatPrice(stats.revenue), icon: ShoppingBag },
    { label: "Mixing", value: stats.mixingRequests, icon: Sliders },
    { label: "Subscribers", value: stats.subscribers, icon: Users },
  ];

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-5">
          <div>
            <p className="u-meta text-smoke">Overview</p>
            <h1 className="mt-2.5 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
              Dashboard
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

      {!stats.configured && (
        <div className="mb-8 border border-ember/35 bg-ember/10 p-4 text-sm text-bone">
          <p className="u-meta mb-2 text-ember">Setup required</p>
          Supabase isn&rsquo;t configured yet — stats and beat uploads require it. See the README
          for setup instructions.
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="border border-bone/10 bg-charcoal p-4 sm:p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="u-meta text-smoke">{card.label}</p>
              <card.icon aria-hidden className="size-4 shrink-0 text-ember" />
            </div>
            <p className="mt-6 font-display text-3xl leading-none tracking-[0.01em] text-bone tabular-nums sm:text-4xl">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
