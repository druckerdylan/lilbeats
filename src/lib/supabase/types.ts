/**
 * Hand-authored Database types mirroring supabase/schema.sql.
 * If you later run `supabase gen types typescript`, you can replace this
 * file with the generated output — the shape below matches it closely.
 */
export interface Database {
  public: {
    Tables: {
      beats: {
        Row: {
          id: string;
          slug: string;
          title: string;
          artwork_path: string;
          preview_audio_path: string;
          full_mp3_path: string;
          wav_path: string;
          stems_path: string | null;
          /* Pre-built delivery archives — see supabase/schema.sql. */
          premium_bundle_path: string | null;
          complete_bundle_path: string | null;
          bpm: number;
          key: string;
          key_mode: string;
          genre: string;
          mood: string[];
          tags: string[];
          description: string;
          duration_seconds: number;
          base_price: number;
          plays: number;
          favorites: number;
          featured: boolean;
          is_new: boolean;
          license_availability: string[];
          published: boolean;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["beats"]["Row"]> & {
          slug: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["beats"]["Row"]>;
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          stripe_session_id: string;
          customer_email: string;
          customer_name: string | null;
          customer_address: string | null;
          amount_total: number;
          currency: string;
          status: "pending" | "paid" | "refunded";
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          stripe_session_id: string;
          customer_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          beat_id: string;
          beat_title: string;
          license_id: string;
          license_name: string;
          price: number;
        };
        Insert: Partial<Database["public"]["Tables"]["order_items"]["Row"]> & {
          order_id: string;
          beat_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["order_items"]["Row"]>;
        Relationships: [];
      };
      download_tokens: {
        Row: {
          id: string;
          token: string;
          order_id: string;
          order_item_id: string;
          beat_id: string;
          license_id: string;
          expires_at: string;
          download_count: number;
          max_downloads: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["download_tokens"]["Row"]> & {
          token: string;
          order_id: string;
          order_item_id: string;
          beat_id: string;
          license_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["download_tokens"]["Row"]>;
        Relationships: [];
      };
      mixing_requests: {
        Row: {
          id: string;
          artist_name: string;
          full_name: string;
          email: string;
          phone: string;
          song_title: string;
          genre: string;
          service_requested: string;
          number_of_songs: number;
          reference_tracks: string | null;
          desired_sound: string | null;
          current_mix_problems: string | null;
          deadline: string | null;
          budget: string | null;
          needs_vocal_tuning: boolean;
          needs_stem_cleanup: boolean;
          file_link: string | null;
          project_file_path: string | null;
          additional_notes: string | null;
          confirms_ownership: boolean;
          status: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mixing_requests"]["Row"]> & {
          artist_name: string;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["mixing_requests"]["Row"]>;
        Relationships: [];
      };
      subscribers: {
        Row: {
          id: string;
          email: string;
          source: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscribers"]["Row"]> & {
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscribers"]["Row"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          subject: string | null;
          message: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]> & {
          name: string;
          email: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
