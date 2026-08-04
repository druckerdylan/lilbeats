"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

/* Same field recipe the marketing forms use — the base `Input` sets its fill
   through a `dark:` variant, which outranks a plain utility class. */
const FIELD = "input-cinema bg-ink/70! text-bone focus-visible:bg-ink!";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center px-5 py-20 pb-32">
      {/* One pool of key light behind the card, nothing more. */}
      <div
        aria-hidden
        // `max-w-full` rather than a vw cap: at 390px the 140vw cap still left
        // the glow 78px wider than the viewport, which gave the login page a
        // horizontal scrollbar. Bounding it to the container can't overflow.
        className="spotlight pointer-events-none absolute top-0 left-1/2 -z-10 size-[36rem] max-w-full -translate-x-1/2 -translate-y-1/3"
      />

      <Logo className="mb-10" />

      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm border border-bone/12 bg-charcoal p-6 sm:p-8"
      >
        <p className="u-meta text-smoke">Restricted</p>
        <h1 className="mt-2.5 font-display text-3xl leading-none tracking-[0.02em] text-bone uppercase">
          Admin Sign In
        </h1>
        <div aria-hidden className="hairline-dim mt-5 mb-6" />

        <div className="space-y-5">
          <div>
            <label htmlFor="admin-email" className="u-meta mb-2 block text-smoke">
              Email
            </label>
            <Input
              id="admin-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={FIELD}
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="u-meta mb-2 block text-smoke">
              Password
            </label>
            <Input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={FIELD}
            />
          </div>

          {error && (
            <p
              role="alert"
              className="border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <Button type="submit" variant="cinema" size="cinema" disabled={loading} className="w-full">
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      </form>
    </div>
  );
}
