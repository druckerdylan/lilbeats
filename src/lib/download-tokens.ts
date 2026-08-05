import "server-only";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";

/*
  30 days, not 7. These links are how a paying customer receives what they
  bought, and the receipt email is the only place they exist — a buyer who
  doesn't open their email for a week would otherwise have to ask for a
  re-issue. The licence agreement link deliberately never expires.
*/
const TOKEN_TTL_DAYS = 30;
const MAX_DOWNLOADS = 10;

export interface CreateTokenParams {
  orderId: string;
  orderItemId: string;
  beatId: string;
  licenseId: string;
}

export async function createDownloadToken(params: CreateTokenParams): Promise<string | null> {
  if (!isSupabaseConfigured()) {
    console.warn(
      "[download-tokens] Supabase is not configured — skipping persistent download token creation."
    );
    return null;
  }

  const supabase = createAdminClient();
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

  const { error } = await supabase.from("download_tokens").insert({
    token,
    order_id: params.orderId,
    order_item_id: params.orderItemId,
    beat_id: params.beatId,
    license_id: params.licenseId,
    expires_at: expiresAt,
    max_downloads: MAX_DOWNLOADS,
    download_count: 0,
  });

  if (error) {
    console.error("[download-tokens] failed to create token", error);
    return null;
  }

  return token;
}
