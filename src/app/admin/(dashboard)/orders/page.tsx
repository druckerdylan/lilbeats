import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";
import { formatPrice } from "@/lib/format";
import { formatDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export default async function AdminOrdersPage() {
  const configured = isSupabaseConfigured();
  const orders = configured
    ? (
        await createAdminClient()
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
      ).data ?? []
    : [];

  return (
    <div>
      <header className="mb-8">
        <p className="u-meta text-smoke">
          {configured ? `${orders.length} recorded` : "Sales"}
        </p>
        <h1 className="mt-2.5 font-display text-4xl leading-none tracking-[0.02em] text-bone uppercase">
          Orders
        </h1>
        <div aria-hidden className="hairline-dim mt-6" />
      </header>

      {!configured ? (
        <div className="border border-ember/35 bg-ember/10 p-4 text-sm text-bone">
          <p className="u-meta mb-2 text-ember">Setup required</p>
          Supabase isn&rsquo;t configured yet — orders are recorded once Stripe webhooks can
          write to the database.
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-bone/15 p-12 text-center">
          <p className="u-meta text-smoke">No orders yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-bone/10">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="u-meta border-b border-bone/12 bg-charcoal text-left text-smoke [&>th]:px-4 [&>th]:py-3.5 [&>th]:font-normal">
                <th scope="col">Customer</th>
                <th scope="col">Amount</th>
                <th scope="col">Status</th>
                <th scope="col">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-bone/10 transition-colors last:border-none hover:bg-bone/5 [&>td]:px-4 [&>td]:py-3"
                >
                  <td>
                    <p className="font-medium text-bone">{order.customer_name || "—"}</p>
                    {/* Mono, but not `u-meta` — that would uppercase the address. */}
                    <p className="font-mono text-[11px] break-all text-smoke">
                      {order.customer_email}
                    </p>
                  </td>
                  <td className="font-mono text-xs text-bone tabular-nums">
                    {formatPrice(Number(order.amount_total))}
                  </td>
                  <td>
                    <Badge
                      variant="meta"
                      className={
                        order.status === "paid"
                          ? "border-ember/50 text-ember"
                          : "border-bone/20 text-smoke"
                      }
                    >
                      {order.status}
                    </Badge>
                  </td>
                  <td className="text-smoke">{formatDate(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
