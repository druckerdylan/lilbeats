import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/layout/logo";
import { AdminNavList, AdminNavRail } from "@/components/admin/admin-nav";

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  /* Same form, rendered in whichever chrome is visible at this breakpoint. */
  const signOut = (
    <form action="/api/admin/logout" method="POST">
      <button
        type="submit"
        className="u-meta flex items-center gap-2.5 px-4 py-3.5 text-smoke transition-colors duration-200 hover:text-ember"
      >
        <LogOut aria-hidden className="size-4 shrink-0" />
        Sign out
      </button>
    </form>
  );

  return (
    /* 4.5rem is the public navbar this route group still renders beneath. */
    <div className="flex min-h-[calc(100svh-4.5rem)] flex-col bg-ink lg:flex-row">
      {/*
        Small-screen chrome. The sidebar is desktop-only, so without this the
        admin had no navigation at all below `lg` — you could reach a section
        but not leave it.
      */}
      <div className="sticky top-18 z-30 border-b border-bone/10 bg-charcoal lg:hidden">
        <div className="flex items-center justify-between gap-3 pl-4">
          <div className="flex items-baseline gap-3 py-3">
            <Logo className="text-xl" />
            <span className="u-meta text-smoke">Admin</span>
          </div>
          {signOut}
        </div>
        <AdminNavRail />
      </div>

      <aside className="hidden w-64 shrink-0 self-start border-r border-bone/10 bg-charcoal lg:sticky lg:top-18 lg:flex lg:h-[calc(100svh-4.5rem)] lg:flex-col">
        <div className="px-5 pt-7 pb-5">
          <Logo className="text-2xl" />
          <p className="u-meta mt-2.5 text-smoke">Admin</p>
        </div>
        <div aria-hidden className="hairline-dim shrink-0" />

        <div className="flex-1 overflow-y-auto py-4">
          <AdminNavList />
        </div>

        <div aria-hidden className="hairline-dim shrink-0" />
        <div className="py-2 pl-1">{signOut}</div>
      </aside>

      {/*
        `min-w-0` is load-bearing: as a flex child this would otherwise take
        its min-content width from the widest table inside it and push the
        whole page sideways instead of letting the table scroll itself.
        `pb-28` keeps the last row clear of the now-playing transport bar.
      */}
      <main className="min-w-0 flex-1 px-4 pt-8 pb-28 sm:px-8 sm:pt-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
