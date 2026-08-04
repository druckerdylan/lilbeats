import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

/**
 * Service-role client — bypasses Row Level Security entirely. Only import
 * this from server-only code (API routes, server actions, admin pages
 * with an authenticated check already performed). Never expose
 * SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

export const STORAGE_BUCKETS = {
  artwork: "beat-artwork",
  previews: "beat-previews",
  files: "beat-files",
  mixingUploads: "mixing-uploads",
} as const;
