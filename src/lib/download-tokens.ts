import "server-only";
import { nanoid } from "nanoid";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/beats-repo";

const TOKEN_TTL_DAYS = 7;
const MAX_DOWNLOADS = 5;

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
